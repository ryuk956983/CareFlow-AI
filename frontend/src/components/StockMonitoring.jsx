import { useState } from "react";
import api from "../api/axios.js";

function medStatus(med) {
  if (med.stockOnHand <= med.reorderLevel * 0.5) return "Critical";
  if (med.stockOnHand <= med.reorderLevel) return "Low";
  return "Adequate";
}
const badgeClass = { Critical: "badge-critical", Low: "badge-low", Adequate: "badge-adequate" };

export default function StockMonitoring({ facility, onChanged }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [form, setForm] = useState({ name: "", unit: "units", stockOnHand: "", reorderLevel: "", avgDailyConsumption: "" });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!facility) return <div className="card">Select a facility to view its stock ledger.</div>;

  const medicines = facility.medicines.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const status = medStatus(m);
    const matchesFilter = filter === "ALL" || status.toUpperCase() === filter;
    return matchesSearch && matchesFilter;
  });

  const critical = facility.medicines.filter((m) => medStatus(m) === "Critical").length;
  const low = facility.medicines.filter((m) => medStatus(m) === "Low").length;
  const totalVolume = facility.medicines.reduce((s, m) => s + m.stockOnHand, 0);

  async function submitForm(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      unit: form.unit,
      stockOnHand: Number(form.stockOnHand) || 0,
      reorderLevel: Number(form.reorderLevel) || 0,
      avgDailyConsumption: Number(form.avgDailyConsumption) || 0,
    };
    try {
      if (editingId) {
        await api.put(`/facilities/${facility._id}/medicines/${editingId}`, payload);
      } else {
        await api.post(`/facilities/${facility._id}/medicines`, payload);
      }
      setForm({ name: "", unit: "units", stockOnHand: "", reorderLevel: "", avgDailyConsumption: "" });
      setEditingId(null);
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  function editRow(m) {
    setEditingId(m._id);
    setForm({ name: m.name, unit: m.unit, stockOnHand: m.stockOnHand, reorderLevel: m.reorderLevel, avgDailyConsumption: m.avgDailyConsumption });
  }

  async function deleteRow(id) {
    if (!confirm("Remove this medicine from the ledger?")) return;
    await api.delete(`/facilities/${facility._id}/medicines/${id}`);
    onChanged();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="card">
          <h2 className="text-lg font-bold text-gray-800">Medicine Stock Ledger</h2>
          <p className="text-sm text-gray-500">Create, view, update, and manage medical inventory for {facility.name}. Changes instantly recompute alert status.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card !p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase">Total SKUs</p>
            <p className="text-2xl font-bold">{facility.medicines.length}</p>
          </div>
          <div className="card !p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase">Critical</p>
            <p className="text-2xl font-bold text-red-600">{critical}</p>
          </div>
          <div className="card !p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase">Low</p>
            <p className="text-2xl font-bold text-amber-500">{low}</p>
          </div>
          <div className="card !p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase">Total volume</p>
            <p className="text-2xl font-bold">{totalVolume}</p>
          </div>
        </div>

        <div className="card">
          <div className="flex flex-wrap gap-3 mb-4">
            <input className="input flex-1 min-w-[180px]" placeholder="Search medicine..." value={search} onChange={(e) => setSearch(e.target.value)} />
            {["ALL", "CRITICAL", "LOW", "ADEQUATE"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold ${filter === f ? "bg-forest-900 text-white" : "bg-gray-100 text-gray-600"}`}
              >
                {f}
              </button>
            ))}
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
                <th className="pb-2">Medicine</th>
                <th className="pb-2">Stock on hand</th>
                <th className="pb-2">Reorder level</th>
                <th className="pb-2">Avg daily use</th>
                <th className="pb-2">Status</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((m) => (
                <tr key={m._id} className="border-b border-gray-50">
                  <td className="py-3 font-medium text-gray-800">
                    {m.name}
                    <div className="text-xs text-gray-400 font-normal">unit: {m.unit}</div>
                  </td>
                  <td>{m.stockOnHand}</td>
                  <td>{m.reorderLevel}</td>
                  <td>{m.avgDailyConsumption}</td>
                  <td>
                    <span className={`badge ${badgeClass[medStatus(m)]}`}>{medStatus(m)}</span>
                  </td>
                  <td className="text-right space-x-1">
                    <button onClick={() => editRow(m)} className="text-gray-500 hover:text-forest-800 p-2">✏️</button>
                    <button onClick={() => deleteRow(m._id)} className="btn-danger">🗑</button>
                  </td>
                </tr>
              ))}
              {medicines.length === 0 && (
                <tr><td colSpan={6} className="text-center text-gray-400 py-6">No medicines match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card h-fit">
        <h3 className="font-bold text-gray-800 mb-1">{editingId ? "Edit medical resource" : "Provision new medical resource"}</h3>
        <p className="text-xs text-gray-400 mb-4">Adds or updates a line in {facility.name}'s directory.</p>
        <form onSubmit={submitForm} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">MEDICINE NAME</label>
            <input required className="input" placeholder="e.g. Atropine Sulphate Injection" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">UNIT</label>
            <input className="input" placeholder="e.g. tablets, bottles, ampoules" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">STOCK ON HAND</label>
            <input required type="number" className="input" value={form.stockOnHand} onChange={(e) => setForm({ ...form, stockOnHand: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">REORDER LEVEL</label>
              <input required type="number" className="input" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">AVG DAILY USE</label>
              <input required type="number" className="input" value={form.avgDailyConsumption} onChange={(e) => setForm({ ...form, avgDailyConsumption: e.target.value })} />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving..." : editingId ? "Update item" : "Add item"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm({ name: "", unit: "units", stockOnHand: "", reorderLevel: "", avgDailyConsumption: "" }); }} className="text-xs text-gray-400 underline w-full text-center">
              Cancel edit
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
