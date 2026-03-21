"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth-context";
import { useData, useStreak } from "../lib/db";

import AuthPage from "./AuthPage";
import DashboardTab from "./DashboardTab";
import TimetableTab from "./TimetableTab";
import PrelimsTab from "./PrelimsTab";
import MainsTab from "./MainsTab";
import BooksTab from "./BooksTab";
import DisciplineTab from "./DisciplineTab";
import ContactTab from "./ContactTab";

import { ChartIcon, CalendarIcon, TargetIcon, EditIcon, BookIcon, FireIcon, SunIcon, MoonIcon } from "./icons";

const HelpIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

const TABS = [
  { id: "dashboard", label: "Dashboard", Icon: ChartIcon },
  { id: "timetable", label: "Timetable", Icon: CalendarIcon },
  { id: "prelims", label: "Prelims PYQ", Icon: TargetIcon },
  { id: "mains", label: "Mains PYQ", Icon: EditIcon },
  { id: "books", label: "Booklist", Icon: BookIcon },
  { id: "discipline", label: "Discipline", Icon: FireIcon },
  { id: "contact", label: "Support", Icon: HelpIcon },
];

export default function UPSCSaathi() {
  const { user, profile, loading: authLoading, guestMode, signOut, exitGuestMode } = useAuth();
  const { loaded } = useData();
  const { streak, markToday } = useStreak();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("upsc_dark_mode");
      if (saved === "true") setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    if (typeof window !== "undefined") localStorage.setItem("upsc_dark_mode", darkMode);
  }, [darkMode]);

  // Loading state
  if (authLoading || (!guestMode && user && !loaded)) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--accent-text)", fontWeight: 700, fontSize: 22, fontFamily: "'JetBrains Mono', monospace", marginBottom: 16, animation: "pulse-ring 2s infinite" }}>U</div>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading your data...</p>
        </div>
      </div>
    );
  }

  // Auth page if not logged in and not guest
  if (!user && !guestMode) return <AuthPage />;

  const displayName = guestMode
    ? "Guest"
    : profile?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Aspirant";

  const handleSignOut = () => {
    if (guestMode) exitGuestMode();
    else signOut();
    setShowUserMenu(false);
  };

  return (
    <div className="min-h-screen flex flex-col transition-theme">
      {/* Guest warning banner */}
      {guestMode && (
        <div style={{
          background: "var(--warning)", color: "#000", padding: "6px 16px",
          fontSize: 12, textAlign: "center", fontWeight: 500,
        }}>
          ⚠️ Guest mode — data saved only on this device.
          <button onClick={exitGuestMode} style={{
            background: "rgba(0,0,0,0.15)", border: "none", borderRadius: 4,
            padding: "2px 10px", marginLeft: 8, cursor: "pointer", fontSize: 12, fontWeight: 600,
          }}>
            Sign up to save data
          </button>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-[var(--bg-card)] border-b border-[var(--border)] px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent)] flex items-center justify-center text-[var(--accent-text)] font-bold text-base font-mono shrink-0">U</div>
          <div>
            <h1 className="m-0 text-lg font-semibold tracking-tight leading-tight">UPSC Saathi</h1>
            <p className="m-0 text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-widest">Personal Preparation Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${streak.count > 0 ? "bg-[var(--accent-dim)] border-[var(--accent)] text-[var(--accent)]" : "bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-muted)]"}`}>
            <FireIcon /> <span className="hidden sm:inline">{streak.count} day streak</span><span className="sm:hidden">{streak.count}</span>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-1.5 cursor-pointer text-[var(--text-secondary)] flex items-center hover:bg-[var(--bg-hover)] transition-all" aria-label="Toggle dark mode">
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-8 h-8 rounded-full bg-[var(--accent)] text-[var(--accent-text)] font-bold text-sm flex items-center justify-center cursor-pointer border-none font-mono">
              {displayName.charAt(0).toUpperCase()}
            </button>
            {showUserMenu && (
              <div style={{ position: "absolute", right: 0, top: "110%", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", minWidth: 200, zIndex: 100, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{displayName}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
                  {guestMode ? "Guest mode — data on this device only" : user?.email}
                </div>
                <button onClick={handleSignOut} style={{
                  width: "100%", padding: "8px 12px", background: "var(--bg-secondary)",
                  border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer",
                  fontSize: 13, color: "var(--danger)", fontFamily: "'Crimson Pro', serif", textAlign: "left",
                }}>{guestMode ? "Exit Guest Mode" : "Sign Out"}</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* NAV */}
      <nav className="bg-[var(--bg-card)] border-b border-[var(--border)] flex overflow-x-auto px-2 sm:px-4">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`bg-transparent border-none cursor-pointer px-3 sm:px-4 py-3 flex items-center gap-1.5 text-sm whitespace-nowrap font-serif transition-all relative ${activeTab === tab.id ? "text-[var(--accent)] font-semibold" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
            style={{ borderBottom: activeTab === tab.id ? "2px solid var(--accent)" : "2px solid transparent" }}>
            <tab.Icon /><span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* MAIN */}
      <main className="flex-1 px-4 sm:px-6 py-5 max-w-[1100px] mx-auto w-full">
        {activeTab === "dashboard" && <DashboardTab streak={streak} />}
        {activeTab === "timetable" && <TimetableTab />}
        {activeTab === "prelims" && <PrelimsTab markToday={markToday} />}
        {activeTab === "mains" && <MainsTab markToday={markToday} />}
        {activeTab === "books" && <BooksTab />}
        {activeTab === "discipline" && <DisciplineTab streak={streak} />}
        {activeTab === "contact" && <ContactTab />}
      </main>

      <footer className="text-center py-4 text-[11px] text-[var(--text-muted)] font-mono border-t border-[var(--border)]">
        UPSC Saathi · {guestMode ? "Guest mode — data on this device only" : `Cloud synced · Logged in as ${displayName}`}
      </footer>
    </div>
  );
}
