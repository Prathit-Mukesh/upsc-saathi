"use client";

import { useState } from "react";
import { usePrelimsLog } from "../lib/db";
import { todayStr, formatDate } from "../lib/utils";
import { PRELIMS_SUBJECTS } from "../lib/constants";
import { Card, Btn, Input, Select, SectionTitle, StatBox, ProgressBar, EmptyState, Label } from "./ui";
import { TargetIcon, PlusIcon, TrashIcon } from "./icons";

export default function PrelimsTab({ markToday }) {
  const { data: log, insert, remove } = usePrelimsLog();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: PRELIMS_SUBJECTS[0], total: 20, correct: 0, year: "2024", time_taken: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (saving) return;
    setSaving(true);
    await insert({ date: todayStr(), subject: form.subject, total: Number(form.total) || 0, correct: Number(form.correct) || 0, year: form.year, time_taken: form.time_taken, notes: form.notes });
    markToday();
    setForm({ subject: PRELIMS_SUBJECTS[0], total: 20, correct: 0, year: "2024", time_taken: "", notes: "" });
    setShowForm(false);
    setSaving(false);
  };

  const td = todayStr();
  const todayEntries = log.filter((l) => l.date === td);
  const todayTotal = todayEntries.reduce((s, l) => s + l.total, 0);
  const todayCorrect = todayEntries.reduce((s, l) => s + l.correct, 0);
  const allTotal = log.reduce((s, l) => s + l.total, 0);
  const allCorrect = log.reduce((s, l) => s + l.correct, 0);

  const subjectStats = {};
  log.forEach((l) => {
    if (!subjectStats[l.subject]) subjectStats[l.subject] = { total: 0, correct: 0 };
    subjectStats[l.subject].total += l.total;
    subjectStats[l.subject].correct += l.correct;
  });

  return (
    <div className="animate-fadeIn">
      <SectionTitle icon={<TargetIcon />} action={<Btn onClick={() => setShowForm(!showForm)}><PlusIcon /> Log Session</Btn>}>Prelims PYQ Practice</SectionTitle>
      <p className="text-sm text-[var(--text-secondary)] -mt-2 mb-4">Daily target: 20 MCQs · Track your PYQ practice across subjects and years.</p>

      <div className="flex gap-3 flex-wrap mb-5">
        <StatBox label="Today" value={todayTotal} sub={`${todayCorrect} correct · ${todayTotal > 0 ? Math.round((todayCorrect / todayTotal) * 100) : 0}%`} />
        <StatBox label="All Time" value={allTotal} sub={`${allCorrect} correct · ${allTotal > 0 ? Math.round((allCorrect / allTotal) * 100) : 0}%`} color="var(--success)" />
        <StatBox label="Today's Target" value={`${Math.min(todayTotal, 20)}/20`} sub={todayTotal >= 20 ? "✅ Completed!" : `${20 - todayTotal} remaining`} color={todayTotal >= 20 ? "var(--success)" : "var(--warning)"} />
      </div>

      {showForm && (
        <Card highlight className="mb-4 animate-slideDown">
          <h3 className="text-base font-semibold mb-3 mt-0">Log Practice Session</h3>
          <div className="flex flex-col gap-2.5">
            <div className="flex gap-2.5 flex-wrap">
              <div className="flex-[2] min-w-[160px]"><Label>Subject</Label><Select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full">{PRELIMS_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}</Select></div>
              <div className="flex-1 min-w-[80px]"><Label>PYQ Year</Label><Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2024" /></div>
            </div>
            <div className="flex gap-2.5">
              <div className="flex-1"><Label>Attempted</Label><Input type="number" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} /></div>
              <div className="flex-1"><Label>Correct</Label><Input type="number" value={form.correct} onChange={(e) => setForm({ ...form, correct: e.target.value })} /></div>
              <div className="flex-1"><Label>Time (mins)</Label><Input type="number" value={form.time_taken} onChange={(e) => setForm({ ...form, time_taken: e.target.value })} placeholder="30" /></div>
            </div>
            <Input placeholder="Notes (weak topics, mistakes, etc.)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="flex gap-2"><Btn onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : "Save Session"}</Btn><Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn></div>
          </div>
        </Card>
      )}

      {Object.keys(subjectStats).length > 0 && (
        <Card className="mb-4">
          <h3 className="text-[15px] font-semibold mb-3 mt-0">Subject-wise Performance</h3>
          <div className="flex flex-col gap-2.5">
            {Object.entries(subjectStats).sort((a, b) => b[1].total - a[1].total).map(([sub, st]) => {
              const pct = Math.round((st.correct / st.total) * 100);
              return (<div key={sub}><div className="flex justify-between text-sm mb-1"><span>{sub}</span><span className="font-mono text-xs">{st.correct}/{st.total} · {pct}%</span></div><ProgressBar value={st.correct} max={st.total} color={pct >= 70 ? "var(--success)" : pct >= 40 ? "var(--warning)" : "var(--danger)"} /></div>);
            })}
          </div>
        </Card>
      )}

      <Card>
        <h3 className="text-[15px] font-semibold mb-3 mt-0">Recent Sessions</h3>
        {log.length === 0 ? <EmptyState icon="🎯" message="No practice sessions logged yet." /> : (
          <div className="flex flex-col gap-1.5">
            {log.slice(0, 20).map((entry) => {
              const pct = entry.total > 0 ? Math.round((entry.correct / entry.total) * 100) : 0;
              return (
                <div key={entry.id} className="flex items-center gap-3 px-3 py-2.5 bg-[var(--bg-secondary)] rounded-md">
                  <span className="font-mono text-[11px] text-[var(--text-muted)] min-w-[70px]">{formatDate(entry.date)}</span>
                  <span className="text-sm font-medium flex-1">{entry.subject}</span>
                  <span className="font-mono text-xs text-[var(--text-muted)]">Y:{entry.year}</span>
                  <span className={`font-mono text-xs font-semibold ${pct >= 70 ? "text-[var(--success)]" : pct >= 40 ? "text-[var(--warning)]" : "text-[var(--danger)]"}`}>{entry.correct}/{entry.total}</span>
                  <button onClick={() => remove(entry.id)} className="bg-transparent border-none cursor-pointer text-[var(--text-muted)] p-0.5 hover:text-[var(--danger)]"><TrashIcon /></button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
