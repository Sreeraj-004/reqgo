import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EditCollegeDetails() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [collegeId, setCollegeId] = useState(null);
  const [collegeName, setCollegeName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [departments, setDepartments] = useState([]);
  const [departmentInput, setDepartmentInput] = useState("");

  // 🔥 GET college details
  useEffect(() => {
    fetch(`http://localhost:8000/colleges/by-principal/${user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCollegeId(data.id);
        setCollegeName(data.name);
        setAddress(data.address);
        setCity(data.city);
        setZipCode(data.zip_code);
        setDepartments(
          data.departments ? data.departments.split(",") : []
        );
      })
      .catch(() => console.error("Failed to load college details"));
  }, []);

  const addDepartment = () => {
    if (!departmentInput.trim()) return;
    if (!departments.includes(departmentInput)) {
      setDepartments([...departments, departmentInput]);
    }
    setDepartmentInput("");
  };

  const removeDepartment = (dept) => {
    setDepartments(departments.filter((d) => d !== dept));
  };

  // 🔥 PUT update
  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch(`http://localhost:8000/colleges/${collegeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: collegeName,
        address,
        city,
        zip_code: zipCode,
        departments,
      }),
    });

    navigate("/dashboard");
  };

  return (
    <div className="
      w-full max-w-md 
      rounded-2xl 
      bg-white 
      shadow-2xl 
      border border-gray-200
      p-8
    ">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold">College Details</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update your institution
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          value={collegeName}
          onChange={(e) => setCollegeName(e.target.value)}
          className="w-full rounded-lg border px-4 py-2.5"
        />

        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-lg border px-4 py-2.5"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-lg border px-4 py-2.5"
          />
          <input
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="rounded-lg border px-4 py-2.5"
          />
        </div>

        {/* Departments */}
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {departments.map((dept) => (
              <span
                key={dept}
                className="
                  flex items-center gap-2
                  bg-primary-gradient text-black
                  px-3 py-1
                  rounded-full
                  text-sm
                "
              >
                {dept}

                <button
                  type="button"
                  onClick={() => removeDepartment(dept)}
                  className="
                    text-black/70
                    hover:text-black
                    leading-none
                  "
                  aria-label={`Remove ${dept}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <div className="flex border rounded-lg overflow-hidden">
            <input
              value={departmentInput}
              onChange={(e) => setDepartmentInput(e.target.value)}
              className="flex-1 px-4 py-2.5 outline-none"
              placeholder="Add department"
            />
            <button
              type="button"
              onClick={addDepartment}
              className="bg-primary-gradient text-black px-4"
            >
              ➜
            </button>
          </div>
        </div>


        <button
          type="submit"
          className="w-full rounded-lg py-2.5 bg-primary-gradient text-black"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
