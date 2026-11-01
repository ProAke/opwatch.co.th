import Link from "next/link";
import type { ReactNode } from "react";

// ── Status colours ──────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { fg: string; bg: string; border: string }> = {
  passed: { fg: "#6ee7b7", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.35)" },
  running: { fg: "#67e8f9", bg: "rgba(34,211,238,0.12)", border: "rgba(34,211,238,0.35)" },
  queued: { fg: "#a5b4fc", bg: "rgba(129,140,248,0.12)", border: "rgba(129,140,248,0.32)" },
  failed: { fg: "#fda4af", bg: "rgba(251,113,133,0.12)", border: "rgba(251,113,133,0.35)" },
  blocked: { fg: "#fdba74", bg: "rgba(251,146,60,0.12)", border: "rgba(251,146,60,0.35)" },
  pending: { fg: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.28)" },
  skipped: { fg: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.22)" },
  open: { fg: "#fda4af", bg: "rgba(251,113,133,0.12)", border: "rgba(251,113,133,0.35)" },
  triaged: { fg: "#fdba74", bg: "rgba(251,146,60,0.12)", border: "rgba(251,146,60,0.35)" },
  fixing: { fg: "#c4b5fd", bg: "rgba(167,139,250,0.14)", border: "rgba(167,139,250,0.38)" },
  in_review: { fg: "#67e8f9", bg: "rgba(34,211,238,0.12)", border: "rgba(34,211,238,0.32)" },
  closed: { fg: "#6ee7b7", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.28)" },
  wontfix: { fg: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.22)" },
  active: { fg: "#6ee7b7", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.28)" },
  paused: { fg: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)" },
  draft: { fg: "#a5b4fc", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.28)" },
  ready: { fg: "#6ee7b7", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.28)" },
  archived: { fg: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)" },
  connected: { fg: "#6ee7b7", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.28)" },
  disconnected: { fg: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)" },
  error: { fg: "#fda4af", bg: "rgba(251,113,133,0.12)", border: "rgba(251,113,133,0.35)" },
  generating: { fg: "#67e8f9", bg: "rgba(34,211,238,0.12)", border: "rgba(34,211,238,0.32)" },
};

export const LABEL: Record<string, string> = {
  passed: "ผ่าน",
  running: "กำลังรัน",
  queued: "รอคิว",
  failed: "ไม่ผ่าน",
  blocked: "ติดบล็อก",
  pending: "รอ",
  skipped: "ข้าม",
  open: "เปิด",
  triaged: "คัดกรอง",
  fixing: "กำลังแก้",
  in_review: "รอตรวจซ้ำ",
  closed: "ปิดแล้ว",
  wontfix: "ไม่แก้",
  active: "ใช้งาน",
  paused: "หยุดชั่วคราว",
  draft: "ฉบับร่าง",
  ready: "พร้อมใช้",
  archived: "เก็บถาวร",
  connected: "เชื่อมต่อแล้ว",
  disconnected: "ยังไม่เชื่อมต่อ",
  error: "ผิดพลาด",
  generating: "กำลังสร้าง",
  S1: "S1 · วิกฤต",
  S2: "S2 · สูง",
  S3: "S3 · กลาง",
  S4: "S4 · ต่ำ",
  production: "Production",
  staging: "Staging",
  demo: "Demo",
  local: "Local",
};

