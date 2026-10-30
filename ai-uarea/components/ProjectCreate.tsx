"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui";

export default function ProjectCreate() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    key: "",
    baseUrl: "https://",
    repoUrl: "",
    driveFolder: "",
    env: "staging",
    owner: "",
    menus: 0,
    color: "#22d3ee",
    description: "",
  });

  async function submit() {
    if (!form.name.trim()) return;
    setBusy(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) {
      setOpen(false);
      setForm({ ...form, name: "", key: "", repoUrl: "", description: "" });
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-primary btn-sm">
        <Plus size={13} /> เพิ่มโปรเจกต์
      </button>
    );
  }

  return (
    <Card className="fade-in w-full p-4">
      <div className="flex items-center justify-between">
        <SectionTitle title="เพิ่มโปรเจกต์ใหม่" subtitle="ระบบจะสร้าง agent + flow เปล่าให้พร้อมตรวจ" />
        <button onClick={() => setOpen(false)} className="btn btn-sm btn-ghost">
          <X size={13} />
        </button>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div>
          <label className="label">ชื่อโปรเจกต์</label>
          <input className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="เช่น SML HR" />
        </div>
        <div>
          <label className="label">รหัส (key)</label>
          <input className="input mt-1 font-mono" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value.toUpperCase() })} placeholder="SMLHR" />
        </div>
        <div>
          <label className="label">Environment</label>
          <select className="input mt-1" value={form.env} onChange={(e) => setForm({ ...form, env: e.target.value })}>
            {["production", "staging", "demo", "local"].map((x) => (
              <option key={x} value={x} className="bg-[#0a1220]">
                {x}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">URL ระบบ</label>
          <input className="input mt-1 font-mono" value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} />
        </div>
        <div>
          <label className="label">GitHub repo</label>
          <input className="input mt-1 font-mono" value={form.repoUrl} onChange={(e) => setForm({ ...form, repoUrl: e.target.value })} placeholder="https://github.com/…" />
        </div>
        <div>
          <label className="label">โฟลเดอร์ Drive</label>
          <input className="input mt-1 font-mono" value={form.driveFolder} onChange={(e) => setForm({ ...form, driveFolder: e.target.value })} placeholder="drive://…" />
        </div>
        <div>
          <label className="label">เจ้าของ</label>
          <input className="input mt-1" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
        </div>
        <div>
          <label className="label">จำนวนเมนู</label>
          <input type="number" className="input mt-1" value={form.menus} onChange={(e) => setForm({ ...form, menus: Number(e.target.value) })} />
        </div>
        <div>
          <label className="label">สี</label>
          <input type="color" className="input mt-1 h-[36px] p-1" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
        </div>
        <div className="md:col-span-3">
          <label className="label">คำอธิบาย</label>
          <input className="input mt-1" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button onClick={() => setOpen(false)} className="btn btn-sm">
          ยกเลิก
        </button>
        <button onClick={submit} disabled={busy} className="btn btn-sm btn-primary">
          {busy ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} สร้างโปรเจกต์
        </button>
      </div>
    </Card>
  );
}
