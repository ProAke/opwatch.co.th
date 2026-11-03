export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const cfg = getConfig()
  const store = useStore()

  const site: Record<string, any> = { ...cfg.site }
  const strKeys = [
    'name', 'companyName', 'tagline', 'email', 'phone', 'address', 'addressEn',
    'currency', 'currencySymbol', 'defaultLocale', 'announcement',
    'lineId', 'lineUrl', 'facebookUrl', 'messengerUrl', 'tiktokUrl', 'shopeeUrl', 'instagramUrl',
    'chatGreetingTh', 'chatGreetingEn'
  ]
  for (const key of strKeys) {
    if (body?.site?.[key] !== undefined) {
      site[key] = String(body.site[key]).trim().slice(0, 480)
    }
  }
  const numKeys = [
    'shippingFee', 'freeShippingThreshold', 'giftWrapFee',
    'pointsPerBaht', 'bahtPerPoint', 'returnWindowDays', 'warrantyYears',
    'promoHomeColumns', 'promoHomeLimit'
  ]
  for (const key of numKeys) {
    if (body?.site?.[key] !== undefined) site[key] = Number(body.site[key]) || 0
  }
  const boolKeys = [
    'chatEnabled', 'giftWrapEnabled', 'giftCardEnabled', 'branchPickupEnabled', 'promoHomeEnabled'
  ]
  for (const key of boolKeys) {
    if (body?.site?.[key] !== undefined) site[key] = Boolean(body.site[key])
  }
  if (![3, 4, 6].includes(Number(site.promoHomeColumns))) site.promoHomeColumns = 4
  if (site.defaultLocale !== 'en') site.defaultLocale = 'th'

  const patch: any = { ...cfg, site }

  if (body?.ai && typeof body.ai === 'object') {
    const nextAi = { ...(cfg.ai || { provider: 'auto', model: '', apiKey: '', baseUrl: 'https://api.openai.com/v1', brandVoice: '' }) }
    if (body.ai.provider !== undefined) nextAi.provider = body.ai.provider
    if (body.ai.model !== undefined) nextAi.model = String(body.ai.model).trim()
    if (body.ai.baseUrl !== undefined) nextAi.baseUrl = String(body.ai.baseUrl).trim()
    if (body.ai.brandVoice !== undefined) nextAi.brandVoice = String(body.ai.brandVoice).trim()
    if (body.ai.apiKey !== undefined && String(body.ai.apiKey).trim() !== '') {
      nextAi.apiKey = String(body.ai.apiKey).trim()
    } else if (body.ai.clearApiKey) {
      nextAi.apiKey = ''
    }
    patch.ai = nextAi
  }

  if (body?.admin?.password) {
    const pw = String(body.admin.password)
    if (pw.length >= 6) {
      patch.admin = { email: cfg.admin.email, passwordHash: await hashPassword(pw) }
      const adminRow = await store.findOne('customers', { where: { email: cfg.admin.email } })
      if (adminRow) {
        await store.update('customers', Number(adminRow.id), { passwordHash: patch.admin.passwordHash })
      }
    }
  }

  saveConfig(patch)
  return { ok: true, site, admin: { email: patch.admin.email } }
})
