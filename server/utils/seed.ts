import type { Store } from '../db/types'
import { olympianusOfficialProducts } from './catalog-olympianus'
import { ogivalOfficialProducts } from './catalog-ogival'
import { loadConfig, saveConfig } from './config'

export interface SeedBrand {
  slug: string
  name: string
  nameEn: string
  nameTh: string
  country: string
  countryEn: string
  movement: string
  movementEn: string
  positioning: string
  tagline: string
  taglineEn: string
  story: string
  storyEn: string
  accentColor: string
  logo: string
  heroImage: string
  sortOrder: number
  active: boolean
}

export interface SeedCategory {
  slug: string
  name: string
  nameEn: string
  nameTh: string
  description: string
  descriptionEn: string
  descriptionTh: string
  image: string
  icon: string
  bannerImage: string
  sortOrder: number
  parentSlug?: string | null
}

export interface SeedProduct {
  sku: string
  name: string
  nameEn: string
  nameTh: string
  slug: string
  categorySlug: string
  brandSlug: string
  price: number
  originalPrice: number | null
  currency: string
  images: string[]
  shortDescription: string
  shortDescriptionEn?: string
  description: string
  descriptionEn: string
  descriptionTh: string
  specs: Record<string, string>
  stock: number
  status: 'active' | 'draft'
  badges: string[]
  featured: boolean
  sortOrder: number
}

export interface SeedCampaign {
  slug: string
  title: string
  titleEn: string
  titleTh: string
  subtitle: string
  subtitleEn: string
  subtitleTh: string
  banner: string
  link: string
  brandSlug: string | null
  type: 'hero' | 'brand-day' | 'category' | 'strip' | 'event'
  sortOrder: number
  active: boolean
}

/** Legacy 19 sample SKUs from initial scaffolding to purge from installed stores */
export const LEGACY_SAMPLE_SKUS = new Set([
  'OW-M1001', 'OW-M1002', 'OW-L2001', 'OW-L2002', 'OW-S3001', 'OW-C4001', 'OW-K1001',
  'OL-M2001', 'OL-M2002', 'OL-L3001', 'OL-L3002', 'OL-S4001', 'OL-C5001',
  'OG-M6001', 'OG-M6002', 'OG-L7001', 'OG-L7002', 'OG-S8001', 'OG-K9001'
])

