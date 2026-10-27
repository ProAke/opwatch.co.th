import type { Store } from '../db/types'

export interface SeedCategory {
  slug: string
  name: string
  nameEn: string
  nameTh: string
  description: string
  descriptionEn: string
  descriptionTh: string
  image: string
  sortOrder: number
}

export interface SeedProduct {
  sku: string
  name: string
  nameEn: string
  nameTh: string
  slug: string
  categorySlug: string
  brand: string
  price: number
  priceCompare: number | null
  currency: string
  images: string[]
  shortDescription: string
  description: string
  descriptionEn: string
  descriptionTh: string
  specs: Record<string, string>
  stock: number
  status: 'active' | 'draft'
  featured: boolean
  sortOrder: number
}

export const defaultCategories = (): SeedCategory[] => [
  {
    slug: 'men',
    name: 'Men',
    nameEn: 'Men',
    nameTh: 'ผู้ชาย',
    description: 'Strength and restraint, in one dial.',
    descriptionEn: 'Strength and restraint, in one dial.',
    descriptionTh: 'ความแกร่งและความเรียบง่ายในหน้าปัดเดียว',
    image: '/images/c-men.jpg',
    sortOrder: 1
  },
  {
    slug: 'ladies',
    name: 'Ladies',
    nameEn: 'Ladies',
    nameTh: 'ผู้หญิง',
    description: 'Delicate proportions and a quiet shimmer.',
    descriptionEn: 'Delicate proportions and a quiet shimmer.',
    descriptionTh: 'สัดส่วนที่บอบบางและความประณีตที่นุ่มนวล',
    image: '/images/c-ladies.jpg',
    sortOrder: 2
  },
  {
    slug: 'sport',
    name: 'Sport',
    nameEn: 'Sport',
    nameTh: 'สปอร์ต',
    description: 'Built for the water, ready for the city.',
    descriptionEn: 'Built for the water, ready for the city.',
    descriptionTh: 'ทนทานต่อน้ำ และพร้อมสำหรับเมือง',
    image: '/images/c-sport.jpg',
    sortOrder: 3
  },
  {
    slug: 'classic',
    name: 'Classic',
    nameEn: 'Classic',
    nameTh: 'คลาสสิก',
    description: 'The timeless silhouette, refined.',
    descriptionEn: 'The timeless silhouette, refined.',
    descriptionTh: 'รูปทรงแห่งความเป็นอมตะ ที่ได้รับการขัดเกลา',
    image: '/images/hero-watch.jpg',
    sortOrder: 4
  }
]

