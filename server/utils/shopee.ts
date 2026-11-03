import { runAiTask } from './ai'

export interface ShopeeImportInput {
  url?: string
  rawPayload?: string
  brandSlug?: string
  categorySlug?: string
  useAi?: boolean
}

export interface ParsedShopeeProduct {
  sku: string
  name: string
  nameTh: string
  nameEn: string
  brandSlug: string
  categorySlug: string
  price: number
  originalPrice: number | null
  stock: number
  images: string[]
  shortDescription: string
  descriptionTh: string
  descriptionEn: string
  specs: Record<string, string>
  shopeeUrl: string
  shopeeItemId: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  aseoSummary?: string
  aseoFaqs?: { q: string; a: string }[]
}

function detectBrand(text: string, fallback = 'olympianus'): string {
  const s = text.toLowerCase()
  if (s.includes('ogival') || s.includes('โอจิวัล')) return 'ogival'
  if (s.includes('olympia star') || s.includes('โอลิมเปียสตาร์') || /\bopa[- ]?\d/i.test(text)) return 'olympia-star'
  return fallback || 'olympianus'
}

function detectCategory(text: string, fallback = 'men-watches'): string {
  const s = text.toLowerCase()
  if (s.includes('คู่') || s.includes('couple') || s.includes('pair')) return 'couple-watches'
  if (s.includes('ผู้หญิง') || s.includes('สุภาพสตรี') || s.includes('lady') || s.includes('ladies') || s.includes('women')) {
    return s.includes('เพชร') || s.includes('เซรามิก') || s.includes('ceramic') || s.includes('diamond')
      ? 'women-jewelry'
      : 'women-watches'
  }
  if (s.includes('ดำน้ำ') || s.includes('สปอร์ต') || s.includes('diver') || s.includes('sport') || s.includes('chrono')) {
    return 'sport-watches'
  }
  if (s.includes('สายหนัง') || s.includes('บาง') || s.includes('classic') || s.includes('dress')) {
    return 'classic-watches'
  }
  return fallback || 'men-watches'
}

function normalizeShopeePrice(v: any): number {
  const n = Number(v)
  if (!Number.isFinite(n) || n <= 0) return 0
  // Shopee internal JSON often stores prices multiplied by 100,000
  if (n >= 100_000_000) return Math.round(n / 100_000)
  return Math.round(n)
}

function shopeeImageToUrl(hashOrUrl: string): string {
  const s = String(hashOrUrl || '').trim()
  if (!s) return ''
  if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/')) return s
  return `https://down-th.img.susercontent.com/file/${s}`
}

