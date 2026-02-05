import { useNavigate } from "react-router-dom";
import { useState } from "react";
import LetterPreview from "../components/LetterPreview";
import CertificatePreview from "../components/CertificatePreview";
import CustomLetterPreview from "../components/CustomLetterPreview";
import { useRef } from "react";


export default function HeroSection() {
  const navigate = useNavigate();
  const [activePreview, setActivePreview] = useState("letter");
  const secondSectionRef = useRef(null);

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
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 ">
    
      <div className="w-full h-screen border-b-gray-300 border-solid border-b-2 flex flex-col items-center justify-center mb-5 ">
        <h1
          className="text-4xl md:text-7xl font-bold leading-tight
                    text-[#E0AF35]
                    drop-shadow-md"
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
        <div className=" flex w-full justify-center mt-8 md:mt-12 mx-auto ">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 text-black rounded-xl font-medium bg-primary-gradient hover:opacity-90 transition shadow-lg flex items-center mr-4"
            >
              Get Started
            </button>
            <button
              onClick={() =>
                secondSectionRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
              className="px-6 py-3 text-black rounded-xl font-medium bg-white border-2 border-yellow-300 hover:opacity-90 transition shadow-lg flex items-center"
            >
              Learn more
            </button>
        </div>
  
</div>

    <div className="flex items-center mt-12 h-screen"
    ref={secondSectionRef}>
      {/* Background Gradient Blobs */}
      <div className="absolute -top-32 -left-32 h-96 w-96 bg-yellow-300 rounded-full blur-3xl opacity-30" />
          
      <div className="absolute top-1/3 -right-32 h-96 w-96 bg-amber-400 rounded-full blur-3xl opacity-30" />
          
      <div className="relative container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
        
        {/* Left Content */}
        <div className="px-10">
          <span className="inline-block mb-4 px-4 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full">
            A Smart, Digitized Request Letter Workflow
          </span>
          <h2 className="text-3xl">
            Create request Letter effortlessly
          </h2>
          <p className="mt-6 text-lg text-gray-600 max-w-xl">
            Create, submit, forward, and approve college requests digitally
            with complete tracking and transparency at every stage.
          </p>
          <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 text-black rounded-xl mt-4 font-medium bg-primary-gradient hover:opacity-90 transition shadow-lg flex items-center mr-4"
            >
              Get Started
            </button>

          {/* Feature Cards */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          

        {/* Right Illustration */}
        <div className="relative flex justify-center">
          
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-4 border transform scale-75 origin-center">

            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="h-3 w-3 bg-red-400 rounded-full" />
                <div className="h-3 w-3 bg-yellow-400 rounded-full" />
                <div className="h-3 w-3 bg-green-400 rounded-full" />
              </div>

              <div className="w-full max-w-md">
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
        
        

      </div>
      </div>
    </section>
  );
}

function FeatureCard({ title, onClick, active }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer
        transition shadow-sm
        ${active ? "bg-yellow-100 border border-yellow-300" : "bg-white hover:bg-gray-50"}
      `}
    >
      <div className="h-10 w-10 rounded-lg bg-primary-gradient" />
      <span className="font-medium text-gray-800">{title}</span>
    </div>
  );
}

