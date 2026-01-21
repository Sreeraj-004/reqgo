export default function CertificatePreview({ data }) {
  if (!data) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 min-h-[420px] flex items-center justify-center text-sm text-gray-400 text-center">
        Start filling the form to preview the request
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 min-h-[420px] flex flex-col">
      <h2 className="text-lg font-semibold mb-4 text-center">
        Certificate Request
      </h2>

      {/* LETTER BODY */}
      <div className="text-sm leading-relaxed space-y-4 flex-1">
        <p>Respected Sir/Madam,</p>

        <p>
          I am <strong>{data.studentName}</strong>
          {data.department && (
            <> from the <strong>{data.department}</strong> department</>
          )}.
        </p>

        <p>
          I kindly request the issuance of the following certificate
          {data.certificates.length > 1 ? "s" : ""}:
        </p>

        <ul className="list-disc ml-6 space-y-1">
          {data.certificates.map((cert, index) => (
            <li key={index}>
              <strong>{cert || "Certificate name"}</strong>
            </li>
          ))}
        </ul>

        {data.certificatePurpose && (
          <p>
            The above certificate{data.certificates.length > 1 ? "s are" : " is"} required for{" "}
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

      {/* FOOTNOTE */}
      <div className="mt-6 pt-4 border-t text-xs text-gray-500 space-y-1">
        <p>
          <span className="font-medium text-gray-700">
            Approval Required:
          </span>{" "}
          HOD → Principal
        </p>
        <p>
          <span className="font-medium text-gray-700">
            Current Status:
          </span>{" "}
          Pending (HOD Review)
        </p>
      </div>
    </div>
  );
}
