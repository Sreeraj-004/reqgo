export default function NormalRequestsTable() {
  return (
    <div className="mt-6 pr-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-black text-white">
              <th className="px-6 py-3">Sender</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Subject</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">View Request</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td
                colSpan="5"
                className="px-6 py-6 text-center text-gray-500"
              >
                No requests
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
