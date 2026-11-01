"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ExternalLink,
  FolderGit2,
  GitBranch,
  Link2,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  Star,
  Unlink,
} from "lucide-react";
import { Card, SectionTitle } from "@/components/ui";

type Repo = {
  fullName: string;
  owner: string;
  name: string;
  description: string | null;
  private: boolean;
  defaultBranch: string;
  language: string | null;
  stars: number;
  openIssues: number;
  updatedAt: string | null;
  url: string;
  source: "live" | "catalog";
};

type Binding = { projectId: string; projectKey: string; projectName: string; repo: string };

type ReposResponse = {
  source: "live" | "catalog";
  repos: Repo[];
  note: string;
  tokenConfigured: boolean;
  connected: { account: string | null; repo: string | null; branch: string | null; status: string };
  bindings: Binding[];
};

export default function GitHubRepoPicker({
  projects,
}: {
  projects: { id: string; key: string; name: string; env: string; color: string }[];
}) {
  const router = useRouter();
  const [data, setData] = useState<ReposResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Repo | null>(null);
  const [target, setTarget] = useState<string>("__default__");
  const [branch, setBranch] = useState<string>("");
  const [branches, setBranches] = useState<string[]>([]);
  const [branchNote, setBranchNote] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [manual, setManual] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/github/repos", { cache: "no-store" });
      const json = (await res.json()) as ReposResponse;
      setData(json);
    } catch {
      setNotice({ kind: "err", msg: "ดึงรายการ repo ไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const repos = useMemo(() => {
    const list = data?.repos ?? [];
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (r) =>
        r.fullName.toLowerCase().includes(term) ||
        (r.description ?? "").toLowerCase().includes(term) ||
        (r.language ?? "").toLowerCase().includes(term),
    );
  }, [data, q]);

  function normalizeSlug(value: string): string {
    return value
      .trim()
      .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
      .replace(/^git@github\.com:/i, "")
      .replace(/\.git$/i, "")
      .replace(/\/+$/, "");
  }

  function pickManual() {
    const slug = normalizeSlug(manual);
    if (!/^[\w.-]+\/[\w.-]+$/.test(slug)) {
      setNotice({ kind: "err", msg: "ต้องอยู่ในรูปแบบ owner/name หรือ URL ของ GitHub" });
      return;
    }
    const known = data?.repos.find((r) => r.fullName.toLowerCase() === slug.toLowerCase());
    const repo: Repo =
      known ?? {
        fullName: slug,
        owner: slug.split("/")[0],
        name: slug.split("/")[1],
        description: "repo ที่พิมพ์เอง (อาจเป็น private หรืออยู่นอกบัญชีที่ token เห็น)",
        private: true,
        defaultBranch: "main",
        language: null,
        stars: 0,
        openIssues: 0,
        updatedAt: null,
        url: `https://github.com/${slug}`,
        source: "catalog",
      };
    void pickRepo(repo);
  }

  async function pickRepo(repo: Repo) {
    setSelected(repo);
    setBranch(repo.defaultBranch);
    setBranches([repo.defaultBranch]);
    setBranchNote(null);
    setNotice(null);
    setBusy(`branch:${repo.fullName}`);
    try {
      const res = await fetch(`/api/github/branches?repo=${encodeURIComponent(repo.fullName)}&default=${encodeURIComponent(repo.defaultBranch)}`);
      const json = await res.json();
      if (Array.isArray(json?.branches) && json.branches.length) {
        setBranches(json.branches);
        setBranch(json.defaultBranch ?? repo.defaultBranch);
      }
      setBranchNote(json?.note ?? null);
    } finally {
      setBusy(null);
    }
  }

  async function connect() {
    if (!selected) return;
    setBusy("connect");
    setNotice(null);
    try {
      const isDefault = target === "__default__";
      const res = await fetch("/api/github/connect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          repo: selected.fullName,
          branch: isDefault ? branch : undefined,
          projectId: isDefault ? null : target,
          projectOnly: !isDefault,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setNotice({ kind: "err", msg: json?.error ?? "เชื่อมต่อไม่สำเร็จ" });
        return;
      }
      setNotice({
        kind: "ok",
        msg: `${
          isDefault
            ? `เชื่อมต่อ GitHub กับ ${selected.fullName} (branch ${json?.repo?.branch ?? branch}) แล้ว`
            : `ผูก ${selected.fullName} ให้โปรเจกต์ ${projects.find((p) => p.id === target)?.name ?? ""} แล้ว`
        }${json?.warning ? ` — หมายเหตุ: ${json.warning}` : ""}`,
      });
      await load();
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function bindProject(projectId: string, repo: string) {
    setBusy(`bind:${projectId}`);
    setNotice(null);
    try {
      const res = await fetch("/api/github/connect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ repo: repo || null, projectId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setNotice({ kind: "err", msg: json?.error ?? "อัปเดตไม่สำเร็จ" });
        return;
      }
      setNotice({ kind: "ok", msg: repo ? `ผูก ${repo} ให้โปรเจกต์แล้ว` : "ยกเลิกการผูก repo ของโปรเจกต์แล้ว" });
      await load();
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function disconnectAll() {
    if (!confirm("ยกเลิกการเชื่อมต่อ GitHub ทั้งหมด? (repo ของแต่ละโปรเจกต์ยังอยู่)")) return;
    setBusy("disconnect");
    const res = await fetch("/api/github/connect", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ repo: null }),
    });
    setBusy(null);
    setNotice(res.ok ? { kind: "ok", msg: "ยกเลิกการเชื่อมต่อ GitHub แล้ว" } : { kind: "err", msg: "ยกเลิกไม่สำเร็จ" });
    await load();
    router.refresh();
  }

  const repoOptions = useMemo(() => {
    const set = new Set<string>((data?.repos ?? []).map((r) => r.fullName));
    data?.bindings.forEach((b) => set.add(b.repo));
    if (data?.connected.repo) set.add(data.connected.repo);
    return [...set].sort();
  }, [data]);

  return (
    <div className="space-y-4" id="github-repos">
      <Card className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionTitle
            title="เลือก GitHub repository ที่จะเชื่อมต่อ"
            subtitle="ผูก repo ระดับ integration (ค่าเริ่มต้น) หรือแยกรายโปรเจกต์ก็ได้ — Auto Fixer จะเปิด Issue/PR ใน repo ที่ผูกไว้"
            icon={<FolderGit2 size={15} />}
          />
          <div className="flex items-center gap-2">
            <span
              className={`chip ${data?.tokenConfigured ? "border-[rgba(52,211,153,0.35)] text-mint" : "border-[rgba(251,191,36,0.35)] text-[#fbbf24]"}`}
            >
              {data?.tokenConfigured ? "GITHUB_TOKEN พร้อมใช้" : "ยังไม่ตั้ง GITHUB_TOKEN"}
            </span>
            <button onClick={load} disabled={loading} className="btn btn-sm">
              {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} โหลดใหม่
            </button>
          </div>
        </div>

        {data && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-txt-mute">
            <span className={`chip py-0 text-[9.5px] ${data.source === "live" ? "border-[rgba(52,211,153,0.3)] text-mint" : ""}`}>
              {data.source === "live" ? "GitHub API จริง" : "รายการสาธิต"}
            </span>
            <span>{data.note}</span>
          </div>
        )}

        {notice && (
          <div
            className={`mt-2 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11.5px] ${
              notice.kind === "ok"
                ? "border-[rgba(52,211,153,0.35)] bg-[rgba(52,211,153,0.08)] text-mint"
                : "border-[rgba(251,113,133,0.35)] bg-[rgba(251,113,133,0.08)] text-danger"
            }`}
          >
            {notice.kind === "ok" ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />} {notice.msg}
          </div>
        )}

        <div className="mt-3 grid gap-3 lg:grid-cols-[1.15fr_1fr]">
          {/* list */}
          <div className="rounded-xl border border-line bg-[#080f1c] p-2.5">
            <div className="flex items-center gap-2 rounded-lg border border-line bg-[#0a1220] px-2 py-1.5">
              <Search size={12} className="text-txt-mute" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ค้นหา repo / ภาษา / คำอธิบาย…"
                className="w-full bg-transparent text-[11.5px] outline-none placeholder:text-[#4a5a78]"
              />
              <span className="shrink-0 font-mono text-[9.5px] text-txt-mute">{repos.length} repo</span>
            </div>

            <div className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-dashed border-[#26344f] bg-[#0a1220]/60 px-2 py-1.5">
              <Link2 size={11} className="shrink-0 text-txt-mute" />
              <input
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && pickManual()}
                placeholder="วาง URL / owner/name ของ repo ที่ไม่แสดงในรายการ (เช่น ProAke/aixaccountuat)"
                className="w-full bg-transparent font-mono text-[10.5px] outline-none placeholder:text-[#4a5a78]"
              />
              <button onClick={pickManual} disabled={!manual.trim()} className="btn btn-sm shrink-0 py-0.5 text-[10px]">
                ใช้ repo นี้
              </button>
            </div>

            <div className="mt-2 max-h-[330px] space-y-1.5 overflow-y-auto pr-0.5">
              {loading && (
                <div className="grid place-items-center py-10 text-[11.5px] text-txt-mute">
                  <Loader2 size={16} className="mb-1 animate-spin" /> กำลังดึงรายการ repo…
                </div>
              )}
              {!loading && repos.length === 0 && (
                <div className="rounded-lg border border-dashed border-line px-3 py-8 text-center text-[11px] text-txt-mute">
                  ไม่พบ repo ที่ตรงกับ “{q}”
                </div>
              )}
              {repos.map((r) => {
                const on = selected?.fullName === r.fullName;
                const bound = data?.bindings.filter((b) => b.repo.toLowerCase() === r.fullName.toLowerCase()) ?? [];
                const isDefault = data?.connected.repo?.toLowerCase() === r.fullName.toLowerCase();
                return (
                  <button
                    key={r.fullName}
                    onClick={() => pickRepo(r)}
                    className={`w-full rounded-lg border p-2 text-left transition ${
                      on ? "border-[rgba(34,211,238,0.5)] bg-[rgba(34,211,238,0.07)]" : "border-line bg-[#0a1220]/70 hover:border-[#2b405f]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <FolderGit2 size={11} className={on ? "text-cyan-glow" : "text-txt-mute"} />
                      <span className="truncate font-mono text-[11px] text-txt">{r.fullName}</span>
                      {r.private && <Lock size={9} className="shrink-0 text-[#fbbf24]" />}
                      {isDefault && <span className="chip py-0 text-[8.5px] text-cyan-glow">ค่าเริ่มต้น</span>}
                    </div>
                    {r.description && <div className="mt-0.5 line-clamp-1 text-[10px] text-txt-mute">{r.description}</div>}
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      {r.language && <span className="chip py-0 text-[8.5px]">{r.language}</span>}
                      <span className="chip py-0 font-mono text-[8.5px]">
                        <GitBranch size={8} /> {r.defaultBranch}
                      </span>
                      {r.stars > 0 && (
                        <span className="chip py-0 text-[8.5px]">
                          <Star size={8} /> {r.stars}
                        </span>
                      )}
                      {r.openIssues > 0 && <span className="chip py-0 text-[8.5px] text-[#fdba74]">issues {r.openIssues}</span>}
                      {bound.map((b) => (
                        <span key={b.projectId} className="chip border-[rgba(52,211,153,0.3)] py-0 text-[8.5px] text-mint">
                          <Link2 size={8} /> {b.projectKey}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* selection panel */}
          <div className="rounded-xl border border-line bg-[#0a1220]/70 p-3">
            {!selected ? (
              <div className="grid h-full place-items-center py-8 text-center">
                <div>
                  <FolderGit2 size={18} className="mx-auto mb-2 text-txt-mute" />
                  <p className="text-[11.5px] text-txt-dim">เลือก repo จากรายการด้านซ้าย</p>
                  <p className="mt-1 text-[10.5px] text-txt-mute">จะเห็น branch, ปลายทาง และปุ่มเชื่อมต่อที่นี่</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div>
                  <div className="label">repo ที่เลือก</div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="truncate font-mono text-[12px] font-semibold text-cyan-glow">{selected.fullName}</span>
                    <a href={selected.url} target="_blank" rel="noreferrer" className="text-txt-mute hover:text-cyan-glow">
                      <ExternalLink size={11} />
                    </a>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="chip py-0 text-[9px]">{selected.private ? "private" : "public"}</span>
                    {selected.language && <span className="chip py-0 text-[9px]">{selected.language}</span>}
                    <span className="chip py-0 font-mono text-[9px]">{selected.openIssues} issues</span>
                  </div>
                </div>

                <div>
                  <label className="label">Branch เริ่มต้น</label>
                  <select
                    className="input mt-0.5 font-mono text-[11px]"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    disabled={busy === `branch:${selected.fullName}`}
                  >
                    {branches.map((b) => (
                      <option key={b} value={b} className="bg-[#0a1220]">
                        {b}
                      </option>
                    ))}
                  </select>
                  {branchNote && <p className="mt-0.5 text-[9.5px] text-txt-mute">{branchNote}</p>}
                </div>

                <div>
                  <label className="label">นำไปใช้กับ</label>
                  <select className="input mt-0.5 text-[11px]" value={target} onChange={(e) => setTarget(e.target.value)}>
                    <option value="__default__" className="bg-[#0a1220]">
                      ค่าเริ่มต้นของ integration (ใช้ทุกโปรเจกต์ที่ยังไม่ระบุ)
                    </option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#0a1220]">
                        ผูกเฉพาะโปรเจกต์: {p.key} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button onClick={connect} disabled={busy !== null} className="btn btn-sm btn-primary flex-1">
                    {busy === "connect" ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    {target === "__default__" ? "เชื่อมต่อ repo นี้" : "ผูกกับโปรเจกต์นี้"}
                  </button>
                  <button onClick={disconnectAll} disabled={busy !== null} className="btn btn-sm" title="ยกเลิกการเชื่อมต่อ GitHub">
                    {busy === "disconnect" ? <Loader2 size={12} className="animate-spin" /> : <Unlink size={12} />}
                  </button>
                </div>

                <div className="rounded-lg border border-line bg-[#080f1c] p-2 text-[10px] leading-relaxed text-txt-mute">
                  เมื่อเชื่อมแล้ว Auto Fixer จะสร้าง branch <span className="font-mono text-[#c4b5fd]">fix/&lt;issue-key&gt;</span> ใน repo นี้
                  และเปิด PR ให้รีวิว — ทุก run จะถูกผูกกับ commit ของ branch ที่เลือก
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="px-4 pt-4">
          <SectionTitle
            title="repo ของแต่ละโปรเจกต์"
            subtitle="เลือก repo ให้ตรงกับงาน — ระบบใช้ค่านี้ตอนเปิด Issue/PR และแสดงในหน้ารายละเอียดโปรเจกต์"
            icon={<Link2 size={15} />}
          />
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr>
                <th className="table-th">โปรเจกต์</th>
                <th className="table-th">Environment</th>
                <th className="table-th">GitHub repo ที่ผูกอยู่</th>
                <th className="table-th text-right">เปลี่ยน repo</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const binding = data?.bindings.find((b) => b.projectId === p.id);
                const current = binding?.repo ?? "";
                return (
                  <tr key={p.id} className="transition hover:bg-[#0c1626]/70">
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
                        <span className="text-[12px] font-medium">{p.name}</span>
                        <span className="font-mono text-[9.5px] text-txt-mute">{p.key}</span>
                      </div>
                    </td>
                    <td className="table-td">
                      <span className="chip py-0 font-mono text-[9.5px]">{p.env}</span>
                    </td>
                    <td className="table-td">
                      {current ? (
                        <a
                          href={`https://github.com/${current}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[11px] text-cyan-glow hover:underline"
                        >
                          {current} <ExternalLink size={9} />
                        </a>
                      ) : (
                        <span className="text-[10.5px] text-txt-mute">— ยังไม่ผูก —</span>
                      )}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-1.5">
                        <select
                          className="input w-[200px] py-1 font-mono text-[10.5px]"
                          value={current}
                          onChange={(e) => bindProject(p.id, e.target.value)}
                          disabled={busy === `bind:${p.id}`}
                        >
                          <option value="" className="bg-[#0a1220]">
                            — ไม่ผูก —
                          </option>
                          {repoOptions.map((r) => (
                            <option key={r} value={r} className="bg-[#0a1220]">
                              {r}
                            </option>
                          ))}
                        </select>
                        {busy === `bind:${p.id}` && <Loader2 size={12} className="animate-spin text-cyan-glow" />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-4 pt-2 text-[10.5px] text-txt-mute">
          * ถ้าโปรเจกต์ไหนยังไม่ผูก ระบบจะใช้ repo ค่าเริ่มต้นของ integration
          {data?.connected.repo ? ` (${data.connected.repo})` : ""}
        </div>
      </Card>
    </div>
  );
}
