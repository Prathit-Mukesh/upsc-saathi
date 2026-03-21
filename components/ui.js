"use client";

// ─── CARD ───
export function Card({ children, className = "", highlight = false, ...props }) {
  return (
    <div
      className={`bg-[var(--bg-card)] border rounded-xl p-5 transition-theme ${
        highlight ? "border-[var(--accent)]" : "border-[var(--border)]"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── BUTTON ───
const BTN_VARIANTS = {
  primary:
    "bg-[var(--accent)] text-[var(--accent-text)] border-transparent hover:brightness-110",
  secondary:
    "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--bg-hover)]",
  danger: "bg-[var(--danger)] text-white border-transparent hover:brightness-110",
  ghost:
    "bg-transparent text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--bg-hover)]",
};

export function Btn({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  return (
    <button
      className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer inline-flex items-center gap-1.5 border font-serif transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${BTN_VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── INPUT ───
export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] font-serif outline-none transition-all ${className}`}
      {...props}
    />
  );
}

// ─── SELECT ───
export function Select({ className = "", children, ...props }) {
  return (
    <select
      className={`bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] font-serif outline-none transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

// ─── TEXTAREA ───
export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] font-serif outline-none resize-y min-h-[80px] transition-all ${className}`}
      {...props}
    />
  );
}

// ─── SECTION TITLE ───
export function SectionTitle({ children, icon, action }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold flex items-center gap-2 tracking-tight m-0">
        {icon && <span className="text-[var(--accent)]">{icon}</span>}
        {children}
      </h2>
      {action}
    </div>
  );
}

// ─── STAT BOX ───
export function StatBox({ label, value, sub, color = "var(--accent)" }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-5 py-4 flex-1 min-w-[140px]">
      <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-widest font-mono mb-1">
        {label}
      </div>
      <div
        className="text-3xl font-bold tracking-tight"
        style={{ color }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-xs text-[var(--text-secondary)] mt-0.5">
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── PROGRESS BAR ───
export function ProgressBar({
  value,
  max,
  color = "var(--accent)",
  height = 6,
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      className="bg-[var(--bg-secondary)] rounded-full w-full overflow-hidden"
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

// ─── EMPTY STATE ───
export function EmptyState({ icon, message, action }) {
  return (
    <div className="text-center py-10 text-[var(--text-muted)]">
      {icon && <div className="mb-3 text-2xl opacity-40">{icon}</div>}
      <p className="text-sm m-0">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── LABEL ───
export function Label({ children }) {
  return (
    <label className="text-[11px] text-[var(--text-muted)] block mb-1 uppercase tracking-wider font-mono">
      {children}
    </label>
  );
}
