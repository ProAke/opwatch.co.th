"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cpu, KeyRound, Loader2, Pause, Play, Zap } from "lucide-react";
import type { AiModel, Agent } from "@/lib/types";
import { Card, SectionTitle, StatusPill } from "@/components/ui";

const PROVIDER_LABEL: Record<string, string> = {
  anthropic: "Anthropic API",
  openai: "OpenAI-compatible",
  google: "Google AI",
  ollama: "Ollama (cloud/local)",
  custom: "Custom endpoint",
};

export default function ModelGrid({ models, agents }: { models: AiModel[]; agents: Agent[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function toggle(m: AiModel) {
    setBusy(m.id);
    await fetch("/api/models", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ modelId: m.id, status: m.status === "active" ? "paused" : "active" }),
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="label mb-1">Model registry</div>
        <h1 className="text-[22px] font-semibold tracking-tight">โมเดล AI</h1>
        <p className="mt-1 max-w-3xl text-[12.5px] text-txt-mute">
          เลือกได้หลายค่ายพร้อมกัน — สลับโมเดลต่อ agent ได้ทันที ระบบเก็บต้นทุน/โทเคนต่อ run เพื่อคำนวณค่าใช้จ่ายจริง
        </p>
      </div>

      <Card className="p-4">
        <SectionTitle
          title="สถานะกุญแจ API"
          subtitle="ตั้งค่าใน environment: ANTHROPIC_API_KEY · OPENAI_API_KEY · GEMINI_API_KEY · ZHIPU_API_KEY · OLLAMA_API_KEY"
          icon={<KeyRound size={15} />}
        />
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from(new Set(models.map((m) => m.keyEnv).filter(Boolean))).map((env) => {
            const configured = Boolean(process.env[env!]);
            return (
              <div key={env} className="flex items-center justify-between rounded-lg border border-line bg-[#0a1220] px-2.5 py-2">
                <span className="font-mono text-[10.5px] text-txt-dim">{env}</span>
                <span className={`text-[10px] font-semibold ${configured ? "text-mint" : "text-txt-mute"}`}>
                  {configured ? "พร้อมใช้" : "ยังไม่ตั้ง"}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[10.5px] text-txt-mute">
          หมายเหตุ: ค่า <span className="font-mono">keyConfigured</span> ด้านล่างคำนวณจาก environment จริงของเซิร์ฟเวอร์
          (ไม่มีการเก็บกุญแจในฐานข้อมูล)
        </p>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {models.map((m) => {
          const usedBy = agents.filter((a) => a.modelId === m.id);
          return (
            <Card key={m.id} hover className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Cpu size={13} className="text-cyan-glow" />
                    <span className="text-[13px] font-semibold">{m.name}</span>
                  </div>
                  <div className="mt-0.5 text-[10.5px] text-txt-mute">
                    {m.vendor} · {PROVIDER_LABEL[m.provider] ?? m.provider}
                  </div>
                </div>
                <StatusPill status={m.status} dot={false} />
              </div>

              <div className="mt-2 rounded-lg border border-line bg-[#0a1220] px-2.5 py-1.5">
                <div className="label text-[9px]">Model ID</div>
                <div className="font-mono text-[10.5px] text-txt-dim">{m.modelId}</div>
                {m.baseUrl && <div className="truncate font-mono text-[9px] text-txt-mute">{m.baseUrl}</div>}
              </div>

              <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
                <div className="rounded-lg border border-line bg-[#080f1c] py-1">
                  <div className="kpi-value text-[12px] text-txt">{m.contextK}K</div>
                  <div className="text-[8.5px] uppercase tracking-wider text-txt-mute">ctx</div>
                </div>
                <div className="rounded-lg border border-line bg-[#080f1c] py-1">
                  <div className="kpi-value text-[12px] text-txt">${m.costInPerM}</div>
                  <div className="text-[8.5px] uppercase tracking-wider text-txt-mute">in/M</div>
                </div>
                <div className="rounded-lg border border-line bg-[#080f1c] py-1">
                  <div className="kpi-value text-[12px] text-txt">${m.costOutPerM}</div>
                  <div className="text-[8.5px] uppercase tracking-wider text-txt-mute">out/M</div>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {m.strengths.map((s) => (
                  <span key={s} className="chip py-0 text-[9px]">
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-line-soft pt-2">
                <div className="text-[10px] text-txt-mute">
                  <span className={m.keyConfigured ? "text-mint" : "text-[#fbbf24]"}>{m.keyConfigured ? "กุญแจพร้อม" : "ยังไม่ตั้งกุญแจ"}</span>
                  <span className="mx-1">·</span>
                  ใช้กับ {usedBy.length} agent
                </div>
                <button onClick={() => toggle(m)} disabled={busy === m.id} className="btn btn-sm btn-ghost px-2" title={m.status === "active" ? "หยุดใช้" : "เปิดใช้"}>
                  {busy === m.id ? <Loader2 size={11} className="animate-spin" /> : m.status === "active" ? <Pause size={11} /> : <Play size={11} className="text-mint" />}
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-4">
        <SectionTitle title="กลยุทธ์การเลือกโมเดล" subtitle="หลายหัวดีกว่าหัวเดียว — แต่ต้องคุมต้นทุน" icon={<Zap size={15} />} />
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr>
                <th className="table-th">งาน</th>
                <th className="table-th">โมเดลหลัก</th>
                <th className="table-th">โมเดลสำรอง</th>
                <th className="table-th">เหตุผล</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["เล่นหน้าเว็บจำนวนมาก", "DeepSeek V4.1 Flash", "Gemini 3.8 Flash", "ถูกและเร็วพอสำหรับ DOM/Walkthrough"],
                ["ออกแบบบททดสอบจาก SPEC", "Gemini 3 Pro", "Claude Sonnet 4.5", "บริบทใหญ่ อ่านสเปกทั้งเล่ม"],
                ["แก้บั๊กซับซ้อน", "Claude Sonnet 4.5", "GPT-5.1", "เขียนโค้ดและเข้าใจ codebase"],
                ["ตรวจ schema/API", "GLM-5.3-Flash", "Gemini 3.8 Flash", "เร็ว ถูก และแม่นเรื่อง JSON"],
                ["ตัดสินใจภาพรวม / นโยบาย", "Claude Sonnet 4.5", "Gemini 3 Pro", "วางแผนหลายขั้นและคุมกฎ"],
                ["ข้อมูลอ่อนไหว/ออฟไลน์", "Llama 4.2 70B (local)", "—", "รันในเครื่อง ไม่ส่งออกนอก"],
              ].map((row) => (
                <tr key={row[0]}>
                  <td className="table-td font-medium">{row[0]}</td>
                  <td className="table-td text-[11.5px] text-cyan-glow">{row[1]}</td>
                  <td className="table-td text-[11.5px] text-txt-dim">{row[2]}</td>
                  <td className="table-td text-[11px] text-txt-mute">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
