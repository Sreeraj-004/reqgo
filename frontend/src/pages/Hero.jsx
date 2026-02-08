import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import LetterPreview from "../components/LetterPreview";
import CertificatePreview from "../components/CertificatePreview";
import CustomLetterPreview from "../components/CustomLetterPreview";

export default function HeroSection() {
  const navigate = useNavigate();
  const [activePreview, setActivePreview] = useState("letter");

  const heroRef = useRef(null);
  const previewRef = useRef(null);
  const featuresRef = useRef(null);

  const demoLetterData = {
    type: "Leave Request",
    studentName: "Arjun Menon",
    department: "Computer Science",
    college: "ABC College of Engineering",
    sub: "Request for Leave",
    fromDate: "10 Mar 2026",
    toDate: "12 Mar 2026",
    reason: "medical reasons",
    status: "approved",
    recipients: {
      hod: { name: "Dr. Rajesh Kumar" },
    },
  };

  const demoCertificateData = {
    studentName: "Arjun Menon",
    department: "Computer Science",
    college: "ABC College of Engineering",
    sub: "Certificate Request",
    certificates: ["Bonafide Certificate", "Conduct Certificate"],
    certificatePurpose: "higher studies",
    status: "approved",
    recipients: {
      hod: { name: "Dr. Rajesh Kumar" },
      principal: { name: "Dr. Suresh Nair" },
    },
  };

  const demoCustomLetterData = {
    studentName: "Arjun Menon",
    department: "Computer Science",
    college: "ABC College of Engineering",
    sub: "Request for Lab Access",
    to: "HOD",
    customContent:
      "I kindly request permission to access the laboratory after college hours for project work.",
    recipients: {
      hod: { name: "Dr. Rajesh Kumar" },
    },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">

      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur border-b">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <span
            className="font-bold text-lg text-[#E0AF35] cursor-pointer"
            onClick={() =>
              heroRef.current?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Reqgo
          </span>

          <div className="flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() =>
                heroRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="hover:text-yellow-600"
            >
              Home
            </button>

            <button
              onClick={() =>
                previewRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="hover:text-yellow-600"
            >
              Letters
            </button>

            <button
              onClick={() =>
                featuresRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="hover:text-yellow-600"
            >
              Features
            </button>

            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-lg bg-primary-gradient shadow"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <div
        ref={heroRef}
        className="w-full h-screen flex flex-col items-center justify-center border-b scroll-mt-16"
      >
        <h1
          className="text-4xl md:text-7xl font-bold text-[#E0AF35]"
          style={{
            textShadow: `
              -1px -1px 0 #7a6f00,
              1px -1px 0 #7a6f00,
              -1px  1px 0 #7a6f00,
              1px  1px 0 #7a6f00,
              0px  4px 6px rgba(0, 0, 0, 0.25)
            `,
          }}
        >
          Reqgo
        </h1>

        <div className="flex mt-10">
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 mr-4 rounded-xl bg-primary-gradient shadow-lg"
          >
            Get Started
          </button>

          <button
            onClick={() =>
              previewRef.current?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-6 py-3 rounded-xl bg-white border-2 border-yellow-300 shadow-lg"
          >
            Learn more
          </button>
        </div>
      </div>

      {/* ================= PREVIEW ================= */}
      <div
        ref={previewRef}
        className="min-h-screen flex items-center scroll-mt-16"
      >
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">

          <div className="px-10">
            <span className="inline-block mb-4 px-4 py-1 text-sm bg-yellow-100 rounded-full">
              Digitized College Workflow
            </span>

            <h2 className="text-3xl font-semibold">
              Create Requests Effortlessly
            </h2>

            <p className="mt-6 text-lg text-gray-600 max-w-xl">
              Submit, forward, and approve requests digitally with full
              transparency and tracking.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 mt-6 rounded-xl bg-primary-gradient shadow-lg"
            >
              Get Started
            </button>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FeatureCard
                title="Leave Requests"
                active={activePreview === "letter"}
                onClick={() => setActivePreview("letter")}
              />
              <FeatureCard
                title="Certificates"
                active={activePreview === "certificate"}
                onClick={() => setActivePreview("certificate")}
              />
              <FeatureCard
                title="Custom Letters"
                active={activePreview === "custom"}
                onClick={() => setActivePreview("custom")}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-4 border scale-75">
              {activePreview === "letter" && (
                <LetterPreview data={demoLetterData} />
              )}
              {activePreview === "certificate" && (
                <CertificatePreview data={demoCertificateData} />
              )}
              {activePreview === "custom" && (
                <CustomLetterPreview data={demoCustomLetterData} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= FEATURES ================= */}
      <div
        ref={featuresRef}
        className="py-24 bg-white scroll-mt-16"
      >
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything Your College Needs
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureBox title="Multi-Level Approval" />
            <FeatureBox title="Real-Time Tracking" />
            <FeatureBox title="Role-Based Access" />
            <FeatureBox title="Digital Records" />
            <FeatureBox title="Custom Requests" />
            <FeatureBox title="Complete Audit Trail" />
          </div>
        </div>
      </div>

      {/* ================= FINAL CTA ================= */}
      <div className="py-24 bg-gradient-to-r from-yellow-100 to-amber-100 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Ready to Go Paperless?
        </h2>
        <p className="text-gray-700 max-w-xl mx-auto mb-8">
          Bring transparency, speed, and structure to your college workflow.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-8 py-4 rounded-xl bg-primary-gradient shadow-lg"
        >
          Get Started
        </button>
      </div>

    </section>
  );
}

/* ================= COMPONENTS ================= */

function FeatureCard({ title, onClick, active }) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl cursor-pointer border transition
        ${active ? "bg-yellow-100 border-yellow-300" : "bg-white hover:bg-gray-50"}
      `}
    >
      <span className="font-medium">{title}</span>
    </div>
  );
}

function FeatureBox({ title }) {
  return (
    <div className="p-6 rounded-2xl border bg-gray-50 hover:shadow-lg transition">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600">
        Designed to simplify and streamline institutional workflows.
      </p>
    </div>
  );
}
