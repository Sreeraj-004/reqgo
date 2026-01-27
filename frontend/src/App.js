import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Registration from "./pages/Registration";
import Dashboard from "./pages/Dashboard";
import StudentDashboard from "./pages/StudentDashboard";
import PrincipalDashboard from "./pages/PrincipalDashboard";
import NewRequestLetter from "./pages/RequestLetter";
import ViewRequest from "./pages/ViewRequest";
import ChatPage from "./pages/ChatPage";
import { useEffect } from "react";

import useNotifications from "./hooks/useNotifications";

function App() {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  // 🔔 GLOBAL WebSocket (works on ALL pages)
  useNotifications(user);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/registration" element={<Registration />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/principal/dashboard" element={<PrincipalDashboard />} />

        <Route path="/NewRequest" element={<NewRequestLetter />} />
        <Route path="/leaves/:id" element={<ViewRequest />} />
        <Route path="/certificate-requests/:id" element={<ViewRequest />} />
        <Route path="/custom-letters/:id" element={<ViewRequest />} />
        <Route path="/messages/new" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
