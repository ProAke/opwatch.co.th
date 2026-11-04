import type { Store } from '../db/types'
import { olympianusOfficialProducts } from './catalog-olympianus'
import { ogivalOfficialProducts } from './catalog-ogival'
import { getConfig, isInstalled, loadConfig, saveConfig } from './config'
import { useStore } from './store'
import { hashPassword } from './auth'
import {
  defaultPromotions,
  defaultCoupons,
  defaultBranches,
  defaultPages,
  defaultCalendarEvents,
  defaultAiRuns,
  defaultOfficers,
  defaultWarranties,
  defaultRepairs,
  defaultTreePages,
  defaultCustomerReviews
} from './seed-extras'
import { commitShopeeCatalogImport, SHOPEE_SHOP_232486539_META } from './shopee'

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

/** Legacy sample SKUs from initial scaffolding to purge from installed stores */
export const LEGACY_SAMPLE_SKUS = new Set([
  'OW-M1001', 'OW-M1002', 'OW-L2001', 'OW-L2002', 'OW-S3001', 'OW-C4001', 'OW-K1001',
  'OL-M2001', 'OL-M2002', 'OL-L3001', 'OL-L3002', 'OL-S4001', 'OL-C5001',
  'OG-M6001', 'OG-M6002', 'OG-L7001', 'OG-L7002', 'OG-S8001', 'OG-K9001',
  'OPW-TH-01', 'OPW-TH-02', 'OPW-TH-03', 'OPW-TH-04'
])

