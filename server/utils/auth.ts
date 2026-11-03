import bcrypt from 'bcryptjs'
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { createError, getCookie, setCookie, deleteCookie } from 'h3'
import { getConfig } from './config'
import { useStore } from './store'
import type { StaffRole } from '../db/types'

export const SESSION_COOKIE = 'opwatch_session'
const SESSION_DAYS = 30

export interface SessionPayload {
  uid: number
  isAdmin: boolean
  role?: StaffRole
  exp: number
}

export function isBackofficeUser(user: Record<string, any> | null | undefined): boolean {
  if (!user) return false
  if (user.status === 'suspended') return false
  const role = String(user.role || '').toLowerCase()
  return Boolean(user.isAdmin || role === 'ceo' || role === 'admin' || role === 'staff')
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash) return false
  return bcrypt.compare(password, hash)
}

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

export async function createSession(
  event: H3Event,
  customerId: number,
  isAdmin = false,
  role: StaffRole = isAdmin ? 'ceo' : 'member'
): Promise<string> {
  const cfg = getConfig()
  const token = signToken(
    { uid: customerId, isAdmin, role, exp: Date.now() + SESSION_DAYS * 86400_000 },
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
  if (!user || user.status === 'suspended') return null
  if (isBackofficeUser(user) && !user.isAdmin) {
    user.isAdmin = true
  }
  return user
}

export async function currentAdmin(event: H3Event): Promise<Record<string, any> | null> {
  const user = await currentUser(event)
  if (!isBackofficeUser(user)) return null
  return user
}

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
  const role = rest.role || (rest.isAdmin ? 'ceo' : 'member')
  return {
    ...rest,
    role,
    isAdmin: isBackofficeUser({ ...rest, role })
  }
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

export async function requireRole(event: H3Event, allowed: StaffRole[]): Promise<Record<string, any>> {
  const admin = await requireAdmin(event)
  const role = (admin.role || (admin.isAdmin ? 'ceo' : 'member')) as StaffRole
  if (!allowed.includes(role)) {
    throw createError({ statusCode: 403, statusMessage: 'admin.notAllowed' })
  }
  return admin
}
