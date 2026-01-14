import { useEffect, useState } from "react";

export default function VicePrincipalRegister() {
  const [showModal, setShowModal] = useState(false);

  const [collegeInput, setCollegeInput] = useState("");
  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);

  // 🔥 Fetch colleges
  useEffect(() => {
    fetch("http://localhost:8000/colleges/")
      .then(res => res.json())
      .then(data => setColleges(data))
      .catch(() => console.error("Failed to load colleges"));
  }, []);

  // 🔍 Filter while typing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setCollegeInput(value);
    setSelectedCollege(null);

    if (!value.trim()) {
      setFilteredColleges([]);
      return;
    }

    const matches = colleges.filter(c =>
      c.name.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredColleges(matches);
  };

  const handleSelectCollege = (college) => {
    setCollegeInput(college.name);
    setSelectedCollege(college);
    setFilteredColleges([]);
  };

  const handleSendRequest = async () => {
  if (!selectedCollege) return;

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("http://localhost:8000/access/vice-principal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: user.id,
        college_name: selectedCollege.name,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Request failed");
    }

    setShowModal(true);
  } catch (err) {
    console.error("Access request failed:", err.message);
    alert("Failed to send request");
  }
};


  return (
    <>
      {/* Main Card */}
      <div className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold">Vice Principal Access</h1>
          <p className="text-sm text-gray-500 mt-1">
            Request permission to join your college
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4 relative">

          {/* College Input */}
          <input
            type="text"
            placeholder="College name"
            value={collegeInput}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5
                       focus:outline-none focus:ring-2 focus:ring-gray-400"
          />

          {/* Suggestions */}
          {filteredColleges.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-lg shadow-md max-h-40 overflow-y-auto">
              {filteredColleges.map(college => (
                <div
                  key={college.id}
                  onClick={() => handleSelectCollege(college)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {college.name}
                </div>
              ))}
            </div>
          )}

          {/* SEND REQUEST */}
          <button
            type="button"
            onClick={handleSendRequest}
            disabled={!selectedCollege}
            className="w-full rounded-lg py-2.5 font-medium
                       bg-black text-white
                       hover:opacity-90 transition
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send Request
          </button>
        </form>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />

          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-3 text-center">
              Request Sent
            </h2>

            <p className="text-sm text-gray-600 text-center leading-relaxed">
              Your request has been sent to the Principal.
              <br />
              You’ll get access once approved.
            </p>

            <p className="text-sm text-gray-500 text-center mt-4">
              For queries, contact:
              <br />
              <span className="font-medium text-black">
                <p className="text-sm text-gray-500 text-center mt-4">
                  <span className="font-medium text-black">
                    {selectedCollege?.principal_name}
                  </span>
                  <br />
                  <span className="text-gray-600 text-sm">
                    {selectedCollege?.principal_email}
                  </span>
                </p>
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
