import { loadSnapshot } from "@/lib/store";
import IntegrationCards from "@/components/IntegrationCards";
import GitHubRepoPicker from "@/components/GitHubRepoPicker";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const s = await loadSnapshot();
  return (
    <div className="space-y-4">
      <IntegrationCards integrations={s.integrations} />
      <GitHubRepoPicker
        projects={s.projects.map((p) => ({ id: p.id, key: p.key, name: p.name, env: p.env, color: p.color }))}
      />
    </div>
  );
}
