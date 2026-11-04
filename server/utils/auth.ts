import bcrypt from 'bcryptjs'
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { createError, getCookie, getHeader, setCookie, deleteCookie } from 'h3'
import { getConfig } from './config'
import { useStore } from './store'
import type { OfficeRole, StaffRole } from '../db/types'

export const SESSION_COOKIE = 'opwatch_session'
export const OFFICE_COOKIE = 'opwatch_office_session'
const SESSION_DAYS = 30

export interface SessionPayload {
  uid: number
  realm?: 'customer' | 'officer'
  isAdmin: boolean
  role?: StaffRole
  exp: number
}

export interface RoleMeta {
  role: OfficeRole
  labelTh: string
  labelEn: string
  badgeColor: string
  descriptionTh: string
  defaultHome: string
  permissions: string[]
}

export const OFFICE_ROLES: Record<OfficeRole, RoleMeta> = {
  ceo: {
    role: 'ceo',
    labelTh: 'CEO (ผู้บริหารสูงสุด)',
    labelEn: 'Chief Executive Officer',
    badgeColor: '#6c5ce7',
    descriptionTh: 'สิทธิ์ผู้บริหารสูงสุด ดูภาพรวมธุรกิจ รายได้ สต็อก 5 ช่องทาง เจ้าหน้าที่ ตัวแทนจำหน่าย และตั้งค่าระบบทั้งหมด',
    defaultHome: '/office',
    permissions: ['*']
  },
  it_admin: {
    role: 'it_admin',
    labelTh: 'IT. Admin (ผู้ดูแลระบบ)',
    labelEn: 'IT & System Administrator',
    badgeColor: '#3ba7ff',
    descriptionTh: 'สิทธิ์ดูแลระบบเทคนิค ฐานข้อมูล จัดการสิทธิ์เจ้าหน้าที่และตัวแทนจำหน่าย ตั้งค่า AI / Hermes / SEO และระบบหลังบ้านทั้งหมด',
    defaultHome: '/office',
    permissions: ['*']
  },
  marketing_sales: {
    role: 'marketing_sales',
    labelTh: 'Marketing / Sales (การตลาดและฝ่ายขาย)',
    labelEn: 'Marketing & Sales Officer',
    badgeColor: '#ff6b9d',
    descriptionTh: 'เห็นสินค้าราคาขายปลีก การจัดส่งสินค้า ข้อมูลสมาชิกและลูกค้า โปรโมชั่น และจัดการเนื้อหาทุกหน้าบนเว็บไซต์ (Tree CMS + AI)',
    defaultHome: '/office',
    permissions: [
      'dashboard', 'calendar', 'ai',
      'orders', 'orders_fulfill',
      'products_view', 'products_retail', 'products_edit',
      'promotions', 'promotions_view',
      'customers',
      'pages', 'brands', 'categories', 'branches',
      'warranty', 'chats', 'reports'
    ]
  },
  warehouse: {
    role: 'warehouse',
    labelTh: 'คลังสินค้า (Warehouse)',
    labelEn: 'Omnichannel Warehouse Officer',
    badgeColor: '#22c793',
    descriptionTh: 'เห็นสินค้าและบริหารคลังสินค้าแยก 5 ช่องทาง: Opwatch Web, Shopee, Lazada, TikTok Shop และตัวแทนจำหน่าย พร้อมจัดการจัดส่งและรับซ่อม',
    defaultHome: '/office/warehouse',
    permissions: [
      'dashboard', 'calendar',
      'warehouse', 'warehouse_5ch',
      'products_view', 'products_stock',
      'orders', 'orders_fulfill',
      'warranty'
    ]
  },
  dealer: {
    role: 'dealer',
    labelTh: 'ตัวแทนจำหน่าย (Authorized Dealer)',
    labelEn: 'Authorized Watch Dealer',
    badgeColor: '#ffb020',
    descriptionTh: 'เห็นสินค้าราคาเฉพาะตัวแทนจำหน่าย จัดการคลังสินค้าตัวแทนเอง ดูโปรโมชั่น การรับสินค้าหน้าร้าน และระบบแจ้งซ่อม/ลงทะเบียนรับประกัน',
    defaultHome: '/office/warehouse',
    permissions: [
      'dealer_portal',
      'warehouse', 'warehouse_dealer',
      'products_view', 'products_dealer',
      'promotions_view',
      'orders_pickup',
      'warranty'
    ]
  }
}

