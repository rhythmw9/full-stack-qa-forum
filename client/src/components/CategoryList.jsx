import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function CategoryList({ selected, onSelect }) {
  const [cats, setCats] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/api/categories");
        if (mounted) setCats(data);
      } catch (e) {
        setErr(e?.response?.data?.error || "Failed to load categories");
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <ul className="list">
      {cats.map((c) => (
        <li key={c.id}>
          <button
            onClick={() => onSelect(c.slug)}
            style={{
              width: "100%",
              textAlign: "left",
              background: selected === c.slug ? "#222" : "#0f0f0f",
              borderColor: selected === c.slug ? "#444" : "#2a2a2a"
            }}
          >
            {c.name}
          </button>
        </li>
      ))}
      {err && <li className="error">{err}</li>}
    </ul>
  );
}