export const defaultBrands = (): SeedBrand[] => [
  {
    slug: 'olympianus',
    name: 'Olympianus',
    nameEn: 'Olympianus (Olym Pianus)',
    nameTh: 'Olympianus (โอลิมปิอานัส)',
    country: 'สวิตเซอร์แลนด์ / ญี่ปุ่น',
    countryEn: 'Swiss Heritage · Japanese Movement',
    movement: 'เครื่องญี่ปุ่นแท้ · กระจกแซฟไฟร์',
    movementEn: 'Japanese Automatic & Quartz · Sapphire Crystal',
    positioning: 'mid',
    tagline: 'Faster, Higher, Stronger — ความสง่างามเหนือกาลเวลา',
    taglineEn: 'Faster, Higher, Stronger — Elegance Beyond Time',
    story:
      'Olympianus (Olym Pianus) ก่อตั้งขึ้นจากมรดกศาสตร์เรือนเวลาสวิสตั้งแต่ปี ค.ศ. 1953 ภายใต้จิตวิญญาณโอลิมปิก "Faster, Higher, Stronger" ผสานงานออกแบบอันสง่างามเข้ากับกลไกออโตเมติกและควอตซ์ต้นตำรับจากญี่ปุ่น พร้อมกระจกหน้าปัดแซฟไฟร์แท้ป้องกันรอยขีดข่วนในทุกเรือน จัดจำหน่ายอย่างเป็นทางการในประเทศไทยโดย บริษัท อินเตอร์ ไทม์ส จำกัด (Opwatch Thailand)',
    storyEn:
      'Born from Swiss watchmaking tradition in 1953 and inspired by the Olympic motto "Faster, Higher, Stronger", Olympianus (Olym Pianus) unites timeless design, scratch-resistant sapphire crystal mirrors, and dependable Japanese automatic and quartz movements. Officially distributed exclusively in Thailand by Inter Times Co., Ltd.',
    accentColor: '#1d2088',
    logo: 'https://olympianus.com/wp-content/uploads/2024/06/899832AGS-Black-01-%E5%8E%BB%E8%83%8C.png',
    heroImage: '/images/op/banner-899832ags.jpg',
    sortOrder: 1,
    active: true
  },
  {
    slug: 'ogival',
    name: 'Ogival',
    nameEn: 'Ogival (Swiss 1903)',
    nameTh: 'Ogival (โอจิวัล สวิตเซอร์แลนด์ 1903)',
    country: 'สวิตเซอร์แลนด์',
    countryEn: 'La Chaux-de-Fonds, Switzerland',
    movement: 'เครื่องสวิสแท้ · อัญมณีและจักรกลชั้นสูง',
    movementEn: 'Swiss Automatic & Haute Joaillerie Quartz',
    positioning: 'premium',
    tagline: 'ตำนานปลากระโดดแห่งความโชคดี จากสวิตเซอร์แลนด์ตั้งแต่ปี 1903',
    taglineEn: 'Swiss Lucky Leaping Fish Haute Horlogerie Since 1903',
    story:
      'Ogival (โอจิวัล) ก่อตั้งขึ้นในปี ค.ศ. 1903 ณ เมือง La Chaux-de-Fonds ประเทศสวิตเซอร์แลนด์ โดย René Brandt ภายใต้สัญลักษณ์ "ปลากระโดดแห่งความโชคดีและความรักอันเปี่ยมล้น" โดดเด่นด้วยเรือนเวลาสวิสออโตเมติก คอลเลกชันดอกคามิลเลีย (Camellia) ดาวตก (Meteor) และนาฬิกาประดับเพชรและอัญมณีธรรมชาติ จัดจำหน่ายและดูแลหลังการขายในประเทศไทยโดย บริษัท อินเตอร์ ไทม์ส จำกัด',
    storyEn:
      'Founded in La Chaux-de-Fonds, Switzerland in 1903 by René Brandt under the emblem of the lucky leaping fish, Ogival is celebrated for Swiss mechanical watchmaking, Camellia and Meteor haute-joaillerie diamond creations, and sapphire-crystal prestige timepieces. Exclusively warranted in Thailand by Inter Times Co., Ltd.',
    accentColor: '#c5a46d',
    logo: 'https://img.91app.com/webapi/imagesV3/Cropped/SalePage/10012495/0/639177788611730000?v=1',
    heroImage: '/images/op/hero-ceramic-dark.jpg',
    sortOrder: 2,
    active: true
  },
  {
    slug: 'opwatch',
    name: 'Opwatch',
    nameEn: 'Opwatch Thailand Boutique',
    nameTh: 'Opwatch บูติกประเทศไทย',
    country: 'ประเทศไทย (เครื่องญี่ปุ่น)',
    countryEn: 'Thailand Official Edition · Japanese Movement',
    movement: 'เครื่องญี่ปุ่น · กระจกแซฟไฟร์แท้',
    movementEn: 'Japanese Movement · Sapphire Crystal',
    positioning: 'entry',
    tagline: 'คัดสรรเรือนเวลาคุณภาพสำหรับลูกค้าในประเทศไทยโดยเฉพาะ',
    taglineEn: 'Curated Sapphire Timepieces Exclusively for Thailand',
    story:
      'Opwatch Thailand คัดสรรเรือนเวลาคุณภาพเยี่ยมที่ใช้กลไกญี่ปุ่นแท้และกระจกแซฟไฟร์กันรอยขีดข่วน พร้อมการรับประกันศูนย์ไทยและบริการดูแลหลังการขายครบวงจรสำหรับลูกค้าในประเทศไทยเท่านั้น โดย บริษัท อินเตอร์ ไทม์ส จำกัด',
    storyEn:
      'Opwatch Thailand curates sapphire-crystal Japanese-movement timepieces backed by full domestic horological servicing and official warranty exclusively within Thailand by Inter Times Co., Ltd.',
    accentColor: '#1d2088',
    logo: '/images/op/watch-990-083-blue.png',
    heroImage: '/images/op/hero-gold-stones.jpg',
    sortOrder: 3,
    active: true
  }
]