export const defaultProducts = (): SeedProduct[] => [
  {
    sku: 'OW-M1001',
    name: 'Lumen Automatic 40',
    nameEn: 'Lumen Automatic 40',
    nameTh: 'ลูเมน ออโตเมติก 40',
    slug: 'lumen-automatic-40',
    categorySlug: 'men',
    brand: 'Opwatch',
    price: 18900,
    priceCompare: 22900,
    currency: 'THB',
    images: ['/images/p1.jpg'],
    shortDescription: 'Automatic movement with a deep black sunburst dial.',
    description:
      'The Lumen Automatic 40 pairs a precise automatic movement with a sunburst black dial and a warm leather strap. A dress watch with a quiet presence.',
    descriptionEn:
      'The Lumen Automatic 40 pairs a precise automatic movement with a sunburst black dial and a warm leather strap. A dress watch with a quiet presence.',
    descriptionTh:
      'Lumen Automatic 40 นำกลไกออโตเมติกที่เที่ยงตรงมาบรรจบกับหน้าปัดสีดำแบบซันเบิร์สต์และสายหนังอันอบอุ่น นาฬิกาดราส์ที่มีตัวตนอย่างสง่างาม',
    specs: {
      Movement: 'Automatic',
      Case: '40 mm stainless steel',
      'Water resistance': '50 m',
      Strap: 'Leather',
      Warranty: '2 years'
    },
    stock: 18,
    status: 'active',
    featured: true,
    sortOrder: 1
  },
  {
    sku: 'OW-M1002',
    name: 'Meridian Chronograph',
    nameEn: 'Meridian Chronograph',
    nameTh: 'เมอริเดียน โครโนกราฟ',
    slug: 'meridian-chronograph',
    categorySlug: 'men',
    brand: 'Opwatch',
    price: 24500,
    priceCompare: null,
    currency: 'THB',
    images: ['/images/p5.jpg'],
    shortDescription: 'A three-sub-dial chronograph on a steel bracelet.',
    description:
      'The Meridian Chronograph offers a navy dial, three sub-dials and a integrated steel bracelet. engineered for everyday wear.',
    descriptionEn:
      'The Meridian Chronograph offers a navy dial, three sub-dials and an integrated steel bracelet, engineered for everyday wear.',
    descriptionTh:
      'Meridian Chronograph มาพร้อมหน้าปัดสีน้ำเงิน หน้าปัดย่อย 3 วง และสายสเตนเลสสตีลแบบอินทิเกรต ออกแบบมาเพื่อการใช้งานทุกวัน',
    specs: {
      Movement: 'Automatic chronograph',
      Case: '42 mm stainless steel',
      'Water resistance': '100 m',
      Strap: 'Steel bracelet',
      Warranty: '2 years'
    },
    stock: 9,
    status: 'active',
    featured: true,
    sortOrder: 2
  },
  {
    sku: 'OW-L2001',
    name: 'Petite Rose 28',
    nameEn: 'Petite Rose 28',
    nameTh: 'เปติต โรส 28',
    slug: 'petite-rose-28',
    categorySlug: 'ladies',
    brand: 'Opwatch',
    price: 16400,
    priceCompare: 19900,
    currency: 'THB',
    images: ['/images/p2.jpg'],
    shortDescription: 'A rose gold case with a mother-of-pearl dial.',
    description:
      'Petite Rose 28 keeps a delicate 28 mm rose gold case and a mother-of-pearl dial. Effortless for day, elegant for evening.',
    descriptionEn:
      'Petite Rose 28 keeps a delicate 28 mm rose gold case and a mother-of-pearl dial. Effortless for day, elegant for evening.',
    descriptionTh:
      'Petite Rose 28 มาพร้อมตัวเรือนโรสโกลด์ขนาด 28 มม. ที่บอบบางและหน้าปัดเปลือกหอย ใส่ได้สบายในชีวิตประจำวันและสง่างามยามค่ำคืน',
    specs: {
      Movement: 'Quartz',
      Case: '28 mm rose gold',
      'Water resistance': '30 m',
      Strap: 'Leather',
      Warranty: '2 years'
    },
    stock: 24,
    status: 'active',
    featured: true,
    sortOrder: 3
  },
  {
    sku: 'OW-L2002',
    name: 'Essence Minimal 30',
    nameEn: 'Essence Minimal 30',
    nameTh: 'เอสเซนซ์ มินิมอล 30',
    slug: 'essence-minimal-30',
    categorySlug: 'ladies',
    brand: 'Opwatch',
    price: 12900,
    priceCompare: null,
    currency: 'THB',
    images: ['/images/p6.jpg'],
    shortDescription: 'A minimalist unisex dial with a fabric strap.',
    description:
      'Essence Minimal 30 strips everything away but the essentials — a brushed silver case, a stark white dial and a soft fabric strap.',
    descriptionEn:
      'Essence Minimal 30 strips everything away but the essentials — a brushed silver case, a stark white dial and a soft fabric strap.',
    descriptionTh:
      'Essence Minimal 30 ตัดทอนทุกอย่างออกไปจนเหลือเพียงสิ่งที่จำเป็น — ตัวเรือนเงินขัดลาย หน้าปัดสีขาวสะอาด และสายผ้าอันอ่อนนุ่ม',
    specs: {
      Movement: 'Quartz',
      Case: '30 mm stainless steel',
      'Water resistance': '30 m',
      Strap: 'Fabric',
      Warranty: '2 years'
    },
    stock: 30,
    status: 'active',
    featured: false,
    sortOrder: 4
  },
  {
    sku: 'OW-S3001',
    name: 'Abyss Diver 40',
    nameEn: 'Abyss Diver 40',
    nameTh: 'แอบบิส ไดเวอร์ 40',
    slug: 'abyss-diver-40',
    categorySlug: 'sport',
    brand: 'Opwatch',
    price: 21500,
    priceCompare: 25900,
    currency: 'THB',
    images: ['/images/p3.jpg'],
    shortDescription: 'A 200 m dive watch with luminous indices.',
    description:
      'The Abyss Diver 40 is rated to 200 metres, with a matte black case, luminous indices and a rubber strap that handles wet conditions with ease.',
    descriptionEn:
      'The Abyss Diver 40 is rated to 200 metres, with a matte black case, luminous indices and a rubber strap that handles wet conditions with ease.',
    descriptionTh:
      'Abyss Diver 40 ทนน้ำถึง 200 เมตร ตัวเรือนสีดำด้าน index เรืองแสง และสายยางที่ทนต่อสภาวะชื้นได้อย่างสบาย',
    specs: {
      Movement: 'Automatic',
      Case: '40 mm stainless steel',
      'Water resistance': '200 m',
      Strap: 'Rubber',
      Warranty: '2 years'
    },
    stock: 14,
    status: 'active',
    featured: true,
    sortOrder: 5
  },
  {
    sku: 'OW-S3002',
    name: 'Velocity Race 42',
    nameEn: 'Velocity Race 42',
    nameTh: 'เวโลซิตี้ เรซ 42',
    slug: 'velocity-race-42',
    categorySlug: 'sport',
    brand: 'Opwatch',
    price: 19900,
    priceCompare: null,
    currency: 'THB',
    images: ['/images/p5.jpg'],
    shortDescription: 'A chronograph built for speed and precision.',
    description:
      'Velocity Race 42 brings a tachymeter bezel, a screw-down crown and a solid steel case to whatever you are chasing.',
    descriptionEn:
      'Velocity Race 42 brings a tachymeter bezel, a screw-down crown and a solid steel case to whatever you are chasing.',
    descriptionTh:
      'Velocity Race 42 นำเสนอขอบตัวเรือนแบบทาคิมิเตอร์  crown แบบ screw-down และตัวเรือนสเตนเลสสตีลที่ทนทาน',
    specs: {
      Movement: 'Automatic',
      Case: '42 mm stainless steel',
      'Water resistance': '100 m',
      Strap: 'Steel bracelet',
      Warranty: '2 years'
    },
    stock: 7,
    status: 'active',
    featured: false,
    sortOrder: 6
  },
  {
    sku: 'OW-C4001',
    name: 'Heritage Dress 38',
    nameEn: 'Heritage Dress 38',
    nameTh: 'เฮริเทจ เดรส 38',
    slug: 'heritage-dress-38',
    categorySlug: 'classic',
    brand: 'Opwatch',
    price: 23900,
    priceCompare: 27900,
    currency: 'THB',
    images: ['/images/p4.jpg'],
    shortDescription: 'A gold dress watch with a crocodile strap.',
    description:
      'Heritage Dress 38 honours the classic dress watch: a warm gold case, a clean cream dial and a crocodile leather strap.',
    descriptionEn:
      'Heritage Dress 38 honours the classic dress watch: a warm gold case, a clean cream dial and a crocodile leather strap.',
    descriptionTh:
      'Heritage Dress 38 สืบทอดความเป็นนาฬิกาดราส์คลาสสิก — ตัวเรือนสีทองอบอุ่น หน้าปัดสีครีมสะอาด และสายหนังจระเข้',
    specs: {
      Movement: 'Automatic',
      Case: '38 mm gold-tone steel',
      'Water resistance': '30 m',
      Strap: 'Crocodile leather',
      Warranty: '2 years'
    },
    stock: 11,
    status: 'active',
    featured: true,
    sortOrder: 7
  },
  {
    sku: 'OW-C4002',
    name: 'Calibre 9 Automatic',
    nameEn: 'Calibre 9 Automatic',
    nameTh: 'คาลิเบอร์ 9 ออโตเมติก',
    slug: 'calibre-9-automatic',
    categorySlug: 'classic',
    brand: 'Opwatch',
    price: 17400,
    priceCompare: null,
    currency: 'THB',
    images: ['/images/p1.jpg'],
    shortDescription: 'A quietly confident automatic with a domed crystal.',
    description:
      'Calibre 9 Automatic keeps a domed crystal, index-free hour markers and a leather strap that ages beautifully.',
    descriptionEn:
      'Calibre 9 Automatic keeps a domed crystal, index-free hour markers and a leather strap that ages beautifully.',
    descriptionTh:
      'Calibre 9 Automatic มาพร้อมกระจกทรงโดม เครื่องหมายชั่วโมงแบบไร้ตัวเลข และสายหนังที่ยิ่งใช้ยิ่งสวยงาม',
    specs: {
      Movement: 'Automatic',
      Case: '39 mm stainless steel',
      'Water resistance': '50 m',
      Strap: 'Leather',
      Warranty: '2 years'
    },
    stock: 5,
    status: 'active',
    featured: false,
    sortOrder: 8
  }
]

