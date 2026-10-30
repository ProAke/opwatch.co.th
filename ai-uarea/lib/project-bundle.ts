import {
  createIssue,
  loadSnapshot,
  saveAgent,
  saveDoc,
  saveFlow,
  saveProject,
  saveSchedule,
} from "@/lib/store";
import type { Agent, Doc, Flow, Issue, Project, Schedule, Snapshot } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Project bundle — export one project (flows, agents, schedules, docs, issues)
// as a portable JSON, and import it into this or another installation.
// IDs are remapped on import so the same bundle can be loaded many times.
// ─────────────────────────────────────────────────────────────────────────────

export const BUNDLE_SCHEMA = "uarea-project-bundle@1";

export interface ProjectBundle {
  schema: string;
  exportedAt: string;
  source: { projectId: string; name: string; key: string; storage?: string };
  project: Pick<
    Project,
    "name" | "key" | "description" | "baseUrl" | "repoUrl" | "driveFolder" | "env" | "color" | "owner" | "menus"
  >;
  agents: Agent[];
  flows: Flow[];
  schedules: Schedule[];
  docs: Doc[];
  issues: Issue[];
  counts: Record<string, number>;
}

export function exportProject(s: Snapshot, projectId: string): ProjectBundle {
  const project = s.projects.find((p) => p.id === projectId);
  if (!project) throw new Error("project not found");
  const flows = s.flows.filter((f) => f.projectId === projectId);
  const agents = s.agents.filter((a) => a.projectId === projectId);
  const schedules = s.schedules.filter((x) => x.projectId === projectId);
  const docs = s.docs.filter((d) => d.projectId === projectId);
  const issues = s.issues.filter((i) => i.projectId === projectId);

  return {
    schema: BUNDLE_SCHEMA,
    exportedAt: new Date().toISOString(),
    source: { projectId: project.id, name: project.name, key: project.key, storage: process.env.DB_HOST ? "mariadb" : "demo" },
    project: {
      name: project.name,
      key: project.key,
      description: project.description,
      baseUrl: project.baseUrl,
      repoUrl: project.repoUrl,
      driveFolder: project.driveFolder,
      env: project.env,
      color: project.color,
      owner: project.owner,
      menus: project.menus,
    },
    agents,
    flows,
    schedules,
    docs,
    issues,
    counts: {
      agents: agents.length,
      flows: flows.length,
      steps: flows.reduce((n, f) => n + f.steps.length, 0),
      schedules: schedules.length,
      docs: docs.length,
      issues: issues.length,
    },
  };
}

export interface ImportOptions {
  name?: string;
  key?: string;
  env?: Project["env"];
  include?: { agents?: boolean; flows?: boolean; schedules?: boolean; docs?: boolean; issues?: boolean };
}

export async function importBundle(bundle: ProjectBundle, opts: ImportOptions = {}) {
  if (!bundle?.project?.name) throw new Error("bundle ไม่ถูกต้อง: ไม่พบข้อมูลโปรเจกต์");
  const include = {
    agents: true,
    flows: true,
    schedules: true,
    docs: true,
    issues: true,
    ...opts.include,
  };

  const project = await saveProject({
    name: opts.name ?? bundle.project.name,
    key: opts.key ?? bundle.project.key,
    description: bundle.project.description,
    baseUrl: bundle.project.baseUrl,
    repoUrl: bundle.project.repoUrl,
    driveFolder: bundle.project.driveFolder,
    env: opts.env ?? bundle.project.env ?? "staging",
    color: bundle.project.color ?? "#22d3ee",
    owner: bundle.project.owner,
    menus: bundle.project.menus ?? 0,
  });

  const agentMap = new Map<string, string>();
  const flowMap = new Map<string, string>();
  let agents = 0;
  let flows = 0;
  let schedules = 0;
  let docs = 0;
  let issues = 0;

  if (include.agents) {
    for (const a of bundle.agents ?? []) {
      const created = await saveAgent({
        projectId: project.id,
        name: a.name,
        role: a.role,
        modelId: a.modelId,
        avatar: a.avatar,
        systemPrompt: a.systemPrompt,
        tools: a.tools,
        autonomy: a.autonomy,
        status: a.status ?? "active",
      });
      agentMap.set(a.id, created.id);
      agents += 1;
    }
  }

  if (include.flows) {
    for (const f of bundle.flows ?? []) {
      const created = await saveFlow({
        projectId: project.id,
        name: f.name,
        module: f.module,
        description: f.description,
        steps: f.steps,
        tags: f.tags,
        browsers: f.browsers,
        status: f.status ?? "draft",
        createdBy: f.createdBy,
      });
      flowMap.set(f.id, created.id);
      flows += 1;
    }
  }

  if (include.schedules) {
    const s = await loadSnapshot();
    const fallbackAgent = s.agents.find((a) => a.projectId === project.id)?.id;
    for (const sc of bundle.schedules ?? []) {
      const flowId = flowMap.get(sc.flowId) ?? s.flows.find((f) => f.id === sc.flowId && f.projectId === project.id)?.id;
      if (!flowId) continue;
      await saveSchedule({
        projectId: project.id,
        flowId,
        name: sc.name,
        cadence: sc.cadence,
        timeOfDay: sc.timeOfDay,
        timezone: sc.timezone,
        agentId: agentMap.get(sc.agentId) ?? fallbackAgent,
        env: sc.env ?? project.env,
        status: sc.status ?? "active",
        notify: sc.notify ?? ["mng"],
      });
      schedules += 1;
    }
  }

  if (include.docs) {
    for (const d of bundle.docs ?? []) {
      await saveDoc({
        projectId: project.id,
        kind: d.kind,
        title: d.title,
        status: d.status,
        language: d.language,
        words: d.words,
        content: d.content,
      });
      docs += 1;
    }
  }

  if (include.issues) {
    for (const i of bundle.issues ?? []) {
      await createIssue({
        projectId: project.id,
        title: i.title,
        description: i.description,
        severity: i.severity,
        source: i.source ?? "manual",
        flowId: i.flowId ? (flowMap.get(i.flowId) ?? null) : null,
        labels: i.labels,
        assignee: i.assignee,
      });
      issues += 1;
    }
  }

  return { project, imported: { agents, flows, schedules, docs, issues } };
}
