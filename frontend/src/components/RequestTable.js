import { useEffect, useState } from "react";

/* ================= TABLE ================= */

export default function RequestsTable() {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:8000/access/pending", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();

        // 🛡️ Safety check
        if (!Array.isArray(data)) {
          console.error("Expected array, got:", data);
          setRequests([]);
          return;
        }

        setRequests(data);
      })
      .catch((err) => {
        console.error("Failed to load access requests", err);
        setRequests([]);
      });
  }, [token]);

  return (
    <div className="mt-6 pr-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-black text-white">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Department</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {requests.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-6 text-center text-gray-500">
                  No pending access requests 
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <Row
                  key={req.id}
                  name={req.name}
                  role={req.role}
                  department={req.department || "-"}
                  email={req.email}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= ROW ================= */

function Row({ name, role, department, email }) {
  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-6 py-4 font-medium text-gray-900">{name}</td>

      <td className="px-6 py-4 capitalize">
        {role.replace("_", " ")}
      </td>

      <td className="px-6 py-4 text-gray-600">{department}</td>

      <td className="px-6 py-4 text-gray-600">{email}</td>

      <td className="px-6 py-4">
        <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ring-1 bg-yellow-50 text-yellow-700 ring-yellow-600/20">
          Pending
        </span>
      </td>

      {/* UI-only buttons */}
      <td className="px-6 py-4 flex gap-2">
        <button
          className="px-3 py-1 text-xs rounded bg-green-600 text-white opacity-40 cursor-not-allowed"
          title="Backend not wired yet"
        >
          Approve
        </button>

        <button
          className="px-3 py-1 text-xs rounded bg-red-600 text-white opacity-40 cursor-not-allowed"
          title="Backend not wired yet"
        >
          Reject
        </button>
      </td>
    </tr>
  );
}
