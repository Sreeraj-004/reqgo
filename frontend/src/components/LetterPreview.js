export default function LetterPreview({ data }) {
  const isApproved = data?.status === "approved";

  return (
    <div
      className="
        w-full max-w-md
        bg-white rounded-2xl shadow-xl
        p-8
        min-h-[420px]
        flex flex-col
      "
    >
      <h2 className="text-lg font-semibold mb-4 text-center">
        Letter
      </h2>

      {!data ? (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400 text-center">
          Start filling the form to preview the letter
        </div>
      ) : (
        <>
          {/* LETTER BODY */}
          <div className="text-sm leading-relaxed space-y-4 flex-1">
            <p>Respected Sir/Madam,</p>

            <p>
              I am <strong>{data.studentName}</strong>
              {data.department && (
                <> from the <strong>{data.department}</strong> department</>
              )}.
            </p>

            {data.type === "Leave Request" && (
              <p>
                I kindly request leave from{" "}
                <strong>{data.fromDate || "____"}</strong> to{" "}
                <strong>{data.toDate || "____"}</strong> due to{" "}
                <strong>{data.reason || "valid reason"}</strong>.
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

          {/* SIGNATURE BLOCK — ONLY IF APPROVED */}
          {isApproved && data.hodSignature && (
            <div className="mt-6 pt-4 border-t text-sm">
              <p className="font-medium text-gray-700 mb-2">
                Approved by
              </p>

              <img
                src={data.hodSignature}
                alt="HOD Signature"
                crossOrigin="anonymous" 
                className="h-12 object-contain mb-1"
              />

              <p className="text-xs text-gray-600">
                {data.hodName}
              </p>
              <p className="text-xs text-gray-500">
                Head of Department
              </p>
            </div>
          )}

          {/* FOOTNOTE */}
          {data.type === "Leave Request" && (
            <div className="mt-4 pt-3 border-t text-xs text-gray-500 space-y-1">
              <p>
                <span className="font-medium text-gray-700">
                  Approval Required:
                </span>{" "}
                HOD
              </p>
              <p>
                <span className="font-medium text-gray-700">
                  Current Status:
                </span>{" "}
                {data.status ? data.status.replace("_", " ") : "Pending"}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
