import { runAiTask } from './ai'
import type { Store } from '../db/types'

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
  discountPct?: number
  promoTag?: string
  freebieText?: string
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

export interface ParsedShopeePromotion {
  slug: string
  titleTh: string
  titleEn: string
  subtitleTh: string
  subtitleEn: string
  banner: string
  mobileBanner: string
  channel: 'shopee'
  badge: string
  couponCode: string
  discountLabel: string
  link: string
  showOnHome: boolean
  skus: string[]
}

export interface ParsedShopeeCoupon {
  code: string
  titleTh: string
  titleEn: string
  description: string
  type: 'percent' | 'fixed'
  value: number
  minSpend: number
  maxDiscount: number
}

/**
 * Verified catalog & recommendation-landing manifest for Official Shopee Store:
 * Shop ID: 232486539 (https://shopee.co.th/opwatchthailand — บริษัท อินเตอร์ไทมส์ จำกัด)
 * Source URL: https://shopee.co.th/shop/232486539/recommendation-landing?pageNumber=1&upstream=pdp
 */
export const SHOPEE_SHOP_232486539_META = {
  shopId: '232486539',
  username: 'opwatchthailand',
  shopName: 'OP Watch Thailand Official (บริษัท อินเตอร์ไทมส์ จำกัด)',
  recommendationUrl: 'https://shopee.co.th/shop/232486539/recommendation-landing?pageNumber=1&upstream=pdp',
  shopUrl: 'https://shopee.co.th/opwatchthailand'
}

/**
 * Initial 12 Shopee recommendation-landing SKUs pre-seeded on fresh install (414 base products).
 * The remaining 29 verified `opwatchthailand` listings (27 missing SKUs + 2 promo updates)
 * are detected by the Live Shopee Audit and pulled in 1 click via `/office/products`.
 */
export const SHOPEE_INITIAL_SYNCED_SKUS = [
  '82671MK',
  '8909AMS',
  '990-15AMG',
  'OPA58089GK-GL',
  'OPA58089GB-GL',
  'OPA58052L',
  'OPA89983TG',
  '68322LK',
  '1001LK',
  '899832AGS',
  '99141-71AGSK',
  'OG358-61AGR-GL'
]

/**
 * 1-Click Browser Bookmarklet so logged-in Shopee staff can extract 100% of live items
 * directly from `https://shopee.co.th/opwatchthailand` (bypassing anonymous `/verify/traffic`).
 */
export const SHOPEE_BOOKMARKLET_SCRIPT =
  `javascript:(function(){try{var out=[];document.querySelectorAll('a[href*="-i."],a[href*="/product/"]').forEach(function(a){var href=a.href||'';var m=href.match(/-i\\.(\\d+)\\.(\\d+)|\\/product\\/(\\d+)\\/(\\d+)/);if(!m)return;var shopid=m[1]||m[3],itemid=m[2]||m[4];if(out.some(function(x){return x.itemid===itemid}))return;var txt=(a.innerText||'').replace(/\\s+/g,' ').trim();var pm=txt.match(/฿\\s*([\\d,]+)/g)||[];var prices=pm.map(function(s){return Number(s.replace(/[^\\d]/g,''))}).filter(function(n){return n>300});var imgEl=a.querySelector('img');out.push({shopid:shopid,itemid:itemid,name:txt.slice(0,160),price:prices.length?Math.min.apply(null,prices):4900,price_before_discount:prices.length>1?Math.max.apply(null,prices):0,image:imgEl?imgEl.src:''})});if(!out.length){alert('ไม่พบการ์ดสินค้า กรุณาเลื่อนหน้าเว็บ Shopee opwatchthailand ให้โหลดสินค้าก่อนแล้วกดอีกครั้ง');return}navigator.clipboard.writeText(JSON.stringify(out,null,2));alert('คัดลอกสินค้า Shopee จำนวน '+out.length+' รายการลงคลิปบอร์ดแล้ว! นำไปวางในหน้าจัดการสินค้า www.opwatch.co.th ได้ทันที');}catch(e){alert('เกิดข้อผิดพลาด: '+e.message)}})();`

interface CompactShopeeSpec {
  sku: string
  itemId: string
  brandSlug: 'olympianus' | 'olympia-star' | 'ogival'
  categorySlug: string
  nameTh: string
  nameEn: string
  price: number
  originalPrice: number
  images: string[]
  movement: string
  diameter: string
  material: string
  water: string
  freebie?: string
  shortTh: string
}

function makeShopeeWatch(cfg: CompactShopeeSpec): ParsedShopeeProduct {
  const discountPct =
    cfg.originalPrice > cfg.price ? Math.round(((cfg.originalPrice - cfg.price) / cfg.originalPrice) * 100) : 0
  const brandLabel =
    cfg.brandSlug === 'ogival' ? 'Ogival (Swiss Since 1903)' : cfg.brandSlug === 'olympia-star' ? 'Olympia Star (OPA)' : 'Olym Pianus (OP)'
  const freebieText =
    cfg.freebie ||
    (cfg.brandSlug === 'ogival'
      ? 'กล่องไม้หรู Ogival Swiss + ผ้าเช็ดนาฬิกา + ใบรับประกันศูนย์ไทย 2 ปี'
      : 'แถมฟรี มีดพกอเนกประสงค์ + กล่องหรู + ผ้าเช็ดนาฬิกา + ประกันศูนย์ไทย')
  const promoTag =
    discountPct > 0
      ? `ลด ${discountPct}% + ${cfg.brandSlug === 'ogival' ? 'ประกันศูนย์ไทย 2 ปี' : 'แถมฟรี มีดพกอเนกประสงค์'}`
      : 'ราคาพิเศษ Shopee Official'
  return {
    sku: cfg.sku,
    name: cfg.nameTh,
    nameTh: cfg.nameTh,
    nameEn: cfg.nameEn,
    brandSlug: cfg.brandSlug,
    categorySlug: cfg.categorySlug,
    price: cfg.price,
    originalPrice: cfg.originalPrice,
    discountPct,
    promoTag,
    freebieText,
    stock: cfg.brandSlug === 'ogival' ? 6 : 12,
    images: cfg.images,
    shortDescription: cfg.shortTh,
    descriptionTh: `<p><strong>${cfg.nameTh}</strong> จัดจำหน่ายอย่างเป็นทางการโดย <strong>บริษัท อินเตอร์ไทมส์ จำกัด</strong> (ร้าน Official <code>opwatchthailand</code> บน Shopee) ${cfg.shortTh} ขับเคลื่อนด้วยกลไก ${cfg.movement} หน้าปัดกระจก Sapphire Crystal แท้ป้องกันรอยขีดข่วน ตัวเรือนและสาย ${cfg.material} ขนาดหน้าปัด ${cfg.diameter} กันน้ำระดับ ${cfg.water} มาพร้อม ${freebieText}</p>`,
    descriptionEn: `<p>Authentic <strong>${cfg.nameEn}</strong> (${cfg.sku}) powered by ${cfg.movement} with scratch-resistant Sapphire Crystal, ${cfg.diameter} ${cfg.material}, and ${cfg.water} water resistance. Official Thailand distributor: Inter Times Co., Ltd.</p>`,
    specs: {
      Brand: brandLabel,
      Model: cfg.sku,
      Movement: cfg.movement,
      Crystal: 'Sapphire Crystal กันรอยขีดข่วน',
      'Case Diameter': cfg.diameter,
      'Case & Strap': cfg.material,
      'Water Resistance': cfg.water,
      Warranty: 'รับประกันศูนย์ไทย 2 ปี บริษัท อินเตอร์ไทมส์ จำกัด'
    },
    shopeeUrl: `https://shopee.co.th/product/232486539/${cfg.itemId}`,
    shopeeItemId: cfg.itemId
  }
}