export const defaultBrands = (): SeedBrand[] => [
  {
    slug: 'olympianus',
    name: 'Olym Pianus',
    nameEn: 'Olym Pianus',
    nameTh: 'Olym Pianus (โอลิมปิอานัส)',
    country: 'สวิตเซอร์แลนด์ / ญี่ปุ่น',
    countryEn: 'Swiss Heritage · Japanese Movement',
    movement: 'เครื่องญี่ปุ่นแท้ · กระจกแซฟไฟร์',
    movementEn: 'Japanese Automatic & Quartz · Sapphire Crystal',
    positioning: 'mid',
    tagline: 'Faster, Higher, Stronger — ความสง่างามเหนือกาลเวลา',
    taglineEn: 'Faster, Higher, Stronger — Elegance Beyond Time',
    story:
      'Olym Pianus (โอลิมปิอานัส) ก่อตั้งขึ้นจากมรดกศาสตร์เรือนเวลาสวิสตั้งแต่ปี ค.ศ. 1953 ภายใต้จิตวิญญาณโอลิมปิก "Faster, Higher, Stronger" ผสานงานออกแบบอันสง่างามเข้ากับกลไกออโตเมติกและควอตซ์ต้นตำรับจากญี่ปุ่น พร้อมกระจกหน้าปัดแซฟไฟร์แท้ป้องกันรอยขีดข่วนในทุกเรือน จัดจำหน่ายอย่างเป็นทางการในประเทศไทยโดย บริษัท อินเตอร์ไทมส์ จำกัด',
    storyEn:
      'Born from Swiss watchmaking tradition in 1953 and inspired by the Olympic motto "Faster, Higher, Stronger", Olym Pianus unites timeless design, scratch-resistant sapphire crystal mirrors, and dependable Japanese automatic and quartz movements. Officially distributed in Thailand by Inter Times Co., Ltd.',
    accentColor: '#1d2088',
    logo: '/images/logos/olym-pianus.jpg',
    heroImage: '/images/op/banner-899832ags.jpg',
    sortOrder: 1,
    active: true
  },
  {
    slug: 'olympia-star',
    name: 'Olympia Star',
    nameEn: 'Olympia Star',
    nameTh: 'Olympia Star (โอลิมเปียสตาร์)',
    country: 'สวิตเซอร์แลนด์',
    countryEn: 'Swiss Heritage · Swiss Movement',
    movement: 'เครื่องสวิสแท้ · กระจกแซฟไฟร์',
    movementEn: 'Swiss Ronda Movement · Sapphire Crystal',
    positioning: 'mid',
    tagline: 'ตรามงกุฎและช่อมะกอกแห่งชัยชนะ ผสานความเที่ยงตรงของกลไกสวิส',
    taglineEn: 'Crowned Olive-Laurel Emblem Powered by Precision Swiss Movements',
    story:
      'Olympia Star (โอลิมเปียสตาร์ · รหัส OPA) คือสายผลิตภัณฑ์เรือนเวลาเครื่องสวิสในตระกูล OP โดดเด่นด้วยตราสัญลักษณ์โล่ OP ประดับมงกุฎและช่อมะกอกคู่แห่งเกียรติยศ ขับเคลื่อนด้วยกลไกสวิสความเที่ยงตรงสูง ตัวเรือนสแตนเลสสตีล 316L และกระจกแซฟไฟร์แท้ป้องกันรอยขีดข่วน จัดจำหน่ายและดูแลหลังการขายในประเทศไทยโดย บริษัท อินเตอร์ไทมส์ จำกัด',
    storyEn:
      'Olympia Star (OPA) represents the Swiss-movement pillar of the OP watchmaking family — crowned with the iconic OP shield and twin olive laurels, pairing precision Swiss movements with 316L surgical stainless steel and scratch-resistant sapphire crystal. Officially distributed in Thailand by Inter Times Co., Ltd.',
    accentColor: '#1d2088',
    logo: '/images/logos/olympia-star.jpg',
    heroImage: '/images/op/hero-gold-stones.jpg',
    sortOrder: 2,
    active: true
  },
  {
    slug: 'ogival',
    name: 'Ogival',
    nameEn: 'Ogival',
    nameTh: 'Ogival (โอจิวัล)',
    country: 'สวิตเซอร์แลนด์',
    countryEn: 'La Chaux-de-Fonds, Switzerland (Since 1903)',
    movement: 'เครื่องสวิสแท้ · อัญมณีและจักรกลชั้นสูง',
    movementEn: 'Swiss Automatic & Haute Joaillerie Quartz',
    positioning: 'premium',
    tagline: 'ตำนานปลากระโดดแห่งความโชคดี จากสวิตเซอร์แลนด์ตั้งแต่ปี 1903',
    taglineEn: 'Swiss Lucky Leaping Fish Haute Horlogerie Since 1903',
    story:
      'Ogival (โอจิวัล) ก่อตั้งขึ้นในปี ค.ศ. 1903 ณ เมือง La Chaux-de-Fonds ประเทศสวิตเซอร์แลนด์ โดย René Brandt ภายใต้สัญลักษณ์ "ปลากระโดดแห่งความโชคดีและความรักอันเปี่ยมล้น" โดดเด่นด้วยเรือนเวลาสวิสออโตเมติก คอลเลกชันดอกคามิลเลีย (Camellia) ดาวตก (Meteor) และนาฬิกาประดับเพชรและอัญมณีธรรมชาติ จัดจำหน่ายและดูแลหลังการขายในประเทศไทยโดย บริษัท อินเตอร์ไทมส์ จำกัด',
    storyEn:
      'Founded in La Chaux-de-Fonds, Switzerland in 1903 by René Brandt under the emblem of the lucky leaping fish, Ogival is celebrated for Swiss mechanical watchmaking, Camellia and Meteor haute-joaillerie diamond creations, and sapphire-crystal prestige timepieces. Exclusively warranted in Thailand by Inter Times Co., Ltd.',
    accentColor: '#8b0d11',
    logo: '/images/logos/ogival.jpg',
    heroImage: '/images/op/hero-ceramic-dark.jpg',
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
    description: 'รวมเรือนเวลาของแท้ Olym Pianus, Olympia Star และ Ogival ครบทุกรุ่นในประเทศไทย',
    descriptionEn: 'Complete official Thailand collection of Olym Pianus, Olympia Star, and Ogival timepieces.',
    descriptionTh: 'รวมเรือนเวลาของแท้ Olym Pianus, Olympia Star และ Ogival ครบทุกรุ่นในประเทศไทย',
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
    description: 'เรือนเวลาคู่รักชาย-หญิงจาก Ogival, Olym Pianus และ Olympia Star',
    descriptionEn: 'Matching His & Hers luxury pair timepieces.',
    descriptionTh: 'เรือนเวลาคู่รักชาย-หญิงจาก Ogival, Olym Pianus และ Olympia Star',
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

const olympiaStarOfficialProducts = (): SeedProduct[] => [
  {
    sku: 'OPA-58012MSK-BLUE',
    name: 'Olympia Star (โอลิมเปียสตาร์) สวิส แซฟไฟร์ รุ่น OPA58012MSK (หน้าปัดสีน้ำเงินเข้ม)',
    nameEn: 'Olympia Star Swiss Sapphire OPA58012MSK — Royal Blue Dial',
    nameTh: 'Olympia Star (โอลิมเปียสตาร์) สวิส แซฟไฟร์ รุ่น OPA58012MSK (หน้าปัดสีน้ำเงินเข้ม)',
    slug: 'olympia-star-opa58012msk-blue',
    categorySlug: 'men-watches',
    brandSlug: 'olympia-star',
    price: 6900,
    originalPrice: 8900,
    currency: 'THB',
    images: ['/images/op/watch-990-083-blue.png', '/images/op/lifestyle-men.jpg'],
    shortDescription: 'เครื่องสวิสแท้ (Swiss Movement) · กระจกแซฟไฟร์กันรอย · ตัวเรือนทูโทน 316L',
    shortDescriptionEn: 'Swiss Precision Movement · Scratch-Resistant Sapphire Crystal · Two-Tone 316L Steel',
    description: 'นาฬิกาข้อมือของแท้ Olympia Star (โอลิมเปียสตาร์) รุ่น OPA58012MSK โดดเด่นด้วยตราสัญลักษณ์โล่ OP ประดับมงกุฎและช่อมะกอกแห่งเกียรติยศ ขับเคลื่อนด้วยกลไกสวิสความเที่ยงตรงสูง หน้าปัดสีน้ำเงินเข้มพร้อมกระจกแซฟไฟร์แท้ป้องกันรอยขีดข่วน จัดจำหน่ายอย่างเป็นทางการในประเทศไทยโดย บริษัท อินเตอร์ไทมส์ จำกัด พร้อมใบรับประกันศูนย์ไทย',
    descriptionEn: 'Authentic Olympia Star Ref. OPA58012MSK powered by a Swiss movement beneath a scratch-resistant sapphire crystal in a two-tone 316L stainless steel case. Officially distributed in Thailand by Inter Times Co., Ltd.',
    descriptionTh: 'นาฬิกาข้อมือของแท้ Olympia Star (โอลิมเปียสตาร์) รุ่น OPA58012MSK โดดเด่นด้วยตราสัญลักษณ์โล่ OP ประดับมงกุฎและช่อมะกอกแห่งเกียรติยศ ขับเคลื่อนด้วยกลไกสวิสความเที่ยงตรงสูง หน้าปัดสีน้ำเงินเข้มพร้อมกระจกแซฟไฟร์แท้ป้องกันรอยขีดข่วน จัดจำหน่ายอย่างเป็นทางการในประเทศไทยโดย บริษัท อินเตอร์ไทมส์ จำกัด พร้อมใบรับประกันศูนย์ไทย',
    specs: {
      Brand: 'Olympia Star',
      Model: 'OPA58012MSK',
      Movement: 'Swiss Ronda Precision Quartz Movement',
      Crystal: 'Scratch-Resistant Sapphire Crystal',
      'Case Diameter': '39 mm',
      'Strap Material': 'Two-Tone 316L Surgical Stainless Steel',
      'Water Resistance': '5 ATM (50m)',
      Warranty: '2 Years Official Thailand Warranty (บริษัท อินเตอร์ไทมส์ จำกัด)'
    },
    stock: 14,
    status: 'active',
    badges: ['bestseller', 'sale'],
    featured: true,
    sortOrder: 40
  },
  {
    sku: 'OPA-58071DMK-BLACK',
    name: 'Olympia Star (โอลิมเปียสตาร์) สวิส ไดมอนด์ เบเซล รุ่น OPA58071DMK (หน้าปัดสีดำ)',
    nameEn: 'Olympia Star Swiss Diamond Bezel OPA58071DMK — Black Dial',
    nameTh: 'Olympia Star (โอลิมเปียสตาร์) สวิส ไดมอนด์ เบเซล รุ่น OPA58071DMK (หน้าปัดสีดำ)',
    slug: 'olympia-star-opa58071dmk-black',
    categorySlug: 'men-jewelry',
    brandSlug: 'olympia-star',
    price: 8500,
    originalPrice: 10900,
    currency: 'THB',
    images: ['/images/op/watch-990-163-black.png', '/images/op/openheart-stones.jpg'],
    shortDescription: 'เครื่องสวิสแท้ · ขอบประดับคริสตัลหรู · กระจกแซฟไฟร์แท้กันรอย',
    shortDescriptionEn: 'Swiss Movement · Crystal-Set Bezel · Scratch-Resistant Sapphire Crystal',
    description: 'เรือนเวลาสุภาพบุรุษ Olympia Star รุ่น OPA58071DMK ผสานความเที่ยงตรงของกลไกสวิสเข้ากับตัวเรือนโทนสีทองและหน้าปัดสีดำคมเข้ม พร้อมกระจกแซฟไฟร์แท้กันรอยขีดข่วน รับประกันศูนย์ไทยโดย บริษัท อินเตอร์ไทมส์ จำกัด',
    descriptionEn: 'Gentlemen’s Olympia Star Ref. OPA58071DMK uniting Swiss quartz precision, crystal-accented bezel details, and scratch-resistant sapphire crystal. Warranted in Thailand by Inter Times Co., Ltd.',
    descriptionTh: 'เรือนเวลาสุภาพบุรุษ Olympia Star รุ่น OPA58071DMK ผสานความเที่ยงตรงของกลไกสวิสเข้ากับตัวเรือนโทนสีทองและหน้าปัดสีดำคมเข้ม พร้อมกระจกแซฟไฟร์แท้กันรอยขีดข่วน รับประกันศูนย์ไทยโดย บริษัท อินเตอร์ไทมส์ จำกัด',
    specs: {
      Brand: 'Olympia Star',
      Model: 'OPA58071DMK',
      Movement: 'Swiss Ronda Quartz Movement',
      Crystal: 'Scratch-Resistant Sapphire Crystal',
      'Case Diameter': '40 mm',
      'Strap Material': 'Gold PVD 316L Stainless Steel',
      'Water Resistance': '5 ATM (50m)',
      Warranty: '2 Years Official Thailand Warranty (บริษัท อินเตอร์ไทมส์ จำกัด)'
    },
    stock: 10,
    status: 'active',
    badges: ['new', 'sale'],
    featured: true,
    sortOrder: 41
  },
  {
    sku: 'OPA-58062MK-WHITE',
    name: 'Olympia Star (โอลิมเปียสตาร์) อัลตร้าสลิม สวิส เดรส รุ่น OPA58062MK (หน้าปัดสีขาว)',
    nameEn: 'Olympia Star Ultra-Slim Swiss Dress OPA58062MK — White Dial',
    nameTh: 'Olympia Star (โอลิมเปียสตาร์) อัลตร้าสลิม สวิส เดรส รุ่น OPA58062MK (หน้าปัดสีขาว)',
    slug: 'olympia-star-opa58062mk-white',
    categorySlug: 'classic-watches',
    brandSlug: 'olympia-star',
    price: 5900,
    originalPrice: 7500,
    currency: 'THB',
    images: ['/images/op/watch-130-06-white.png', '/images/op/hero-gold-stones.jpg'],
    shortDescription: 'เดรสสวิสตัวเรือนบางเฉียบ · สายหนังวัวแท้ · กระจกแซฟไฟร์แท้',
    shortDescriptionEn: 'Ultra-Slim Swiss Dress · Genuine Calfskin Strap · Sapphire Crystal',
    description: 'นาฬิกาเดรสคลาสสิก Olympia Star รุ่น OPA58062MK ตัวเรือนบางเฉียบสวมใส่แนบข้อมือ ขับเคลื่อนด้วยกลไกสวิสแท้ หน้าปัดสีขาวสะอาดตาคู่ตัวเรือนโทนสีทองและสายหนังแท้สีดำ จัดจำหน่ายโดย บริษัท อินเตอร์ไทมส์ จำกัด',
    descriptionEn: 'Ultra-slim Swiss dress watch Olympia Star Ref. OPA58062MK pairing a pure white dial and gold-tone case with genuine calfskin leather and sapphire crystal.',
    descriptionTh: 'นาฬิกาเดรสคลาสสิก Olympia Star รุ่น OPA58062MK ตัวเรือนบางเฉียบสวมใส่แนบข้อมือ ขับเคลื่อนด้วยกลไกสวิสแท้ หน้าปัดสีขาวสะอาดตาคู่ตัวเรือนโทนสีทองและสายหนังแท้สีดำ จัดจำหน่ายโดย บริษัท อินเตอร์ไทมส์ จำกัด',
    specs: {
      Brand: 'Olympia Star',
      Model: 'OPA58062MK',
      Movement: 'Swiss Slim Quartz Movement',
      Crystal: 'Scratch-Resistant Sapphire Crystal',
      'Case Diameter': '38 mm (Thickness 6.8 mm)',
      'Strap Material': 'Genuine Calfskin Leather',
      'Water Resistance': '3 ATM (30m)',
      Warranty: '2 Years Official Thailand Warranty (บริษัท อินเตอร์ไทมส์ จำกัด)'
    },
    stock: 18,
    status: 'active',
    badges: ['sale'],
    featured: false,
    sortOrder: 601
  },
  {
    sku: 'OPA-28035DLR-WHITE',
    name: 'Olympia Star (โอลิมเปียสตาร์) เลดี้ สวิส คริสตัล รุ่น OPA28035DLR (โรสโกลด์)',
    nameEn: 'Olympia Star Ladies Swiss Crystal OPA28035DLR — Rose Gold',
    nameTh: 'Olympia Star (โอลิมเปียสตาร์) เลดี้ สวิส คริสตัล รุ่น OPA28035DLR (โรสโกลด์)',
    slug: 'olympia-star-opa28035dlr-white',
    categorySlug: 'women-watches',
    brandSlug: 'olympia-star',
    price: 6800,
    originalPrice: 8600,
    currency: 'THB',
    images: ['/images/op/watch-990-45-lady.png', '/images/op/lifestyle-lady.jpg'],
    shortDescription: 'นาฬิกาสุภาพสตรีเครื่องสวิส · ขอบประดับคริสตัล · กระจกแซฟไฟร์แท้',
    shortDescriptionEn: 'Ladies Swiss Quartz · Crystal-Set Bezel · Sapphire Crystal',
    description: 'นาฬิกาสุภาพสตรี Olympia Star รุ่น OPA28035DLR ตัวเรือนสีโรสโกลด์ประดับคริสตัลรอบขอบหน้าปัด ขับเคลื่อนด้วยกลไกสวิสความเที่ยงตรงสูง พร้อมกระจกแซฟไฟร์แท้ป้องกันรอยขีดข่วน รับประกันศูนย์ไทยโดย บริษัท อินเตอร์ไทมส์ จำกัด',
    descriptionEn: 'Graceful Olympia Star Ladies Ref. OPA28035DLR featuring a crystal-set rose-gold bezel, Swiss precision quartz movement, and scratch-resistant sapphire crystal.',
    descriptionTh: 'นาฬิกาสุภาพสตรี Olympia Star รุ่น OPA28035DLR ตัวเรือนสีโรสโกลด์ประดับคริสตัลรอบขอบหน้าปัด ขับเคลื่อนด้วยกลไกสวิสความเที่ยงตรงสูง พร้อมกระจกแซฟไฟร์แท้ป้องกันรอยขีดข่วน รับประกันศูนย์ไทยโดย บริษัท อินเตอร์ไทมส์ จำกัด',
    specs: {
      Brand: 'Olympia Star',
      Model: 'OPA28035DLR',
      Movement: 'Swiss Ronda Quartz Movement',
      Crystal: 'Scratch-Resistant Sapphire Crystal',
      'Case Diameter': '30 mm',
      'Strap Material': 'Comfortable Silicone / Rose-Gold Clasp',
      'Water Resistance': '3 ATM (30m)',
      Warranty: '2 Years Official Thailand Warranty (บริษัท อินเตอร์ไทมส์ จำกัด)'
    },
    stock: 16,
    status: 'active',
    badges: ['sale'],
    featured: false,
    sortOrder: 602
  },
  {
    sku: 'OPA-58063LSK-CERAMIC',
    name: 'Olympia Star (โอลิมเปียสตาร์) เลดี้ เซรามิก สวิส รุ่น OPA58063LSK',
    nameEn: 'Olympia Star Ladies Ceramic Swiss OPA58063LSK — Midnight Black & Gold',
    nameTh: 'Olympia Star (โอลิมเปียสตาร์) เลดี้ เซรามิก สวิส รุ่น OPA58063LSK',
    slug: 'olympia-star-opa58063lsk-ceramic',
    categorySlug: 'women-jewelry',
    brandSlug: 'olympia-star',
    price: 7500,
    originalPrice: 9500,
    currency: 'THB',
    images: ['/images/op/watch-82672-lady.png', '/images/op/hero-ceramic-dark.jpg'],
    shortDescription: 'สุภาพสตรีไฮเทคเซรามิก · เครื่องสวิสแท้ · กระจกแซฟไฟร์กันรอย',
    shortDescriptionEn: 'Ladies High-Tech Ceramic · Swiss Movement · Sapphire Crystal',
    description: 'เรือนเวลาจิวเวลรี่สุภาพสตรี Olympia Star รุ่น OPA58063LSK ผสานสายเซรามิกเงางามกันรอยขีดข่วนเข้ากับกลไกสวิสแท้และกระจกแซฟไฟร์คริสตัล จัดจำหน่ายโดย บริษัท อินเตอร์ไทมส์ จำกัด',
    descriptionEn: 'Jewellery timepiece Olympia Star Ref. OPA58063LSK combining high-gloss ceramic links, warm gold accents, Swiss quartz precision, and sapphire crystal.',
    descriptionTh: 'เรือนเวลาจิวเวลรี่สุภาพสตรี Olympia Star รุ่น OPA58063LSK ผสานสายเซรามิกเงางามกันรอยขีดข่วนเข้ากับกลไกสวิสแท้และกระจกแซฟไฟร์คริสตัล จัดจำหน่ายโดย บริษัท อินเตอร์ไทมส์ จำกัด',
    specs: {
      Brand: 'Olympia Star',
      Model: 'OPA58063LSK',
      Movement: 'Swiss Precision Quartz Movement',
      Crystal: 'Scratch-Resistant Sapphire Crystal',
      'Case Diameter': '30 mm',
      'Strap Material': 'High-Tech Ceramic & Gold PVD Steel',
      'Water Resistance': '3 ATM (30m)',
      Warranty: '2 Years Official Thailand Warranty (บริษัท อินเตอร์ไทมส์ จำกัด)'
    },
    stock: 12,
    status: 'active',
    badges: ['sale'],
    featured: false,
    sortOrder: 603
  },
  {
    sku: 'OPA-58029MS-EMERALD',
    name: 'Olympia Star (โอลิมเปียสตาร์) สปอร์ต สวิส แซฟไฟร์ รุ่น OPA58029MS (เขียวมรกต)',
    nameEn: 'Olympia Star Sport Swiss Sapphire OPA58029MS — Emerald Dial',
    nameTh: 'Olympia Star (โอลิมเปียสตาร์) สปอร์ต สวิส แซฟไฟร์ รุ่น OPA58029MS (เขียวมรกต)',
    slug: 'olympia-star-opa58029ms-emerald',
    categorySlug: 'sport-watches',
    brandSlug: 'olympia-star',
    price: 7200,
    originalPrice: 9200,
    currency: 'THB',
    images: ['/images/op/watch-899831-green.png', '/images/op/square-diver-glow.jpg'],
    shortDescription: 'สปอร์ตเครื่องสวิส · หน้าปัดเขียวมรกตพรายน้ำ · กระจกแซฟไฟร์แท้',
    shortDescriptionEn: 'Swiss Sport Watch · Luminous Emerald Dial · Sapphire Crystal',
    description: 'นาฬิกาสปอร์ต Olympia Star รุ่น OPA58029MS หน้าปัดสีเขียวมรกตพร้อมพรายน้ำสว่างคมชัด ขับเคลื่อนด้วยกลไกสวิสแท้ ตัวเรือนสแตนเลสสตีล 316L และกระจกแซฟไฟร์ป้องกันรอยขีดข่วน จัดจำหน่ายในประเทศไทยโดย บริษัท อินเตอร์ไทมส์ จำกัด',
    descriptionEn: 'Sport-ready Olympia Star Ref. OPA58029MS engineered with a Swiss quartz movement, luminous emerald dial, 316L steel bracelet, and sapphire crystal.',
    descriptionTh: 'นาฬิกาสปอร์ต Olympia Star รุ่น OPA58029MS หน้าปัดสีเขียวมรกตพร้อมพรายน้ำสว่างคมชัด ขับเคลื่อนด้วยกลไกสวิสแท้ ตัวเรือนสแตนเลสสตีล 316L และกระจกแซฟไฟร์ป้องกันรอยขีดข่วน จัดจำหน่ายในประเทศไทยโดย บริษัท อินเตอร์ไทมส์ จำกัด',
    specs: {
      Brand: 'Olympia Star',
      Model: 'OPA58029MS',
      Movement: 'Swiss Ronda Sport Quartz Movement',
      Crystal: 'Scratch-Resistant Sapphire Crystal',
      'Case Diameter': '40 mm',
      'Strap Material': '316L Surgical Stainless Steel',
      'Water Resistance': '5 ATM (50m)',
      Warranty: '2 Years Official Thailand Warranty (บริษัท อินเตอร์ไทมส์ จำกัด)'
    },
    stock: 15,
    status: 'active',
    badges: ['sale'],
    featured: false,
    sortOrder: 604
  }
]

export const defaultProducts = (): SeedProduct[] => [
  ...olympianusOfficialProducts,
  ...ogivalOfficialProducts,
  ...olympiaStarOfficialProducts()
]

export const defaultCampaigns = (): SeedCampaign[] => [
  {
    slug: 'olym-pianus-hero-1',
    title: '130-07MK SOVEREIGN GOLD',
    titleEn: '130-07MK SOVEREIGN GOLD',
    titleTh: '130-07MK SOVEREIGN GOLD',
    subtitle: 'ตัวแทนจำหน่ายอย่างเป็นทางการในประเทศไทย · บริษัท อินเตอร์ไทมส์ จำกัด',
    subtitleEn: 'Official Thailand Authorized Distributor · Inter Times Co., Ltd.',
    subtitleTh: 'ตัวแทนจำหน่ายอย่างเป็นทางการในประเทศไทย · บริษัท อินเตอร์ไทมส์ จำกัด',
    banner: '/images/op/hero-gold-stones.jpg',
    link: '/products/olympianus-130-07mk-gl-white',
    brandSlug: 'olympianus',
    type: 'hero',
    sortOrder: 1,
    active: true
  },
  {
    slug: 'olympianus-brand-day',
    title: 'OLYM PIANUS · FASTER, HIGHER, STRONGER',
    titleEn: 'OLYM PIANUS · FASTER, HIGHER, STRONGER',
    titleTh: 'OLYM PIANUS · ความสง่างามเหนือกาลเวลา',
    subtitle: 'ครบทุกคอลเลกชันของแท้จาก Olym Pianus พร้อมกระจกแซฟไฟร์ทุกรุ่น',
    subtitleEn: 'Complete official Olym Pianus sapphire-crystal collection in Thailand.',
    subtitleTh: 'ครบทุกคอลเลกชันของแท้จาก Olym Pianus พร้อมกระจกแซฟไฟร์ทุกรุ่น',
    banner: '/images/op/banner-899832ags.jpg',
    link: '/brands/olympianus',
    brandSlug: 'olympianus',
    type: 'brand-day',
    sortOrder: 1,
    active: true
  },
  {
    slug: 'olympia-star-brand-day',
    title: 'OLYMPIA STAR · SWISS MOVEMENT',
    titleEn: 'OLYMPIA STAR · SWISS MOVEMENT',
    titleTh: 'OLYMPIA STAR · เครื่องสวิสแท้ กระจกแซฟไฟร์',
    subtitle: 'ตรามงกุฎและช่อมะกอกแห่งชัยชนะ ผสานความเที่ยงตรงของกลไกสวิส',
    subtitleEn: 'Crowned olive-laurel emblem paired with Swiss precision movements.',
    subtitleTh: 'ตรามงกุฎและช่อมะกอกแห่งชัยชนะ ผสานความเที่ยงตรงของกลไกสวิส',
    banner: '/images/op/lifestyle-men.jpg',
    link: '/brands/olympia-star',
    brandSlug: 'olympia-star',
    type: 'brand-day',
    sortOrder: 2,
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
    sortOrder: 3,
    active: true
  }
]

let syncPromise: Promise<{ synced: number; removedLegacy: number; total: number }> | null = null

/**
 * Idempotently upgrades any already-installed MariaDB or JSON store:
 * - Normalizes Thailand currency symbol ('฿') & official Inter Times phone ('02 251 5777')
 * - Syncs the 3 official brands & white-background logos: Olym Pianus, Olympia Star, Ogival
 * - Migrates legacy 'olympinus' -> 'olympianus' and 'opwatch' -> 'olympia-star'
 * - Purges legacy sample SKUs and upserts all 405 official watches
 */
export async function syncOfficialCatalog(
  store: Store,
  opts: { force?: boolean } = {}
): Promise<{ synced: number; removedLegacy: number; total: number }> {
  if (syncPromise && !opts.force) return syncPromise

  const run = async () => {
    // 1. Normalize site config currencySymbol ('฿') & official phone ('02 251 5777')
    let cfg: ReturnType<typeof loadConfig> = null
    try {
      cfg = loadConfig()
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
        if (!cfg.site.phone || cfg.site.phone === '+66 2 000 0000') {
          cfg.site.phone = '02 251 5777'
          changed = true
        }
        if (changed) saveConfig(cfg)
      }
    } catch {
      // Ignore read-only config errors in restricted environments
    }

    const work = async () => {
      // 1b. Self-heal admin customer row if config/site.config.json exists
      if (cfg?.admin?.email && cfg?.admin?.passwordHash) {
        const adminEmail = String(cfg.admin.email).trim().toLowerCase()
        const existingAdmin = await store.findOne('customers', { where: { email: adminEmail } })
        if (!existingAdmin) {
          await store.create('customers', {
            name: 'CEO · Administrator',
            email: adminEmail,
            passwordHash: cfg.admin.passwordHash,
            isAdmin: true,
            role: 'ceo',
            department: 'Executive Management',
            position: 'Chief Executive Officer',
            status: 'active',
            points: 0,
            totalSpent: 0
          })
        } else if (!existingAdmin.isAdmin || !existingAdmin.role || existingAdmin.role === 'member') {
          await store.update('customers', Number(existingAdmin.id), {
            isAdmin: true,
            role: existingAdmin.role && existingAdmin.role !== 'member' ? existingAdmin.role : 'ceo',
            status: existingAdmin.status || 'active'
          })
        }
      }

      const brands = defaultBrands()
      const categories = defaultCategories()
      const officialProducts = defaultProducts()
      const campaigns = defaultCampaigns()

      // 2. Sync Brands (migrate legacy 'olympinus' -> 'olympianus' and 'opwatch' -> 'olympia-star')
      const existingBrands = await store.all('brands')
      const brandBySlug = new Map<string, any>()
      for (const b of existingBrands) brandBySlug.set(String(b.slug), b)

      if (brandBySlug.has('olympinus') && !brandBySlug.has('olympianus')) {
        const legacyBrand = brandBySlug.get('olympinus')
        const updated = await store.update('brands', Number(legacyBrand.id), { slug: 'olympianus' })
        brandBySlug.delete('olympinus')
        if (updated) brandBySlug.set('olympianus', updated)
      }

      if (brandBySlug.has('opwatch') && !brandBySlug.has('olympia-star')) {
        const legacyOp = brandBySlug.get('opwatch')
        const updated = await store.update('brands', Number(legacyOp.id), { slug: 'olympia-star' })
        brandBySlug.delete('opwatch')
        if (updated) brandBySlug.set('olympia-star', updated)
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
            existing.logo !== b.logo ||
            existing.name !== b.name ||
            existing.nameEn !== b.nameEn ||
            existing.sortOrder !== b.sortOrder ||
            String(existing.story || '').includes('อินเตอร์ ไทม์ส')
          if (needsUpdate) {
            await store.update('brands', Number(existing.id), payload)
          }
          brandMap.set(b.slug, Number(existing.id))
        }
      }

      // Re-point & remove any leftover duplicate 'olympinus' or 'opwatch' brand row
      for (const [legacySlug, targetSlug] of [['olympinus', 'olympianus'], ['opwatch', 'olympia-star']] as const) {
        if (brandBySlug.has(legacySlug) && brandMap.has(targetSlug)) {
          const dup = brandBySlug.get(legacySlug)
          const targetId = brandMap.get(targetSlug)!
          const prods = await store.find('products', { where: { brandId: Number(dup.id) } })
          for (const pr of prods) {
            await store.update('products', Number(pr.id), { brandId: targetId, brand: targetSlug })
          }
          await store.remove('brands', Number(dup.id))
        }
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
            existing.description !== c.description
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
        } else if (row.brand === 'opwatch') {
          await store.update('products', Number(row.id), {
            brand: 'olympia-star',
            brandId: brandMap.get('olympia-star') ?? row.brandId
          })
        }
      }

      if (catBySlug.has('kids-watches')) {
        const kidsCat = catBySlug.get('kids-watches')
        const remainingKids = await store.find('products', { where: { categoryId: Number(kidsCat.id) } })
        if (remainingKids.length === 0) {
          await store.remove('categories', Number(kidsCat.id))
        }
      }

      // 5. Upsert all official Olym Pianus + Ogival + Olympia Star products
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
          existing.categoryId !== payload.categoryId ||
          String(existing.description || '').includes('อินเตอร์ ไทม์ส')
        ) {
          await store.update('products', Number(existing.id), payload)
          synced++
        }
      }

      // 6. Sync Campaigns (remove obsolete scaffold campaigns & upsert official campaigns)
      const existingCampaigns = await store.all('campaigns')
      const campBySlug = new Map<string, any>()
      for (const c of existingCampaigns) campBySlug.set(String(c.slug), c)

      const obsoleteCampaignSlugs = ['anniversary', 'opwatch-brand-day', 'watches-spotlight', 'luxury-gift']
      for (const oldSlug of obsoleteCampaignSlugs) {
        if (campBySlug.has(oldSlug)) {
          const oldCamp = campBySlug.get(oldSlug)
          await store.remove('campaigns', Number(oldCamp.id))
          campBySlug.delete(oldSlug)
        }
      }

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
          existing.link !== c.link ||
          existing.banner !== c.banner ||
          existing.title !== c.title ||
          existing.subtitle !== c.subtitle
        ) {
          await store.update('campaigns', Number(existing.id), payload)
        }
      }

      // 7. Seed Promotions, Coupons, Branches & CMS Pages if missing
      const existingPromos = await store.all('promotions')
      if (existingPromos.length === 0) {
        const currentProds = await store.find('products', {
          where: { status: 'active' },
          orderBy: 'sortOrder',
          orderDir: 'asc'
        })
        const opPick = currentProds.filter((p) => p.brand === 'olympianus').slice(0, 3)
        const opaPick = currentProds.filter((p) => p.brand === 'olympia-star').slice(0, 2)
        const ogPick = currentProds.filter((p) => p.brand === 'ogival').slice(0, 3)
        const featuredIds = [...opPick, ...opaPick, ...ogPick].map((p) => Number(p.id))
        for (const pr of defaultPromotions(featuredIds)) {
          await store.create('promotions', pr)
        }
      }

      const existingCoupons = await store.all('coupons')
      if (existingCoupons.length === 0) {
        for (const cp of defaultCoupons()) {
          await store.create('coupons', cp)
        }
      }

      const existingBranches = await store.all('branches')
      if (existingBranches.length === 0) {
        for (const br of defaultBranches()) {
          await store.create('branches', br)
        }
      }

      const existingPages = await store.all('pages')
      const pageSlugs = new Set(existingPages.map((pg) => String(pg.slug)))
      for (const pg of defaultPages()) {
        if (!pageSlugs.has(pg.slug)) {
          await store.create('pages', pg)
        }
      }

      const existingEvents = await store.all('events').catch(() => [])
      if (existingEvents.length === 0) {
        for (const ev of defaultCalendarEvents()) {
          await store.create('events', ev)
        }
      }

      const existingAiRuns = await store.all('ai_runs').catch(() => [])
      if (existingAiRuns.length === 0) {
        for (const r of defaultAiRuns()) {
          await store.create('ai_runs', r)
        }
      }

      await ensureEnterpriseEntities(store)

      const finalCount = await store.count('products', { where: { status: 'active' } })
      return { synced, removedLegacy, total: finalCount }
    }

    if (typeof (store as any).runInBatch === 'function') {
      return await (store as any).runInBatch(work)
    }
    return await work()
  }

  syncPromise = run().finally(() => {
    setTimeout(() => { syncPromise = null }, 1000)
  })
  return syncPromise
}

