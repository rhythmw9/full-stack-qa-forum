import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function Shell() {
  const { user } = useAuth();
  const [view, setView] = useState(user ? "dashboard" : "login");

  // If user logs in later from Login/Register; auto-switch inside those pages.
  return (
    <div className="container">
      {view === "login" && <Login goRegister={() => setView("register")} goDashboard={() => setView("dashboard")} />}
      {view === "register" && <Register goLogin={() => setView("login")} goDashboard={() => setView("dashboard")} />}
      {view === "dashboard" && <Dashboard goLogin={() => setView("login")} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}

