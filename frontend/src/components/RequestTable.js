export default function RequestsTable() {
  return (
    <div className="mt-6 pr-8">
      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Header */}
        

        {/* Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-black rounded text-white">
              <th className="px-6 py-3 font-medium">Sender</th>
              <th className="px-6 py-3 font-medium">Subject</th>
              <th className="px-6 py-3 font-medium">Content</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <Row
              sender="Rahul K"
              subject="Leave Request"
              content="Requesting leave for medical reasons"
              date="12 Aug 2025"
              status="Pending"
            />

            <Row
              sender="Anjali M"
              subject="Bonafide Certificate"
              content="Required for scholarship application"
              date="10 Aug 2025"
              status="Approved"
            />

            <Row
              sender="Suresh P"
              subject="Fee Extension"
              content="Requesting fee payment extension"
              date="08 Aug 2025"
              status="Rejected"
            />

            <Row
              sender="Meera S"
              subject="ID Card Issue"
              content="Lost ID card, requesting replacement"
              date="06 Aug 2025"
              status="Pending"
            />

            <Row
              sender="Arjun V"
              subject="Internship NOC"
              content="Need NOC for internship"
              date="04 Aug 2025"
              status="Approved"
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- ROW ---------- */

function Row({ sender, subject, content, date, status }) {
  const statusStyles = {
    Pending: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
    Approved: "bg-green-50 text-green-700 ring-green-600/20",
    Rejected: "bg-red-50 text-red-700 ring-red-600/20",
  };

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-6 py-4 font-medium text-gray-900">
        {sender}
      </td>

      <td className="px-6 py-4">{subject}</td>

      <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
        {content}
      </td>

      <td className="px-6 py-4 text-gray-500">{date}</td>

      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ring-1 ${statusStyles[status]}`}
        >
          {status}
        </span>
      </td>
    </tr>
  );
}
