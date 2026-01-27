export default function CertificatePreview({ data }) {
  if (!data) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 min-h-[420px] flex items-center justify-center text-sm text-gray-400 text-center">
        Start filling the form to preview the request
      </div>
    );
  }

  const showHodSign = ["forwarded", "approved"].includes(data.status);
  const showPrincipalSign = data.status === "approved";

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 min-h-[420px] flex flex-col">
      <h2 className="text-lg font-semibold mb-4 text-center">
        Certificate Request
      </h2>

      {/* BODY */}
      <div className="text-sm leading-relaxed space-y-4 flex-1">
        <p>Respected Sir/Madam,</p>

        <p>
          I am <strong>{data.studentName}</strong>
          {data.department && (
            <> from the <strong>{data.department}</strong> department</>
          )}.
        </p>

        <p>I kindly request the issuance of the following certificate(s):</p>

        <ul className="list-disc ml-6 space-y-1">
          {data.certificates.map((cert, index) => (
            <li key={index}>
              <strong>{cert}</strong>
            </li>
          ))}
        </ul>

        {data.certificatePurpose && (
          <p>
            The above certificate(s) are required for{" "}
            <strong>{data.certificatePurpose}</strong>.
          </p>
        )}

        <p>I shall be very grateful for your kind consideration.</p>

        <p className="pt-4">
          Thanking you,
          <br />
          Yours sincerely,
          <br />
          <strong>{data.studentName}</strong>
        </p>
      </div>

      {/* SIGNATURES */}
      {(showHodSign || showPrincipalSign) && (
        <div className="mt-6 pt-4 border-t text-sm space-y-6">
          {showHodSign && data.hodSignature && (
            <div>
              <p className="font-medium text-gray-700 mb-1">Approved by</p>
              <img
                src={data.hodSignature}
                crossOrigin="anonymous"
                alt="HOD Signature"
                className="h-12 object-contain"
              />
              <p className="text-xs text-gray-600">{data.hodName}</p>
              <p className="text-xs text-gray-500">Head of Department</p>
            </div>
          )}

          {showPrincipalSign && data.principalSignature && (
            <div>
              <p className="font-medium text-gray-700 mb-1">Approved by</p>
              <img
                src={data.principalSignature}
                crossOrigin="anonymous"
                alt="Principal Signature"
                className="h-12 object-contain"
              />
              <p className="text-xs text-gray-600">{data.principalName}</p>
              <p className="text-xs text-gray-500">Principal</p>
            </div>
          )}
        </div>
      )}

      {/* FOOTNOTE */}
      <div className="mt-4 pt-3 border-t text-xs text-gray-500 space-y-1">
        <p>
          <span className="font-medium text-gray-700">Approval Flow:</span>{" "}
          HOD → Principal
        </p>
        <p>
          <span className="font-medium text-gray-700">Current Status:</span>{" "}
          {(data.status || data.overall_status || "")
            .replace("_", " ")}
        </p>
      </div>
    </div>
  );
}
