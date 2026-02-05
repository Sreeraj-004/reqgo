import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center">
      
      {/* Background Gradient Blobs */}
      <div className="absolute -top-32 -left-32 h-96 w-96 bg-yellow-300 rounded-full blur-3xl opacity-30" />
      <div className="absolute top-1/3 -right-32 h-96 w-96 bg-amber-400 rounded-full blur-3xl opacity-30" />

      <div className="relative container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
        
        {/* Left Content */}
        <div className="px-3">
          <span className="inline-block mb-4 px-4 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full">
            Paperless College Workflow
          </span>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Digitize Your College
            <br />
            Letter Requests
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-xl">
            Submit leave requests, certificate applications, and custom letters
            to college authorities — all online, tracked, and completely
            hassle-free.
          </p>

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 text-white rounded-xl font-medium bg-primary-gradient hover:opacity-90 transition shadow-lg"
            >
              Get Started
            </button>

            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-white transition">
              Learn More
            </button>
          </div>

          {/* Feature Cards */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FeatureCard title="Leave Requests" />
            <FeatureCard title="Certificates" />
            <FeatureCard title="Custom Letters" />
          </div>
        </div>

        {/* Right Illustration */}
        <div className="relative flex justify-center">
          
          <div className="absolute -top-6 -left-6 bg-white shadow-lg rounded-xl px-4 py-2 text-sm font-medium text-yellow-700">
            Leave Approved
          </div>

          <div className="absolute -bottom-6 -right-1 bg-white shadow-lg rounded-xl px-4 py-2 text-sm font-medium text-amber-700">
            Send Letter
          </div>

          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border">
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="h-3 w-3 bg-red-400 rounded-full" />
                <div className="h-3 w-3 bg-yellow-400 rounded-full" />
                <div className="h-3 w-3 bg-green-400 rounded-full" />
              </div>

              <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded"></div>

              <div className="mt-6 h-36 bg-primary-gradient rounded-xl flex items-center justify-center text-gray-900 font-semibold">
                Request Dashboard Preview
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

function FeatureCard({ title }) {
  return (
    <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm">
      <div className="h-10 w-10 rounded-lg bg-primary-gradient" />
      <span className="font-medium text-gray-800">{title}</span>
    </div>
  );
}
