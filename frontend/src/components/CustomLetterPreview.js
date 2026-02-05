export default function CustomLetterPreview({ data }) {
  if (!data) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 min-h-[420px] flex items-center justify-center text-sm text-gray-400 text-center">
        Start filling the form to preview the letter
      </div>
    );
  }

  const recipientMap = {
    HOD: {
      name: data.recipients?.hod?.name,
      designation: `Head of Department, ${data.department}`,
    },
    Principal: {
      name: data.recipients?.principal?.name,
      designation: "Principal",
    },
    "Vice Principal": {
      name: data.recipients?.vice_principal?.name,
      designation: "Vice Principal",
    },
  };

  const recipient = recipientMap[data.to];

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 min-h-[420px] flex flex-col">
      <h2 className="text-lg font-semibold mb-4 text-center">
        Custom Letter
      </h2>

      <div className="text-sm leading-relaxed space-y-4 flex-1">
        <div className="text-sm space-y-1 mb-4">
          <p className="font-medium">To</p>

          <p className="font-semibold">
            {recipient?.name || "________"}
          </p>

          <p>{recipient?.designation}</p>

          <p>{data.college}</p>

          <p className="text-xs text-gray-500 pt-2">
            {new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        {data.sub && (
              <p className="font-medium mt-2">
                <span className="text-gray-600">Sub:</span> {data.sub}
              </p>
            )}

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
          Regards,
          <br />
          Yours sincerely,
          <br />
          <strong>{data.studentName}</strong>
        </p>
      </div>

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
