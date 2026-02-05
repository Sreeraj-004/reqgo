import { useEffect, useState } from "react";

export default function SuperintendentRegister() {
  const [showModal, setShowModal] = useState(false);

  const [collegeInput, setCollegeInput] = useState("");
  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);

  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------
     Load colleges
  --------------------------------------------- */
  useEffect(() => {
    fetch("http://localhost:8000/colleges/")
      .then((res) => res.json())
      .then((data) => setColleges(data))
      .catch(() => console.error("Failed to load colleges"));
  }, []);

  /* ---------------------------------------------
     College autocomplete
  --------------------------------------------- */
  const handleInputChange = (e) => {
    const value = e.target.value;
    setCollegeInput(value);
    setSelectedCollege(null);

    if (!value.trim()) {
      setFilteredColleges([]);
      return;
    }

    const matches = colleges.filter((c) =>
      c.name.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredColleges(matches);
  };

  const handleSelectCollege = (college) => {
    setCollegeInput(college.name);
    setSelectedCollege(college);
    setFilteredColleges([]);
  };

  /* ---------------------------------------------
     Send access request (NO signature)
  --------------------------------------------- */
  const handleSendRequest = async () => {
    if (!selectedCollege) return;

    setLoading(true);

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        "http://localhost:8000/access/superintendent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            college_name: selectedCollege.name,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Request failed");
      }

      setShowModal(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* MAIN CARD */}
      <div className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold">
            Superintendent Access
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Request permission to join your college
          </p>
        </div>

        <form className="space-y-4 relative">
          {/* COLLEGE INPUT */}
          <input
            type="text"
            placeholder="College name"
            value={collegeInput}
            onChange={handleInputChange}
            className="w-full rounded-lg border px-4 py-2.5"
          />

          {/* AUTOCOMPLETE */}
          {filteredColleges.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-lg shadow-md max-h-40 overflow-y-auto">
              {filteredColleges.map((college) => (
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

          {/* SEND BUTTON */}
          <button
            type="button"
            onClick={handleSendRequest}
            disabled={!selectedCollege || loading}
            className="w-full rounded-lg py-2.5 bg-primary-gradient text-black disabled:opacity-40"
          >
            {loading ? "Sending..." : "Send Request"}
          </button>
        </form>
      </div>

      {/* SUCCESS MODAL */}
      {showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    
    {/* BACKDROP */}
    <div
      className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={() => setShowModal(false)}
    />

    {/* MODAL */}
    <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
      <h2 className="text-lg font-semibold mb-3 text-center">
        Request Sent
      </h2>

      <p className="text-sm text-gray-600 text-center">
        Your request has been sent to the Principal.
      </p>

      <p className="text-sm text-gray-500 text-center mt-4">
        <span className="font-medium text-black">
          {selectedCollege?.principal_name}
        </span>
        <br />
        <span className="text-gray-600 text-sm">
          {selectedCollege?.principal_email}
        </span>
      </p>

      <button
        onClick={() => setShowModal(false)}
        className="mt-6 w-full rounded-lg py-2.5 bg-primary-gradient text-black"
      >
        Close
      </button>
    </div>
  </div>
)}

    </>
  );
}
