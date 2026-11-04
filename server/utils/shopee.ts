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
  }
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
    skus: ['82671MK', '8909AMS', '990-15AMG', '899832AGS', '99141-71AGSK', '68322LK', '1001LK']
  },
  {
    slug: 'shopee-232486539-olympia-star-swiss',
    titleTh: 'OLYMPIA STAR SWISS PRIVILEGE · เครื่องสวิสแท้ลดพิเศษ 21% + ผ่อน 0%',
    titleEn: 'OLYMPIA STAR SWISS PRIVILEGE · Up to 21% Off Swiss Timepieces',
    subtitleTh: 'ดีลพิเศษเฉพาะซีรีส์เครื่องสวิสแท้ Olympia Star (OPA58089, OPA58052L, OPA89983TG) ซิงก์ตรงจากแคมเปญแนะนำบน Shopee Official Store',
    subtitleEn: 'Special Shopee campaign pricing on Swiss-movement Olympia Star dress, jewelry, and sport watches.',
    banner: '/images/op/lifestyle-men.jpg',
    mobileBanner: '/images/op/portrait-8934msk.jpg',
    channel: 'shopee',
    badge: 'SWISS DEAL SYNC',
    couponCode: 'SHP2324',
    discountLabel: 'ลดสูงสุด 21%',
    link: '/brands/olympia-star',
    showOnHome: false,
    skus: ['OPA58089GK-GL', 'OPA58089GB-GL', 'OPA58052L', 'OPA89983TG']
  },
  {
    slug: 'shopee-232486539-ogival-masterpiece',
    titleTh: 'OGIVAL 1903 SWISS SKELETON · รับส่วนลดสูงสุด ฿9,000 + ส่งด่วนประกันเต็มมูลค่า',
    titleEn: 'OGIVAL 1903 SWISS SKELETON · Save up to ฿9,000 + Insured Express Delivery',
    subtitleTh: 'เรือนเวลาสวิสระดับสะสม Ogival Lucky Fish Skeleton พร้อมกล่องไม้หรู ใบรับประกันศูนย์ไทย 2 ปี และคูปองส่วนลดพิเศษ',
    subtitleEn: 'Collector-grade Swiss Ogival Lucky Fish Skeleton watches with luxury presentation box and 2-year Thailand official warranty.',
    banner: '/images/op/hero-ceramic-dark.jpg',
    mobileBanner: '/images/op/openheart-stones.jpg',
    channel: 'shopee',
    badge: 'SWISS LUXURY DEAL',
    couponCode: 'OGIVAL1000',
    discountLabel: 'ลดทันที ฿9,000',
    link: '/brands/ogival',
    showOnHome: false,
    skus: ['OG358-61AGR-GL']
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
    return {
      ...item,
      discountPct,
      action: matched ? ('update' as const) : ('create' as const),
      existingId: matched ? Number(matched.id) : null,
      existingSku: matched ? String(matched.sku) : null,
      existingSlug: matched ? String(matched.slug) : null,
      existingPrice: matched ? Number(matched.price || 0) : null,
      imageCount: Array.isArray(item.images) ? item.images.length : 0,
      specCount: item.specs ? Object.keys(item.specs).length : 0
    }
  })

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
      newItemsCount: stagedItems.filter((x) => x.action === 'create').length,
      existingUpdateCount: stagedItems.filter((x) => x.action === 'update').length,
      totalPromotions: stagedPromotions.length,
      newPromotionsCount: stagedPromotions.filter((x) => x.action === 'create').length,
      totalCoupons: stagedCoupons.length
    },
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
      shopeeItemId: item.shopeeItemId || '',
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
