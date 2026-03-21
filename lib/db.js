"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth-context";

const DataContext = createContext({});

// ─── localStorage helpers for guest mode ───
const LS_PREFIX = "upsc_guest_";
function lsGet(key, fallback) {
  try { const d = localStorage.getItem(LS_PREFIX + key); return d ? JSON.parse(d) : fallback; } catch { return fallback; }
}
function lsSet(key, val) {
  try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(val)); } catch {}
}

let _gid = Date.now();
function guestId() { return `g_${_gid++}_${Math.random().toString(36).slice(2, 6)}`; }

export function DataProvider({ children }) {
  const { user, guestMode } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [prelimsLog, setPrelimsLog] = useState([]);
  const [mainsLog, setMainsLog] = useState([]);
  const [books, setBooks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [disciplineLog, setDisciplineLog] = useState({});
  const [streak, setStreak] = useState({ count: 0, last_date: null });
  const [loaded, setLoaded] = useState(false);
  const fetchedRef = useRef(false);

  // ─── GUEST MODE: load from localStorage ───
  useEffect(() => {
    if (!guestMode) return;
    setTimetable(lsGet("timetable", []));
    setPrelimsLog(lsGet("prelims_log", []));
    setMainsLog(lsGet("mains_log", []));
    setBooks(lsGet("books", []));
    setHabits(lsGet("habits", [
      { id: "wake", label: "Woke up on time", icon: "🌅", sort_order: 0 },
      { id: "news", label: "Read newspaper / current affairs", icon: "📰", sort_order: 1 },
      { id: "prelims", label: "Prelims MCQ practice", icon: "🎯", sort_order: 2 },
      { id: "mains", label: "Mains answer writing", icon: "✍️", sort_order: 3 },
      { id: "revision", label: "Revision session", icon: "🔄", sort_order: 4 },
      { id: "exercise", label: "Physical exercise", icon: "🏃", sort_order: 5 },
      { id: "sleep", label: "Slept on time", icon: "😴", sort_order: 6 },
    ]));
    setDisciplineLog(lsGet("discipline_log", {}));
    setStreak(lsGet("streak", { count: 0, last_date: null }));
    setLoaded(true);
    fetchedRef.current = false;
  }, [guestMode]);

  // ─── CLOUD MODE: fetch from Supabase ───
  const fetchAll = useCallback(async () => {
    if (!user || guestMode || fetchedRef.current) return;
    fetchedRef.current = true;
    try {
      const [ttRes, plRes, mlRes, bkRes, hbRes, dlRes, stRes] = await Promise.all([
        supabase.from("timetable_slots").select("*").eq("user_id", user.id).order("start_time", { ascending: true }),
        supabase.from("prelims_log").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("mains_log").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("books").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
        supabase.from("habits").select("*").eq("user_id", user.id).order("sort_order", { ascending: true }),
        supabase.from("discipline_log").select("*").eq("user_id", user.id),
        supabase.from("streaks").select("*").eq("user_id", user.id).single(),
      ]);
      if (ttRes.data) setTimetable(ttRes.data);
      if (plRes.data) setPrelimsLog(plRes.data);
      if (mlRes.data) setMainsLog(mlRes.data);
      if (bkRes.data) setBooks(bkRes.data);
      if (hbRes.data) setHabits(hbRes.data);
      if (dlRes.data) {
        const map = {};
        dlRes.data.forEach((r) => { if (!map[r.date]) map[r.date] = {}; if (r.completed) map[r.date][r.item_key] = true; });
        setDisciplineLog(map);
      }
      if (stRes.data) setStreak({ count: stRes.data.count || 0, last_date: stRes.data.last_date });
    } catch (e) { console.error("Data fetch error:", e); }
    setLoaded(true);
  }, [user, guestMode]);

  useEffect(() => {
    if (user && !guestMode) { fetchedRef.current = false; setLoaded(false); fetchAll(); }
    else if (!user && !guestMode) {
      setTimetable([]); setPrelimsLog([]); setMainsLog([]); setBooks([]); setHabits([]);
      setDisciplineLog({}); setStreak({ count: 0, last_date: null }); setLoaded(false); fetchedRef.current = false;
    }
  }, [user, guestMode, fetchAll]);

  // ─── Helper: cloud or local write ───
  function makeActions(table, stateGetter, stateSetter, lsKey, sortFn) {
    return {
      insert: async (row) => {
        if (guestMode) {
          const newRow = { ...row, id: guestId(), date: row.date || undefined, created_at: new Date().toISOString() };
          stateSetter((p) => { const n = sortFn ? [...p, newRow].sort(sortFn) : [newRow, ...p]; lsSet(lsKey, n); return n; });
          return { data: newRow };
        }
        const { data, error } = await supabase.from(table).insert({ ...row, user_id: user.id }).select().single();
        if (!error && data) stateSetter((p) => sortFn ? [...p, data].sort(sortFn) : [data, ...p]);
        return { data, error };
      },
      update: async (id, changes) => {
        if (guestMode) {
          stateSetter((p) => { const n = p.map((r) => r.id === id ? { ...r, ...changes } : r); lsSet(lsKey, n); return n; });
          return { data: { id, ...changes } };
        }
        const { data, error } = await supabase.from(table).update(changes).eq("id", id).select().single();
        if (!error && data) stateSetter((p) => p.map((r) => r.id === id ? data : r));
        return { data, error };
      },
      remove: async (id) => {
        if (guestMode) {
          stateSetter((p) => { const n = p.filter((r) => r.id !== id); lsSet(lsKey, n); return n; });
          return;
        }
        await supabase.from(table).delete().eq("id", id);
        stateSetter((p) => p.filter((r) => r.id !== id));
      },
      bulkInsert: async (rows) => {
        if (guestMode) {
          const newRows = rows.map((r) => ({ ...r, id: guestId(), created_at: new Date().toISOString() }));
          stateSetter((p) => { const n = [...p, ...newRows]; lsSet(lsKey, n); return n; });
          return;
        }
        const withUser = rows.map((r) => ({ ...r, user_id: user.id }));
        const { data } = await supabase.from(table).insert(withUser).select();
        if (data) stateSetter((p) => sortFn ? [...p, ...data].sort(sortFn) : [...p, ...data]);
      },
      bulkDelete: async (ids) => {
        if (!ids.length) return;
        if (guestMode) {
          stateSetter((p) => { const n = p.filter((r) => !ids.includes(r.id)); lsSet(lsKey, n); return n; });
          return;
        }
        await supabase.from(table).delete().in("id", ids);
        stateSetter((p) => p.filter((r) => !ids.includes(r.id)));
      },
    };
  }

  const ttSort = (a, b) => (a.start_time || "").localeCompare(b.start_time || "");
  const timetableActions = makeActions("timetable_slots", timetable, setTimetable, "timetable", ttSort);
  const prelimsActions = makeActions("prelims_log", prelimsLog, setPrelimsLog, "prelims_log", null);
  const mainsActions = makeActions("mains_log", mainsLog, setMainsLog, "mains_log", null);
  const booksActions = makeActions("books", books, setBooks, "books", null);
  const habitsActions = makeActions("habits", habits, setHabits, "habits", null);

  // ─── Discipline toggle ───
  const toggleDiscipline = async (date, itemKey) => {
    const current = disciplineLog[date]?.[itemKey] || false;
    const newVal = !current;
    setDisciplineLog((prev) => {
      const updated = { ...prev };
      if (!updated[date]) updated[date] = {};
      if (newVal) updated[date] = { ...updated[date], [itemKey]: true };
      else { const { [itemKey]: _, ...rest } = updated[date]; updated[date] = rest; }
      if (guestMode) lsSet("discipline_log", updated);
      return updated;
    });
    if (!guestMode && user) {
      if (newVal) supabase.from("discipline_log").upsert({ user_id: user.id, date, item_key: itemKey, completed: true }, { onConflict: "user_id,date,item_key" });
      else supabase.from("discipline_log").delete().eq("user_id", user.id).eq("date", date).eq("item_key", itemKey);
    }
  };

  // ─── Streak ───
  const markToday = async () => {
    const today = new Date().toISOString().split("T")[0];
    if (streak.last_date === today) return;
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const newCount = streak.last_date === yesterdayStr ? streak.count + 1 : 1;
    const ns = { count: newCount, last_date: today };
    setStreak(ns);
    if (guestMode) { lsSet("streak", ns); }
    else if (user) { supabase.from("streaks").update({ count: newCount, last_date: today, updated_at: new Date().toISOString() }).eq("user_id", user.id); }
  };

  return (
    <DataContext.Provider value={{
      loaded, timetable, timetableActions, prelimsLog, prelimsActions,
      mainsLog, mainsActions, books, booksActions, habits, habitsActions,
      disciplineLog, toggleDiscipline, streak, markToday,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() { return useContext(DataContext); }

export function useTimetable() { const { timetable, timetableActions } = useData(); return { data: timetable, ...timetableActions }; }
export function usePrelimsLog() { const { prelimsLog, prelimsActions } = useData(); return { data: prelimsLog, ...prelimsActions }; }
export function useMainsLog() { const { mainsLog, mainsActions } = useData(); return { data: mainsLog, ...mainsActions }; }
export function useBooks() { const { books, booksActions } = useData(); return { data: books, ...booksActions }; }
export function useHabits() { const { habits, habitsActions } = useData(); return { data: habits, ...habitsActions }; }
export function useDisciplineLog() { const { disciplineLog, toggleDiscipline } = useData(); return { data: disciplineLog, toggle: toggleDiscipline }; }
export function useStreak() { const { streak, markToday } = useData(); return { streak, markToday }; }