export function StatusPill({ status, dot = true, className = "" }: { status: string; dot?: boolean; className?: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-[3px] text-[11px] font-semibold ${className}`}
      style={{ color: s.fg, background: s.bg, borderColor: s.border }}
    >
      {dot && <span className="h-[6px] w-[6px] rounded-full" style={{ background: s.fg }} />}
      {LABEL[status] ?? status}
    </span>
  );
}

export function SeverityTag({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    S1: "text-[#fda4af] bg-[rgba(251,113,133,0.13)] border-[rgba(251,113,133,0.4)]",
    S2: "text-[#fdba74] bg-[rgba(251,146,60,0.12)] border-[rgba(251,146,60,0.38)]",
    S3: "text-[#fde68a] bg-[rgba(250,204,21,0.1)] border-[rgba(250,204,21,0.3)]",
    S4: "text-[#7dd3fc] bg-[rgba(56,189,248,0.1)] border-[rgba(56,189,248,0.3)]",
  };
  return (
    <span className={`inline-flex items-center rounded-md border px-1.5 py-[2px] text-[11px] font-bold ${map[severity] ?? map.S4}`}>
      {severity}
    </span>
  );
}

export function Card({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return <div className={`card ${hover ? "card-hover" : ""} ${className}`}>{children}</div>;
}

export function SectionTitle({
  title,
  subtitle,
  right,
  icon,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {icon && (
          <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg border border-[#1e2b46] bg-[#0d1728] text-cyan-glow">
            {icon}
          </span>
        )}
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-txt">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[12px] text-txt-mute">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Metric({
  label,
  value,
  hint,
  accent = "#22d3ee",
  icon,
  delta,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: string;
  icon?: ReactNode;
  delta?: number;
}) {
  return (
    <div className="card card-hover relative overflow-hidden p-4">
      <div
        className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full opacity-[0.14] blur-2xl"
        style={{ background: accent }}
      />
      <div className="flex items-center justify-between">
        <span className="label">{label}</span>
        {icon && <span style={{ color: accent }}>{icon}</span>}
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span className="kpi-value text-[27px] font-semibold leading-none" style={{ color: accent }}>
          {value}
        </span>
        {typeof delta === "number" && (
          <span
            className={`mb-0.5 text-[11px] font-semibold ${delta >= 0 ? "text-mint" : "text-danger"}`}
          >
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
          </span>
        )}
      </div>
      {hint && <div className="mt-1.5 text-[11px] text-txt-mute">{hint}</div>}
    </div>
  );
}

export function Sparkline({
  data,
  color = "#22d3ee",
  height = 40,
  width = 130,
  fill = true,
}: {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  fill?: boolean;
}) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * width;
    const y = height - ((v - min) / span) * (height - 4) - 2;
    return [x, y] as const;
  });
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${path} L${width},${height} L0,${height} Z`;
  const gid = `sg-${color.replace("#", "")}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.2" fill={color} />
    </svg>
  );
}

export function Ring({
  value,
  size = 108,
  stroke = 9,
  color = "#22d3ee",
  label,
  sub,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
  sub?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(Math.max(value, 0), 100) / 100) * c;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#16223a" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .8s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="kpi-value text-[22px] font-semibold leading-none" style={{ color }}>
          {label ?? `${value}%`}
        </div>
        {sub && <div className="mt-1 text-[10px] uppercase tracking-widest text-txt-mute">{sub}</div>}
      </div>
    </div>
  );
}

export function Progress({ value, color = "#22d3ee", height = 6 }: { value: number; color?: string; height?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-full bg-[#131d30]" style={{ height }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%`, background: color }}
      />
    </div>
  );
}

export function Avatar({ name, emoji, size = 30 }: { name?: string; emoji?: string; size?: number }) {
  const initials = (name ?? "AI")
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <span
      className="grid shrink-0 place-items-center rounded-lg border border-[#22304f] bg-[#0f1a2c] font-semibold text-[#c7d6f0]"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      title={name}
    >
      {emoji ?? initials}
    </span>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-[#1e2b46] bg-[#080e1a]/60 px-6 py-10 text-center">
      <div className="mb-2 grid h-10 w-10 place-items-center rounded-full border border-[#22304f] bg-[#0d1728] text-txt-mute">
        ◍
      </div>
      <p className="text-[13px] font-semibold text-txt-dim">{title}</p>
      {hint && <p className="mt-1 max-w-md text-[12px] text-txt-mute">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LinkBtn({ href, children, variant = "ghost" }: { href: string; children: ReactNode; variant?: "ghost" | "primary" }) {
  return (
    <Link href={href} className={`btn btn-sm ${variant === "primary" ? "btn-primary" : ""}`}>
      {children}
    </Link>
  );
}

export function KV({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line-soft py-2 last:border-0">
      <span className="text-[11.5px] text-txt-mute">{k}</span>
      <span className="max-w-[62%] text-right text-[12px] font-medium text-txt-dim">{v}</span>
    </div>
  );
}

export function Bar({ items }: { items: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-2.5">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-3">
          <span className="w-7 text-[11px] font-semibold" style={{ color: i.color }}>
            {i.label}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#131d30]">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(i.value / max) * 100}%`, background: i.color }}
            />
          </div>
          <span className="kpi-value w-6 text-right text-[11px] text-txt-dim">{i.value}</span>
        </div>
      ))}
    </div>
  );
}
