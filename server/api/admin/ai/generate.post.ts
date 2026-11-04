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
  'coupon-copy': 'coupon_copy',
  coupon_copy: 'coupon_copy',
  'calendar-plan': 'calendar_plan',
  calendar_plan: 'calendar_plan',
  'event-detail': 'event_detail',
  event_detail: 'event_detail',
  'brand-copy': 'brand_copy',
  brand_copy: 'brand_copy',
  'order-reply': 'order_reply',
  order_reply: 'order_reply',
  'site-copy': 'site_copy',
  site_copy: 'site_copy',
  'freeform-draft': 'freeform_draft',
  freeform_draft: 'freeform_draft',
  'warranty-reply': 'warranty_reply',
  warranty_reply: 'warranty_reply',
  shopee_enrich: 'shopee_enrich',
  chat_reply: 'chat_reply'
}

const AGENT_BY_TASK: Record<string, string> = {
  product_full: 'OP-COPY',
  shopee_enrich: 'OP-COPY',
  brand_copy: 'OP-COPY',
  page_full: 'OP-COPY',
  site_copy: 'OP-COPY',
  product_seo: 'OP-SEO',
  promo_copy: 'OP-PROMO',
  coupon_copy: 'OP-PROMO',
  calendar_plan: 'OP-PROMO',
  event_detail: 'OP-PROMO',
  order_reply: 'OP-CARE',
  warranty_reply: 'OP-CARE',
  chat_reply: 'OP-CARE',
  freeform_draft: 'OP-COPY'
}

export default defineEventHandler(async (event) => {
  const officer = await requireAdmin(event)
  const body = await readBody(event)
  const rawTask = String(body?.task || body?.type || 'product_full')
  const task: AiTaskPayload['task'] = TASK_MAP[rawTask] || 'product_full'

  if (task === 'warranty_reply') {
    if (!officerHasPermission(officer, 'warranty') && !officerHasPermission(officer, 'ai')) {
      throw createError({ statusCode: 403, statusMessage: 'office.forbidden' })
    }
  } else if (!officerHasPermission(officer, 'ai') && !officerHasPermission(officer, 'pages') && !officerHasPermission(officer, 'products_edit')) {
    throw createError({ statusCode: 403, statusMessage: 'office.forbidden' })
  }

  const inputObj = body?.input && typeof body.input === 'object' ? body.input : body || {}
  const agentCode = String(body?.agentCode || inputObj?.agentCode || AGENT_BY_TASK[task] || 'OP-COPY')

  const out = await runAiTask({
    task,
    locale: body?.locale === 'en' ? 'en' : 'th',
    agentCode,
    input: inputObj
  })

  try {
    const store = useStore()
    const inp = body?.input || {}
    const summarySrc = inp.prompt || inp.name || inp.title || inp.topic || inp.code || inp.orderNo || inp.message || task
    const previewSrc =
      out.result?.content ||
      out.result?.shortDescription ||
      out.result?.titleTh ||
      out.result?.seoDescription ||
      out.result?.message ||
      out.result?.reply ||
      out.result?.summary ||
      JSON.stringify(out.result).slice(0, 180)

    await store.create('ai_runs', {
      agentCode,
      task,
      model: out.model,
      provider: out.provider,
      promptSummary: String(summarySrc).slice(0, 240),
      outputPreview: String(previewSrc).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 320),
      tokens: out.tokens,
      durationMs: out.durationMs,
      status: 'done',
      createdAt: new Date().toISOString()
    })
  } catch {}

  return {
    ok: true,
    agentCode,
    source: out.provider === 'builtin' ? 'builtin-horology-engine' : out.provider,
    ...out
  }
})
