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

/** Authentic Olym Pianus / Opwatch studio cutout + dark obsidian stone hover pairs */
const STUDIO_PAIRS: [string, string, string][] = [
  ['/images/op/watch-990-083-blue.png', '/images/op/portrait-8934msk.jpg', '/images/op/lifestyle-men.jpg'],
  ['/images/op/watch-899831-green.png', '/images/op/square-diver-glow.jpg', '/images/op/banner-899832ags.jpg'],
  ['/images/op/watch-130-06-white.png', '/images/op/hero-gold-stones.jpg', '/images/op/lifestyle-lady.jpg'],
  ['/images/op/watch-990-45-lady.png', '/images/op/lifestyle-lady.jpg', '/images/op/square-gold-stones.jpg'],
  ['/images/op/watch-899833-black.png', '/images/op/portrait-diver.jpg', '/images/op/lifestyle-sport.jpg'],
  ['/images/op/watch-990-083-white.png', '/images/op/portrait-99141agnsk.jpg', '/images/op/openheart-stones.jpg'],
  ['/images/op/watch-130-06-black.png', '/images/op/portrait-82671m.jpg', '/images/op/hero-ceramic-dark.jpg'],
  ['/images/op/watch-990-163-black.png', '/images/op/portrait-8909amk.jpg', '/images/op/lifestyle-men.jpg'],
  ['/images/op/watch-82672-lady.png', '/images/op/hero-ceramic-dark.jpg', '/images/op/portrait-82671m.jpg'],
  ['/images/op/cutout-130-gold.jpg', '/images/op/square-gold-stones.jpg', '/images/op/hero-gold-stones.jpg']
]

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
      'Opwatch ผสานแรงบันดาลใจจากจิตวิญญาณโอลิมปิกเข้ากับเครื่องจักรกลและควอตซ์คุณภาพสูงจากประเทศญี่ปุ่น กระจกแซฟไฟร์ป้องกันรอยขีดข่วน และงานขัดแต่งตัวเรือนสุดประณีตในราคาที่เข้าถึงได้จริง',
    storyEn:
      'Opwatch fuses Olympic-inspired design heritage with dependable Japanese movements, scratch-resistant sapphire crystal, and refined surgical-steel finishing.',
    accentColor: '#c5a46d',
    logo: '/images/op/watch-990-083-blue.png',
    heroImage: '/images/op/hero-gold-stones.jpg',
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
      'Olympinus สะท้อนมรดกแห่งศาสตร์เรือนเวลาสวิส ภายใต้คำขวัญ Faster, Higher, Stronger พิถีพิถันในทุกขั้นตอนตั้งแต่กระจกแซฟไฟร์ไปจนถึงกลไกความเที่ยงตรงสูง',
    storyEn:
      'Rooted in Swiss watchmaking tradition and inspired by the Olympic motto "Faster, Higher, Stronger", Olympinus unites precision engineering with timeless prestige.',
    accentColor: '#c5a46d',
    logo: '/images/op/watch-990-083-white.png',
    heroImage: '/images/op/banner-899832ags.jpg',
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
    tagline: 'ตำนานเรือนเวลาหรูสวิสตั้งแต่ปี 1903',
    taglineEn: 'A century of Swiss luxury since 1903',
    story:
      'Ogival ก่อตั้งในปี 1903 ณ ประเทศสวิตเซอร์แลนด์ ภายใต้สัญลักษณ์ปลากระโดดแห่งความโชคดี รังสรรค์นาฬิกาลักชัวรีประดับเพชรและกลไกชั้นสูงด้วยงานฝีมือระดับมาสเตอร์',
    storyEn:
      'Founded in La Chaux-de-Fonds, Switzerland in 1903 under the emblem of the lucky leaping fish, Ogival crafts haute-horlogerie diamond and mechanical timepieces.',
    accentColor: '#c5a46d',
    logo: '/images/op/watch-82672-lady.png',
    heroImage: '/images/op/hero-ceramic-dark.jpg',
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
    description: 'เรือนเวลาสำหรับสุภาพบุรุษ ดีไซน์ภูมิฐานและทรงพลัง',
    descriptionEn: 'Mechanical & quartz timepieces crafted for discerning gentlemen.',
    descriptionTh: 'เรือนเวลาสำหรับสุภาพบุรุษ ดีไซน์ภูมิฐานและทรงพลัง',
    image: '/images/op/watch-990-083-blue.png',
    icon: '/images/op/watch-990-083-blue.png',
    bannerImage: '/images/op/lifestyle-men.jpg',
    sortOrder: 1,
    parentSlug: 'watches-jewelry'
  },
  {
    slug: 'women-watches',
    name: 'นาฬิกาผู้หญิง',
    nameEn: 'Ladies Watch',
    nameTh: 'นาฬิกาผู้หญิง',
    description: 'ความงดงามอ่อนช้อยบนข้อมือสุภาพสตรี',
    descriptionEn: 'Refined proportions, mother-of-pearl dials, and radiant detailing.',
    descriptionTh: 'ความงดงามอ่อนช้อยบนข้อมือสุภาพสตรี',
    image: '/images/op/watch-990-45-lady.png',
    icon: '/images/op/watch-990-45-lady.png',
    bannerImage: '/images/op/lifestyle-lady.jpg',
    sortOrder: 2,
    parentSlug: 'watches-jewelry'
  },
  {
    slug: 'sport-watches',
    name: 'นาฬิกาสปอร์ต',
    nameEn: 'Sport Watch',
    nameTh: 'นาฬิกาสปอร์ต',
    description: 'สปอร์ตสมรรถนะสูง พรายน้ำสว่างคมชัด กันน้ำลึก',
    descriptionEn: 'Super-luminous indices, rotating bezels, and rugged water resistance.',
    descriptionTh: 'สปอร์ตสมรรถนะสูง พรายน้ำสว่างคมชัด กันน้ำลึก',
    image: '/images/op/watch-899831-green.png',
    icon: '/images/op/watch-899831-green.png',
    bannerImage: '/images/op/lifestyle-sport.jpg',
    sortOrder: 3,
    parentSlug: 'watches-jewelry'
  },
  {
    slug: 'classic-watches',
    name: 'นาฬิกาคลาสสิก',
    nameEn: 'Classic Watch',
    nameTh: 'นาฬิกาคลาสสิก',
    description: 'คลาสสิกเหนือกาลเวลา สง่างามในทุกโอกาสสำคัญ',
    descriptionEn: 'Timeless dress silhouettes and open-heart mechanical artistry.',
    descriptionTh: 'คลาสสิกเหนือกาลเวลา สง่างามในทุกโอกาสสำคัญ',
    image: '/images/op/watch-990-083-white.png',
    icon: '/images/op/watch-990-083-white.png',
    bannerImage: '/images/op/hero-gold-stones.jpg',
    sortOrder: 4,
    parentSlug: 'watches-jewelry'
  },
  {
    slug: 'kids-watches',
    name: 'นาฬิกาเด็ก',
    nameEn: "Kid's Watches",
    nameTh: 'นาฬิกาเด็ก',
    description: 'นาฬิกาขนาดกะทัดรัด น้ำหนักเบา สวมใส่สบาย',
    descriptionEn: 'Compact lightweight timepieces for young wrists.',
    descriptionTh: 'นาฬิกาขนาดกะทัดรัด น้ำหนักเบา สวมใส่สบาย',
    image: '/images/op/watch-130-06-white.png',
    icon: '/images/op/watch-130-06-white.png',
    bannerImage: '/images/op/hero-gold-stones.jpg',
    sortOrder: 5,
    parentSlug: 'watches-jewelry'
  },
  {
    slug: 'men-jewelry',
    name: 'จิวเวลรี่ผู้ชาย',
    nameEn: "Men's Jewelry Watch",
    nameTh: 'จิวเวลรี่ผู้ชาย',
    description: 'เรือนเวลาประดับเพชรแท้ระดับมาสเตอร์พีซสำหรับสุภาพบุรุษ',
    descriptionEn: 'Diamond-set luxury timepieces for men.',
    descriptionTh: 'เรือนเวลาประดับเพชรแท้ระดับมาสเตอร์พีซสำหรับสุภาพบุรุษ',
    image: '/images/op/watch-990-163-black.png',
    icon: '/images/op/watch-990-163-black.png',
    bannerImage: '/images/op/hero-ceramic-dark.jpg',
    sortOrder: 6,
    parentSlug: 'watches-jewelry'
  },
  {
    slug: 'women-jewelry',
    name: 'จิวเวลรี่ผู้หญิง',
    nameEn: "Women's Jewelry Watch",
    nameTh: 'จิวเวลรี่ผู้หญิง',
    description: 'เรือนเวลาประดับเพชรและเซรามิกหรูสำหรับสุภาพสตรี',
    descriptionEn: 'Diamond and ceramic jewellery watches for women.',
    descriptionTh: 'เรือนเวลาประดับเพชรและเซรามิกหรูสำหรับสุภาพสตรี',
    image: '/images/op/watch-82672-lady.png',
    icon: '/images/op/watch-82672-lady.png',
    bannerImage: '/images/op/hero-ceramic-dark.jpg',
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
    pairIdx: number,
    shortDescription: string,
    shortDescriptionEn: string,
    descriptionTh: string,
    descriptionEn: string,
    specs: Record<string, string>
  ): SeedProduct => {
    const pair = STUDIO_PAIRS[pairIdx % STUDIO_PAIRS.length]
    return {
      sku,
      name,
      nameEn,
      nameTh,
      slug: sku.toLowerCase(),
      categorySlug,
      brandSlug,
      price,
      originalPrice,
      currency: 'THB',
      images: [pair[0], pair[1], pair[2]],
      shortDescription,
      shortDescriptionEn,
      description: descriptionEn,
      descriptionEn,
      descriptionTh,
      specs,
      stock,
      status: 'active',
      badges,
      featured: badges.includes('NEW') || sortOrder <= 6,
      sortOrder
    }
  }

  return [
    // ── Opwatch · Japanese movement · entry–mid ──────────────────────────
    mk('OW-M1001', 'Lumen Automatic 40', 'Lumen Open-Heart Automatic 40', 'ลูเมน โอเพ่นฮาร์ท ออโตเมติก 40',
      'men-watches', 'opwatch', 18900, 22900, 24, ['NEW', 'SALE'], 1, 0,
      'ออโตเมติกญี่ปุ่น 40 มม. หน้าปัดน้ำเงิน Open-Heart กระจกแซฟไฟร์', 'Japanese automatic 40mm, blue guilloché open-heart dial, sapphire crystal',
      'เรือนเวลาออโตเมติกขนาด 40 มม. โชว์กลไก Open-Heart บนหน้าปัดสีน้ำเงินแกะลายกิโยเช่ ตัวเรือนสเตนเลสสตีลทูโทน กระจกแซฟไฟร์แท้กันรอย',
      'A 40mm open-heart automatic timepiece featuring a deep royal-blue guilloché dial, sapphire crystal, and two-tone surgical steel bracelet.',
      { 'Case Size': '40 mm Surgical Steel', 'Movement': 'Japanese Automatic (24h Subdial)', 'Crystal': 'Sapphire Crystal', 'Water Resistance': '5 ATM (50m)' }),
    mk('OW-M1002', 'Meridian Chronograph', 'Meridian Automatic Black 41', 'เมอริเดียน ออโตเมติก แบล็ค 41',
      'men-watches', 'opwatch', 24500, null, 18, ['NEW'], 2, 7,
      'ออโตเมติกหน้าปัดดำ 41 มม. กันน้ำ 100 ม. กระจกแซฟไฟร์', 'Black dial automatic 41mm, sapphire crystal, 100m water resistance',
      'นาฬิกาสุภาพบุรุษหน้าปัดสีดำเข้มคมชัด ขนาด 41 มม. ขอบตัวเรือนสเตนเลสสตีลปัดเงาสลับด้าน กันน้ำลึก 100 เมตร',
      'Commanding 41mm black-dial automatic timepiece crafted in brushed and polished stainless steel with 100m water resistance.',
      { 'Case Size': '41 mm Stainless Steel', 'Movement': 'Japanese Automatic', 'Crystal': 'Sapphire Crystal', 'Water Resistance': '10 ATM (100m)' }),
    mk('OW-L2001', 'Petite Rose 28', 'Petite Gold Quartz 28 (130-06LK)', 'เปติต โกลด์ ควอตซ์ 28',
      'women-watches', 'opwatch', 16400, 19900, 30, ['NEW', 'SALE'], 3, 2,
      '28 มม. ตัวเรือนทอง สายหนังแท้ กระจกแซฟไฟร์', '28mm gold-tone slim case, genuine leather strap, sapphire crystal',
      'นาฬิกาสุภาพสตรีดีไซน์บางเฉียบ 28 มม. หน้าปัดขาวมินิมอลเข็มทอง จับคู่สายหนังแท้สีดำคลาสสิก',
      'Ultra-slim 28mm gold-tone dress watch with crisp white dial, slender baton indices, and genuine black calfskin strap.',
      { 'Case Size': '28 mm Slim Gold PVD', 'Movement': 'Japanese Precision Quartz', 'Crystal': 'Sapphire Crystal', 'Water Resistance': '3 ATM (30m)' }),
    mk('OW-L2002', 'Essence Minimal 30', 'Essence Diamond Bezel 30', 'เอสเซนซ์ ไดมอนด์ 30',
      'women-watches', 'opwatch', 12900, null, 26, [], 4, 3,
      '30 มม. ขอบประดับคริสตัล หน้าปัดขาวมุก', '30mm crystal-set bezel, luminous white dial',
      'นาฬิกาสตรีขนาด 30 มม. ขอบตัวเรือนประดับคริสตัลเจียระไนสะท้อนแสงงดงาม สวมใส่สบายทุกวัน',
      'Graceful 30mm timepiece framed by a radiant crystal-set bezel and paired with a supple leather strap.',
      { 'Case Size': '30 mm Two-Tone Steel', 'Movement': 'Japanese Quartz', 'Crystal': 'Sapphire Crystal', 'Water Resistance': '3 ATM (30m)' }),
    mk('OW-S3001', 'Abyss Diver 40', 'Super Luminous Diver 40 (899832AGS)', 'ซูเปอร์ ลูมินัส ไดเวอร์ 40',
      'sport-watches', 'opwatch', 21500, 25900, 15, ['NEW', 'SALE'], 5, 1,
      'สปอร์ตไดเวอร์ 40 มม. พรายน้ำ Super Luminous สว่างพิเศษ', 'Super Luminous 40mm sports automatic diver, sapphire crystal',
      'นาฬิกาสปอร์ตไดเวอร์รุ่นไอคอนิก 40 มม. โดดเด่นด้วยพรายน้ำสีเขียวมรกตสว่างคมชัดในที่มืด ขอบเซรามิกหมุนได้ทิศทางเดียว และกระจกแซฟไฟร์เลนส์ขยายวันที่',
      'Iconic 40mm sports mechanical diver engineered with intense emerald Super-LumiNova markers, unidirectional bezel, and sapphire cyclops crystal.',
      { 'Case Size': '40 mm Brushed 316L Steel', 'Movement': 'Automatic Mechanical', 'Crystal': 'Sapphire with Cyclops', 'Water Resistance': '10 ATM (100m)' }),
    mk('OW-C4001', 'Heritage Dress 38', 'Heritage Open-Heart Gold 39 (99141)', 'เฮริเทจ โอเพ่นฮาร์ท โกลด์ 39',
      'classic-watches', 'opwatch', 23900, 27900, 20, ['NEW', 'SALE'], 6, 5,
      'คลาสสิก Open-Heart 39 มม. หน้าปัดขาวเข็มดาบทอง', 'Classic 39mm white open-heart dial, two-tone jubilee bracelet',
      'นาฬิกาเดรสคลาสสิก 39 มม. เผยจังหวะการทำงานของจักรกลที่ตำแหน่ง 9 นาฬิกา หน้าปัดขาวสะอาดตาตัดกับมาร์กเกอร์สีทอง',
      'Timeless 39mm dress automatic showcasing a 9 o’clock open-heart escapement window and dauphine gold hands.',
      { 'Case Size': '39 mm Two-Tone Steel', 'Movement': 'Japanese Automatic Open-Heart', 'Crystal': 'Sapphire Crystal', 'Water Resistance': '5 ATM (50m)' }),
    mk('OW-K1001', 'Little Star 26', 'Classic Slim Noir 26 (130-06B)', 'คลาสสิก สลิม นัวร์ 26',
      'kids-watches', 'opwatch', 6900, 8900, 40, ['SALE'], 7, 6,
      '26 มม. ขนาดกะทัดรัด น้ำหนักเบา หน้าปัดดำทอง', 'Compact 26mm slim black-and-gold quartz watch',
      'นาฬิกาขนาดกะทัดรัด 26 มม. น้ำหนักเบาเป็นพิเศษ ตัวเรือนบางสวมใส่ง่ายสำหรับข้อมือเล็ก',
      'Featherlight 26mm ultra-thin quartz timepiece in jet black and warm gold.',
      { 'Case Size': '26 mm Ultra-Slim', 'Movement': 'Japanese Quartz', 'Crystal': 'Sapphire Crystal', 'Water Resistance': '3 ATM (30m)' }),

    // ── Olympinus · Swiss movement · mid–high ───────────────────────────
    mk('OL-M2001', 'Meridian Automatic 40', 'Olympinus Sovereign Gold 39 (130-07MK)', 'โอลิมปินัส ซอฟเวอเรน โกลด์ 39',
      'men-watches', 'olympianus', 58900, null, 12, ['NEW'], 8, 9,
      'สวิสคลาสสิก 39 มม. ตัวเรือนทอง สายหนังจระเข้สีดำ', 'Swiss movement 39mm gold case, white dial, black leather strap',
      'เรือนเวลาสวิสระดับเรือธง 130-07MK ตัวเรือนสีทองขัดเงาคู่หน้าปัดขาวบริสุทธิ์ เข็มและหลักชั่วโมงเรียวบาง สง่างามเหนือกาลเวลา',
      'Signature 130-07MK flagship dress timepiece combining Swiss precision, a mirror-polished gold case, and pure white dial.',
      { 'Case Size': '39 mm Gold PVD Steel', 'Movement': 'Swiss Precision Movement', 'Crystal': 'Domed Sapphire', 'Water Resistance': '5 ATM (50m)' }),
    mk('OL-M2002', 'Aurora Chronograph 42', 'Olympinus Sport Chrono Stealth 42 (899833)', 'โอลิมปินัส สปอร์ต โครโน 42',
      'men-watches', 'olympianus', 72500, 89000, 9, ['SALE'], 9, 4,
      'สปอร์ตสวิส 42 มม. ขอบดำทอง สายยางสมรรถนะสูง', 'Swiss sport 42mm rose-gold & matte black bezel, FKM strap',
      'สปอร์ตเรือนเวลาขนาด 42 มม. ผสานตัวเรือนโทนสีทองเข้ากับขอบดำด้านและสายยางคุณภาพสูง ทนทานทุกกิจกรรม',
      'Bold 42mm sport timepiece pairing a warm gold case with a matte-black tachymetric bezel and integrated black strap.',
      { 'Case Size': '42 mm Gold & Matte Black', 'Movement': 'Swiss Automatic Chronograph', 'Crystal': 'Anti-Reflective Sapphire', 'Water Resistance': '10 ATM (100m)' }),
    mk('OL-L3001', 'Liora Pearl 28', 'Olympinus Ceramic Midnight 30 (82672LK)', 'โอลิมปินัส เซรามิก มิดไนท์ 30',
      'women-watches', 'olympianus', 45900, null, 14, ['NEW'], 10, 8,
      'เซรามิกสีดำเงา 30 มม. ประดับเพชรบนหน้าปัด', '30mm high-gloss black ceramic bracelet, diamond hour markers',
      'ความหรูหราระดับมิดไนท์ด้วยสายและตัวเรือนไฮเทคเซรามิกสีดำเงางาม ตัดกับกรอบสีทองและมาร์กเกอร์ประดับคริสตัลเพชร',
      'High-gloss black ceramic jewellery timepiece accented with warm gold links and sparkling diamond-cut indices.',
      { 'Case Size': '30 mm High-Tech Ceramic', 'Movement': 'Swiss Quartz', 'Crystal': 'Sapphire Crystal', 'Water Resistance': '5 ATM (50m)' }),
    mk('OL-L3002', 'Selene Minimal 30', 'Olympinus Selene Pearl 30', 'โอลิมปินัส เซลีน เพิร์ล 30',
      'women-watches', 'olympianus', 39000, 46000, 16, ['SALE'], 11, 2,
      'สวิสควอตซ์ 30 มม. มินิมอลหน้าปัดขาวบริสุทธิ์', 'Swiss quartz 30mm minimalist dress timepiece',
      'เรือนเวลาสวิสสำหรับสุภาพสตรีที่ชื่นชอบความเรียบหรู ตัวเรือนบางพิเศษสวมใส่แนบข้อมือ',
      'Minimalist 30mm Swiss quartz dress watch crafted for effortless everyday elegance.',
      { 'Case Size': '30 mm Polished Steel', 'Movement': 'Swiss Quartz', 'Crystal': 'Sapphire Crystal', 'Water Resistance': '3 ATM (30m)' }),
    mk('OL-S4001', 'Vertex Diver 41', 'Olympinus Emerald Diver 41 (899831G)', 'โอลิมปินัส เอมเมอรัลด์ ไดเวอร์ 41',
      'sport-watches', 'olympianus', 68000, 82000, 8, ['SALE'], 12, 1,
      'ไดเวอร์สวิส 41 มม. ขอบเขียวมรกต กันน้ำ 300 ม.', 'Swiss 41mm emerald-bezel automatic diver, 300m',
      'นาฬิกาดำน้ำกลไกสวิสขนาด 41 มม. โดดเด่นด้วยหน้าปัดและขอบเซรามิกสีเขียวมรกต กันน้ำลึก 300 เมตร',
      'Professional 41mm Swiss automatic diver featuring a sunburst emerald dial and ceramic bezel rated to 300m.',
      { 'Case Size': '41 mm 316L Steel', 'Movement': 'Swiss Automatic', 'Crystal': 'Sapphire with AR Coating', 'Water Resistance': '30 ATM (300m)' }),
    mk('OL-C5001', 'Heritage Gold 38', 'Olympinus Heritage Open-Heart 38', 'โอลิมปินัส เฮริเทจ โอเพ่นฮาร์ท 38',
      'classic-watches', 'olympianus', 95000, null, 6, ['NEW'], 13, 5,
      'สวิสออโตเมติก Open-Heart 38 มม. ทองคำ 18K PVD', 'Swiss automatic open-heart 38mm, sapphire exhibition back',
      'ผลงานระดับเรือนเอกจาก Olympinus ผสานความเที่ยงตรงของกลไกสวิสเข้ากับช่องหน้าต่างโชว์จักรกลสมดุลอย่างวิจิตร',
      'Masterpiece 38mm Swiss automatic dress watch with exhibition balance wheel and sapphire caseback.',
      { 'Case Size': '38 mm 18K Gold PVD', 'Movement': 'Swiss Automatic', 'Crystal': 'Dual Sapphire', 'Water Resistance': '5 ATM (50m)' }),

    // ── Ogival · Swiss luxury · high-end ────────────────────────────────
    mk('OG-M6001', 'Meteor Tourbillon 40', 'Ogival Imperial Open-Heart 40', 'โอจิวาล อิมพีเรียล ออโตเมติก 40',
      'men-watches', 'ogival', 388000, null, 4, ['NEW'], 14, 0,
      'สวิสลักชัวรี 40 มม. กลไกชั้นสูง ขัดแต่งด้วยมือ', 'Swiss haute horlogerie 40mm hand-finished mechanical watch',
      'สุดยอดเรือนเวลาลักชัวรีจาก Ogival 1903 รังสรรค์กลไกสวิสขัดแต่งลวดลายด้วยมือทุกชิ้นส่วน พร้อมกระจกแซฟไฟร์ทรงโดม',
      'Haute-horlogerie 40mm Swiss timepiece from Ogival 1903 featuring hand-decorated bridges and blued steel screws.',
      { 'Case Size': '40 mm 18K Gold & Steel', 'Movement': 'Swiss Haute Horlogerie Automatic', 'Crystal': 'Domed Anti-Reflective Sapphire', 'Water Resistance': '5 ATM (50m)' }),
    mk('OG-M6002', 'Aurora Diamond 41', 'Ogival Diamond Noir 41', 'โอจิวาล ไดมอนด์ นัวร์ 41',
      'men-jewelry', 'ogival', 458000, null, 3, ['NEW'], 15, 7,
      'จิวเวลรี่สวิส 41 มม. ประดับเพชรแท้พร้อมใบรับรอง', 'Swiss diamond-set 41mm luxury timepiece with certificate',
      'เรือนเวลาจิวเวลรี่สำหรับสุภาพบุรุษ ประดับเพชรแท้คัดเกรดน้ำงามรอบตัวเรือน มาพร้อมใบรับรองความแท้จากสวิตเซอร์แลนด์',
      'Prestigious 41mm Swiss luxury watch set with certified brilliant-cut diamonds.',
      { 'Case Size': '41 mm White Gold Finish', 'Movement': 'Swiss Automatic', 'Gemstones': 'Certified Natural Diamonds', 'Water Resistance': '5 ATM (50m)' }),
    mk('OG-L7001', 'Liora Jewel 28', 'Ogival Midnight Diamond Ceramic 28', 'โอจิวาล มิดไนท์ ไดมอนด์ เซรามิก 28',
      'women-jewelry', 'ogival', 268000, 315000, 7, ['SALE'], 16, 8,
      'จิวเวลรี่เพชร 28 มม. เซรามิกดำตัดทอง 18K', '28mm black ceramic & 18K gold diamond jewellery watch',
      'ศิลปะแห่งจิวเวลรี่สวิสบนข้อมือสุภาพสตรี ผสานเซรามิกสีดำเงาล้ำสมัยเข้ากับเพชรแท้และทองคำอย่างลงตัว',
      'Exquisite 28mm Swiss jewellery timepiece uniting mirror-black ceramic, gold accents, and brilliant-cut diamonds.',
      { 'Case Size': '28 mm Ceramic & 18K Gold', 'Movement': 'Swiss Precision Quartz', 'Gemstones': 'Natural Diamonds', 'Water Resistance': '3 ATM (30m)' }),
    mk('OG-L7002', 'Selene Pearl 30', 'Ogival Mother-of-Pearl Diamond 30', 'โอจิวาล มุกประดับเพชร 30',
      'women-jewelry', 'ogival', 198000, null, 9, [], 17, 3,
      'หน้าปัดมุกธรรมชาติ 30 มม. ล้อมเพชรแท้', '30mm natural mother-of-pearl dial with diamond bezel',
      'เปล่งประกายทุกการเคลื่อนไหวด้วยหน้าปัดเปลือกมุกธรรมชาติและขอบตัวเรือนฝังเพชรประณีต',
      'Luminous mother-of-pearl dial encircled by hand-set diamonds in a 30mm Swiss case.',
      { 'Case Size': '30 mm Two-Tone Gold', 'Movement': 'Swiss Quartz', 'Dial': 'Natural Mother-of-Pearl', 'Water Resistance': '3 ATM (30m)' }),
    mk('OG-S8001', 'Vertex Grand 41', 'Ogival Grand Sport Gold 41', 'โอจิวาล แกรนด์ สปอร์ต โกลด์ 41',
      'sport-watches', 'ogival', 328000, null, 5, [], 18, 4,
      'แกรนด์สปอร์ตสวิส 41 มม. ตัวเรือนทองรมดำ', 'Swiss luxury sport 41mm rose-gold & obsidian case',
      'ความสปอร์ตระดับไฮเอนด์จาก Ogival ตัวเรือนทองตัดขอบดำด้านพร้อมกลไกสวิสสำรองพลังงานยาวนาน',
      'High-luxury 41mm sport automatic pairing warm gold architecture with a stealth matte bezel.',
      { 'Case Size': '41 mm Rose Gold & Black', 'Movement': 'Swiss Automatic', 'Crystal': 'Sapphire Crystal', 'Water Resistance': '10 ATM (100m)' }),
    mk('OG-K9001', 'Little Star 26', 'Ogival Petite Heritage 26', 'โอจิวาล เปติต เฮริเทจ 26',
      'kids-watches', 'ogival', 98000, null, 10, ['NEW'], 19, 6,
      'เรือนเวลาขนาด 26 มม. ทองคำคลาสสิกสำหรับของขวัญล้ำค่า', '26mm petite Swiss luxury keepsake watch',
      'เรือนเวลาสวิสขนาด 26 มม. เหมาะสำหรับมอบเป็นของขวัญล้ำค่าแทนความทรงจำเหนือกาลเวลา',
      'Petite 26mm Swiss luxury timepiece crafted as a generational keepsake gift.',
      { 'Case Size': '26 mm Gold Finish', 'Movement': 'Swiss Quartz', 'Crystal': 'Sapphire Crystal', 'Water Resistance': '3 ATM (30m)' })
  ]
}

