"use client";

import { useState } from "react";
import { useTimetable, useHabits, useDisciplineLog } from "../lib/db";
import { todayStr, dayOfWeek, formatDate, getLast7Days, shiftDate, uid } from "../lib/utils";
import { DAYS_SHORT } from "../lib/constants";
import { Card, Btn, Input, SectionTitle } from "./ui";
import { FireIcon, PlusIcon, ArrowLeftIcon, ArrowRightIcon } from "./icons";

export default function DisciplineTab({ streak }) {
  const { data: timetable } = useTimetable();
  const { data: discipline, toggle } = useDisciplineLog();
  const { data: habits, insert: addHabit, remove: removeHabit } = useHabits();
  const [newHabit, setNewHabit] = useState("");
  const [viewDate, setViewDate] = useState(todayStr());

  const td = todayStr();
  const todayDay = dayOfWeek();
  const todaySlots = timetable.filter((s) => s.day === todayDay);
  const dayLog = discipline[viewDate] || {};

  const handleAddHabit = async () => {
    if (!newHabit.trim()) return;
    await addHabit({ label: newHabit.trim(), icon: "📌", sort_order: habits.length });
    setNewHabit("");
  };

  const totalTasks = (viewDate === td ? todaySlots.length : 0) + habits.length;
  const completedTasks = (viewDate === td ? todaySlots.filter((s) => dayLog[s.id]).length : 0) + habits.filter((h) => dayLog[`habit_${h.id}`]).length;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const weekDates = getLast7Days();

  const navigateDate = (dir) => {
    const next = shiftDate(viewDate, dir);
    if (next <= td) setViewDate(next);
  };

  return (
    <div className="animate-fadeIn">
      <SectionTitle icon={<FireIcon />}>Discipline Tracker</SectionTitle>

      <div className="flex items-center justify-center gap-4 mb-5">
        <button onClick={() => navigateDate(-1)} className="bg-transparent border-none cursor-pointer text-[var(--text-secondary)] p-1 hover:text-[var(--accent)]"><ArrowLeftIcon /></button>
        <div className="text-center">
          <div className="font-semibold text-base">{formatDate(viewDate)}</div>
          {viewDate === td && <div className="text-[11px] text-[var(--text-muted)]">Today</div>}
        </div>
        <button onClick={() => navigateDate(1)} disabled={viewDate >= td} className="bg-transparent border-none cursor-pointer text-[var(--text-secondary)] p-1 hover:text-[var(--accent)] disabled:opacity-20 disabled:cursor-not-allowed"><ArrowRightIcon /></button>
      </div>

      <Card className="mb-4 text-center !py-6">
        <div className="relative w-[120px] h-[120px] mx-auto mb-3">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--bg-secondary)" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={completionPct >= 80 ? "var(--success)" : completionPct >= 50 ? "var(--warning)" : completionPct > 0 ? "var(--danger)" : "var(--border)"} strokeWidth="8" strokeDasharray={`${(completionPct / 100) * 327} 327`} strokeLinecap="round" transform="rotate(-90 60 60)" style={{ transition: "stroke-dasharray 0.6s ease" }} />
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-[var(--accent)]">{completionPct}%</div>
        </div>
        <div className="text-sm text-[var(--text-secondary)]">{completedTasks} of {totalTasks} tasks complete</div>
        <div className="text-xs text-[var(--text-muted)] mt-1">🔥 {streak.count} day streak</div>
      </Card>

      <Card className="mb-4 !p-3.5">
        <h3 className="text-sm font-semibold mb-2.5 mt-0">This Week</h3>
        <div className="flex gap-1.5 justify-between">
          {weekDates.map((date, i) => {
            const dl = discipline[date] || {};
            const comp = Object.values(dl).filter(Boolean).length;
            return (
              <div key={date} onClick={() => setViewDate(date)} className={`flex-1 text-center cursor-pointer py-2 px-1 rounded-lg transition-all ${date === td ? "bg-[var(--accent-dim)]" : ""} ${date === viewDate ? "ring-1 ring-[var(--accent)]" : ""}`}>
                <div className="text-[10px] text-[var(--text-muted)] mb-1">{DAYS_SHORT[i]}</div>
                <div className="w-7 h-7 rounded-full mx-auto flex items-center justify-center text-xs font-semibold" style={{ background: comp === 0 ? "var(--bg-secondary)" : comp <= 3 ? "rgba(251,191,36,0.3)" : comp <= 6 ? "rgba(74,222,128,0.3)" : "rgba(74,222,128,0.6)", color: comp === 0 ? "var(--text-muted)" : "var(--text-primary)" }}>{comp}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {viewDate === td && todaySlots.length > 0 && (
        <Card className="mb-4">
          <h3 className="text-[15px] font-semibold mb-2.5 mt-0">📅 Timetable Slots</h3>
          <div className="flex flex-col gap-1.5">
            {todaySlots.sort((a, b) => a.start_time.localeCompare(b.start_time)).map((slot) => (
              <label key={slot.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all border ${dayLog[slot.id] ? "bg-[rgba(74,222,128,0.08)] border-[var(--success)]" : "bg-[var(--bg-secondary)] border-transparent"}`}>
                <input type="checkbox" checked={!!dayLog[slot.id]} onChange={() => toggle(viewDate, slot.id)} className="w-[18px] h-[18px]" />
                <span className="font-mono text-[11px] text-[var(--text-muted)] min-w-[90px]">{slot.start_time}–{slot.end_time}</span>
                <span className={`text-sm ${dayLog[slot.id] ? "line-through opacity-50" : ""}`}>{slot.subject}</span>
              </label>
            ))}
          </div>
        </Card>
      )}

      <Card className="mb-4">
        <h3 className="text-[15px] font-semibold mb-2.5 mt-0">✅ Daily Habits</h3>
        <div className="flex flex-col gap-1.5">
          {habits.map((habit) => (
            <label key={habit.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all border ${dayLog[`habit_${habit.id}`] ? "bg-[rgba(74,222,128,0.08)] border-[var(--success)]" : "bg-[var(--bg-secondary)] border-transparent"}`}>
              <input type="checkbox" checked={!!dayLog[`habit_${habit.id}`]} onChange={() => toggle(viewDate, `habit_${habit.id}`)} className="w-[18px] h-[18px]" />
              <span className="text-base">{habit.icon}</span>
              <span className={`flex-1 text-sm ${dayLog[`habit_${habit.id}`] ? "line-through opacity-50" : ""}`}>{habit.label}</span>
              <button onClick={(e) => { e.preventDefault(); removeHabit(habit.id); }} className="bg-transparent border-none cursor-pointer text-[var(--text-muted)] text-xs p-0.5 hover:text-[var(--danger)]">✕</button>
            </label>
          ))}
        </div>
        <div className="flex gap-2 mt-2.5">
          <Input placeholder="Add custom habit..." value={newHabit} onChange={(e) => setNewHabit(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddHabit()} className="flex-1" />
          <Btn variant="secondary" onClick={handleAddHabit}><PlusIcon /></Btn>
        </div>
      </Card>

      <Card className="!p-3.5 text-center">
        <p className="m-0 text-sm italic text-[var(--text-secondary)]">
          {completionPct >= 80 ? "Outstanding discipline today! Keep this momentum going. 🏆" : completionPct >= 50 ? "Good progress. Push through the remaining tasks. 💪" : completionPct > 0 ? "You've started — now finish strong. Every small step counts." : "A new day, a fresh start. Begin with your first task. 🌅"}
        </p>
      </Card>
    </div>
  );
}
