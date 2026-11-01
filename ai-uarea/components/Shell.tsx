"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bot,
  Boxes,
  CalendarClock,
  ChevronDown,
  Cpu,
  FileText,
  Gauge,
  GitBranch,
  LayoutDashboard,
  Menu,
  Plug,
  Radio,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Terminal,
  Ticket,
  Workflow,
  X,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: React.ElementType; badge?: number; group: string };

export interface ShellProps {
  children: React.ReactNode;
  counts: { issues: number; live: number; projects: number; agents: number };
  storage: "mariadb" | "demo";
  user: { name: string; role: string; email: string };
}

export default function Shell({ children, counts, storage, user }: ShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Bangkok",
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const nav: NavItem[] = useMemo(
    () => [
      { href: "/", label: "ศูนย์ควบคุม", icon: LayoutDashboard, group: "ควบคุม" },
      { href: "/projects", label: "โปรเจกต์", icon: Boxes, badge: counts.projects, group: "ควบคุม" },
      { href: "/runs", label: "ผลการทดสอบ", icon: Activity, badge: counts.live || undefined, group: "การทดสอบ" },
      { href: "/flows", label: "Flow ทดสอบ", icon: Workflow, group: "การทดสอบ" },
      { href: "/schedule", label: "ตาราง & ปฏิทิน", icon: CalendarClock, group: "การทดสอบ" },
      { href: "/issues", label: "Issue / Ticket", icon: Ticket, badge: counts.issues, group: "คุณภาพ" },
      { href: "/agents", label: "ฝูง AI Agent", icon: Bot, badge: counts.agents, group: "คุณภาพ" },
      { href: "/models", label: "โมเดล AI", icon: Cpu, group: "คุณภาพ" },
      { href: "/docs", label: "คู่มือ & วิดีโอ", icon: FileText, group: "ผลผลิต" },
      { href: "/integrations", label: "การเชื่อมต่อ", icon: Plug, group: "ระบบ" },
      { href: "/mcp", label: "MCP Gateway", icon: Terminal, group: "ระบบ" },
      { href: "/settings", label: "นโยบาย & ตั้งค่า", icon: Settings2, group: "ระบบ" },
    ],
    [counts],
  );

  const groups = ["ควบคุม", "การทดสอบ", "คุณภาพ", "ผลผลิต", "ระบบ"];
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const sidebar = (
    <aside className="flex h-full w-[248px] shrink-0 flex-col border-r border-line bg-[#060b14]/92 backdrop-blur-xl">
      <div className="flex items-center gap-2.5 px-4 pb-4 pt-5">
        <div className="relative grid h-9 w-9 place-items-center rounded-xl border border-[rgba(34,211,238,0.35)] bg-[linear-gradient(135deg,rgba(34,211,238,0.2),rgba(167,139,250,0.16))]">
          <Gauge size={18} className="text-cyan-glow" />
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-mint shadow-[0_0_8px_#34d399]" />
        </div>
        <div>
          <div className="text-[14.5px] font-semibold leading-tight tracking-tight">
            AI <span className="text-cyan-glow">UAREAnizer</span>
          </div>
          <div className="font-mono text-[10px] tracking-wider text-txt-mute">ai.uarea.in</div>
        </div>
      </div>

      <div className="mx-3 mb-3 rounded-xl border border-[rgba(52,211,153,0.22)] bg-[rgba(52,211,153,0.06)] px-3 py-2">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-mint">
          <span className="pulse-dot text-mint" />
          Zero Touch · กำลังทำงาน
        </div>
        <div className="mt-1 font-mono text-[10px] text-txt-mute">
          {counts.live > 0 ? `${counts.live} run กำลังรัน` : "ไม่มี run ค้าง"} · {clock} ICT
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {groups.map((g) => (
          <div key={g} className="mb-3">
            <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#4a5a78]">{g}</div>
            <div className="space-y-0.5">
              {nav
                .filter((n) => n.group === g)
                .map((n) => {
                  const Icon = n.icon;
                  const on = active(n.href);
                  return (
                    <Link key={n.href} href={n.href} className={`nav-item ${on ? "nav-active" : ""}`}>
                      <Icon size={15} className={on ? "text-cyan-glow" : "text-[#6b7c9c]"} />
                      <span className="flex-1">{n.label}</span>
                      {n.badge ? (
                        <span
                          className={`rounded-md px-1.5 py-[1px] font-mono text-[10px] ${
                            n.href === "/issues"
                              ? "bg-[rgba(251,113,133,0.16)] text-[#fda4af]"
                              : n.href === "/runs"
                                ? "bg-[rgba(34,211,238,0.16)] text-cyan-glow"
                                : "bg-[#152238] text-txt-dim"
                          }`}
                        >
                          {n.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-3 py-3">
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-line bg-[#0a1220] px-2.5 py-2">
          <ShieldCheck size={14} className={storage === "mariadb" ? "text-mint" : "text-amber-glow"} />
          <div className="min-w-0">
            <div className="truncate text-[11px] font-semibold text-txt-dim">
              {storage === "mariadb" ? "MariaDB เชื่อมต่อแล้ว" : "โหมดสาธิต (in-memory)"}
            </div>
            <div className="font-mono text-[10px] text-txt-mute">
              {storage === "mariadb" ? "persistent storage" : "ตั้งค่า DB_HOST เพื่อใช้ MariaDB"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-1">
          <span className="grid h-7 w-7 place-items-center rounded-lg border border-[#22304f] bg-[#0f1a2c] text-[13px]">
            {user.role === "owner" ? "🧑‍💼" : "🤖"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11.5px] font-medium">{user.name}</div>
            <div className="truncate text-[10px] text-txt-mute">{user.email}</div>
          </div>
          <ChevronDown size={13} className="text-txt-mute" />
        </div>
      </div>
    </aside>
  );

  return (
    <div className="app-bg min-h-screen">
      <div className="pointer-events-none fixed inset-0 grid-veil opacity-60" />
      <div className="relative flex min-h-screen">
        <div className="hidden lg:sticky lg:top-0 lg:block lg:h-screen">{sidebar}</div>

        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-0 h-full">{sidebar}</div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-line bg-[#050a13]/85 backdrop-blur-xl">
            <div className="flex h-[58px] items-center gap-3 px-4 md:px-6">
              <button className="btn btn-ghost btn-sm lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="เมนู">
                {open ? <X size={16} /> : <Menu size={16} />}
              </button>

              <div className="hidden items-center gap-2 rounded-lg border border-line bg-[#0a1220] px-2.5 py-1.5 md:flex md:w-[330px]">
                <Search size={14} className="text-txt-mute" />
                <input
                  className="w-full bg-transparent text-[12px] outline-none placeholder:text-[#4a5a78]"
                  placeholder="ค้นหา flow, issue, run, agent…"
                />
                <kbd className="rounded border border-line bg-[#0d1728] px-1.5 py-[1px] font-mono text-[10px] text-txt-mute">
                  ⌘K
                </kbd>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <span className="hidden items-center gap-1.5 rounded-lg border border-[rgba(34,211,238,0.25)] bg-[rgba(34,211,238,0.07)] px-2.5 py-1.5 text-[11px] font-semibold text-cyan-glow sm:inline-flex">
                  <Sparkles size={12} /> ฝูง AI {counts.agents} ตัว
                </span>
                <a
                  href={process.env.NEXT_PUBLIC_MNG_URL || "https://mng.uarea.in"}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm"
                >
                  <Radio size={13} className="text-mint" /> mng.uarea.in
                </a>
                <Link href="/runs" className="btn btn-sm btn-primary">
                  <Activity size={13} /> ดูผลสด
                </Link>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-[1500px] px-4 py-6 md:px-6 md:py-7">{children}</main>

          <footer className="mx-auto max-w-[1500px] px-6 pb-8 pt-2">
            <div className="divider mb-3" />
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-txt-mute">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <GitBranch size={11} /> ai.uarea.in
                </span>
                <span>·</span>
                <span>UAT Orchestrator v1.0</span>
                <span>·</span>
                <span className="font-mono">
                  {storage === "mariadb" ? "MariaDB" : "Demo dataset"} / Next.js 15
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu size={11} /> หลายหัวดีกว่าหัวเดียว — แต่ทุกอย่างต้อง Auto
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
