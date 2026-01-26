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
  const [customContent, setCustomContent] = useState("");
  
  const handleSendMessage = () => {
    if (!data) return;

    let receiverId = null;

    if (user.role === "student") {
      if (requestType === "leave") {
        receiverId = data.hodId;
      }

      else if (requestType === "certificate") {
        if (data.status === "in_progress") {
          receiverId = data.hodId;
        } else if (data.status === "forwarded") {
          receiverId = data.principalId;
        }
      }

      else if (requestType === "custom") {
        receiverId = data.toUserId;
      }
    } else {
      receiverId = data.studentId;
    }

    if (!receiverId) {
      alert("Unable to determine message recipient");
      return;
    }

    navigate(
      `/messages/new?to=${receiverId}`
    );
  };


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
    } else if (requestType === "certificate") {
      apiUrl = `http://localhost:8000/certificate-requests/${id}`;
    } else if (requestType === "custom") {
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
            studentId: resData.student_id,
            hodId: resData.hod_id,

            studentName: resData.student?.name,
            department: resData.student?.department_name,
            fromDate: resData.from_date,
            toDate: resData.to_date,
            reason: resData.reason,
            status: resData.overall_status,
          });
        }

        if (requestType === "certificate") {
          setData({
            type: "Certificate Request",
            studentId: resData.student_id,
            hodId: resData.hod_id,
            principalId: resData.principal_id,

            studentName: resData.student?.name,
            department: resData.student?.department_name,
            certificates: resData.certificates,
            purpose: resData.purpose,
            status: resData.overall_status,
          });
        }


        if (requestType === "custom") {
          setData({
            type: "Custom Letter",

            studentId: resData.student_id,
            toUserId: resData.receiver_id,

            studentName: resData.student?.name,
            department: resData.student?.department_name,

            // ✅ NORMALISED KEYS
            to: resData.to_role,
            content: customContent,     
            status: resData.status,
          });
        }

      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, token, requestType]);

  /* --------------------------------------------------
     Approval permission (FIXED)
  -------------------------------------------------- */
  const actionConfig = (() => {
  if (!data) return null;

  const role = user?.role;

  /* ---------------- LEAVE ---------------- */
  if (requestType === "leave") {
    if (role === "hod" && data.status === "in_progress") {
      return {
        primary: { label: "Approve", action: "approved" },
        secondary: { label: "Reject", action: "rejected" },
      };
    }
    return null;
  }

  /* ---------------- CERTIFICATE ---------------- */
  if (requestType === "certificate" && ["in_progress", "forwarded"].includes(data.status)) {
    if (role === "hod" && data.status === "in_progress") {
      return {
        primary: { label: "Forward", action: "forwarded" },
        secondary: { label: "Reject", action: "rejected" },
      };
    }

    if (role === "principal" && data.status==="forwarded") {
      return {
        primary: { label: "Approve", action: "approved" },
        secondary: { label: "Reject", action: "rejected" },
      };
    }

    return null;
  }

  /* ---------------- CUSTOM LETTER ---------------- */
  if (requestType === "custom") {
    return null;
  }

  return null;
})();

  /* --------------------------------------------------
     Approve / Reject handler
  -------------------------------------------------- */
  const handleDecision = async (action) => {
  let apiUrl = "";
  let payload = {};

  /* ---------------- LEAVE ---------------- */
  if (requestType === "leave") {
    if (action === "approved") {
      apiUrl = `http://localhost:8000/leaves/${id}/approve`;
    } else if (action === "rejected") {
      apiUrl = `http://localhost:8000/leaves/${id}/reject`;
    }
  }

  /* ---------------- CERTIFICATE ---------------- */
  else if (requestType === "certificate") {
    if (action === "forwarded") {
      apiUrl = `http://localhost:8000/certificate-requests/${id}/forward`;
    } else if (action === "rejected") {
      apiUrl = `http://localhost:8000/certificate-requests/${id}/reject`;
    } else if (action === "approved") {
      apiUrl = `http://localhost:8000/certificate-requests/${id}/approve`;
    }
  }

  /* ---------------- CUSTOM LETTER ---------------- */
  else if (requestType === "custom") {
    apiUrl = `http://localhost:8000/custom-letters/${id}/decision`;
    payload = { status: action };
  }

  if (!apiUrl) {
    alert("Invalid action");
    return;
  }

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: Object.keys(payload).length ? JSON.stringify(payload) : null,
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
      <div className="max-w-3xl mx-auto text-center mb-6">
        <h1 className="text-3xl font-semibold">{data.type}</h1>
        <p className="text-sm text-gray-600 mt-1">
          {data.studentName} • {data.department}
        </p>
      </div>

      <div className="max-w-3xl mx-auto flex items-center flex-col">
        <div ref={previewRef}>
          {requestType === "leave" && <LetterPreview data={data} />}
          {requestType === "certificate" && <CertificatePreview data={data} />}
          {requestType === "custom" && <CustomLetterPreview data={data} />}
        </div>
        {/* ACTION BAR */}
<div className="w-full max-w-3xl mt-10 sticky top-4 z-30">
  <div className="flex items-center justify-between bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3">

    {/* LEFT: DOWNLOAD + SHARE */}
    <div className="flex gap-2">
      <button
        onClick={downloadPDF}
        className="px-4 py-2 rounded-md bg-black text-white text-xs hover:opacity-90"
      >
        Download PDF
      </button>

      <button
        onClick={() => setShowShare(true)}
        className="px-4 py-2 rounded-md border border-black text-black text-xs hover:bg-gray-100"
      >
        Share
      </button>
    </div>

    {/* CENTER: ACTIONS */}
{actionConfig && (
  <div className="flex gap-3">
    {actionConfig.secondary && (
      <button
        onClick={() => handleDecision(actionConfig.secondary.action)}
        className="px-5 py-2 rounded-md bg-red-700 text-white text-sm hover:opacity-90"
      >
        {actionConfig.secondary.label}
      </button>
    )}

    <button
      onClick={() => handleDecision(actionConfig.primary.action)}
      className="px-5 py-2 rounded-md bg-green-700 text-white text-sm hover:opacity-90"
    >
      {actionConfig.primary.label}
    </button>
  </div>
)}


    {/* RIGHT: MESSAGE */}
    <div>
      <button
        onClick={handleSendMessage}
        className="px-4 py-2 rounded-md border border-black text-black text-xs hover:bg-gray-100"
      >
        Send Message
      </button>
    </div>

  </div>
</div>

        
      </div>

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
