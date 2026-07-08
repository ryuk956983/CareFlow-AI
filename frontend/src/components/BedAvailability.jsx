import { useState } from "react";
import api from "../api/axios.js";

export default function BedAvailability({ facility, onChanged }) {
  const [beds, setBeds] = useState(facility ? { ...facility.beds } : { total: 0, occupied: 0 });
  const [saving, setSaving] = useState(false);

  if (!facility) return <div className="card">Select a facility to view bed availability.</div>;

  const occupancyRate = beds.total ? Math.round((beds.occupied / beds.total) * 100) : 0;
  const barColor = occupancyRate >= 95 ? "bg-red-500" : occupancyRate >= 80 ? "bg-amber-500" : "bg-emerald-600";

  async function save() {
    setSaving(true);
    try {
      await api.put(`/facilities/${facility._id}`, { ...facility, beds });
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 card">
        <h2 className="font-semibold text-gray-800 mb-1">Bed availability — {facility.name}</h2>
        <p className="text-sm text-gray-500 mb-6">{beds.occupied} of {beds.total} beds occupied</p>

        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div className={`h-full ${barColor}`} style={{ width: `${Math.min(occupancyRate, 100)}%` }} />
        </div>
        <p className="text-sm font-semibold text-gray-700">{occupancyRate}% occupancy</p>

        {occupancyRate >= 95 && (
          <div className="mt-4 bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">
            ⚠ Beds are near full capacity. Consider flagging to the district admin for patient redirection.
          </div>
        )}
      </div>

      <div className="card h-fit">
        <h3 className="font-bold text-gray-800 mb-4">Update bed counts</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">TOTAL BEDS</label>
            <input type="number" className="input" value={beds.total} onChange={(e) => setBeds({ ...beds, total: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">BEDS OCCUPIED</label>
            <input type="number" className="input" value={beds.occupied} onChange={(e) => setBeds({ ...beds, occupied: Number(e.target.value) })} />
          </div>
          <button onClick={save} disabled={saving} className="btn-primary w-full">
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
