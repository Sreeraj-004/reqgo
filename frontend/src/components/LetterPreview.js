export default function LetterPreview({ data }) {
  if (!data) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 min-h-[420px] flex items-center justify-center text-sm text-gray-400 text-center">
        Start filling the form to preview the letter
      </div>
    );
  }

  /* --------------------------------------------------
     HYBRID NORMALIZATION LAYER
  -------------------------------------------------- */

  // NEW (ViewRequest) shape
  const student =
    data.student ||
    (data.studentName
      ? {
          name: data.studentName,
          department: data.department,
          college: data.college,
        }
      : null);

  const recipient =
    data.recipient ||
    (data.recipients?.hod
      ? {
          name: data.recipients.hod.name,
          designation: `Head of Department, ${student?.department || ""}`,
        }
      : null);

  const subject = data.subject ?? null;

  const body =
    data.body ||
    (data.fromDate
      ? {
          fromDate: data.fromDate,
          toDate: data.toDate,
          reason: data.reason,
        }
      : null);

  const status = data.status || "in_progress";

  const signature = data.signature || null;

  const isApproved = status === "approved";

  /* --------------------------------------------------
     RENDER
  -------------------------------------------------- */

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 min-h-[420px] flex flex-col">
      <h2 className="text-lg font-semibold mb-4 text-center">Letter</h2>

      {/* BODY */}
      <div className="text-sm leading-relaxed space-y-4 flex-1">
        {/* FROM */}
        {student && (
          <div className="space-y-1">
            <p className="font-medium">From</p>
            <p className="font-semibold">{student.name}</p>
            {student.department && <p>{student.department} Department</p>}
            {student.college && <p>{student.college}</p>}
          </div>
        )}

        {/* DATE */}
        <p className="text-xs text-gray-500">
          {new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>

        {/* TO */}
        {recipient && (
          <div className="space-y-1">
            <p className="font-medium">To</p>
            <p className="font-semibold">{recipient.name}</p>
            {recipient.designation && <p>{recipient.designation}</p>}
            {student.college && <p>{student.college}</p>}
          </div>
        )}

        {/* SUBJECT */}
        {subject && (
          <p className="font-medium mt-3">
            <span className="text-gray-600 font-extrabold">Sub:</span>{" "}
            {subject}
          </p>
        )}

        <p className="mt-2">Respected Sir/Madam,</p>

        {student && (
          <p>
            I am <strong>{student.name}</strong>
            {student.department && (
              <> from the <strong>{student.department}</strong> department</>
            )}
            .
          </p>
        )}

        {/* LEAVE BODY */}
        {body?.fromDate && (
          <p>
            I kindly request leave from{" "}
            <strong>{body.fromDate}</strong> to{" "}
            <strong>{body.toDate || "____"}</strong> due to{" "}
            <strong>{body.reason || "valid reason"}</strong>.
          </p>
        )}

        <p>I shall be very grateful for your kind consideration.</p>

        {student && (
          <p className="pt-4">
            Thanking you,
            <br />
            Yours sincerely,
            <br />
            <strong>{student.name}</strong>
          </p>
        )}
      </div>

      {/* SIGNATURE */}
      {isApproved && signature && (
        <div className="mt-6 pt-4 border-t text-sm">
          {signature.image && (
            <img
              src={signature.image}
              alt="Signature"
              crossOrigin="anonymous"
              className="h-12 object-contain mb-1"
            />
          )}

          <p className="text-xs text-gray-600">{signature.name}</p>
          <p className="text-xs text-gray-500">{signature.designation}</p>

          {signature.approvedAt && (
            <p className="text-[11px] text-gray-400 mt-1">
              {new Date(signature.approvedAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      )}

      {/* FOOTNOTE */}
      <div className="mt-4 pt-3 border-t text-xs text-gray-500">
        <span className="font-medium text-gray-700">Current Status:</span>{" "}
        {status.replace("_", " ")}
      </div>
    </div>
  );
}
