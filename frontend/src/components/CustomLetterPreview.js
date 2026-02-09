export default function CustomLetterPreview({ data }) {
  if (!data) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 min-h-[420px] flex items-center justify-center text-sm text-gray-400 text-center">
        Start filling the form to preview the letter
      </div>
    );
  }
  

  const { student, recipients, to, subject, body, status } = data;

  const designationMap = {
    hod: `Head of Department, ${student?.department || ""}`,
    principal: "Principal",
    vice_principal: "Vice Principal",
  };

const normalizedTo = to
  ?.toLowerCase()
  .replaceAll(" ", "_");

  const toName =
  data?.receiver?.name ||
  recipients?.[normalizedTo]?.name ||
  null;


const designation = designationMap[normalizedTo];





  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 min-h-[420px] flex flex-col">
      <h2 className="text-lg font-semibold mb-4 text-center">
        Custom Letter
      </h2>

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
        {toName && (
          <div className="space-y-1">
            <p className="font-medium">To</p>
            <p className="font-semibold">{toName}</p>
            {student?.college && <p>{student.college}</p>}
          </div>
        )}



        {/* SUBJECT */}
        <p className="font-medium mt-3">
          <span className="text-gray-600 font-extrabold">Sub:</span>{" "}
          {subject || "Custom Letter"}
        </p>


        <p>Respected Sir/Madam,</p>

        {/* BODY */}
        <p className="whitespace-pre-line">
          {body?.content?.length > 0
            ? body.content
            : "Your letter content will appear here as you type..."}

        </p>

        <p className="pt-4">
          Regards,
          <br />
          Yours sincerely,
          <br />
          <strong>{student?.name}</strong>
        </p>
      </div>

      <div className="mt-4 pt-3 border-t text-xs text-gray-500">
        <span className="font-medium text-gray-700">Current Status:</span>{" "}
        {status}
      </div>
    </div>
  );
}
