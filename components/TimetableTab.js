"use client";

import { useState } from "react";
import { useTimetable } from "../lib/db";
import { dayOfWeek } from "../lib/utils";
import { DAYS, DAYS_SHORT } from "../lib/constants";
import { Card, Btn, Input, SectionTitle, EmptyState, Label } from "./ui";
import { CalendarIcon, PlusIcon, EditIcon, TrashIcon } from "./icons";

export default function TimetableTab() {
  const { data: slots, insert, update, remove, bulkInsert, bulkDelete } = useTimetable();
  const [selectedDay, setSelectedDay] = useState(dayOfWeek());
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ subject: "", start_time: "06:00", end_time: "07:00", notes: "" });
  const [saving, setSaving] = useState(false);

  const daySlots = slots.filter((s) => s.day === selectedDay).sort((a, b) => a.start_time.localeCompare(b.start_time));

  const handleSubmit = async () => {
    if (!form.subject.trim() || saving) return;
    setSaving(true);
    if (editId) {
      await update(editId, { subject: form.subject, start_time: form.start_time, end_time: form.end_time, notes: form.notes });
      setEditId(null);
    } else {
      await insert({ day: selectedDay, subject: form.subject, start_time: form.start_time, end_time: form.end_time, notes: form.notes });
    }
    setForm({ subject: "", start_time: "06:00", end_time: "07:00", notes: "" });
    setShowForm(false);
    setSaving(false);
  };

  const handleEdit = (slot) => {
    setForm({ subject: slot.subject, start_time: slot.start_time, end_time: slot.end_time, notes: slot.notes || "" });
    setEditId(slot.id);
    setShowForm(true);
  };

  const copyToDay = async (targetDay) => {
    const existingIds = slots.filter((s) => s.day === targetDay).map((s) => s.id);
    if (existingIds.length > 0) await bulkDelete(existingIds);
    const copies = daySlots.map((s) => ({ day: targetDay, subject: s.subject, start_time: s.start_time, end_time: s.end_time, notes: s.notes || "" }));
    await bulkInsert(copies);
  };

  return (
    <div className="animate-fadeIn">
      <SectionTitle icon={<CalendarIcon />} action={
        <Btn onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ subject: "", start_time: "06:00", end_time: "07:00", notes: "" }); }}>
          <PlusIcon /> Add Slot
        </Btn>
      }>Weekly Timetable</SectionTitle>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        {DAYS.map((d, i) => (
          <button key={d} onClick={() => setSelectedDay(d)}
            className={`px-4 py-2 rounded-lg border text-sm font-serif cursor-pointer transition-all ${selectedDay === d ? "bg-[var(--accent)] text-[var(--accent-text)] border-[var(--accent)] font-semibold" : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--bg-hover)]"}`}>
            {DAYS_SHORT[i]}
          </button>
        ))}
      </div>

      {showForm && (
        <Card highlight className="mb-4 animate-slideDown">
          <div className="flex flex-col gap-2.5">
            <Input placeholder="Subject / Activity (e.g., Polity – Laxmikanth Ch 5)" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} autoFocus />
            <div className="flex gap-2.5">
              <div className="flex-1"><Label>Start Time</Label><Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></div>
              <div className="flex-1"><Label>End Time</Label><Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></div>
            </div>
            <Input placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="flex gap-2">
              <Btn onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : editId ? "Update" : "Add"} Slot</Btn>
              <Btn variant="ghost" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Btn>
            </div>
          </div>
        </Card>
      )}

      {daySlots.length === 0 ? (
        <EmptyState icon="📅" message={`No slots for ${selectedDay}. Add your first time slot!`} />
      ) : (
        <div className="flex flex-col gap-2">
          {daySlots.map((slot) => (
            <Card key={slot.id} className="!p-3.5 flex items-center gap-3.5">
              <div className="font-mono text-xs text-[var(--accent)] bg-[var(--accent-dim)] px-2.5 py-1 rounded min-w-[110px] text-center">{slot.start_time} – {slot.end_time}</div>
              <div className="flex-1">
                <div className="font-medium text-[15px]">{slot.subject}</div>
                {slot.notes && <div className="text-xs text-[var(--text-muted)] mt-0.5">{slot.notes}</div>}
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => handleEdit(slot)} className="bg-transparent border-none cursor-pointer text-[var(--text-muted)] p-1 hover:text-[var(--accent)]"><EditIcon /></button>
                <button onClick={() => remove(slot.id)} className="bg-transparent border-none cursor-pointer text-[var(--text-muted)] p-1 hover:text-[var(--danger)]"><TrashIcon /></button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {daySlots.length > 0 && (
        <Card className="mt-4 !p-3.5">
          <div className="text-sm text-[var(--text-secondary)] mb-2">Copy this day&apos;s schedule to:</div>
          <div className="flex gap-1.5 flex-wrap">
            {DAYS.filter((d) => d !== selectedDay).map((d) => (
              <Btn key={d} variant="ghost" className="!text-xs !px-2.5 !py-1" onClick={() => copyToDay(d)}>{d.slice(0, 3)}</Btn>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
