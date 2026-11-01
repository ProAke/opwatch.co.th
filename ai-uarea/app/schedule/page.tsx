import { loadSnapshot } from "@/lib/store";
import ScheduleBoard from "@/components/ScheduleBoard";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const s = await loadSnapshot();
  const schedules = s.schedules.map((sc) => {
    const project = s.projects.find((p) => p.id === sc.projectId);
    const flow = s.flows.find((f) => f.id === sc.flowId);
    const agent = s.agents.find((a) => a.id === sc.agentId);
    return {
      ...sc,
      projectName: project?.key ?? "",
      flowName: flow?.name ?? sc.flowId,
      agentName: agent?.name ?? "",
      agentAvatar: agent?.avatar ?? "🤖",
    };
  });

  return (
    <ScheduleBoard
      schedules={schedules}
      flows={s.flows.map((f) => ({ id: f.id, name: f.name, projectId: f.projectId }))}
      projects={s.projects.map((p) => ({ id: p.id, name: p.name, key: p.key, color: p.color }))}
      agents={s.agents.map((a) => ({ id: a.id, name: a.name, avatar: a.avatar }))}
      runs={s.runs.map((r) => ({ id: r.id, createdAt: r.createdAt, status: r.status, projectId: r.projectId, flowId: r.flowId }))}
    />
  );
}
