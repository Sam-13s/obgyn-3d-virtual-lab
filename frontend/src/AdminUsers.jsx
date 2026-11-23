import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Clock, RefreshCw, Search, ShieldCheck, UserCheck, UserRoundX, UsersRound } from "lucide-react";
import api, { refreshCsrf } from "./api.js";
import "./AdminUsers.css";

const formatDate = (value) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
const formatStudyTime = (seconds = 0) => {
  const minutes = Math.floor(seconds / 60);
  if (!minutes) return seconds ? "Under 1 min" : "0 min";
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours} hr ${minutes % 60} min` : `${minutes} min`;
};

export default function AdminUsers({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admin/users/");
      setUsers(data);
    } catch (requestError) {
      setError(requestError.response?.status === 403 ? "Your account does not have administrator access." : requestError.response?.data?.detail || "Could not load user records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const changeStatus = async (user) => {
    setBusyId(user.id);
    setError("");
    try {
      await refreshCsrf();
      const { data } = await api.patch(`/admin/users/${user.id}/`, { is_active: !user.is_active });
      setUsers((current) => current.map((item) => item.id === user.id ? { ...item, ...data } : item));
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Could not update this account.");
    } finally {
      setBusyId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => `${user.username} ${user.email} ${user.first_name} ${user.last_name}`.toLowerCase().includes(query));
  }, [users, search]);

  const activeCount = users.filter((user) => user.is_active).length;
  const attemptCount = users.reduce((sum, user) => sum + user.quiz_attempt_count, 0);
  const studySeconds = users.reduce((sum, user) => sum + user.study_seconds, 0);

  return <main className="admin-users-page">
    <header className="admin-users-header"><div><p className="admin-eyebrow">SECURE ADMINISTRATION</p><h1>User management</h1><p>Review account access, visible study time, module visits and submitted quiz results. Passwords are never exposed in this view.</p></div><button className="admin-refresh" onClick={loadUsers} disabled={loading}><RefreshCw size={15} /> Refresh</button></header>
    <div className="admin-stats"><article><UsersRound /><span>Accounts loaded</span><b>{users.length}</b></article><article><UserCheck /><span>Active accounts</span><b>{activeCount}</b></article><article><Activity /><span>Quiz attempts</span><b>{attemptCount}</b></article><article><Clock /><span>Recorded study time</span><b>{formatStudyTime(studySeconds)}</b></article><article><ShieldCheck /><span>Your access</span><b>{currentUser.is_superuser ? "Superuser" : "Staff admin"}</b></article></div>
    <section className="admin-users-panel">
      <div className="admin-table-heading"><div><h2>Learner accounts</h2><p>Up to 500 newest accounts · suspend or reactivate access</p></div><label className="admin-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, username, email" /></label></div>
      {error && <div className="admin-error" role="alert">{error}</div>}
      {loading ? <div className="admin-empty">Loading account records…</div> : filteredUsers.length === 0 ? <div className="admin-empty">No accounts match this search.</div> : <div className="admin-table-wrap"><table><thead><tr><th>Learner</th><th>Role</th><th>Status</th><th>Joined</th><th>Study activity</th><th>Quiz activity</th><th>Access control</th></tr></thead><tbody>{filteredUsers.map((user) => <tr key={user.id}><td><strong>{user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : user.username}</strong><small>@{user.username} · {user.email || "No email provided"}</small></td><td>{user.is_superuser ? "Superuser" : user.is_staff ? "Admin" : "Learner"}</td><td><span className={`admin-status ${user.is_active ? "active" : "suspended"}`}>{user.is_active ? "Active" : "Suspended"}</span></td><td>{formatDate(user.date_joined)}</td><td><b>{formatStudyTime(user.study_seconds)}</b><small>{user.study_module_count} module{user.study_module_count === 1 ? "" : "s"} opened</small>{user.study_modules.length > 0 && <details className="admin-study-details"><summary>View module activity</summary>{user.study_modules.map((record) => <span key={record.module_key}>{record.module_title}: {formatStudyTime(record.seconds_studied)} · {record.visit_count} visit{record.visit_count === 1 ? "" : "s"}</span>)}</details>}</td><td><b>{user.quiz_attempt_count}</b> attempt{user.quiz_attempt_count === 1 ? "" : "s"}{user.recent_attempts.length > 0 && <small className="admin-recent">Latest: {user.recent_attempts[0].score}/{user.recent_attempts[0].total} · {formatDate(user.recent_attempts[0].created_at)}</small>}</td><td>{user.is_staff && !currentUser.is_superuser ? <span className="admin-protected">Superuser only</span> : <button className={`admin-toggle ${user.is_active ? "suspend" : "restore"}`} disabled={busyId === user.id || user.id === currentUser.id} onClick={() => changeStatus(user)}>{user.is_active ? <><UserRoundX size={14} /> Suspend</> : <><UserCheck size={14} /> Reactivate</>}</button>}</td></tr>)}</tbody></table></div>}
      <p className="admin-privacy-note"><ShieldCheck size={15} /> Access to this page is checked by Django on every request. Study time counts only while the signed-in module tab is visible and focused. These engagement estimates do not prove comprehension; submitted quiz scores are recorded separately.</p>
    </section>
  </main>;
}
