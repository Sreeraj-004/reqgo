import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NormalRequestsTable() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch("http://localhost:8000/requests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load requests", err);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className="mt-6 pr-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-black text-white">
              <th className="px-6 py-3">Sender</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Subject</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading && (
              <tr>
                <td colSpan="5" className="px-6 py-6 text-center text-gray-500">
                  Loading requests...
                </td>
              </tr>
            )}

            {!loading && requests.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-6 text-center text-gray-500">
                  No requests
                </td>
              </tr>
            )}

            {!loading &&
              requests.map((req) => (
                <tr key={`${req.type}-${req.id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{req.sender}</td>
                  <td className="px-6 py-4">{req.type}</td>
                  <td className="px-6 py-4">{req.subject}</td>
                  <td className="px-6 py-4">
                    {new Date(req.created_at).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(req.view_url)}
                      className="
                        px-4 py-1.5
                        rounded-md
                        bg-black text-white
                        text-xs
                        hover:opacity-90
                        transition
                      "
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
