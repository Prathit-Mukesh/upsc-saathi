"use client";

import { useState } from "react";
import { useAuth } from "../lib/auth-context";

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!name.trim()) { setError("Please enter your name"); setLoading(false); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters"); setLoading(false); return; }
        await signUp(email, password, name);
        setSignupSuccess(true);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", padding: 20 }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 40, maxWidth: 420, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 600 }}>Check Your Email</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>
            We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account, then come back and log in.
          </p>
          <button onClick={() => { setSignupSuccess(false); setMode("login"); }}
            style={{ background: "var(--accent)", color: "var(--accent-text)", border: "none", padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "'Crimson Pro', serif" }}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", padding: 20 }}>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "40px 36px", maxWidth: 420, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--accent-text)", fontWeight: 700, fontSize: 22, fontFamily: "'JetBrains Mono', monospace", marginBottom: 12 }}>U</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>UPSC Saathi</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Personal Preparation Assistant</p>
        </div>

        <div style={{ display: "flex", marginBottom: 24, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
          {["login", "signup"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              style={{ flex: 1, padding: "10px 0", border: "none", cursor: "pointer", background: mode === m ? "var(--accent)" : "var(--bg-secondary)", color: mode === m ? "var(--accent-text)" : "var(--text-secondary)", fontSize: 14, fontWeight: 500, fontFamily: "'Crimson Pro', serif" }}>
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "signup" && (
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required
              style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, fontFamily: "'Crimson Pro', serif", outline: "none" }} />
          )}
          <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required
            style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, fontFamily: "'Crimson Pro', serif", outline: "none" }} />
          <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
            style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, fontFamily: "'Crimson Pro', serif", outline: "none" }} />

          {error && (
            <div style={{ padding: "8px 12px", borderRadius: 6, background: "rgba(239,68,68,0.1)", border: "1px solid var(--danger)", color: "var(--danger)", fontSize: 13 }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{ padding: "11px 0", borderRadius: 8, border: "none", background: "var(--accent)", color: "var(--accent-text)", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Crimson Pro', serif", opacity: loading ? 0.6 : 1, marginTop: 4 }}>
            {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
          Your data is stored securely in the cloud<br />and syncs across all your devices.
        </p>
      </div>
    </div>
  );
}