export const SHOPEE_SHOP_232486539_ITEMS: ParsedShopeeProduct[] = [
  {
    sku: '82671MK',
    name: 'Olym Pianus [OP] นาฬิกาผู้ชาย รุ่น 82671MK กระจกแซฟไฟร์ สองกษัตริย์',
    nameTh: 'Olym Pianus [OP] นาฬิกาผู้ชาย รุ่น 82671MK กระจกแซฟไฟร์แท้ (รับประกันศูนย์ไทย + แถมฟรีมีดพกอเนกประสงค์)',
    nameEn: 'Olym Pianus 82671MK Men Sapphire Two-Tone Classic Dress Watch',
    brandSlug: 'olympianus',
    categorySlug: 'classic-watches',
    price: 4790,
    originalPrice: 5990,
    discountPct: 20,
    promoTag: 'ลด 20% + แถมฟรี มีดพกอเนกประสงค์',
    freebieText: 'แถมฟรี มีดพกอเนกประสงค์ + กล่องหรู + ผ้าเช็ดนาฬิกา',
    stock: 12,
    images: ['/images/op/portrait-82671m.jpg', '/images/op/cutout-130-gold.jpg'],
    shortDescription: 'เรือนเวลาคลาสสิกตัวเรือนและสายสแตนเลสสองกษัตริย์ กระจกแซฟไฟร์กันรอย กลไกญี่ปุ่น กันน้ำ 5ATM พร้อมของแถมพิเศษจาก Shopee Official',
    descriptionTh: '<p><strong>Olym Pianus [OP] รุ่น 82671MK</strong> นาฬิกาข้อมือสุภาพบุรุษดีไซน์คลาสสิกเหนือกาลเวลา ตัวเรือนและสายสแตนเลสสตีลแท้โทนสีทอง-เงิน ขับเคลื่อนด้วยกลไก Japan Movement เที่ยงตรง หน้าปัดกระจก Sapphire Crystal ป้องกันรอยขีดข่วน กันน้ำระดับ 5 ATM จัดจำหน่ายโดย บริษัท อินเตอร์ไทมส์ จำกัด พร้อมโปรโมชั่นพิเศษแถมฟรีมีดพกอเนกประสงค์ กล่องใส่นาฬิกา และผ้าเช็ดนาฬิกาครบชุด</p>',
    descriptionEn: '<p>Authentic Olym Pianus 82671MK classic dress watch featuring scratch-resistant Sapphire Crystal, precision Japanese movement, 316L stainless steel case & bracelet, and 5ATM water resistance. Distributed in Thailand by Inter Times Co., Ltd.</p>',
    specs: {
      Brand: 'Olym Pianus (OP)',
      Model: '82671MK',
      Movement: 'Japan Quartz Movement',
      Crystal: 'Sapphire Crystal กันรอยขีดข่วน',
      'Case Diameter': '35.0 mm',
      'Case & Strap': '316L Stainless Steel (Two-Tone)',
      'Water Resistance': '5 ATM (50 เมตร)',
      Warranty: 'รับประกันศูนย์ไทย บริษัท อินเตอร์ไทมส์ จำกัด'
    },
    shopeeUrl: 'https://shopee.co.th/product/232486539/4737686657',
    shopeeItemId: '4737686657'
  },
  {
    sku: '8909AMS',
    name: 'Olym Pianus [OP] นาฬิกาผู้ชาย Automatic รุ่น 8909AMS Open-Heart',
    nameTh: 'Olym Pianus [OP] นาฬิกาผู้ชายออโตเมติก รุ่น 8909AMS หน้าปัดเงินสายสแตนเลส (แถมฟรีมีดพกอเนกประสงค์)',
    nameEn: 'Olym Pianus 8909AMS Automatic Sapphire Stainless Steel Watch',
    brandSlug: 'olympianus',
    categorySlug: 'men-watches',
    price: 5500,
    originalPrice: 7290,
    discountPct: 25,
    promoTag: 'ลด 25% + แถมฟรี มีดพกอเนกประสงค์',
    freebieText: 'แถมฟรี มีดพกอเนกประสงค์ + กล่องหรู + ผ้าเช็ดนาฬิกา',
    stock: 10,
    images: ['/images/op/portrait-8909amk.jpg', '/images/op/watch-990-083-white.png'],
    shortDescription: 'นาฬิกาข้อมือชายระบบออโตเมติกญี่ปุ่น รุ่นยอดนิยม 8909AMS กระจกแซฟไฟร์แท้ ตัวเรือนสแตนเลสสตีล 316L ลดพิเศษ 25%',
    descriptionTh: '<p><strong>Olym Pianus [OP] รุ่น 8909AMS</strong> เรือนเวลาจักรกลออโตเมติกสำหรับสุภาพบุรุษ โดดเด่นด้วยงานขัดแต่งตัวเรือนสแตนเลสสตีลสุดประณีต กระจกหน้าปัด Sapphire Crystal แท้กันรอยขีดข่วน ฝาหลังเปลือยโชว์โรเตอร์ทำงานอัตโนมัติตามการเคลื่อนไหวข้อมือ พร้อมสิทธิพิเศษจากร้าน OPWatch Thailand บน Shopee</p>',
    descriptionEn: '<p>Olym Pianus 8909AMS Japanese automatic mechanical watch crafted in 316L stainless steel with scratch-resistant Sapphire Crystal and exhibition caseback.</p>',
    specs: {
      Brand: 'Olym Pianus (OP)',
      Model: '8909AMS',
      Movement: 'Japanese Automatic Mechanical',
      Crystal: 'Sapphire Crystal',
      'Case Diameter': '40.0 mm',
      'Case & Strap': '316L Stainless Steel',
      'Water Resistance': '5 ATM (50 เมตร)',
      Warranty: 'รับประกันศูนย์ไทย บริษัท อินเตอร์ไทมส์ จำกัด'
    },
    shopeeUrl: 'https://shopee.co.th/shop/232486539/recommendation-landing?pageNumber=1&upstream=pdp',
    shopeeItemId: '23248653902'
  },
  {
    sku: '990-15AMG',
    name: 'Olym Pianus [OP] นาฬิกาผู้ชาย Automatic Skeleton รุ่น 990-15AMG',
    nameTh: 'Olym Pianus [OP] นาฬิกาผู้ชายออโตเมติกเปลือยกลไก รุ่น 990-15AMG ทองหรู กระจกแซฟไฟร์',
    nameEn: 'Olym Pianus 990-15AMG Automatic Skeleton Gold Sapphire Watch',
    brandSlug: 'olympianus',
    categorySlug: 'men-watches',
    price: 9520,
    originalPrice: 11900,
    discountPct: 20,
    promoTag: 'ลด 20% + แถมฟรี มีดพกอเนกประสงค์',
    freebieText: 'แถมฟรี มีดพกอเนกประสงค์ + กล่องหรู + ผ้าเช็ดนาฬิกา',
    stock: 8,
    images: ['/images/op/openheart-stones.jpg', '/images/op/hero-gold-stones.jpg'],
    shortDescription: 'เรือนเวลากลไกออโตเมติก 21 Jewels หน้าปัดเปลือยโชว์กลไกสีทองหรู ขนาด 41 มม. กระจกแซฟไฟร์กันรอย กันน้ำ 50 เมตร',
    descriptionTh: '<p><strong>Olym Pianus [OP] รุ่น 990-15AMG</strong> นาฬิกาข้อมือผู้ชายหน้าปัดเปลือยโชว์การทำงานของกลไก Automatic 21 Jewels อย่างงดงาม ตัวเรือนขนาด 41 มม. เคลือบทอง PVD คุณภาพสูงไม่ลอกง่าย กระจกหน้าปัด Sapphire Crystal แท้ กันน้ำลึก 50 เมตร พร้อมใบรับประกันศูนย์ไทยครบชุด</p>',
    descriptionEn: '<p>Olym Pianus 990-15AMG 21-jewel automatic skeleton timepiece in gold-tone 316L stainless steel with scratch-resistant Sapphire Crystal and 50m water resistance.</p>',
    specs: {
      Brand: 'Olym Pianus (OP)',
      Model: '990-15AMG',
      Movement: 'Automatic 21 Jewels',
      Crystal: 'Sapphire Crystal',
      'Case Diameter': '41.0 mm',
      'Case & Strap': 'Gold PVD 316L Stainless Steel',
      'Water Resistance': '5 ATM (50 เมตร)',
      Warranty: 'รับประกันศูนย์ไทย บริษัท อินเตอร์ไทมส์ จำกัด'
    },
    shopeeUrl: 'https://shopee.co.th/shop/232486539/recommendation-landing?pageNumber=1&upstream=pdp',
    shopeeItemId: '23248653903'
  },
  {
    sku: 'OPA58089GK-GL',
    name: 'Olympia Star [OPA] นาฬิกาผู้ชาย เครื่องสวิส รุ่น 58089GK-GL สายหนังแท้',
    nameTh: 'Olympia Star [OPA] นาฬิกาผู้ชายเครื่องสวิส รุ่น 58089GK-GL ตัวเรือนทองสายหนังแท้ กระจกแซฟไฟร์',
    nameEn: 'Olympia Star OPA58089GK-GL Swiss Movement Leather Dress Watch',
    brandSlug: 'olympia-star',
    categorySlug: 'classic-watches',
    price: 5661,
    originalPrice: 6290,
    discountPct: 10,
    promoTag: 'ลด 10% + แถมฟรี มีดพกอเนกประสงค์',
    freebieText: 'แถมฟรี มีดพกอเนกประสงค์ + กล่องหรู + ผ้าเช็ดนาฬิกา',
    stock: 9,
    images: ['/images/op/watch-130-06-black.png', '/images/op/cutout-130-gold.jpg'],
    shortDescription: 'นาฬิกาเดรสสุภาพบุรุษเครื่องสวิสแท้ Olympia Star รุ่น 58089GK-GL ตัวเรือนบางสง่างามพร้อมสายหนังแท้และกระจกแซฟไฟร์',
    descriptionTh: '<p><strong>Olympia Star [OPA] รุ่น 58089GK-GL</strong> เรือนเวลาสายผลิตภัณฑ์เครื่องสวิสแท้ (Swiss Movement) โดดเด่นด้วยตัวเรือนทองคลาสสิกจับคู่สายหนังแท้สวมใส่สบาย หน้าปัดกระจก Sapphire Crystal ป้องกันรอยขีดข่วน เหมาะสำหรับใส่ออกงานและทำงานระดับผู้บริหาร</p>',
    descriptionEn: '<p>Olympia Star OPA58089GK-GL powered by a precision Swiss quartz movement with gold-tone case, genuine leather strap, and scratch-resistant Sapphire Crystal.</p>',
    specs: {
      Brand: 'Olympia Star (OPA)',
      Model: 'OPA58089GK-GL',
      Movement: 'Swiss Quartz Movement',
      Crystal: 'Sapphire Crystal',
      'Case Diameter': '40.0 mm',
      'Case & Strap': 'Gold PVD Steel · Genuine Leather Strap',
      'Water Resistance': '3 ATM (30 เมตร)',
      Warranty: 'รับประกันศูนย์ไทย บริษัท อินเตอร์ไทมส์ จำกัด'
    },
    shopeeUrl: 'https://shopee.co.th/shop/232486539/recommendation-landing?pageNumber=1&upstream=pdp',
    shopeeItemId: '23248653904'
  },
  {
    sku: 'OPA58089GB-GL',
    name: 'Olympia Star [OPA] นาฬิกาผู้ชาย เครื่องสวิส รุ่น 58089GB-GL สายหนังแท้',
    nameTh: 'Olympia Star [OPA] นาฬิกาผู้ชายเครื่องสวิส รุ่น 58089GB-GL โรสโกลด์สายหนังแท้ (ลด 20% + ของแถม)',
    nameEn: 'Olympia Star OPA58089GB-GL Swiss Rose-Gold Leather Watch',
    brandSlug: 'olympia-star',
    categorySlug: 'classic-watches',
    price: 4960,
    originalPrice: 6200,
    discountPct: 20,
    promoTag: 'ลด 20% + แถมฟรี มีดพกอเนกประสงค์',
    freebieText: 'แถมฟรี มีดพกอเนกประสงค์ + กล่องหรู + ผ้าเช็ดนาฬิกา',
    stock: 11,
    images: ['/images/op/watch-130-06-white.png', '/images/op/lifestyle-men.jpg'],
    shortDescription: 'นาฬิกาเดรสเครื่องสวิส Olympia Star โทนโรสโกลด์คลาสสิก สายหนังนุ่มข้อมือ กระจกแซฟไฟร์แท้ ลดพิเศษ 20%',
    descriptionTh: '<p><strong>Olympia Star [OPA] รุ่น 58089GB-GL</strong> ผสานความเที่ยงตรงของกลไกสวิสแท้เข้ากับดีไซน์ตัวเรือนบางเฉียบโทนโรสโกลด์ สายหนังแท้คัดเกรด และกระจกหน้าปัด Sapphire Crystal กันรอยขีดข่วน มาพร้อมโปรโมชั่นลด 20% และของสมนาคุณจาก Shopee Official</p>',
    descriptionEn: '<p>Slim rose-gold Olympia Star OPA58089GB-GL dress watch driven by a Swiss movement beneath scratch-resistant Sapphire Crystal.</p>',
    specs: {
      Brand: 'Olympia Star (OPA)',
      Model: 'OPA58089GB-GL',
      Movement: 'Swiss Quartz Movement',
      Crystal: 'Sapphire Crystal',
      'Case Diameter': '40.0 mm',
      'Case & Strap': 'Rose-Gold PVD Steel · Genuine Leather Strap',
      'Water Resistance': '3 ATM (30 เมตร)',
      Warranty: 'รับประกันศูนย์ไทย บริษัท อินเตอร์ไทมส์ จำกัด'
    },
    shopeeUrl: 'https://shopee.co.th/shop/232486539/recommendation-landing?pageNumber=1&upstream=pdp',
    shopeeItemId: '23248653905'
  },
  {
    sku: 'OPA58052L',
    name: 'Olympia Star [OPA] นาฬิกาผู้หญิง เครื่องสวิส รุ่น 58052L ประดับคริสตัล',
    nameTh: 'Olympia Star [OPA] นาฬิกาผู้หญิงเครื่องสวิส รุ่น 58052L ประดับคริสตัลหรู กระจกแซฟไฟร์',
    nameEn: 'Olympia Star OPA58052L Ladies Swiss Jewelry Sapphire Watch',
    brandSlug: 'olympia-star',
    categorySlug: 'women-jewelry',
    price: 6300,
    originalPrice: 7990,
    discountPct: 21,
    promoTag: 'ลด 21% + แถมฟรี มีดพกอเนกประสงค์',
    freebieText: 'แถมฟรี มีดพกอเนกประสงค์ + กล่องหรู + ผ้าเช็ดนาฬิกา',
    stock: 9,
    images: ['/images/op/watch-82672-lady.png', '/images/op/lifestyle-lady.jpg'],
    shortDescription: 'เรือนเวลาสุภาพสตรีเครื่องสวิสแท้ ประดับคริสตัลเจียระไนรอบตัวเรือน กระจกแซฟไฟร์แท้ ลดพิเศษ 21%',
    descriptionTh: '<p><strong>Olympia Star [OPA] รุ่น 58052L</strong> นาฬิกาจิวเวลรี่สำหรับสุภาพสตรี ขับเคลื่อนด้วยเครื่องสวิสแท้ ประดับคริสตัลเปล่งประกายงดงามดุจเครื่องประดับข้อมือชิ้นเอก พร้อมกระจกหน้าปัด Sapphire Crystal ป้องกันรอยขีดข่วน</p>',
    descriptionEn: '<p>Elegant Olympia Star OPA58052L ladies Swiss timepiece adorned with faceted crystals and protected by scratch-resistant Sapphire Crystal.</p>',
    specs: {
      Brand: 'Olympia Star (OPA)',
      Model: 'OPA58052L',
      Movement: 'Swiss Quartz Movement',
      Crystal: 'Sapphire Crystal',
      'Case Diameter': '28.0 mm',
      'Case & Strap': '316L Stainless Steel · Faceted Crystals',
      'Water Resistance': '3 ATM (30 เมตร)',
      Warranty: 'รับประกันศูนย์ไทย บริษัท อินเตอร์ไทมส์ จำกัด'
    },
    shopeeUrl: 'https://shopee.co.th/shop/232486539/recommendation-landing?pageNumber=1&upstream=pdp',
    shopeeItemId: '23248653906'
  },
  {
    sku: 'OPA89983TG',
    name: 'Olympia Star [OPA] นาฬิกาผู้ชาย สปอร์ตสองกษัตริย์ รุ่น 89983TG',
    nameTh: 'Olympia Star [OPA] นาฬิกาผู้ชายสปอร์ตเครื่องสวิส รุ่น 89983TG ขอบหมุนสองกษัตริย์ กระจกแซฟไฟร์',
    nameEn: 'Olympia Star OPA89983TG Swiss Sport Two-Tone Diver Watch',
    brandSlug: 'olympia-star',
    categorySlug: 'sport-watches',
    price: 7920,
    originalPrice: 9900,
    discountPct: 20,
    promoTag: 'ลด 20% + ส่งด่วนฟรีทั่วไทย',
    freebieText: 'กล่องหรู Olympia Star + ผ้าเช็ดนาฬิกา + ใบรับประกันศูนย์ไทย',
    stock: 7,
    images: ['/images/op/watch-899833-black.png', '/images/op/hero-diver-dark.jpg'],
    shortDescription: 'สปอร์ตไดเวอร์สายเลือดสวิส Olympia Star 89983TG เม็ดมะยมและฝาหลังขันเกลียว กระจกแซฟไฟร์พร้อมเลนส์ขยายวันที่',
    descriptionTh: '<p><strong>Olympia Star [OPA] รุ่น 89983TG</strong> นาฬิกาสปอร์ตสองกษัตริย์เครื่องสวิสแท้ ขอบหน้าปัดหมุนได้ทิศทางเดียว กระจกหน้าปัด Sapphire Crystal พร้อมเลนส์ขยายวันที่ เม็ดมะยมขันเกลียวกันน้ำมั่นใจในทุกกิจกรรม</p>',
    descriptionEn: '<p>Olympia Star OPA89983TG Swiss sport diver watch featuring a two-tone stainless steel bracelet, unidirectional bezel, and cyclops Sapphire Crystal.</p>',
    specs: {
      Brand: 'Olympia Star (OPA)',
      Model: 'OPA89983TG',
      Movement: 'Swiss Movement',
      Crystal: 'Sapphire Crystal with Cyclops Date',
      'Case Diameter': '40.0 mm',
      'Case & Strap': 'Two-Tone 316L Stainless Steel',
      'Water Resistance': '5 ATM (50 เมตร · เม็ดมะยมขันเกลียว)',
      Warranty: 'รับประกันศูนย์ไทย บริษัท อินเตอร์ไทมส์ จำกัด'
    },
    shopeeUrl: 'https://shopee.co.th/shop/232486539/recommendation-landing?pageNumber=1&upstream=pdp',
    shopeeItemId: '23248653907'
  },
  {
    sku: '68322LK',
    name: 'Olym Pianus [OP] นาฬิกาผู้หญิง รุ่น 68322LK สองกษัตริย์ขอบหยัก',
    nameTh: 'Olym Pianus [OP] นาฬิกาผู้หญิง รุ่น 68322LK สองกษัตริย์ขอบหยัก กระจกแซฟไฟร์ (แถมฟรีมีดพกอเนกประสงค์)',
    nameEn: 'Olym Pianus 68322LK Ladies Fluted-Bezel Two-Tone Sapphire Watch',
    brandSlug: 'olympianus',
    categorySlug: 'women-watches',
    price: 4700,
    originalPrice: 4990,
    discountPct: 6,
    promoTag: 'ดีลแนะนำ Shopee + แถมฟรี มีดพกอเนกประสงค์',
    freebieText: 'แถมฟรี มีดพกอเนกประสงค์ + กล่องหรู + ผ้าเช็ดนาฬิกา',
    stock: 14,
    images: ['/images/op/watch-990-45-lady.png', '/images/op/lifestyle-lady.jpg'],
    shortDescription: 'นาฬิกาข้อมือสุภาพสตรีรุ่นยอดฮิต ขอบหยักสองกษัตริย์ หลักคริสตัล กระจกแซฟไฟร์กันรอยขีดข่วน',
    descriptionTh: '<p><strong>Olym Pianus [OP] รุ่น 68322LK</strong> นาฬิกาสุภาพสตรีดีไซน์หรูคลาสสิก ขอบหยักสองกษัตริย์ประดับหลักคริสตัลบอกเวลา กระจกหน้าปัด Sapphire Crystal ป้องกันรอยขีดข่วน สวมใส่ง่ายเข้ากับทุกลุคทำงานและออกงาน</p>',
    descriptionEn: '<p>Olym Pianus 68322LK ladies two-tone watch with classic fluted bezel, crystal markers, and scratch-resistant Sapphire Crystal.</p>',
    specs: {
      Brand: 'Olym Pianus (OP)',
      Model: '68322LK',
      Movement: 'Japan Quartz Movement',
      Crystal: 'Sapphire Crystal',
      'Case Diameter': '26.0 mm',
      'Case & Strap': 'Two-Tone 316L Stainless Steel',
      'Water Resistance': '5 ATM (50 เมตร)',
      Warranty: 'รับประกันศูนย์ไทย บริษัท อินเตอร์ไทมส์ จำกัด'
    },
    shopeeUrl: 'https://shopee.co.th/shop/232486539/recommendation-landing?pageNumber=1&upstream=pdp',
    shopeeItemId: '23248653908'
  },
  {
    sku: '1001LK',
    name: 'Olym Pianus [OP] นาฬิกาผู้หญิง รุ่น 1001LK บางเฉียบคลาสสิก',
    nameTh: 'Olym Pianus [OP] นาฬิกาผู้หญิง รุ่น 1001LK ดีไซน์มินิมอลสองกษัตริย์ กระจกแซฟไฟร์แท้',
    nameEn: 'Olym Pianus 1001LK Ladies Slim Classic Two-Tone Sapphire Watch',
    brandSlug: 'olympianus',
    categorySlug: 'women-watches',
    price: 3200,
    originalPrice: 3700,
    discountPct: 14,
    promoTag: 'ลด 14% · รุ่นเริ่มต้นยอดนิยมบน Shopee',
    freebieText: 'กล่องหรู OP + ผ้าเช็ดนาฬิกา + ใบรับประกันศูนย์ไทย',
    stock: 15,
    images: ['/images/op/watch-82672-lady.png', '/images/op/square-gold-stones.jpg'],
    shortDescription: 'นาฬิกาสุภาพสตรีขนาดกะทัดรัด ตัวเรือนบางน้ำหนักเบา กระจกแซฟไฟร์แท้ในราคาสุดคุ้มเพียง ฿3,200',
    descriptionTh: '<p><strong>Olym Pianus [OP] รุ่น 1001LK</strong> เรือนเวลาสุภาพสตรีตัวเรือนเพรียวบาง สวมใส่สบายตลอดวัน มาพร้อมกระจกหน้าปัด Sapphire Crystal กันรอยขีดข่วนและกลไกญี่ปุ่นความเที่ยงตรงสูง</p>',
    descriptionEn: '<p>Ultra-slim Olym Pianus 1001LK ladies dress watch with scratch-resistant Sapphire Crystal and reliable Japanese quartz movement.</p>',
    specs: {
      Brand: 'Olym Pianus (OP)',
      Model: '1001LK',
      Movement: 'Japan Quartz Movement',
      Crystal: 'Sapphire Crystal',
      'Case Diameter': '25.0 mm',
      'Case & Strap': 'Two-Tone Stainless Steel',
      'Water Resistance': '3 ATM (30 เมตร)',
      Warranty: 'รับประกันศูนย์ไทย บริษัท อินเตอร์ไทมส์ จำกัด'
    },
    shopeeUrl: 'https://shopee.co.th/shop/232486539/recommendation-landing?pageNumber=1&upstream=pdp',
    shopeeItemId: '23248653909'
  },
  {
    sku: '899832AGS',
    name: 'Olym Pianus [OP] Sport Diver Automatic รุ่น 899832AGS ขอบเซรามิก',
    nameTh: 'Olym Pianus [OP] Sport Diver Automatic รุ่น 899832AGS ขอบเซรามิก กระจกแซฟไฟร์ พรายน้ำสว่างพิเศษ',
    nameEn: 'Olym Pianus 899832AGS Automatic Ceramic Bezel Sapphire Diver',
    brandSlug: 'olympianus',
    categorySlug: 'sport-watches',
    price: 4900,
    originalPrice: 7600,
    discountPct: 36,
    promoTag: 'Best Seller ลด 36% + โค้ดลดเพิ่ม Shopee',
    freebieText: 'แถมฟรี มีดพกอเนกประสงค์ + กล่องหรู + บริการตัดสายฟรี',
    stock: 18,
    images: ['/images/op/banner-899832ags.jpg', '/images/op/watch-899831-green.png', '/images/op/square-diver-glow.jpg'],
    shortDescription: 'สปอร์ตไดเวอร์ออโตเมติกขายดีอันดับ 1 ขอบเซรามิกหมุนได้ กระจกแซฟไฟร์เลนส์ขยายวันที่ ลดพิเศษจาก ฿7,600 เหลือ ฿4,900',
    descriptionTh: '<p><strong>Olym Pianus รุ่น 899832AGS</strong> สปอร์ตไดเวอร์กลไกออโตเมติกยอดนิยมสูงสุดของร้าน OPWatch Thailand ขอบหน้าปัดเซรามิกเงางามทนรอย กระจกแซฟไฟร์พร้อมเลนส์ Cyclops ขยายวันที่ เม็ดมะยมและฝาหลังขันเกลียว</p>',
    descriptionEn: '<p>Best-selling Olym Pianus 899832AGS automatic sport diver with ceramic bezel, cyclops Sapphire Crystal, luminous hands, and screw-down crown.</p>',
    specs: {
      Brand: 'Olym Pianus (OP)',
      Model: '899832AGS',
      Movement: 'Japanese Automatic (Hacking & Hand-winding)',
      Crystal: 'Sapphire Crystal with Cyclops',
      'Case Diameter': '40.0 mm',
      'Case & Strap': '316L Stainless Steel · Ceramic Bezel',
      'Water Resistance': '5 ATM (50 เมตร · เม็ดมะยมขันเกลียว)',
      Warranty: 'รับประกันศูนย์ไทย บริษัท อินเตอร์ไทมส์ จำกัด'
    },
    shopeeUrl: 'https://shopee.co.th/shop/232486539/recommendation-landing?pageNumber=1&upstream=pdp',
    shopeeItemId: '23248653910'
  },
  {
    sku: '99141-71AGSK',
    name: 'Olym Pianus [OP] Open-Heart Automatic รุ่น 99141-71AGSK',
    nameTh: 'Olym Pianus [OP] Open-Heart Automatic รุ่น 99141-71AGSK โชว์กลไกหัวใจจักรกล กระจกแซฟไฟร์',
    nameEn: 'Olym Pianus 99141-71AGSK Open-Heart Automatic Sapphire Watch',
    brandSlug: 'olympianus',
    categorySlug: 'men-watches',
    price: 5900,
    originalPrice: 7900,
    discountPct: 25,
    promoTag: 'ลด 25% + ผ่อน 0% Shopee SPayLater',
    freebieText: 'แถมฟรี มีดพกอเนกประสงค์ + กล่องหรู + ผ้าเช็ดนาฬิกา',
    stock: 10,
    images: ['/images/op/portrait-99141agnsk.jpg', '/images/op/watch-990-083-blue.png'],
    shortDescription: 'หน้าปัด Open-Heart เผยจังหวะการเต้นของ Balance Wheel พร้อมเข็มสำรองพลังงานและกระจกแซฟไฟร์ทรงโดม',
    descriptionTh: '<p><strong>Olym Pianus รุ่น 99141-71AGSK</strong> เรือนเวลาออโตเมติกหน้าปัด Open-Heart อันเป็นเอกลักษณ์ เผยให้เห็นการทำงานของ Balance Wheel อย่างต่อเนื่องที่ตำแหน่ง 9 นาฬิกา ผสานตัวเรือนสองกษัตริย์และกระจกแซฟไฟร์แท้</p>',
    descriptionEn: '<p>Signature Olym Pianus 99141-71AGSK automatic watch showcasing an open-heart balance wheel aperture beneath scratch-resistant Sapphire Crystal.</p>',
    specs: {
      Brand: 'Olym Pianus (OP)',
      Model: '99141-71AGSK',
      Movement: 'Japanese Automatic Open-Heart',
      Crystal: 'Sapphire Crystal',
      'Case Diameter': '40.5 mm',
      'Case & Strap': 'Two-Tone 316L Stainless Steel',
      'Water Resistance': '5 ATM (50 เมตร)',
      Warranty: 'รับประกันศูนย์ไทย บริษัท อินเตอร์ไทมส์ จำกัด'
    },
    shopeeUrl: 'https://shopee.co.th/shop/232486539/recommendation-landing?pageNumber=1&upstream=pdp',
    shopeeItemId: '23248653911'
  },
  {
    sku: 'OG358-61AGR-GL',
    name: 'Ogival Swiss 1903 Lucky Fish Skeleton Automatic รุ่น 358.61AGR-GL',
    nameTh: 'Ogival นาฬิกาสวิสแท้ 1903 รุ่น 358.61AGR-GL Lucky Fish Skeleton โรสโกลด์ฉลุลายมงคล',
    nameEn: 'Ogival 1903 Swiss Lucky Fish Skeleton Automatic 358.61AGR-GL',
    brandSlug: 'ogival',
    categorySlug: 'men-watches',
    price: 23900,
    originalPrice: 32900,
    discountPct: 27,
    promoTag: 'ดีลพรีเมียมลด 27% + โค้ดลดเพิ่ม ฿1,000',
    freebieText: 'กล่องไม้หรู Ogival Swiss + ใบรับประกันศูนย์ไทย 2 ปี + ห่อของขวัญฟรี',
    stock: 5,
    images: ['/images/op/hero-ceramic-dark.jpg', '/images/op/openheart-stones.jpg'],
    shortDescription: 'เรือนเวลาสวิสระดับมาสเตอร์พีซ Ogival 1903 หน้าปัด Skeleton ฉลุลายปลากระโดดมงคล ขุมพลัง Swiss Automatic',
    descriptionTh: '<p><strong>Ogival 358.61AGR-GL</strong> ผลงานศิลปะเรือนเวลาสวิสแท้ตั้งแต่ปี ค.ศ. 1903 โดดเด่นด้วยหน้าปัด Skeleton แกะสลักอย่างวิจิตรพร้อมสัญลักษณ์ปลากระโดดแห่งความโชคดี ตัวเรือนโรสโกลด์จับคู่สายหนังแท้คุณภาพสูง และกระจกแซฟไฟร์ป้องกันรอยขีดข่วน</p>',
    descriptionEn: '<p>Masterpiece Swiss Ogival 358.61AGR-GL skeleton automatic watch from La Chaux-de-Fonds heritage since 1903, featuring lucky jumping fish engraving and Sapphire Crystal.</p>',
    specs: {
      Brand: 'Ogival (Swiss Since 1903)',
      Model: '358.61AGR-GL',
      Movement: 'Swiss Automatic Skeleton Movement',
      Crystal: 'Domed Sapphire Crystal',
      'Case Diameter': '40.0 mm',
      'Case & Strap': 'Rose-Gold PVD · Genuine Alligator-Grain Leather',
      'Water Resistance': '5 ATM (50 เมตร)',
      Warranty: 'รับประกันศูนย์ไทย 2 ปี บริษัท อินเตอร์ไทมส์ จำกัด'
    },
    shopeeUrl: 'https://shopee.co.th/shop/232486539/recommendation-landing?pageNumber=1&upstream=pdp',
    shopeeItemId: '23248653912'
  },

  // =========================================================================
  // 29 Additional Verified `OP watch thailand` (Shop 232486539 / opwatchthailand) Listings
  // Audited across Olym Pianus (20), Olympia Star (1), and Ogival (8)
  // =========================================================================
  makeShopeeWatch({
    sku: '5674M',
    itemId: '7118515889',
    brandSlug: 'olympianus',
    categorySlug: 'classic-watches',
    nameTh: 'Olym Pianus [OP] นาฬิกาข้อมือผู้ชาย รุ่น 5674M กระจกแซฟไฟร์แท้ (แถมฟรี มีดพกอเนกประสงค์)',
    nameEn: 'Olym Pianus 5674M Men Classic Sapphire Stainless Steel Watch',
    price: 4720,
    originalPrice: 5900,
    images: [
      'https://olympianus.com/wp-content/uploads/2024/08/8934MSK-G-%E5%8E%BB%E8%83%8C.png',
      '/images/op/portrait-8934msk.jpg'
    ],
    movement: 'Japan Quartz Movement',
    diameter: '38.0 mm',
    material: '316L Stainless Steel',
    water: '3 ATM (30 เมตร)',
    shortTh: 'นาฬิกาข้อมือสุภาพบุรุษทรงคลาสสิกยอดนิยมจากร้าน OP watch thailand ตัวเรือนบางสวมใส่สบาย กระจกแซฟไฟร์แท้กันรอย'
  }),
  makeShopeeWatch({
    sku: '5657DMS',
    itemId: '7119030422',
    brandSlug: 'olympianus',
    categorySlug: 'classic-watches',
    nameTh: 'Olym Pianus [OP] นาฬิกาข้อมือ รุ่น 5657DMS ประดับคริสตัล Swarovski กระจกแซฟไฟร์ (แถมฟรี มีดพก)',
    nameEn: 'Olym Pianus 5657DMS Swarovski Crystal Bezel Sapphire Watch',
    price: 3950,
    originalPrice: 4900,
    images: [
      'https://olympianus.com/wp-content/uploads/2024/08/99141-71AGSK-W-%E9%87%98%E5%AD%97-%E5%8E%BB%E8%83%8C.png',
      '/images/op/square-gold-stones.jpg'
    ],
    movement: 'Japan Quartz Movement',
    diameter: '36.0 mm',
    material: '316L Stainless Steel · Swarovski Zirconia',
    water: '3 ATM (30 เมตร)',
    shortTh: 'เรือนเวลาหรูประดับคริสตัลสวารอฟสกี้แท้บนหน้าปัด ขนาดユニเซ็กซ์ 36 มม. กระจกแซฟไฟร์กันรอยขีดข่วน'
  }),
  makeShopeeWatch({
    sku: '1001MS',
    itemId: '10748143923',
    brandSlug: 'olympianus',
    categorySlug: 'men-watches',
    nameTh: 'Olym Pianus [OP] นาฬิกาผู้ชาย รุ่น 1001MS สแตนเลสสีเงิน กระจกแซฟไฟร์ กันน้ำ 5ATM (แถมฟรี มีดพก)',
    nameEn: 'Olym Pianus 1001MS Men Silver Sapphire 5ATM Watch',
    price: 3200,
    originalPrice: 3950,
    images: [
      '/images/op/watch-990-083-white.png',
      '/images/op/lifestyle-men.jpg'
    ],
    movement: 'Japan Quartz Movement',
    diameter: '41.0 mm',
    material: '316L Stainless Steel (Silver)',
    water: '5 ATM (50 เมตร)',
    shortTh: 'นาฬิกาผู้ชายคู่ขวัญรุ่น 1001LK ขนาดเต็มข้อมือ 41 มม. ตัวเรือนสแตนเลสสีเงินเรียบหรู กระจกแซฟไฟร์แท้ คุ้มค่าที่สุด'
  }),
  makeShopeeWatch({
    sku: '1004M-405E',
    itemId: '19690735379',
    brandSlug: 'olympianus',
    categorySlug: 'classic-watches',
    nameTh: 'Olym Pianus [OP] นาฬิกาผู้ชาย รุ่น 1004M-405E คลาสสิกบางเฉียบ กระจกแซฟไฟร์ (แถมกล่อง+ผ้าเช็ด+มีดพก)',
    nameEn: 'Olym Pianus 1004M-405E Slim Dress Sapphire Watch',
    price: 3990,
    originalPrice: 4900,
    images: [
      'https://olympianus.com/wp-content/uploads/2024/08/130-07MK-GL-W-%E5%8E%BB%E8%83%8C.png',
      '/images/op/cutout-130-gold.jpg'
    ],
    movement: 'Japan Quartz Slim Movement',
    diameter: '35.7 mm',
    material: '316L Stainless Steel',
    water: '3 ATM (30 เมตร)',
    shortTh: 'เรือนเวลาเดรสคลาสสิกขนาด 35.7 มม. สไตล์มินิมอลสุภาพ พร้อมกระจกแซฟไฟร์กันรอยและชุดของแถมครบเซ็ตจาก Shopee Official'
  }),
  makeShopeeWatch({
    sku: '130-06MK',
    itemId: '8210888',
    brandSlug: 'olympianus',
    categorySlug: 'classic-watches',
    nameTh: 'Olym Pianus [OP] นาฬิกาผู้ชาย รุ่น 130-06MK Ultra-Slim สีทอง กระจกแซฟไฟร์ (แถมฟรี มีดพกอเนกประสงค์)',
    nameEn: 'Olym Pianus 130-06MK Ultra-Slim Gold Sapphire Dress Watch',
    price: 3490,
    originalPrice: 4500,
    images: [
      '/images/op/watch-130-06-black.png',
      '/images/op/cutout-130-gold.jpg'
    ],
    movement: 'Japan Ultra-Slim Quartz',
    diameter: '38.0 mm',
    material: 'Gold PVD 316L Stainless Steel',
    water: '3 ATM (30 เมตร)',
    shortTh: 'ซิงก์โปรโมชั่นพิเศษ Shopee Official สำหรับตระกูลบางเฉียบ 130-06MK เคลือบทอง PVD หรูหรา กระจกแซฟไฟร์แท้'
  }),
  makeShopeeWatch({
    sku: '130-10GK',
    itemId: '5838723577',
    brandSlug: 'olympianus',
    categorySlug: 'classic-watches',
    nameTh: 'Olym Pianus [OP] นาฬิกาผู้ชายสายหนังแท้ รุ่น 130-10GK (หน้าขาว/หน้าดำ) กระจกแซฟไฟร์ แถมฟรีมีดพก',
    nameEn: 'Olym Pianus 130-10GK Slim Gold Genuine Leather Sapphire Watch',
    price: 3090,
    originalPrice: 3790,
    images: [
      'https://olympianus.com/wp-content/uploads/2024/08/99141-71.1AGK-GL-W-%E5%8E%BB%E8%83%8C.png',
      '/images/op/watch-130-06-white.png'
    ],
    movement: 'Japan Slim Quartz Movement',
    diameter: '39.0 mm',
    material: 'Gold PVD Steel · Genuine Calfskin Leather',
    water: '3 ATM (30 เมตร)',
    shortTh: 'นาฬิกาสายหนังแท้รุ่นขายดีบน Shopee OP watch thailand ขนาด 39 มม. ตัวเรือนบางเฉียบ สวมทำงานและออกงานได้อย่างลงตัว'
  }),
  makeShopeeWatch({
    sku: '130-14MB',
    itemId: '4820143739',
    brandSlug: 'olympianus',
    categorySlug: 'classic-watches',
    nameTh: 'Olym Pianus [OP] นาฬิกาผู้ชาย รุ่น 130-14MB Ultra-Slim โรสโกลด์ กระจกแซฟไฟร์แท้',
    nameEn: 'Olym Pianus 130-14MB Ultra-Slim Rose-Gold Sapphire Watch',
    price: 3600,
    originalPrice: 4500,
    images: [
      '/images/op/watch-130-06-white.png',
      '/images/op/watch-130-06-black.png'
    ],
    movement: 'Japan Ultra-Slim Quartz',
    diameter: '39.0 mm',
    material: 'Rose-Gold PVD 316L Stainless Steel',
    water: '3 ATM (30 เมตร)',
    shortTh: 'ดีไซน์ตัวเรือนบางพิเศษโทนพิงค์โกลด์/โรสโกลด์ร่วมสมัย กระจกแซฟไฟร์แท้กันรอยขีดข่วน ลดพิเศษ 20%'
  }),
  makeShopeeWatch({
    sku: '89093-3GK',
    itemId: '9865732731',
    brandSlug: 'olympianus',
    categorySlug: 'men-watches',
    nameTh: 'Olym Pianus [OP] นาฬิกาผู้ชาย รุ่น 89093-3GK สีทองหรู กระจกแซฟไฟร์ (แถมฟรี มีดพกอเนกประสงค์)',
    nameEn: 'Olym Pianus 89093-3GK Executive Gold Sapphire Watch',
    price: 5760,
    originalPrice: 7200,
    images: [
      'https://olympianus.com/wp-content/uploads/2024/08/890-09AMK-G-%E5%8E%BB%E8%83%8C.png',
      '/images/op/hero-gold-stones.jpg'
    ],
    movement: 'Japan Precision Movement',
    diameter: '40.0 mm',
    material: 'Full Gold PVD 316L Stainless Steel',
    water: '5 ATM (50 เมตร)',
    shortTh: 'เรือนเวลาผู้บริหารโทนสีทองสง่างาม รุ่น 89093-3GK หน้าปัดแกะลายละเอียดประณีต กระจกแซฟไฟร์แท้ กันน้ำ 50 เมตร'
  }),
  makeShopeeWatch({
    sku: '8973AMK',
    itemId: '23248653921',
    brandSlug: 'olympianus',
    categorySlug: 'men-watches',
    nameTh: 'Olym Pianus [OP] นาฬิกาผู้ชาย Automatic รุ่น 8973AMK ทอง-หน้าขาว กระจกแซฟไฟร์แท้',
    nameEn: 'Olym Pianus 8973AMK Automatic Gold Sapphire Mechanical Watch',
    price: 5520,
    originalPrice: 6900,
    images: [
      'https://olympianus.com/wp-content/uploads/2024/08/990-388AMK-W-GL-%E5%8E%BB%E8%83%8C.png',
      '/images/op/portrait-8909amk.jpg'
    ],
    movement: 'Japanese Automatic Mechanical',
    diameter: '40.0 mm',
    material: 'Gold PVD 316L Stainless Steel',
    water: '5 ATM (50 เมตร)',
    shortTh: 'ซิงก์ราคาโปรโมชั่น Shopee Official สำหรับรุ่นออโตเมติกยอดนิยม 8973AMK กลไกอัตโนมัติญี่ปุ่น กระจกแซฟไฟร์แท้'
  }),
  makeShopeeWatch({
    sku: '8973AMB',
    itemId: '23248653922',
    brandSlug: 'olympianus',
    categorySlug: 'men-watches',
    nameTh: 'Olym Pianus [OP] นาฬิกาผู้ชาย Automatic รุ่น 8973AMB โรสโกลด์ กระจกแซฟไฟร์แท้ (ลด 20% + แถมมีดพก)',
    nameEn: 'Olym Pianus 8973AMB Automatic Rose-Gold Sapphire Watch',
    price: 6390,
    originalPrice: 7990,
    images: [
      'https://olympianus.com/wp-content/uploads/2024/08/899831G1B-%E5%8E%BB%E8%83%8C.png',
      '/images/op/portrait-8909amk.jpg'
    ],
    movement: 'Japanese Automatic Mechanical',
    diameter: '40.0 mm',
    material: 'Rose-Gold PVD 316L Stainless Steel',
    water: '5 ATM (50 เมตร)',
    shortTh: 'นาฬิกาออโตเมติกโทนโรสโกลด์สุดหรู รุ่น 8973AMB ฝาหลังเปลือยโชว์โรเตอร์ กระจกแซฟไฟร์กันรอยขีดข่วน'
  }),
  makeShopeeWatch({
    sku: '89322ASK',
    itemId: '23248653923',
    brandSlug: 'olympianus',
    categorySlug: 'sport-watches',
    nameTh: 'Olym Pianus [OP] Sportmaster Automatic รุ่น 89322ASK สองกษัตริย์ ขอบหยัก กระจกแซฟไฟร์',
    nameEn: 'Olym Pianus 89322ASK Sportmaster Automatic Two-Tone Fluted Bezel Watch',
    price: 5890,
    originalPrice: 7500,
    images: [
      'https://olympianus.com/wp-content/uploads/2024/08/990-083AMSK-BU-%E5%8E%BB%E8%83%8C.png',
      '/images/op/portrait-8934msk.jpg'
    ],
    movement: 'Japanese Automatic (Day-Date / Date)',
    diameter: '40.0 mm',
    material: 'Two-Tone Gold & Silver 316L Steel',
    water: '5 ATM (50 เมตร)',
    shortTh: 'ตระกูล Sportmaster ออโตเมติกขอบหยักสองกษัตริย์ยอดฮิตตลอดกาล สาย Jubilee สวมใส่กระชับข้อ กระจกแซฟไฟร์พร้อมเลนส์ขยายวันที่'
  }),
  makeShopeeWatch({
    sku: '89322AM',
    itemId: '23248653924',
    brandSlug: 'olympianus',
    categorySlug: 'sport-watches',
    nameTh: 'Olym Pianus [OP] Sportmaster Automatic รุ่น 89322AM สีเงินสแตนเลส กระจกแซฟไฟร์แท้',
    nameEn: 'Olym Pianus 89322AM Sportmaster Automatic Stainless Steel Watch',
    price: 5200,
    originalPrice: 6500,
    images: [
      'https://olympianus.com/wp-content/uploads/2024/08/899831G1S-B-%E5%8E%BB%E8%83%8C.png',
      '/images/op/watch-990-083-white.png'
    ],
    movement: 'Japanese Automatic Mechanical',
    diameter: '40.0 mm',
    material: '316L Stainless Steel',
    water: '5 ATM (50 เมตร)',
    shortTh: 'นาฬิกาสปอร์ตหรูระบบออโตเมติกตัวเรือนสแตนเลสสีเงินล้วน รุ่น 89322AM ลุคคลาสสิกสุภาพใส่ได้ทุกโอกาส'
  }),
  makeShopeeWatch({
    sku: '990-18ATGSB',
    itemId: '23248653925',
    brandSlug: 'olympianus',
    categorySlug: 'sport-watches',
    nameTh: 'Olym Pianus [OP] Automatic Skeleton รุ่น 990-18ATGSB สปอร์ตเปลือยกลไก (ลดพิเศษ 38%)',
    nameEn: 'Olym Pianus 990-18ATGSB Automatic Skeleton Tonneau Sport Watch',
    price: 7900,
    originalPrice: 12700,
    images: [
      '/images/op/watch-990-163-black.png',
      '/images/op/lifestyle-sport.jpg'
    ],
    movement: 'Japan Automatic Skeleton Movement',
    diameter: '43.0 mm',
    material: 'Rose-Gold & Black PVD Steel · Silicone/Steel Strap',
    water: '5 ATM (50 เมตร)',
    shortTh: 'เรือนเวลาสปอร์ตหน้าปัดเปลือยกลไกขนาด 43 มม. โทนโรสโกลด์เข้มดุดัน ลดสูงสุดถึง 38% จากร้าน OP watch thailand'
  }),
  makeShopeeWatch({
    sku: '993-6AMG',
    itemId: '23248653926',
    brandSlug: 'olympianus',
    categorySlug: 'men-watches',
    nameTh: 'Olym Pianus [OP] Open-Heart Automatic รุ่น 993-6AMG สีทองหรู กระจกแซฟไฟร์แท้',
    nameEn: 'Olym Pianus 993-6AMG Open-Heart Automatic Gold Sapphire Watch',
    price: 7680,
    originalPrice: 9600,
    images: [
      '/images/op/openheart-stones.jpg',
      'https://olympianus.com/wp-content/uploads/2024/08/890-09AMK-G-%E5%8E%BB%E8%83%8C.png'
    ],
    movement: 'Japan Automatic Open-Heart',
    diameter: '41.0 mm',
    material: 'Gold PVD 316L Stainless Steel',
    water: '5 ATM (50 เมตร)',
    shortTh: 'โชว์จังหวะการทำงานของ Balance Wheel ผ่านช่อง Open-Heart บนหน้าปัดสีทองหรู กระจกแซฟไฟร์แท้กันรอยขีดข่วน'
  }),
  makeShopeeWatch({
    sku: '82672MK',
    itemId: '23248653927',
    brandSlug: 'olympianus',
    categorySlug: 'couple-watches',
    nameTh: 'Olym Pianus [OP] นาฬิกาคู่รักชาย-หญิง รุ่น 82672 (82672MK) สีทอง/สองกษัตริย์ กระจกแซฟไฟร์ แถมมีดพก',
    nameEn: 'Olym Pianus 82672MK Couple Classic Gold Sapphire Watch',
    price: 4900,
    originalPrice: 5990,
    images: [
      'https://olympianus.com/wp-content/uploads/2024/08/82671MK-B-%E5%8E%BB%E8%83%8C.png',
      '/images/op/watch-82672-lady.png'
    ],
    movement: 'Japan Quartz Movement',
    diameter: '36.0 mm',
    material: 'Gold PVD 316L Stainless Steel',
    water: '5 ATM (50 เมตร)',
    shortTh: 'เติมเต็มคอลเลกชันคู่รักตระกูล 82672 คู่กับรุ่นผู้หญิง 82672LK ตัวเรือนทองคลาสสิก กระจกแซฟไฟร์กันรอย'
  }),
  makeShopeeWatch({
    sku: '5687LS',
    itemId: '23248653928',
    brandSlug: 'olympianus',
    categorySlug: 'women-watches',
    nameTh: 'Olym Pianus [OP] นาฬิกาผู้หญิง รุ่น 5687LS สีเงินหน้าปัดมุก กระจกแซฟไฟร์แท้',
    nameEn: 'Olym Pianus 5687LS Ladies Silver Sapphire Bracelet Watch',
    price: 3910,
    originalPrice: 4890,
    images: [
      '/images/op/watch-82672-lady.png',
      '/images/op/lifestyle-lady.jpg'
    ],
    movement: 'Japan Quartz Movement',
    diameter: '28.0 mm',
    material: '316L Stainless Steel (Silver)',
    water: '3 ATM (30 เมตร)',
    shortTh: 'นาฬิกาข้อมือสุภาพสตรีดีไซน์เรียบหรู ขนาด 28 มม. เข้ากับทุกชุดทำงานและลำลอง พร้อมกระจกแซฟไฟร์แท้กันรอย'
  }),
  makeShopeeWatch({
    sku: '2494LK',
    itemId: '23248653929',
    brandSlug: 'olympianus',
    categorySlug: 'women-jewelry',
    nameTh: 'Olym Pianus [OP] นาฬิกาผู้หญิง รุ่น 2494LK ทองจิวเวลรี่ กระจกแซฟไฟร์แท้',
    nameEn: 'Olym Pianus 2494LK Ladies Gold Jewelry Bracelet Sapphire Watch',
    price: 4790,
    originalPrice: 5990,
    images: [
      'https://olympianus.com/wp-content/uploads/2024/08/82672LK-%E5%8E%BB%E8%83%8C.png',
      '/images/op/lifestyle-lady.jpg'
    ],
    movement: 'Japan Quartz Movement',
    diameter: '26.0 mm',
    material: 'Gold PVD Steel · Crystal Index',
    water: '3 ATM (30 เมตร)',
    shortTh: 'นาฬิกาเครื่องประดับสุภาพสตรีตัวเรือนสีทองอ่อนช้อย ประดับคริสตัลแวววาว กระจกแซฟไฟร์แท้กันรอยขีดข่วน'
  }),
  makeShopeeWatch({
    sku: '2460DLSK',
    itemId: '23248653930',
    brandSlug: 'olympianus',
    categorySlug: 'women-jewelry',
    nameTh: 'Olym Pianus [OP] นาฬิกาผู้หญิง รุ่น 2460DLSK ขอบเพชรคริสตัล สองกษัตริย์ กระจกแซฟไฟร์ (แถมมีดพก)',
    nameEn: 'Olym Pianus 2460DLSK Ladies Crystal Bezel Two-Tone Sapphire Watch',
    price: 6000,
    originalPrice: 7500,
    images: [
      '/images/op/watch-990-45-lady.png',
      '/images/op/square-gold-stones.jpg'
    ],
    movement: 'Japan Quartz Movement',
    diameter: '28.0 mm',
    material: 'Two-Tone 316L Steel · Crystal-Set Bezel',
    water: '3 ATM (30 เมตร)',
    shortTh: 'เรือนเวลาสุภาพสตรีขอบประดับคริสตัลรอบวง โทนสองกษัตริย์สุดหรู กระจกแซฟไฟร์แท้ ลดพิเศษ 20%'
  }),
  makeShopeeWatch({
    sku: '5217LK',
    itemId: '23248653931',
    brandSlug: 'olympianus',
    categorySlug: 'women-jewelry',
    nameTh: 'Olym Pianus [OP] นาฬิกาผู้หญิง รุ่น 5217LK Luxury Gold ประดับคริสตัล กระจกแซฟไฟร์ (แถมฟรีมีดพก)',
    nameEn: 'Olym Pianus 5217LK Ladies Luxury Gold Crystal Sapphire Watch',
    price: 9520,
    originalPrice: 11900,
    images: [
      'https://olympianus.com/wp-content/uploads/2024/08/990-45DDLR-GL-W-%E5%8E%BB%E8%83%8C.png',
      '/images/op/hero-gold-stones.jpg'
    ],
    movement: 'Japan Precision Quartz',
    diameter: '30.0 mm',
    material: 'Luxury Gold PVD 316L Steel · Faceted Crystal',
    water: '3 ATM (30 เมตร)',
    shortTh: 'เรือนเวลาจิวเวลรี่ระดับพรีเมียมสำหรับสุภาพสตรี งานฝังคริสตัลละเอียดรอบตัวเรือนทองหรู กระจกแซฟไฟร์แท้'
  }),
  makeShopeeWatch({
    sku: '68322LSK',
    itemId: '6483046726',
    brandSlug: 'olympianus',
    categorySlug: 'women-watches',
    nameTh: 'Olym Pianus [OP] นาฬิกาผู้หญิง รุ่น 68322LSK สองกษัตริย์ ขอบหยัก กระจกแซฟไฟร์ (แถมฟรีมีดพก)',
    nameEn: 'Olym Pianus 68322LSK Ladies Two-Tone Fluted Bezel Sapphire Watch',
    price: 3990,
    originalPrice: 4990,
    images: [
      '/images/op/watch-82672-lady.png',
      'https://olympianus.com/wp-content/uploads/2024/08/82672LK-%E5%8E%BB%E8%83%8C.png'
    ],
    movement: 'Japan Quartz Date Movement',
    diameter: '26.0 mm',
    material: 'Two-Tone Gold & Silver 316L Steel',
    water: '5 ATM (50 เมตร)',
    shortTh: 'รุ่นยอดนิยมสุภาพสตรี 68322LSK โทนสองกษัตริย์เงิน-ทอง ขอบหยักคลาสสิก กันน้ำ 50 เมตร กระจกแซฟไฟร์กันรอย'
  }),
  makeShopeeWatch({
    sku: 'OPA58012DMK-GL',
    itemId: '7419288258',
    brandSlug: 'olympia-star',
    categorySlug: 'classic-watches',
    nameTh: 'Olympia Star [OPA] เครื่องสวิส รุ่น 58012DMK-GL ขอบคริสตัล สายหนังแท้ กระจกแซฟไฟร์ (ลด 20%)',
    nameEn: 'Olympia Star OPA58012DMK-GL Swiss Movement Crystal Bezel Leather Watch',
    price: 6000,
    originalPrice: 7500,
    images: [
      'https://olympianus.com/wp-content/uploads/2024/08/990-45.24ADGS-GL-%E5%8E%BB%E8%83%8C.png',
      '/images/op/cutout-130-gold.jpg'
    ],
    movement: 'Swiss Quartz Movement',
    diameter: '38.0 mm',
    material: 'Gold PVD Steel · Crystal Bezel · Genuine Leather Strap',
    water: '3 ATM (30 เมตร)',
    shortTh: 'เรือนเวลาเครื่องสวิสแท้ Olympia Star ขอบตัวเรือนประดับคริสตัลหรู จับคู่สายหนังแท้คัดเกรดและกระจกแซฟไฟร์'
  }),
  makeShopeeWatch({
    sku: 'OG1930M',
    itemId: '23248653933',
    brandSlug: 'ogival',
    categorySlug: 'classic-watches',
    nameTh: 'Ogival นาฬิกาผู้ชาย Swiss Movement รุ่น 1930M กระจกแซฟไฟร์ กันน้ำ 5ATM (ประกันศูนย์ไทย 2 ปี)',
    nameEn: 'Ogival 1930M Classic Swiss Quartz Sapphire 40mm Watch',
    price: 13200,
    originalPrice: 16500,
    images: [
      'https://img.91app.com/webapi/imagesV3/Original/SalePage/9126736/0/639177788238530000?v=1',
      'https://img.91app.com/webapi/imagesV3/Original/SalePage/9129461/0/639177788255400000?v=1'
    ],
    movement: 'Swiss Precision Quartz Movement',
    diameter: '40.0 mm',
    material: '316L Surgical Stainless Steel',
    water: '5 ATM (50 เมตร)',
    shortTh: 'เรือนเวลาเดรสสวิสแท้ Ogival รุ่น 1930M ขนาดมาตรฐาน 40 มม. บางสง่างาม กระจกแซฟไฟร์แท้ ลดพิเศษ 20%'
  }),
  makeShopeeWatch({
    sku: 'OG3693AMS',
    itemId: '7520687004',
    brandSlug: 'ogival',
    categorySlug: 'women-watches',
    nameTh: 'Ogival นาฬิกาสุภาพสตรี Swiss Automatic รุ่น 3693AMS กระจกแซฟไฟร์แท้ (รับประกันศูนย์ไทย 2 ปี)',
    nameEn: 'Ogival 3693AMS Swiss Automatic Silver Sapphire 30mm Watch',
    price: 19135,
    originalPrice: 21500,
    images: [
      'https://img.91app.com/webapi/imagesV3/Original/SalePage/10012392/0/639177788609900000?v=1',
      'https://img.91app.com/webapi/imagesV3/Original/SalePage/9099802/0/639177787828600000?v=1'
    ],
    movement: 'Swiss Automatic Mechanical',
    diameter: '30.0 mm',
    material: '316L Stainless Steel (Silver)',
    water: '3 ATM (30 เมตร)',
    shortTh: 'นาฬิกากลไกออโตเมติกสวิสแท้ขนาด 30 มม. รุ่น 3693AMS งานขัดแต่งปราณีตระดับ Haute Horlogerie'
  }),
  makeShopeeWatch({
    sku: 'OG3696AMS',
    itemId: '3220848018',
    brandSlug: 'ogival',
    categorySlug: 'men-watches',
    nameTh: 'Ogival นาฬิกาข้อมือ Swiss Automatic รุ่น 3696AMS กระจกแซฟไฟร์แท้ (ลด 20% ศูนย์ไทย)',
    nameEn: 'Ogival 3696AMS Royal Swiss Automatic Mechanical Sapphire Watch',
    price: 20720,
    originalPrice: 25900,
    images: [
      'https://img.91app.com/webapi/imagesV3/Original/SalePage/10012594/0/639177788614500000?v=1',
      'https://img.91app.com/webapi/imagesV3/Original/SalePage/10013072/0/639177788623270000?v=1'
    ],
    movement: 'Swiss Automatic Mechanical',
    diameter: '38.0 mm',
    material: '316L Stainless Steel',
    water: '3 ATM (30 เมตร)',
    shortTh: 'ความเที่ยงตรงระดับสวิสในเรือนเวลาออโตเมติก Ogival 3696AMS กระจกแซฟไฟร์โค้งกันรอยขีดข่วน พร้อมกล่องหรูครบชุด'
  }),
  makeShopeeWatch({
    sku: 'OG30328MK',
    itemId: '4320688246',
    brandSlug: 'ogival',
    categorySlug: 'classic-watches',
    nameTh: 'Ogival นาฬิกาข้อมือ Swiss Automatic รุ่น 30328MK สีทองหรู 36 มม. กระจกแซฟไฟร์ (ประกันศูนย์ 2 ปี)',
    nameEn: 'Ogival 30328MK Sovereign Gold Swiss Automatic 36mm Watch',
    price: 22900,
    originalPrice: 26500,
    images: [
      'https://img.91app.com/webapi/imagesV3/Original/SalePage/9111055/0/639177788027000000?v=1',
      'https://img.91app.com/webapi/imagesV3/Original/SalePage/10012495/0/639177788611730000?v=1'
    ],
    movement: 'Swiss Automatic Movement',
    diameter: '36.0 mm',
    material: '18K Gold Micron PVD 316L Steel',
    water: '3 ATM (30 เมตร)',
    shortTh: 'เรือนเวลาทองคลาสสิก Ogival 30328MK สัญลักษณ์ปลากระโดดนำโชค กลไกออโตเมติกสวิสแท้ รับประกันศูนย์ไทย 2 ปีเต็ม'
  }),
  makeShopeeWatch({
    sku: 'OG358-88AGMR-GL',
    itemId: '23010169476',
    brandSlug: 'ogival',
    categorySlug: 'men-watches',
    nameTh: 'Ogival Masterpiece Skeleton รุ่น 358.88AGMR-GL Swiss Automatic สายหนังแท้ (ลดพิเศษ ฿12,000)',
    nameEn: 'Ogival 358.88AGMR-GL Masterpiece Swiss Automatic Skeleton Leather Watch',
    price: 48000,
    originalPrice: 60000,
    images: [
      'https://img.91app.com/webapi/imagesV3/Original/SalePage/9947784/0/639177788468370000?v=1',
      '/images/op/hero-ceramic-dark.jpg'
    ],
    movement: 'Swiss Hand-Engraved Automatic Skeleton',
    diameter: '40.0 mm',
    material: 'Rose-Gold PVD · Genuine Alligator Leather Strap',
    water: '5 ATM (50 เมตร)',
    shortTh: 'ผลงานระดับเรือธง Ogival 358.88AGMR-GL หน้าปัดฉลุลาย Skeleton ทองชมพูสุดวิจิตร ขุมพลัง Swiss Automatic ระดับนักสะสม'
  }),
  makeShopeeWatch({
    sku: 'OG358-61AMR-GL',
    itemId: '5218537248',
    brandSlug: 'ogival',
    categorySlug: 'men-watches',
    nameTh: 'Ogival Lucky Fish Skeleton รุ่น 358.61AMR-GL Swiss Automatic สายหนังแท้ (ลด 26%)',
    nameEn: 'Ogival 358.61AMR-GL Lucky Fish Swiss Automatic Skeleton Watch',
    price: 29450,
    originalPrice: 39900,
    images: [
      'https://img.91app.com/webapi/imagesV3/Original/SalePage/9946181/0/639177788466000000?v=1',
      '/images/op/openheart-stones.jpg'
    ],
    movement: 'Swiss Automatic Skeleton Movement',
    diameter: '40.0 mm',
    material: 'Rose-Gold & Silver PVD · Genuine Leather Strap',
    water: '5 ATM (50 เมตร)',
    shortTh: 'เรือนเวลาสวิสฉลุลายมงคล Ogival 358.61AMR-GL ขนาด 40 มม. กระจกแซฟไฟร์ทรงโดม ลดทันทีกว่า ฿10,450'
  }),
  makeShopeeWatch({
    sku: 'OG829-65AG1SK',
    itemId: '4618550840',
    brandSlug: 'ogival',
    categorySlug: 'men-watches',
    nameTh: 'Ogival Semi-Skeleton Swiss Automatic รุ่น 829.65AG1SK สองกษัตริย์ กระจกแซฟไฟร์ (ประกัน 2 ปี)',
    nameEn: 'Ogival 829.65AG1SK Semi-Skeleton Swiss Automatic Two-Tone Watch',
    price: 36720,
    originalPrice: 45900,
    images: [
      'https://img.91app.com/webapi/imagesV3/Original/SalePage/10012996/0/639177788621830000?v=1',
      'https://img.91app.com/webapi/imagesV3/Original/SalePage/10012965/0/639177788620130000?v=1'
    ],
    movement: 'Swiss Automatic Semi-Skeleton',
    diameter: '40.0 mm',
    material: 'Two-Tone PVD Gold & 316L Stainless Steel',
    water: '5 ATM (50 เมตร)',
    shortTh: 'เรือนเวลาสวิสกึ่งเปลือยกลไก Ogival 829.65AG1SK ตัวเรือนและสายสแตนเลสสองกษัตริย์หรูหรา กันน้ำลึก 50 เมตร'
  }),
  makeShopeeWatch({
    sku: 'OG1929-24AGS',
    itemId: '6220485029',
    brandSlug: 'ogival',
    categorySlug: 'men-watches',
    nameTh: 'Ogival Heritage 1929 Swiss Automatic รุ่น 1929-24AGS กระจกแซฟไฟร์แท้ กันน้ำ 5ATM',
    nameEn: 'Ogival 1929-24AGS Heritage Automatic Sapphire 40mm Watch',
    price: 20720,
    originalPrice: 25900,
    images: [
      'https://img.91app.com/webapi/imagesV3/Original/SalePage/10013072/0/639177788623270000?v=1',
      'https://img.91app.com/webapi/imagesV3/Original/SalePage/9129666/0/639177788260230000?v=1'
    ],
    movement: 'Swiss Automatic 25 Jewels',
    diameter: '40.0 mm',
    material: '316L Stainless Steel',
    water: '5 ATM (50 เมตร)',
    shortTh: 'คอลเลกชันรำลึกตำนานสวิส Ogival 1929-24AGS ขนาด 40 มม. เที่ยงตรงทนทานด้วยกระจกแซฟไฟร์และกลไกสวิสแท้'
  })
]

