import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { advanceRun, loadSnapshot } from "@/lib/store";
import LiveRunDetail from "@/components/LiveRunDetail";

export const dynamic = "force-dynamic";

export default async function RunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = await advanceRun(id);
  if (!run) notFound();

  const s = await loadSnapshot();
  const flow = s.flows.find((f) => f.id === run.flowId);
  const project = s.projects.find((p) => p.id === run.projectId);
  const agent = s.agents.find((a) => a.id === run.agentId);
  const model = s.models.find((m) => m.id === run.modelId);

  return (
    <div className="space-y-4">
      <nav className="flex items-center gap-2 text-[11.5px] text-txt-mute">
        <Link href="/runs" className="inline-flex items-center gap-1 hover:text-cyan-glow">
          <ChevronLeft size={13} /> ผลการทดสอบ
        </Link>
        <span>/</span>
        <span className="text-txt-dim">{run.id}</span>
      </nav>

      <LiveRunDetail
        initial={run}
        flowName={flow?.name ?? run.flowId}
        projectName={`${project?.key} · ${project?.name}`}
        agentName={agent?.name ?? run.agentId}
        agentAvatar={agent?.avatar ?? "🤖"}
        modelName={model?.name ?? run.modelId}
        flowId={run.flowId}
        projectId={run.projectId}
      />
    </div>
  );
}
