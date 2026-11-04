import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, extname } from 'node:path'

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
}

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

export default defineEventHandler(async (event) => {
  const uploadDir = resolve(process.cwd(), 'data/uploads')
  mkdirSync(uploadDir, { recursive: true })

  const contentType = String(getHeader(event, 'content-type') || '').toLowerCase()
  const urls: string[] = []

  if (contentType.includes('multipart/form-data')) {
    const parts = (await readMultipartFormData(event)) || []
    for (const part of parts.slice(0, 4)) {
      if (!part.data || !part.data.length) continue
      if (part.data.length > MAX_BYTES) {
        throw createError({ statusCode: 413, statusMessage: 'ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB' })
      }
      const mime = String(part.type || '').toLowerCase()
      const origExt = extname(String(part.filename || '')).toLowerCase()
      const ext = ALLOWED_MIME[mime] || (['.jpg', '.jpeg', '.png', '.webp'].includes(origExt) ? origExt : '')
      if (!ext) {
        throw createError({ statusCode: 400, statusMessage: 'รองรับเฉพาะไฟล์รูปภาพ JPG, PNG หรือ WebP เท่านั้น' })
      }
      const filename = `wrt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
      writeFileSync(resolve(uploadDir, filename), part.data)
      urls.push(`/uploads/${filename}`)
    }
  } else {
    const body = await readBody(event)
    const dataUrl = String(body?.dataUrl || '')
    const m = dataUrl.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/i)
    if (m) {
      const mime = m[1].toLowerCase()
      const buf = Buffer.from(m[2], 'base64')
      if (buf.length > MAX_BYTES) {
        throw createError({ statusCode: 413, statusMessage: 'ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB' })
      }
      const ext = ALLOWED_MIME[mime] || '.jpg'
      const filename = `wrt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
      writeFileSync(resolve(uploadDir, filename), buf)
      urls.push(`/uploads/${filename}`)
    }
  }

  if (!urls.length) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง' })
  }

  return { ok: true, url: urls[0], urls }
})