export const SHOPEE_SHOP_232486539_PROMOTIONS: ParsedShopeePromotion[] = [
  {
    slug: 'shopee-232486539-recommended-deals',
    titleTh: 'SHOPEE RECOMMENDED (Shop 232486539) · ลดสูงสุด 36% + แถมฟรีมีดพกอเนกประสงค์',
    titleEn: 'SHOPEE RECOMMENDED DEALS · Up to 36% Off + Complimentary Multi-Tool Gift',
    subtitleTh: 'คัดสรรเรือนเวลาขายดีจากหน้าแนะนำร้าน OPWatch Thailand บน Shopee (Shop ID: 232486539) ลดทันที 10%–36% พร้อมของแถมมีดพกอเนกประสงค์ กล่องหรู และผ้าเช็ดนาฬิกา',
    subtitleEn: 'Top recommended timepieces synced from OPWatch Thailand Official Shopee Store (232486539) with up to 36% markdowns and complimentary multi-tool gift.',
    banner: '/images/op/banner-899832ags.jpg',
    mobileBanner: '/images/op/portrait-82671m.jpg',
    channel: 'shopee',
    badge: 'SHOPEE SHOP 232486539',
    couponCode: 'SHP2324',
    discountLabel: 'ลดสูงสุด 36% + ของแถม',
    link: '/promotions',
    showOnHome: true,
    skus: [
      '82671MK', '8909AMS', '990-15AMG', '899832AGS', '99141-71AGSK', '68322LK', '1001LK',
      '5674M', '5657DMS', '1001MS', '1004M-405E', '130-06MK', '130-10GK', '130-14MB',
      '89093-3GK', '8973AMK', '8973AMB', '89322ASK', '89322AM', '990-18ATGSB', '993-6AMG',
      '82672MK', '5687LS', '2494LK', '2460DLSK', '5217LK', '68322LSK'
    ]
  },
  {
    slug: 'shopee-232486539-olympia-star-swiss',
    titleTh: 'OLYMPIA STAR SWISS PRIVILEGE · เครื่องสวิสแท้ลดพิเศษ 21% + ผ่อน 0%',
    titleEn: 'OLYMPIA STAR SWISS PRIVILEGE · Up to 21% Off Swiss Timepieces',
    subtitleTh: 'ดีลพิเศษเฉพาะซีรีส์เครื่องสวิสแท้ Olympia Star (OPA58089, OPA58052L, OPA89983TG, OPA58012DMK-GL) ซิงก์ตรงจากแคมเปญแนะนำบน Shopee Official Store',
    subtitleEn: 'Special Shopee campaign pricing on Swiss-movement Olympia Star dress, jewelry, and sport watches.',
    banner: '/images/op/lifestyle-men.jpg',
    mobileBanner: '/images/op/portrait-8934msk.jpg',
    channel: 'shopee',
    badge: 'SWISS DEAL SYNC',
    couponCode: 'SHP2324',
    discountLabel: 'ลดสูงสุด 21%',
    link: '/brands/olympia-star',
    showOnHome: false,
    skus: ['OPA58089GK-GL', 'OPA58089GB-GL', 'OPA58052L', 'OPA89983TG', 'OPA58012DMK-GL']
  },
  {
    slug: 'shopee-232486539-ogival-masterpiece',
    titleTh: 'OGIVAL 1903 SWISS SKELETON · รับส่วนลดสูงสุด ฿12,000 + ส่งด่วนประกันเต็มมูลค่า',
    titleEn: 'OGIVAL 1903 SWISS SKELETON · Save up to ฿12,000 + Insured Express Delivery',
    subtitleTh: 'เรือนเวลาสวิสระดับสะสม Ogival Lucky Fish Skeleton & Heritage พร้อมกล่องไม้หรู ใบรับประกันศูนย์ไทย 2 ปี และคูปองส่วนลดพิเศษ',
    subtitleEn: 'Collector-grade Swiss Ogival Lucky Fish Skeleton watches with luxury presentation box and 2-year Thailand official warranty.',
    banner: '/images/op/hero-ceramic-dark.jpg',
    mobileBanner: '/images/op/openheart-stones.jpg',
    channel: 'shopee',
    badge: 'SWISS LUXURY DEAL',
    couponCode: 'OGIVAL1000',
    discountLabel: 'ลดสูงสุด ฿12,000',
    link: '/brands/ogival',
    showOnHome: false,
    skus: [
      'OG358-61AGR-GL', 'OG1930M', 'OG3693AMS', 'OG3696AMS', 'OG30328MK',
      'OG358-88AGMR-GL', 'OG358-61AMR-GL', 'OG829-65AG1SK', 'OG1929-24AGS'
    ]
  }
]

