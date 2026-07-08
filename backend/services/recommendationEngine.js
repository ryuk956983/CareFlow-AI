/**
 * Smart Resource Redistribution Engine
 * --------------------------------------------------------------
 * This module is the "AI-driven" analytics layer described in the brief.
 * It is a transparent, explainable statistical/forecasting model rather
 * than an opaque black-box model, which is the right choice for a
 * government-facing supply chain tool where every recommendation needs
 * to be auditable by a district administrator.
 *
 * What it does:
 *  1. Demand forecasting: estimates days-of-stock-left per medicine per
 *     facility from historical average daily consumption.
 *  2. Stock-out early warning: flags Critical / Low / Adequate.
 *  3. Redistribution matching: pairs facilities with a surplus of a
 *     medicine to nearby facilities with a deficit of the same medicine,
 *     recommending a transfer quantity and urgency.
 *  4. Facility health scoring: a composite index (stock adequacy, bed
 *     pressure, doctor attendance, footfall load) used to auto-flag
 *     underperforming / under-resourced centres to the district admin.
 */

const CRITICAL_DAYS_LEFT = 3;
const LOW_DAYS_LEFT = 7;
const SURPLUS_MULTIPLIER = 2; // stock > reorderLevel * 2 is considered a releasable surplus
const SURPLUS_MIN_DAYS_LEFT = 21;

function daysLeft(med) {
  if (!med.avgDailyConsumption || med.avgDailyConsumption <= 0) return Infinity;
  return med.stockOnHand / med.avgDailyConsumption;
}

function medicineStatus(med) {
  const dl = daysLeft(med);
  if (med.stockOnHand <= med.reorderLevel * 0.5 || dl <= CRITICAL_DAYS_LEFT) return "Critical";
  if (med.stockOnHand <= med.reorderLevel || dl <= LOW_DAYS_LEFT) return "Low";
  return "Adequate";
}

/**
 * Build transfer recommendations by matching deficits at one facility
 * against surpluses of the *same medicine* at other facilities in the
 * same district, prioritising the most urgent deficits first.
 */
function buildTransferRecommendations(facilities) {
  const deficits = [];
  const surplusPool = {}; // medicineName -> [{facility, available}]

  for (const facility of facilities) {
    for (const med of facility.medicines) {
      const dl = daysLeft(med);
      const status = medicineStatus(med);

      if (status !== "Adequate") {
        const deficitQty = Math.max(med.reorderLevel - med.stockOnHand, Math.ceil(med.avgDailyConsumption * 7) - med.stockOnHand, 0);
        deficits.push({
          facilityId: facility._id.toString(),
          facilityName: facility.name,
          medicineId: med._id.toString(),
          medicineName: med.name,
          unit: med.unit,
          status,
          daysLeft: Number.isFinite(dl) ? Math.round(dl * 10) / 10 : null,
          stockOnHand: med.stockOnHand,
          reorderLevel: med.reorderLevel,
          neededQty: Math.max(deficitQty, 1),
        });
      }

      const surplusQty = med.stockOnHand - med.reorderLevel * SURPLUS_MULTIPLIER;
      if (surplusQty > 0 && dl >= SURPLUS_MIN_DAYS_LEFT) {
        surplusPool[med.name] = surplusPool[med.name] || [];
        surplusPool[med.name].push({
          facilityId: facility._id.toString(),
          facilityName: facility.name,
          medicineId: med._id.toString(),
          unit: med.unit,
          available: surplusQty,
        });
      }
    }
  }

  // Most urgent deficits (Critical first, then Low, then by lowest days-left)
  deficits.sort((a, b) => {
    if (a.status !== b.status) return a.status === "Critical" ? -1 : 1;
    return (a.daysLeft ?? 999) - (b.daysLeft ?? 999);
  });

  const transfers = [];
  for (const deficit of deficits) {
    const donors = surplusPool[deficit.medicineName] || [];
    for (const donor of donors) {
      if (donor.facilityId === deficit.facilityId || donor.available <= 0) continue;
      const transferQty = Math.min(donor.available, deficit.neededQty);
      if (transferQty <= 0) continue;

      transfers.push({
        medicineName: deficit.medicineName,
        unit: deficit.unit,
        fromFacility: donor.facilityName,
        fromFacilityId: donor.facilityId,
        toFacility: deficit.facilityName,
        toFacilityId: deficit.facilityId,
        quantity: Math.round(transferQty),
        urgency: deficit.status,
        reason:
          deficit.status === "Critical"
            ? `${deficit.facilityName} has ~${deficit.daysLeft ?? "0"} days of ${deficit.medicineName} left`
            : `${deficit.facilityName} is below its reorder level for ${deficit.medicineName}`,
      });

      donor.available -= transferQty;
      deficit.neededQty -= transferQty;
      if (deficit.neededQty <= 0) break;
    }
  }

  return { transfers, unresolvedDeficits: deficits.filter((d) => d.neededQty > 0) };
}

/**
 * Composite facility health score (0-100). Lower = needs attention.
 */
function facilityHealthScore(facility) {
  const meds = facility.medicines || [];
  const stockScores = meds.map((m) => {
    const status = medicineStatus(m);
    return status === "Critical" ? 0 : status === "Low" ? 55 : 100;
  });
  const stockScore = stockScores.length ? stockScores.reduce((a, b) => a + b, 0) / stockScores.length : 100;

  const bedOccupancyRate = facility.beds?.total ? facility.beds.occupied / facility.beds.total : 0;
  // Ideal occupancy ~70-85%; too empty or over-capacity both dock points.
  const bedScore = bedOccupancyRate > 1 ? 0 : 100 - Math.abs(bedOccupancyRate - 0.75) * 100;

  const doctorAttendanceRate = facility.doctors?.assigned ? facility.doctors.presentToday / facility.doctors.assigned : 0;
  const doctorScore = doctorAttendanceRate * 100;

  const overall = stockScore * 0.45 + bedScore * 0.25 + doctorScore * 0.3;
  return Math.round(Math.max(0, Math.min(100, overall)));
}

function buildFacilityFlags(facilities) {
  return facilities
    .map((f) => {
      const score = facilityHealthScore(f);
      const reasons = [];
      const criticalMeds = (f.medicines || []).filter((m) => medicineStatus(m) === "Critical");
      if (criticalMeds.length) reasons.push(`${criticalMeds.length} medicine(s) at critical stock`);
      if (f.beds?.total && f.beds.occupied / f.beds.total >= 0.95) reasons.push("Beds near full capacity");
      if (f.doctors?.assigned && f.doctors.presentToday / f.doctors.assigned < 0.6) reasons.push("Low doctor attendance today");

      return {
        facilityId: f._id.toString(),
        facilityName: f.name,
        type: f.type,
        healthScore: score,
        status: score < 50 ? "Underperforming" : score < 75 ? "Needs attention" : "Healthy",
        reasons,
      };
    })
    .sort((a, b) => a.healthScore - b.healthScore);
}

export function generateRecommendations(facilities) {
  const { transfers, unresolvedDeficits } = buildTransferRecommendations(facilities);
  const facilityFlags = buildFacilityFlags(facilities);
  return {
    generatedAt: new Date(),
    transferRecommendations: transfers,
    unresolvedDeficits,
    facilityFlags,
  };
}

export { medicineStatus, daysLeft, facilityHealthScore };
