import { useNavigate } from "react-router-dom";

export default function ChatBubble({ text, meta, isMe }) {
  const navigate = useNavigate();

  if (meta.type === "route") {
    return (
      <div
        onClick={() => navigate(meta.path)}
        className={`max-w-xs px-4 py-3 rounded-xl cursor-pointer ${
          isMe
            ? "bg-black text-white ml-auto"
            : "bg-white text-black"
        }`}
      >
        <p className="text-sm font-medium">
          {meta.label}
        </p>
        <p className="text-xs opacity-80">
          Tap to view
        </p>
      </div>
    );
  }

  return (
    <div
      className={`max-w-xs px-4 py-2 rounded-xl text-sm ${
        isMe
          ? "bg-black text-white ml-auto"
          : "bg-white text-black"
      }`}
    >
      {text}
    </div>
  );
}
