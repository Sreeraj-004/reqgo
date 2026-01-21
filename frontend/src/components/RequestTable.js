import { useEffect, useState } from "react";

/* ================= TABLE ================= */

export default function RequestsTable() {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch("http://localhost:8000/access/pending", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
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

  const removeRequest = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="mt-6 pr-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-black text-white">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {requests.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-6 text-center text-gray-500">
                  No pending access requests 🎉
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <Row
                  key={req.id}
                  req={req}
                  token={token}
                  currentRole={currentUser?.role}
                  onDone={removeRequest}
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

function Row({ req, token, currentRole, onDone }) {
  const roleLabel = (() => {
    if (req.role === "vice_principal") return "Vice Principal";
    if (req.role === "hod")
      return `HOD – ${req.department_name || "Unknown Dept"}`;
    if (req.role === "student")
      return `Student – ${req.department_name || "Unknown Dept"}`;
    return req.role;
  })();

  // 🔐 ROLE AUTHORITY MATRIX
  const canApprove = () => {
    if (currentRole === "principal") return true;
    if (currentRole === "vice_principal" && req.role !== "vice_principal")
      return true;
    if (currentRole === "hod" && req.role === "student")
      return true;
    return false;
  };


  const allowed = canApprove();

  const handleAccept = async () => {
    if (!allowed) return;

    try {
      const res = await fetch(
        `http://localhost:8000/access/approve/${req.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Approve failed");
      onDone(req.id);
    } catch (err) {
      alert("Failed to approve request");
      console.error(err);
    }
  };

  const handleReject = async () => {
    if (!allowed) return;

    try {
      const res = await fetch(
        `http://localhost:8000/access/reject/${req.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Reject failed");
      onDone(req.id);
    } catch (err) {
      alert("Failed to reject request");
      console.error(err);
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-6 py-4 font-medium text-gray-900">
        {req.name}
      </td>

      <td className="px-6 py-4 text-gray-600">
        {req.email}
      </td>

      <td className="px-6 py-4 text-gray-700">
        {roleLabel}
      </td>

      <td className="px-6 py-4 flex gap-3">
        <button
          onClick={handleAccept}
          disabled={!allowed}
          className={`px-3 py-1 text-xs rounded text-white
            ${allowed ? "bg-black hover:opacity-90" : "bg-gray-300 cursor-not-allowed"}
          `}
        >
          Accept
        </button>

        <button
          onClick={handleReject}
          disabled={!allowed}
          className={`px-3 py-1 text-xs rounded text-white
            ${allowed ? "bg-red-600 hover:opacity-90" : "bg-gray-300 cursor-not-allowed"}
          `}
        >
          Reject
        </button>
      </td>
    </tr>
  );
}