export async function seedStore(
  store: Store,
  opts: { reset?: boolean } = {}
): Promise<void> {
  const { defaultCategories, defaultProducts } = await import('./seed')
  if (opts.reset && store.driver === 'json') {
    (store as any).reset?.()
  }

  const categories = defaultCategories()
  const products = defaultProducts()

  // Categories
  const existingCats = await store.all('categories')
  const catMap = new Map<string, number>()
  if (existingCats.length === 0) {
    for (const c of categories) {
      const row = await store.create('categories', {
        slug: c.slug,
        name: c.name,
        nameEn: c.nameEn,
        nameTh: c.nameTh,
        description: c.description,
        descriptionEn: c.descriptionEn,
        descriptionTh: c.descriptionTh,
        image: c.image,
        sortOrder: c.sortOrder
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
        sku: p.sku,
        name: p.name,
        nameEn: p.nameEn,
        nameTh: p.nameTh,
        slug: p.slug,
        categoryId: catMap.get(p.categorySlug) ?? null,
        brand: p.brand,
        price: p.price,
        priceCompare: p.priceCompare,
        currency: p.currency,
        images: p.images,
        shortDescription: p.shortDescription,
        description: p.description,
        descriptionEn: p.descriptionEn,
        descriptionTh: p.descriptionTh,
        specs: p.specs,
        stock: p.stock,
        status: p.status,
        featured: p.featured,
        sortOrder: p.sortOrder
      })
    }
  }
}
