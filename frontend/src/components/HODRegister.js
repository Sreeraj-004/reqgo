import { useEffect, useState } from "react";

export default function HODRegister() {
  const [showModal, setShowModal] = useState(false);

  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [collegeInput, setCollegeInput] = useState("");
  const [selectedCollege, setSelectedCollege] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [departmentInput, setDepartmentInput] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [signatureFile, setSignatureFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/colleges/")
      .then((res) => res.json())
      .then((data) => setColleges(data))
      .catch(() => console.error("Failed to load colleges"));
  }, []);

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
      colleges.filter((c) =>
        c.name.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const selectCollege = (college) => {
    setCollegeInput(college.name);
    setSelectedCollege(college);
    setFilteredColleges([]);

    const deptList = college.departments
      ? college.departments.split(",").map((d) => d.trim())
      : [];

    setDepartments(deptList);
  };

  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    setDepartmentInput(value);
    setSelectedDepartment(null);

    if (!value.trim()) {
      setFilteredDepartments([]);
      return;
    }

    setFilteredDepartments(
      departments.filter((d) =>
        d.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const selectDepartment = (dept) => {
    setDepartmentInput(dept);
    setSelectedDepartment(dept);
    setFilteredDepartments([]);
  };

  const uploadSignature = async () => {
    if (!signatureFile) {
      throw new Error("Signature file is required");
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", signatureFile);

    const res = await fetch("http://localhost:8000/users/upload-signature", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || "Signature upload failed");
    }
  };

  const handleSendRequest = async () => {
    if (!selectedCollege || !selectedDepartment) return;

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    setLoading(true);

    try {
      await uploadSignature();

      const res = await fetch("http://localhost:8000/access/hod", {
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
      console.error("HOD request failed:", err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold">HOD Access</h1>
          <p className="text-sm text-gray-500 mt-1">
            Request permission to join your college
          </p>
        </div>

        <form className="space-y-4 relative">
          <input
            type="text"
            placeholder="College name"
            value={collegeInput}
            onChange={handleCollegeChange}
            className="w-full rounded-lg border px-4 py-2.5"
          />

          {filteredColleges.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-lg shadow max-h-40 overflow-y-auto">
              {filteredColleges.map((c) => (
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
              {filteredDepartments.map((dept) => (
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

          <div>
            <p className="text-sm font-medium mb-2">HOD Signature</p>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={(e) => setSignatureFile(e.target.files[0])}
              className="w-full rounded-lg border px-4 py-2.5"
              required
            />
          </div>

          <button
            type="button"
            onClick={handleSendRequest}
            disabled={!selectedCollege || !selectedDepartment || loading}
            className="w-full rounded-lg py-2.5 bg-primary-gradient text-black disabled:opacity-40"
          >
            {loading ? "Sending..." : "Send Request"}
          </button>
        </form>
      </div>

      {showModal && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm">
          <div
            className="absolute inset-0 bg-primary-gradient/50"
            onClick={() => setShowModal(false)}
          />

          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-center mb-3">
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