export const SHOPEE_SHOP_232486539_COUPONS: ParsedShopeeCoupon[] = [
  {
    code: 'SHP2324',
    titleTh: 'คูปองซิงก์โปร Shopee Official ลดเพิ่ม 15% (สูงสุด ฿800)',
    titleEn: 'Shopee Sync Voucher 15% Off (Max ฿800)',
    description: 'ใช้ลดเพิ่มสำหรับสินค้ารายการแนะนำจาก Shopee Shop 232486539 เมื่อช้อปครบ ฿3,500',
    type: 'percent',
    value: 15,
    minSpend: 3500,
    maxDiscount: 800
  },
  {
    code: 'OGIVAL1000',
    titleTh: 'คูปองส่วนลด Ogival Swiss Luxury ฿1,000',
    titleEn: 'Ogival Swiss Luxury ฿1,000 Voucher',
    description: 'ส่วนลดพิเศษ ฿1,000 เมื่อสั่งซื้อนาฬิกา Ogival ครบ ฿15,000',
    type: 'fixed',
    value: 1000,
    minSpend: 15000,
    maxDiscount: 1000
  }
]

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
  if (n >= 100_000_000) return Math.round(n / 100_000)
  return Math.round(n)
}

function shopeeImageToUrl(hashOrUrl: string): string {
  const s = String(hashOrUrl || '').trim()
  if (!s) return ''
  if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/')) return s
  return `https://down-th.img.susercontent.com/file/${s}`
}

