export default function LetterPreview({ data }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 h-full">
      <h2 className="text-lg font-semibold mb-4 text-center">
        Letter Preview
      </h2>

      <div className="text-sm leading-relaxed space-y-4">
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

        {data.type === "Other" && (
          <p>{data.remarks || "Your message will appear here."}</p>
        )}

        {data.type &&
          data.type !== "Leave Request" &&
          data.type !== "Other" && (
            <p>
              I request you to kindly consider my application regarding{" "}
              <strong>{data.type}</strong>.
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

        <p className="text-xs text-gray-400 pt-2">
          To: {data.to.toUpperCase()}
        </p>
      </div>
    </div>
  );
}
