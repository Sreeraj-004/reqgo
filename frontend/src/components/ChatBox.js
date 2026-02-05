import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ChatBubble from "./ChatBubble";

export default function ChatBox() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const receiverId = searchParams.get("to");
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const getMessageMeta = (content) => {
  if (!content.startsWith("/")) {
    return { type: "text" };
  }

  const parts = content.split("/").filter(Boolean);
  if (parts.length !== 2) {
    return { type: "text" };
  }

  const [resource, id] = parts;

  const routeMap = {
    "leaves": {
      label: "Leave Request",
      path: "/leaves",
    },
    "certificate": {
      label: "Certificate Request",
      path: "/certificate",
    },
    "certificate-requests": {
      label: "Certificate Request",
      path: "/certificate-requests",
    },
    "custom-letters": {
      label: "Custom Letter",
      path: "/custom-letters",
    },
  };

  if (!routeMap[resource]) {
    return { type: "text" };
  }

  return {
    type: "route",
    label: routeMap[resource].label,
    path: `${routeMap[resource].path}/${id}`,
  };
};


  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  /* ---------------- LOAD MESSAGES ---------------- */
  useEffect(() => {
    if (!receiverId) return;

    fetch(`http://localhost:8000/messages/${receiverId}`, {
        headers: {
        Authorization: `Bearer ${token}`,
        },
    })
        .then((res) => res.json())
        .then((data) => {
        if (Array.isArray(data)) {
            setMessages(data);
        } else {
            setMessages([]);
        }
        })
        .catch((err) => {
        console.error("Failed to load messages", err);
        setMessages([]);
        });
    }, [receiverId, token]);


  /* ---------------- SEND MESSAGE ---------------- */
  const handleSend = async () => {
    if (!input.trim()) return;

    const tempMessage = {
      id: Date.now(),
      sender_id: user.id,
      content: input,
    };

    // Optimistic UI
    setMessages((prev) => [...prev, tempMessage]);
    setInput("");

    try {
      const res = await fetch("http://localhost:8000/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver_id: receiverId,
          content: tempMessage.content,
        }),
      });

      if (!res.ok) {
        throw new Error("Message send failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg h-[75vh] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="border-b px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-sm font-medium">
            ←
          </button>
          <p className="font-semibold text-sm">Conversation</p>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.length === 0 && (
            <p className="text-center text-xs text-gray-400">
              No messages yet
            </p>
          )}

          {Array.isArray(messages) &&
            messages.map((msg) => {
                const meta = getMessageMeta(msg.content);

                return (
                <ChatBubble
                    key={msg.id}
                    text={msg.content}
                    meta={meta}
                    isMe={msg.sender_id === user.id}
                />
                );
            })}



        </div>

        {/* INPUT */}
        <div className="border-t p-3 bg-white flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message"
            className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
          <button
            onClick={handleSend}
            className="bg-primary-gradient text-black px-4 py-2 rounded-full text-sm"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}
