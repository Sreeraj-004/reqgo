import PrincipalRegister from "../components/PrincipalRegister";
import VicePrincipalRegister from "../components/VicePrincipalRegister";
import HODRegister from "../components/HODRegister";
import StudentRegister from "../components/StudentRegister";

export default function Registration() {
  const role = localStorage.getItem("Role");

  const renderForm = () => {
    if (role === "principal") return <PrincipalRegister />;
    if (role === "vice_principal") return <VicePrincipalRegister />;
    if (role === "hod") return <HODRegister />;
    if (role === "student") return <StudentRegister />;
    return null;
  };

  return (
    <div className="min-h-screen flex">

      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100">
        {renderForm()}
      </div>

      <div className="hidden md:flex w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1562774053-701939374585)",
          }}
        />

        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 flex flex-col mb-20 justify-end px-12 text-white">
          <h2 className="text-3xl font-semibold mb-4">
            One Platform. One College.
          </h2>
          <p className="text-lg text-white/80 max-w-md">
            Create your institution or join an existing one to manage students,
            staff, and academics seamlessly.
          </p>
        </div>
      </div>
    </div>
  );
}