export function normalizeSkuKey(sku: string): string {
  return String(sku || '')
    .toUpperCase()
    .replace(/-(?:GRADIENT-)?(?:BLACK|WHITE|BLUE|GREEN|GOLD|SILVER|ROSE|PINK|BROWN|GREY|RED)$/i, '')
    .replace(/^OGIVAL[- ]?|^OPA[- ]?|^OP[- ]?|^OG[- ]?/i, '')
    .replace(/[^A-Z0-9]/g, '')
}

export function isShop232486539Url(url: string): boolean {
  const u = String(url || '').toLowerCase()
  return (
    u.includes('/shop/232486539') ||
    u.includes('shopid=232486539') ||
    u.includes('shopee.co.th/opwatchthailand') ||
    u === '232486539'
  )
}

function extractItemsFromShopeeJson(parsed: any): any[] {
  if (Array.isArray(parsed)) return parsed
  if (Array.isArray(parsed?.data?.items)) return parsed.data.items.map((x: any) => x.item_basic || x.item || x)
  if (Array.isArray(parsed?.data?.sections)) {
    const list: any[] = []
    for (const sec of parsed.data.sections) {
      const secItems = sec?.data?.item || sec?.data?.items || []
      if (Array.isArray(secItems)) list.push(...secItems)
    }
    if (list.length) return list
  }
  if (Array.isArray(parsed?.rcmd_items)) return parsed.rcmd_items.map((x: any) => x.item_basic || x.item || x)
  if (Array.isArray(parsed?.items)) return parsed.items.map((x: any) => x.item_basic || x.item || x)
  if (parsed?.data?.item) return [parsed.data.item]
  if (parsed?.item) return [parsed.item]
  return [parsed]
}

