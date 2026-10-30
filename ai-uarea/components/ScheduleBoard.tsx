"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Pause,
  Play,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type { Schedule } from "@/lib/types";
import { countdown, fmtDateTime, relTime } from "@/lib/metrics";
import { Card, SectionTitle, StatusPill } from "@/components/ui";

type Row = Schedule & { projectName: string; flowName: string; agentName: string; agentAvatar: string };
type RunLite = { id: string; createdAt: string; status: string; projectId: string; flowId: string };

const CADENCE_LABEL: Record<string, string> = {
  manual: "Manual",
  hourly: "ทุกชั่วโมง",
  daily: "ทุกวัน",
  weekdays: "จันทร์–ศุกร์",
  weekly: "ทุกสัปดาห์",
  monthly: "ทุกเดือน",
};

const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

export default function ScheduleBoard({
  schedules,
  flows,
  projects,
  agents,
  runs,
}: {
  schedules: Row[];
  flows: { id: string; name: string; projectId: string }[];
  projects: { id: string; name: string; key: string; color: string }[];
  agents: { id: string; name: string; avatar: string }[];
  runs: RunLite[];
}) {
  const router = useRouter();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [busy, setBusy] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    projectId: projects[0]?.id ?? "",
    flowId: flows[0]?.id ?? "",
    name: "",
    cadence: "daily",
    timeOfDay: "09:00",
    agentId: agents[0]?.id ?? "",
    env: "demo",
  });

  const { year, month } = cursor;
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = firstDay.getDay();

  const runsByDay = useMemo(() => {
    const map: Record<string, RunLite[]> = {};
    for (const r of runs) {
      const k = r.createdAt.slice(0, 10);
      (map[k] ??= []).push(r);
    }
    return map;
  }, [runs]);

  const scheduleByDay = useMemo(() => {
    const map: Record<string, Row[]> = {};
    for (const sc of schedules) {
      if (!sc.nextRunAt) continue;
      const k = sc.nextRunAt.slice(0, 10);
      (map[k] ??= []).push(sc);
    }
    return map;
  }, [schedules]);

  async function toggle(sc: Row) {
    setBusy(sc.id);
    await fetch("/api/schedules", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...sc, status: sc.status === "active" ? "paused" : "active" }),
    });
    setBusy(null);
    router.refresh();
  }

  async function runNow(sc: Row) {
    setBusy(sc.id);
    const res = await fetch("/api/runs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: sc.flowId, projectId: sc.projectId, trigger: "schedule" }),
    });
    const data = await res.json();
    setBusy(null);
    if (data?.run?.id) router.push(`/runs/${data.run.id}`);
  }

  async function remove(sc: Row) {
    if (!confirm(`ลบตาราง “${sc.name}”?`)) return;
    setBusy(sc.id);
    await fetch(`/api/schedules?id=${sc.id}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  }

  async function create() {
    if (!form.name || !form.flowId || !form.projectId) return;
    setBusy("create");
    const res = await fetch("/api/schedules", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(null);
    if (res.ok) {
      setShowForm(false);
      setForm({ ...form, name: "" });
      router.refresh();
    }
  }

  const cell = (day: number | null, key?: string) => {
    const isToday = key === new Date().toISOString().slice(0, 10);
    const dayRuns = key ? runsByDay[key] ?? [] : [];
    const daySchedules = key ? scheduleByDay[key] ?? [] : [];
    return (
      <div
        key={key ?? `empty-${day}`}
        className={`min-h-[92px] rounded-lg border p-1.5 ${
          day ? (isToday ? "border-[rgba(34,211,238,0.45)] bg-[rgba(34,211,238,0.05)]" : "border-line-soft bg-[#080f1c]/70") : "border-transparent"
        }`}
      >
        {day && (
          <>
            <div className={`flex items-center justify-between font-mono text-[10px] ${isToday ? "text-cyan-glow" : "text-txt-mute"}`}>
              <span>{day}</span>
              {dayRuns.length > 0 && <span className="text-[9px] text-txt-mute">{dayRuns.length} runs</span>}
            </div>
            <div className="mt-1 flex flex-wrap gap-[3px]">
              {dayRuns.slice(0, 6).map((r) => (
                <span
                  key={r.id}
                  title={`${r.status} · ${r.id}`}
                  className="h-[5px] w-[5px] rounded-full"
                  style={{ background: r.status === "passed" ? "#34d399" : r.status === "failed" ? "#fb7185" : "#22d3ee" }}
                />
              ))}
            </div>
            <div className="mt-1 space-y-[3px]">
              {daySchedules.slice(0, 2).map((sc) => (
                <div key={sc.id} className="truncate rounded bg-[rgba(167,139,250,0.12)] px-1 py-[1px] text-[8.5px] text-[#c4b5fd]" title={sc.name}>
                  {sc.timeOfDay} {sc.name}
                </div>
              ))}
              {daySchedules.length > 2 && <div className="text-[8px] text-txt-mute">+{daySchedules.length - 2}</div>}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label mb-1">Calendar & scheduler</div>
          <h1 className="text-[22px] font-semibold tracking-tight">ตารางการทดสอบ</h1>
          <p className="mt-1 text-[12.5px] text-txt-mute">
            ตั้งรอบให้ AI รันเอง (Asia/Bangkok) — ทุกครั้งที่รันผลจะถูกส่งเข้า mng.uarea.in อัตโนมัติ
          </p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn btn-primary btn-sm">
          <Plus size={13} /> เพิ่มตาราง
        </button>
      </div>

      {showForm && (
        <Card className="fade-in p-4">
          <div className="flex items-center justify-between">
            <SectionTitle title="สร้างตารางทดสอบใหม่" subtitle="เลือก flow แล้วกำหนดรอบ" />
            <button onClick={() => setShowForm(false)} className="btn btn-sm btn-ghost">
              <X size={13} />
            </button>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div>
              <label className="label">ชื่อตาราง</label>
              <input className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="เช่น ตรวจภาษีประจำวัน" />
            </div>
            <div>
              <label className="label">โปรเจกต์</label>
              <select
                className="input mt-1"
                value={form.projectId}
                onChange={(e) => {
                  const p = e.target.value;
                  const firstFlow = flows.find((f) => f.projectId === p);
                  setForm({ ...form, projectId: p, flowId: firstFlow?.id ?? form.flowId });
                }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0a1220]">
                    {p.key} — {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Flow</label>
              <select className="input mt-1" value={form.flowId} onChange={(e) => setForm({ ...form, flowId: e.target.value })}>
                {flows
                  .filter((f) => f.projectId === form.projectId)
                  .map((f) => (
                    <option key={f.id} value={f.id} className="bg-[#0a1220]">
                      {f.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="label">ความถี่</label>
              <select className="input mt-1" value={form.cadence} onChange={(e) => setForm({ ...form, cadence: e.target.value })}>
                {Object.entries(CADENCE_LABEL).map(([k, v]) => (
                  <option key={k} value={k} className="bg-[#0a1220]">
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">เวลา (ICT)</label>
              <input type="time" className="input mt-1" value={form.timeOfDay} onChange={(e) => setForm({ ...form, timeOfDay: e.target.value })} />
            </div>
            <div>
              <label className="label">Agent</label>
              <select className="input mt-1" value={form.agentId} onChange={(e) => setForm({ ...form, agentId: e.target.value })}>
                {agents.map((a) => (
                  <option key={a.id} value={a.id} className="bg-[#0a1220]">
                    {a.avatar} {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="btn btn-sm">
              ยกเลิก
            </button>
            <button onClick={create} disabled={busy === "create"} className="btn btn-sm btn-primary">
              {busy === "create" ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} บันทึกตาราง
            </button>
          </div>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <SectionTitle title={`${MONTHS[month]} ${year + 543}`} subtitle="จุดสี = run ที่เกิดขึ้น · ป้ายม่วง = ตารางถัดไป" icon={<CalendarDays size={15} />} />
            <div className="flex items-center gap-1">
              <button className="btn btn-sm btn-ghost" onClick={() => setCursor(month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 })}>
                <ChevronLeft size={13} />
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => { const d = new Date(); setCursor({ year: d.getFullYear(), month: d.getMonth() }); }}>
                วันนี้
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => setCursor(month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 })}>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((d) => (
              <div key={d} className="pb-1 text-center text-[10px] font-semibold text-txt-mute">
                {d}
              </div>
            ))}
            {Array.from({ length: leading }).map((_, i) => cell(null, undefined))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              return cell(day, key);
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <SectionTitle title="รอบถัดไป 24 ชั่วโมง" icon={<Clock size={15} />} />
            <div className="mt-3 space-y-2">
              {schedules
                .filter((sc) => sc.status === "active" && sc.nextRunAt)
                .sort((a, b) => (a.nextRunAt! < b.nextRunAt! ? -1 : 1))
                .slice(0, 6)
                .map((sc) => (
                  <div key={sc.id} className="rounded-lg border border-line bg-[#0a1220]/70 p-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-[11.5px] font-medium">{sc.name}</div>
                        <div className="font-mono text-[9.5px] text-txt-mute">
                          {sc.projectName} · {sc.flowName.slice(0, 26)}
                        </div>
                      </div>
                      <span className="shrink-0 font-mono text-[10.5px] text-cyan-glow">{countdown(sc.nextRunAt)}</span>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle title="นโยบายการรันอัตโนมัติ" />
            <ul className="mt-2 space-y-1.5 text-[11.5px] text-txt-dim">
              <li>• รันเฉพาะ env <span className="font-mono text-mint">demo/staging</span> และฐาน <span className="font-mono text-mint">smldemo</span> เท่านั้น</li>
              <li>• ถ้าระบบหลักล่ม ระบบจะลองใหม่ 2 ครั้งก่อนรายงานเป็น blocked</li>
              <li>• ผลลัพธ์ทุกรอบถูกส่งเข้า mng.uarea.in ภายใน 90 วินาที</li>
              <li>• ถ้าพบ S1 ระบบหยุดคิวที่เหลือและแจ้งบน Slack #uat-alerts</li>
            </ul>
          </Card>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 pt-4">
          <SectionTitle title={`ตารางทั้งหมด (${schedules.length})`} subtitle="กดหยุด/เปิดเพื่อควบคุมได้ทันที" icon={<CalendarDays size={15} />} />
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr>
                <th className="table-th">ชื่อตาราง</th>
                <th className="table-th">Flow</th>
                <th className="table-th">ความถี่</th>
                <th className="table-th">ถัดไป</th>
                <th className="table-th">ผลล่าสุด</th>
                <th className="table-th">สถานะ</th>
                <th className="table-th text-right">การกระทำ</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((sc) => (
                <tr key={sc.id} className="transition hover:bg-[#0c1626]/70">
                  <td className="table-td">
                    <div className="text-[12px] font-medium">{sc.name}</div>
                    <div className="font-mono text-[9.5px] text-txt-mute">{sc.projectName} · {sc.agentAvatar} {sc.agentName.split(" ")[0]}</div>
                  </td>
                  <td className="table-td max-w-[220px]">
                    <Link href={`/flows/${sc.flowId}`} className="line-clamp-1 text-[11.5px] text-txt-dim hover:text-cyan-glow">
                      {sc.flowName}
                    </Link>
                  </td>
                  <td className="table-td">
                    <div className="text-[11.5px]">{CADENCE_LABEL[sc.cadence]}</div>
                    <div className="font-mono text-[9.5px] text-txt-mute">{sc.timeOfDay} ICT</div>
                  </td>
                  <td className="table-td">
                    <div className="font-mono text-[11px] text-cyan-glow">{sc.nextRunAt ? countdown(sc.nextRunAt) : "—"}</div>
                    <div className="font-mono text-[9px] text-txt-mute">{fmtDateTime(sc.nextRunAt)}</div>
                  </td>
                  <td className="table-td">
                    {sc.lastStatus ? <StatusPill status={sc.lastStatus} dot={false} /> : <span className="text-[10.5px] text-txt-mute">ยังไม่เคยรัน</span>}
                    <div className="mt-0.5 text-[9px] text-txt-mute">{relTime(sc.lastRunAt)}</div>
                  </td>
                  <td className="table-td">
                    <StatusPill status={sc.status} dot={false} />
                  </td>
                  <td className="table-td">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => runNow(sc)} disabled={busy === sc.id} className="btn btn-sm btn-ghost px-2" title="รันเดี๋ยวนี้">
                        {busy === sc.id ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} />}
                      </button>
                      <button onClick={() => toggle(sc)} disabled={busy === sc.id} className="btn btn-sm btn-ghost px-2" title={sc.status === "active" ? "หยุด" : "เปิด"}>
                        {sc.status === "active" ? <Pause size={11} /> : <Play size={11} className="text-mint" />}
                      </button>
                      <button onClick={() => remove(sc)} disabled={busy === sc.id} className="btn btn-sm btn-ghost px-2 text-danger" title="ลบ">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
