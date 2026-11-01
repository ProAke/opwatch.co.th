import { NextResponse } from "next/server";
import { listRepos } from "@/lib/github";
import { loadSnapshot } from "@/lib/store";

export const dynamic = "force-dynamic";

// GET /api/github/repos?q=smlai  → repo ที่เลือกเชื่อมต่อได้ (ตัวจริงถ้ามี token)
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? undefined;
  const result = await listRepos(q);
  const s = await loadSnapshot();
  const connected = s.integrations.find((i) => i.kind === "github");

  // ให้ repo ที่เชื่อมต่ออยู่ขึ้นบนสุดเสมอ แม้จะอยู่นอกหน้าต่าง 100 รายการแรกของ GitHub
  const connectedRepo = connected?.config?.repo ? `${connected.config.owner}/${connected.config.repo}` : null;
  const query = (q ?? "").trim().toLowerCase();
  const connectedMatchesQuery = !connectedRepo || !query || connectedRepo.toLowerCase().includes(query);
  if (connectedRepo && connectedMatchesQuery && !result.repos.some((r) => r.fullName.toLowerCase() === connectedRepo.toLowerCase())) {
    result.repos.unshift({
      fullName: connectedRepo,
      owner: connected?.config?.owner ?? connectedRepo.split("/")[0],
      name: connected?.config?.repo ?? connectedRepo.split("/")[1],
      description: "repo ที่เชื่อมต่ออยู่กับ integration",
      private: false,
      defaultBranch: connected?.config?.branch || "main",
      language: null,
      stars: 0,
      openIssues: 0,
      updatedAt: null,
      url: `https://github.com/${connectedRepo}`,
      source: result.source,
    });
  }

  // ทำเครื่องหมายว่า repo ไหนผูกกับโปรเจกต์ใดอยู่แล้ว
  const bindings = s.projects
    .filter((p) => p.repoUrl)
    .map((p) => ({
      projectId: p.id,
      projectKey: p.key,
      projectName: p.name,
      repo: p.repoUrl.replace(/^https?:\/\/github\.com\//i, "").replace(/\.git$/i, "").replace(/\/$/, ""),
    }));

  return NextResponse.json({
    ...result,
    tokenConfigured: Boolean(process.env.GITHUB_TOKEN),
    connected: {
      account: connected?.account ?? null,
      repo: connected?.config?.repo ? `${connected.config.owner}/${connected.config.repo}` : null,
      branch: connected?.config?.branch ?? null,
      status: connected?.status ?? "disconnected",
    },
    bindings,
  });
}
