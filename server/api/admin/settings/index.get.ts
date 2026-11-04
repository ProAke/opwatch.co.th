import { resolveAiProvider } from '../../../utils/ai'

export default defineEventHandler(async (event) => {
  const officer = await requireAdmin(event)
  const cfg = getConfig()
  const isFullAdmin = officer.role === 'ceo' || officer.role === 'it_admin'

  if (!isFullAdmin) {
    return {
      site: {
        name: cfg.site.name,
        erpThemeColor: cfg.site.erpThemeColor || '#6C5CE7'
      }
    }
  }

  const aiResolved = resolveAiProvider()

  return {
    site: cfg.site,
    admin: { email: cfg.admin.email },
    db: { driver: cfg.db.driver, host: cfg.db.host, port: cfg.db.port, database: cfg.db.database },
    ai: {
      provider: cfg.ai?.provider || 'auto',
      model: cfg.ai?.model || '',
      baseUrl: cfg.ai?.baseUrl || 'https://api.openai.com/v1',
      brandVoice: cfg.ai?.brandVoice || '',
      webhookUrl: cfg.ai?.webhookUrl || '',
      hasApiKey: Boolean(cfg.ai?.apiKey),
      maskedKey: cfg.ai?.apiKey ? `${cfg.ai.apiKey.slice(0, 6)}••••••••${cfg.ai.apiKey.slice(-4)}` : '',
      activeEngine: `${aiResolved.provider} (${aiResolved.model})`
    },
    installedAt: cfg.installedAt
  }
})
