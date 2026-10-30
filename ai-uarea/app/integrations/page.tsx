import { loadSnapshot } from "@/lib/store";
import IntegrationCards from "@/components/IntegrationCards";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const s = await loadSnapshot();
  return <IntegrationCards integrations={s.integrations} />;
}
