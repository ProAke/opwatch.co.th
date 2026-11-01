import type { Store } from '../db/types'

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
  parentSlug?: string
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

/** Watch face photography used as placeholder imagery for the seeded catalogue. */
const FACES = ['/images/p1.jpg', '/images/p2.jpg', '/images/p3.jpg', '/images/p4.jpg', '/images/p5.jpg', '/images/p6.jpg']

export const defaultBrands = (): SeedBrand[] => [
  {
    slug: 'opwatch',
    name: 'Opwatch',
    nameEn: 'Opwatch',
    nameTh: 'Opwatch',
    country: 'ญี่ปุ่น',
    countryEn: 'Japan',
    movement: 'เครื่องญี่ปุ่น',
    movementEn: 'Japanese movement',
    positioning: 'entry',
    tagline: 'เวลาที่คู่ควร',
    taglineEn: 'Time, beautifully kept',
    story:
      'Opwatch คือนาฬิกาที่ออกแบบในประเทศไทย โดยใช้เครื่องจับเวลาจากญี่ปุ่น ผสานงานฝีมือชั้นสูงกับดีไซน์ร่วมสมัย ราคาเป็นกลาง เหมาะสำหรับคนรุ่นใหม่ที่ต้องการนาฬิกาดีๆ ในราคาที่เอื้อมถึง',
    storyEn:
      'Opwatch is designed in Thailand around Japanese movements, pairing refined craftsmanship with contemporary design. Honest pricing for a first real watch.',
    accentColor: '#b98a44',
    logo: '/images/c-men.jpg',
    heroImage: '/images/hero-watch.jpg',
    sortOrder: 1,
    active: true
  },
  {
    slug: 'olympianus',
    name: 'Olympinus',
    nameEn: 'Olympinus',
    nameTh: 'Olympinus',
    country: 'สวิตเซอร์แลนด์',
    countryEn: 'Switzerland',
    movement: 'เครื่องสวิส',
    movementEn: 'Swiss movement',
    positioning: 'mid',
    tagline: 'ความสง่างามเหนือกาลเวลา',
    taglineEn: 'Elegance beyond time',
    story:
      'Olympinus เป็นแบรนด์นาฬิกาสวิสที่สะท้อนความสง่างามเหนือกาลเวลา ด้วยความเที่ยงตรงและงานฝีมืออันประณีต พิถีพิถันในทุกขั้นตอนการผลิต ตั้งแต่ตัวเรือนไปจนถึงเครื่องจับเวลา',
    storyEn:
      'A Swiss watchmaker built on precision and patience. Olympinus timepieces carry the craft of the Swiss Jura from case to movement.',
    accentColor: '#2f5d50',
    logo: '/images/c-men.jpg',
    heroImage: '/images/p3.jpg',
    sortOrder: 2,
    active: true
  },
  {
    slug: 'ogival',
    name: 'Ogival',
    nameEn: 'Ogival',
    nameTh: 'Ogival',
    country: 'สวิตเซอร์แลนด์',
    countryEn: 'Switzerland',
    movement: 'เครื่องสวิส',
    movementEn: 'Swiss movement',
    positioning: 'premium',
    tagline: '百年瑞士奢華腕錶',
    taglineEn: 'A century of Swiss luxury',
    story:
      'Ogival ก่อตั้งในปี 1903 ณ สวิตเซอร์แลนด์ ด้วยสัญลักษณ์ปลากระโดด สู่นาฬิกาลักชัวรีที่สืบทอดความงามแห่งกาลเวลา การันตีด้วยงานจิวเวลรี่และเพชรที่รังสรรค์ด้วยมือ',
    storyEn:
      'Founded in Switzerland in 1903 under the symbol of a leaping fish, Ogival is a century of luxury watchmaking — hand-set jewellery, diamonds and mechanical artistry.',
    accentColor: '#6b4a8a',
    logo: '/images/c-ladies.jpg',
    heroImage: '/images/p5.jpg',
    sortOrder: 3,
    active: true
  }
]