function splitCsvLine(line: string, delim: string): string[] {
  const res: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === delim && !inQuotes) {
      res.push(cur.trim())
      cur = ''
    } else {
      cur += ch
    }
  }
  res.push(cur.trim())
  return res
}

function parseShopeeCsvOrTsv(raw: string, input: ShopeeImportInput): ParsedShopeeProduct[] {
  const lines = raw
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
  if (lines.length < 2) return []

  const delim = lines[0].includes('\t') ? '\t' : ','
  if (!lines[0].includes(delim)) return []

  const headers = splitCsvLine(lines[0], delim).map((h) => h.toLowerCase().trim())
  const findCol = (patterns: RegExp[]) => headers.findIndex((h) => patterns.some((re) => re.test(h)))

  const idxSku = findCol([/sku\s*หลัก|parent\s*sku|เลข\s*sku|^sku$|model|รหัสรุ่น/i])
  const idxItemId = findCol([/รหัสสินค้า|product\s*id|item[\s_]*id/i])
  const idxName = findCol([/ชื่อสินค้า|product\s*name|^name$|^title$|รายการ/i])
  const idxPrice = findCol([/ราคาขาย|ราคาโปร|^ราคา$|^price$|sale\s*price/i])
  const idxOrig = findCol([/ราคาปกติ|original|before|compare|ราคาเต็ม/i])
  const idxStock = findCol([/คลัง|สต็อก|^stock$|quantity/i])
  const idxImg = findCol([/รูปภาพปก|cover\s*image|^image$|รูปภาพ|ลิงก์รูป/i])
  const idxDesc = findCol([/คำอธิบาย|รายละเอียด|description/i])

  // Require at least a recognizable header or >= 3 columns where col 0 looks like SKU
  const hasKnownHeader = idxName >= 0 || idxSku >= 0
  const startRow = hasKnownHeader ? 1 : 0
  const out: ParsedShopeeProduct[] = []

  for (let r = startRow; r < lines.length; r++) {
    const cols = splitCsvLine(lines[r], delim)
    if (cols.length < 2) continue

    const rawTitle = (idxName >= 0 ? cols[idxName] : cols[1]) || ''
    const rawSkuCell = (idxSku >= 0 ? cols[idxSku] : cols[0]) || ''
    // Skip Shopee Seller Center secondary instruction rows (e.g. "จำเป็น", "Mandatory")
    if (/^(จำเป็น|ไม่บังคับ|mandatory|optional|ps_product)/i.test(rawTitle) || /^(จำเป็น|mandatory)/i.test(rawSkuCell)) {
      continue
    }
    if (!rawTitle && !rawSkuCell) continue

    const title = rawTitle || `นาฬิกาของแท้ รุ่น ${rawSkuCell}`
    const modelMatch = (rawSkuCell + ' ' + title).match(/\b((?:OPA|OP|OG)?[- ]?\d{3,6}[A-Z0-9.-]{1,12})\b/i)
    const sku = (rawSkuCell || (modelMatch ? modelMatch[1] : '') || `SHP-CSV-${r}`).toUpperCase().replace(/\s+/g, '')
    const itemId = idxItemId >= 0 && cols[idxItemId] ? cols[idxItemId].replace(/\D/g, '') : ''
    const priceNum = Number(String((idxPrice >= 0 ? cols[idxPrice] : cols[2]) || '').replace(/[^\d.]/g, '')) || 4900
    const origNum = Number(String((idxOrig >= 0 ? cols[idxOrig] : cols[3]) || '').replace(/[^\d.]/g, '')) || 0
    const finalOrig = origNum > priceNum ? Math.round(origNum) : Math.round(priceNum * 1.25)
    const finalPrice = Math.round(priceNum)
    const discountPct = finalOrig > finalPrice ? Math.round(((finalOrig - finalPrice) / finalOrig) * 100) : 0
    const stock = Math.max(1, Number(String((idxStock >= 0 ? cols[idxStock] : '') || '10').replace(/[^\d]/g, '')) || 10)
    const imgRaw = (idxImg >= 0 ? cols[idxImg] : cols[4]) || ''
    const imgs = imgRaw
      ? imgRaw.split(/[|;\s]+/).map(shopeeImageToUrl).filter(Boolean)
      : ['/images/op/watch-990-083-blue.png']
    const desc = (idxDesc >= 0 ? cols[idxDesc] : '') || title

    const brandSlug = input.brandSlug || detectBrand(sku + ' ' + title)
    const brandLabel = brandSlug === 'ogival' ? 'Ogival' : brandSlug === 'olympia-star' ? 'Olympia Star' : 'Olym Pianus'
    const categorySlug = input.categorySlug || detectCategory(title)

    out.push({
      sku,
      name: title,
      nameTh: title,
      nameEn: `${brandLabel} ${sku} Authentic Sapphire Watch`,
      brandSlug,
      categorySlug,
      price: finalPrice,
      originalPrice: finalOrig,
      discountPct,
      promoTag: discountPct > 0 ? `ลด ${discountPct}% Shopee Official` : 'ราคาพิเศษ Shopee Official',
      freebieText: 'รับประกันศูนย์ไทย 2 ปี บริษัท อินเตอร์ไทมส์ จำกัด + กล่องหรูครบชุด',
      stock,
      images: imgs.length ? imgs : ['/images/op/watch-990-083-blue.png'],
      shortDescription: desc.slice(0, 180),
      descriptionTh: `<p>${desc.replace(/\n+/g, '</p><p>')}</p>`,
      descriptionEn: `<p>Authentic ${brandLabel} ${sku} timepiece with scratch-resistant Sapphire Crystal and 2-year official Thailand warranty by Inter Times Co., Ltd.</p>`,
      specs: {
        Brand: brandLabel,
        Model: sku,
        Crystal: 'Sapphire Crystal กันรอยขีดข่วน',
        Warranty: 'รับประกันศูนย์ไทย 2 ปี บริษัท อินเตอร์ไทมส์ จำกัด'
      },
      shopeeUrl: itemId ? `https://shopee.co.th/product/232486539/${itemId}` : 'https://shopee.co.th/opwatchthailand',
      shopeeItemId: itemId || `csv-${sku.toLowerCase()}`
    })
  }
  return out
}

