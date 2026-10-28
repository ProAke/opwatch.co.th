import bcrypt from 'bcryptjs'
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { createError, getCookie, setCookie, deleteCookie } from 'h3'
import { getConfig } from './config'
import { useStore } from './store'

export const SESSION_COOKIE = 'opwatch_session'
const SESSION_DAYS = 30

export interface SessionPayload {
  uid: number
  isAdmin: boolean
  exp: number
}

/* ----------------------------- passwords ----------------------------- */

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash) return false
  return bcrypt.compare(password, hash)
}

/* ------------------------------- tokens ------------------------------- */

export function signToken(payload: Record<string, any>, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', secret).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function verifyToken<T = Record<string, any>>(token: string | undefined, secret: string): T | null {
  if (!token || !token.includes('.')) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const expected = createHmac('sha256', secret).update(body).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T & { exp?: number }
    if (payload.exp && Date.now() > payload.exp) return null
    return payload as T
  } catch {
    return null
  }
}

export function newSecret(): string {
  return randomBytes(24).toString('hex')
}

/* ------------------------------ sessions ------------------------------ */

export async function createSession(event: H3Event, customerId: number, isAdmin = false): Promise<string> {
  const cfg = getConfig()
  const token = signToken(
    { uid: customerId, isAdmin, exp: Date.now() + SESSION_DAYS * 86400_000 },
    cfg.secret
  )
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 86400
  })
  return token
}

export function destroySession(event: H3Event): void {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}

export async function currentUser(event: H3Event): Promise<Record<string, any> | null> {
  const cfg = getConfig()
  const token = getCookie(event, SESSION_COOKIE)
  const payload = verifyToken<SessionPayload>(token, cfg.secret)
  if (!payload?.uid) return null
  const user = await useStore().findById('customers', payload.uid)
  if (!user) return null
  return user
}

export async function currentAdmin(event: H3Event): Promise<Record<string, any> | null> {
  const user = await currentUser(event)
  if (!user || !user.isAdmin) return null
  return user
}

/* -------------------------------- orders -------------------------------- */

export function orderNo(): string {
  const d = new Date()
  const stamp = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0')
  ].join('')
  const rand = randomBytes(3).toString('hex').toUpperCase()
  return `OPW-${stamp}-${rand}`
}

export function publicUser(user: Record<string, any>) {
  if (!user) return null
  const { passwordHash, ...rest } = user
  return rest
}

export async function requireUser(event: H3Event): Promise<Record<string, any>> {
  const user = await currentUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'auth.pleaseLogin' })
  }
  return user
}

export async function requireAdmin(event: H3Event): Promise<Record<string, any>> {
  const admin = await currentAdmin(event)
  if (!admin) {
    throw createError({ statusCode: 401, statusMessage: 'admin.pleaseLogin' })
  }
  return admin
}
