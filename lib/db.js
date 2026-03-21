"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth-context";

const DataContext = createContext({});

// ─── Central data provider: fetches everything once, shares across all tabs ───
export function DataProvider({ children }) {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [prelimsLog, setPrelimsLog] = useState([]);
  const [mainsLog, setMainsLog] = useState([]);
  const [books, setBooks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [disciplineLog, setDisciplineLog] = useState({});
  const [streak, setStreak] = useState({ count: 0, last_date: null });
  const [loaded, setLoaded] = useState(false);
  const fetchedRef = useRef(false);

  // Fetch ALL data once on login
  const fetchAll = useCallback(async () => {
    if (!user || fetchedRef.current) return;
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

      // Parse discipline log into map
      if (dlRes.data) {
        const map = {};
        dlRes.data.forEach((r) => {
          if (!map[r.date]) map[r.date] = {};
          if (r.completed) map[r.date][r.item_key] = true;
        });
        setDisciplineLog(map);
      }

      if (stRes.data) setStreak({ count: stRes.data.count || 0, last_date: stRes.data.last_date });
    } catch (e) {
      console.error("Data fetch error:", e);
    }
    setLoaded(true);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchedRef.current = false;
      setLoaded(false);
      fetchAll();
    } else {
      // Reset on logout
      fetchedRef.current = false;
      setTimetable([]);
      setPrelimsLog([]);
      setMainsLog([]);
      setBooks([]);
      setHabits([]);
      setDisciplineLog({});
      setStreak({ count: 0, last_date: null });
      setLoaded(false);
    }
  }, [user, fetchAll]);

  // ─── TIMETABLE ACTIONS ───
  const timetableActions = {
    insert: async (row) => {
      const { data, error } = await supabase.from("timetable_slots").insert({ ...row, user_id: user.id }).select().single();
      if (!error && data) setTimetable((p) => [...p, data].sort((a, b) => a.start_time.localeCompare(b.start_time)));
      return { data, error };
    },
    update: async (id, changes) => {
      const { data, error } = await supabase.from("timetable_slots").update(changes).eq("id", id).select().single();
      if (!error && data) setTimetable((p) => p.map((r) => r.id === id ? data : r));
      return { data, error };
    },
    remove: async (id) => {
      const { error } = await supabase.from("timetable_slots").delete().eq("id", id);
      if (!error) setTimetable((p) => p.filter((r) => r.id !== id));
    },
    bulkInsert: async (rows) => {
      const withUser = rows.map((r) => ({ ...r, user_id: user.id }));
      const { data, error } = await supabase.from("timetable_slots").insert(withUser).select();
      if (!error && data) setTimetable((p) => [...p, ...data].sort((a, b) => a.start_time.localeCompare(b.start_time)));
    },
    bulkDelete: async (ids) => {
      if (!ids.length) return;
      await supabase.from("timetable_slots").delete().in("id", ids);
      setTimetable((p) => p.filter((r) => !ids.includes(r.id)));
    },
  };

  // ─── PRELIMS ACTIONS ───
  const prelimsActions = {
    insert: async (row) => {
      const { data, error } = await supabase.from("prelims_log").insert({ ...row, user_id: user.id }).select().single();
      if (!error && data) setPrelimsLog((p) => [data, ...p]);
      return { data, error };
    },
    remove: async (id) => {
      await supabase.from("prelims_log").delete().eq("id", id);
      setPrelimsLog((p) => p.filter((r) => r.id !== id));
    },
  };

  // ─── MAINS ACTIONS ───
  const mainsActions = {
    insert: async (row) => {
      const { data, error } = await supabase.from("mains_log").insert({ ...row, user_id: user.id }).select().single();
      if (!error && data) setMainsLog((p) => [data, ...p]);
      return { data, error };
    },
    remove: async (id) => {
      await supabase.from("mains_log").delete().eq("id", id);
      setMainsLog((p) => p.filter((r) => r.id !== id));
    },
  };

  // ─── BOOKS ACTIONS ───
  const booksActions = {
    insert: async (row) => {
      const { data, error } = await supabase.from("books").insert({ ...row, user_id: user.id }).select().single();
      if (!error && data) setBooks((p) => [...p, data]);
      return { data, error };
    },
    update: async (id, changes) => {
      const { data, error } = await supabase.from("books").update(changes).eq("id", id).select().single();
      if (!error && data) setBooks((p) => p.map((r) => r.id === id ? data : r));
      return { data, error };
    },
    remove: async (id) => {
      await supabase.from("books").delete().eq("id", id);
      setBooks((p) => p.filter((r) => r.id !== id));
    },
    bulkInsert: async (rows) => {
      const withUser = rows.map((r) => ({ ...r, user_id: user.id }));
      const { data, error } = await supabase.from("books").insert(withUser).select();
      if (!error && data) setBooks((p) => [...p, ...data]);
    },
  };

  // ─── HABITS ACTIONS ───
  const habitsActions = {
    insert: async (row) => {
      const { data, error } = await supabase.from("habits").insert({ ...row, user_id: user.id }).select().single();
      if (!error && data) setHabits((p) => [...p, data]);
      return { data, error };
    },
    remove: async (id) => {
      await supabase.from("habits").delete().eq("id", id);
      setHabits((p) => p.filter((r) => r.id !== id));
    },
  };

  // ─── DISCIPLINE TOGGLE ───
  const toggleDiscipline = async (date, itemKey) => {
    if (!user) return;
    const current = disciplineLog[date]?.[itemKey] || false;
    const newVal = !current;

    // Optimistic instant update
    setDisciplineLog((prev) => {
      const updated = { ...prev };
      if (!updated[date]) updated[date] = {};
      if (newVal) updated[date] = { ...updated[date], [itemKey]: true };
      else {
        const { [itemKey]: _, ...rest } = updated[date];
        updated[date] = rest;
      }
      return updated;
    });

    // DB sync in background (don't await)
    if (newVal) {
      supabase.from("discipline_log").upsert(
        { user_id: user.id, date, item_key: itemKey, completed: true },
        { onConflict: "user_id,date,item_key" }
      );
    } else {
      supabase.from("discipline_log").delete()
        .eq("user_id", user.id).eq("date", date).eq("item_key", itemKey);
    }
  };

  // ─── STREAK ───
  const markToday = async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    if (streak.last_date === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const newCount = streak.last_date === yesterdayStr ? streak.count + 1 : 1;

    setStreak({ count: newCount, last_date: today });
    supabase.from("streaks").update({ count: newCount, last_date: today, updated_at: new Date().toISOString() }).eq("user_id", user.id);
  };

  return (
    <DataContext.Provider value={{
      loaded,
      timetable, timetableActions,
      prelimsLog, prelimsActions,
      mainsLog, mainsActions,
      books, booksActions,
      habits, habitsActions,
      disciplineLog, toggleDiscipline,
      streak, markToday,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}

// ─── Convenience hooks (same API as before, but using central cache) ───
export function useTimetable() {
  const { timetable, timetableActions } = useData();
  return { data: timetable, ...timetableActions };
}

export function usePrelimsLog() {
  const { prelimsLog, prelimsActions } = useData();
  return { data: prelimsLog, ...prelimsActions };
}

export function useMainsLog() {
  const { mainsLog, mainsActions } = useData();
  return { data: mainsLog, ...mainsActions };
}

export function useBooks() {
  const { books, booksActions } = useData();
  return { data: books, ...booksActions };
}

export function useHabits() {
  const { habits, habitsActions } = useData();
  return { data: habits, ...habitsActions };
}

export function useDisciplineLog() {
  const { disciplineLog, toggleDiscipline } = useData();
  return { data: disciplineLog, toggle: toggleDiscipline };
}

export function useStreak() {
  const { streak, markToday } = useData();
  return { streak, markToday };
}