export function normalizeOfficeRole(raw?: string | null): OfficeRole {
  const v = String(raw || '').trim().toLowerCase()
  if (v === 'ceo') return 'ceo'
  if (v === 'it_admin' || v === 'admin') return 'it_admin'
  if (v === 'marketing_sales' || v === 'staff' || v === 'marketing' || v === 'sales') return 'marketing_sales'
  if (v === 'warehouse' || v === 'inventory') return 'warehouse'
  if (v === 'dealer' || v === 'partner') return 'dealer'
  return 'marketing_sales'
}

export function getRoleDefaultPermissions(role: OfficeRole): string[] {
  return [...(OFFICE_ROLES[role]?.permissions || [])]
}

export function officerHasPermission(officer: Record<string, any> | null | undefined, perm: string): boolean {
  if (!officer) return false
  const role = normalizeOfficeRole(officer.role)
  if (role === 'ceo' || role === 'it_admin') return true
  const rolePerms = OFFICE_ROLES[role]?.permissions || []
  const customPerms = Array.isArray(officer.permissions) ? officer.permissions : []
  const combined = new Set([...rolePerms, ...customPerms])
  return combined.has('*') || combined.has(perm)
}

export function isBackofficeUser(user: Record<string, any> | null | undefined): boolean {
  if (!user || user.status === 'suspended') return false
  const role = String(user.role || '').toLowerCase()
  return ['ceo', 'it_admin', 'marketing_sales', 'warehouse', 'dealer', 'admin', 'staff'].includes(role)
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

export function orderNo(prefix = 'OPW'): string {
  const d = new Date()
  const stamp = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0')
  ].join('')
  const rand = randomBytes(3).toString('hex').toUpperCase()
  return `${prefix}-${stamp}-${rand}`
}

// ============================================================================
// 1. STOREFRONT CUSTOMER REALM (Website Members ONLY — CANNOT ENTER /office)
// ============================================================================

export async function createSession(
  event: H3Event,
  customerId: number,
  _isAdmin = false
): Promise<string> {
  const cfg = getConfig()
  const token = signToken(
    {
      uid: customerId,
      realm: 'customer',
      isAdmin: false,
      role: 'member',
      exp: Date.now() + SESSION_DAYS * 86400_000
    },
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
  // Strict realm isolation: storefront session is NEVER an office session
  if (payload.realm && payload.realm !== 'customer') return null
  const user = await useStore().findById('customers', payload.uid)
  if (!user || user.status === 'suspended') return null
  return {
    ...user,
    isAdmin: false,
    role: 'member'
  }
}

export function publicUser(user: Record<string, any> | null | undefined) {
  if (!user) return null
  const { passwordHash: _pw, ...rest } = user
  return {
    ...rest,
    role: 'member',
    isAdmin: false
  }
}

export async function requireUser(event: H3Event): Promise<Record<string, any>> {
  const user = await currentUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'auth.pleaseLogin' })
  }
  return user
}

// ============================================================================
// 2. BACK-OFFICE OFFICER & AUTHORIZED DEALER REALM (/office ONLY — 5 ROLES)
// ============================================================================

export async function createOfficeSession(
  event: H3Event,
  officerId: number,
  role: OfficeRole
): Promise<string> {
  const cfg = getConfig()
  const normalized = normalizeOfficeRole(role)
  const token = signToken(
    {
      uid: officerId,
      realm: 'officer',
      isAdmin: true,
      role: normalized,
      exp: Date.now() + SESSION_DAYS * 86400_000
    },
    cfg.secret
  )
  setCookie(event, OFFICE_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 86400
  })
  return token
}

export function destroyOfficeSession(event: H3Event): void {
  deleteCookie(event, OFFICE_COOKIE, { path: '/' })
}

