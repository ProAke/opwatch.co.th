import { NextResponse } from "next/server";
import { z } from "zod";
import { addEvent, loadSnapshot, saveProject, updateIntegration } from "@/lib/store";
import { listBranches, CATALOG_REPOS, isRepoName } from "@/lib/github";

export const dynamic = "force-dynamic";

const Input = z.object({
  repo: z.string().nullable(),
  branch: z.string().optional(),
  projectId: z.string().nullable().optional(),
  /** true = ผูกกับโปรเจกต์เท่านั้น ไม่เปลี่ยนค่าเริ่มต้นของ integration */
  projectOnly: z.boolean().optional(),
});

function repoUrl(repo: string): string {
  return `https://github.com/${repo}`;
}

// GET → สถานะการเชื่อมต่อ GitHub ปัจจุบัน + repo ที่ผูกกับแต่ละโปรเจกต์
export async function GET() {
  const s = await loadSnapshot();
  const gh = s.integrations.find((i) => i.kind === "github");
  return NextResponse.json({
    integration: gh ?? null,
    tokenConfigured: Boolean(process.env.GITHUB_TOKEN),
    projects: s.projects.map((p) => ({
      id: p.id,
      key: p.key,
      name: p.name,
      repo: p.repoUrl ? p.repoUrl.replace(/^https?:\/\/github\.com\//i, "").replace(/\.git$/i, "") : null,
      env: p.env,
    })),
    catalog: CATALOG_REPOS.map((r) => r.fullName),
  });
}

// POST → เปลี่ยน repo ที่เชื่อมต่อ (ระดับ integration และ/หรือรายโปรเจกต์)
export async function POST(req: Request) {
  try {
    const parsed = Input.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง", detail: parsed.error.flatten() }, { status: 400 });
    const { repo, branch, projectId, projectOnly } = parsed.data;

    const s = await loadSnapshot();
    const integration = s.integrations.find((i) => i.kind === "github");
    if (!integration) return NextResponse.json({ error: "ไม่พบการเชื่อมต่อ GitHub ในระบบ" }, { status: 404 });

    // ── ตัดการเชื่อมต่อ ────────────────────────────────────────────────────
    if (!repo) {
      if (projectId) {
        const project = s.projects.find((p) => p.id === projectId);
        if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });
        await saveProject({ ...project, repoUrl: "" });
        await addEvent({
          actor: "usr_human",
          kind: "github.unbound",
          level: "warn",
          message: `ยกเลิกการผูก GitHub ของโปรเจกต์ “${project.name}”`,
          projectId: project.id,
        });
        return NextResponse.json({ ok: true, project: { ...project, repoUrl: "" } });
      }
      const updated = await updateIntegration(integration.id, {
        status: "disconnected",
        account: "ยังไม่เชื่อมต่อ",
        health: 0,
        config: { owner: "", repo: "", branch: "" },
      });
      await addEvent({ actor: "usr_human", kind: "github.disconnected", level: "warn", message: "ยกเลิกการเชื่อมต่อ GitHub" });
      return NextResponse.json({ ok: true, integration: updated });
    }

    // ── ตรวจรูปแบบ owner/name ──────────────────────────────────────────────
    const clean = repo.trim().replace(/^https?:\/\/github\.com\//i, "").replace(/\.git$/i, "").replace(/\/$/, "");
    if (!isRepoName(clean)) {
      return NextResponse.json({ error: "ต้องอยู่ในรูปแบบ owner/name เช่น jaturapornchai/smlaiaccountuat01" }, { status: 400 });
    }
    const [owner, name] = clean.split("/");

    // ── ผูกกับโปรเจกต์ (ถ้าระบุ) ────────────────────────────────────────────
    let projectUpdate = null;
    if (projectId) {
      const project = s.projects.find((p) => p.id === projectId);
      if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });
      projectUpdate = await saveProject({ ...project, repoUrl: repoUrl(clean) });
    }

    // ── อัปเดต integration เป็นค่าเริ่มต้น (เว้นแต่ projectOnly) ─────────────
    let integrationUpdate = integration;
    let warning: string | null = null;
    if (!projectOnly) {
      const branchList = await listBranches(clean);
      const finalBranch = branch?.trim() || branchList.defaultBranch || "main";
      if (branchList.source !== "live") {
        warning = `ผูก repo แล้ว แต่ยังยืนยันกับ GitHub ไม่ได้ (${branchList.note}) — ตรวจสิทธิ์ของ GITHUB_TOKEN ให้มี Issues: write, Pull requests: write, Contents: read ใน repo นี้`;
      }
      integrationUpdate = (await updateIntegration(integration.id, {
        status: "connected",
        account: clean,
        health: 100,
        config: { owner, repo: name, branch: finalBranch },
      })) ?? integration;
    }

    await addEvent({
      actor: "usr_human",
      kind: "github.connected",
      level: "success",
      message: projectUpdate
        ? `ผูก GitHub repo ${clean} ให้โปรเจกต์ “${projectUpdate.name}”`
        : `เชื่อมต่อ GitHub กับ repo ${clean}${projectOnly ? "" : ` (branch ${integrationUpdate.config.branch || "main"})`}`,
      projectId: projectUpdate?.id,
    });

    return NextResponse.json({
      ok: true,
      integration: integrationUpdate,
      project: projectUpdate,
      repo: { fullName: clean, url: repoUrl(clean), branch: integrationUpdate.config.branch ?? branch ?? null },
      warning,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
