import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PrincipalRegister() {
  const navigate = useNavigate();

  const [collegeName, setCollegeName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");

  const [departmentInput, setDepartmentInput] = useState("");
  const [departments, setDepartments] = useState([]);

  const addDepartment = () => {
    const value = departmentInput.trim();
    if (!value) return;

    if (!departments.includes(value)) {
      setDepartments([...departments, value]);
    }

    setDepartmentInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addDepartment();
    }
  };

  const removeDepartment = (dept) => {
    setDepartments(departments.filter((d) => d !== dept));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const payload = {
      principal_id: user.id,
      college_name: collegeName,
      address,
      city,
      zip_code: zipCode,
      departments,
    };

    try {
      const res = await fetch("http://localhost:8000/colleges/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "College registration failed");
      }

      navigate("/principal/dashboard");
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl p-8">
      
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold">College Details</h1>
        <p className="text-sm text-gray-500 mt-1">
          Register your institution
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="College name"
          value={collegeName}
          onChange={(e) => setCollegeName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5
                     focus:outline-none focus:ring-2 focus:ring-gray-400"
        />

        <div className="grid grid-cols-1 gap-3">
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5
                       focus:outline-none focus:ring-2 focus:ring-gray-400"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-gray-400"
            />

            <input
              type="text"
              placeholder="Zip code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Departments
          </p>

          <div className="flex flex-wrap gap-2 mb-2">
            {departments.map((dept) => (
              <span
                key={dept}
                className="flex items-center gap-2 px-3 py-1
                           rounded-full bg-black text-white text-sm"
              >
                {dept}
                <button
                  type="button"
                  onClick={() => removeDepartment(dept)}
                  className="text-white/70 hover:text-white"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <div
            className="
              flex items-center rounded-lg border border-gray-300 overflow-hidden
              focus-within:ring-2 focus-within:ring-gray-400
            "
          >
            <input
              type="text"
              placeholder="Type department"
              value={departmentInput}
              onChange={(e) => setDepartmentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-4 py-2.5 focus:outline-none"
            />

            <button
              type="button"
              onClick={addDepartment}
              disabled={!departmentInput.trim()}
              className="
                h-full px-4
                text-white bg-black py-2.5 
                hover:-rotate-90
                disabled:opacity-40 disabled:bg-white disabled:text-gray-700 disabled:cursor-not-allowed
                transition
              "
            >
              ➜
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg py-2.5 font-medium
                     bg-black text-white
                     hover:opacity-90 transition"
        >
          Register College
        </button>
      </form>
    </div>
  );
}
