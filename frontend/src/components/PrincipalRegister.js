import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PrincipalRegister() {
  const navigate = useNavigate();

  const [collegeName, setCollegeName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");

  const [departmentInput, setDepartmentInput] = useState("");
  const [departments, setDepartments] = useState([]);

  const [existingColleges, setExistingColleges] = useState([]);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const [signatureFile, setSignatureFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/colleges/")
      .then((res) => res.json())
      .then((data) => {
        setExistingColleges(data.map((c) => c.name.toLowerCase()));
      })
      .catch(() => console.error("Failed to fetch colleges"));
  }, []);

  const addDepartment = () => {
    const value = departmentInput.trim();
    if (!value) return;

    if (!departments.includes(value)) {
      setDepartments((prev) => [...prev, value]);
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
    setDepartments((prev) => prev.filter((d) => d !== dept));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      await uploadSignature();

      const payload = {
        principal_id: user.id,
        college_name: collegeName,
        address,
        city,
        zip_code: zipCode,
        departments,
      };

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

      navigate("/dashboard");
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-8">
    <div className="text-center mb-6">
      <h1 className="text-2xl font-semibold">College Details</h1>
      <p className="text-sm text-gray-500">Register your institution</p>
    </div>

    <form className="space-y-4" onSubmit={handleSubmit}>
      <input
        placeholder="College name"
        value={collegeName}
        onChange={(e) => {
          const value = e.target.value;
          setCollegeName(value);
          setIsDuplicate(existingColleges.includes(value.trim().toLowerCase()));
        }}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5
           focus:outline-none focus:ring-2 focus:ring-yellow-400"

        required
      />

      <input
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5
           focus:outline-none focus:ring-2 focus:ring-yellow-400"

        required
      />

      <div className="grid grid-cols-2 gap-3">
        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5
           focus:outline-none focus:ring-2 focus:ring-yellow-400"

          required
        />
        <input
          placeholder="Zip code"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5
           focus:outline-none focus:ring-2 focus:ring-yellow-400"

          required
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Departments</p>

        <div className="flex flex-wrap gap-2 mb-2">
          {departments.map((dept) => (
            <span
              key={dept}
              className="flex items-center gap-2 bg-primary-gradient text-gray-900 px-3 py-1 rounded-full text-sm"
            >
              {dept}
              <button
                type="button"
                onClick={() => removeDepartment(dept)}
                className="opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </span>
          ))}
        </div>


        <div className="flex border rounded-lg overflow-hidden">
          <input
            placeholder="Add department"
            value={departmentInput}
            onChange={(e) => setDepartmentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-2.5"
          />
          <button
            type="button"
            onClick={addDepartment}
            className="bg-primary-gradient text-gray-900 px-4"
          >
            ➜
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Principal Signature</p>
        <input
          type="file"
          accept="image/png, image/jpeg"
          onChange={(e) => setSignatureFile(e.target.files[0])}
          className="w-full rounded-lg border px-4 py-2.5"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isDuplicate || loading}
        className="w-full rounded-lg py-2.5 bg-primary-gradient text-gray-900 disabled:opacity-40"
      >
        {loading ? "Submitting..." : "Register College"}
      </button>
    </form>
  </div>
);
}
