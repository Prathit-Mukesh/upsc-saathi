"use client";

import { useState } from "react";
import { useBooks } from "../lib/db";
import { STATIC_BOOKS_PRESET } from "../lib/constants";
import { Card, Btn, Input, SectionTitle, ProgressBar, EmptyState, Label } from "./ui";
import { BookIcon, PlusIcon, EditIcon, TrashIcon } from "./icons";

export default function BooksTab() {
  const { data: books, insert, update, remove, bulkInsert } = useBooks();
  const [showForm, setShowForm] = useState(false);
  const [showPreset, setShowPreset] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: "", subject: "", target_reads: 3, reads: 0, revisions: 0, notes: "" });
  const [filterSubject, setFilterSubject] = useState("All");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim() || saving) return;
    setSaving(true);
    const data = { title: form.title, subject: form.subject, target_reads: Number(form.target_reads), reads: Number(form.reads), revisions: Number(form.revisions), notes: form.notes };
    if (editId) { await update(editId, data); setEditId(null); }
    else { await insert(data); }
    setForm({ title: "", subject: "", target_reads: 3, reads: 0, revisions: 0, notes: "" });
    setShowForm(false);
    setSaving(false);
  };

  const loadPreset = async () => {
    setSaving(true);
    const existing = new Set(books.map((b) => b.title));
    const newBooks = [];
    STATIC_BOOKS_PRESET.forEach((cat) => { cat.books.forEach((title) => { if (!existing.has(title)) newBooks.push({ title, subject: cat.subject, target_reads: 3, reads: 0, revisions: 0, notes: "" }); }); });
    if (newBooks.length > 0) await bulkInsert(newBooks);
    setShowPreset(false);
    setSaving(false);
  };

  const increment = async (id, field) => { const book = books.find((b) => b.id === id); if (book) await update(id, { [field]: book[field] + 1 }); };
  const decrement = async (id, field) => { const book = books.find((b) => b.id === id); if (book) await update(id, { [field]: Math.max(0, book[field] - 1) }); };

  const subjects = ["All", ...new Set(books.map((b) => b.subject).filter(Boolean))];
  const filtered = filterSubject === "All" ? books : books.filter((b) => b.subject === filterSubject);
  const completed = books.filter((b) => b.reads >= b.target_reads).length;
  const inProgress = books.filter((b) => b.reads > 0 && b.reads < b.target_reads).length;
  const notStarted = books.filter((b) => b.reads === 0).length;

  return (
    <div className="animate-fadeIn">
      <SectionTitle icon={<BookIcon />} action={
        <div className="flex gap-2">
          {books.length === 0 && <Btn variant="secondary" onClick={() => setShowPreset(true)}>Load Standard Books</Btn>}
          <Btn onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ title: "", subject: "", target_reads: 3, reads: 0, revisions: 0, notes: "" }); }}><PlusIcon /> Add Book</Btn>
        </div>
      }>Static Book Checklist</SectionTitle>
      <p className="text-sm text-[var(--text-secondary)] -mt-2 mb-4">Track reading progress. Log reads and revisions for each book.</p>

      {showPreset && (
        <Card highlight className="mb-4">
          <h3 className="text-[15px] font-semibold mt-0 mb-2">Load Standard UPSC Books?</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-3">Adds {STATIC_BOOKS_PRESET.reduce((s, c) => s + c.books.length, 0)} commonly recommended books.</p>
          <div className="flex gap-2"><Btn onClick={loadPreset} disabled={saving}>{saving ? "Loading..." : "Load Books"}</Btn><Btn variant="ghost" onClick={() => setShowPreset(false)}>Cancel</Btn></div>
        </Card>
      )}

      {showForm && (
        <Card highlight className="mb-4 animate-slideDown">
          <div className="flex flex-col gap-2.5">
            <Input placeholder="Book Title & Author" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
            <div className="flex gap-2.5">
              <div className="flex-[2]"><Input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
              <div className="flex-1"><Label>Target Reads</Label><Input type="number" value={form.target_reads} onChange={(e) => setForm({ ...form, target_reads: e.target.value })} /></div>
            </div>
            <Input placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="flex gap-2"><Btn onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : editId ? "Update" : "Add"} Book</Btn><Btn variant="ghost" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Btn></div>
          </div>
        </Card>
      )}

      {subjects.length > 2 && (
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {subjects.map((s) => (
            <button key={s} onClick={() => setFilterSubject(s)} className={`px-3.5 py-1 rounded-full text-xs border cursor-pointer font-serif transition-all ${filterSubject === s ? "bg-[var(--accent)] text-[var(--accent-text)] border-[var(--accent)]" : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)]"}`}>{s}</button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon="📚" message="No books added yet." action={books.length === 0 ? <Btn onClick={() => setShowPreset(true)}>Load Standard UPSC Books</Btn> : null} />
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((book) => (
            <Card key={book.id} className="!p-3.5">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1"><div className="font-medium text-[15px]">{book.title}</div><div className="text-xs text-[var(--text-muted)]">{book.subject}</div></div>
                <div className="flex gap-1">
                  <button onClick={() => { setForm(book); setEditId(book.id); setShowForm(true); }} className="bg-transparent border-none cursor-pointer text-[var(--text-muted)] p-1 hover:text-[var(--accent)]"><EditIcon /></button>
                  <button onClick={() => remove(book.id)} className="bg-transparent border-none cursor-pointer text-[var(--text-muted)] p-1 hover:text-[var(--danger)]"><TrashIcon /></button>
                </div>
              </div>
              <div className="flex gap-4 items-center flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-muted)] min-w-[44px]">Reads:</span>
                  <button onClick={() => decrement(book.id, "reads")} className="w-6 h-6 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] cursor-pointer text-[var(--text-secondary)] text-sm flex items-center justify-center">−</button>
                  <span className="font-mono font-semibold text-base min-w-[20px] text-center">{book.reads}</span>
                  <button onClick={() => increment(book.id, "reads")} className="w-6 h-6 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] cursor-pointer text-[var(--text-secondary)] text-sm flex items-center justify-center">+</button>
                  <span className="text-[11px] text-[var(--text-muted)]">/ {book.target_reads}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-muted)] min-w-[64px]">Revisions:</span>
                  <button onClick={() => decrement(book.id, "revisions")} className="w-6 h-6 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] cursor-pointer text-[var(--text-secondary)] text-sm flex items-center justify-center">−</button>
                  <span className="font-mono font-semibold text-base min-w-[20px] text-center">{book.revisions}</span>
                  <button onClick={() => increment(book.id, "revisions")} className="w-6 h-6 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] cursor-pointer text-[var(--text-secondary)] text-sm flex items-center justify-center">+</button>
                </div>
                <div className="flex-1 min-w-[100px]"><ProgressBar value={book.reads} max={book.target_reads} color={book.reads >= book.target_reads ? "var(--success)" : "var(--accent)"} /></div>
                {book.reads >= book.target_reads && <span className="text-[var(--success)] text-xs font-semibold">✅ Complete</span>}
              </div>
              {book.notes && <div className="text-xs text-[var(--text-muted)] mt-2 italic">{book.notes}</div>}
            </Card>
          ))}
        </div>
      )}

      {books.length > 0 && (
        <Card className="mt-4 !p-3.5">
          <div className="flex justify-around text-center flex-wrap gap-3">
            <div><div className="text-2xl font-bold text-[var(--accent)]">{books.length}</div><div className="text-[11px] text-[var(--text-muted)]">Total</div></div>
            <div><div className="text-2xl font-bold text-[var(--success)]">{completed}</div><div className="text-[11px] text-[var(--text-muted)]">Completed</div></div>
            <div><div className="text-2xl font-bold text-[var(--warning)]">{inProgress}</div><div className="text-[11px] text-[var(--text-muted)]">In Progress</div></div>
            <div><div className="text-2xl font-bold text-[var(--danger)]">{notStarted}</div><div className="text-[11px] text-[var(--text-muted)]">Not Started</div></div>
          </div>
        </Card>
      )}
    </div>
  );
}
