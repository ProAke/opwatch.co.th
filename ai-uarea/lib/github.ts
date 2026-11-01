// ─────────────────────────────────────────────────────────────────────────────
// GitHub helpers — list repositories & branches so a project can be pointed at
// ANY repo (not just the one baked into the demo data).
//
// With GITHUB_TOKEN set we call the real API. Without it we return a curated
// catalog so the picker stays usable in demo mode (clearly flagged as such).
// ─────────────────────────────────────────────────────────────────────────────

export interface GithubRepo {
  fullName: string; // owner/name
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
}

export type RepoListSource = "live" | "catalog";

export interface RepoListResult {
  source: RepoListSource;
  repos: GithubRepo[];
  note: string;
}

/** Repos ที่มีอยู่ในชุดข้อมูลสาธิต + ตัวเลือกที่สมจริงสำหรับงาน ERP/UAT */
export const CATALOG_REPOS: GithubRepo[] = [
  {
    fullName: "jaturapornchai/smlaiaccountuat01",
    owner: "jaturapornchai",
    name: "smlaiaccountuat01",
    description: "UAT suite ของ SML AI Account (Playwright + MCP runner)",
    private: false,
    defaultBranch: "main",
    language: "TypeScript",
    stars: 12,
    openIssues: 3,
    updatedAt: null,
    url: "https://github.com/jaturapornchai/smlaiaccountuat01",
    source: "catalog",
  },
  {
    fullName: "ProAke/opwatch.co.th",
    owner: "ProAke",
    name: "opwatch.co.th",
    description: "Opwatch storefront — Nuxt 3 + MariaDB",
    private: false,
    defaultBranch: "main",
    language: "Vue",
    stars: 4,
    openIssues: 1,
    updatedAt: null,
    url: "https://github.com/ProAke/opwatch.co.th",
    source: "catalog",
  },
  {
    fullName: "uarea/manager",
    owner: "uarea",
    name: "manager",
    description: "ระบบจัดการภายใน mng.uarea.in",
    private: true,
    defaultBranch: "develop",
    language: "TypeScript",
    stars: 0,
    openIssues: 0,
    updatedAt: null,
    url: "https://github.com/uarea/manager",
    source: "catalog",
  },
  {
    fullName: "uarea/ai-uarea",
    owner: "uarea",
    name: "ai-uarea",
    description: "แพลตฟอร์ม AI UAREAnizer (ai.uarea.in)",
    private: true,
    defaultBranch: "main",
    language: "TypeScript",
    stars: 0,
    openIssues: 0,
    updatedAt: null,
    url: "https://github.com/uarea/ai-uarea",
    source: "catalog",
  },
  {
    fullName: "jaturapornchai/sml-report-service",
    owner: "jaturapornchai",
    name: "sml-report-service",
    description: "บริการสร้างรายงาน ภ.พ.30 / งบการเงิน (API)",
    private: true,
    defaultBranch: "main",
    language: "Go",
    stars: 2,
    openIssues: 5,
    updatedAt: null,
    url: "https://github.com/jaturapornchai/sml-report-service",
    source: "catalog",
  },
  {
    fullName: "jaturapornchai/uat-scripts",
    owner: "jaturapornchai",
    name: "uat-scripts",
    description: "คลังสคริปต์ทดสอบ JSON (31 ชุด) ที่รันผ่าน runner",
    private: false,
    defaultBranch: "main",
    language: "JavaScript",
    stars: 8,
    openIssues: 0,
    updatedAt: null,
    url: "https://github.com/jaturapornchai/uat-scripts",
    source: "catalog",
  },
  {
    fullName: "jaturapornchai/erp-migration",
    owner: "jaturapornchai",
    name: "erp-migration",
    description: "สคริปต์ migrate ข้อมูลเข้า SML (one-off jobs)",
    private: true,
    defaultBranch: "main",
    language: "SQL",
    stars: 0,
    openIssues: 2,
    updatedAt: null,
    url: "https://github.com/jaturapornchai/erp-migration",
    source: "catalog",
  },
  {
    fullName: "uarea/uat-evidence",
    owner: "uarea",
    name: "uat-evidence",
    description: "ที่เก็บ index ของหลักฐาน UAT (ไฟล์จริงอยู่บน Drive)",
    private: true,
    defaultBranch: "main",
    language: null,
    stars: 0,
    openIssues: 0,
    updatedAt: null,
    url: "https://github.com/uarea/uat-evidence",
    source: "catalog",
  },
];

const GITHUB_API = "https://api.github.com";

export const githubTokenConfigured = () => Boolean(process.env.GITHUB_TOKEN);

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    accept: "application/vnd.github+json",
    "user-agent": "ai-uarea-uat-orchestrator",
    "x-github-api-version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) h.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

type ApiRepo = {
  full_name: string;
  name: string;
  owner?: { login?: string };
  description?: string | null;
  private?: boolean;
  default_branch?: string;
  language?: string | null;
  stargazers_count?: number;
  open_issues_count?: number;
  updated_at?: string;
  html_url?: string;
};

function mapRepo(r: ApiRepo): GithubRepo {
  const owner = r.owner?.login ?? r.full_name.split("/")[0];
  return {
    fullName: r.full_name,
    owner,
    name: r.name,
    description: r.description ?? null,
    private: Boolean(r.private),
    defaultBranch: r.default_branch ?? "main",
    language: r.language ?? null,
    stars: r.stargazers_count ?? 0,
    openIssues: r.open_issues_count ?? 0,
    updatedAt: r.updated_at ?? null,
    url: r.html_url ?? `https://github.com/${r.full_name}`,
    source: "live",
  };
}

