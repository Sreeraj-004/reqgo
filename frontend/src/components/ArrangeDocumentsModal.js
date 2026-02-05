import { useState } from "react";

export default function ArrangeDocumentsModal({
  open,
  onClose,
  studentName,
  certificateRequestId,
}) {
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [location, setLocation] = useState("front_desk");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleNotify = async () => {
    if (!pickupDate || !pickupTime) return;

    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8000/certificate-delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          certificate_request_id: certificateRequestId,
          pickup_date: pickupDate,
          pickup_time: pickupTime,
          pickup_location: location,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to arrange delivery");
      }

      alert("Student notified successfully");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-center mb-4">
          Arrange Document Pickup
        </h2>

        <p className="text-sm text-gray-600 text-center mb-6">
          Notify{" "}
          <span className="font-medium text-black">{studentName}</span>
        </p>

        <div className="space-y-4">
          {/* DATE */}
          <input
            type="date"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            className="
              w-full rounded-lg border px-4 py-2.5
              bg-white
              focus:outline-none
              focus:ring-2
              focus:ring-yellow-400
            "
          />

          {/* TIME */}
          <input
            type="time"
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            className="
              w-full rounded-lg border px-4 py-2.5
              bg-white
              focus:outline-none
              focus:ring-2
              focus:ring-yellow-400
            "
          />

          {/* LOCATION */}
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="
              w-full rounded-lg border px-4 py-2.5
              bg-white
              focus:outline-none
              focus:ring-2
              focus:ring-yellow-400
            "
          >
            <option value="front_desk">Front Desk</option>
            <option value="reception">Reception</option>
          </select>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          {/* ACTION */}
          <button
            onClick={handleNotify}
            disabled={!pickupDate || !pickupTime || loading}
            className="w-full rounded-lg py-2.5 bg-primary-gradient text-black disabled:opacity-40"
          >
            {loading ? "Notifying..." : "Notify Student"}
          </button>
        </div>
      </div>
    </div>
  );
}
