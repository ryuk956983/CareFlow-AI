import { useEffect, useState } from "react";
import api from "../api/axios.js";

const statusColor = {
  Underperforming: "bg-red-100 text-red-600",
  "Needs attention": "bg-amber-100 text-amber-600",
  Healthy: "bg-emerald-100 text-emerald-700",
};
const urgencyColor = { Critical: "badge-critical", Low: "badge-low" };

export default function RedistributionFlags({ isAdmin }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await api.get("/recommendations");
    setData(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="card">Analyzing stock levels, bed pressure and attendance across the district...</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="font-bold text-gray-800 mb-1">AI-driven redistribution recommendations</h2>
        <p className="text-sm text-gray-500">
          {isAdmin
            ? "A forecasting model estimates days-of-stock-left per medicine, matches facilities with a surplus to nearby facilities facing shortage, and suggests transfer quantities."
            : "Recommendations relevant to your facility, generated from district-wide stock and demand patterns."}
        </p>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Suggested transfers</h3>
        {data.transferRecommendations.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No redistribution needed right now — stock levels are balanced.</p>
        ) : (
          <div className="space-y-3">
            {data.transferRecommendations.map((t, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-800">
                    Move {t.quantity} {t.unit} of {t.medicineName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t.fromFacility} → {t.toFacility}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{t.reason}</p>
                </div>
                <span className={`badge ${urgencyColor[t.urgency] || "badge-low"}`}>{t.urgency}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {data.unresolvedDeficits?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-2">Unresolved shortages (no surplus available nearby)</h3>
          <div className="space-y-2">
            {data.unresolvedDeficits.map((d, i) => (
              <div key={i} className="flex justify-between text-sm border-b border-gray-50 pb-2">
                <span>{d.facilityName} — {d.medicineName}</span>
                <span className="text-red-600 font-medium">Needs {Math.round(d.neededQty)} {d.unit} — consider central procurement</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Facility health flags</h3>
        <div className="space-y-3">
          {data.facilityFlags.map((f) => (
            <div key={f.facilityId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{f.facilityName} <span className="text-xs text-gray-400 font-normal">({f.type})</span></p>
                  {f.reasons.length > 0 && <p className="text-xs text-gray-500 mt-1">{f.reasons.join(" · ")}</p>}
                </div>
                <div className="text-right">
                  <span className={`badge ${statusColor[f.status]}`}>{f.status}</span>
                  <p className="text-xs text-gray-400 mt-1">Health score: {f.healthScore}/100</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
