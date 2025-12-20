import { useState } from "react";

export default function NewRequestLetter() {
  const [to, setTo] = useState("principal");
  const [type, setType] = useState("");
  
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Card */}
      <div className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl p-8 transition-all">

        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-semibold">New Request Letter</h1>
          <p className="text-sm text-gray-500 mt-1">
            Draft your Letter
          </p>
        </div>

        <form className="space-y-4">

          {/* To */}
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

          {/* Type */}
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

          {/* CONDITIONAL: Leave Request Fields (WITH TRANSITION) */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out
              ${
                type === "Leave Request"
                  ? "max-h-[500px] opacity-100 translate-y-0"
                  : "max-h-0 opacity-0 -translate-y-2"
              }
            `}
          >
            <div className="space-y-4 mt-2">
              {/* Start Date */}
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5
                           focus:outline-none focus:ring-2 focus:ring-gray-400"
              />

              {/* End Date */}
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5
                           focus:outline-none focus:ring-2 focus:ring-gray-400"
              />

              {/* Documents */}
              <input
                type="file"
                className="w-full text-sm text-gray-500
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-lg file:border-0
                           file:bg-gray-100 file:text-gray-700
                           hover:file:bg-gray-200"
              />

              {/* Remarks */}
              <textarea
                placeholder="Remarks (optional)"
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5
                           focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-lg py-2.5 font-medium
                       bg-black text-white hover:opacity-90 transition"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}
