import express from "express";
import DoctorProfile from "../models/DoctorProfile.js";
import Facility from "../models/Facility.js";
import { requireAuth, scopeToOwnFacility } from "../middleware/auth.js";

const router = express.Router({ mergeParams: true });

async function syncFacilityDoctorCounts(facilityId) {
  const doctors = await DoctorProfile.find({ facility: facilityId });
  const assigned = doctors.length;
  const presentToday = doctors.filter((d) => d.present).length;
  await Facility.findByIdAndUpdate(facilityId, { $set: { "doctors.assigned": assigned, "doctors.presentToday": presentToday } });
}

// GET /api/facilities/:facilityId/doctors
router.get("/", requireAuth, scopeToOwnFacility, async (req, res) => {
  const doctors = await DoctorProfile.find({ facility: req.params.facilityId }).sort({ name: 1 });
  res.json(doctors);
});

// POST /api/facilities/:facilityId/doctors
router.post("/", requireAuth, scopeToOwnFacility, async (req, res) => {
  const doctor = await DoctorProfile.create({ ...req.body, facility: req.params.facilityId });
  await syncFacilityDoctorCounts(req.params.facilityId);
  res.status(201).json(doctor);
});

// PUT /api/facilities/:facilityId/doctors/:doctorId  (e.g. toggle present/absent)
router.put("/:doctorId", requireAuth, scopeToOwnFacility, async (req, res) => {
  const update = { ...req.body };
  if (update.present === true) update.lastCheckIn = new Date();
  const doctor = await DoctorProfile.findOneAndUpdate(
    { _id: req.params.doctorId, facility: req.params.facilityId },
    { $set: update },
    { new: true }
  );
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });
  await syncFacilityDoctorCounts(req.params.facilityId);
  res.json(doctor);
});

// DELETE /api/facilities/:facilityId/doctors/:doctorId
router.delete("/:doctorId", requireAuth, scopeToOwnFacility, async (req, res) => {
  await DoctorProfile.findOneAndDelete({ _id: req.params.doctorId, facility: req.params.facilityId });
  await syncFacilityDoctorCounts(req.params.facilityId);
  res.json({ message: "Doctor removed" });
});

export default router;
