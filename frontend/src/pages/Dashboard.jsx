import { useState } from "react";
import Sidebar from "../components/Sidebar";
import RequestsTable from "../components/RequestTable";
import EditCollegeDetails from "../components/EditCollegeDetails";
import NormalRequestsTable from "../components/NormalRequestsTable";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [activeView, setActiveView] = useState("requests");
  const [requestType, setRequestType] = useState("access"); // access | normal
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("Role");
    navigate("/login");
  };

  const renderContent = () => {
    switch (activeView) {
      case "requests":
        return (
          <div className="p-8">
            {/* Heading */}
            <h1 className="text-4xl font-bold mb-4">Requests</h1>

            {/* Light Toggle Tabs */}
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

            {/* Tables */}
            {requestType === "access" ? (
              <RequestsTable />
            ) : (
              <NormalRequestsTable />
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
      {/* Sidebar */}
      <Sidebar setActiveView={setActiveView} />

      {/* Main Content */}
      <div className="bg-white w-full m-6 rounded-md overflow-y-auto">
        <div className="flex justify-between items-start px-8 pt-8">
          <div>
            <h1 className="text-4xl">Welcome</h1>
            <h2 className="text-3xl font-extrabold">{user?.name}</h2>
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
