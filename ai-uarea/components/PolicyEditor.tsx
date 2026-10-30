"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import type { Policy } from "@/lib/types";
import { Card, SectionTitle } from "@/components/ui";

const GROUPS: { key: Policy["group"]; label: string; hint: string }[] = [
  { key: "zero_touch", label: "Zero Touch", hint: "ให้ AI ตัดสินใจและลงมือเองได้แค่ไหน" },
  { key: "quality", label: "คุณภาพ", hint: "เกณฑ์ผ่าน การเก็บหลักฐาน และการตรวจซ้ำ" },
  { key: "security", label: "ความปลอดภัย", hint: "ขอบเขตข้อมูลและสิทธิ์ที่ AI เข้าถึง" },
  { key: "reporting", label: "การรายงาน", hint: "SLA ภาษา และสิ่งที่ส่งมอบ" },
];

export default function PolicyEditor({ policies }: { policies: Policy[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, Policy["value"]>>(
    Object.fromEntries(policies.map((p) => [p.id, p.value])),
  );
  const [saving, setSaving] = useState<string | null>(null);

  async function save(policy: Policy, value: Policy["value"]) {
    setValues((v) => ({ ...v, [policy.id]: value }));
    setSaving(policy.id);
    await fetch("/api/policies", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: policy.id, value }),
    });
    setSaving(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {GROUPS.map((g) => (
        <Card key={g.key} className="p-4">
          <SectionTitle title={g.label} subtitle={g.hint} icon={<ShieldCheck size={15} />} />
          <div className="mt-3 space-y-2">
            {policies
              .filter((p) => p.group === g.key)
              .map((p) => {
                const value = values[p.id];
                return (
                  <div
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-[#0a1220]/60 px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-[12px] font-medium">
                        {p.name}
                        {saving === p.id && <Loader2 size={11} className="animate-spin text-cyan-glow" />}
                      </div>
                      <div className="mt-0.5 text-[10.5px] leading-snug text-txt-mute">{p.description}</div>
                    </div>

                    {p.kind === "toggle" && (
                      <button
                        onClick={() => save(p, !value)}
                        className={`relative h-6 w-11 shrink-0 rounded-full border transition ${
                          value ? "border-[rgba(52,211,153,0.5)] bg-[rgba(52,211,153,0.25)]" : "border-line bg-[#131d30]"
                        }`}
                        aria-pressed={Boolean(value)}
                      >
                        <span
                          className={`absolute top-[3px] h-4 w-4 rounded-full transition-all ${
                            value ? "left-[24px] bg-mint" : "left-[3px] bg-[#5b6b88]"
                          }`}
                        />
                      </button>
                    )}

                    {p.kind === "number" && (
                      <input
                        type="number"
                        value={Number(value)}
                        onChange={(e) => save(p, Number(e.target.value))}
                        className="input w-[110px] shrink-0 text-right font-mono text-[12px]"
                      />
                    )}

                    {p.kind === "select" && (
                      <select
                        value={String(value)}
                        onChange={(e) => save(p, e.target.value)}
                        className="input w-[130px] shrink-0 text-[12px]"
                      >
                        {(p.options ?? []).map((o) => (
                          <option key={o} value={o} className="bg-[#0a1220]">
                            {o}
                          </option>
                        ))}
                      </select>
                    )}

                    {p.kind === "text" && (
                      <input
                        value={String(value)}
                        onChange={(e) => setValues((v) => ({ ...v, [p.id]: e.target.value }))}
                        onBlur={(e) => save(p, e.target.value)}
                        className="input w-[260px] shrink-0 text-[11.5px]"
                      />
                    )}
                  </div>
                );
              })}
          </div>
        </Card>
      ))}
    </div>
  );
}