export const defaultCampaigns = (): SeedCampaign[] => [
  {
    slug: 'olym-pianus-hero-1',
    title: '130-07MK SOVEREIGN GOLD',
    titleEn: '130-07MK SOVEREIGN GOLD',
    titleTh: '130-07MK SOVEREIGN GOLD',
    subtitle: 'Inspired by the ultimate glory of the Olympic spirit',
    subtitleEn: 'Inspired by the ultimate glory of the Olympic spirit',
    subtitleTh: 'แรงบันดาลใจจากเกียรติยศสูงสุดแห่งจิตวิญญาณโอลิมปิก',
    banner: '/images/op/hero-gold-stones.jpg',
    link: '/products/ol-m2001',
    brandSlug: 'olympianus',
    type: 'hero',
    sortOrder: 1,
    active: true
  },
  {
    slug: 'opwatch-brand-day',
    title: 'OPWATCH · JAPANESE PRECISION',
    titleEn: 'OPWATCH · JAPANESE PRECISION',
    titleTh: 'OPWATCH · เครื่องญี่ปุ่นคุณภาพสูง',
    subtitle: 'กระจกแซฟไฟร์แท้พร้อมดีไซน์ร่วมสมัย',
    subtitleEn: 'Sapphire crystal & Japanese movements.',
    subtitleTh: 'กระจกแซฟไฟร์แท้พร้อมดีไซน์ร่วมสมัย',
    banner: '/images/op/lifestyle-men.jpg',
    link: '/brands/opwatch',
    brandSlug: 'opwatch',
    type: 'brand-day',
    sortOrder: 1,
    active: true
  },
  {
    slug: 'olympianus-brand-day',
    title: 'OLYMPINUS · SWISS HERITAGE',
    titleEn: 'OLYMPINUS · SWISS HERITAGE',
    titleTh: 'OLYMPINUS · ความสง่างามเหนือกาลเวลา',
    subtitle: 'Faster, Higher, Stronger',
    subtitleEn: 'Faster, Higher, Stronger.',
    subtitleTh: 'Faster, Higher, Stronger',
    banner: '/images/op/banner-899832ags.jpg',
    link: '/brands/olympianus',
    brandSlug: 'olympianus',
    type: 'brand-day',
    sortOrder: 2,
    active: true
  },
  {
    slug: 'ogival-brand-day',
    title: 'OGIVAL 1903 · SWISS LUXURY',
    titleEn: 'OGIVAL 1903 · SWISS LUXURY',
    titleTh: 'OGIVAL 1903 · ตำนานสวิสลักชัวรี',
    subtitle: 'A century of Swiss luxury since 1903',
    subtitleEn: 'A century of Swiss luxury since 1903.',
    subtitleTh: 'ตำนานเรือนเวลาหรูสวิสกว่าศตวรรษ',
    banner: '/images/op/hero-ceramic-dark.jpg',
    link: '/brands/ogival',
    brandSlug: 'ogival',
    type: 'brand-day',
    sortOrder: 3,
    active: true
  }
]

export async function seedStore(
  store: Store,
  opts: { reset?: boolean } = {}
): Promise<void> {
  const { defaultBrands, defaultCategories, defaultProducts, defaultCampaigns } = await import('./seed')
  if (opts.reset && store.driver === 'json') {
    ;(store as any).reset?.()
  }

  const brands = defaultBrands()
  const categories = defaultCategories()
  const products = defaultProducts()
  const campaigns = defaultCampaigns()

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