export const defaultCategories = (): SeedCategory[] => [
  {
    slug: 'watches-jewelry',
    name: 'นาฬิกาและจิวเวลรี่',
    nameEn: 'Watches & Jewelry',
    nameTh: 'นาฬิกาและจิวเวลรี่',
    description: 'แหล่งรวมนาฬิกาและเครื่องประดับลักชัวรีจากแบรนด์ดัง',
    descriptionEn: 'A destination for luxury watches and fine jewellery.',
    descriptionTh: 'แหล่งรวมนาฬิกาและเครื่องประดับลักชัวรีจากแบรนด์ดัง',
    image: '/images/c-men.jpg',
    icon: '/images/c-men.jpg',
    bannerImage: '/images/hero-watch.jpg',
    sortOrder: 1,
    parentSlug: null
  },
  {
    slug: 'men-watches',
    name: 'นาฬิกาผู้ชาย',
    nameEn: "Men's Watches",
    nameTh: 'นาฬิกาผู้ชาย',
    description: 'นาฬิกาสำหรับสุภาพบุรุษ',
    descriptionEn: 'Timepieces for men.',
    descriptionTh: 'นาฬิกาสำหรับสุภาพบุรุษ',
    image: '/images/p1.jpg',
    icon: '/images/p1.jpg',
    bannerImage: '/images/c-men.jpg',
    sortOrder: 1,
    parentSlug: 'watches-jewelry'
  },
  {
    slug: 'women-watches',
    name: 'นาฬิกาผู้หญิง',
    nameEn: "Women's Watches",
    nameTh: 'นาฬิกาผู้หญิง',
    description: 'นาฬิกาสำหรับสุภาพสตรี',
    descriptionEn: 'Timepieces for women.',
    descriptionTh: 'นาฬิกาสำหรับสุภาพสตรี',
    image: '/images/p2.jpg',
    icon: '/images/p2.jpg',
    bannerImage: '/images/c-ladies.jpg',
    sortOrder: 2,
    parentSlug: 'watches-jewelry'
  },
  {
    slug: 'kids-watches',
    name: 'นาฬิกาเด็ก',
    nameEn: "Kid's Watches",
    nameTh: 'นาฬิกาเด็ก',
    description: 'นาฬิกาสำหรับเด็ก',
    descriptionEn: 'Timepieces for kids.',
    descriptionTh: 'นาฬิกาสำหรับเด็ก',
    image: '/images/p4.jpg',
    icon: '/images/p4.jpg',
    bannerImage: '/images/p4.jpg',
    sortOrder: 3,
    parentSlug: 'watches-jewelry'
  },
  {
    slug: 'sport-watches',
    name: 'นาฬิกาสปอร์ต',
    nameEn: 'Sport Watches',
    nameTh: 'นาฬิกาสปอร์ต',
    description: 'นาฬิกาสปอร์ตทนทาน',
    descriptionEn: 'Rugged sport timepieces.',
    descriptionTh: 'นาฬิกาสปอร์ตทนทาน',
    image: '/images/p6.jpg',
    icon: '/images/p6.jpg',
    bannerImage: '/images/c-sport.jpg',
    sortOrder: 4,
    parentSlug: 'watches-jewelry'
  },
  {
    slug: 'classic-watches',
    name: 'นาฬิกาคลาสสิก',
    nameEn: 'Classic Watches',
    nameTh: 'นาฬิกาคลาสสิก',
    description: 'นาฬิกาคลาสสิกเหนือกาลเวลา',
    descriptionEn: 'Timeless classic timepieces.',
    descriptionTh: 'นาฬิกาคลาสสิกเหนือกาลเวลา',
    image: '/images/p3.jpg',
    icon: '/images/p3.jpg',
    bannerImage: '/images/c-men.jpg',
    sortOrder: 5,
    parentSlug: 'watches-jewelry'
  },
  {
    slug: 'men-jewelry',
    name: 'จิวเวลรี่ผู้ชาย',
    nameEn: "Men's Jewelry",
    nameTh: 'จิวเวลรี่ผู้ชาย',
    description: 'เครื่องประดับสำหรับสุภาพบุรุษ',
    descriptionEn: 'Jewellery for men.',
    descriptionTh: 'เครื่องประดับสำหรับสุภาพบุรุษ',
    image: '/images/p5.jpg',
    icon: '/images/p5.jpg',
    bannerImage: '/images/p5.jpg',
    sortOrder: 6,
    parentSlug: 'watches-jewelry'
  },
  {
    slug: 'women-jewelry',
    name: 'จิวเวลรี่ผู้หญิง',
    nameEn: "Women's Jewelry",
    nameTh: 'จิวเวลรี่ผู้หญิง',
    description: 'เครื่องประดับสำหรับสุภาพสตรี',
    descriptionEn: 'Jewellery for women.',
    descriptionTh: 'เครื่องประดับสำหรับสุภาพสตรี',
    image: '/images/p2.jpg',
    icon: '/images/p2.jpg',
    bannerImage: '/images/c-ladies.jpg',
    sortOrder: 7,
    parentSlug: 'watches-jewelry'
  }
]