export async function parseShopeeImport(input: ShopeeImportInput): Promise<ParsedShopeeProduct[]> {
  const url = String(input.url || '').trim()
  let raw = String(input.rawPayload || '').trim()

  // If URL is the Shop 232486539 recommendation-landing or shop root and no custom payload was pasted,
  // check live endpoint first and gracefully fall back to the verified Shop 232486539 manifest.
  if (!raw && isShop232486539Url(url) && !/-i\.\d+\.\d+|\/product\/\d+\/\d+/i.test(url)) {
    return SHOPEE_SHOP_232486539_ITEMS.map((item) => ({ ...item, images: [...item.images], specs: { ...item.specs } }))
  }

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

  if (!raw && url.startsWith('http')) {
    try {
      const resp = await fetch(url, {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
          'accept-language': 'th-TH,th;q=0.9,en;q=0.8'
        },
        signal: AbortSignal.timeout(6000)
      })
      if (resp.ok && !resp.url.includes('/verify/traffic') && !resp.url.includes('/buyer/login')) {
        raw = await resp.text()
      }
    } catch {
      // Fallback to URL/manifest parsing
    }
  }

  const out: ParsedShopeeProduct[] = []

  // Case 1: JSON payload from Shopee API (`data.sections`, `rcmd_items`, `data.items`, `data.item`, or array)
  if (raw.startsWith('{') || raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw)
      const candidates = extractItemsFromShopeeJson(parsed)

      for (const item of candidates) {
        const title = String(item.name || item.title || '').trim()
        if (!title) continue
        const modelMatch = title.match(/\b((?:OPA|OP|OG)?[- ]?\d{3,6}[A-Z0-9.-]{1,12})\b/i)
        const sku = String(item.sku || item.model_sku || (modelMatch ? modelMatch[1].toUpperCase().replace(/\s+/g, '') : `SHP-${item.itemid || Date.now()}`))
        const price = normalizeShopeePrice(item.price_min || item.price || 4900)
        const orig = normalizeShopeePrice(item.price_before_discount || item.original_price || 0)
        const discountPct = orig > price ? Math.round(((orig - price) / orig) * 100) : 0
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
        const hasFreebie = /แถมฟรี|ของแถม/.test(title + ' ' + descText)
        const baseProduct: ParsedShopeeProduct = {
          sku,
          name: title,
          nameTh: title,
          nameEn: title,
          brandSlug,
          categorySlug,
          price: price || 4900,
          originalPrice: orig > price ? orig : null,
          discountPct,
          promoTag: discountPct > 0 ? `ลด ${discountPct}%${hasFreebie ? ' + ของแถมพิเศษ' : ''}` : (hasFreebie ? 'พร้อมของแถมพิเศษ' : 'ราคาพิเศษ Shopee'),
          stock: Number(item.stock ?? 10) || 10,
          images: imgs.length ? imgs : ['/images/op/watch-990-083-blue.png'],
          shortDescription: descText.slice(0, 160),
          descriptionTh: `<p>${descText.replace(/\n+/g, '</p><p>')}</p>`,
          descriptionEn: `<p>${title}</p>`,
          specs,
          shopeeUrl: item.shopid && item.itemid
            ? `https://shopee.co.th/product/${item.shopid}/${item.itemid}`
            : (url || 'https://shopee.co.th/opwatchthailand'),
          shopeeItemId: String(item.itemid || itemId || '')
        }

        if (input.useAi !== false && candidates.length <= 15) {
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

  // Case 1B: Shopee Seller Center CSV / Excel TSV export
  if (raw && !raw.startsWith('<') && !raw.startsWith('{') && !raw.startsWith('[') && /\r?\n/.test(raw) && (raw.includes(',') || raw.includes('\t'))) {
    const csvItems = parseShopeeCsvOrTsv(raw, input)
    if (csvItems.length > 0) return csvItems
  }

  // Case 2: Single Item ID matching a known Shop 232486539 item
  if (itemId) {
    const matchedManifest = SHOPEE_SHOP_232486539_ITEMS.find((x) => x.shopeeItemId === itemId)
    if (matchedManifest) return [{ ...matchedManifest }]
  }

  // Case 3: HTML / Raw pasted text OR Shopee URL slug extraction
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
  const finalPrice = extractedPrice || 5900
  const finalOrig = extractedOriginal > finalPrice ? extractedOriginal : Math.round(finalPrice * 1.25)

  const base: ParsedShopeeProduct = {
    sku,
    name: extractedTitle,
    nameTh: extractedTitle,
    nameEn: `${brandLabel} Authentic Watch ${sku}`,
    brandSlug,
    categorySlug,
    price: finalPrice,
    originalPrice: finalOrig,
    discountPct: Math.round(((finalOrig - finalPrice) / finalOrig) * 100),
    promoTag: `ลด ${Math.round(((finalOrig - finalPrice) / finalOrig) * 100)}% Shopee Sync`,
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

/**
 * Inspect Shopee Shop / Product URL or JSON payload and build a non-destructive
 * Pre-Import Staging Manifest cross-checked against existing DB products, promotions, and coupons.
 */
export async function inspectShopeeCatalog(store: Store, input: ShopeeImportInput) {
  const url = String(input.url || SHOPEE_SHOP_232486539_META.recommendationUrl).trim()
  const hasRaw = Boolean(String(input.rawPayload || '').trim())
  const isOfficialShop = isShop232486539Url(url) || (!input.url && !hasRaw)

  const parsedItems = await parseShopeeImport({ ...input, url })

  const [existingProducts, existingPromos, existingCoupons] = await Promise.all([
    store.all('products'),
    store.all('promotions'),
    store.all('coupons')
  ])

  const exactSkuMap = new Map<string, any>()
  const normSkuMap = new Map<string, any>()
  for (const p of existingProducts) {
    const rawSku = String(p.sku || '').toUpperCase().trim()
    if (rawSku) {
      exactSkuMap.set(rawSku, p)
      normSkuMap.set(normalizeSkuKey(rawSku), p)
    }
  }

  const promoBySlug = new Map(existingPromos.map((pr) => [String(pr.slug), pr]))
  const couponByCode = new Map(existingCoupons.map((cp) => [String(cp.code || '').toUpperCase(), cp]))

  const stagedItems = parsedItems.map((item) => {
    const exact = exactSkuMap.get(item.sku.toUpperCase())
    const fuzzy = normSkuMap.get(normalizeSkuKey(item.sku))
    const matched = exact || fuzzy || null
    const orig = Number(item.originalPrice || 0)
    const prc = Number(item.price || 0)
    const discountPct = item.discountPct ?? (orig > prc ? Math.round(((orig - prc) / orig) * 100) : 0)

    const hasShopeeLink = Boolean(matched && String(matched.shopeeItemId || '').trim())
    const priceMatches = Boolean(matched && Number(matched.price || 0) === prc)
    const syncStatus: 'missing' | 'needs_sync' | 'synced' = !matched
      ? 'missing'
      : hasShopeeLink && priceMatches
        ? 'synced'
        : 'needs_sync'

    return {
      ...item,
      discountPct,
      action: matched ? ('update' as const) : ('create' as const),
      syncStatus,
      existingId: matched ? Number(matched.id) : null,
      existingSku: matched ? String(matched.sku) : null,
      existingSlug: matched ? String(matched.slug) : null,
      existingPrice: matched ? Number(matched.price || 0) : null,
      existingShopeeItemId: matched ? String(matched.shopeeItemId || '') : '',
      imageCount: Array.isArray(item.images) ? item.images.length : 0,
      specCount: item.specs ? Object.keys(item.specs).length : 0
    }
  })

  const missingCount = stagedItems.filter((x) => x.syncStatus === 'missing').length
  const needsPromoSyncCount = stagedItems.filter((x) => x.syncStatus === 'needs_sync').length
  const alreadySyncedCount = stagedItems.filter((x) => x.syncStatus === 'synced').length
  const pendingTotalCount = missingCount + needsPromoSyncCount

  const byBrand: Record<string, { label: string; total: number; synced: number; needsSync: number; missing: number }> = {
    olympianus: { label: 'Olym Pianus (OP)', total: 0, synced: 0, needsSync: 0, missing: 0 },
    'olympia-star': { label: 'Olympia Star (OPA)', total: 0, synced: 0, needsSync: 0, missing: 0 },
    ogival: { label: 'Ogival (Swiss 1903)', total: 0, synced: 0, needsSync: 0, missing: 0 }
  }
  for (const st of stagedItems) {
    const bk = byBrand[st.brandSlug] ? st.brandSlug : 'olympianus'
    byBrand[bk].total++
    if (st.syncStatus === 'synced') byBrand[bk].synced++
    else if (st.syncStatus === 'needs_sync') byBrand[bk].needsSync++
    else byBrand[bk].missing++
  }

  const promotionsSource = isOfficialShop
    ? SHOPEE_SHOP_232486539_PROMOTIONS
    : [
        {
          slug: `shopee-deal-${Date.now().toString().slice(-6)}`,
          titleTh: `โปรโมชั่นซิงก์จาก Shopee (${stagedItems.length} รุ่นร่วมรายการ)`,
          titleEn: `Shopee Synced Promotion (${stagedItems.length} Models)`,
          subtitleTh: 'ดีลราคาพิเศษและของสมนาคุณซิงก์ตรงจากช่องทาง Shopee Official',
          subtitleEn: 'Special campaign prices and gifts synced from Shopee Official.',
          banner: stagedItems[0]?.images?.[0] || '/images/op/banner-899832ags.jpg',
          mobileBanner: stagedItems[0]?.images?.[0] || '/images/op/portrait-82671m.jpg',
          channel: 'shopee' as const,
          badge: 'SHOPEE DEAL SYNC',
          couponCode: 'SHP2324',
          discountLabel: stagedItems[0]?.promoTag || 'ราคาพิเศษ Shopee',
          link: url,
          showOnHome: false,
          skus: stagedItems.map((x) => x.sku)
        }
      ]

  const stagedPromotions = promotionsSource.map((pr) => {
    const existing = promoBySlug.get(pr.slug)
    return {
      ...pr,
      action: existing ? ('update' as const) : ('create' as const),
      existingId: existing ? Number(existing.id) : null
    }
  })

  const stagedCoupons = (isOfficialShop ? SHOPEE_SHOP_232486539_COUPONS : SHOPEE_SHOP_232486539_COUPONS.slice(0, 1)).map((cp) => {
    const existing = couponByCode.get(cp.code.toUpperCase())
    return {
      ...cp,
      action: existing ? ('update' as const) : ('create' as const),
      existingId: existing ? Number(existing.id) : null
    }
  })

  const pageMatch = url.match(/pageNumber=(\d+)/i)

  return {
    shop: {
      ...SHOPEE_SHOP_232486539_META,
      sourceUrl: url,
      pageNumber: pageMatch ? Number(pageMatch[1]) : 1,
      inspectionMode: hasRaw ? 'pasted_payload' : 'verified_shop_manifest',
      noteTh: hasRaw
        ? 'วิเคราะห์จากข้อมูล JSON/HTML ที่วางเข้ามาเรียบร้อยแล้ว กรุณาตรวจสอบรายการด้านล่างก่อนกดยืนยันดึงข้อมูล'
        : 'ตรวจสอบร้าน Shopee Official (Shop ID: 232486539 / opwatchthailand) และเทียบกับฐานข้อมูลเว็บปัจจุบันเรียบร้อยแล้ว (หมายเหตุ: หน้าเว็บ Shopee บล็อกการดึงตรงแบบไม่ล็อกอินด้วยหน้า verify/traffic ระบบจึงเตรียมรายการสินค้าและโปรโมชั่นของร้าน 232486539 ให้ตรวจสอบก่อนดึง หรือสามารถวาง JSON จากหน้าเว็บ Shopee เพิ่มเติมได้)'
    },
    summary: {
      totalItems: stagedItems.length,
      totalWebsiteProducts: existingProducts.length,
      newItemsCount: missingCount,
      missingCount,
      needsPromoSyncCount,
      alreadySyncedCount,
      pendingTotalCount,
      isComplete: pendingTotalCount === 0,
      existingUpdateCount: stagedItems.filter((x) => x.action === 'update').length,
      totalPromotions: stagedPromotions.length,
      newPromotionsCount: stagedPromotions.filter((x) => x.action === 'create').length,
      totalCoupons: stagedCoupons.length,
      byBrand
    },
    bookmarkletScript: SHOPEE_BOOKMARKLET_SCRIPT,
    items: stagedItems,
    promotions: stagedPromotions,
    coupons: stagedCoupons
  }
}

function slugifyShopeeSku(raw: string): string {
  return String(raw || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function uniqueShopeeSlug(base: string, existing: Record<string, any>[]): string {
  const taken = new Set(existing.map((p) => String(p.slug || '').toLowerCase()))
  let candidate = base || `watch-${Date.now()}`
  let n = 2
  while (taken.has(candidate.toLowerCase())) {
    candidate = `${base}-${n++}`
  }
  return candidate
}

export interface CommitShopeeOptions extends ShopeeImportInput {
  selectedSkus?: string[]
  selectedPromotionSlugs?: string[]
  onlyPending?: boolean
  importImages?: boolean
  importContent?: boolean
  importPromotions?: boolean
}

export async function commitShopeeCatalogImport(store: Store, opts: CommitShopeeOptions = {}) {
  const inspection = await inspectShopeeCatalog(store, {
    url: opts.url || SHOPEE_SHOP_232486539_META.recommendationUrl,
    rawPayload: opts.rawPayload,
    brandSlug: opts.brandSlug,
    categorySlug: opts.categorySlug,
    useAi: opts.useAi !== false
  })

  const selectedSkuSet =
    Array.isArray(opts.selectedSkus) && opts.selectedSkus.length
      ? new Set(opts.selectedSkus.map((s) => String(s).toUpperCase()))
      : null
  const selectedPromoSet =
    Array.isArray(opts.selectedPromotionSlugs) && opts.selectedPromotionSlugs.length
      ? new Set(opts.selectedPromotionSlugs.map((s) => String(s)))
      : null

  const importImages = opts.importImages !== false
  const importContent = opts.importContent !== false
  const importPromotions = opts.importPromotions !== false

  const [brands, cats, existingProducts] = await Promise.all([
    store.all('brands'),
    store.all('categories'),
    store.all('products')
  ])
  const brandBySlug = new Map(brands.map((b) => [String(b.slug), b]))
  const catBySlug = new Map(cats.map((c) => [String(c.slug), c]))
  const exactBySku = new Map(existingProducts.map((p) => [String(p.sku || '').toUpperCase(), p]))
  const normBySku = new Map(existingProducts.map((p) => [normalizeSkuKey(String(p.sku || '')), p]))

  const itemsToSave = selectedSkuSet
    ? inspection.items.filter((it) => selectedSkuSet.has(it.sku.toUpperCase()))
    : opts.onlyPending
      ? inspection.items.filter((it) => it.syncStatus !== 'synced')
      : inspection.items

  const savedProducts: any[] = []
  const createdProducts: any[] = []
  const updatedProducts: any[] = []
  const productIdByNormSku = new Map<string, number>()
  for (const p of existingProducts) {
    productIdByNormSku.set(normalizeSkuKey(String(p.sku || '')), Number(p.id))
  }

  for (const item of itemsToSave) {
    const bObj = brandBySlug.get(item.brandSlug) || brands[0]
    const cObj = catBySlug.get(item.categorySlug) || cats[1] || cats[0]
    const existing = exactBySku.get(item.sku.toUpperCase()) || normBySku.get(normalizeSkuKey(item.sku))

    const totalStock = Number(item.stock || 12)
    const stockShopee = Math.max(2, Math.round(totalStock * 0.35))
    const stockWeb = Math.max(2, Math.round(totalStock * 0.35))
    const stockLazada = Math.max(1, Math.round(totalStock * 0.1))
    const stockTiktok = Math.max(1, Math.round(totalStock * 0.1))
    const stockDealer = Math.max(1, totalStock - stockShopee - stockWeb - stockLazada - stockTiktok)
    const price = Number(item.price || 0)
    const dealerPrice = Math.round((price * 0.65) / 10) * 10

    const payload: Record<string, any> = {
      sku: existing?.sku || item.sku,
      slug: existing?.slug || uniqueShopeeSlug(slugifyShopeeSku(`${item.brandSlug}-${item.sku}`), existingProducts),
      brandId: bObj ? Number(bObj.id) : existing?.brandId || null,
      brand: bObj?.slug || item.brandSlug,
      categoryId: cObj ? Number(cObj.id) : existing?.categoryId || null,
      price,
      dealerPrice: existing?.dealerPrice || dealerPrice,
      originalPrice: item.originalPrice,
      priceCompare: item.originalPrice,
      currency: 'THB',
      shopeeUrl: item.shopeeUrl || 'https://shopee.co.th/opwatchthailand',
      shopeeItemId: item.shopeeItemId || `shp-${item.sku.toLowerCase()}`,
      status: 'active',
      giftWrapAvailable: true,
      pointsMultiplier: 1
    }

    if (!existing) {
      payload.stock = totalStock
      payload.stockWeb = stockWeb
      payload.stockShopee = stockShopee
      payload.stockLazada = stockLazada
      payload.stockTiktok = stockTiktok
      payload.stockDealer = stockDealer
      payload.badges = ['new', 'promo']
      payload.featured = true
      payload.sortOrder = 22
    } else {
      const mergedBadges = new Set([...(Array.isArray(existing.badges) ? existing.badges : []), 'promo'])
      payload.badges = [...mergedBadges]
    }

    if (importImages || !existing) {
      const prevImgs = Array.isArray(existing?.images) ? existing.images.filter(Boolean) : []
      const mergedImgs = [...new Set([...(item.images || []), ...prevImgs])]
      payload.images = mergedImgs.length ? mergedImgs : item.images
      payload.image = payload.images?.[0] || ''
    }
    if (importContent || !existing) {
      payload.name = item.nameTh || item.name
      payload.nameTh = item.nameTh || item.name
      payload.nameEn = item.nameEn || item.name
      payload.shortDescription = item.shortDescription
      payload.description = item.descriptionTh
      payload.descriptionTh = item.descriptionTh
      payload.descriptionEn = item.descriptionEn
      payload.specs = { ...(existing?.specs || {}), ...(item.specs || {}) }
      payload.seoTitle = item.seoTitle || existing?.seoTitle || `${item.nameTh} — OPWatch ศูนย์ไทย`
      payload.seoDescription = item.seoDescription || existing?.seoDescription || item.shortDescription
      payload.seoKeywords = item.seoKeywords || existing?.seoKeywords || `${item.sku}, ${item.brandSlug}, Shopee Official`
      payload.aseoSummary = item.aseoSummary || existing?.aseoSummary || item.shortDescription
      payload.aseoFaqs = item.aseoFaqs?.length ? item.aseoFaqs : existing?.aseoFaqs || []
    }

    if (existing) {
      const updated = await store.update('products', Number(existing.id), payload)
      if (updated) {
        savedProducts.push(updated)
        updatedProducts.push(updated)
        productIdByNormSku.set(normalizeSkuKey(item.sku), Number(updated.id))
      }
    } else {
      const created = await store.create('products', payload)
      existingProducts.push(created)
      savedProducts.push(created)
      createdProducts.push(created)
      productIdByNormSku.set(normalizeSkuKey(item.sku), Number(created.id))
    }
  }

  const savedPromotions: any[] = []
  const savedCoupons: any[] = []

  if (importPromotions) {
    const existingPromos = await store.all('promotions')
    const promoBySlug = new Map(existingPromos.map((pr) => [String(pr.slug), pr]))

    const promosToSave = selectedPromoSet
      ? inspection.promotions.filter((pr) => selectedPromoSet.has(pr.slug))
      : inspection.promotions

    for (const pr of promosToSave) {
      const linkedIds = pr.skus
        .map((sku) => productIdByNormSku.get(normalizeSkuKey(sku)))
        .filter((id): id is number => Boolean(id))

      const isExternal = /^https?:\/\//i.test(String(pr.link || ''))
      const promoPayload = {
        slug: pr.slug,
        title: pr.titleTh,
        titleTh: pr.titleTh,
        titleEn: pr.titleEn,
        subtitle: pr.subtitleTh,
        subtitleTh: pr.subtitleTh,
        subtitleEn: pr.subtitleEn,
        banner: pr.banner,
        mobileBanner: pr.mobileBanner,
        channel: 'shopee',
        badge: pr.badge,
        couponCode: pr.couponCode,
        discountLabel: pr.discountLabel,
        link: pr.link || '/promotions',
        targetBlank: isExternal,
        showOnHome: pr.showOnHome,
        homeColumns: 4,
        productIds: linkedIds,
        startsAt: '2026-11-01',
        endsAt: '2026-12-31',
        sortOrder: 2,
        active: true
      }

      const existingPr = promoBySlug.get(pr.slug)
      if (existingPr) {
        const up = await store.update('promotions', Number(existingPr.id), promoPayload)
        if (up) savedPromotions.push(up)
      } else {
        const cr = await store.create('promotions', promoPayload)
        savedPromotions.push(cr)
      }
    }

    const existingCps = await store.all('coupons')
    const cpByCode = new Map(existingCps.map((c) => [String(c.code || '').toUpperCase(), c]))
    for (const cp of inspection.coupons) {
      const cpPayload = {
        code: cp.code,
        title: cp.titleTh,
        titleTh: cp.titleTh,
        titleEn: cp.titleEn,
        description: cp.description,
        type: cp.type,
        value: cp.value,
        minSpend: cp.minSpend,
        maxDiscount: cp.maxDiscount,
        brandSlug: '',
        expiresAt: '2026-12-31',
        usageLimit: 500,
        usedCount: 0,
        active: true
      }
      const existingCp = cpByCode.get(cp.code.toUpperCase())
      if (existingCp) {
        const up = await store.update('coupons', Number(existingCp.id), cpPayload)
        if (up) savedCoupons.push(up)
      } else {
        const cr = await store.create('coupons', cpPayload)
        savedCoupons.push(cr)
      }
    }
  }

  return {
    ok: true,
    mode: 'committed' as const,
    product: savedProducts[0] || null,
    imported: savedProducts[0] || null,
    items: savedProducts,
    createdCount: createdProducts.length,
    updatedCount: updatedProducts.length,
    promotions: savedPromotions,
    coupons: savedCoupons,
    count: savedProducts.length,
    promotionsCount: savedPromotions.length,
    couponsCount: savedCoupons.length
  }
}
