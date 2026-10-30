import { loadSnapshot } from "@/lib/store";
import ModelGrid from "@/components/ModelGrid";

export const dynamic = "force-dynamic";

export default async function ModelsPage() {
  const s = await loadSnapshot();
  return <ModelGrid models={s.models} agents={s.agents} />;
}