function inferSeriesSlug(p: Record<string, any>): string {
  const brand = String(p.brand || '').toLowerCase()
  const text = `${p.sku || ''} ${p.name || ''} ${p.nameTh || ''} ${p.shortDescription || ''}`.toLowerCase()
  if (brand === 'olympianus') {
    if (text.includes('open') || text.includes('99141') || text.includes('8934')) return 'series-op-open-heart'
    if (text.includes('lady') || text.includes('ผู้หญิง') || /\bl\b|280|82672|990-45/.test(text)) return 'series-op-lady-jewelry'
    return 'series-op-sportmaster'
  }
  if (brand === 'olympia-star') return 'series-opa-swiss-slim'
  if (brand === 'ogival') return 'series-ogival-lucky-fish'
  return ''
}

function splitFiveChannels(baseTotal: number, idNum: number) {
  const total = Math.max(5, Number(baseTotal) || 14)
  const stockWeb = Math.max(1, Math.round(total * 0.3))
  const stockShopee = Math.max(1, Math.round(total * 0.22))
  const stockLazada = Math.max(1, Math.round(total * 0.16))
  const stockTiktok = Math.max(0, (idNum % 3 === 0 ? 2 : 1))
  const used = stockWeb + stockShopee + stockLazada + stockTiktok
  const stockDealer = Math.max(2, total - used)
  return {
    stockWeb,
    stockShopee,
    stockLazada,
    stockTiktok,
    stockDealer,
    stock: stockWeb + stockShopee + stockLazada + stockTiktok + stockDealer
  }
}