function inCatalog(repo: GithubRepo): boolean {
  return CATALOG_REPOS.some((c) => c.fullName.toLowerCase() === repo.fullName.toLowerCase());
}

/**
 * รายการ repo ที่เชื่อมต่อได้
 * - มี token: ดึงจาก GitHub จริง (repo ของ user + องค์กรที่ตั้งไว้)
 * - ไม่มี token: ใช้ catalog สาธิต (ยังเลือกได้ แต่ไม่ยิง API)
 */
export async function listRepos(query?: string): Promise<RepoListResult> {
  const q = (query ?? "").trim().toLowerCase();
  const match = (r: GithubRepo) =>
    !q || r.fullName.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q) || (r.language ?? "").toLowerCase().includes(q);

  if (!process.env.GITHUB_TOKEN) {
    return {
      source: "catalog",
      repos: CATALOG_REPOS.filter(match),
      note: "โหมดสาธิต: ยังไม่ตั้ง GITHUB_TOKEN — แสดงรายการ repo ตัวอย่าง (เลือกได้ แต่จะไม่ยิง GitHub API จริง)",
    };
  }

  const collected = new Map<string, GithubRepo>();
  const errors: string[] = [];

  try {
    const res = await fetch(`${GITHUB_API}/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member`, {
      headers: headers(),
      signal: AbortSignal.timeout(9000),
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as ApiRepo[];
      data.forEach((r) => collected.set(r.full_name, mapRepo(r)));
    } else {
      errors.push(`/user/repos → HTTP ${res.status}`);
    }
  } catch (err) {
    errors.push(`/user/repos → ${(err as Error).message}`);
  }

  const owner = process.env.GITHUB_OWNER;
  if (owner) {
    try {
      const res = await fetch(`${GITHUB_API}/orgs/${owner}/repos?per_page=100&sort=updated`, {
        headers: headers(),
        signal: AbortSignal.timeout(9000),
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as ApiRepo[];
        data.forEach((r) => collected.set(r.full_name, mapRepo(r)));
      } else {
        errors.push(`/orgs/${owner}/repos → HTTP ${res.status}`);
      }
    } catch (err) {
      errors.push(`/orgs/${owner}/repos → ${(err as Error).message}`);
    }
  }

  if (collected.size === 0) {
    return {
      source: "catalog",
      repos: CATALOG_REPOS.filter(match),
      note: `ดึงรายการจาก GitHub ไม่สำเร็จ (${errors.join(" · ") || "ไม่ทราบสาเหตุ"}) — แสดงรายการตัวอย่างแทน`,
    };
  }

  // ให้ repo ที่ผูกอยู่ในระบบขึ้นก่อน แล้วเรียงตามการอัปเดต
  const repos = [...collected.values()].sort((a, b) => {
    const ac = inCatalog(a) ? 0 : 1;
    const bc = inCatalog(b) ? 0 : 1;
    if (ac !== bc) return ac - bc;
    return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");
  });

  return {
    source: "live",
    repos: repos.filter(match),
    note: `ดึงจาก GitHub จริง ${repos.length} repo${errors.length ? ` (บางส่วนล้มเหลว: ${errors.join(" · ")})` : ""}`,
  };
}

export interface BranchListResult {
  source: RepoListSource;
  branches: string[];
  defaultBranch: string;
  note: string;
}

export async function listBranches(repo: string, fallbackDefault = "main"): Promise<BranchListResult> {
  const clean = repo.trim();
  if (!/^[\w.-]+\/[\w.-]+$/.test(clean)) {
    return { source: "catalog", branches: [fallbackDefault], defaultBranch: fallbackDefault, note: "ชื่อ repo ไม่ถูกต้อง (ต้องเป็น owner/name)" };
  }
  if (!process.env.GITHUB_TOKEN) {
    return {
      source: "catalog",
      branches: [fallbackDefault, "develop", "staging", `fix/${clean.split("/")[1]}-hotfix`],
      defaultBranch: fallbackDefault,
      note: "โหมดสาธิต: ยังไม่ตั้ง GITHUB_TOKEN — แสดง branch ตัวอย่าง",
    };
  }
  try {
    const [bRes, rRes] = await Promise.all([
      fetch(`${GITHUB_API}/repos/${clean}/branches?per_page=100`, { headers: headers(), signal: AbortSignal.timeout(9000), cache: "no-store" }),
      fetch(`${GITHUB_API}/repos/${clean}`, { headers: headers(), signal: AbortSignal.timeout(9000), cache: "no-store" }),
    ]);
    if (!bRes.ok) {
      return { source: "catalog", branches: [fallbackDefault], defaultBranch: fallbackDefault, note: `ดึง branch ไม่สำเร็จ (HTTP ${bRes.status})` };
    }
    const branches = ((await bRes.json()) as { name: string }[]).map((b) => b.name);
    const defaultBranch = rRes.ok ? (((await rRes.json()) as ApiRepo).default_branch ?? fallbackDefault) : fallbackDefault;
    return { source: "live", branches, defaultBranch, note: `branch จาก GitHub จริง ${branches.length} รายการ` };
  } catch (err) {
    return { source: "catalog", branches: [fallbackDefault], defaultBranch: fallbackDefault, note: (err as Error).message };
  }
}

export function isRepoName(value: string): boolean {
  return /^[\w.-]+\/[\w.-]+$/.test(value.trim());
}
