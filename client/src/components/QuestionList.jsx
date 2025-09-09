import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function QuestionList({ categorySlug, refreshKey }) {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [pending, setPending] = useState({}); // per-question answer text

  async function load() {
    setErr("");
    try {
      const { data } = await api.get("/api/questions", { params: { category: categorySlug } });
      setItems(data || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to load questions");
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [categorySlug, refreshKey]);

  async function addAnswer(qid) {
    const body = (pending[qid] || "").trim();
    if (!body) return;
    try {
      await api.post(`/api/questions/${qid}/answers`, { body });
      setPending((p) => ({ ...p, [qid]: "" }));
      await load();
    } catch (e) {
      alert(e?.response?.data?.error || "Could not add answer");
    }
  }

  if (err) return <div className="error">{err}</div>;
  if (!items.length) return <p className="small">No questions yet.</p>;

  return (
    <div>
      {items.map((q) => (
        <div key={q.id} className="card" style={{ background: "#101010", marginBottom: ".75rem" }}>
          <h3>{q.title}</h3>
          <p className="small">By <span className="mono">{q.authorUsername}</span> · <span className="mono">{q.categorySlug}</span></p>
          <p>{q.body}</p>

          <div style={{ marginTop: ".5rem" }}>
            <strong>Answers</strong>
            {!q.answers?.length && <p className="small">No answers yet.</p>}
            {q.answers?.map((a) => (
              <div key={a.id} style={{ borderTop: "1px solid #222", paddingTop: ".5rem", marginTop: ".5rem" }}>
                <p className="small">By <span className="mono">{a.authorUsername}</span></p>
                <p>{a.body}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: ".5rem" }}>
            <label className="small">Add your answer</label>
            <textarea
              rows={2}
              value={pending[q.id] || ""}
              onChange={(e) => setPending((p) => ({ ...p, [q.id]: e.target.value }))}
            />
            <button onClick={() => addAnswer(q.id)} style={{ marginTop: ".5rem" }}>Submit Answer</button>
          </div>
        </div>
      ))}
    </div>
  );
}
