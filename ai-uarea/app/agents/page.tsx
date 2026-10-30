import { loadSnapshot } from "@/lib/store";
import AgentsGrid from "@/components/AgentsGrid";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const s = await loadSnapshot();
  return <AgentsGrid agents={s.agents} models={s.models} projects={s.projects} />;
}
