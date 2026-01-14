import { useState } from "react";
import Sidebar from "../components/Sidebar";
import RequestsTable from "../components/RequestTable";
import EditCollegeDetails from "../components/EditCollegeDetails";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [activeView, setActiveView] = useState("requests");
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
            <div className="flex justify-between items-center mb-6 mr-9">
              <h1 className="text-4xl font-bold">Requests</h1>
              {user?.role === "student" && (
                <button
                  className="btn-primary"
                  onClick={() => navigate("/NewRequest")}
                >
                  New Request
                </button>
              )}
            </div>
            <RequestsTable />
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
            <h2 className="text-3xl font-extrabold">
              {user?.name}
            </h2>
          </div>

          <button
            onClick={handleLogout}
            className="
              px-5 py-2
              rounded-lg
              bg-black text-white
              text-sm font-medium
              hover:opacity-80
              transition
            "
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