export const defaultCategories = (): SeedCategory[] => [
  {
    slug: 'watches-jewelry',
    name: 'นาฬิกาและจิวเวลรี่ทั้งหมด',
    nameEn: 'All Watches & Jewelry',
    nameTh: 'นาฬิกาและจิวเวลรี่ทั้งหมด',
    description: 'รวมเรือนเวลาของแท้ Olympianus และ Ogival ครบทุกรุ่นในประเทศไทย',
    descriptionEn: 'Complete official Thailand collection of Olympianus and Ogival timepieces.',
    descriptionTh: 'รวมเรือนเวลาของแท้ Olympianus และ Ogival ครบทุกรุ่นในประเทศไทย',
    image: '/images/op/watch-990-083-blue.png',
    icon: '/images/op/watch-990-083-blue.png',
    bannerImage: '/images/op/hero-gold-stones.jpg',
    sortOrder: 1,
    parentSlug: null
  },
  {
    slug: 'men-watches',
    name: 'นาฬิกาผู้ชาย',
    nameEn: 'Men Watch',
    nameTh: 'นาฬิกาผู้ชาย',
    description: 'นาฬิกาสุภาพบุรุษกลไกออโตเมติกและควอตซ์ กระจกแซฟไฟร์แท้',
    descriptionEn: "Men's automatic and precision quartz sapphire watches.",
    descriptionTh: 'นาฬิกาสุภาพบุรุษกลไกออโตเมติกและควอตซ์ กระจกแซฟไฟร์แท้',
    image: 'https://olympianus.com/wp-content/uploads/2024/08/890-09AMK-G-%E5%8E%BB%E8%83%8C.png',
    icon: '/images/op/watch-990-083-blue.png',
    bannerImage: '/images/op/lifestyle-men.jpg',
    sortOrder: 2,
    parentSlug: 'watches-jewelry'
  },
  {
    slug: 'women-watches',
    name: 'นาฬิกาผู้หญิง',
    nameEn: 'Ladies Watch',
    nameTh: 'นาฬิกาผู้หญิง',
    description: 'นาฬิกาสุภาพสตรีดีไซน์สง่างาม ประดับคริสตัลและเพชรแท้',
    descriptionEn: 'Graceful ladies watches crafted with sapphire crystal, mother-of-pearl, and diamonds.',
    descriptionTh: 'นาฬิกาสุภาพสตรีดีไซน์สง่างาม ประดับคริสตัลและเพชรแท้',
    image: 'https://olympianus.com/wp-content/uploads/2024/08/990-45DDLR-GL-W-%E5%8E%BB%E8%83%8C.png',
    icon: '/images/op/watch-990-45-lady.png',
    bannerImage: '/images/op/lifestyle-lady.jpg',
    sortOrder: 3,
    parentSlug: 'watches-jewelry'
  },
  {
    slug: 'sport-watches',
    name: 'นาฬิกาสปอร์ตและไดเวอร์',
    nameEn: 'Sport & Diver Watch',
    nameTh: 'นาฬิกาสปอร์ตและไดเวอร์',
    description: 'นาฬิกาสปอร์ตสมรรถนะสูงและซับมารีเนอร์ไดเวอร์ พรายน้ำสว่างพิเศษ',
    descriptionEn: 'High-performance sport, chronograph, and luminous diver watches.',
    descriptionTh: 'นาฬิกาสปอร์ตสมรรถนะสูงและซับมารีเนอร์ไดเวอร์ พรายน้ำสว่างพิเศษ',
    image: 'https://olympianus.com/wp-content/uploads/2024/06/899832AGS-Black-01-%E5%8E%BB%E8%83%8C.png',
    icon: '/images/op/watch-899831-green.png',
    bannerImage: '/images/op/banner-899832ags.jpg',
    sortOrder: 4,
    parentSlug: 'watches-jewelry'
  },
  {
    slug: 'classic-watches',
    name: 'นาฬิกาคลาสสิกและเดรส',
    nameEn: 'Classic & Dress Watch',
    nameTh: 'นาฬิกาคลาสสิกและเดรส',
    description: 'เรือนเวลาเดรสคลาสสิกบางเฉียบและโอเพ่นฮาร์ทเหนือกาลเวลา',
    descriptionEn: 'Ultra-slim heritage, Roman-index, and classic leather dress watches.',
    descriptionTh: 'เรือนเวลาเดรสคลาสสิกบางเฉียบและโอเพ่นฮาร์ทเหนือกาลเวลา',
    image: 'https://olympianus.com/wp-content/uploads/2024/08/130-07MK-GL-W-%E5%8E%BB%E8%83%8C.png',
    icon: '/images/op/watch-990-083-white.png',
    bannerImage: '/images/op/hero-gold-stones.jpg',
    sortOrder: 5,
    parentSlug: 'watches-jewelry'
  },
  {
    slug: 'couple-watches',
    name: 'นาฬิกาคู่รัก (Couple)',
    nameEn: 'Couple Watches',
    nameTh: 'นาฬิกาคู่รัก (Couple)',
    description: 'เรือนเวลาคู่รักชาย-หญิงจาก Ogival และ Olympianus สำหรับโอกาสพิเศษ',
    descriptionEn: 'Matching His & Hers luxury pair timepieces from Ogival and Olympianus.',
    descriptionTh: 'เรือนเวลาคู่รักชาย-หญิงจาก Ogival และ Olympianus สำหรับโอกาสพิเศษ',
    image: 'https://img.91app.com/webapi/imagesV3/Cropped/SalePage/9124168/0/639177788218500000?v=1',
    icon: '/images/op/watch-130-06-white.png',
    bannerImage: '/images/op/hero-gold-stones.jpg',
    sortOrder: 6,
    parentSlug: 'watches-jewelry'
  },
  {
    slug: 'men-jewelry',
    name: 'นาฬิกาจิวเวลรี่ผู้ชาย',
    nameEn: "Men's Jewelry Watch",
    nameTh: 'นาฬิกาจิวเวลรี่ผู้ชาย',
    description: 'เรือนเวลาสุภาพบุรุษประดับเพชรแท้และวัสดุทังสเตนล้ำค่า',
    descriptionEn: 'Diamond-set and tungsten luxury watches for gentlemen.',
    descriptionTh: 'เรือนเวลาสุภาพบุรุษประดับเพชรแท้และวัสดุทังสเตนล้ำค่า',
    image: 'https://img.91app.com/webapi/imagesV3/Cropped/SalePage/9127543/0/639177788248800000?v=1',
    icon: '/images/op/watch-990-163-black.png',
    bannerImage: '/images/op/hero-ceramic-dark.jpg',
    sortOrder: 7,
    parentSlug: 'watches-jewelry'
  },
  {
    slug: 'women-jewelry',
    name: 'นาฬิกาจิวเวลรี่ผู้หญิง',
    nameEn: "Ladies' Jewelry Watch",
    nameTh: 'นาฬิกาจิวเวลรี่ผู้หญิง',
    description: 'เรือนเวลาสุภาพสตรีประดับอัญมณีธรรมชาติ คามิลเลีย ดาวตก และไฮเทคเซรามิก',
    descriptionEn: 'Camellia, Meteor, natural gemstone, and ceramic jewellery watches for ladies.',
    descriptionTh: 'เรือนเวลาสุภาพสตรีประดับอัญมณีธรรมชาติ คามิลเลีย ดาวตก และไฮเทคเซรามิก',
    image: 'https://img.91app.com/webapi/imagesV3/Cropped/SalePage/10519029/0/639177788641600000?v=1',
    icon: '/images/op/watch-82672-lady.png',
    bannerImage: '/images/op/hero-ceramic-dark.jpg',
    sortOrder: 8,
    parentSlug: 'watches-jewelry'
  }
]

