import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function DoctorAttendance({ facility, onChanged }) {
  const [doctors, setDoctors] = useState([]);
  const [shiftFilter, setShiftFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", doctorId: "", department: "", shift: "Morning" });
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!facility) return;
    setLoading(true);
    const { data } = await api.get(`/facilities/${facility._id}/doctors`);
    setDoctors(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facility?._id]);

  if (!facility) return <div className="card">Select a facility to view its shift planner.</div>;

  const filtered = doctors.filter((d) => {
    const matchesShift = shiftFilter === "ALL" || d.shift.toUpperCase() === shiftFilter;
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.doctorId.toLowerCase().includes(search.toLowerCase());
    return matchesShift && matchesSearch;
  });

  const present = doctors.filter((d) => d.present).length;

  async function toggle(doctor) {
    await api.put(`/facilities/${facility._id}/doctors/${doctor._id}`, { present: !doctor.present });
    load();
    onChanged();
  }

  async function addDoctor(e) {
    e.preventDefault();
    await api.post(`/facilities/${facility._id}/doctors`, form);
    setForm({ name: "", doctorId: "", department: "", shift: "Morning" });
    setShowForm(false);
    load();
    onChanged();
  }

  async function remove(id) {
    if (!confirm("Remove this doctor from the roster?")) return;
    await api.delete(`/facilities/${facility._id}/doctors/${id}`);
    load();
    onChanged();
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-gray-800">Physician Attendance & Shift Planner</h2>
          <p className="text-sm text-gray-500">Check doctors in and out, audit the daily roster, for {facility.name}.</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary">+ Provision doctor</button>
      </div>

      {showForm && (
        <form onSubmit={addDoctor} className="card grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">NAME</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">DOCTOR ID</label>
            <input required className="input" value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">DEPARTMENT</label>
            <input className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">SHIFT</label>
            <select className="input" value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })}>
              <option>Morning</option>
              <option>Evening</option>
              <option>Night</option>
            </select>
          </div>
          <button type="submit" className="btn-primary md:col-span-4">Add doctor</button>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card !p-4"><p className="text-xs text-gray-400 font-semibold uppercase">Total roster</p><p className="text-2xl font-bold">{doctors.length}</p></div>
        <div className="card !p-4"><p className="text-xs text-gray-400 font-semibold uppercase">Present</p><p className="text-2xl font-bold text-emerald-600">{present}</p></div>
        <div className="card !p-4"><p className="text-xs text-gray-400 font-semibold uppercase">Absent</p><p className="text-2xl font-bold text-amber-500">{doctors.length - present}</p></div>
        <div className="card !p-4"><p className="text-xs text-gray-400 font-semibold uppercase">Attendance</p><p className="text-2xl font-bold">{doctors.length ? Math.round((present / doctors.length) * 100) : 0}%</p></div>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-3 mb-4">
          <input className="input flex-1 min-w-[200px]" placeholder="Search doctor name or ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {["ALL", "MORNING", "EVENING", "NIGHT"].map((s) => (
            <button key={s} onClick={() => setShiftFilter(s)} className={`px-3 py-2 rounded-lg text-xs font-semibold ${shiftFilter === s ? "bg-forest-900 text-white" : "bg-gray-100 text-gray-600"}`}>
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-gray-400 text-center py-6">Loading roster...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No doctor profiles registered or matching active filters.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((d) => (
              <div key={d._id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{d.name}</p>
                  <p className="text-xs text-gray-500">{d.doctorId} · {d.department} · {d.shift} shift</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggle(d)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full ${d.present ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {d.present ? "On duty" : "Mark present"}
                  </button>
                  <button onClick={() => remove(d._id)} className="btn-danger">🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
