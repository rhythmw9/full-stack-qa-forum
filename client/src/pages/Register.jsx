import React, { useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Register({ goLogin, goDashboard }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await api.post("/api/auth/register", { username, email, password });
      login(data.token, data.user);
      goDashboard();
    } catch (e) {
      setErr(e?.response?.data?.error || "Registration failed");
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: "3rem auto" }}>
      <h1>Create account</h1>
      <form onSubmit={onSubmit}>
        <label> Username
          <input value={username} onChange={(e) => { setUsername(e.target.value); setErr(""); }} placeholder="rhythm" />
        </label>
        <label> Email
          <input value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} placeholder="r@example.com" />
        </label>
        <label> Password
          <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setErr(""); }} placeholder="min 6 chars" />
        </label>
        {err && <div className="error">{err}</div>}
        <button type="submit" style={{ marginTop: ".5rem" }}>Register</button>
      </form>
      <p className="small" style={{ marginTop: ".75rem" }}>
        Already have an account?{" "}
        <button type="button" onClick={goLogin} style={{ background: "transparent", border: 0, textDecoration: "underline" }}>
          Login
        </button>
      </p>
    </div>
  );
}