export function publicOfficer(row: Record<string, any> | null | undefined) {
  if (!row) return null
  const { passwordHash: _pw, ...rest } = row
  const role = normalizeOfficeRole(rest.role)
  const meta = OFFICE_ROLES[role]
  return {
    ...rest,
    role,
    isAdmin: true,
    roleLabelTh: meta.labelTh,
    roleLabelEn: meta.labelEn,
    roleBadgeColor: meta.badgeColor,
    defaultHome: meta.defaultHome,
    effectivePermissions: role === 'ceo' || role === 'it_admin'
      ? ['*']
      : Array.from(new Set([...(meta.permissions || []), ...(Array.isArray(rest.permissions) ? rest.permissions : [])]))
  }
}

export async function currentOfficer(event: H3Event): Promise<Record<string, any> | null> {
  const cfg = getConfig()

  // Support Hermes 20-token pool Bearer authentication
  const authHeader = getHeader(event, 'authorization') || ''
  if (authHeader.startsWith('Bearer opw_s')) {
    const rawBearer = authHeader.slice(7).trim()
    const pool = Array.isArray(cfg.ai?.hermesTokens) ? cfg.ai!.hermesTokens! : []
    const matched = pool.find((s) => !s.revoked && s.token === rawBearer)
    if (matched) {
      return publicOfficer({
        id: 0,
        code: `HMS-${String(matched.slot).padStart(2, '0')}`,
        name: `Hermes Slot #${matched.slot}`,
        email: 'hermes@opwatch.co.th',
        role: 'it_admin',
        department: 'AI Automation',
        position: 'Hermes API Pool',
        permissions: ['*'],
        status: 'active'
      })
    }
  }

  // Strictly read OFFICE_COOKIE ONLY. Storefront CUSTOMER_COOKIE is completely blocked.
  const token = getCookie(event, OFFICE_COOKIE)
  const payload = verifyToken<SessionPayload>(token, cfg.secret)
  if (!payload?.uid || payload.realm !== 'officer') return null

  const officer = await useStore().findById('officers', payload.uid)
  if (!officer || officer.status === 'suspended') return null
  return publicOfficer(officer)
}

export async function currentAdmin(event: H3Event): Promise<Record<string, any> | null> {
  return currentOfficer(event)
}

export async function requireAdmin(
  event: H3Event,
  allowedRoles?: StaffRole[]
): Promise<Record<string, any>> {
  const officer = await currentOfficer(event)
  if (!officer) {
    // Check if the request has a storefront customer cookie so we explain the strict boundary clearly
    const customer = await currentUser(event)
    if (customer) {
      throw createError({
        statusCode: 403,
        statusMessage: 'บัญชีสมาชิกหน้าเว็บไซต์ไม่สามารถเข้าระบบหลังบ้าน (/office) ได้ กรุณาใช้บัญชีเจ้าหน้าที่หรือตัวแทนจำหน่าย'
      })
    }
    throw createError({ statusCode: 401, statusMessage: 'admin.pleaseLogin' })
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const role = normalizeOfficeRole(officer.role)
    if (role !== 'ceo' && role !== 'it_admin') {
      const normalizedAllowed = allowedRoles.map((r) => normalizeOfficeRole(r))
      if (!normalizedAllowed.includes(role)) {
        throw createError({ statusCode: 403, statusMessage: 'admin.notAllowed' })
      }
    }
  }
  return officer
}

export async function requireRole(event: H3Event, allowed: StaffRole[]): Promise<Record<string, any>> {
  return requireAdmin(event, allowed)
}

export async function requirePermission(
  event: H3Event,
  permission: string | string[]
): Promise<Record<string, any>> {
  const officer = await requireAdmin(event)
  const perms = Array.isArray(permission) ? permission : [permission]
  if (!perms.some((p) => officerHasPermission(officer, p))) {
    throw createError({
      statusCode: 403,
      statusMessage: `สิทธิ์ไม่เพียงพอสำหรับบทบาท ${officer.roleLabelTh || officer.role}`
    })
  }
  return officer
}

export async function requireOfficer(
  event: H3Event,
  permission?: string | string[]
): Promise<Record<string, any>> {
  if (!permission) return requireAdmin(event)
  return requirePermission(event, permission)
}
