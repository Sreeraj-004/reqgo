import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import RequestsTable from "../components/RequestTable";
import EditCollegeDetails from "../components/EditCollegeDetails";
import NormalRequestsTable from "../components/NormalRequestsTable";
import StudentRequestsTable from "../components/StudentRequestsTable";
import useNotifications from "../hooks/useNotifications";

export default function Dashboard() {
  const [activeView, setActiveView] = useState("requests");
  const [requestType, setRequestType] = useState("access");

  const navigate = useNavigate();

  // ✅ SAFE user parsing (no crash)
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  // ✅ Notifications (no behavior change)
  useNotifications(user);

  // ✅ Stable logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("Role");
    navigate("/login");
  }, [navigate]);

  // ✅ Redirect if user missing
  if (!user) {
    navigate("/login");
    return null;
  }

  const renderContent = () => {
    switch (activeView) {
      case "requests":
        return (
          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold">Requests</h1>

              {user.role === "student" && (
                <button
                  onClick={() => navigate("/NewRequest")}
                  className="px-4 py-2 rounded-lg bg-primary-gradient text-gray-900 text-sm font-medium hover:opacity-90 transition"

                >
                  New Request
                </button>
              )}
            </div>

            {user.role === "admin" ? (
              <RequestsTable /> // Access only
            ) : (
              <NormalRequestsTable /> // General only
            )}

          </div>
        );

      case "editCollege":
        return (
          <div className="p-8 flex justify-center">
            <EditCollegeDetails />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex h-screen">

      <Sidebar setActiveView={setActiveView} />

      <div className="bg-white w-full m-6 rounded-xl overflow-y-auto shadow-xl">

        <div className="flex justify-between items-start px-8 pt-8">
          <div>
            <h1 className="text-4xl">Welcome {user.name}</h1>
            <hr className="mt-2"></hr>
            <h3 className="text-lg mt-2">{user.role} Dashboard</h3>
          </div>

          <button
            onClick={handleLogout}
            className="px-5 py-2 rounded-lg bg-primary-gradient text-black text-sm font-medium hover:opacity-80 transition"
          >
            Logout
          </button>
        </div>

        <hr className="mx-4 mt-8 mb-4" />
        {renderContent()}
      </div>
    </div>
  );
}
