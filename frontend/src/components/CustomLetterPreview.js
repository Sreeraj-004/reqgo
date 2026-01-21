export default function CustomLetterPreview({ data }) {
  if (!data) {
    return (
      <div
        className="
          w-full max-w-md
          bg-white rounded-2xl shadow-xl
          p-8
          min-h-[420px]
          flex items-center justify-center
          text-sm text-gray-400 text-center
        "
      >
        Start filling the form to preview the letter
      </div>
    );
  }

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
      {/* HEADER */}
      <h2 className="text-lg font-semibold mb-4 text-center">
        Custom Letter
      </h2>

      {/* LETTER BODY */}
      <div className="text-sm leading-relaxed space-y-4 flex-1">
        <p>
          To,
          <br />
          <strong>{data.to || "________"}</strong>
        </p>

        <p>Respected Sir/Madam,</p>

        <p>
        I am <strong>{data.studentName}</strong>
        {data.department
            ? ` from the ${data.department} department`
            : ""}
        .
        </p>


        <p className="whitespace-pre-line">
          {data.customContent ||
            "Your letter content will appear here as you type..."}
        </p>

        <p className="pt-4">
          regards,
          <br />
          Yours sincerely,
          <br />
          <strong>{data.studentName || "________"}</strong>
        </p>
      </div>

      {/* FOOTER */}
      <div className="mt-6 pt-4 border-t text-xs text-gray-500 space-y-1">
        <p>
          <span className="font-medium text-gray-700">
            Addressed To:
          </span>{" "}
          {data.to || "Not selected"}
        </p>
        <p>
          <span className="font-medium text-gray-700">
            Status:
          </span>{" "}
          Draft
        </p>
      </div>
    </div>
  );
}
