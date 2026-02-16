import { useState }from "react";
import {useEffect} from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState("");
  const shouldShowDepartment = role === "student" || role === "hod";
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const requiresSignature =
  role === "principal" ||
  role === "vice_principal" ||
  role === "hod";
  const [signatureFile, setSignatureFile] = useState(null);


  
const departments = [
  "Computer Science",
  "Computer Applications",
  "Chemistry",
  "Geography",
  "Commerce",
  "English",
  "Physics",
  "Mathematics",
  "Psychology",
  "Management",
  "Hotel Management",
];


  const roles = [
    { id: "principal", label: "Principal" },
    { id: "vice_principal", label: "Vice Principal" },
    { id: "hod", label: "HOD" },
    { id: "superintendent", label: "Superintendent" },
    { id: "student", label: "Student" },
  ];
  const selectedRole = roles.find((r) => r.id === role);
  const remainingRoles = roles.filter((r) => r.id !== role);


  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!name || !email || !password) {
    setError("Fill all fields");
    return;
  }

  if ((role === "student" || role === "hod") && !department) {
    setError("Please select your department");
    return;
  }

  if (requiresSignature && !signatureFile) {
    setError("Signature is required for this role");
    return;
  }

  try {
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);
    formData.append("department_name", department || "");

    if (requiresSignature && signatureFile) {
      formData.append("signature", signatureFile);
    }

    const res = await fetch("http://localhost:8000/users/", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Signup failed");
    }

    localStorage.setItem("token", data.jwt_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setShowSuccessModal(true);

  } catch (err) {
    setError(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      {showSuccessModal && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Signup Successful
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Your account has been created successfully.
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Access will be granted once the admin approves your account.
          </p>
          <p className="text-sm text-gray-600 mb-6">
            For queries contact: <span className="font-medium">admin@reqgo.com</span>
          </p>

          <button
            onClick={() => navigate("/login")}
            className="w-full rounded-lg py-2.5 font-medium text-gray-900
                      bg-primary-gradient hover:opacity-90 transition shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    )}

      
      {/* Background Blobs */}
      <div className="absolute -top-32 -left-32 h-96 w-96 bg-yellow-300 rounded-full blur-3xl opacity-30" />
      <div className="absolute top-1/3 -right-32 h-96 w-96 bg-amber-400 rounded-full blur-3xl opacity-30" />

      {/* Signup Card */}
      <div className="relative w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-xl shadow-2xl p-8 border">
        
        <div className="text-center mb-8">
          <span className="inline-block mb-3 px-4 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full">
            Get Started
          </span>
          <h1 className="text-2xl font-semibold text-gray-900">
            Create your account
          </h1>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5
                       focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5
                       focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10
                         focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            


            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-800"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {shouldShowDepartment && (
            <div>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5
                          focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Select Department</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* signature */}
          {requiresSignature && (
          <div>
            <p className="text-sm font-medium mb-2">Upload Signature</p>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={(e) => setSignatureFile(e.target.files[0])}
              className="w-full rounded-lg border px-4 py-2.5"
              required
            />
          </div>
        )}



          {/* Role Selection */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3 text-center">
              Select your role
            </p>

            <div className="space-y-4">

  {/* SELECTED ROLE – HERO */}
  {selectedRole && (
    <button
      type="button"
      onClick={() => setRole(selectedRole.id)}
      className="w-full py-3 rounded-xl text-sm font-semibold
                 bg-primary-gradient text-gray-900 shadow-lg
                 transition-all duration-300"
    >
      {selectedRole.label}
        </button>
      )}

      {/* OTHER ROLES – 2 x 2 GRID */}
      <div className="grid grid-cols-2 gap-3">
        {remainingRoles.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRole(r.id)}
            className="rounded-lg px-3 py-2 text-sm font-medium
                      border border-gray-300 text-gray-700
                      hover:bg-white hover:shadow-sm
                      transition-all duration-200"
          >
            {r.label}
          </button>
        ))}
      </div>

    </div>

          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-2.5 font-medium text-gray-900
                       bg-primary-gradient hover:opacity-90 transition shadow-lg"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <span
            className="font-medium text-gray-900 cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}
