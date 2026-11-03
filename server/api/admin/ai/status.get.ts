import { resolveAiProvider } from '../../../utils/ai'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const resolved = resolveAiProvider()
  return {
    provider: resolved.provider,
    model: resolved.model,
    hasExternalKey: resolved.provider !== 'builtin'
  }
})