export async function parseShopeeImport(input: ShopeeImportInput): Promise<ParsedShopeeProduct[]> {
  const url = String(input.url || '').trim()
  let raw = String(input.rawPayload || '').trim()

  // Extract shopid & itemid from standard Shopee Thailand URLs:
  // e.g. https://shopee.co.th/Product-Name-i.123456.789012345 or /product/123456/789012345
  let shopId = ''
  let itemId = ''
  const mDot = url.match(/-i\.(\d+)\.(\d+)/i)
  const mSlash = url.match(/\/product\/(\d+)\/(\d+)/i)
  if (mDot) {
    shopId = mDot[1]
    itemId = mDot[2]
  } else if (mSlash) {
    shopId = mSlash[1]
    itemId = mSlash[2]
  }

  // Try fetching public page metadata if no rawPayload was pasted and network permits
  if (!raw && url.startsWith('http')) {
    try {
      const resp = await fetch(url, {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
          'accept-language': 'th-TH,th;q=0.9,en;q=0.8'
        },
        signal: AbortSignal.timeout(8000)
      })
      if (resp.ok) {
        raw = await resp.text()
      }
    } catch {
      // Fallback to URL slug parsing when Shopee blocks bot IP or sandbox restricts outbound host
    }
  }

  const out: ParsedShopeeProduct[] = []

  // Case 1: JSON payload from Shopee API (`data.item`, `data.items`, or array of items)
  if (raw.startsWith('{') || raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw)
      const candidates: any[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.data?.items)
          ? parsed.data.items.map((x: any) => x.item_basic || x)
          : Array.isArray(parsed?.items)
            ? parsed.items.map((x: any) => x.item_basic || x)
            : parsed?.data?.item
              ? [parsed.data.item]
              : parsed?.item
                ? [parsed.item]
                : [parsed]

      for (const item of candidates) {
        const title = String(item.name || item.title || '').trim()
        if (!title) continue
        const modelMatch = title.match(/\b([A-Z]{0,3}\d{3,6}[A-Z0-9-]{1,12})\b/i)
        const sku = String(item.sku || item.model_sku || (modelMatch ? modelMatch[1].toUpperCase() : `SHP-${item.itemid || Date.now()}`))
        const price = normalizeShopeePrice(item.price_min || item.price || 4900)
        const orig = normalizeShopeePrice(item.price_before_discount || item.original_price || 0)
        const imgs: string[] = Array.isArray(item.images)
          ? item.images.map(shopeeImageToUrl).filter(Boolean)
          : item.image
            ? [shopeeImageToUrl(item.image)]
            : ['/images/op/watch-990-083-blue.png']
        const brandSlug = input.brandSlug || detectBrand(title)
        const categorySlug = input.categorySlug || detectCategory(title)
        const specs: Record<string, string> = {}
        if (Array.isArray(item.attributes)) {
          for (const attr of item.attributes) {
            if (attr?.name && attr?.value) specs[String(attr.name)] = String(attr.value)
          }
        }
        const descText = String(item.description || title)
        const baseProduct: ParsedShopeeProduct = {
          sku,
          name: title,
          nameTh: title,
          nameEn: title,
          brandSlug,
          categorySlug,
          price: price || 4900,
          originalPrice: orig > price ? orig : null,
          stock: Number(item.stock ?? 10) || 10,
          images: imgs.length ? imgs : ['/images/op/watch-990-083-blue.png'],
          shortDescription: descText.slice(0, 160),
          descriptionTh: `<p>${descText.replace(/\n+/g, '</p><p>')}</p>`,
          descriptionEn: `<p>${title}</p>`,
          specs,
          shopeeUrl: url || (item.shopid && item.itemid ? `https://shopee.co.th/product/${item.shopid}/${item.itemid}` : 'https://shopee.co.th/opwatchthailand'),
          shopeeItemId: String(item.itemid || itemId || '')
        }

        if (input.useAi !== false) {
          const ai = await runAiTask({
            task: 'shopee_enrich',
            input: { ...baseProduct, brand: brandSlug === 'ogival' ? 'Ogival' : brandSlug === 'olympia-star' ? 'Olympia Star' : 'Olym Pianus' }
          })
          Object.assign(baseProduct, {
            nameEn: ai.result.nameEn || baseProduct.nameEn,
            shortDescription: ai.result.shortDescription || baseProduct.shortDescription,
            descriptionTh: item.description ? baseProduct.descriptionTh : ai.result.descriptionTh,
            descriptionEn: ai.result.descriptionEn || baseProduct.descriptionEn,
            seoTitle: ai.result.seoTitle,
            seoDescription: ai.result.seoDescription,
            seoKeywords: ai.result.seoKeywords,
            aseoSummary: ai.result.aseoSummary,
            aseoFaqs: ai.result.aseoFaqs
          })
        }
        out.push(baseProduct)
      }
      if (out.length) return out
    } catch {
      // Fall through to HTML / text extraction
    }
  }

  // Case 2: HTML / Raw pasted product text OR Shopee URL slug extraction
  let extractedTitle = ''
  let extractedPrice = 0
  let extractedOriginal = 0
  const extractedImages: string[] = []
  let extractedDesc = ''

  if (raw) {
    const ogTitle = raw.match(/property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
    const ogImg = raw.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/gi)
    const ogDesc = raw.match(/property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
    if (ogTitle) extractedTitle = ogTitle[1].replace(/\s*\|\s*Shopee Thailand.*$/i, '').trim()
    if (ogDesc) extractedDesc = ogDesc[1].trim()
    if (ogImg) {
      for (const tag of ogImg) {
        const m = tag.match(/content=["']([^"']+)["']/i)
        if (m?.[1]) extractedImages.push(m[1])
      }
    }
    // Extract any susercontent image URLs pasted directly
    const imgMatches = raw.match(/https?:\/\/[^\s"'<>]+(?:susercontent\.com|\.jpg|\.jpeg|\.png|\.webp)[^\s"'<>]*/gi) || []
    for (const im of imgMatches) {
      if (!extractedImages.includes(im)) extractedImages.push(im)
    }

    if (!extractedTitle) {
      const firstLine = raw.split(/\r?\n/).map((l) => l.trim()).find(Boolean) || ''
      extractedTitle = firstLine.slice(0, 180)
      extractedDesc = raw
    }

    const bahtMatches = [...raw.matchAll(/(?:฿|THB|ราคา)\s*([\d,]{3,9})/gi)].map((m) => Number(m[1].replace(/,/g, '')))
    const validPrices = bahtMatches.filter((n) => n >= 500 && n <= 900000)
    if (validPrices.length >= 2) {
      extractedPrice = Math.min(...validPrices)
      extractedOriginal = Math.max(...validPrices)
    } else if (validPrices.length === 1) {
      extractedPrice = validPrices[0]
    }
  }

  if (!extractedTitle && url) {
    try {
      const u = new URL(url)
      const pathPart = decodeURIComponent(u.pathname.replace(/^\//, '').replace(/-i\.\d+\.\d+.*$/, ''))
      extractedTitle = pathPart.replace(/[-_]+/g, ' ').trim()
    } catch {
      extractedTitle = url
    }
  }

  if (!extractedTitle) {
    extractedTitle = 'Olym Pianus Sapphire Official Watch'
  }

  const modelCodeMatch = (extractedTitle + ' ' + raw).match(/\b((?:OPA|OP|OG)?[- ]?\d{3,6}[A-Z0-9-]{1,10})\b/i)
  const sku = modelCodeMatch
    ? modelCodeMatch[1].toUpperCase().replace(/\s+/g, '')
    : itemId
      ? `SHP-${itemId.slice(-8)}`
      : `OP-SHP-${String(Date.now()).slice(-6)}`

  const brandSlug = input.brandSlug || detectBrand(extractedTitle + ' ' + raw)
  const brandLabel = brandSlug === 'ogival' ? 'Ogival' : brandSlug === 'olympia-star' ? 'Olympia Star' : 'Olym Pianus'
  const categorySlug = input.categorySlug || detectCategory(extractedTitle + ' ' + raw)

  const base: ParsedShopeeProduct = {
    sku,
    name: extractedTitle,
    nameTh: extractedTitle,
    nameEn: `${brandLabel} Authentic Watch ${sku}`,
    brandSlug,
    categorySlug,
    price: extractedPrice || 5900,
    originalPrice: extractedOriginal > extractedPrice ? extractedOriginal : Math.round((extractedPrice || 5900) * 1.25),
    stock: 10,
    images: extractedImages.length ? extractedImages.slice(0, 8) : ['/images/op/watch-990-083-blue.png'],
    shortDescription: '',
    descriptionTh: extractedDesc ? `<p>${extractedDesc.replace(/\n+/g, '</p><p>')}</p>` : '',
    descriptionEn: '',
    specs: {
      Brand: brandLabel,
      Model: sku,
      Crystal: 'Sapphire Crystal',
      'Case Material': '316L Stainless Steel',
      Warranty: '2 Years Official Thailand Warranty (บริษัท อินเตอร์ไทมส์ จำกัด)'
    },
    shopeeUrl: url || 'https://shopee.co.th/opwatchthailand',
    shopeeItemId: itemId || shopId
  }

  const ai = await runAiTask({
    task: 'shopee_enrich',
    input: { ...base, brand: brandLabel }
  })

  return [
    {
      ...base,
      nameEn: ai.result.nameEn || base.nameEn,
      shortDescription: ai.result.shortDescription || `${brandLabel} ของแท้ กระจกแซฟไฟร์ รับประกันศูนย์ไทย 2 ปี`,
      descriptionTh: base.descriptionTh || ai.result.descriptionTh,
      descriptionEn: ai.result.descriptionEn,
      seoTitle: ai.result.seoTitle,
      seoDescription: ai.result.seoDescription,
      seoKeywords: ai.result.seoKeywords,
      aseoSummary: ai.result.aseoSummary,
      aseoFaqs: ai.result.aseoFaqs
    }
  ]
}
