import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, extname } from 'node:path'

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg'
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const uploadDir = resolve(process.cwd(), 'data/uploads')
  mkdirSync(uploadDir, { recursive: true })

  const contentType = String(getHeader(event, 'content-type') || '').toLowerCase()
  const urls: string[] = []

  if (contentType.includes('multipart/form-data')) {
    const parts = (await readMultipartFormData(event)) || []
    for (const part of parts) {
      if (!part.data || !part.data.length) continue
      const mime = String(part.type || 'image/jpeg').toLowerCase()
      const origExt = extname(String(part.filename || '')).toLowerCase()
      const ext = MIME_TO_EXT[mime] || (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(origExt) ? origExt : '.jpg')
      const safeStem = String(part.filename || 'watch')
        .replace(/\.[^.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'image'
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safeStem}${ext}`
      writeFileSync(resolve(uploadDir, filename), part.data)
      urls.push(`/uploads/${filename}`)
    }
  } else {
    const body = await readBody(event)
    const filesInput = Array.isArray(body?.files) ? body.files : body?.dataUrl ? [body] : []
    for (const item of filesInput) {
      const dataUrl = String(item?.dataUrl || '')
      const m = dataUrl.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i)
      if (!m) continue
      const mime = m[1].toLowerCase()
      const buf = Buffer.from(m[2], 'base64')
      const ext = MIME_TO_EXT[mime] || '.jpg'
      const safeStem = String(item?.name || 'watch')
        .replace(/\.[^.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '-')
        .slice(0, 40) || 'image'
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safeStem}${ext}`
      writeFileSync(resolve(uploadDir, filename), buf)
      urls.push(`/uploads/${filename}`)
    }
  }

  if (!urls.length) {
    throw createError({ statusCode: 400, statusMessage: 'No valid image uploaded' })
  }

  return { ok: true, url: urls[0], urls }
})
