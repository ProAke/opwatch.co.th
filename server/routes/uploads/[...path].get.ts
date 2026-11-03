import { existsSync, readFileSync } from 'node:fs'
import { resolve, extname } from 'node:path'

const EXT_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
}

export default defineEventHandler((event) => {
  const raw = String(getRouterParam(event, 'path') || '').replace(/\.\./g, '').replace(/^\/+/, '')
  if (!raw) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const baseDir = resolve(process.cwd(), 'data/uploads')
  const fullPath = resolve(baseDir, raw)
  if (!fullPath.startsWith(baseDir) || !existsSync(fullPath)) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const ext = extname(fullPath).toLowerCase()
  setHeader(event, 'Content-Type', EXT_MIME[ext] || 'application/octet-stream')
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  return readFileSync(fullPath)
})
