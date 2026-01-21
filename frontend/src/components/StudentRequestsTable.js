import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentRequestsTable() {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/leaves/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          setRequests([]);
          return;
        }
        setRequests(data);
      })
      .catch(() => setRequests([]));
  }, [token]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";

    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
    };


  return (
    <div className="mt-6 pr-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-black text-white">
              <th className="px-6 py-3">Request Type</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">View</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {requests.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-6 text-center text-gray-500"
                >
                  No requests submitted
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    {req.subject}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {formatDate(req.created_at)}
                  </td>

                  <td className="px-6 py-4 capitalize">
                    <span
                      className="
                        inline-flex px-3 py-1 rounded-full text-xs font-medium
                        bg-yellow-50 text-yellow-700
                      "
                    >
                      {req.overall_status.replace("_", " ")}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <button
                        className="px-4 py-1.5 rounded-md bg-black text-white text-xs hover:opacity-80 transition"
                        onClick={() => navigate(`/requests/${req.id}`)} 
                        >
                        View
                    </button>

                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
