import React, { useState } from "react";
import { api } from "../api";

export default function NewQuestion({ categorySlug, onCreated }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr(""); setOk("");
    try {
      await api.post("/api/questions", { title, body, categorySlug });
      setTitle(""); setBody("");
      setOk("Question posted!");
      onCreated?.();
    } catch (e) {
      setErr(e?.response?.data?.error || "Could not post question");
    }
  }

  return (
    <form onSubmit={submit}>
      <h3>Ask a question in <span className="mono">{categorySlug}</span></h3>
      <label>Title
        <input value={title} onChange={(e) => { setTitle(e.target.value); setErr(""); setOk(""); }} />
      </label>
      <label>Body
        <textarea rows={3} value={body} onChange={(e) => { setBody(e.target.value); setErr(""); setOk(""); }} />
      </label>
      {err && <div className="error">{err}</div>}
      {ok && <div className="small">{ok}</div>}
      <button type="submit" style={{ marginTop: ".5rem" }}>Post</button>
    </form>
  );
}
