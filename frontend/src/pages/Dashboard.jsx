import { useState } from "react";
import Sidebar from "../components/Sidebar";
import RequestsTable from "../components/RequestTable";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [activeView, setActiveView] = useState("requests");
  const user=JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const renderContent = () => {
    switch (activeView) {
      case "requests":
        return (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6 mr-9">
              <h1 className="text-4xl font-bold">Requests</h1>
              {user?.role === "student" && (
                <button className="btn-primary"
                onClick={() => navigate("/NewRequest")}>
                  New Request
                </button>
              )}
            </div>
            <RequestsTable />
          </div>
        );

      case "home":
        return (
          <div className="p-8">
            <h1 className="text-4xl font-bold">Welcome</h1>
            <p className="mt-2 text-gray-600">
              Select an option from the sidebar.
            </p>
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
        <h1 className="text-4xl pt-8 pl-8">Welcome</h1>
        <h2 className="text-3xl font-extrabold pl-8"> {user?.name}</h2>

        <hr className="mx-4 mt-8 mb-4" />
        {renderContent()}
      </div>
    </div>
  );
}
