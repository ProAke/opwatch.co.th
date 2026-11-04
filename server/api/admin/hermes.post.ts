import { randomBytes } from 'node:crypto'
import type { HermesSlotToken } from '../../utils/config'

function generatePool(): HermesSlotToken[] {
  const now = new Date().toISOString()
  return Array.from({ length: 20 }, (_, idx) => {
    const slot = idx + 1
    const raw = randomBytes(18).toString('base64url')
    const token = `opw_s${String(slot).padStart(2, '0')}_${raw}`
    const preview = `${token.slice(0, 12)}••••${token.slice(-4)}`
    return {
      slot,
      token,
      preview,
      useCount: 0,
      revoked: false,
      createdAt: now
    }
  })
}

export default defineEventHandler(async (event) => {
  await requireOfficer(event, '*')
  const body = await readBody(event)
  const action = String(body?.action || 'status')
  const cfg = getConfig()
  const nextAi = {
    ...(cfg.ai || {
      provider: 'auto' as const,
      model: '',
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      brandVoice: ''
    })
  }

  let slots: HermesSlotToken[] = Array.isArray(nextAi.hermesTokens) ? [...nextAi.hermesTokens] : []
  let revealed: { slot: number; token: string }[] | undefined

  if (action === 'reveal') {
    if (!slots.length || slots.every((s) => s.revoked)) {
      slots = generatePool()
      nextAi.hermesTokens = slots
      saveConfig({ ...cfg, ai: nextAi })
    }
    revealed = slots.filter((s) => !s.revoked).map((s) => ({ slot: s.slot, token: s.token }))
  } else if (action === 'rotate') {
    slots = generatePool()
    nextAi.hermesTokens = slots
    saveConfig({ ...cfg, ai: nextAi })
    revealed = slots.map((s) => ({ slot: s.slot, token: s.token }))
  } else if (action === 'revoke') {
    slots = slots.map((s) => ({ ...s, revoked: true }))
    nextAi.hermesTokens = slots
    saveConfig({ ...cfg, ai: nextAi })
  } else if (action === 'strict') {
    nextAi.strictDualAuth = !nextAi.strictDualAuth
    saveConfig({ ...cfg, ai: nextAi })
  }

  return {
    ok: true,
    poolTarget: 20,
    activeCount: slots.filter((s) => !s.revoked).length,
    totalUses: slots.reduce((s, t) => s + Number(t.useCount || 0), 0),
    strictDualAuth: Boolean(nextAi.strictDualAuth),
    slots: slots.map((s) => ({
      slot: s.slot,
      preview: s.preview,
      useCount: s.useCount || 0,
      revoked: Boolean(s.revoked)
    })),
    revealed
  }
})
