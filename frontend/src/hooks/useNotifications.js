import { useEffect, useRef } from "react";

export default function useNotifications(user) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    // Prevent duplicate connections
    if (socketRef.current) return;

    const ws = new WebSocket(
      `ws://localhost:8000/ws/notifications?token=${token}`
    );

    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (Notification.permission === "granted") {
          new Notification(data.title || "Notification", {
            body: data.message || "",
          });
        }
      } catch (err) {
        console.error("Invalid WS message", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error", err);
    };

    ws.onclose = () => {
      socketRef.current = null;
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.close();
      socketRef.current = null;
    };
  }, [user]);

  return null;
}
