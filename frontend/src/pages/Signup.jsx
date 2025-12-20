import { useState } from "react";
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

  const roles = [
    { id: "principal", label: "Principal" },
    { id: "vice_principal", label: "Vice Principal" },
    { id: "hod", label: "HOD" },
    { id: "student", label: "Student" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Fill all fields, da. This is not a leave application.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:8000/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Signup failed");
      }

      // Store JWT + user
      localStorage.setItem("token", data.jwt_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("Role", data.user.role);

      // Redirect based on role
      navigate(`/registration`);
    } catch (err) {
      setError(err.message || "Something went wrong. Backend went on tea break ☕");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl p-8">
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign up your account
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border px-4 py-2.5"
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border px-4 py-2.5"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border px-4 py-2.5 pr-10"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3l18 18"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}

            </button>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2 text-center">
              Select your role
            </p>

            <div className="grid grid-cols-2 gap-3">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`rounded-lg border px-3 py-2 text-sm
                    ${role === r.id ? "bg-black text-white" : "border-gray-300"}
                  `}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-2.5 bg-black text-white"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <span
            className="font-medium text-black cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}
