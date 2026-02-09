import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import LetterPreview from "../components/LetterPreview";
import CertificatePreview from "../components/CertificatePreview";
import CustomLetterPreview from "../components/CustomLetterPreview";
import html2pdf from "html2pdf.js";
import { QRCodeCanvas } from "qrcode.react";
import ArrangeDocumentsModal from "../components/ArrangeDocumentsModal";
import CertificateDeliveryDetailsModal
  from "../components/CertificateDeliveryDetailsModal";



export default function ViewRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [showArrangeModal, setShowArrangeModal] = useState(false);
  const [showDeliveryDetails, setShowDeliveryDetails] = useState(false);



  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  console.log("Current user:", user);

  const previewRef = useRef(null);

  const [data, setData] = useState(null);
  const [requestType, setRequestType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showShare, setShowShare] = useState(false);
  const [customContent, setCustomContent] = useState("");

  const studentName =
  data?.student?.name ||
  data?.studentName ||
  "request";
  const filename = `${studentName}_${requestType}_request.pdf`;
  const normalizePath = (p) => p?.replaceAll("\\", "/");


  
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
        } else if (data.status === "forwarded_to_vp") {
          receiverId = data.vpId;
        } else if (data.status === "forwarded_to_principal") {
          receiverId = data.principalId;
        } else if (data.status === "approved" || data.status === "collected" || data.status === "delivery_initiated") {
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

      student: {
        name: resData.student?.name,
        department: resData.student?.department_name,
        college: resData.student?.college_name,
      },

      recipient: {
        name: resData.hod?.name || "HOD",
        designation: `Head of Department, ${resData.student?.department_name}`,
      },

      subject: resData.subject || "Leave Request",

      body: {
        fromDate: resData.from_date,
        toDate: resData.to_date,
        reason: resData.reason,
        subject: resData.subject,
      },

      status: resData.overall_status,

      signature:
        resData.overall_status === "approved"
          ? {
              name: resData.hod?.name,
              designation: "Head of Department",
              approvedAt: resData.updated_at,
              image: resData.hod?.signature_path
                ? `http://localhost:8000/${resData.hod.signature_path}`
                : null,
            }
          : null,
    });
  }


        if (requestType === "certificate") {
          setData({
            type: "Certificate Request",

            studentId: resData.student_id,
            hodId: resData.hod_id,
            principalId: resData.principal_id,
            vpId: resData.vp_id,

            student: {
              name: resData.student?.name,
              department: resData.student?.department_name,
              college: resData.student?.college_name,
            },

            recipients: {
              hod: resData.hod
                ? { name: resData.hod.name }
                : null,
              vice_principal: resData.vp
                ? { name: resData.vp.name }
                : null,
              principal: resData.principal
                ? { name: resData.principal.name }
                : null,
            },

            subject: resData.subject || "Certificate Request",

            certificates: Array.isArray(resData.certificates)
              ? resData.certificates
              : typeof resData.certificates === "string"
                ? resData.certificates.split(",").map(c => c.trim())
                : [],

            certificatePurpose: resData.purpose || "",

            status: resData.overall_status,

            signatures: {
              hod:
                ["forwarded_to_vp", "forwarded_to_principal", "approved","collected","delivery_initiated"].includes(resData.overall_status)

                  ? {
                      name: resData.hod?.name || "HOD",
                      designation: `HOD, ${resData.student?.department_name}`,
                      approvedAt: resData.hod_updated_at || null,
                      image: resData.hod?.signature_path
                        ? `http://localhost:8000/${resData.hod.signature_path}`
                        : null,
                    }
                  : null,
              vp:
                ["forwarded_to_principal", "approved","collected","delivery_initiated"].includes(resData.overall_status)
                  ? {
                      name: resData.vp?.name || "Vice Principal",
                      designation: "Vice Principal",
                      approvedAt: resData.vp_updated_at || null,
                      image: resData.vp?.signature_path
                        ? `http://localhost:8000/${resData.vp.signature_path}`
                        : null,
                    }
                  : null,


              principal:
                ["approved","collected","delivery_initiated"].includes(resData.overall_status)
                  ? {
                      name: resData.principal?.name || "Principal",
                      designation: "Principal",
                      approvedAt: resData.principal_updated_at || null,
                      image: resData.principal?.signature_path
                        ? `http://localhost:8000/${resData.principal.signature_path}`
                        : null,
                    }
                  : null,
            },
          });
        }


        if (requestType === "custom") {
          setData({
            type: "Custom Letter",

            studentId: resData.student_id,
            toUserId: resData.receiver_id,

            student: {
              name: resData.student?.name,
              department: resData.student?.department,
              college: resData.student?.college,
            },

            // ✅ DIRECT receiver
            receiver: {
              name: resData.receiver?.name,
              role: resData.receiver?.role,
            },

            subject: resData.subject || "Custom Letter",

            body: {
              content: resData.content,
            },

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
  if (
      requestType === "certificate" &&
      ["in_progress", "forwarded_to_vp", "forwarded_to_principal"].includes(data.status)
    ) {

    if (role === "hod" && data.status === "in_progress") {
      return {
        primary: { label: "Forward to VP", action: "forwarded" },
        secondary: { label: "Reject", action: "rejected" },
      };
    }

    if (role === "vice_principal" && data.status === "forwarded_to_vp") {
      return {
        primary: { label: "Forward to Principal", action: "forwarded" },
        secondary: { label: "Reject", action: "rejected" },
      };
    }

    if (role === "principal" && data.status === "forwarded_to_principal") {
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
        html2canvas: {
          scale: 2,
          useCORS: true,       
          allowTaint: true,   
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 px-6 py-6">
      <div className="absolute -top-32 -left-32 h-96 w-96 bg-yellow-300 rounded-full blur-3xl opacity-30" />
    <div className="absolute top-1/3 -right-32 h-96 w-96 bg-amber-400 rounded-full blur-3xl opacity-30" />
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
        className="px-4 py-2 rounded-md bg-primary-gradient text-black text-xs hover:opacity-90"
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
    {user?.role === "superintendent" && requestType === "certificate" && data.status === "approved" && (
      <button
        onClick={() => setShowArrangeModal(true)}
        className="px-4 py-2 rounded-md bg-primary-gradient text-black text-xs hover:opacity-90"
      >
        Delivery
      </button>
    )}
    {["student", "superintendent"].includes(user?.role) &&
    requestType === "certificate" &&
    data.status === "delivery_initiated" && (
      <button
        onClick={() => setShowDeliveryDetails(true)}
        className="px-4 py-2 rounded-md bg-primary-gradient text-black text-xs hover:opacity-90"
      >
        Delivery Details
      </button>
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
                className="w-full py-2 text-sm rounded-md bg-primary-gradient text-black hover:opacity-90"
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
      <ArrangeDocumentsModal
        open={showArrangeModal}
        onClose={() => setShowArrangeModal(false)}
        studentName={studentName}
        certificateRequestId={id}
      />

      <CertificateDeliveryDetailsModal
          open={showDeliveryDetails}
          onClose={() => setShowDeliveryDetails(false)}
          certificateRequestId={id}
        />


    </div>
  );
}
