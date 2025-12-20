import Sidebar from "../components/Sidebar";
import RequestsTable from "../components/RequestTable";

export default function Dashboard() {
  
  return (
    <div className="bg-black flex h-screen">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="bg-white p-2 w-full mt-6 mb-6 mr-6 rounded-md">

        <h1 className="text-4xl pt-8 pl-8">Welcome</h1>
        <h2 className="text-3xl font-extrabold pl-8">Principal</h2>

        <hr className="mx-4 mt-8 mb-4" />

        {/* Requests Section */}
        <div className="pl-8 pt-2">
          <button className="text-2xl">Requests</button>
          <RequestsTable />
        </div>

      </div>
    </div>
  );
}
