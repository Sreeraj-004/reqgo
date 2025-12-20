import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Registration from "./pages/Registration";
import PrincipalDashboard from "./pages/PrincipalDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import NewRequestLetter from "./pages/RequestLetter";
import Dashboard from "./pages/Dashboard";

function App() {
  const isLoggedIn = false; // fake auth for now

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/login" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/principal/dashboard" element={<PrincipalDashboard />} />
        <Route path="/NewRequest" element={<NewRequestLetter />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
