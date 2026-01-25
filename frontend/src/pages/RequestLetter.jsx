import { useState } from "react";
import LetterPreview from "../components/LetterPreview";
import CertificatePreview from "../components/CertificatePreview";
import CustomLetterPreview from "../components/CustomLetterPreview";


export default function NewRequestLetter() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [requestType, setRequestType] = useState("");

  // Leave
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [remarks, setRemarks] = useState("");

  // Certificate
  const [certificates, setCertificates] = useState([""]);
  const [certificatePurpose, setCertificatePurpose] = useState("");

  // Custom letter
  const [customTo, setCustomTo] = useState("");
  const [customContent, setCustomContent] = useState("");

  const isLeave = requestType === "leave";
  const isCertificate = requestType === "certificate";
  const isCustom = requestType === "custom";

  const addCertificateField = () => {
    setCertificates((prev) => [...prev, ""]);
  };

  const updateCertificateField = (index, value) => {
    const updated = [...certificates];
    updated[index] = value;
    setCertificates(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requestType) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    const token = localStorage.getItem("token");

    try {
      if (isLeave) {
        const res = await fetch("http://localhost:8000/leaves", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            leave_type: "medical",
            subject: "Leave Request",
            reason: remarks,
            from_date: fromDate,
            to_date: toDate,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Failed to submit leave request");
        }
      }

      if (isCertificate) {
        const res = await fetch("http://localhost:8000/certificate-requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            certificates: certificates.filter((c) => c && c.trim() !== ""),
            purpose: certificatePurpose,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Failed to submit certificate request");
        }
      }

      if (isCustom) {
        const res = await fetch("http://localhost:8000/custom-letters", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            to_role: customTo,
            content: customContent,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Failed to submit custom letter");
        }
      }


      setSuccess(true);

      // Reset
      setRequestType("");
      setFromDate("");
      setToDate("");
      setRemarks("");
      setCertificates([""]);
      setCertificatePurpose("");
      setCustomTo("");
      setCustomContent("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const previewData = requestType
    ? {
        studentName: user?.name,
        department: user?.department_name,
        type:
          isLeave
            ? "Leave Request"
            : isCertificate
            ? "Certificate Request"
            : "Custom Letter",
        fromDate,
        toDate,
        reason: remarks,
        certificates,
        certificatePurpose,
        to: isCustom ? customTo : "HOD",
        customContent,
      }
    : null;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-10">
      <div
        className={`w-full max-w-6xl flex items-center transition-all duration-500 ${
          requestType ? "justify-between gap-8" : "justify-center"
        }`}
      >
        {/* FORM */}
        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold">New Request</h1>
            <p className="text-sm text-gray-500 mt-1">
              Choose request type
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* REQUEST TYPE */}
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className="w-full rounded-lg border px-4 py-2.5"
            >
              <option value="">Select request type</option>
              <option value="leave">Leave Request</option>
              <option value="certificate">Get Certificate</option>
              <option value="custom">Custom Letter</option>
            </select>

            {/* LEAVE */}
            {isLeave && (
              <div className="space-y-4">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full rounded-lg border px-4 py-2.5"
                />

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full rounded-lg border px-4 py-2.5"
                />

                <textarea
                  placeholder="Reason for leave"
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full rounded-lg border px-4 py-2.5 resize-none"
                />
              </div>
            )}

            {/* CERTIFICATE */}
            {isCertificate && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">
                  Certificate(s) required
                </p>

                {certificates.map((cert, index) => (
                  <input
                    key={index}
                    type="text"
                    placeholder={`Certificate ${index + 1}`}
                    value={cert}
                    onChange={(e) =>
                      updateCertificateField(index, e.target.value)
                    }
                    className="w-full rounded-lg border px-4 py-2.5"
                  />
                ))}

                <button
                  type="button"
                  onClick={addCertificateField}
                  className="text-sm text-black flex items-center gap-1 hover:opacity-70"
                >
                  <span className="text-lg">+</span>
                  Add another certificate
                </button>

                <textarea
                  placeholder="Purpose of requesting certificate(s)"
                  rows={3}
                  value={certificatePurpose}
                  onChange={(e) => setCertificatePurpose(e.target.value)}
                  className="w-full rounded-lg border px-4 py-2.5 resize-none"
                />
              </div>
            )}

            {/* CUSTOM LETTER */}
            {isCustom && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded">
                    To
                  </span>
                  <select
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="flex-1 rounded-lg border px-4 py-2.5"
                  >
                    <option value="">Select recipient</option>
                    <option value="Principal">Principal</option>
                    <option value="Vice Principal">Vice Principal</option>
                    <option value="HOD">HOD</option>
                  </select>
                </div>

                <textarea
                  placeholder="Write your letter content here..."
                  rows={6}
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  className="w-full rounded-lg border px-4 py-2.5 resize-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={!requestType || loading}
              className="w-full rounded-lg py-2.5 bg-black text-white disabled:opacity-40"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>

            {error && (
              <p className="text-sm text-red-600 text-center">
                {error}
              </p>
            )}

            {success && (
              <p className="text-sm text-green-600 text-center">
                Request submitted successfully
              </p>
            )}
          </form>
        </div>

        {/* PREVIEW */}
        {isCustom && (
          <CustomLetterPreview data={previewData} />
        )}
        {isLeave && (
          <LetterPreview data={previewData} />
        )}


        {isCertificate && (
          <CertificatePreview data={previewData} />
        )}
      </div>
    </div>
  );
}