export const defaultProducts = (): SeedProduct[] => {
  const mk = (
    sku: string,
    name: string,
    nameEn: string,
    nameTh: string,
    categorySlug: string,
    brandSlug: string,
    price: number,
    originalPrice: number | null,
    stock: number,
    badges: string[],
    sortOrder: number,
    shortDescription: string,
    shortDescriptionEn: string,
    descriptionTh: string,
    descriptionEn: string,
    specs: Record<string, string>
  ): SeedProduct => ({
    sku, name, nameEn, nameTh, slug: sku.toLowerCase(), categorySlug, brandSlug,
    price, originalPrice, currency: 'THB',
    images: [
      FACES[sortOrder % FACES.length],
      FACES[(sortOrder + 2) % FACES.length],
      categorySlug === 'women-watches' || categorySlug === 'women-jewelry'
        ? '/images/c-ladies.jpg'
        : categorySlug === 'sport-watches'
          ? '/images/c-sport.jpg'
          : '/images/hero-watch.jpg'
    ],
    shortDescription, shortDescriptionEn: shortDescriptionEn,
    description: descriptionEn, descriptionEn: descriptionEn, descriptionTh: descriptionTh,
    specs, stock, status: 'active', badges, featured: badges.includes('NEW'), sortOrder
  })

  return [
    // ── Opwatch · Japanese movement · entry–mid ──────────────────────────
    mk('OW-M1001', 'Lumen Automatic 40', 'Lumen Automatic 40', 'ลูเมน ออโตเมติก 40',
      'men-watches', 'opwatch', 18900, 22900, 24, ['SALE'], 1,
      'ออโตเมติก 40 มม. หน้าปัดลูเมน', 'Automatic 40mm, luminous dial',
      'นาฬิกาออโตเมติกขนาด 40 มม. หน้าปัดส่องแสงในที่มืด ตัวเรือนสตีล สายสเตลลิส',
      'An automatic 40mm timepiece with a luminous dial and brushed steel case.',
      { 'ตัวเรือน': 'สตีล 40 มม.', 'เครื่อง': 'ออโตเมติกญี่ปุ่น', 'กระจก': 'Crystal', 'กันน้ำ': '50 ม.' }),
    mk('OW-M1002', 'Meridian Chronograph', 'Meridian Chronograph', 'เมอริเดียน โครโนกราฟ',
      'men-watches', 'opwatch', 24500, null, 18, ['NEW'], 2,
      'โครโนกราฟ 3 ตา กันน้ำ 100 ม.', 'Tri-compax chronograph, 100m',
      'โครโนกราฟ 3 ตา กันน้ำ 100 เมตร สายสเตลลิส',
      'A tri-compax chronograph rated to 100 metres.',
      { 'ตัวเรือน': 'สตีล 42 มม.', 'เครื่อง': 'quartz ญี่ปุ่น', 'กระจก': 'Crystal', 'กันน้ำ': '100 ม.' }),
    mk('OW-L2001', 'Petite Rose 28', 'Petite Rose 28', 'เปติต โรส 28',
      'women-watches', 'opwatch', 16400, 19900, 30, ['SALE'], 3,
      '28 มม. โรสโกลด์ สายเรซิ่น', '28mm rose gold, resin strap',
      'นาฬิกาสตรี 28 มม. โรสโกลด์ สายเรซิ่น',
      'A 28mm rose-gold dress watch on a resin strap.',
      { 'ตัวเรือน': 'โรสโกลด์ 28 มม.', 'เครื่อง': 'quartz ญี่ปุ่น', 'กระจก': 'Crystal', 'กันน้ำ': '30 ม.' }),
    mk('OW-L2002', 'Essence Minimal 30', 'Essence Minimal 30', 'เอสเซนซ์ มินิมอล 30',
      'women-watches', 'opwatch', 12900, null, 26, [], 4,
      '30 มม. มินิมอล หน้าปัดขาว', '30mm minimal, white dial',
      'นาฬิกาสตรีมินิมอล 30 มม. หน้าปัดขาว',
      'A minimalist 30mm white-dial watch.',
      { 'ตัวเรือน': 'สตีล 30 มม.', 'เครื่อง': 'quartz ญี่ปุ่น', 'กระจก': 'Crystal', 'กันน้ำ': '30 ม.' }),
    mk('OW-S3001', 'Abyss Diver 40', 'Abyss Diver 40', 'แอบบิส ไดเวอร์ 40',
      'sport-watches', 'opwatch', 21500, 25900, 15, ['SALE'], 5,
      'ไดเวอร์ 200 ม. สายสเตลลิส', 'Diver to 200m, steel bracelet',
      'นาฬิกาไดเวอร์กันน้ำ 200 เมตร',
      'A dive watch rated to 200 metres.',
      { 'ตัวเรือน': 'สตีล 40 มม.', 'เครื่อง': 'automatic ญี่ปุ่น', 'กระจก': 'Crystal', 'กันน้ำ': '200 ม.' }),
    mk('OW-C4001', 'Heritage Dress 38', 'Heritage Dress 38', 'เฮริเทจ เดรส 38',
      'classic-watches', 'opwatch', 23900, 27900, 20, ['SALE'], 6,
      'เดรส 38 มม. สายหนัง', 'Dress 38mm, leather strap',
      'นาฬิกาเดรสคลาสสิก 38 มม. สายหนัง',
      'A classic dress watch on leather, 38mm.',
      { 'ตัวเรือน': 'ทองเหลือง 38 มม.', 'เครื่อง': 'automatic ญี่ปุ่น', 'กระจก': 'Crystal', 'กันน้ำ': '50 ม.' }),
    mk('OW-K1001', 'Little Star 26', 'Little Star 26', 'ลิตเติล สตาร์ 26',
      'kids-watches', 'opwatch', 6900, 8900, 40, ['SALE'], 7,
      '26 มม. สำหรับเด็ก กันน้ำ', '26mm kids, water resistant',
      'นาฬิกาเด็ก 26 มม. กันน้ำ',
      'A 26mm water-resistant watch for kids.',
      { 'ตัวเรือน': 'เรซิ่น 26 มม.', 'เครื่อง': 'quartz ญี่ปุ่น', 'กันน้ำ': '30 ม.' }),

    // ── Olympinus · Swiss movement · mid–high ───────────────────────────
    mk('OL-M2001', 'Meridian Automatic 40', 'Meridian Automatic 40', 'เมอริเดียน ออโตเมติก 40',
      'men-watches', 'olympianus', 58900, null, 12, ['NEW'], 8,
      'ออโตเมติกสวิส 40 มม. สตีล', 'Swiss automatic, 40mm steel',
      'นาฬิกาออโตเมติกสวิส 40 มม. ตัวเรือนสตีล',
      'A Swiss automatic, 40mm, in brushed steel.',
      { 'ตัวเรือน': 'สตีล 40 มม.', 'เครื่อง': 'Swiss automatic', 'กระจก': 'Sapphire', 'กันน้ำ': '100 ม.' }),
    mk('OL-M2002', 'Aurora Chronograph 42', 'Aurora Chronograph 42', 'ออโรรา โครโนกราฟ 42',
      'men-watches', 'olympianus', 72500, 89000, 9, ['SALE'], 9,
      'โครโนกราฟสวิส 42 มม.', 'Swiss chronograph, 42mm',
      'โครโนกราฟสวิส 42 มม. สายสเตลลิส',
      'A Swiss chronograph, 42mm.',
      { 'ตัวเรือน': 'สตีล 42 มม.', 'เครื่อง': 'Swiss chronograph', 'กระจก': 'Sapphire', 'กันน้ำ': '100 ม.' }),
    mk('OL-L3001', 'Liora Pearl 28', 'Liora Pearl 28', 'ลิโอร่า เพิร์ล 28',
      'women-watches', 'olympianus', 45900, null, 14, [], 10,
      '28 มม. สายเพิร์ล', '28mm, pearl strap',
      'นาฬิกาสตรี 28 มม. สายเพิร์ล',
      'A 28mm watch on a pearl strap.',
      { 'ตัวเรือน': 'โรสโกลด์ 28 มม.', 'เครื่อง': 'Swiss quartz', 'กระจก': 'Sapphire', 'กันน้ำ': '30 ม.' }),
    mk('OL-L3002', 'Selene Minimal 30', 'Selene Minimal 30', 'เซลีน มินิมอล 30',
      'women-watches', 'olympianus', 39000, 46000, 16, ['SALE'], 11,
      '30 มม. มินิมอล', '30mm minimal',
      'นาฬิกาสตรีมินิมอล 30 มม.',
      'A minimalist 30mm watch.',
      { 'ตัวเรือน': 'สตีล 30 มม.', 'เครื่อง': 'Swiss quartz', 'กระจก': 'Sapphire', 'กันน้ำ': '30 ม.' }),
    mk('OL-S4001', 'Vertex Diver 41', 'Vertex Diver 41', 'เวอร์ติซ์ ไดเวอร์ 41',
      'sport-watches', 'olympianus', 68000, 82000, 8, ['SALE'], 12,
      'ไดเวอร์สวิส 300 ม.', 'Swiss diver, 300m',
      'นาฬิกาไดเวอร์สวิสกันน้ำ 300 เมตร',
      'A Swiss diver rated to 300 metres.',
      { 'ตัวเรือน': 'สตีล 41 มม.', 'เครื่อง': 'Swiss automatic', 'กระจก': 'Sapphire', 'กันน้ำ': '300 ม.' }),
    mk('OL-C5001', 'Heritage Gold 38', 'Heritage Gold 38', 'เฮริเทจ โกลด์ 38',
      'classic-watches', 'olympianus', 95000, null, 6, ['NEW'], 13,
      'เดรสทอง 38 มม. สายหนัง', 'Gold dress, 38mm leather',
      'นาฬิกาเดรสทองคำ 38 มม. สายหนัง',
      'A gold dress watch, 38mm, on leather.',
      { 'ตัวเรือน': 'ทอง 38 มม.', 'เครื่อง': 'Swiss automatic', 'กระจก': 'Sapphire', 'กันน้ำ': '50 ม.' }),

    // ── Ogival · Swiss luxury · high-end ────────────────────────────────
    mk('OG-M6001', 'Meteor Tourbillon 40', 'Meteor Tourbillon 40', 'เมทีเออร์ ทัวร์บิロン 40',
      'men-watches', 'ogival', 388000, null, 4, ['NEW'], 14,
      'ทัวร์บิロン สวิส 40 มม.', 'Swiss tourbillon, 40mm',
      'นาฬิกาทัวร์บิロンสวิส 40 มม. ตัวเรือนทอง',
      'A Swiss tourbillon in a 40mm gold case.',
      { 'ตัวเรือน': 'ทอง 40 มม.', 'เครื่อง': 'Swiss tourbillon', 'กระจก': 'Sapphire', 'กันน้ำ': '30 ม.' }),
    mk('OG-M6002', 'Aurora Diamond 41', 'Aurora Diamond 41', 'ออโรรา ไดมอนด์ 41',
      'men-jewelry', 'ogival', 458000, null, 3, ['NEW'], 15,
      'โครโนกราฟเพชร 41 มม.', 'Diamond chronograph, 41mm',
      'นาฬิกาโครโนกราฟประดับเพชร 41 มม.',
      'A diamond-set chronograph, 41mm.',
      { 'ตัวเรือน': 'ทองขาว 41 มม.', 'เครื่อง': 'Swiss chronograph', 'เพชร': '1.2 กะรัต', 'กันน้ำ': '50 ม.' }),
    mk('OG-L7001', 'Liora Jewel 28', 'Liora Jewel 28', 'ลิโอร่า จูเอล 28',
      'women-jewelry', 'ogival', 268000, 315000, 7, ['SALE'], 16,
      'จิวเวลรี่เพชร 28 มม.', 'Diamond jewellery watch, 28mm',
      'นาฬิกาจิวเวลรี่ประดับเพชร 28 มม.',
      'A diamond jewellery watch, 28mm.',
      { 'ตัวเรือน': 'ทอง 28 มม.', 'เครื่อง': 'Swiss quartz', 'เพชร': '2.0 กะรัต', 'กันน้ำ': '30 ม.' }),
    mk('OG-L7002', 'Selene Pearl 30', 'Selene Pearl 30', 'เซลีน เพิร์ล 30',
      'women-jewelry', 'ogival', 198000, null, 9, [], 17,
      'จิวเวลรี่เพิร์ล 30 มม.', 'Pearl jewellery watch, 30mm',
      'นาฬิกาจิวเวลรี่มุก 30 มม.',
      'A pearl jewellery watch, 30mm.',
      { 'ตัวเรือน': 'ทอง 30 มม.', 'เครื่อง': 'Swiss quartz', 'มุก': 'น้ำจืด', 'กันน้ำ': '30 ม.' }),
    mk('OG-S8001', 'Vertex Grand 41', 'Vertex Grand 41', 'เวอร์ติซ์ แกรนด์ 41',
      'sport-watches', 'ogival', 328000, null, 5, [], 18,
      'แกรนด์ โครโน 41 มม.', 'Grand chrono, 41mm',
      'นาฬิกาแกรนด์โครโนกราฟ 41 มม.',
      'A grand chronograph, 41mm.',
      { 'ตัวเรือน': 'สตีล 41 มม.', 'เครื่อง': 'Swiss grand chronograph', 'กระจก': 'Sapphire', 'กันน้ำ': '100 ม.' }),
    mk('OG-K9001', 'Little Star 26', 'Little Star 26', 'ลิตเติล สตาร์ 26',
      'kids-watches', 'ogival', 98000, null, 10, ['NEW'], 19,
      'จิวเวลรี่เด็ก 26 มม.', 'Kids jewellery watch, 26mm',
      'นาฬิกาจิวเวลรี่สำหรับเด็ก 26 มม.',
      'A jewellery watch for kids, 26mm.',
      { 'ตัวเรือน': 'ทอง 26 มม.', 'เครื่อง': 'Swiss quartz', 'กันน้ำ': '30 ม.' })
  ]
}

