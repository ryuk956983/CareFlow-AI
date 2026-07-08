import { useEffect, useState, useCallback } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import Overview from "../components/Overview.jsx";
import StockMonitoring from "../components/StockMonitoring.jsx";
import PatientFootfall from "../components/PatientFootfall.jsx";
import BedAvailability from "../components/BedAvailability.jsx";
import DoctorAttendance from "../components/DoctorAttendance.jsx";
import RedistributionFlags from "../components/RedistributionFlags.jsx";
import EnterEditData from "../components/EnterEditData.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [activeTab, setActiveTab] = useState("overview");
  const [facilities, setFacilities] = useState([]);
  const [activeFacilityId, setActiveFacilityId] = useState(isAdmin ? "" : user?.facility?._id || "");
  const [loading, setLoading] = useState(true);

  const loadFacilities = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get("/facilities");
    setFacilities(data);
    if (!isAdmin && data[0]) setActiveFacilityId(data[0]._id);
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  const activeFacility = facilities.find((f) => f._id === activeFacilityId) || null;

  const needsFacilitySelection = !activeFacilityId && ["stock", "footfall", "beds", "doctors", "edit"].includes(activeTab);

  return (
    <div className="min-h-screen">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        facilities={facilities}
        activeFacilityId={activeFacilityId}
        setActiveFacilityId={setActiveFacilityId}
      />

      <div className="p-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading district data...</div>
        ) : needsFacilitySelection ? (
          <FacilityPicker facilities={facilities} onPick={setActiveFacilityId} />
        ) : (
          <>
            {activeTab === "overview" && (
              <Overview facilities={facilities} activeFacility={activeFacility} isAdmin={isAdmin} onSelectFacility={setActiveFacilityId} />
            )}
            {activeTab === "stock" && <StockMonitoring facility={activeFacility} onChanged={loadFacilities} />}
            {activeTab === "footfall" && <PatientFootfall facility={activeFacility} />}
            {activeTab === "beds" && <BedAvailability facility={activeFacility} onChanged={loadFacilities} />}
            {activeTab === "doctors" && <DoctorAttendance facility={activeFacility} onChanged={loadFacilities} />}
            {activeTab === "redistribution" && <RedistributionFlags isAdmin={isAdmin} />}
            {activeTab === "edit" && <EnterEditData facility={activeFacility} facilities={facilities} isAdmin={isAdmin} onChanged={loadFacilities} onSelectFacility={setActiveFacilityId} />}
          </>
        )}
      </div>
    </div>
  );
}

function FacilityPicker({ facilities, onPick }) {
  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-1">Pick a facility</h2>
      <p className="text-sm text-gray-500 mb-4">This view needs one facility selected. Choose one below or use the dropdown in the top bar.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {facilities.map((f) => (
          <button
            key={f._id}
            onClick={() => onPick(f._id)}
            className="text-left border border-gray-200 rounded-lg p-4 hover:border-forest-700 hover:bg-forest-950/5 transition-colors"
          >
            <div className="font-semibold text-gray-800">{f.name}</div>
            <div className="text-xs text-gray-500">{f.type} · {f.block}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
