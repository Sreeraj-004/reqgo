export default function CertificatePreview({ data }) {
  if (!data) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 min-h-[420px] flex items-center justify-center text-sm text-gray-400 text-center">
        Start filling the form to preview the request
      </div>
    );
  }

  /* --------------------------------------------------
     HYBRID NORMALIZATION LAYER
  -------------------------------------------------- */

  const student =
    data.student ||
    (data.studentName
      ? {
          name: data.studentName,
          department: data.department,
          college: data.college,
        }
      : null);

  const recipients = data.recipients || {};



  const subject = data.subject || data.sub || null;

  const certificates = Array.isArray(data.certificates)
    ? data.certificates
    : [];

  const certificatePurpose = data.certificatePurpose || "";

  const status = data.status || "in_progress";

  const signatures = data.signatures || {};

  const hodSignature = signatures.hod || null;
  const vpSignature = signatures.vp || null;
  const principalSignature = signatures.principal || null;


  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 min-h-[420px] flex flex-col">
      <h2 className="text-lg font-semibold mb-3 text-center">
        Certificate Request
      </h2>

      {/* BODY */}
      <div className="text-sm leading-relaxed space-y-3 flex-1">

        {/* FROM */}
        <div className="space-y-1">
          <p className="font-medium">From</p>
          <p className="font-semibold">{student?.name}
</p>
          <p>{student?.department} Department</p>
          <p>{student?.college}</p>
        </div>

        {/* DATE */}
        <p className="text-xs text-gray-500">
          {new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>

        {/* TO */}
        <div className="space-y-2">
          <p className="font-medium">To</p>

          {data.recipients?.hod && (
            <div>
              <p className="font-semibold">{data.recipients.hod.name}</p>
              <p>Head of Department {student?.department}</p>
              <p>{student?.college}</p>
            </div>
          )}

          {data.recipients?.vice_principal && (
            <div className="pt-1">
              <p className="font-semibold">{data.recipients.vice_principal.name}</p>
              <p>Vice Principal</p>
              <p>{student?.college}</p>
            </div>
          )}

          {data.recipients?.principal && (
            <div className="pt-1">
              <p className="font-semibold">{data.recipients.principal.name}</p>
              <p>Principal</p>
              <p>{student?.college}</p>
            </div>
          )}
        </div>


        {/* SUBJECT */}
        {subject && (
          <p className="font-medium mt-2 border-t pt-2">
            <span className="text-gray-600 font-extrabold">Sub:</span> {subject}
          </p>
        )}


        <p>Respected Sir/Madam,</p>

        <p>
          I am <strong>{student?.name}
</strong> from the{" "}
          <strong>{student?.department}</strong> department.
        </p>

        <p>I kindly request the issuance of the following certificate(s):</p>

        {certificates.length > 0 && (
          <ul className="list-disc ml-5 space-y-0.5">
            {certificates.map((cert, index) => (
              <li key={index}>
                <strong>{cert}</strong>
              </li>
            ))}
          </ul>
        )}


        {certificatePurpose && (
            <p>
              The above certificate(s) are required for{" "}
              <strong>{certificatePurpose}</strong>.
            </p>
          )}


        <p>I shall be very grateful for your kind consideration.</p>

        <p className="pt-2">
          Thanking you,
          <br />
          Yours sincerely,
          <br />
          <strong>{student?.name}
</strong>
        </p>
      </div>

      {/* SIGNATURES */}
      {(hodSignature || principalSignature) && (
        <div className="mt-4 pt-3 border-t text-sm">
          <p className="font-medium text-gray-700 mb-3 text-center">
            Approved by
          </p>

          <div className="flex justify-around items-start gap-6">

            {/* HOD SIGNATURE */}
            {hodSignature && (
              <div className="flex flex-col items-center text-center">
                {hodSignature.image && (
                  <img
                    src={hodSignature.image}
                    crossOrigin="anonymous"
                    alt="HOD Signature"
                    className="h-10 object-contain mb-1"
                  />
                )}
                <p className="text-xs text-gray-600 font-medium">
                  {hodSignature.name}
                </p>
                <p className="text-xs text-gray-500">
                  {hodSignature.designation}
                </p>
                {hodSignature.approvedAt && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    {new Date(hodSignature.approvedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            )}

            {/* VP SIGNATURE */}
            {vpSignature && (
              <div className="flex flex-col items-center text-center">
                {vpSignature.image && (
                  <img
                    src={vpSignature.image}
                    crossOrigin="anonymous"
                    alt="Vice Principal Signature"
                    className="h-10 object-contain mb-1"
                  />
                )}
                <p className="text-xs text-gray-600 font-medium">
                  {vpSignature.name}
                </p>
                <p className="text-xs text-gray-500">
                  {vpSignature.designation}
                </p>
                {vpSignature.approvedAt && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    {new Date(vpSignature.approvedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            )}


            {/* PRINCIPAL SIGNATURE */}
            {principalSignature && (
              <div className="flex flex-col items-center text-center">
                {principalSignature.image && (
                  <img
                    src={principalSignature.image}
                    crossOrigin="anonymous"
                    alt="Principal Signature"
                    className="h-10 object-contain mb-1"
                  />
                )}
                <p className="text-xs text-gray-600 font-medium">
                  {principalSignature.name}
                </p>
                <p className="text-xs text-gray-500">
                  {principalSignature.designation}
                </p>
                {principalSignature.approvedAt && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    {new Date(principalSignature.approvedAt).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </p>
                )}
              </div>
            )}

          </div>
        </div>
      )}


      {/* FOOTNOTE */}
      <div className="mt-3 pt-2 border-t text-xs text-gray-500 space-y-0.5">
        <p>
          <span className="font-medium text-gray-700">Approval Flow:</span>{" "}
          HOD → Vice Principal → Principal
        </p>
        <p>
          <span className="font-medium text-gray-700">Current Status:</span>{" "}
          {data.status.replaceAll("_", " ")}
        </p>
      </div>
    </div>
  );
}