const opwatchThailandSignatureProducts = (): SeedProduct[] => [
  {
    sku: 'OPW-TH-01',
    name: 'Opwatch Thailand Edition โอเพ่นฮาร์ท บลู แซฟไฟร์ 42',
    nameEn: 'Opwatch Thailand Edition Open-Heart Blue Sapphire 42',
    nameTh: 'Opwatch Thailand Edition โอเพ่นฮาร์ท บลู แซฟไฟร์ 42',
    slug: 'opwatch-thailand-open-heart-blue-42',
    categorySlug: 'men-watches',
    brandSlug: 'opwatch',
    price: 7900,
    originalPrice: 9900,
    currency: 'THB',
    images: ['/images/op/watch-990-083-blue.png', '/images/op/lifestyle-men.jpg'],
    shortDescription: 'รุ่นพิเศษประจำบูติกประเทศไทย · ออโตเมติกญี่ปุ่น Open-Heart · กระจกแซฟไฟร์แท้',
    shortDescriptionEn: 'Thailand Boutique Edition · Japanese Open-Heart Automatic · Sapphire Crystal',
    description: 'เรือนเวลาคัดสรรพิเศษสำหรับบูติก Opwatch ประเทศไทย ขับเคลื่อนด้วยกลไกออโตเมติกญี่ปุ่นโชว์จังหวะจักรกล Open-Heart บนหน้าปัดสีน้ำเงินเข้ม กระจกแซฟไฟร์แท้ป้องกันรอยขีดข่วน พร้อมรับประกันศูนย์ไทย 2 ปีเต็ม',
    descriptionEn: 'Curated Thailand Boutique Edition powered by a Japanese open-heart automatic movement beneath scratch-resistant sapphire crystal, backed by a 2-year official Thailand warranty.',
    descriptionTh: 'เรือนเวลาคัดสรรพิเศษสำหรับบูติก Opwatch ประเทศไทย ขับเคลื่อนด้วยกลไกออโตเมติกญี่ปุ่นโชว์จังหวะจักรกล Open-Heart บนหน้าปัดสีน้ำเงินเข้ม กระจกแซฟไฟร์แท้ป้องกันรอยขีดข่วน พร้อมรับประกันศูนย์ไทย 2 ปีเต็ม',
    specs: {
      Brand: 'Opwatch Thailand Boutique',
      Reference: 'OPW-TH-01',
      Movement: 'Japanese Automatic Open-Heart',
      Crystal: 'Sapphire Crystal',
      'Case Diameter': '42 mm',
      'Strap Material': 'Two-Tone 316L Stainless Steel',
      'Water Resistance': '5 ATM (50m)',
      Warranty: '2 Years Official Thailand Warranty (Inter Times Co., Ltd.)'
    },
    stock: 15,
    status: 'active',
    badges: ['sale'],
    featured: false,
    sortOrder: 601
  },
  {
    sku: 'OPW-TH-02',
    name: 'Opwatch Thailand Edition เอมเมอรัลด์ สปอร์ต แซฟไฟร์ 40',
    nameEn: 'Opwatch Thailand Edition Emerald Sport Sapphire 40',
    nameTh: 'Opwatch Thailand Edition เอมเมอรัลด์ สปอร์ต แซฟไฟร์ 40',
    slug: 'opwatch-thailand-emerald-sport-40',
    categorySlug: 'sport-watches',
    brandSlug: 'opwatch',
    price: 5900,
    originalPrice: 7500,
    currency: 'THB',
    images: ['/images/op/watch-899831-green.png', '/images/op/square-diver-glow.jpg'],
    shortDescription: 'สปอร์ตหน้าปัดเขียวมรกต · พรายน้ำสว่างคมชัด · กระจกแซฟไฟร์แท้',
    shortDescriptionEn: 'Emerald Dial Sport · Luminous Hands & Markers · Sapphire Crystal',
    description: 'นาฬิกาสปอร์ตขนาด 40 มม. หน้าปัดสีเขียวมรกตซันเบิร์สต์ มาพร้อมพรายน้ำสว่างชัดเจนในที่มืด ตัวเรือนสแตนเลสสตีล 316L และกระจกแซฟไฟร์แท้กันรอย จัดส่งเฉพาะภายในประเทศไทยพร้อมใบรับประกันศูนย์ไทย',
    descriptionEn: '40mm emerald-dial sport watch with luminous markers, 316L stainless steel bracelet, and scratch-resistant sapphire crystal. Available exclusively in Thailand.',
    descriptionTh: 'นาฬิกาสปอร์ตขนาด 40 มม. หน้าปัดสีเขียวมรกตซันเบิร์สต์ มาพร้อมพรายน้ำสว่างชัดเจนในที่มืด ตัวเรือนสแตนเลสสตีล 316L และกระจกแซฟไฟร์แท้กันรอย จัดส่งเฉพาะภายในประเทศไทยพร้อมใบรับประกันศูนย์ไทย',
    specs: {
      Brand: 'Opwatch Thailand Boutique',
      Reference: 'OPW-TH-02',
      Movement: 'Japanese Precision Quartz',
      Crystal: 'Sapphire Crystal',
      'Case Diameter': '40 mm',
      'Strap Material': '316L Stainless Steel',
      'Water Resistance': '5 ATM (50m)',
      Warranty: '2 Years Official Thailand Warranty (Inter Times Co., Ltd.)'
    },
    stock: 18,
    status: 'active',
    badges: ['sale'],
    featured: false,
    sortOrder: 602
  },
  {
    sku: 'OPW-TH-03',
    name: 'Opwatch Thailand Edition คลาสสิก สลิม โกลด์ 39',
    nameEn: 'Opwatch Thailand Edition Classic Slim Gold 39',
    nameTh: 'Opwatch Thailand Edition คลาสสิก สลิม โกลด์ 39',
    slug: 'opwatch-thailand-classic-slim-gold-39',
    categorySlug: 'classic-watches',
    brandSlug: 'opwatch',
    price: 4900,
    originalPrice: 6200,
    currency: 'THB',
    images: ['/images/op/watch-130-06-white.png', '/images/op/hero-gold-stones.jpg'],
    shortDescription: 'เดรสคลาสสิกตัวเรือนบาง 7 มม. · สายหนังวัวแท้ · กระจกแซฟไฟร์',
    shortDescriptionEn: '7mm Ultra-Slim Dress Case · Genuine Calfskin Strap · Sapphire Crystal',
    description: 'เรือนเวลาเดรสคลาสสิกตัวเรือนบางเฉียบเพียง 7 มม. สวมใส่แนบข้อมืออย่างสง่างาม หน้าปัดสีขาวสะอาดตาตัดกับตัวเรือนโทนสีทองและสายหนังแท้สีดำ รับประกันศูนย์ไทยโดย บริษัท อินเตอร์ ไทม์ส จำกัด',
    descriptionEn: 'Featherlight 7mm ultra-slim dress watch pairing a crisp white dial and gold-tone bezel with genuine black calfskin leather and sapphire crystal.',
    descriptionTh: 'เรือนเวลาเดรสคลาสสิกตัวเรือนบางเฉียบเพียง 7 มม. สวมใส่แนบข้อมืออย่างสง่างาม หน้าปัดสีขาวสะอาดตาตัดกับตัวเรือนโทนสีทองและสายหนังแท้สีดำ รับประกันศูนย์ไทยโดย บริษัท อินเตอร์ ไทม์ส จำกัด',
    specs: {
      Brand: 'Opwatch Thailand Boutique',
      Reference: 'OPW-TH-03',
      Movement: 'Japanese Slim Quartz',
      Crystal: 'Sapphire Crystal',
      'Case Diameter': '39 mm (Thickness 7 mm)',
      'Strap Material': 'Genuine Calfskin Leather',
      'Water Resistance': '3 ATM (30m)',
      Warranty: '2 Years Official Thailand Warranty (Inter Times Co., Ltd.)'
    },
    stock: 20,
    status: 'active',
    badges: ['sale'],
    featured: false,
    sortOrder: 603
  },
  {
    sku: 'OPW-TH-04',
    name: 'Opwatch Thailand Edition เลดี้ โรส คริสตัล 34',
    nameEn: 'Opwatch Thailand Edition Ladies Rose Crystal 34',
    nameTh: 'Opwatch Thailand Edition เลดี้ โรส คริสตัล 34',
    slug: 'opwatch-thailand-ladies-rose-crystal-34',
    categorySlug: 'women-watches',
    brandSlug: 'opwatch',
    price: 6500,
    originalPrice: 8200,
    currency: 'THB',
    images: ['/images/op/watch-990-45-lady.png', '/images/op/lifestyle-lady.jpg'],
    shortDescription: 'สปอร์ตลักชัวรีสุภาพสตรี 34 มม. · ขอบประดับคริสตัล · กระจกแซฟไฟร์',
    shortDescriptionEn: '34mm Ladies Sport-Luxury · Crystal-Set Bezel · Sapphire Crystal',
    description: 'นาฬิกาสุภาพสตรีสไตล์สปอร์ตลักชัวรีขนาด 34 มม. ตัวเรือนสีโรสโกลด์ล้อมคริสตัลเจียระไน จับคู่สายยางซิลิโคนเนื้อนุ่มสวมใส่สบายในสภาพอากาศเมืองไทย พร้อมกระจกแซฟไฟร์แท้ป้องกันรอยขีดข่วน',
    descriptionEn: '34mm rose-gold sport-luxury timepiece for women featuring a crystal-set bezel, sapphire crystal, and supple silicone strap ideal for Thailand’s climate.',
    descriptionTh: 'นาฬิกาสุภาพสตรีสไตล์สปอร์ตลักชัวรีขนาด 34 มม. ตัวเรือนสีโรสโกลด์ล้อมคริสตัลเจียระไน จับคู่สายยางซิลิโคนเนื้อนุ่มสวมใส่สบายในสภาพอากาศเมืองไทย พร้อมกระจกแซฟไฟร์แท้ป้องกันรอยขีดข่วน',
    specs: {
      Brand: 'Opwatch Thailand Boutique',
      Reference: 'OPW-TH-04',
      Movement: 'Japanese Precision Quartz',
      Crystal: 'Sapphire Crystal',
      'Case Diameter': '34 mm',
      'Strap Material': 'Soft Sport Rubber Strap',
      'Water Resistance': '5 ATM (50m)',
      Warranty: '2 Years Official Thailand Warranty (Inter Times Co., Ltd.)'
    },
    stock: 16,
    status: 'active',
    badges: ['sale'],
    featured: false,
    sortOrder: 604
  }
]

