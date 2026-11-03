export type Entity =
  | 'brands'
  | 'categories'
  | 'products'
  | 'customers'
  | 'orders'
  | 'order_items'
  | 'reviews'
  | 'campaigns'
  | 'promotions'
  | 'coupons'
  | 'branches'
  | 'pages'
  | 'chats'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type StaffRole = 'ceo' | 'admin' | 'staff' | 'member'

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
  brands: [
    'id', 'slug', 'name', 'name_en', 'name_th', 'country', 'country_en',
    'movement', 'movement_en', 'positioning', 'tagline', 'tagline_en',
    'story', 'story_en', 'accent_color', 'logo', 'hero_image',
    'sort_order', 'active', 'created_at'
  ],
  categories: [
    'id', 'slug', 'name', 'name_en', 'name_th', 'parent_id',
    'description', 'description_en', 'description_th',
    'image', 'icon', 'banner_image', 'sort_order', 'created_at'
  ],
  products: [
    'id', 'sku', 'name', 'name_en', 'name_th', 'slug',
    'brand_id', 'brand', 'category_id',
    'price', 'original_price', 'price_compare', 'currency',
    'images', 'short_description', 'description', 'description_en', 'description_th',
    'specs', 'stock', 'status', 'badges', 'featured', 'sort_order',
    'seo_title', 'seo_description', 'seo_keywords', 'aseo_summary', 'aseo_faqs',
    'shopee_url', 'shopee_item_id', 'video_url', 'gift_wrap_available', 'points_multiplier',
    'created_at', 'updated_at'
  ],
  customers: [
    'id', 'name', 'email', 'password_hash', 'phone', 'address', 'city', 'postal_code', 'country',
    'is_admin', 'role', 'department', 'position', 'permissions', 'status', 'last_login_at',
    'points', 'total_spent', 'created_at'
  ],
  orders: [
    'id', 'order_no', 'customer_id', 'customer_name', 'customer_email', 'phone',
    'address', 'city', 'postal_code', 'country',
    'subtotal', 'shipping_fee', 'discount', 'total', 'currency',
    'status', 'payment_method', 'note',
    'tracking_no', 'carrier', 'confirmed_at', 'shipped_at', 'delivered_at',
    'coupon_code', 'gift_wrap', 'gift_message', 'branch_slug',
    'points_redeemed', 'points_earned', 'channel',
    'created_at', 'updated_at'
  ],
  order_items: [
    'id', 'order_id', 'product_id', 'sku', 'name', 'image', 'price', 'quantity', 'wrist_size'
  ],
  reviews: [
    'id', 'product_id', 'customer_name', 'rating', 'comment', 'status', 'created_at'
  ],
  campaigns: [
    'id', 'slug', 'title', 'title_en', 'title_th', 'subtitle', 'subtitle_en', 'subtitle_th',
    'banner', 'link', 'brand_id', 'type', 'sort_order', 'active', 'created_at'
  ],
  promotions: [
    'id', 'slug', 'title', 'title_th', 'title_en', 'subtitle', 'subtitle_th', 'subtitle_en',
    'banner', 'mobile_banner', 'channel', 'badge', 'coupon_code', 'discount_label',
    'link', 'target_blank', 'show_on_home', 'home_columns', 'product_ids',
    'starts_at', 'ends_at', 'sort_order', 'active', 'created_at', 'updated_at'
  ],
  coupons: [
    'id', 'code', 'title', 'title_th', 'title_en', 'description',
    'type', 'value', 'min_spend', 'max_discount', 'brand_slug',
    'expires_at', 'usage_limit', 'used_count', 'active', 'created_at'
  ],
  branches: [
    'id', 'slug', 'name', 'name_th', 'name_en', 'zone',
    'address', 'address_en', 'phone', 'hours', 'line_url', 'map_url',
    'services', 'sort_order', 'active', 'created_at'
  ],
  pages: [
    'id', 'slug', 'category', 'title', 'title_th', 'title_en',
    'summary', 'summary_en', 'content_th', 'content_en', 'banner',
    'seo_title', 'seo_description', 'seo_keywords', 'og_image', 'canonical_url',
    'aseo_summary', 'aseo_faqs', 'schema_type',
    'status', 'sort_order', 'created_at', 'updated_at'
  ],
  chats: [
    'id', 'session_id', 'customer_name', 'customer_contact', 'channel',
    'product_slug', 'message', 'sender', 'status', 'reply', 'created_at'
  ]
}

export const ENTITIES: Entity[] = [
  'brands',
  'categories',
  'products',
  'customers',
  'orders',
  'order_items',
  'reviews',
  'campaigns',
  'promotions',
  'coupons',
  'branches',
  'pages',
  'chats'
]

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

  const boolFields = ['featured', 'isAdmin', 'active', 'showOnHome', 'targetBlank', 'giftWrap', 'giftWrapAvailable']
  for (const bf of boolFields) {
    if (r[bf] !== undefined && r[bf] !== null) {
      r[bf] = r[bf] === true || Number(r[bf]) === 1 || r[bf] === '1' || r[bf] === 'true'
    }
  }

  const jsonArrayFields = ['images', 'badges', 'productIds', 'services', 'aseoFaqs', 'permissions']
  for (const jf of jsonArrayFields) {
    if (r[jf] && typeof r[jf] === 'string') {
      try {
        const parsed = JSON.parse(r[jf])
        r[jf] = Array.isArray(parsed) ? parsed : [parsed]
      } catch {
        r[jf] = jf === 'images' ? [r[jf]] : []
      }
    }
  }

  if (r.specs && typeof r.specs === 'string') {
    try { r.specs = JSON.parse(r.specs) } catch { r.specs = {} }
  }

  const numericFields = [
    'price', 'priceCompare', 'originalPrice', 'stock', 'sortOrder',
    'shippingFee', 'discount', 'subtotal', 'total', 'totalSpent',
    'points', 'pointsRedeemed', 'pointsEarned', 'pointsMultiplier',
    'rating', 'quantity', 'brandId', 'categoryId', 'parentId',
    'shipping_fee', 'freeShippingThreshold', 'homeColumns',
    'value', 'minSpend', 'maxDiscount', 'usageLimit', 'usedCount'
  ]
  for (const f of numericFields) {
    if (r[f] !== undefined && r[f] !== null && r[f] !== '') r[f] = Number(r[f])
  }

  if (r.isAdmin && !r.role) {
    r.role = 'ceo'
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
