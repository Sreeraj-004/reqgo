import { useState } from "react";

export default function StudentRegister() {
  const [step, setStep] = useState("verify"); // verify | request
  const [showModal, setShowModal] = useState(false);
  const [collegeInput, setCollegeInput] = useState("");
  const [departmentInput, setDepartmentInput] = useState("");

  const handleVerify = () => {
    // TEMP: assume college exists
    setStep("request");
  };

  const handleSendRequest = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!collegeInput || !departmentInput) return;

  try {
    const res = await fetch("http://localhost:8000/access/student", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: user.id,
        college_name: collegeInput,
        department_name: departmentInput,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Request failed");
    }

    setShowModal(true);
  } catch (err) {
    console.error("Student request failed:", err.message);
    alert("Failed to send request");
  }
};


  return (
    <>
      {/* Main Card */}
      <div className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl p-8">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold">Student Access</h1>
          <p className="text-sm text-gray-500 mt-1">
            Request permission to join your college
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4">

          {/* College Name */}
          <input
            type="text"
            placeholder="College name"
            value={collegeInput}
            onChange={(e) => setCollegeInput(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5
                      focus:outline-none focus:ring-2 focus:ring-gray-400"
          />

          {/* Department */}
          <input
            type="text"
            placeholder="Department"
            value={departmentInput}
            onChange={(e) => setDepartmentInput(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5
                      focus:outline-none focus:ring-2 focus:ring-gray-400"
          />

          {/* Action Button */}
          {step === "verify" ? (
            <button
              type="button"
              onClick={handleVerify}
              className="w-full rounded-lg py-2.5 font-medium
                         bg-black text-white
                         hover:opacity-90 transition"
            >
              Verify
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSendRequest}
              className="w-full rounded-lg py-2.5 font-medium
                         bg-black text-white
                         hover:opacity-90 transition"
            >
              Send Request
            </button>
          )}
        </form>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />

          {/* Modal Card */}
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            
            <h2 className="text-lg font-semibold mb-3 text-center">
              Request Sent
            </h2>

            <p className="text-sm text-gray-600 text-center leading-relaxed">
              Your request has been sent to the Principal.
              <br />
              You will be permitted once the Principal approves the request.
              <br />
              Please check back after approval.
            </p>

            <p className="text-sm text-gray-500 text-center mt-4">
              For queries, contact:
              <br />
              <span className="font-medium text-black">
                principal@example.com
              </span>
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full rounded-lg py-2.5 font-medium
                         bg-black text-white hover:opacity-90 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
