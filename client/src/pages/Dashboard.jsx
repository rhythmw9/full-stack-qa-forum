import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import CategoryList from "../components/CategoryList";
import NewQuestion from "../components/NewQuestion";
import QuestionList from "../components/QuestionList";

export default function Dashboard({ goLogin }) {
  const { user, logout } = useAuth();
  const [selected, setSelected] = useState(null); // slug
  const [refreshFlag, setRefreshFlag] = useState(0); // bump to reload questions

  useEffect(() => {
    if (!user) goLogin();
  }, [user, goLogin]);

  return (
    <>
      <div className="header">
        <h1>Fairway Forum</h1>
        <div className="right">
          <span className="badge">Hello, {user?.username}</span>
          <button onClick={() => { logout(); goLogin(); }}>Logout</button>
        </div>
      </div>

      <div className="row">
        <div className="card sidebar">
          <h3>Categories</h3>
          <CategoryList selected={selected} onSelect={setSelected} />
        </div>

        <div>
          <div className="card">
            {selected ? (
              <NewQuestion categorySlug={selected} onCreated={() => setRefreshFlag((n) => n + 1)} />
            ) : (
              <p className="small">Select a Category to view its questions.</p>
            )}
          </div>

          <div className="card">
            <h3>Questions</h3>
            {selected ? (
              <QuestionList categorySlug={selected} refreshKey={refreshFlag} />
            ) : (
              <p className="small">No category selected.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
