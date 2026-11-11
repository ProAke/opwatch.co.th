export default defineEventHandler(async (event) => {
  await requireRole(event, ['ceo', 'it_admin'])
  const body = await readBody(event)
  const cfg = getConfig()
  const store = useStore()

  const site: Record<string, any> = { ...cfg.site }
  const strKeys = [
    'name', 'companyName', 'tagline', 'email', 'phone', 'address', 'addressEn',
    'currency', 'currencySymbol', 'defaultLocale', 'announcement',
    'lineId', 'lineUrl', 'facebookUrl', 'messengerUrl', 'tiktokUrl', 'shopeeUrl', 'instagramUrl',
    'chatGreetingTh', 'chatGreetingEn', 'erpThemeColor', 'driveFolder'
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
    'chatEnabled', 'giftWrapEnabled', 'giftCardEnabled', 'branchPickupEnabled',
    'promoHomeEnabled', 'autoImageEnhance', 'requireShopeeSyncPassword'
  ]
  for (const key of boolKeys) {
    if (body?.site?.[key] !== undefined) site[key] = Boolean(body.site[key])
  }
  if (![3, 4, 6].includes(Number(site.promoHomeColumns))) site.promoHomeColumns = 4
  if (site.defaultLocale !== 'en') site.defaultLocale = 'th'

  const patch: any = { ...cfg, site, admin: { ...cfg.admin } }

  if (body?.ai && typeof body.ai === 'object') {
    const nextAi = { ...(cfg.ai || { provider: 'auto', model: '', apiKey: '', baseUrl: 'https://api.openai.com/v1', brandVoice: '' }) }
    if (body.ai.provider !== undefined) nextAi.provider = body.ai.provider
    if (body.ai.model !== undefined) nextAi.model = String(body.ai.model).trim()
    if (body.ai.baseUrl !== undefined) nextAi.baseUrl = String(body.ai.baseUrl).trim()
    if (body.ai.brandVoice !== undefined) nextAi.brandVoice = String(body.ai.brandVoice).trim()
    if (body.ai.webhookUrl !== undefined) nextAi.webhookUrl = String(body.ai.webhookUrl).trim()
    if (body.ai.webhookSecret !== undefined && String(body.ai.webhookSecret).trim() !== '') {
      nextAi.webhookSecret = String(body.ai.webhookSecret).trim()
    }
    if (body.ai.apiKey !== undefined && String(body.ai.apiKey).trim() !== '') {
      nextAi.apiKey = String(body.ai.apiKey).trim()
    } else if (body.ai.clearApiKey) {
      nextAi.apiKey = ''
    }
    patch.ai = nextAi
  }

  // Shopee Sync Password / Security Settings
  if (body?.security && typeof body.security === 'object') {
    if (body.security.requireShopeeSyncPassword !== undefined) {
      site.requireShopeeSyncPassword = Boolean(body.security.requireShopeeSyncPassword)
    }
    if (body.security.resetSyncPassword) {
      delete patch.admin.shopeeSyncPasswordHash
    } else if (body.security.shopeeSyncPassword && String(body.security.shopeeSyncPassword).trim().length >= 4) {
      patch.admin.shopeeSyncPasswordHash = await hashPassword(String(body.security.shopeeSyncPassword).trim())
    }
  }

  // Master Admin Password Update -> syncs with `officers` table cleanly
  if (body?.admin?.password) {
    const pw = String(body.admin.password).trim()
    if (pw.length >= 6) {
      const nextHash = await hashPassword(pw)
      patch.admin = { ...patch.admin, email: cfg.admin.email, passwordHash: nextHash }
      const officers = await store.all('officers').catch(() => [])
      const adminOfficer = officers.find(
        (o: any) => String(o.email || '').toLowerCase() === String(cfg.admin.email || '').toLowerCase()
      )
      if (adminOfficer) {
        await store.update('officers', Number(adminOfficer.id), {
          passwordHash: nextHash,
          updatedAt: new Date().toISOString()
        })
      }
    }
  }

  saveConfig(patch)
  return {
    ok: true,
    site,
    admin: { email: patch.admin.email },
    security: {
      requireShopeeSyncPassword: site.requireShopeeSyncPassword !== false,
      hasCustomSyncPassword: Boolean(patch.admin.shopeeSyncPasswordHash)
    }
  }
})
