import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import LetterPreview from "../components/LetterPreview";
import CertificatePreview from "../components/CertificatePreview";
import CustomLetterPreview from "../components/CustomLetterPreview";

export default function VerifyRequest() {
  const { letter_type, id } = useParams();
  const previewRef = useRef(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizePath = (p) => p?.replaceAll("\\", "/");

  useEffect(() => {
    if (!letter_type || !id) return;

    fetch(`http://localhost:8000/verify/${letter_type}/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Invalid or tampered document");
        }
        return res.json();
      })
      .then((resData) => {

        if (resData.type === "leave") {
          setData({
            type: "Leave Request",
            student: resData.student,
            body: resData.body,
            status: resData.status,
            signature: resData.signature
              ? {
                  name: resData.signature.name,
                  designation: resData.signature.designation,
                  approvedAt: resData.signature.approved_at,
                  image: resData.signature.signature_path
                    ? `http://localhost:8000/${normalizePath(
                        resData.signature.signature_path
                      )}`
                    : null,
                }
              : null,
          });
        }
        if (resData.type === "custom") {
          setData({
            type: "Custom Letter",
            student: resData.student,
            receiver: resData.receiver,
            subject: resData.subject,
            body: { content: resData.content },
            status: resData.status,

            signature: resData.signature
              ? {
                  name: resData.signature.name,
                  designation: resData.signature.designation,
                  approvedAt: resData.signature.approved_at,
                  image: resData.signature.signature_path
                    ? `http://localhost:8000/${normalizePath(
                        resData.signature.signature_path
                      )}`
                    : null,
                }
              : null,
          });
        }

        if (resData.type === "certificate") {
        setData({
          type: "Certificate Request",

          student: resData.student,

          certificates: Array.isArray(resData.certificates)
            ? resData.certificates
            : typeof resData.certificates === "string"
              ? resData.certificates.split(",").map(c => c.trim())
              : [],

          certificatePurpose: resData.purpose || "",

          status: resData.status,

          signatures: {
            hod: resData.signatures?.hod
              ? {
                  name: resData.signatures.hod.name,
                  designation: "Head of Department",
                  approvedAt: resData.signatures.hod.acted_at,
                  image: resData.signatures.hod.signature_path
                    ? `http://localhost:8000/${normalizePath(
                        resData.signatures.hod.signature_path
                      )}`
                    : null,
                }
              : null,

            vp: resData.signatures?.vp
              ? {
                  name: resData.signatures.vp.name,
                  designation: "Vice Principal",
                  approvedAt: resData.signatures.vp.acted_at,
                  image: resData.signatures.vp.signature_path
                    ? `http://localhost:8000/${normalizePath(
                        resData.signatures.vp.signature_path
                      )}`
                    : null,
                }
              : null,

            principal: resData.signatures?.principal
              ? {
                  name: resData.signatures.principal.name,
                  designation: "Principal",
                  approvedAt: resData.signatures.principal.acted_at,
                  image: resData.signatures.principal.signature_path
                    ? `http://localhost:8000/${normalizePath(
                        resData.signatures.principal.signature_path
                      )}`
                    : null,
                }
              : null,
          },
        });
      }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [letter_type, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Verifying document...
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 px-6 py-6">
      <div className="absolute -top-32 -left-32 h-96 w-96 bg-yellow-300 rounded-full blur-3xl opacity-30" />
      <div className="absolute top-1/3 -right-32 h-96 w-96 bg-amber-400 rounded-full blur-3xl opacity-30" />

      <div className="max-w-3xl mx-auto text-center mb-6">
        <h1 className="text-3xl font-semibold">
          Document Verification
        </h1>
        <p className="text-2xl font-bold text-green-500 mt-1">
          Verified
        </p>
      </div>

      <div className="max-w-3xl mx-auto flex justify-center">
        <div ref={previewRef}>
          {letter_type === "leave" && <LetterPreview data={data} />}
          {letter_type === "certificate" && <CertificatePreview data={data} />}
          {letter_type === "custom" && <CustomLetterPreview data={data} />}
        </div>
      </div>
    </div>
  );
}