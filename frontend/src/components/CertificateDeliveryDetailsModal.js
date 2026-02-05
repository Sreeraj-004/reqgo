import { useEffect, useState } from "react";

export default function CertificateDeliveryDetailsModal({
  open,
  onClose,
  certificateRequestId,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [delivery, setDelivery] = useState(null);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));


  

  const handleCollected = async () => {
  try {
    const res = await fetch(
      `http://localhost:8000/certificate-delivery/${certificateRequestId}/collected`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to mark as collected");
    }

    alert("Certificate marked as collected");
    onClose();
    window.location.reload();
  } catch (err) {
    alert(err.message);
  }
};


  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setError("");

    fetch(
      `http://localhost:8000/certificate-delivery/${certificateRequestId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Failed to load delivery details");
        }
        return res.json();
      })
      .then((data) => setDelivery(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open, certificateRequestId, token]);

  if (!open) return null;

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
          Certificate Delivery Details
        </h2>

        {loading && (
          <p className="text-center text-sm text-gray-500">
            Loading details…
          </p>
        )}

        {error && (
          <p className="text-center text-sm text-red-600">{error}</p>
        )}

        {delivery && (
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-medium text-gray-700">Student:</span>{" "}
              {delivery.student_name}
            </p>

            <div>
              <p className="font-medium text-gray-700 mb-1">
                Certificates:
              </p>
              <ul className="list-disc ml-5 space-y-0.5">
                {delivery.certificates.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            <p>
              <span className="font-medium text-gray-700">Pickup Date:</span>{" "}
              {new Date(delivery.pickup_date).toLocaleDateString("en-GB")}
            </p>

            <p>
              <span className="font-medium text-gray-700">Pickup Time:</span>{" "}
              {delivery.pickup_time}
            </p>

            <p>
              <span className="font-medium text-gray-700">Location:</span>{" "}
              {delivery.pickup_location.replace("_", " ").toUpperCase()}
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
        

        {/* PRIMARY: COLLECTED (SUPERINTENDENT ONLY) */}
        {user?.role === "superintendent" && (
            <button
            onClick={handleCollected}
            className="
                w-full rounded-lg py-2.5
                bg-primary-gradient text-black
                hover:opacity-90
            "
            >
            Certificate Collected
            </button>
        )}

        {/* SECONDARY: CLOSE */}
        <button
            onClick={onClose}
            className="
            w-full rounded-lg py-2.5
            bg-white text-black
            border border-black
            hover:bg-gray-100
            "
        >
            Close
        </button>
        </div>

      </div>
    </div>
  );
}