export const defaultCampaigns = (): SeedCampaign[] => [
  {
    slug: 'anniversary',
    title: '79TH ANNIVERSARY',
    titleEn: '79TH ANNIVERSARY',
    titleTh: '79 ปี Central',
    subtitle: 'ช้อปเพลินกับดีลพิเศษส่งท้ายเดือน พร้อมคูปองลดเพิ่ม ฿500',
    subtitleEn: 'End-of-month deals with an extra ฿500 coupon.',
    subtitleTh: 'ช้อปเพลินกับดีลพิเศษส่งท้ายเดือน',
    banner: '/images/hero-watch.jpg',
    link: '/',
    brandSlug: null,
    type: 'hero',
    sortOrder: 1,
    active: true
  },
  {
    slug: 'opwatch-brand-day',
    title: 'BRAND DAY: OPWATCH',
    titleEn: 'BRAND DAY: OPWATCH',
    titleTh: 'BRAND DAY: OPWATCH',
    subtitle: 'เครื่องญี่ปุ่น ราคาเอื้อมถึง',
    subtitleEn: 'Japanese movements, honest pricing.',
    subtitleTh: 'เครื่องญี่ปุ่น ราคาเอื้อมถึง',
    banner: '/images/p1.jpg',
    link: '/opwatch',
    brandSlug: 'opwatch',
    type: 'brand-day',
    sortOrder: 1,
    active: true
  },
  {
    slug: 'olympianus-brand-day',
    title: 'SUPER BRAND DAY: OLYMPINUS',
    titleEn: 'SUPER BRAND DAY: OLYMPINUS',
    titleTh: 'SUPER BRAND DAY: OLYMPINUS',
    subtitle: 'เครื่องสวิส ความสง่างามเหนือกาลเวลา',
    subtitleEn: 'Swiss craft, elegance beyond time.',
    subtitleTh: 'เครื่องสวิส ความสง่างามเหนือกาลเวลา',
    banner: '/images/p3.jpg',
    link: '/olympianus',
    brandSlug: 'olympianus',
    type: 'brand-day',
    sortOrder: 2,
    active: true
  },
  {
    slug: 'ogival-brand-day',
    title: 'BRAND DAY: OGIVAL',
    titleEn: 'BRAND DAY: OGIVAL',
    titleTh: 'BRAND DAY: OGIVAL',
    subtitle: '百年瑞士奢華腕錶 1903',
    subtitleEn: 'A century of Swiss luxury since 1903.',
    subtitleTh: '百年瑞士奢華腕錶 1903',
    banner: '/images/p5.jpg',
    link: '/ogival',
    brandSlug: 'ogival',
    type: 'brand-day',
    sortOrder: 3,
    active: true
  },
  {
    slug: 'watches-spotlight',
    title: 'TREND SPOTLIGHT',
    titleEn: 'TREND SPOTLIGHT',
    titleTh: 'TREND SPOTLIGHT',
    subtitle: 'นาฬิกาและจิวเวลรี่จากแบรนด์ดัง',
    subtitleEn: 'Watches and jewellery from leading brands.',
    subtitleTh: 'นาฬิกาและจิวเวลรี่จากแบรนด์ดัง',
    banner: '/images/c-men.jpg',
    link: '/watches',
    brandSlug: null,
    type: 'category',
    sortOrder: 4,
    active: true
  },
  {
    slug: 'luxury-gift',
    title: 'LUXURY GIFT',
    titleEn: 'LUXURY GIFT',
    titleTh: 'LUXURY GIFT',
    subtitle: 'ของขวัญลักชัวรีสำหรับโอกาสพิเศษ',
    subtitleEn: 'Luxury gifts for special occasions.',
    subtitleTh: 'ของขวัญลักชัวรีสำหรับโอกาสพิเศษ',
    banner: '/images/c-ladies.jpg',
    link: '/ogival',
    brandSlug: 'ogival',
    type: 'event',
    sortOrder: 5,
    active: true
  }
]

