"use client";

import { useState } from "react";
import { useMainsLog } from "../lib/db";
import { todayStr, formatDate } from "../lib/utils";
import { MAINS_PAPERS } from "../lib/constants";
import { Card, Btn, Input, Select, SectionTitle, StatBox, EmptyState, Label } from "./ui";
import { EditIcon, PlusIcon, TrashIcon, DownloadIcon } from "./icons";

export default function MainsTab({ markToday }) {
  const { data: log, insert, remove } = useMainsLog();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ paper: "gs1", question: "", year: "2024", word_count: "", time_taken: "", self_score: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.question.trim() || saving) return;
    setSaving(true);
    await insert({ date: todayStr(), paper: form.paper, question: form.question, year: form.year, word_count: Number(form.word_count) || 0, time_taken: Number(form.time_taken) || 0, self_score: Number(form.self_score) || 0, notes: form.notes });
    markToday();
    setForm({ paper: "gs1", question: "", year: "2024", word_count: "", time_taken: "", self_score: "", notes: "" });
    setShowForm(false);
    setSaving(false);
  };

  const handleDownload = (entry) => {
    const paperName = MAINS_PAPERS.find((p) => p.id === entry.paper)?.name || entry.paper;
    const text = ["UPSC Mains Answer Record", "=".repeat(50), `Date: ${formatDate(entry.date)}`, `Paper: ${paperName}`, `PYQ Year: ${entry.year}`, "", "QUESTION:", entry.question, "", `Word Count: ${entry.word_count}`, `Time Taken: ${entry.time_taken} mins`, `Self Score: ${entry.self_score}/10`, "", `Notes: ${entry.notes || "None"}`].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `mains_${entry.date}_${entry.paper}.txt`; a.click(); URL.revokeObjectURL(url);
  };

  const td = todayStr();
  const todayCount = log.filter((l) => l.date === td).length;
  const avgScore = log.length > 0 ? (log.reduce((s, l) => s + l.self_score, 0) / log.length).toFixed(1) : "—";

  const paperStats = {};
  log.forEach((l) => { if (!paperStats[l.paper]) paperStats[l.paper] = { count: 0, totalScore: 0 }; paperStats[l.paper].count++; paperStats[l.paper].totalScore += l.self_score; });

  return (
    <div className="animate-fadeIn">
      <SectionTitle icon={<EditIcon />} action={<Btn onClick={() => setShowForm(!showForm)}><PlusIcon /> Log Answer</Btn>}>Mains Answer Writing</SectionTitle>
      <p className="text-sm text-[var(--text-secondary)] -mt-2 mb-4">Daily target: 5 answers · Choose your paper, log practice, download records.</p>

      <div className="flex gap-3 flex-wrap mb-5">
        <StatBox label="Today" value={todayCount} sub={todayCount >= 5 ? "✅ Target met!" : `${5 - todayCount} more to go`} />
        <StatBox label="Total Answers" value={log.length} sub="all time" color="var(--success)" />
        <StatBox label="Avg Self-Score" value={avgScore} sub="out of 10" color="var(--warning)" />
      </div>

      {showForm && (
        <Card highlight className="mb-4 animate-slideDown">
          <h3 className="text-base font-semibold mb-3 mt-0">Log Answer</h3>
          <div className="flex flex-col gap-2.5">
            <div className="flex gap-2.5 flex-wrap">
              <div className="flex-[2] min-w-[160px]"><Label>Paper</Label><Select value={form.paper} onChange={(e) => setForm({ ...form, paper: e.target.value })} className="w-full">{MAINS_PAPERS.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.desc}</option>)}</Select></div>
              <div className="flex-1 min-w-[80px]"><Label>PYQ Year</Label><Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></div>
            </div>
            <div><Label>Question</Label><textarea placeholder="Write the full question text here..." value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] font-serif outline-none resize-y min-h-[80px]" /></div>
            <div className="flex gap-2.5 flex-wrap">
              <div className="flex-1 min-w-[80px]"><Label>Words</Label><Input type="number" value={form.word_count} onChange={(e) => setForm({ ...form, word_count: e.target.value })} placeholder="250" /></div>
              <div className="flex-1 min-w-[80px]"><Label>Time (mins)</Label><Input type="number" value={form.time_taken} onChange={(e) => setForm({ ...form, time_taken: e.target.value })} placeholder="15" /></div>
              <div className="flex-1 min-w-[80px]"><Label>Self Score /10</Label><Input type="number" min="0" max="10" value={form.self_score} onChange={(e) => setForm({ ...form, self_score: e.target.value })} /></div>
            </div>
            <Input placeholder="Notes / areas to improve" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="flex gap-2"><Btn onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : "Save Answer Log"}</Btn><Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn></div>
          </div>
        </Card>
      )}

      {Object.keys(paperStats).length > 0 && (
        <Card className="mb-4">
          <h3 className="text-[15px] font-semibold mb-3 mt-0">Paper-wise Breakdown</h3>
          <div className="flex flex-wrap gap-2.5">
            {MAINS_PAPERS.filter((p) => paperStats[p.id]).map((p) => { const st = paperStats[p.id]; return (
              <div key={p.id} className="flex-1 basis-[140px] p-3 bg-[var(--bg-secondary)] rounded-lg text-center">
                <div className="text-xs text-[var(--text-muted)] mb-1">{p.name}</div>
                <div className="text-2xl font-bold text-[var(--accent)]">{st.count}</div>
                <div className="text-[11px] text-[var(--text-muted)]">avg {(st.totalScore / st.count).toFixed(1)}/10</div>
              </div>); })}
          </div>
        </Card>
      )}

      <Card>
        <h3 className="text-[15px] font-semibold mb-3 mt-0">Answer Log</h3>
        {log.length === 0 ? <EmptyState icon="✍️" message="No answers logged yet." /> : (
          <div className="flex flex-col gap-2">
            {log.slice(0, 25).map((entry) => {
              const paperName = MAINS_PAPERS.find((p) => p.id === entry.paper)?.name || entry.paper;
              return (
                <div key={entry.id} className="p-3 bg-[var(--bg-secondary)] rounded-lg" style={{ borderLeft: `3px solid ${entry.self_score >= 7 ? "var(--success)" : entry.self_score >= 4 ? "var(--warning)" : "var(--danger)"}` }}>
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="font-mono text-[11px] text-[var(--text-muted)]">{formatDate(entry.date)} · {paperName} · Y:{entry.year}</span>
                    <div className="flex gap-1.5 items-center">
                      <span className="font-mono text-sm font-semibold text-[var(--accent)]">{entry.self_score}/10</span>
                      <button onClick={() => handleDownload(entry)} className="bg-transparent border-none cursor-pointer text-[var(--text-muted)] p-0.5 hover:text-[var(--accent)]"><DownloadIcon /></button>
                      <button onClick={() => remove(entry.id)} className="bg-transparent border-none cursor-pointer text-[var(--text-muted)] p-0.5 hover:text-[var(--danger)]"><TrashIcon /></button>
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed">{entry.question}</div>
                  {entry.notes && <div className="text-xs text-[var(--text-muted)] mt-1">📝 {entry.notes}</div>}
                  <div className="text-[11px] text-[var(--text-muted)] mt-1 font-mono">{entry.word_count > 0 && `${entry.word_count} words · `}{entry.time_taken > 0 && `${entry.time_taken} min`}</div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
