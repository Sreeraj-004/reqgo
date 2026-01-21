import { useEffect, useState } from "react";

export default function StudentRegister() {
  const [showModal, setShowModal] = useState(false);

  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [collegeInput, setCollegeInput] = useState("");
  const [selectedCollege, setSelectedCollege] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [departmentInput, setDepartmentInput] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  /* 🔥 Fetch colleges */
  useEffect(() => {
    fetch("http://localhost:8000/colleges/")
      .then(res => res.json())
      .then(data => setColleges(data))
      .catch(() => console.error("Failed to load colleges"));
  }, []);

  /* 🔍 College autocomplete */
  const handleCollegeChange = (e) => {
    const value = e.target.value;
    setCollegeInput(value);
    setSelectedCollege(null);

    setDepartmentInput("");
    setSelectedDepartment(null);
    setDepartments([]);
    setFilteredDepartments([]);

    if (!value.trim()) {
      setFilteredColleges([]);
      return;
    }

    setFilteredColleges(
      colleges.filter(c =>
        c.name.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const selectCollege = (college) => {
    setCollegeInput(college.name);
    setSelectedCollege(college);
    setFilteredColleges([]);

    const deptList = college.departments
      ? college.departments.split(",").map(d => d.trim())
      : [];

    setDepartments(deptList);
  };

  /* 🔍 Department autocomplete */
  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    setDepartmentInput(value);
    setSelectedDepartment(null);

    if (!value.trim()) {
      setFilteredDepartments([]);
      return;
    }

    setFilteredDepartments(
      departments.filter(d =>
        d.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const selectDepartment = (dept) => {
    setDepartmentInput(dept);
    setSelectedDepartment(dept);
    setFilteredDepartments([]);
  };

  /* 🚀 Send request */
  const handleSendRequest = async () => {
    if (!selectedCollege || !selectedDepartment) return;

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8000/access/student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          college_name: selectedCollege.name,
          department_name: selectedDepartment,
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

        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold">Student Access</h1>
          <p className="text-sm text-gray-500 mt-1">
            Request permission to join your college
          </p>
        </div>

        <form className="space-y-4 relative">

          {/* College */}
          <input
            type="text"
            placeholder="College name"
            value={collegeInput}
            onChange={handleCollegeChange}
            className="w-full rounded-lg border px-4 py-2.5"
          />

          {filteredColleges.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-lg shadow max-h-40 overflow-y-auto">
              {filteredColleges.map(c => (
                <div
                  key={c.id}
                  onClick={() => selectCollege(c)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {c.name}
                </div>
              ))}
            </div>
          )}

          {/* Department */}
          <input
            type="text"
            placeholder="Department"
            value={departmentInput}
            onChange={handleDepartmentChange}
            disabled={!selectedCollege}
            className="w-full rounded-lg border px-4 py-2.5 disabled:bg-gray-100"
          />

          {filteredDepartments.length > 0 && (
            <div className="w-full bg-white border rounded-lg shadow max-h-32 overflow-y-auto">
              {filteredDepartments.map(dept => (
                <div
                  key={dept}
                  onClick={() => selectDepartment(dept)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {dept}
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleSendRequest}
            disabled={!selectedCollege || !selectedDepartment}
            className="w-full rounded-lg py-2.5 bg-black text-white
                       hover:opacity-90 transition
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send Request
          </button>
        </form>
      </div>

      {/* Modal */}
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

            <p className="text-sm text-gray-600 text-center">
              Your request has been sent to the administration of
              <br />
              <span className="font-medium text-black">
                {selectedCollege?.name}
              </span>
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full rounded-lg py-2.5 bg-black text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
