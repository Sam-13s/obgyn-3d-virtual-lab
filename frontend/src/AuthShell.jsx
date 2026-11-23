import React, { useEffect, useState } from "react";
import { ArrowRight, HeartPulse, LockKeyhole, ShieldCheck, UserRoundPlus } from "lucide-react";
import App from "./App.jsx";
import api, { refreshCsrf } from "./api.js";
import "./AuthShell.css";

function getError(error) {
  const data = error?.response?.data;
  if (!data) return "The learning server is not reachable. Start the Django backend, then try again.";
  if (typeof data.detail === "string") return data.detail;
  const messages = Object.values(data).flatMap((value) => Array.isArray(value) ? value : [value]);
  return messages.map((message) => typeof message === "string" ? message : "Please check the information and try again.").join(" ");
}

export default function AuthShell() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [apiUnavailable, setApiUnavailable] = useState(false);
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await refreshCsrf();
        const response = await api.get("/auth/me/");
        if (mounted) setUser(response.data);
      } catch (requestError) {
        if (mounted && !requestError.response) setApiUnavailable(true);
        if (mounted && requestError.response?.status !== 401 && requestError.response?.status !== 403) setError(getError(requestError));
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await refreshCsrf();
      const endpoint = mode === "signup" ? "/auth/signup/" : "/auth/login/";
      const payload = mode === "signup"
        ? { username: form.get("username"), email: form.get("email"), first_name: form.get("first_name"), last_name: form.get("last_name"), password: form.get("password") }
        : { username: form.get("username"), password: form.get("password") };
      const response = await api.post(endpoint, payload);
      setUser(response.data);
      setApiUnavailable(false);
    } catch (requestError) {
      setError(getError(requestError));
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    try {
      await refreshCsrf();
      await api.post("/auth/logout/");
    } finally {
      setUser(null);
      setMode("login");
      setAuthOpen(false);
      setError("");
    }
  };

  if (checking) return <div className="auth-loading"><HeartPulse size={23} /> Checking your secure session…</div>;
  if (user) return <App currentUser={user} onLogout={signOut} />;
  if (!authOpen) return <App currentUser={null} onRequestAuth={(nextMode = "login") => { setMode(nextMode); setError(""); setAuthOpen(true); }} />;

  return <main className="auth-page">
    <div className="auth-glow auth-glow-one" /><div className="auth-glow auth-glow-two" />
    <section className="auth-layout">
      <div className="auth-intro">
        <div className="auth-brand"><span><HeartPulse size={24} /></span><div><b>OB-GYN LAB</b><small>VIRTUAL LEARNING</small></div></div>
        <p className="auth-kicker">A SECURE CLINICAL LEARNING SPACE</p>
        <h1>Learn through<br /><em>interactive anatomy.</em></h1>
        <p className="auth-intro-copy">Sign in to explore simulations, follow your learning progress, and access course materials.</p>
        <div className="auth-trust"><ShieldCheck size={17} /><span>Accounts are protected with server-side password hashing and session authentication.</span></div>
      </div>
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-mode-tabs" role="tablist" aria-label="Account access">
          <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>Log in</button>
          <button type="button" role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setError(""); }}>Create account</button>
        </div>
        <div className="auth-card-title"><span className="auth-card-icon">{mode === "signup" ? <UserRoundPlus size={19} /> : <LockKeyhole size={19} />}</span><div><h2 id="auth-title">{mode === "signup" ? "Create your learner account" : "Welcome back"}</h2><p>{mode === "signup" ? "Join the OB-GYN virtual learning lab." : "Sign in to continue learning."}</p></div></div>
        <form onSubmit={submit} className="auth-form">
          {mode === "signup" && <>
            <div className="auth-name-row"><label>First name<input name="first_name" autoComplete="given-name" maxLength="150" /></label><label>Last name<input name="last_name" autoComplete="family-name" maxLength="150" /></label></div>
            <label>Email address<input name="email" type="email" autoComplete="email" required maxLength="254" /></label>
          </>}
          <label>{mode === "login" ? "Username or email" : "Username"}<input name="username" autoComplete={mode === "login" ? "username" : "username"} required maxLength="150" /></label>
          <label>Password<input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "signup" ? 10 : 1} /></label>
          {mode === "signup" && <small className="auth-help">Use at least 10 characters. A superuser must provision administrator accounts.</small>}
          {error && <div className="auth-error" role="alert">{error}{apiUnavailable && <button type="button" onClick={() => window.location.reload()}>Retry connection</button>}</div>}
          <button className="auth-submit" disabled={busy || apiUnavailable} type="submit">{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}<ArrowRight size={16} /></button>
        </form>
        <p className="auth-admin-note">Administrator? Sign in with the account provisioned by your Django superuser. Admin access is never available through public sign-up.</p>
        <button type="button" className="auth-back-dashboard" onClick={() => { setAuthOpen(false); setError(""); }}>Back to dashboard</button>
      </section>
    </section>
    <footer className="auth-footer">Educational use only · Protect your account credentials · Do not enter patient-identifying information</footer>
  </main>;
}