export async function seedStore(
  store: Store,
  opts: { reset?: boolean } = {}
): Promise<void> {
  const { defaultBrands, defaultCategories, defaultProducts, defaultCampaigns } = await import('./seed')
  if (opts.reset && store.driver === 'json') {
    (store as any).reset?.()
  }

  const brands = defaultBrands()
  const categories = defaultCategories()
  const products = defaultProducts()
  const campaigns = defaultCampaigns()

  // Brands
  const existingBrands = await store.all('brands')
  const brandMap = new Map<string, number>()
  if (existingBrands.length === 0) {
    for (const b of brands) {
      const row = await store.create('brands', {
        slug: b.slug, name: b.name, nameEn: b.nameEn, nameTh: b.nameTh,
        country: b.country, countryEn: b.countryEn,
        movement: b.movement, movementEn: b.movementEn,
        positioning: b.positioning, tagline: b.tagline, taglineEn: b.taglineEn,
        story: b.story, storyEn: b.storyEn,
        accentColor: b.accentColor, logo: b.logo, heroImage: b.heroImage,
        sortOrder: b.sortOrder, active: b.active
      })
      brandMap.set(b.slug, Number(row.id))
    }
  } else {
    for (const b of existingBrands) brandMap.set(b.slug as string, Number(b.id))
  }

  // Categories (parents first so parentId can resolve)
  const existingCats = await store.all('categories')
  const catMap = new Map<string, number>()
  const ordered = [...categories].sort((a, b) => (a.parentSlug ? 1 : 0) - (b.parentSlug ? 1 : 0))
  if (existingCats.length === 0) {
    for (const c of ordered) {
      const parentId = c.parentSlug ? (catMap.get(c.parentSlug) ?? null) : null
      const row = await store.create('categories', {
        slug: c.slug, name: c.name, nameEn: c.nameEn, nameTh: c.nameTh,
        description: c.description, descriptionEn: c.descriptionEn, descriptionTh: c.descriptionTh,
        image: c.image, icon: c.icon, bannerImage: c.bannerImage,
        sortOrder: c.sortOrder, parentId
      })
      catMap.set(c.slug, Number(row.id))
    }
  } else {
    for (const c of existingCats) catMap.set(c.slug as string, Number(c.id))
  }

  // Products
  const existingProducts = await store.all('products')
  if (existingProducts.length === 0) {
    for (const p of products) {
      await store.create('products', {
        sku: p.sku, name: p.name, nameEn: p.nameEn, nameTh: p.nameTh, slug: p.slug,
        brandId: brandMap.get(p.brandSlug) ?? null,
        brand: p.brandSlug,
        categoryId: catMap.get(p.categorySlug) ?? null,
        price: p.price, originalPrice: p.originalPrice, currency: p.currency,
        images: p.images, shortDescription: p.shortDescription,
        description: p.description, descriptionEn: p.descriptionEn, descriptionTh: p.descriptionTh,
        specs: p.specs, stock: p.stock, status: p.status,
        badges: p.badges, featured: p.featured, sortOrder: p.sortOrder
      })
    }
  }

  // Campaigns
  const existingCampaigns = await store.all('campaigns')
  if (existingCampaigns.length === 0) {
    for (const c of campaigns) {
      await store.create('campaigns', {
        slug: c.slug, title: c.title, titleEn: c.titleEn, titleTh: c.titleTh,
        subtitle: c.subtitle, subtitleEn: c.subtitleEn, subtitleTh: c.subtitleTh,
        banner: c.banner, link: c.link,
        brandId: c.brandSlug ? (brandMap.get(c.brandSlug) ?? null) : null,
        type: c.type, sortOrder: c.sortOrder, active: c.active
      })
    }
  }
}
