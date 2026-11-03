import { resolveAiProvider } from '../../../utils/ai'
import { ensureCatalogReady } from '../../../utils/seed'

export const OPWATCH_AI_AGENTS = [
  {
    id: 'op-copy',
    code: 'OP-COPY',
    name: 'Horology Copywriter AI',
    role: 'เขียนคำบรรยายนาฬิกา 2 ภาษา · สเปก · หน้า CMS',
    avatar: '✍️',
    color: '#6C5CE7',
    defaultTask: 'freeform_draft',
    status: 'working'
  },
  {
    id: 'op-seo',
    code: 'OP-SEO',
    name: 'SEO & ASEO Architect',
    role: 'สร้าง Meta Title · Schema JSON-LD · คำถาม FAQ สำหรับ AI Search',
    avatar: '🔎',
    color: '#3BA7FF',
    defaultTask: 'product_seo',
    status: 'working'
  },
  {
    id: 'op-promo',
    code: 'OP-PROMO',
    name: 'Campaign & Calendar Planner',
    role: 'วางแผนปฏิทินการตลาด · แคมเปญลดราคา · โค้ดคูปอง',
    avatar: '🎯',
    color: '#FF6B9D',
    defaultTask: 'calendar_plan',
    status: 'working'
  },
  {
    id: 'op-vision',
    code: 'OP-VISION',
    name: 'Studio Image Enhancer',
    role: 'ปรับภาพพื้นขาวสตูดิโอ 1:1 · เพิ่มความคมชัดกระจกแซฟไฟร์อัตโนมัติ',
    avatar: '📸',
    color: '#22C793',
    defaultTask: 'freeform_draft',
    status: 'online'
  },
  {
    id: 'op-care',
    code: 'OP-CARE',
    name: 'Boutique Concierge AI',
    role: 'ร่างข้อความตอบแชทลูกค้า · แจ้งเลขพัสดุ · ข้อมูลรับประกันศูนย์ไทย 2 ปี',
    avatar: '💬',
    color: '#FFB020',
    defaultTask: 'order_reply',
    status: 'online'
  }
]

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const store = useStore()
  await ensureCatalogReady(store)
  const cfg = getConfig()
  const resolved = resolveAiProvider()

  const runs = await store.all('ai_runs').catch(() => [])
  const sortedRuns = runs
    .slice()
    .sort((a: any, b: any) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
  const totalTokens = runs.reduce((s: number, r: any) => s + Number(r.tokens || 0), 0)
  const slots = cfg.ai?.hermesTokens || []

  return {
    provider: resolved.provider,
    model: resolved.model,
    hasExternalKey: resolved.provider !== 'builtin',
    brandVoice: cfg.ai?.brandVoice || '',
    baseUrl: cfg.ai?.baseUrl || 'https://api.openai.com/v1',
    configuredProvider: cfg.ai?.provider || 'auto',
    maskedKey: cfg.ai?.apiKey ? `${cfg.ai.apiKey.slice(0, 6)}••••••••${cfg.ai.apiKey.slice(-4)}` : '',
    agents: OPWATCH_AI_AGENTS.map((a) => {
      const agentRuns = sortedRuns.filter((r: any) => r.agentCode === a.code)
      return {
        ...a,
        runCount: agentRuns.length,
        tokensUsed: agentRuns.reduce((s: number, r: any) => s + Number(r.tokens || 0), 0),
        lastTask: agentRuns[0]?.promptSummary || a.role,
        lastRunAt: agentRuns[0]?.createdAt || null
      }
    }),
    telemetry: {
      totalRuns: runs.length,
      totalTokens,
      monthlyBudgetTokens: 500000
    },
    recentRuns: sortedRuns.slice(0, 20),
    hermes: {
      poolTarget: 20,
      activeCount: slots.filter((s: any) => !s.revoked).length,
      totalUses: slots.reduce((s: number, t: any) => s + Number(t.useCount || 0), 0),
      strictDualAuth: Boolean(cfg.ai?.strictDualAuth),
      slots: slots.map((s: any) => ({
        slot: s.slot,
        preview: s.preview,
        useCount: s.useCount || 0,
        revoked: Boolean(s.revoked)
      }))
    }
  }
})
