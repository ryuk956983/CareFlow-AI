import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import api from "../api/axios.js";

export default function PatientFootfall({ facility }) {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ patientCount: "", dailyCapacity: "" });
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!facility) return;
    setLoading(true);
    const { data } = await api.get(`/facilities/${facility._id}/footfall?limit=30`);
    setLogs(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facility?._id]);

  if (!facility) return <div className="card">Select a facility to view patient footfall.</div>;

  const chartData = logs.map((l) => ({
    date: new Date(l.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    Patients: l.patientCount,
    Capacity: l.dailyCapacity,
  }));

  const avg = logs.length ? Math.round(logs.reduce((s, l) => s + l.patientCount, 0) / logs.length) : 0;
  const latest = logs[logs.length - 1];

  async function submit(e) {
    e.preventDefault();
    await api.post(`/facilities/${facility._id}/footfall`, {
      patientCount: Number(form.patientCount),
      dailyCapacity: Number(form.dailyCapacity),
    });
    setForm({ patientCount: "", dailyCapacity: "" });
    load();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="card">
            <p className="text-xs font-semibold text-gray-400 uppercase">Today's footfall</p>
            <p className="text-3xl font-bold">{latest?.patientCount ?? "—"}</p>
          </div>
          <div className="card">
            <p className="text-xs font-semibold text-gray-400 uppercase">14-day average</p>
            <p className="text-3xl font-bold">{avg}</p>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Footfall trend vs daily capacity</h2>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : chartData.length === 0 ? (
            <p className="text-sm text-gray-400">No footfall data logged yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="Patients" stroke="#1a6b52" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Capacity" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card h-fit">
        <h3 className="font-bold text-gray-800 mb-1">Log today's footfall</h3>
        <p className="text-xs text-gray-400 mb-4">Records a new entry for {facility.name}.</p>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">PATIENTS SEEN</label>
            <input required type="number" className="input" value={form.patientCount} onChange={(e) => setForm({ ...form, patientCount: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">DAILY CAPACITY</label>
            <input required type="number" className="input" value={form.dailyCapacity} onChange={(e) => setForm({ ...form, dailyCapacity: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary w-full">Save entry</button>
        </form>
      </div>
    </div>
  );
}
