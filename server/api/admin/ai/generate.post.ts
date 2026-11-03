import { runAiTask, type AiTaskPayload } from '../../../utils/ai'

const TASK_MAP: Record<string, AiTaskPayload['task']> = {
  'product-full': 'product_full',
  product_full: 'product_full',
  'seo-aseo': 'product_seo',
  product_seo: 'product_seo',
  'page-full': 'page_full',
  page_full: 'page_full',
  'promo-copy': 'promo_copy',
  promo_copy: 'promo_copy',
  shopee_enrich: 'shopee_enrich',
  chat_reply: 'chat_reply'
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const rawTask = String(body?.task || 'product_full')
  const task: AiTaskPayload['task'] = TASK_MAP[rawTask] || 'product_full'
  const out = await runAiTask({
    task,
    locale: body?.locale === 'en' ? 'en' : 'th',
    input: body?.input || {}
  })
  return { ok: true, source: out.provider === 'builtin' ? 'builtin-horology-engine' : out.provider, ...out }
})
