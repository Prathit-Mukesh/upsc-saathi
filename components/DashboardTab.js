"use client";

import { useTimetable, usePrelimsLog, useMainsLog, useBooks, useDisciplineLog } from "../lib/db";
import { todayStr, dayOfWeek, formatDate, getGreeting, getLast7Days } from "../lib/utils";
import { Card, StatBox, SectionTitle, ProgressBar } from "./ui";
import { CalendarIcon, BellIcon, TargetIcon } from "./icons";

export default function DashboardTab({ streak }) {
  const { data: timetable } = useTimetable();
  const { data: prelimsLog } = usePrelimsLog();
  const { data: mainsLog } = useMainsLog();
  const { data: books } = useBooks();
  const { data: discipline } = useDisciplineLog();

  const td = todayStr();
  const tdDay = dayOfWeek();
  const todaySlots = timetable.filter((s) => s.day === tdDay);
  const todayPrelims = prelimsLog.filter((l) => l.date === td);
  const todayMains = mainsLog.filter((l) => l.date === td);
  const totalPrelimsToday = todayPrelims.reduce((s, l) => s + l.total, 0);
  const correctPrelimsToday = todayPrelims.reduce((s, l) => s + l.correct, 0);
  const totalMainsToday = todayMains.length;
  const todayDiscipline = discipline[td] || {};
  const completedSlots = Object.values(todayDiscipline).filter(Boolean).length;

  const last7 = getLast7Days();
  const weekPrelims = prelimsLog.filter((l) => last7.includes(l.date)).reduce((s, l) => s + l.total, 0);
  const weekMains = mainsLog.filter((l) => last7.includes(l.date)).length;

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight m-0">{getGreeting()}, Aspirant</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{formatDate(td)} · {tdDay}</p>
      </div>

      <div className="flex gap-3 flex-wrap mb-6">
        <StatBox label="Today's MCQs" value={totalPrelimsToday} sub={`${correctPrelimsToday} correct`} />
        <StatBox label="Today's Answers" value={totalMainsToday} sub="mains writing" color="var(--success)" />
        <StatBox label="TT Compliance" value={todaySlots.length > 0 ? `${Math.round((completedSlots / todaySlots.length) * 100)}%` : "—"} sub={`${completedSlots}/${todaySlots.length} slots`} color="var(--warning)" />
        <StatBox label="Streak" value={`${streak.count}d`} sub="consecutive days" color="var(--danger)" />
      </div>

      <Card className="mb-4">
        <SectionTitle icon={<CalendarIcon />}>Today&apos;s Schedule</SectionTitle>
        {todaySlots.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No timetable set for {tdDay}. Add slots in the Timetable tab.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {todaySlots.sort((a, b) => a.start_time.localeCompare(b.start_time)).map((slot) => (
              <div key={slot.id} className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-[var(--bg-secondary)]"
                style={{ borderLeft: `3px solid ${todayDiscipline[slot.id] ? "var(--success)" : "var(--border)"}` }}>
                <span className="font-mono text-xs text-[var(--text-muted)] min-w-[100px]">{slot.start_time}–{slot.end_time}</span>
                <span className={`text-sm font-medium flex-1 ${todayDiscipline[slot.id] ? "line-through opacity-50" : ""}`}>{slot.subject}</span>
                {todayDiscipline[slot.id] && <span className="text-[var(--success)] text-xs">✓ Done</span>}
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="flex gap-3 flex-wrap">
        <Card className="flex-1 min-w-[250px]">
          <SectionTitle icon={<TargetIcon />}>This Week</SectionTitle>
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Prelims MCQs</span><span className="font-semibold">{weekPrelims}/140</span></div>
              <ProgressBar value={weekPrelims} max={140} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Mains Answers</span><span className="font-semibold">{weekMains}/35</span></div>
              <ProgressBar value={weekMains} max={35} color="var(--success)" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Books in Progress</span><span className="font-semibold">{books.filter((b) => b.reads > 0).length}/{books.length}</span></div>
              <ProgressBar value={books.filter((b) => b.reads > 0).length} max={books.length || 1} color="var(--warning)" />
            </div>
          </div>
        </Card>

        <Card className="flex-1 min-w-[250px]">
          <SectionTitle icon={<BellIcon />}>Reminders</SectionTitle>
          <div className="flex flex-col gap-2 text-sm">
            {totalPrelimsToday < 20 && <div className="px-3 py-2 rounded-md bg-[var(--accent-dim)] border border-[var(--accent)]">⚡ Complete {20 - totalPrelimsToday} more Prelims MCQs today</div>}
            {totalMainsToday < 5 && <div className="px-3 py-2 rounded-md" style={{ background: "rgba(74,222,128,0.08)", border: "1px solid var(--success)" }}>✍️ Write {5 - totalMainsToday} more Mains answers today</div>}
            {completedSlots < todaySlots.length && todaySlots.length > 0 && <div className="px-3 py-2 rounded-md" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid var(--warning)" }}>📅 {todaySlots.length - completedSlots} timetable slots remaining</div>}
            {totalPrelimsToday >= 20 && totalMainsToday >= 5 && <div className="px-3 py-2 rounded-md" style={{ background: "rgba(74,222,128,0.08)", border: "1px solid var(--success)" }}>🎯 All daily targets completed! Great work.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
