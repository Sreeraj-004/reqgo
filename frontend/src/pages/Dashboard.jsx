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
                  className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:opacity-80 transition"
                >
                  New Request
                </button>
              )}
            </div>

            {/* 🔥 EXACT SAME LOGIC AS YOUR ORIGINAL */}
            {user.role === "student" ? (
              <NormalRequestsTable />
            ) : (
              <>
                <div className="flex gap-6 border-b mb-6 text-sm font-medium">
                  <button
                    onClick={() => setRequestType("access")}
                    className={`pb-2 ${
                      requestType === "access"
                        ? "border-b-2 border-black text-black"
                        : "text-gray-400 hover:text-black"
                    }`}
                  >
                    Access
                  </button>

                  <button
                    onClick={() => setRequestType("normal")}
                    className={`pb-2 ${
                      requestType === "normal"
                        ? "border-b-2 border-black text-black"
                        : "text-gray-400 hover:text-black"
                    }`}
                  >
                    General
                  </button>
                </div>

                {requestType === "access" ? (
                  <RequestsTable />
                ) : (
                  <NormalRequestsTable />
                )}
              </>
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
    <div className="bg-black flex h-screen">
      <Sidebar setActiveView={setActiveView} />

      <div className="bg-white w-full m-6 rounded-md overflow-y-auto">
        <div className="flex justify-between items-start px-8 pt-8">
          <div>
            <h1 className="text-4xl">Welcome</h1>
            <h2 className="text-3xl font-extrabold">{user.name}</h2>
          </div>

          <button
            onClick={handleLogout}
            className="px-5 py-2 rounded-lg bg-black text-white text-sm font-medium hover:opacity-80 transition"
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
