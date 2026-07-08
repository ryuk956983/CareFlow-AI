import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function EnterEditData({ facility, facilities, isAdmin, onChanged, onSelectFacility }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [newFacility, setNewFacility] = useState({ name: "", type: "PHC", district: "Kanpur Dehat", block: "" });
  const [loginForm, setLoginForm] = useState({ username: "", password: "", name: "" });
  const [loginSaving, setLoginSaving] = useState(false);
  const [loginMsg, setLoginMsg] = useState("");

  useEffect(() => {
    if (facility) {
      setForm({
        name: facility.name,
        type: facility.type,
        district: facility.district,
        block: facility.block,
        beds: { ...facility.beds },
        doctors: { ...facility.doctors },
      });
    }
  }, [facility?._id]);

  if (!facility || !form) {
    return (
      <div className="card">
        <p className="text-gray-500 mb-4">Select a facility to enter or edit its data.</p>
        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {facilities.map((f) => (
              <button key={f._id} onClick={() => onSelectFacility(f._id)} className="text-left border border-gray-200 rounded-lg p-4 hover:border-forest-700">
                <div className="font-semibold text-gray-800">{f.name}</div>
                <div className="text-xs text-gray-500">{f.type} · {f.block}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  async function save() {
    setSaving(true);
    setSavedMsg("");
    try {
      await api.put(`/facilities/${facility._id}`, form);
      setSavedMsg("Saved successfully.");
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  async function createFacility(e) {
    e.preventDefault();
    const { data } = await api.post("/facilities", { ...newFacility, beds: { total: 0, occupied: 0 }, doctors: { assigned: 0, presentToday: 0 }, medicines: [] });
    setNewFacility({ name: "", type: "PHC", district: "Kanpur Dehat", block: "" });
    onChanged();
    onSelectFacility(data._id);
  }

  async function createLogin(e) {
    e.preventDefault();
    setLoginSaving(true);
    setLoginMsg("");
    try {
      await api.post("/auth/register", { ...loginForm, facilityId: facility._id });
      setLoginMsg(`Login created: username "${loginForm.username}". Share the password with the facility staff now — it won't be shown again here.`);
      setLoginForm({ username: "", password: "", name: "" });
    } catch (err) {
      setLoginMsg(err.response?.data?.message || "Could not create login.");
    } finally {
      setLoginSaving(false);
    }
  }

  async function deleteFacility() {
    if (!confirm(`Delete ${facility.name}? This cannot be undone.`)) return;
    await api.delete(`/facilities/${facility._id}`);
    onSelectFacility("");
    onChanged();
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-bold text-gray-800">Enter or edit facility data</h2>
            <p className="text-sm text-gray-500">Changes save when you click "Save changes" below, and update every other tab immediately.</p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <select className="input !w-auto" value={facility._id} onChange={(e) => onSelectFacility(e.target.value)}>
                {facilities.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
              </select>
              <button onClick={deleteFacility} className="btn-danger border border-red-200">Delete this facility</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">FACILITY NAME</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">TYPE</label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option>PHC</option>
              <option>CHC</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">DISTRICT</label>
            <input className="input" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">BLOCK</label>
            <input className="input" value={form.block} onChange={(e) => setForm({ ...form, block: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">TOTAL BEDS</label>
            <input type="number" className="input" value={form.beds.total} onChange={(e) => setForm({ ...form, beds: { ...form.beds, total: Number(e.target.value) } })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">BEDS OCCUPIED</label>
            <input type="number" className="input" value={form.beds.occupied} onChange={(e) => setForm({ ...form, beds: { ...form.beds, occupied: Number(e.target.value) } })} />
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">Doctor counts (assigned/present) are managed automatically from the Doctor attendance tab.</p>

        <div className="flex items-center gap-3 mt-5">
          <button onClick={save} disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save changes"}</button>
          {savedMsg && <span className="text-sm text-emerald-600">{savedMsg}</span>}
        </div>
      </div>

      {isAdmin && (
        <form onSubmit={createLogin} className="card">
          <h3 className="font-bold text-gray-800 mb-1">Create a login for {facility.name}</h3>
          <p className="text-xs text-gray-400 mb-4">Gives this facility's staff their own username/password, scoped to only their data.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">STAFF NAME</label>
              <input required className="input" value={loginForm.name} onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })} placeholder="e.g. Ghatampur CHC Staff" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">USERNAME</label>
              <input required className="input" value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} placeholder="e.g. ghatampur.chc" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">PASSWORD</label>
              <input required type="text" className="input" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="Set a temporary password" />
            </div>
            <button type="submit" disabled={loginSaving} className="btn-primary">{loginSaving ? "Creating..." : "Create login"}</button>
          </div>
          {loginMsg && <p className="text-sm text-emerald-700 mt-3">{loginMsg}</p>}
        </form>
      )}

      {isAdmin && (
        <form onSubmit={createFacility} className="card">
          <h3 className="font-bold text-gray-800 mb-1">Add a new PHC / CHC</h3>
          <p className="text-xs text-gray-400 mb-4">Registers a new facility in the district directory. Once created, select it above and use "Create a login" to give it staff access.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">NAME</label>
              <input required className="input" value={newFacility.name} onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">TYPE</label>
              <select className="input" value={newFacility.type} onChange={(e) => setNewFacility({ ...newFacility, type: e.target.value })}>
                <option>PHC</option>
                <option>CHC</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">BLOCK</label>
              <input className="input" value={newFacility.block} onChange={(e) => setNewFacility({ ...newFacility, block: e.target.value })} />
            </div>
            <button type="submit" className="btn-primary">Add facility</button>
          </div>
        </form>
      )}
    </div>
  );
}