export const defaultProducts = (): SeedProduct[] => [
  ...olympianusOfficialProducts,
  ...ogivalOfficialProducts,
  ...opwatchThailandSignatureProducts()
]

export const defaultCampaigns = (): SeedCampaign[] => [
  {
    slug: 'olym-pianus-hero-1',
    title: '130-07MK SOVEREIGN GOLD',
    titleEn: '130-07MK SOVEREIGN GOLD',
    titleTh: '130-07MK SOVEREIGN GOLD',
    subtitle: 'ตัวแทนจำหน่ายอย่างเป็นทางการแต่เพียงผู้เดียวในประเทศไทย · Inter Times Co., Ltd.',
    subtitleEn: 'Official Thailand Authorized Boutique · Inter Times Co., Ltd.',
    subtitleTh: 'ตัวแทนจำหน่ายอย่างเป็นทางการแต่เพียงผู้เดียวในประเทศไทย · Inter Times Co., Ltd.',
    banner: '/images/op/hero-gold-stones.jpg',
    link: '/products/olympianus-130-07mk-gl-white',
    brandSlug: 'olympianus',
    type: 'hero',
    sortOrder: 1,
    active: true
  },
  {
    slug: 'olympianus-brand-day',
    title: 'OLYMPIANUS · FASTER, HIGHER, STRONGER',
    titleEn: 'OLYMPIANUS · FASTER, HIGHER, STRONGER',
    titleTh: 'OLYMPIANUS · ความสง่างามเหนือกาลเวลา',
    subtitle: 'ครบทุกคอลเลกชันของแท้จาก Olympianus พร้อมกระจกแซฟไฟร์ทุกรุ่น',
    subtitleEn: 'Complete official Olympianus sapphire-crystal collection in Thailand.',
    subtitleTh: 'ครบทุกคอลเลกชันของแท้จาก Olympianus พร้อมกระจกแซฟไฟร์ทุกรุ่น',
    banner: '/images/op/banner-899832ags.jpg',
    link: '/brands/olympianus',
    brandSlug: 'olympianus',
    type: 'brand-day',
    sortOrder: 1,
    active: true
  },
  {
    slug: 'ogival-brand-day',
    title: 'OGIVAL 1903 · SWISS HAUTE HORLOGERIE',
    titleEn: 'OGIVAL 1903 · SWISS HAUTE HORLOGERIE',
    titleTh: 'OGIVAL 1903 · ตำนานเรือนเวลาหรูสวิส',
    subtitle: 'สัญลักษณ์ปลากระโดดแห่งความโชคดี จากสวิตเซอร์แลนด์ตั้งแต่ปี 1903',
    subtitleEn: 'Swiss lucky leaping fish luxury watches since 1903.',
    subtitleTh: 'สัญลักษณ์ปลากระโดดแห่งความโชคดี จากสวิตเซอร์แลนด์ตั้งแต่ปี 1903',
    banner: '/images/op/hero-ceramic-dark.jpg',
    link: '/brands/ogival',
    brandSlug: 'ogival',
    type: 'brand-day',
    sortOrder: 2,
    active: true
  },
  {
    slug: 'opwatch-brand-day',
    title: 'OPWATCH THAILAND · OFFICIAL BOUTIQUE',
    titleEn: 'OPWATCH THAILAND · OFFICIAL BOUTIQUE',
    titleTh: 'OPWATCH THAILAND · บูติกทางการประเทศไทย',
    subtitle: 'จัดส่งฟรีทั่วประเทศไทย 77 จังหวัด พร้อมใบรับประกันศูนย์ไทยแท้',
    subtitleEn: 'Complimentary insured nationwide delivery across all 77 Thai provinces.',
    subtitleTh: 'จัดส่งฟรีทั่วประเทศไทย 77 จังหวัด พร้อมใบรับประกันศูนย์ไทยแท้',
    banner: '/images/op/lifestyle-men.jpg',
    link: '/brands/opwatch',
    brandSlug: 'opwatch',
    type: 'brand-day',
    sortOrder: 3,
    active: true
  }
]

