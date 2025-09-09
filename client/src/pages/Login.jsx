import React, { useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login({ goRegister, goDashboard }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      // let the server accept either email or username
      const body = identifier.includes("@")
        ? { email: identifier, password }
        : { username: identifier, password };
      const { data } = await api.post("/api/auth/login", body);
      login(data.token, data.user);
      goDashboard();
    } catch (e) {
      setErr(e?.response?.data?.error || "Login failed");
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: "3rem auto" }}>
      <h1>Fairway Forum</h1>
      <p className="small">Sign in to ask and answer golf questions.</p>
      <form onSubmit={onSubmit}>
        <label> Email or Username
          <input value={identifier} onChange={(e) => { setIdentifier(e.target.value); setErr(""); }} placeholder="r@example.com or rhythm" />
        </label>
        <label> Password
          <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setErr(""); }} placeholder="••••••••" />
        </label>
        {err && <div className="error">{err}</div>}
        <button type="submit" style={{ marginTop: ".5rem" }}>Login</button>
      </form>
      <p className="small" style={{ marginTop: ".75rem" }}>
        No account?{" "}
        <button type="button" onClick={goRegister} style={{ background: "transparent", border: "0", textDecoration: "underline" }}>
          Register
        </button>
      </p>
    </div>
  );
}
