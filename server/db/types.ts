export type Entity = 'categories' | 'products' | 'customers' | 'orders' | 'order_items' | 'reviews'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface FindOptions {
  where?: Record<string, any>
  like?: Record<string, string>
  in?: Record<string, any[]>
  orderBy?: string
  orderDir?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface Store {
  readonly driver: string
  ready(): Promise<void>
  all(entity: Entity): Promise<Record<string, any>[]>
  find(entity: Entity, opts?: FindOptions): Promise<Record<string, any>[]>
  findOne(entity: Entity, opts?: FindOptions): Promise<Record<string, any> | null>
  findById(entity: Entity, id: number | string): Promise<Record<string, any> | null>
  count(entity: Entity, opts?: FindOptions): Promise<number>
  create(entity: Entity, data: Record<string, any>): Promise<Record<string, any>>
  update(entity: Entity, id: number, data: Record<string, any>): Promise<Record<string, any> | null>
  remove(entity: Entity, id: number): Promise<boolean>
  raw(sql: string, params?: any[]): Promise<any[]>
}

/** Column whitelist per entity — also serves as the SQL injection guard. */
export const COLUMNS: Record<Entity, string[]> = {
  categories: ['id', 'slug', 'name', 'name_en', 'name_th', 'description', 'description_en', 'description_th', 'image', 'sort_order', 'created_at'],
  products: ['id', 'sku', 'name', 'name_en', 'name_th', 'slug', 'category_id', 'brand', 'price', 'price_compare', 'currency', 'images', 'short_description', 'description', 'description_en', 'description_th', 'specs', 'stock', 'status', 'featured', 'sort_order', 'created_at', 'updated_at'],
  customers: ['id', 'name', 'email', 'password_hash', 'phone', 'address', 'city', 'postal_code', 'country', 'is_admin', 'points', 'total_spent', 'created_at'],
  orders: ['id', 'order_no', 'customer_id', 'customer_name', 'customer_email', 'phone', 'address', 'city', 'postal_code', 'country', 'subtotal', 'shipping_fee', 'discount', 'total', 'currency', 'status', 'payment_method', 'note', 'created_at', 'updated_at'],
  order_items: ['id', 'order_id', 'product_id', 'sku', 'name', 'image', 'price', 'quantity'],
  reviews: ['id', 'product_id', 'customer_name', 'rating', 'comment', 'status', 'created_at']
}

export const ENTITIES: Entity[] = ['categories', 'products', 'customers', 'orders', 'order_items', 'reviews']

export const toSnake = (key: string): string =>
  key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').toLowerCase()

export const toCamel = (key: string): string => key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase())

/** Convert a snake_case DB row into the camelCase shape the API uses. */
export function rowToApi(row: Record<string, any>): Record<string, any> {
  if (!row) return row
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(row)) {
    out[toCamel(k)] = v
  }
  return shape(out)
}

/** Normalise types that differ between MySQL and JSON storage. */
export function shape<T extends Record<string, any> | null>(row: T): T {
  if (!row) return row
  const r: any = { ...row }
  if (r.featured !== undefined) r.featured = Number(r.featured) === 1
  if (r.isAdmin !== undefined) r.isAdmin = Number(r.isAdmin) === 1
  if (r.images && typeof r.images === 'string') {
    try { r.images = JSON.parse(r.images) } catch { r.images = [r.images] }
  }
  if (r.specs && typeof r.specs === 'string') {
    try { r.specs = JSON.parse(r.specs) } catch { r.specs = {} }
  }
  const numericFields = ['price', 'priceCompare', 'stock', 'sortOrder', 'shippingFee', 'discount', 'subtotal', 'total', 'totalSpent', 'points', 'rating', 'quantity', 'shipping_fee', 'freeShippingThreshold']
  for (const f of numericFields) {
    if (r[f] !== undefined && r[f] !== null && r[f] !== '') r[f] = Number(r[f])
  }
  return r as T
}

/** Restrict incoming keys to the entity's column whitelist. */
export function pickColumns(entity: Entity, data: Record<string, any>, { excludeId = false } = {}): Record<string, any> {
  const allowed = new Set(COLUMNS[entity])
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(data)) {
    const col = toSnake(k)
    if (excludeId && col === 'id') continue
    if (allowed.has(col)) out[col] = v
  }
  return out
}
