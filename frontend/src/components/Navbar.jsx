import { useAuth } from "../context/AuthContext.jsx";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "stock", label: "Stock monitoring" },
  { key: "footfall", label: "Patient footfall" },
  { key: "beds", label: "Bed availability" },
  { key: "doctors", label: "Doctor attendance" },
  { key: "redistribution", label: "Redistribution & flags" },
  { key: "edit", label: "Enter / edit data" },
];

export default function Navbar({ activeTab, setActiveTab, facilities, activeFacilityId, setActiveFacilityId }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const activeFacility = facilities?.find((f) => f._id === activeFacilityId);

  return (
    <div className="bg-white sticky top-0 z-10 shadow-sm">
      <div className="bg-forest-900 text-white px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-forest-700 flex items-center overflow-hidden justify-center"><img className='w-full h-full' src="/logo.jpg" alt="CareFlow AI"/></div>
          <div>
            <h1 className="font-bold leading-tight">CareFlow AI</h1>
            <p className="text-forest-600 text-xs">
              {isAdmin ? "District health centre & supply chain command" : activeFacility?.name || ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && facilities?.length > 0 && (
            <select
              className="bg-forest-800 text-white text-sm rounded-lg px-3 py-2 border border-forest-700 focus:outline-none"
              value={activeFacilityId || ""}
              onChange={(e) => setActiveFacilityId(e.target.value)}
            >
              <option value="">All facilities</option>
              {facilities.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name}
                </option>
              ))}
            </select>
          )}
          <span className="bg-forest-800 text-sm rounded-full px-3 py-1.5">
            📍 {activeFacility?.district || "Kanpur Dehat"} district
          </span>
          <button onClick={logout} className="text-sm bg-forest-800 hover:bg-forest-700 rounded-lg px-3 py-1.5">
            Logout ({user?.name})
          </button>
        </div>
      </div>

      <div className="px-6 flex gap-1 overflow-x-auto border-b border-gray-100">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === t.key
                ? "border-forest-700 text-forest-900"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
