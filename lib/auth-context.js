"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "./supabase";

const AuthContext = createContext({});

const SESSION_CACHE_KEY = "upsc_session_cache";
const GUEST_KEY = "upsc_guest_mode";

function getCachedSession() {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(SESSION_CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed._cachedAt > 3600000) return null;
    return parsed;
  } catch { return null; }
}

function cacheSession(user, profile) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({ user, profile, _cachedAt: Date.now() }));
  } else {
    localStorage.removeItem(SESSION_CACHE_KEY);
  }
}

export function AuthProvider({ children }) {
  const cached = useRef(getCachedSession());
  const isGuest = useRef(typeof window !== "undefined" && localStorage.getItem(GUEST_KEY) === "true");

  const [user, setUser] = useState(cached.current?.user || null);
  const [profile, setProfile] = useState(cached.current?.profile || null);
  const [guestMode, setGuestMode] = useState(isGuest.current);
  const [loading, setLoading] = useState(!cached.current && !isGuest.current);

  useEffect(() => {
    if (guestMode) { setLoading(false); return; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        fetchProfile(sessionUser.id);
      } else {
        setProfile(null);
        cacheSession(null, null);
        setLoading(false);
      }
    }).catch(() => {
      if (cached.current) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);
        if (sessionUser) {
          await fetchProfile(sessionUser.id);
        } else {
          setProfile(null);
          cacheSession(null, null);
          setLoading(false);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [guestMode]);

  async function fetchProfile(userId) {
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
      setProfile(data);
      cacheSession({ id: userId }, data);
    } catch (e) { console.warn("Profile fetch error:", e); }
    finally { setLoading(false); }
  }

  async function signUp(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: name },
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}` : undefined,
    });
    if (error) throw error;
  }

  function enterGuestMode() {
    localStorage.setItem(GUEST_KEY, "true");
    setGuestMode(true);
    setLoading(false);
  }

  function exitGuestMode() {
    localStorage.removeItem(GUEST_KEY);
    setGuestMode(false);
  }

  async function signOut() {
    cacheSession(null, null);
    localStorage.removeItem(GUEST_KEY);
    setGuestMode(false);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading, guestMode,
      signUp, signIn, signOut, resetPassword,
      enterGuestMode, exitGuestMode,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
