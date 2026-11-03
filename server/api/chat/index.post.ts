import { runAiTask } from '../../utils/ai'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const message = String(body?.message || '').trim()
  if (!message) throw createError({ statusCode: 400, statusMessage: 'Message required' })

  const store = useStore()
  const aiRes = await runAiTask({
    task: 'chat_reply',
    input: { message, productSlug: body?.productSlug || '' }
  })
  const autoReply = String(aiRes.result.reply || '')

  const saved = await store.create('chats', {
    sessionId: String(body?.sessionId || '').slice(0, 64),
    customerName: String(body?.customerName || 'ลูกค้าเว็บไซต์').trim().slice(0, 120),
    customerContact: String(body?.customerContact || '').trim().slice(0, 120),
    channel: 'webchat',
    productSlug: String(body?.productSlug || '').slice(0, 180),
    message: message.slice(0, 1200),
    sender: 'customer',
    status: 'open',
    reply: autoReply
  })

  return { ok: true, chat: saved, reply: autoReply }
})
