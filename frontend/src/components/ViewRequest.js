export default function ViewRequest({ request, onBack }) {
  if (!request) return null;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 text-sm text-blue-600 hover:underline"
      >
        ← Back to Requests
      </button>

      <div className="bg-white border rounded-xl p-6 shadow">
        <h2 className="text-2xl font-bold mb-4">
          {request.subject}
        </h2>

        <p className="text-gray-600 mb-2">
          <strong>From:</strong> {request.sender}
        </p>

        <p className="text-gray-600 mb-2">
          <strong>Type:</strong> {request.type}
        </p>

        <p className="text-gray-600 mb-4">
          <strong>Date:</strong> {request.date}
        </p>

        <div className="bg-gray-50 p-4 rounded-lg text-gray-800">
          {request.content}
        </div>
      </div>
    </div>
  );
}
