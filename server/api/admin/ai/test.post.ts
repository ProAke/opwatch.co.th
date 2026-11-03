import { testAiConnection } from '../../../utils/ai'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return await testAiConnection()
})
