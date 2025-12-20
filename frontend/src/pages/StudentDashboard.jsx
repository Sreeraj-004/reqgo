import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NewRequest() {
  const navigate = useNavigate();

  const [to, setTo] = useState("principal");
  const [type, setType] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const recipients = [
    { id: "principal", label: "Principal" },
    { id: "vice-principal", label: "Vice Principal" },
    { id: "hod", label: "HOD" },
  ];

  const requestTypes = [
    "Leave Request",
    "Bonafide Certificate",
    "Fee Extension",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);

      // Navigate back after confirmation
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold">New Request Letter</h1>
          <p className="text-sm text-gray-500 mt-1">
            Submit your request officially
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>

          {/* TO */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2 text-center">
              Send To
            </p>

            <div className="grid grid-cols-3 gap-2">
              {recipients.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setTo(r.id)}
                  className={`
                    rounded-lg border px-3 py-2 text-sm font-medium transition
                    ${
                      to === r.id
                        ? "border-black bg-black text-white"
                        : "border-gray-300 text-gray-700 hover:border-gray-500"
                    }
                  `}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* TYPE */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5
                       focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="">Select request type</option>
            {requestTypes.map((t, i) => (
              <option key={i} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* CONDITIONAL: LEAVE REQUEST */}
          {type === "Leave Request" && (
            <>
              <input
                type="date"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5
                           focus:outline-none focus:ring-2 focus:ring-gray-400"
              />

              <input
                type="date"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5
                           focus:outline-none focus:ring-2 focus:ring-gray-400"
              />

              <input
                type="file"
                className="w-full text-sm text-gray-500
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-lg file:border-0
                           file:bg-gray-100 file:text-gray-700
                           hover:file:bg-gray-200"
              />

              <textarea
                placeholder="Remarks (optional)"
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5
                           focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
              />
            </>
          )}

          {/* SUCCESS MESSAGE */}
          {success && (
            <p className="text-green-600 text-center text-sm font-medium">
              ✅ Request sent successfully
            </p>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading || success}
            className={`w-full rounded-lg py-2.5 font-medium transition
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:opacity-90"
              }
            `}
          >
            {loading ? "Sending..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