let syncPromise: Promise<{ synced: number; removedLegacy: number; total: number }> | null = null

/**
 * Idempotently upgrades any already-installed MariaDB or JSON store:
 * - Normalizes Thailand currency symbol ('บาท' -> '฿') & country scope
 * - Normalizes 'olympinus' -> 'olympianus' brand slug & metadata
 * - Ensures all canonical categories (including 'couple-watches') exist
 * - Purges the 19 legacy scaffolding SKUs (preserving order history if referenced)
 * - Upserts all 403+ official Olympianus, Ogival, and Opwatch Thailand timepieces
 */
export async function syncOfficialCatalog(
  store: Store,
  opts: { force?: boolean } = {}
): Promise<{ synced: number; removedLegacy: number; total: number }> {
  if (syncPromise && !opts.force) return syncPromise

  const run = async () => {
    // 1. Normalize site config currencySymbol ('บาท' -> '฿') & Thailand-only defaults
    try {
      const cfg = loadConfig()
      if (cfg?.site) {
        let changed = false
        if (!cfg.site.currency || cfg.site.currency !== 'THB') {
          cfg.site.currency = 'THB'
          changed = true
        }
        if (!cfg.site.currencySymbol || cfg.site.currencySymbol === 'บาท' || cfg.site.currencySymbol === 'THB') {
          cfg.site.currencySymbol = '฿'
          changed = true
        }
        if (changed) saveConfig(cfg)
      }
    } catch {
      // Ignore read-only config errors in restricted environments
    }

    const brands = defaultBrands()
    const categories = defaultCategories()
    const officialProducts = defaultProducts()
    const campaigns = defaultCampaigns()

    // 2. Sync Brands (and migrate legacy 'olympinus' slug -> 'olympianus')
    const existingBrands = await store.all('brands')
    const brandBySlug = new Map<string, any>()
    for (const b of existingBrands) brandBySlug.set(String(b.slug), b)

    if (brandBySlug.has('olympinus') && !brandBySlug.has('olympianus')) {
      const legacyBrand = brandBySlug.get('olympinus')
      const updated = await store.update('brands', Number(legacyBrand.id), { slug: 'olympianus' })
      brandBySlug.delete('olympinus')
      if (updated) brandBySlug.set('olympianus', updated)
    }

    const brandMap = new Map<string, number>()
    for (const b of brands) {
      const existing = brandBySlug.get(b.slug)
      const payload = {
        slug: b.slug,
        name: b.name,
        nameEn: b.nameEn,
        nameTh: b.nameTh,
        country: b.country,
        countryEn: b.countryEn,
        movement: b.movement,
        movementEn: b.movementEn,
        positioning: b.positioning,
        tagline: b.tagline,
        taglineEn: b.taglineEn,
        story: b.story,
        storyEn: b.storyEn,
        accentColor: b.accentColor,
        logo: b.logo,
        heroImage: b.heroImage,
        sortOrder: b.sortOrder,
        active: b.active
      }
      if (!existing) {
        const created = await store.create('brands', payload)
        brandMap.set(b.slug, Number(created.id))
      } else {
        const needsUpdate =
          opts.force ||
          existing.name === 'Olympinus' ||
          String(existing.story || '').includes('ทัวร์บิロン') ||
          String(existing.logo || '').startsWith('/images/p') ||
          existing.nameEn !== b.nameEn
        if (needsUpdate) {
          await store.update('brands', Number(existing.id), payload)
        }
        brandMap.set(b.slug, Number(existing.id))
      }
    }

    // If duplicate 'olympinus' still existed alongside 'olympianus', re-point & remove it
    if (brandBySlug.has('olympinus') && brandMap.has('olympianus')) {
      const dup = brandBySlug.get('olympinus')
      const targetId = brandMap.get('olympianus')!
      const prods = await store.findMany('products', { brandId: Number(dup.id) })
      for (const pr of prods) {
        await store.update('products', Number(pr.id), { brandId: targetId, brand: 'olympianus' })
      }
      await store.remove('brands', Number(dup.id))
    }

    // 3. Sync Categories
    const existingCats = await store.all('categories')
    const catBySlug = new Map<string, any>()
    for (const c of existingCats) catBySlug.set(String(c.slug), c)

    const catMap = new Map<string, number>()
    const orderedCats = [...categories].sort((a, b) => (a.parentSlug ? 1 : 0) - (b.parentSlug ? 1 : 0))
    for (const c of orderedCats) {
      const parentId = c.parentSlug ? (catMap.get(c.parentSlug) ?? null) : null
      const existing = catBySlug.get(c.slug)
      const payload = {
        slug: c.slug,
        name: c.name,
        nameEn: c.nameEn,
        nameTh: c.nameTh,
        description: c.description,
        descriptionEn: c.descriptionEn,
        descriptionTh: c.descriptionTh,
        image: c.image,
        icon: c.icon,
        bannerImage: c.bannerImage,
        sortOrder: c.sortOrder,
        parentId
      }
      if (!existing) {
        const created = await store.create('categories', payload)
        catMap.set(c.slug, Number(created.id))
      } else {
        if (
          opts.force ||
          String(existing.image || '').startsWith('/images/p') ||
          String(existing.image || '').startsWith('/images/cat-') ||
          existing.name !== c.name
        ) {
          await store.update('categories', Number(existing.id), payload)
        }
        catMap.set(c.slug, Number(existing.id))
      }
    }

    // 4. Purge legacy sample SKUs & fix any katakana typo / broken '/images/p*.jpg' rows
    let allProducts = await store.all('products')
    const orderItems = await store.all('order_items').catch(() => [])
    const orderedProductIds = new Set<number>(
      orderItems.map((oi: any) => Number(oi.productId)).filter((n: number) => Number.isFinite(n) && n > 0)
    )

    let removedLegacy = 0
    for (const row of allProducts) {
      const sku = String(row.sku || '').toUpperCase()
      const imgs = Array.isArray(row.images) ? row.images : []
      const hasLegacyPlaceholderImg = imgs.some((u: any) => /^\/images\/p\d+\./i.test(String(u || '')))
      const hasTypo =
        String(row.name || '').includes('ทัวร์บิロン') ||
        String(row.nameTh || '').includes('ทัวร์บิロン') ||
        String(row.description || '').includes('ทัวร์บิロン')

      if (LEGACY_SAMPLE_SKUS.has(sku) || hasLegacyPlaceholderImg || hasTypo) {
        const id = Number(row.id)
        if (orderedProductIds.has(id)) {
          if (row.status !== 'draft') {
            await store.update('products', id, {
              status: 'draft',
              featured: false,
              name: String(row.name || '').replace('ทัวร์บิロン', 'ทัวร์บิลยอง'),
              nameTh: String(row.nameTh || '').replace('ทัวร์บิロン', 'ทัวร์บิลยอง'),
              images: ['/images/op/watch-990-083-blue.png']
            })
            removedLegacy++
          }
        } else {
          await store.remove('products', id)
          removedLegacy++
        }
      } else if (row.brand === 'olympinus') {
        await store.update('products', Number(row.id), {
          brand: 'olympianus',
          brandId: brandMap.get('olympianus') ?? row.brandId
        })
      }
    }

    // Remove legacy 'kids-watches' category if empty
    if (catBySlug.has('kids-watches')) {
      const kidsCat = catBySlug.get('kids-watches')
      const remainingKids = await store.findMany('products', { categoryId: Number(kidsCat.id) })
      if (remainingKids.length === 0) {
        await store.remove('categories', Number(kidsCat.id))
      }
    }

    // 5. Upsert all official Olympianus + Ogival + Opwatch Thailand products
    allProducts = await store.all('products')
    const bySku = new Map<string, any>()
    const bySlug = new Map<string, any>()
    for (const row of allProducts) {
      bySku.set(String(row.sku || '').toUpperCase(), row)
      bySlug.set(String(row.slug || '').toLowerCase(), row)
    }

    let synced = 0
    for (const p of officialProducts) {
      const existing = bySku.get(p.sku.toUpperCase()) || bySlug.get(p.slug.toLowerCase())
      const payload = {
        sku: p.sku,
        name: p.name,
        nameEn: p.nameEn,
        nameTh: p.nameTh,
        slug: p.slug,
        brandId: brandMap.get(p.brandSlug) ?? null,
        brand: p.brandSlug,
        categoryId: catMap.get(p.categorySlug) ?? null,
        price: p.price,
        originalPrice: p.originalPrice,
        currency: p.currency,
        images: p.images,
        shortDescription: p.shortDescription,
        description: p.description,
        descriptionEn: p.descriptionEn,
        descriptionTh: p.descriptionTh,
        specs: p.specs,
        stock: existing ? Number(existing.stock ?? p.stock) : p.stock,
        status: p.status,
        badges: p.badges,
        featured: p.featured,
        sortOrder: p.sortOrder
      }

      if (!existing) {
        await store.create('products', payload)
        synced++
      } else if (
        opts.force ||
        !Array.isArray(existing.images) ||
        existing.images.length === 0 ||
        existing.brandId !== payload.brandId ||
        existing.categoryId !== payload.categoryId
      ) {
        await store.update('products', Number(existing.id), payload)
        synced++
      }
    }

    // 6. Sync Campaigns (fix broken /products/ol-m2001 or OLYMPINUS links)
    const existingCampaigns = await store.all('campaigns')
    const campBySlug = new Map<string, any>()
    for (const c of existingCampaigns) campBySlug.set(String(c.slug), c)

    for (const c of campaigns) {
      const existing = campBySlug.get(c.slug)
      const payload = {
        slug: c.slug,
        title: c.title,
        titleEn: c.titleEn,
        titleTh: c.titleTh,
        subtitle: c.subtitle,
        subtitleEn: c.subtitleEn,
        subtitleTh: c.subtitleTh,
        banner: c.banner,
        link: c.link,
        brandId: c.brandSlug ? (brandMap.get(c.brandSlug) ?? null) : null,
        type: c.type,
        sortOrder: c.sortOrder,
        active: c.active
      }
      if (!existing) {
        await store.create('campaigns', payload)
      } else if (
        opts.force ||
        String(existing.link || '').includes('ol-m2001') ||
        String(existing.link || '').includes('olympinus') ||
        String(existing.title || '').includes('OLYMPINUS')
      ) {
        await store.update('campaigns', Number(existing.id), payload)
      }
    }

    const finalCount = await store.count('products', { status: 'active' })
    return { synced, removedLegacy, total: finalCount }
  }

  syncPromise = run().finally(() => {
    // Allow subsequent manual sync calls after completion
    setTimeout(() => { syncPromise = null }, 1000)
  })
  return syncPromise
}

export async function seedStore(
  store: Store,
  opts: { reset?: boolean } = {}
): Promise<void> {
  if (opts.reset && store.driver === 'json') {
    ;(store as any).reset?.()
  }
  await syncOfficialCatalog(store, { force: Boolean(opts.reset) })
}
