import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import LetterPreview from "../components/LetterPreview";
import CertificatePreview from "../components/CertificatePreview";
import CustomLetterPreview from "../components/CustomLetterPreview";
import html2pdf from "html2pdf.js";
import { QRCodeCanvas } from "qrcode.react";

export default function ViewRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const previewRef = useRef(null);

  const [data, setData] = useState(null);
  const [requestType, setRequestType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showShare, setShowShare] = useState(false);

  /* --------------------------------------------------
     Detect request type from URL
  -------------------------------------------------- */
  useEffect(() => {
    if (location.pathname.startsWith("/leaves")) {
      setRequestType("leave");
    } else if (location.pathname.startsWith("/certificate-requests")) {
      setRequestType("certificate");
    } else if (location.pathname.startsWith("/custom-letters")) {
      setRequestType("custom");
    }
  }, [location.pathname]);

  /* --------------------------------------------------
     Fetch request details
  -------------------------------------------------- */
  useEffect(() => {
    if (!requestType) return;

    let apiUrl = "";

    if (requestType === "leave") {
      apiUrl = `http://localhost:8000/leaves/${id}`;
    }
    if (requestType === "certificate") {
      apiUrl = `http://localhost:8000/certificate-requests/${id}`;
    }
    if (requestType === "custom") {
      apiUrl = `http://localhost:8000/custom-letters/${id}`;
    }

    fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Failed to load request");
        }
        return res.json();
      })
      .then((resData) => {
        if (requestType === "leave") {
          setData({
            type: "Leave Request",
            studentName: resData.student?.name,
            department: resData.student?.department_name,
            fromDate: resData.from_date,
            toDate: resData.to_date,
            reason: resData.reason,
            status: resData.overall_status,
            approverName: resData.current_approver?.name || "HOD",
            approverRole: resData.current_approver?.role || "hod",
          });
        }

        if (requestType === "certificate") {
          setData({
            type: "Certificate Request",
            studentName: resData.student?.name,
            department: resData.student?.department_name,
            certificates: resData.certificates,
            purpose: resData.purpose,
            status: resData.overall_status,
            approverName: "Office",
            approverRole: "admin",
          });
        }

        if (requestType === "custom") {
          setData({
            type: "Custom Letter",
            studentName: resData.student?.name,
            department: resData.student?.department_name,
            to: resData.to_role,
            customContent: resData.content,
            status: resData.status,
            approverName: resData.to_role,
            approverRole: resData.to_role?.toLowerCase(),
          });
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, token, requestType]);

  /* --------------------------------------------------
     Approval permission
  -------------------------------------------------- */
  const canApprove =
    data &&
    ["hod", "vice_principal", "principal"].includes(user?.role) &&
    data.status === "in_progress";

  /* --------------------------------------------------
     Approve / Reject handler
  -------------------------------------------------- */
  const handleDecision = async (decision) => {
    let apiUrl = "";

    if (requestType === "leave") {
      apiUrl = `http://localhost:8000/leaves/${id}/decision`;
    }
    if (requestType === "certificate") {
      apiUrl = `http://localhost:8000/certificate-requests/${id}/decision`;
    }
    if (requestType === "custom") {
      apiUrl = `http://localhost:8000/custom-letter-requests/${id}/decision`;
    }

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: decision }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Action failed");
      }

      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  };

  /* --------------------------------------------------
     PDF Download
  -------------------------------------------------- */
  const downloadPDF = () => {
    if (!previewRef.current || !data) return;

    const filename = `${data.studentName}_${requestType}_request.pdf`;

    html2pdf()
      .set({
        margin: 15,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(previewRef.current)
      .save();
  };

  const currentUrl = window.location.href;

  /* --------------------------------------------------
     UI STATES
  -------------------------------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading request…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  /* --------------------------------------------------
     RENDER
  -------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gray-100 px-6 py-6">
      {/* HEADER */}
      <div className="max-w-3xl mx-auto text-center mb-6">
        <h1 className="text-3xl font-semibold">{data.type}</h1>
        <p className="text-sm text-gray-600 mt-1">
          {data.studentName} • {data.department}
        </p>
      </div>

      {/* PREVIEW */}
      <div className="max-w-3xl mx-auto flex items-center flex-col">
        <div ref={previewRef}>
          {requestType === "leave" && <LetterPreview data={data} />}
          {requestType === "certificate" && <CertificatePreview data={data} />}
          {requestType === "custom" && <CustomLetterPreview data={data} />}
        </div>

        {/* INFO */}
        <div className="mt-6 space-y-3 text-sm text-gray-700 w-full">
          <p>
            <span className="font-medium text-black">Current Status:</span>{" "}
            {data?.status
  ? data.status.replace("_", " ")
  : "Pending"}


          </p>

          <div className="flex items-center justify-between">
            <p>
              <span className="font-medium text-black">For queries:</span>{" "}
              {data.approverName} ({data.approverRole?.toUpperCase()})
            </p>

            <button
              onClick={() => alert("Message flow coming next")}
              className="px-3 py-1.5 text-xs rounded-md border border-black text-black hover:bg-gray-100"
            >
              Send Message
            </button>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={downloadPDF}
            className="px-6 py-2 rounded-md bg-black text-white text-sm hover:opacity-90"
          >
            Download PDF
          </button>

          <button
            onClick={() => setShowShare(true)}
            className="px-6 py-2 rounded-md border border-black text-black text-sm hover:bg-gray-100"
          >
            Share
          </button>
        </div>

        {/* APPROVAL ACTIONS */}
        {canApprove && (
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => handleDecision("approved")}
              className="px-6 py-2 rounded-md bg-green-600 text-white text-sm hover:opacity-90"
            >
              Approve
            </button>

            <button
              onClick={() => handleDecision("rejected")}
              className="px-6 py-2 rounded-md bg-red-600 text-white text-sm hover:opacity-90"
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {/* SHARE MODAL */}
      {showShare && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Share Request
            </h3>

            <div className="space-y-4 text-center">
              <input
                readOnly
                value={currentUrl}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />

              <button
                onClick={() => navigator.clipboard.writeText(currentUrl)}
                className="w-full py-2 text-sm rounded-md bg-black text-white hover:opacity-90"
              >
                Copy Link
              </button>

              <div className="flex justify-center pt-2">
                <QRCodeCanvas value={currentUrl} size={140} />
              </div>
            </div>

            <button
              onClick={() => setShowShare(false)}
              className="mt-6 w-full text-sm text-gray-500 hover:text-black"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
