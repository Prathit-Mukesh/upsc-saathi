"use client";

import { useState } from "react";
import { useAuth } from "../lib/auth-context";

export default function AuthPage() {
  const { signIn, signUp, resetPassword, enterGuestMode } = useAuth();
  const [mode, setMode] = useState("login"); // login | signup | forgot | signup_done | reset_done
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!name.trim()) { setError("Please enter your name"); setLoading(false); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters"); setLoading(false); return; }
        await signUp(email, password, name);
        setMode("signup_done");
      } else if (mode === "forgot") {
        if (!email.trim()) { setError("Please enter your email"); setLoading(false); return; }
        await resetPassword(email);
        setMode("reset_done");
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)",
    background: "var(--bg-secondary)", color: "var(--text-primary)",
    fontSize: 14, fontFamily: "'Crimson Pro', serif", outline: "none", width: "100%", boxSizing: "border-box",
  };

  // Success screens
  if (mode === "signup_done") {
    return (
      <Shell>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 600 }}>Check Your Email</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>
            We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account, then come back and log in.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: 12, margin: "0 0 20px" }}>
            Don&apos;t see it? Check your spam folder. The email comes from Supabase.
          </p>
          <button onClick={() => { setMode("login"); setError(""); }}
            style={{ background: "var(--accent)", color: "var(--accent-text)", border: "none", padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "'Crimson Pro', serif" }}>
            Back to Login
          </button>
        </div>
      </Shell>
    );
  }

  if (mode === "reset_done") {
    return (
      <Shell>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔑</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 600 }}>Password Reset Sent</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>
            We&apos;ve sent a password reset link to <strong>{email}</strong>. Click the link in the email to set a new password.
          </p>
          <button onClick={() => { setMode("login"); setError(""); }}
            style={{ background: "var(--accent)", color: "var(--accent-text)", border: "none", padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "'Crimson Pro', serif" }}>
            Back to Login
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--accent-text)", fontWeight: 700, fontSize: 22, fontFamily: "'JetBrains Mono', monospace", marginBottom: 12 }}>U</div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>UPSC Saathi</h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Personal Preparation Assistant</p>
      </div>

      {/* Mode tabs (only for login/signup) */}
      {(mode === "login" || mode === "signup") && (
        <div style={{ display: "flex", marginBottom: 20, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
          {["login", "signup"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              style={{ flex: 1, padding: "10px 0", border: "none", cursor: "pointer", background: mode === m ? "var(--accent)" : "var(--bg-secondary)", color: mode === m ? "var(--accent-text)" : "var(--text-secondary)", fontSize: 14, fontWeight: 500, fontFamily: "'Crimson Pro', serif" }}>
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>
      )}

      {/* Forgot password header */}
      {mode === "forgot" && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600 }}>Forgot Password?</h2>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>Enter your email and we&apos;ll send a reset link.</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mode === "signup" && (
          <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
        )}
        <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
        {mode !== "forgot" && (
          <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={inputStyle} />
        )}

        {error && (
          <div style={{ padding: "8px 12px", borderRadius: 6, background: "rgba(239,68,68,0.1)", border: "1px solid var(--danger)", color: "var(--danger)", fontSize: 13 }}>{error}</div>
        )}

        <button type="submit" disabled={loading} style={{
          padding: "11px 0", borderRadius: 8, border: "none", background: "var(--accent)", color: "var(--accent-text)",
          fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "'Crimson Pro', serif", opacity: loading ? 0.6 : 1, marginTop: 4,
        }}>
          {loading ? "Please wait..." : mode === "login" ? "Log In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
        </button>
      </form>

      {/* Forgot password link */}
      {mode === "login" && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button onClick={() => { setMode("forgot"); setError(""); }}
            style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 13, cursor: "pointer", fontFamily: "'Crimson Pro', serif", textDecoration: "underline" }}>
            Forgot password?
          </button>
        </div>
      )}

      {/* Back to login from forgot */}
      {mode === "forgot" && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button onClick={() => { setMode("login"); setError(""); }}
            style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 13, cursor: "pointer", fontFamily: "'Crimson Pro', serif", textDecoration: "underline" }}>
            ← Back to login
          </button>
        </div>
      )}

      {/* Divider */}
      <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12, margin: "20px 0", position: "relative" }}>
        <span style={{ background: "var(--bg-card)", padding: "0 12px", position: "relative", zIndex: 1 }}>or</span>
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "var(--border)" }} />
      </div>

      {/* Guest mode */}
      <button onClick={enterGuestMode} style={{
        width: "100%", padding: "10px 0", borderRadius: 8,
        border: "1px solid var(--border)", background: "var(--bg-secondary)",
        color: "var(--text-primary)", fontSize: 14, fontWeight: 500,
        cursor: "pointer", fontFamily: "'Crimson Pro', serif",
      }}>
        Continue as Guest
      </button>
      <p style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: "var(--warning)", lineHeight: 1.4 }}>
        ⚠️ Guest data is saved only on this device. Clearing browser cache will delete all data.
      </p>

      <p style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
        Create an account to sync your data<br />securely across all your devices.
      </p>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", padding: 20 }}>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "36px 32px", maxWidth: 420, width: "100%" }}>
        {children}
      </div>
    </div>
  );
}
