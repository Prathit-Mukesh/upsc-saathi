"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "./supabase";

const AuthContext = createContext({});

// Cache session in localStorage to avoid waiting for Supabase on every page load
const SESSION_CACHE_KEY = "upsc_session_cache";

function getCachedSession() {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(SESSION_CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    // Check if session is less than 1 hour old (basic staleness check)
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
  // Initialize from cache for instant load
  const cached = useRef(getCachedSession());
  const [user, setUser] = useState(cached.current?.user || null);
  const [profile, setProfile] = useState(cached.current?.profile || null);
  const [loading, setLoading] = useState(!cached.current); // Only show loading if no cache

  useEffect(() => {
    // Verify session with Supabase in the background
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
      // If Supabase is slow/down but we have cache, use it
      if (cached.current) {
        setLoading(false);
      }
    });

    // Listen for auth changes
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
  }, []);

  async function fetchProfile(userId) {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      setProfile(data);
      // Cache the session + profile for instant loads
      cacheSession({ id: userId }, data);
    } catch (e) {
      console.warn("Profile fetch error:", e);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    cacheSession(null, null);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