let enterpriseReadyDone = false
let enterprisePromise: Promise<void> | null = null

export async function ensureEnterpriseEntities(store: Store): Promise<void> {
  if (enterprisePromise) return enterprisePromise
  enterprisePromise = (async () => {
    try {
      const cfg = getConfig()
      const fallbackHash = cfg.admin?.passwordHash || (await hashPassword('Opwatch@2026'))
      const adminEmail = String(cfg.admin?.email || 'admin@opwatch.co.th').trim().toLowerCase()

      // 1. Migrate any back-office staff/admin rows out of `customers` into `officers`
      const allCustomers = await store.all('customers').catch(() => [])
      const existingOfficers = await store.all('officers').catch(() => [])
      const officerByEmail = new Map<string, any>()
      for (const o of existingOfficers) {
        officerByEmail.set(String(o.email || '').toLowerCase(), o)
      }

      for (const c of allCustomers) {
        const cRole = String(c.role || '').toLowerCase()
        const cEmail = String(c.email || '').toLowerCase()
        const wasStaff = Boolean(c.isAdmin || ['ceo', 'admin', 'staff', 'it_admin', 'marketing_sales', 'warehouse', 'dealer'].includes(cRole))
        if (wasStaff && cEmail) {
          if (!officerByEmail.has(cEmail)) {
            const mappedRole = cRole === 'admin' ? 'it_admin' : cRole === 'staff' ? 'marketing_sales' : (cRole === 'ceo' ? 'ceo' : 'ceo')
            const created = await store.create('officers', {
              code: `OFC-M${c.id}`,
              name: c.name || 'เจ้าหน้าที่ OPWatch',
              email: cEmail,
              passwordHash: c.passwordHash || fallbackHash,
              phone: c.phone || '02 251 5777',
              role: mappedRole,
              department: c.department || 'บริหารจัดการระบบ',
              position: c.position || 'Executive / Officer',
              permissions: Array.isArray(c.permissions) && c.permissions.length ? c.permissions : ['*'],
              status: c.status || 'active'
            })
            officerByEmail.set(cEmail, created)
          }
          // Check if this customer has any storefront orders; if none, remove admin row from `customers` so `customers` holds ONLY real shoppers/members
          const custOrders = await store.find('orders', { where: { customerId: Number(c.id) }, limit: 1 }).catch(() => [])
          if (custOrders.length === 0) {
            await store.remove('customers', Number(c.id))
          } else {
            await store.update('customers', Number(c.id), { isAdmin: false, role: 'member' })
          }
        }
      }

      // 2. Seed all 5 default role accounts in `officers` (`ceo`, `it_admin`, `marketing_sales`, `warehouse`, `dealer`)
      for (const def of defaultOfficers(fallbackHash, adminEmail)) {
        const em = String(def.email || '').toLowerCase()
        if (!officerByEmail.has(em)) {
          const created = await store.create('officers', def)
          officerByEmail.set(em, created)
        }
      }

      // Seed at least 2 realistic storefront members in `customers` if empty after migration
      const remainingCustomers = await store.all('customers').catch(() => [])
      if (remainingCustomers.length === 0) {
        const memberHash = await hashPassword('Member@2026')
        await store.create('customers', {
          name: 'คุณปภาวิน ทองประเสริฐ',
          email: 'papawin.member@example.com',
          passwordHash: memberHash,
          phone: '081-945-2210',
          address: '88/12 ซอยสุขุมวิท 24 แขวงคลองตัน เขตคลองเตย',
          city: 'กรุงเทพมหานคร',
          postalCode: '10110',
          country: 'TH',
          isAdmin: false,
          role: 'member',
          status: 'active',
          points: 450,
          totalSpent: 12900
        })
        await store.create('customers', {
          name: 'คุณลลิตา วงศ์สุวรรณ',
          email: 'lalita.member@example.com',
          passwordHash: memberHash,
          phone: '089-612-7744',
          address: '199 ถนนนิมมานเหมินท์ ตำบลสุเทพ อำเภอเมือง',
          city: 'เชียงใหม่',
          postalCode: '50200',
          country: 'TH',
          isAdmin: false,
          role: 'member',
          status: 'active',
          points: 280,
          totalSpent: 7500
        })
      }

      // 3. Backfill 5-channel warehouse stock + wholesale `dealerPrice` + `seriesSlug` on products
      const prods = await store.all('products').catch(() => [])
      let prodUpdated = 0
      for (const p of prods) {
        const needsBackfill =
          p.dealerPrice === undefined ||
          p.dealerPrice === null ||
          Number(p.dealerPrice) <= 0 ||
          p.stockWeb === undefined ||
          p.stockShopee === undefined
        if (needsBackfill) {
          const retail = Number(p.price) || 4900
          const dealerPrice = Math.round((retail * 0.65) / 10) * 10
          const ch = splitFiveChannels(Number(p.stock) || 14, Number(p.id) || 1)
          const seriesSlug = p.seriesSlug || inferSeriesSlug(p)
          await store.update('products', Number(p.id), {
            dealerPrice,
            ...ch,
            seriesSlug
          })
          prodUpdated++
        }
      }

      // 3B. Sync confirmed Shopee Official Shop 232486539 recommended items, images, content & promotions
      const currentPromos = await store.all('promotions').catch(() => [])
      if (!currentPromos.some((pr: any) => pr.slug === 'shopee-232486539-recommended-deals')) {
        await commitShopeeCatalogImport(store, {
          url: SHOPEE_SHOP_232486539_META.recommendationUrl,
          importImages: true,
          importContent: true,
          importPromotions: true
        })
        prodUpdated++
      }

      const freshProds = prodUpdated > 0 ? await store.all('products') : prods

      // 4. Seed Dealer's Own Inventory (`dealer_stocks`)
      const existingDealerStocks = await store.all('dealer_stocks').catch(() => [])
      if (existingDealerStocks.length === 0 && freshProds.length > 0) {
        const dlr1 = officerByEmail.get('dealer@opwatch.co.th')
        const dlr2 = officerByEmail.get('dealer-cnx@opwatch.co.th')
        const sampleSkus = freshProds.filter((p) => p.status === 'active').slice(0, 12)
        for (let i = 0; i < sampleSkus.length; i++) {
          const pr = sampleSkus[i]
          if (dlr1) {
            await store.create('dealer_stocks', {
              officerId: Number(dlr1.id),
              dealerCode: dlr1.dealerCode || 'DLR-BKK-01',
              productId: Number(pr.id),
              sku: pr.sku,
              onHand: (i % 5) + 2,
              reserved: i % 3 === 0 ? 1 : 0,
              reorderPoint: 2,
              notes: i % 3 === 0 ? 'ติดจองรับหน้าร้าน 1 เรือน' : 'พร้อมจำหน่ายหน้าตู้โชว์'
            })
          }
          if (dlr2 && i < 6) {
            await store.create('dealer_stocks', {
              officerId: Number(dlr2.id),
              dealerCode: dlr2.dealerCode || 'DLR-CNX-02',
              productId: Number(pr.id),
              sku: pr.sku,
              onHand: (i % 4) + 1,
              reserved: 0,
              reorderPoint: 2,
              notes: 'สต็อกหน้าร้านเชียงใหม่'
            })
          }
        }
      }

      // 5. Seed Online Warranty Registrations (`warranties`) & Watch Repairs (`repairs`)
      const existingWarranties = await store.all('warranties').catch(() => [])
      if (existingWarranties.length === 0) {
        for (const w of defaultWarranties()) {
          await store.create('warranties', w)
        }
      }
      const existingRepairs = await store.all('repairs').catch(() => [])
      if (existingRepairs.length === 0) {
        for (const rep of defaultRepairs()) {
          await store.create('repairs', rep)
        }
      }

      // 5B. Seed Verified Customer Product Reviews (`reviews`)
      const existingReviews = await store.all('reviews').catch(() => [])
      if (existingReviews.length === 0 && freshProds.length > 0) {
        for (const rv of defaultCustomerReviews(freshProds)) {
          await store.create('reviews', rv)
        }
      }

      // 6. Seed Full-Website Hierarchical Tree-Menu CMS (`pages`)
      const existingPages = await store.all('pages').catch(() => [])
      const pageBySlug = new Map<string, any>()
      for (const pg of existingPages) pageBySlug.set(String(pg.slug), pg)

      const treeSeeds = defaultTreePages(freshProds)
      // Pass 1: create root nodes (`parentSlug === null`)
      for (const node of treeSeeds.filter((n) => !n.parentSlug)) {
        if (!pageBySlug.has(node.slug)) {
          const { parentSlug: _ps, ...clean } = node
          const created = await store.create('pages', { ...clean, parentId: null })
          pageBySlug.set(node.slug, created)
        }
      }
      // Pass 2: create child nodes with resolved `parentId`
      for (const node of treeSeeds.filter((n) => Boolean(n.parentSlug))) {
        if (!pageBySlug.has(node.slug)) {
          const parent = pageBySlug.get(String(node.parentSlug))
          const { parentSlug: _ps, ...clean } = node
          const created = await store.create('pages', {
            ...clean,
            parentId: parent ? Number(parent.id) : null
          })
          pageBySlug.set(node.slug, created)
        }
      }
      // Pass 3: nest existing legal pages (`privacy-policy`, `cookie-policy`, `terms-conditions`, `shipping-policy`, `warranty-policy`, `return-policy`) under `legal-center`
      const legalRoot = pageBySlug.get('legal-center')
      if (legalRoot) {
        let orderIdx = 91
        for (const pg of existingPages) {
          if (pg.slug !== 'legal-center' && pg.category === 'legal' && !pg.parentId) {
            await store.update('pages', Number(pg.id), {
              parentId: Number(legalRoot.id),
              pageType: 'legal',
              routePath: pg.routePath || `/pages/${pg.slug}`,
              styleConfig: pg.styleConfig || {
                fontFamily: 'Prompt',
                headingColor: '#ffffff',
                textColor: '#23264d',
                accentColor: '#1d2088',
                bgColor: '#111834',
                overlayOpacity: 0.58,
                headingSize: 'lg'
              },
              sortOrder: orderIdx++
            })
          }
        }
      }

      enterpriseReadyDone = true
    } catch (err) {
      console.error('[opwatch] ensureEnterpriseEntities warning:', err)
    } finally {
      enterprisePromise = null
    }
  })()
  return enterprisePromise
}

/**
 * Ensures an installed store never serves an empty product catalog
 * (e.g. if a previous startup sync was interrupted or worker booted lazily).
 */
export async function ensureCatalogReady(store: Store): Promise<void> {
  if (!isInstalled()) return
  const [prodCount, promoCount, pageCount, eventCount, officerCount] = await Promise.all([
    store.count('products'),
    store.count('promotions').catch(() => 1),
    store.count('pages').catch(() => 1),
    store.count('events').catch(() => 1),
    store.count('officers').catch(() => 0)
  ])
  if (prodCount === 0 || promoCount === 0 || pageCount === 0 || eventCount === 0) {
    await syncOfficialCatalog(store)
  } else if (!enterpriseReadyDone || officerCount === 0) {
    await ensureEnterpriseEntities(store)
  }
}

export async function ensureSeeded(): Promise<void> {
  if (!isInstalled()) return
  await ensureCatalogReady(useStore())
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
