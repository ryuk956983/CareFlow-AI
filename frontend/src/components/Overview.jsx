function medStatus(med) {
  if (med.stockOnHand <= med.reorderLevel * 0.5) return "Critical";
  if (med.stockOnHand <= med.reorderLevel) return "Low";
  return "Adequate";
}

function StatCard({ label, value, sub }) {
  return (
    <div className="card">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function Overview({ facilities, activeFacility, isAdmin, onSelectFacility }) {
  if (isAdmin && !activeFacility) {
    const totalCritical = facilities.reduce(
      (sum, f) => sum + f.medicines.filter((m) => medStatus(m) === "Critical").length,
      0
    );
    const totalBeds = facilities.reduce((s, f) => s + (f.beds?.total || 0), 0);
    const occupiedBeds = facilities.reduce((s, f) => s + (f.beds?.occupied || 0), 0);
    const totalDoctors = facilities.reduce((s, f) => s + (f.doctors?.assigned || 0), 0);
    const presentDoctors = facilities.reduce((s, f) => s + (f.doctors?.presentToday || 0), 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Facilities" value={facilities.length} sub="PHC + CHC in district" />
          <StatCard label="Critical stock alerts" value={totalCritical} sub="across all facilities" />
          <StatCard label="Bed occupancy" value={totalBeds ? `${Math.round((occupiedBeds / totalBeds) * 100)}%` : "—"} sub={`${occupiedBeds}/${totalBeds} beds`} />
          <StatCard label="Doctor attendance" value={totalDoctors ? `${Math.round((presentDoctors / totalDoctors) * 100)}%` : "—"} sub={`${presentDoctors}/${totalDoctors} present`} />
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">All facilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {facilities.map((f) => {
              const critical = f.medicines.filter((m) => medStatus(m) === "Critical").length;
              return (
                <button
                  key={f._id}
                  onClick={() => onSelectFacility(f._id)}
                  className="text-left border border-gray-200 rounded-lg p-4 hover:border-forest-700 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-gray-800">{f.name}</div>
                      <div className="text-xs text-gray-500">{f.type} · {f.block}</div>
                    </div>
                    {critical > 0 && <span className="badge badge-critical">{critical} critical</span>}
                  </div>
                  <div className="text-xs text-gray-500 mt-3 flex gap-4">
                    <span>🛏 {f.beds?.occupied}/{f.beds?.total}</span>
                    <span>🩺 {f.doctors?.presentToday}/{f.doctors?.assigned}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const f = activeFacility;
  if (!f) return <div className="card">No facility data yet.</div>;
  const critical = f.medicines.filter((m) => medStatus(m) === "Critical");
  const low = f.medicines.filter((m) => medStatus(m) === "Low");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Bed occupancy" value={`${f.beds?.occupied}/${f.beds?.total}`} sub={f.beds?.total ? `${Math.round((f.beds.occupied / f.beds.total) * 100)}% full` : ""} />
        <StatCard label="Doctors present" value={`${f.doctors?.presentToday}/${f.doctors?.assigned}`} />
        <StatCard label="Critical stock" value={critical.length} />
        <StatCard label="Low stock" value={low.length} />
      </div>

      {(critical.length > 0 || low.length > 0) && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-3">Attention needed</h2>
          <div className="space-y-2">
            {critical.map((m) => (
              <div key={m._id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                <span>{m.name}</span>
                <span className="badge badge-critical">Critical · {m.stockOnHand} {m.unit} left</span>
              </div>
            ))}
            {low.map((m) => (
              <div key={m._id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                <span>{m.name}</span>
                <span className="badge badge-low">Low · {m.stockOnHand} {m.unit} left</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
