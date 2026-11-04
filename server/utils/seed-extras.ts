export interface SeedPromotion {
  slug: string
  title: string
  titleTh: string
  titleEn: string
  subtitle: string
  subtitleTh: string
  subtitleEn: string
  banner: string
  mobileBanner: string
  channel: 'website' | 'shopee' | 'line' | 'facebook' | 'tiktok' | 'store' | 'all'
  badge: string
  couponCode: string
  discountLabel: string
  link: string
  targetBlank: boolean
  showOnHome: boolean
  homeColumns: 3 | 4 | 6
  productIds: number[]
  startsAt: string
  endsAt: string
  sortOrder: number
  active: boolean
}

export function defaultPromotions(featuredProductIds: number[] = []): SeedPromotion[] {
  return [
    {
      slug: 'grand-horology-privilege',
      title: 'OPWATCH EXCLUSIVE PRIVILEGE · ลดสูงสุด 35% + โค้ดลดเพิ่ม ฿1,111',
      titleTh: 'OPWATCH EXCLUSIVE PRIVILEGE · ลดสูงสุด 35% + โค้ดลดเพิ่ม ฿1,111',
      titleEn: 'OPWATCH EXCLUSIVE PRIVILEGE · Up to 35% Off + Extra ฿1,111 Code',
      subtitle: 'คัดสรรเรือนเวลาไฮไลต์จาก Olym Pianus, Olympia Star และ Ogival พร้อมบริการห่อของขวัญฟรี สะสมแต้ม OP Point X2 และรับประกันศูนย์ไทย 2 ปีเต็ม',
      subtitleTh: 'คัดสรรเรือนเวลาไฮไลต์จาก Olym Pianus, Olympia Star และ Ogival พร้อมบริการห่อของขวัญฟรี สะสมแต้ม OP Point X2 และรับประกันศูนย์ไทย 2 ปีเต็ม',
      subtitleEn: 'Curated Olym Pianus, Olympia Star & Ogival timepieces with complimentary luxury gift wrapping, 2X OP Points, and 2-Year Thailand Official Warranty.',
      banner: '/images/op/banner-899832ags.jpg',
      mobileBanner: '/images/op/portrait-diver.jpg',
      channel: 'website',
      badge: 'EXCLUSIVE ONLINE PROMOTION',
      couponCode: 'OP1111',
      discountLabel: 'ลดสูงสุด 35%',
      link: '/promotions',
      targetBlank: false,
      showOnHome: true,
      homeColumns: 4,
      productIds: featuredProductIds.slice(0, 8),
      startsAt: '2026-11-01',
      endsAt: '2026-12-31',
      sortOrder: 1,
      active: true
    },
    {
      slug: 'shopee-official-mall-deal',
      title: 'SHOPEE OFFICIAL STORE · ดีลพิเศษประจำเดือน + โค้ดส่งฟรีทั่วไทย',
      titleTh: 'SHOPEE OFFICIAL STORE · ดีลพิเศษประจำเดือน + โค้ดส่งฟรีทั่วไทย',
      titleEn: 'SHOPEE OFFICIAL STORE · Monthly Brand Voucher & Free Shipping',
      subtitle: 'ช้อปเรือนเวลาของแท้ผ่าน Shopee Official Store (opwatchthailand) รับโค้ดส่วนลดร้านค้าและผ่อนชำระ 0% สูงสุด 10 เดือน',
      subtitleTh: 'ช้อปเรือนเวลาของแท้ผ่าน Shopee Official Store (opwatchthailand) รับโค้ดส่วนลดร้านค้าและผ่อนชำระ 0% สูงสุด 10 เดือน',
      subtitleEn: 'Shop official watches on Shopee Thailand (opwatchthailand) with store vouchers and 0% installment plans.',
      banner: '/images/op/hero-gold-stones.jpg',
      mobileBanner: '/images/op/portrait-99141agnsk.jpg',
      channel: 'shopee',
      badge: 'SHOPEE OFFICIAL',
      couponCode: 'OPSHOPEE',
      discountLabel: 'Voucher ลดเพิ่ม 15%',
      link: 'https://shopee.co.th/opwatchthailand',
      targetBlank: true,
      showOnHome: false,
      homeColumns: 4,
      productIds: [],
      startsAt: '2026-11-01',
      endsAt: '2026-12-31',
      sortOrder: 2,
      active: true
    },
    {
      slug: 'line-oa-vip-privilege',
      title: 'LINE OFFICIAL @opwatch.th · แอดเพื่อนรับคูปองส่วนลดทันที ฿500',
      titleTh: 'LINE OFFICIAL @opwatch.th · แอดเพื่อนรับคูปองส่วนลดทันที ฿500',
      titleEn: 'LINE OFFICIAL opwatch.th · Add Friend & Receive Instant ฿500 Voucher',
      subtitle: 'ปรึกษาผู้เชี่ยวชาญเรือนเวลาส่วนตัว เช็คสต็อกเคาน์เตอร์ห้างใกล้บ้าน และรับสิทธิ์จองรุ่นลิมิเต็ดก่อนใครทาง LINE ID: opwatch.th',
      subtitleTh: 'ปรึกษาผู้เชี่ยวชาญเรือนเวลาส่วนตัว เช็คสต็อกเคาน์เตอร์ห้างใกล้บ้าน และรับสิทธิ์จองรุ่นลิมิเต็ดก่อนใครทาง LINE ID: opwatch.th',
      subtitleEn: 'Chat directly with our watch specialists, reserve watches at nearby counters, and unlock VIP privileges via LINE ID: opwatch.th.',
      banner: '/images/op/lifestyle-men.jpg',
      mobileBanner: '/images/op/portrait-8909amk.jpg',
      channel: 'line',
      badge: 'LINE VIP CONCIERGE',
      couponCode: 'OP500',
      discountLabel: 'รับคูปอง ฿500',
      link: 'https://line.me/ti/p/~opwatch.th',
      targetBlank: true,
      showOnHome: false,
      homeColumns: 4,
      productIds: [],
      startsAt: '2026-11-01',
      endsAt: '2026-12-31',
      sortOrder: 3,
      active: true
    },
    {
      slug: 'facebook-live-special',
      title: 'FACEBOOK OPwatchThailand · อัปเดตคอลเลกชันใหม่ & โปรโมชั่นไลฟ์สด',
      titleTh: 'FACEBOOK OPwatchThailand · อัปเดตคอลเลกชันใหม่ & โปรโมชั่นไลฟ์สด',
      titleEn: 'FACEBOOK OPwatchThailand · New Releases & Live Exclusive Deals',
      subtitle: 'ติดตามรีวิวเจาะลึกเรือนเวลาจริงบนข้อมือ พร้อมกิจกรรมแจกของสมนาคุณพิเศษสำหรับแฟนเพจ OPwatchThailand',
      subtitleTh: 'ติดตามรีวิวเจาะลึกเรือนเวลาจริงบนข้อมือ พร้อมกิจกรรมแจกของสมนาคุณพิเศษสำหรับแฟนเพจ OPwatchThailand',
      subtitleEn: 'Follow hands-on wrist reviews and exclusive fan giveaways on our official Facebook page OPwatchThailand.',
      banner: '/images/op/hero-ceramic-dark.jpg',
      mobileBanner: '/images/op/openheart-stones.jpg',
      channel: 'facebook',
      badge: 'FACEBOOK OFFICIAL',
      couponCode: 'NEWOP10',
      discountLabel: 'ลดเพิ่ม 10%',
      link: 'https://www.facebook.com/OPwatchThailand',
      targetBlank: true,
      showOnHome: false,
      homeColumns: 4,
      productIds: [],
      startsAt: '2026-11-01',
      endsAt: '2026-12-31',
      sortOrder: 4,
      active: true
    },
    {
      slug: 'tiktok-live-flash-sale',
      title: 'TIKTOK @opwatchthailand · คลิปรีวิวเรือนเวลา & ดีล Flash Sale พิเศษ',
      titleTh: 'TIKTOK @opwatchthailand · คลิปรีวิวเรือนเวลา & ดีล Flash Sale พิเศษ',
      titleEn: 'TIKTOK @opwatchthailand · Short-Form Wrist Videos & Flash Offers',
      subtitle: 'ชมประกายหน้าปัดแซฟไฟร์และพรายน้ำในทุกมุมแสง พร้อมคูปองพิเศษเฉพาะช่องทาง TikTok Official',
      subtitleTh: 'ชมประกายหน้าปัดแซฟไฟร์และพรายน้ำในทุกมุมแสง พร้อมคูปองพิเศษเฉพาะช่องทาง TikTok Official',
      subtitleEn: 'Watch real sapphire dial reflections and luminous bezel videos with exclusive TikTok vouchers.',
      banner: '/images/op/lifestyle-lady.jpg',
      mobileBanner: '/images/op/portrait-8934msk.jpg',
      channel: 'tiktok',
      badge: 'TIKTOK SHOP',
      couponCode: 'SWISS15',
      discountLabel: 'Flash Deal 15%',
      link: 'https://www.tiktok.com/@opwatchthailand',
      targetBlank: true,
      showOnHome: false,
      homeColumns: 4,
      productIds: [],
      startsAt: '2026-11-01',
      endsAt: '2026-12-31',
      sortOrder: 5,
      active: true
    },
    {
      slug: 'boutique-click-and-collect',
      title: 'BOUTIQUE & COUNTER PRIVILEGE · จองออนไลน์ รับสินค้าและตัดสายฟรีที่สาขาใกล้บ้าน',
      titleTh: 'BOUTIQUE & COUNTER PRIVILEGE · จองออนไลน์ รับสินค้าและตัดสายฟรีที่สาขาใกล้บ้าน',
      titleEn: 'BOUTIQUE & COUNTER PRIVILEGE · Reserve Online, Complimentary Strap Sizing In-Store',
      subtitle: 'บริการ Click & Collect เลือกชมเรือนเวลาจริง ปรับขนาดสายพอดีข้อมือ และห่อของขวัญหรูฟรี ณ โชว์รูมอินเตอร์ไทมส์และเคาน์เตอร์ห้างชั้นนำ',
      subtitleTh: 'บริการ Click & Collect เลือกชมเรือนเวลาจริง ปรับขนาดสายพอดีข้อมือ และห่อของขวัญหรูฟรี ณ โชว์รูมอินเตอร์ไทมส์และเคาน์เตอร์ห้างชั้นนำ',
      subtitleEn: 'Enjoy complimentary wrist sizing and luxury gift wrapping at Inter Times Head Office and leading department store counters.',
      banner: '/images/op/lifestyle-sport.jpg',
      mobileBanner: '/images/op/portrait-82671m.jpg',
      channel: 'store',
      badge: 'IN-STORE PRIVILEGE',
      couponCode: '',
      discountLabel: 'ฟรีตัดสาย & ห่อของขวัญ',
      link: '/branches',
      targetBlank: false,
      showOnHome: false,
      homeColumns: 4,
      productIds: [],
      startsAt: '2026-11-01',
      endsAt: '2026-12-31',
      sortOrder: 6,
      active: true
    }
  ]
}

export function defaultCoupons() {
  return [
    {
      code: 'OP1111',
      title: 'ลดเพิ่ม ฿1,111',
      titleTh: 'ลดเพิ่ม ฿1,111 เมื่อช้อปครบ ฿8,000',
      titleEn: 'Extra ฿1,111 Off on orders ฿8,000+',
      description: 'ใช้ได้กับนาฬิกาทุกรุ่นในบูติก Olym Pianus, Olympia Star และ Ogival',
      type: 'fixed',
      value: 1111,
      minSpend: 8000,
      maxDiscount: 1111,
      brandSlug: '',
      expiresAt: '2026-12-31',
      usageLimit: 500,
      usedCount: 18,
      active: true
    },
    {
      code: 'OP500',
      title: 'ลดเพิ่ม ฿500',
      titleTh: 'ลดเพิ่ม ฿500 เมื่อช้อปครบ ฿4,500',
      titleEn: 'Extra ฿500 Off on orders ฿4,500+',
      description: 'คูปองต้อนรับสมาชิกและเพื่อนใหม่ทาง LINE Official @opwatch.th',
      type: 'fixed',
      value: 500,
      minSpend: 4500,
      maxDiscount: 500,
      brandSlug: '',
      expiresAt: '2026-12-31',
      usageLimit: 1000,
      usedCount: 42,
      active: true
    },
    {
      code: 'NEWOP10',
      title: 'ลดเพิ่ม 10%',
      titleTh: 'ลดเพิ่ม 10% (สูงสุด ฿1,500) ขั้นต่ำ ฿3,000',
      titleEn: '10% Off (up to ฿1,500) min. spend ฿3,000',
      description: 'สำหรับการสั่งซื้อออนไลน์ผ่านเว็บไซต์ opwatch.co.th',
      type: 'percent',
      value: 10,
      minSpend: 3000,
      maxDiscount: 1500,
      brandSlug: '',
      expiresAt: '2026-12-31',
      usageLimit: 500,
      usedCount: 27,
      active: true
    },
    {
      code: 'SWISS15',
      title: 'ลด 15% เรือนเวลาสวิส',
      titleTh: 'ลด 15% (สูงสุด ฿3,500) เมื่อช้อปครบ ฿10,000',
      titleEn: '15% Off (up to ฿3,500) on ฿10,000+ Swiss Collection',
      description: 'สิทธิพิเศษสำหรับผู้หลงใหลเรือนเวลาระดับพรีเมียม',
      type: 'percent',
      value: 15,
      minSpend: 10000,
      maxDiscount: 3500,
      brandSlug: '',
      expiresAt: '2026-12-31',
      usageLimit: 300,
      usedCount: 11,
      active: true
    },
    {
      code: 'GIFT2000',
      title: 'บัตรของขวัญ OPWatch ฿2,000',
      titleTh: 'บัตรของขวัญ OPWatch Gift Card มูลค่า ฿2,000',
      titleEn: 'OPWatch Luxury Gift Card ฿2,000',
      description: 'ใช้แทนเงินสดได้ทันทีสำหรับสั่งซื้อเรือนเวลาของขวัญ',
      type: 'giftcard',
      value: 2000,
      minSpend: 2500,
      maxDiscount: 2000,
      brandSlug: '',
      expiresAt: '2027-12-31',
      usageLimit: 100,
      usedCount: 3,
      active: true
    },
    {
      code: 'OPWELCOME300',
      title: 'ส่วนลดต้อนรับสมาชิกใหม่ ฿300',
      titleTh: 'ลดทันที ฿300 เมื่อช้อปครบ ฿3,000',
      titleEn: 'Welcome ฿300 Off on orders ฿3,000+',
      description: 'สำหรับลูกค้าที่สั่งซื้อผ่านเว็บไซต์ opwatch.co.th',
      type: 'fixed',
      value: 300,
      minSpend: 3000,
      maxDiscount: 300,
      brandSlug: '',
      expiresAt: '2027-12-31',
      usageLimit: 1000,
      usedCount: 15,
      active: true
    },
    {
      code: 'GIFT1000',
      title: 'บัตรของขวัญ OPWatch ฿1,000',
      titleTh: 'บัตรของขวัญ OPWatch Gift Card มูลค่า ฿1,000',
      titleEn: 'OPWatch Boutique Gift Card ฿1,000',
      description: 'บัตรของขวัญดิจิทัลใช้แทนเงินสด',
      type: 'giftcard',
      value: 1000,
      minSpend: 1500,
      maxDiscount: 1000,
      brandSlug: '',
      expiresAt: '2027-12-31',
      usageLimit: 200,
      usedCount: 5,
      active: true
    },
    {
      code: 'GIFT3000',
      title: 'บัตรของขวัญ OPWatch ฿3,000',
      titleTh: 'บัตรของขวัญ OPWatch Luxury Gift Card มูลค่า ฿3,000',
      titleEn: 'OPWatch Luxury Gift Card ฿3,000',
      description: 'บัตรของขวัญดิจิทัลใช้แทนเงินสด',
      type: 'giftcard',
      value: 3000,
      minSpend: 3500,
      maxDiscount: 3000,
      brandSlug: '',
      expiresAt: '2027-12-31',
      usageLimit: 100,
      usedCount: 2,
      active: true
    },
    {
      code: 'GIFT5000',
      title: 'บัตรของขวัญ OPWatch ฿5,000',
      titleTh: 'บัตรของขวัญ OPWatch Prestige Gift Card มูลค่า ฿5,000',
      titleEn: 'OPWatch Prestige Gift Card ฿5,000',
      description: 'บัตรของขวัญดิจิทัลใช้แทนเงินสด',
      type: 'giftcard',
      value: 5000,
      minSpend: 5500,
      maxDiscount: 5000,
      brandSlug: '',
      expiresAt: '2027-12-31',
      usageLimit: 50,
      usedCount: 1,
      active: true
    }
  ]
}

export function defaultBranches() {
  return [
    {
      slug: 'inter-times-headquarters-bangkok',
      name: 'สำนักงานใหญ่ & ศูนย์บริการ บริษัท อินเตอร์ไทมส์ จำกัด (เพชรบุรีตัดใหม่)',
      nameTh: 'สำนักงานใหญ่ & ศูนย์บริการ บริษัท อินเตอร์ไทมส์ จำกัด (เพชรบุรีตัดใหม่)',
      nameEn: 'Inter Times Co., Ltd. Head Office & Official Service Center (Ratchathewi)',
      zone: 'bangkok',
      address: '1091/229 ซอย 35 ถนนเพชรบุรีตัดใหม่ แขวงมักกะสัน เขตราชเทวี กรุงเทพมหานคร 10400',
      addressEn: '1091/229 Soi 35, New Phetchaburi Rd., Makkasan, Ratchathewi, Bangkok 10400',
      phone: '02 251 5777',
      hours: 'จันทร์ – ศุกร์ 09:00 – 17:30 น. (เว้นวันหยุดนักขัตฤกษ์)',
      lineUrl: 'https://line.me/ti/p/~opwatch.th',
      mapUrl: 'https://maps.google.com/?q=1091/229+New+Phetchaburi+Rd+Makkasan+Ratchathewi+Bangkok+10400',
      services: ['click_collect', 'gift_wrap', 'strap_resize', 'warranty_center'],
      sortOrder: 1,
      active: true
    },
    {
      slug: 'central-chidlom-watch-gallery',
      name: 'เคาน์เตอร์นาฬิกา เซ็นทรัล ชิดลม (แผนกนาฬิกา ชั้น 3)',
      nameTh: 'เคาน์เตอร์นาฬิกา เซ็นทรัล ชิดลม (แผนกนาฬิกา ชั้น 3)',
      nameEn: 'Central Chidlom Watch Salon (3rd Floor)',
      zone: 'bangkok',
      address: '1027 ถนนเพลินจิต แขวงลุมพินี เขตปทุมวัน กรุงเทพมหานคร 10330',
      addressEn: '1027 Ploenchit Rd., Lumpini, Pathum Wan, Bangkok 10330',
      phone: '02 251 5777',
      hours: 'ทุกวัน 10:00 – 22:00 น.',
      lineUrl: 'https://line.me/ti/p/~opwatch.th',
      mapUrl: 'https://maps.google.com/?q=Central+Chidlom+Bangkok',
      services: ['click_collect', 'gift_wrap', 'strap_resize'],
      sortOrder: 2,
      active: true
    },
    {
      slug: 'siam-paragon-watch-galleria',
      name: 'เคาน์เตอร์นาฬิกา สยามพารากอน (Watch Galleria ชั้น M)',
      nameTh: 'เคาน์เตอร์นาฬิกา สยามพารากอน (Watch Galleria ชั้น M)',
      nameEn: 'Siam Paragon Watch Galleria (M Floor)',
      zone: 'bangkok',
      address: '991 ถนนพระรามที่ 1 แขวงปทุมวัน เขตปทุมวัน กรุงเทพมหานคร 10330',
      addressEn: '991 Rama I Rd., Pathum Wan, Bangkok 10330',
      phone: '02 251 5777',
      hours: 'ทุกวัน 10:00 – 22:00 น.',
      lineUrl: 'https://line.me/ti/p/~opwatch.th',
      mapUrl: 'https://maps.google.com/?q=Siam+Paragon+Bangkok',
      services: ['click_collect', 'gift_wrap', 'strap_resize'],
      sortOrder: 3,
      active: true
    },
    {
      slug: 'central-ladprao-watch-dept',
      name: 'เคาน์เตอร์นาฬิกา เซ็นทรัล ลาดพร้าว (แผนกนาฬิกา ชั้น 2)',
      nameTh: 'เคาน์เตอร์นาฬิกา เซ็นทรัล ลาดพร้าว (แผนกนาฬิกา ชั้น 2)',
      nameEn: 'Central Ladprao Watch Counter (2nd Floor)',
      zone: 'bangkok',
      address: '1693 ถนนพหลโยธิน แขวงจตุจักร เขตจตุจักร กรุงเทพมหานคร 10900',
      addressEn: '1693 Phahonyothin Rd., Chatuchak, Bangkok 10900',
      phone: '02 251 5777',
      hours: 'ทุกวัน 10:00 – 22:00 น.',
      lineUrl: 'https://line.me/ti/p/~opwatch.th',
      mapUrl: 'https://maps.google.com/?q=Central+Ladprao+Bangkok',
      services: ['click_collect', 'gift_wrap', 'strap_resize'],
      sortOrder: 4,
      active: true
    },
    {
      slug: 'central-chiangmai-counter',
      name: 'เคาน์เตอร์นาฬิกา เซ็นทรัล เชียงใหม่ (ชั้น 2)',
      nameTh: 'เคาน์เตอร์นาฬิกา เซ็นทรัล เชียงใหม่ (ชั้น 2)',
      nameEn: 'Central Chiangmai Watch Counter (2nd Floor)',
      zone: 'north',
      address: '99, 99/1-99/2 หมู่ 4 ถนนซุปเปอร์ไฮเวย์ ตำบลฟ้าฮ่าม อำเภอเมืองเชียงใหม่ เชียงใหม่ 50000',
      addressEn: '99 Superhighway Rd., Fa Ham, Mueang Chiang Mai 50000',
      phone: '02 251 5777',
      hours: 'ทุกวัน 10:00 – 21:30 น.',
      lineUrl: 'https://line.me/ti/p/~opwatch.th',
      mapUrl: 'https://maps.google.com/?q=Central+Festival+Chiangmai',
      services: ['click_collect', 'gift_wrap', 'strap_resize'],
      sortOrder: 5,
      active: true
    },
    {
      slug: 'central-phuket-counter',
      name: 'เคาน์เตอร์นาฬิกา เซ็นทรัล ภูเก็ต (ชั้น 2)',
      nameTh: 'เคาน์เตอร์นาฬิกา เซ็นทรัล ภูเก็ต (ชั้น 2)',
      nameEn: 'Central Phuket Watch Counter (2nd Floor)',
      zone: 'south',
      address: '74-75 หมู่ 5 ถนนวิชิตสงคราม ตำบลวิชิต อำเภอเมืองภูเก็ต ภูเก็ต 83000',
      addressEn: '74-75 Wichit Songkhram Rd., Mueang Phuket 83000',
      phone: '02 251 5777',
      hours: 'ทุกวัน 10:30 – 22:00 น.',
      lineUrl: 'https://line.me/ti/p/~opwatch.th',
      mapUrl: 'https://maps.google.com/?q=Central+Phuket',
      services: ['click_collect', 'gift_wrap', 'strap_resize'],
      sortOrder: 6,
      active: true
    }
  ]
}

export function defaultPages() {
  return [
    {
      slug: 'privacy-policy',
      category: 'legal',
      title: 'นโยบายความเป็นส่วนตัว (Privacy Policy)',
      titleTh: 'นโยบายความเป็นส่วนตัว (PDPA Privacy Policy)',
      titleEn: 'Privacy Policy (Thailand PDPA)',
      summary: 'มาตรฐานการคุ้มครองข้อมูลส่วนบุคคลของลูกค้าตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 โดย บริษัท อินเตอร์ไทมส์ จำกัด',
      summaryEn: 'Personal Data Protection Act B.E. 2562 (PDPA) compliance notice by Inter Times Co., Ltd.',
      contentTh: `
        <h2>1. ผู้ควบคุมข้อมูลส่วนบุคคล</h2>
        <p><strong>บริษัท อินเตอร์ไทมส์ จำกัด</strong> (“บริษัทฯ”) ผู้จัดจำหน่ายนาฬิกา <strong>Olym Pianus</strong>, <strong>Olympia Star</strong> และ <strong>Ogival</strong> อย่างเป็นทางการแต่เพียงผู้เดียวในประเทศไทย ตั้งอยู่ที่ 1091/229 ซอย 35 ถนนเพชรบุรีตัดใหม่ แขวงมักกะสัน เขตราชเทวี กรุงเทพมหานคร 10400 โทรศัพท์ 02 251 5777 ให้ความสำคัญสูงสุดต่อการคุ้มครองข้อมูลส่วนบุคคลของท่านตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)</p>
        <h2>2. ข้อมูลส่วนบุคคลที่บริษัทฯ เก็บรวบรวม</h2>
        <ul>
          <li><strong>ข้อมูลระบุตัวตนและติดต่อ:</strong> ชื่อ-นามสกุล หมายเลขโทรศัพท์ อีเมล LINE ID และที่อยู่สำหรับจัดส่งสินค้าภายในประเทศไทย</li>
          <li><strong>ข้อมูลคำสั่งซื้อและบริการหลังการขาย:</strong> ประวัติการสั่งซื้อ หมายเลขเครื่อง/รุ่นนาฬิกา ใบรับประกันศูนย์ไทย คะแนนสะสม OP Point และบริการตัดสายหรือห่อของขวัญ</li>
          <li><strong>ข้อมูลทางเทคนิค:</strong> คุกกี้ที่จำเป็นต่อการทำงานของตะกร้าสินค้า การเข้าสู่ระบบสมาชิก และสถิติการใช้งานเว็บไซต์แบบไม่ระบุตัวตน</li>
        </ul>
        <h2>3. วัตถุประสงค์ในการประมวลผลข้อมูล</h2>
        <p>บริษัทฯ ใช้ข้อมูลส่วนบุคคลของท่านเพื่อดำเนินการยืนยันคำสั่งซื้อ จัดส่งเรือนเวลาพร้อมประกันภัย ออกใบเสร็จ/ใบกำกับภาษี ลงทะเบียนรับประกันศูนย์ไทย 2 ปี คำนวณคะแนนสะสม OP Point และติดต่อแจ้งสถานะการจัดส่งหรือบริการซ่อมบำรุงเท่านั้น โดยไม่นำข้อมูลไปจำหน่ายแก่บุคคลภายนอกโดยเด็ดขาด</p>
        <h2>4. สิทธิของเจ้าของข้อมูลส่วนบุคคล</h2>
        <p>ท่านมีสิทธิขอเข้าถึง แก้ไข ลบ ระงับการใช้ หรือเพิกถอนความยินยอมได้ทุกเมื่อ โดยติดต่อเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO) โทร. <strong>02 251 5777</strong> หรืออีเมล <strong>info@opwatch.co.th</strong></p>
      `,
      contentEn: `
        <h2>1. Data Controller</h2>
        <p><strong>Inter Times Co., Ltd.</strong> (“the Company”), official sole distributor of <strong>Olym Pianus</strong>, <strong>Olympia Star</strong>, and <strong>Ogival</strong> watches in Thailand, located at 1091/229 Soi 35, New Phetchaburi Rd., Makkasan, Ratchathewi, Bangkok 10400 (Tel. 02 251 5777), strictly protects your personal data in accordance with Thailand's Personal Data Protection Act B.E. 2562 (PDPA).</p>
        <h2>2. Personal Data We Collect</h2>
        <ul>
          <li><strong>Identity & Contact Details:</strong> Full name, telephone number, email address, LINE ID, and Thailand delivery address.</li>
          <li><strong>Order & Warranty Records:</strong> Purchase history, watch reference/serial details, 2-year official warranty registration, and OP Privilege Points balance.</li>
          <li><strong>Technical Data:</strong> Essential session cookies required for shopping cart persistence, authentication, and security.</li>
        </ul>
        <h2>3. Purpose of Processing & Data Subject Rights</h2>
        <p>Your data is processed solely to fulfill orders, provide insured delivery across Thailand, register official warranties, and administer loyalty rewards. You may request access, correction, or deletion at any time by contacting <strong>info@opwatch.co.th</strong> or calling <strong>02 251 5777</strong>.</p>
      `,
      banner: '/images/op/hero-diver-dark.jpg',
      seoTitle: 'นโยบายความเป็นส่วนตัว (PDPA) | OPWatch Thailand · บริษัท อินเตอร์ไทมส์ จำกัด',
      seoDescription: 'นโยบายคุ้มครองข้อมูลส่วนบุคคลตามมาตรฐาน PDPA สำหรับลูกค้า OPWatch.co.th โดย บริษัท อินเตอร์ไทมส์ จำกัด ตัวแทนจำหน่ายทางการในประเทศไทย',
      seoKeywords: 'นโยบายความเป็นส่วนตัว, PDPA, OPWatch, บริษัท อินเตอร์ไทมส์ จำกัด',
      ogImage: '/images/logos/inter-times-blue.jpg',
      canonicalUrl: 'https://www.opwatch.co.th/pages/privacy-policy',
      aseoSummary: 'บริษัท อินเตอร์ไทมส์ จำกัด คุ้มครองข้อมูลส่วนบุคคลของลูกค้าเว็บไซต์ opwatch.co.th ตามกฎหมาย PDPA พ.ศ. 2562 เพื่อใช้ในการจัดส่งนาฬิกา ลงทะเบียนรับประกันศูนย์ไทย 2 ปี และสะสมคะแนน OP Point เท่านั้น',
      aseoFaqs: [
        { q: 'OPWatch เก็บข้อมูลส่วนบุคคลอะไรบ้าง?', a: 'เก็บเฉพาะข้อมูลที่จำเป็นต่อการจัดส่งและรับประกันสินค้า ได้แก่ ชื่อ เบอร์โทรศัพท์ อีเมล ที่อยู่จัดส่งในไทย และประวัตินาฬิกาที่สั่งซื้อ' },
        { q: 'ติดต่อขอลบหรือแก้ไขข้อมูลส่วนบุคคลได้อย่างไร?', a: 'ติดต่อ บริษัท อินเตอร์ไทมส์ จำกัด โทร. 02 251 5777 หรือ LINE ID: opwatch.th ในวันและเวลาทำการ' }
      ],
      schemaType: 'WebPage',
      status: 'published',
      sortOrder: 1
    },
    {
      slug: 'cookie-policy',
      category: 'legal',
      title: 'นโยบายคุกกี้ (Cookie Policy)',
      titleTh: 'นโยบายการใช้คุกกี้ (Cookie Policy)',
      titleEn: 'Cookie Policy',
      summary: 'รายละเอียดการใช้คุกกี้เพื่อประสบการณ์การเลือกชมเรือนเวลา ตะกร้าสินค้า และความปลอดภัยสูงสุดบนเว็บไซต์ opwatch.co.th',
      summaryEn: 'How opwatch.co.th uses essential, preference, and analytics cookies under Thailand PDPA standards.',
      contentTh: `
        <h2>คุกกี้คืออะไร?</h2>
        <p>คุกกี้ (Cookies) คือไฟล์ข้อมูลขนาดเล็กที่จัดเก็บไว้ในเบราว์เซอร์ของท่านเมื่อเข้าชม <strong>www.opwatch.co.th</strong> เพื่อจดจำรายการสินค้าในตะกร้า ภาษาที่ท่านเลือก (ไทย/อังกฤษ) คูปองส่วนลดที่เก็บไว้ และสถานะการเข้าสู่ระบบสมาชิกอย่างปลอดภัย</p>
        <h2>ประเภทของคุกกี้ที่เราใช้งาน</h2>
        <ul>
          <li><strong>คุกกี้ที่มีความจำเป็นอย่างยิ่ง (Strictly Necessary Cookies):</strong> จำเป็นสำหรับการทำงานของระบบตะกร้าสินค้า การชำระเงิน และการยืนยันตัวตนผู้ใช้งาน ไม่สามารถปิดการทำงานได้</li>
          <li><strong>คุกกี้เพื่อการจดจำการตั้งค่า (Functional Cookies):</strong> จดจำภาษา ขนาดข้อมือที่เลือก และรายการนาฬิกาที่ท่านเปรียบเทียบ</li>
          <li><strong>คุกกี้เพื่อการวิเคราะห์และโปรโมชั่น (Analytics & Marketing Cookies):</strong> ช่วยให้เราปรับปรุงความเร็วเว็บไซต์และนำเสนอโปรโมชั่นที่ตรงกับความสนใจของท่าน โดยจะทำงานเมื่อได้รับความยินยอมเท่านั้น</li>
        </ul>
        <h2>การจัดการความยินยอมคุกกี้</h2>
        <p>ท่านสามารถปรับเปลี่ยนการตั้งค่าคุกกี้ได้ตลอดเวลาผ่านแถบตั้งค่าคุกกี้บนหน้าเว็บไซต์ หรือผ่านการตั้งค่าเบราว์เซอร์ของท่าน</p>
      `,
      contentEn: `
        <h2>What Are Cookies?</h2>
        <p>Cookies are small text files stored on your device when visiting <strong>www.opwatch.co.th</strong> to preserve your shopping bag, preferred language (Thai/English), saved vouchers, and secure member session.</p>
        <h2>Categories of Cookies Used</h2>
        <ul>
          <li><strong>Strictly Necessary Cookies:</strong> Required for cart checkout, session security, and CSRF/HMAC verification.</li>
          <li><strong>Preference Cookies:</strong> Remember your selected language, branch preference, and watch comparison list.</li>
          <li><strong>Analytics & Campaign Cookies:</strong> Activated only upon your consent to improve site performance and tailor horological promotions.</li>
        </ul>
      `,
      banner: '/images/op/hero-ceramic-dark.jpg',
      seoTitle: 'นโยบายคุกกี้ (Cookie Policy) | OPWatch Thailand',
      seoDescription: 'รายละเอียดการใช้คุกกี้และการตั้งค่าความเป็นส่วนตัวบนเว็บไซต์ OPWatch.co.th โดย บริษัท อินเตอร์ไทมส์ จำกัด',
      seoKeywords: 'นโยบายคุกกี้, Cookie Policy, OPWatch Thailand',
      ogImage: '/images/logos/inter-times-blue.jpg',
      canonicalUrl: 'https://www.opwatch.co.th/pages/cookie-policy',
      aseoSummary: 'เว็บไซต์ opwatch.co.th ใช้คุกกี้ที่จำเป็นสำหรับระบบตะกร้าสินค้าและการเข้าสู่ระบบสมาชิก รวมถึงคุกกี้เพื่อจดจำภาษาและคูปองส่วนลด โดยลูกค้าสามารถเลือกให้ความยินยอมได้ตามมาตรฐาน PDPA',
      aseoFaqs: [
        { q: 'หากปฏิเสธคุกกี้ที่ไม่จำเป็นยังสั่งซื้อนาฬิกาได้หรือไม่?', a: 'สามารถสั่งซื้อได้ตามปกติ 100% เนื่องจากระบบตะกร้าสินค้าและการชำระเงินใช้เฉพาะคุกกี้ที่จำเป็นเท่านั้น' }
      ],
      schemaType: 'WebPage',
      status: 'published',
      sortOrder: 2
    },
    {
      slug: 'terms-and-conditions',
      category: 'legal',
      title: 'ข้อตกลงและเงื่อนไขการใช้บริการ (Terms & Conditions)',
      titleTh: 'ข้อตกลงและเงื่อนไขการสั่งซื้อสินค้า (Terms & Conditions)',
      titleEn: 'Terms & Conditions of Sale',
      summary: 'ข้อกำหนดและเงื่อนไขการสั่งซื้อนาฬิกาออนไลน์ การชำระเงิน การจัดส่งภายในประเทศไทย และการรับประกันศูนย์ไทย',
      summaryEn: 'Official terms governing watch purchases, domestic Thailand shipping, pricing, loyalty points, and warranty coverage.',
      contentTh: `
        <h2>1. ขอบเขตการให้บริการเฉพาะในประเทศไทย</h2>
        <p>เว็บไซต์ <strong>www.opwatch.co.th</strong> ดำเนินการโดย <strong>บริษัท อินเตอร์ไทมส์ จำกัด</strong> ให้บริการจำหน่ายและจัดส่งนาฬิกาของแท้เฉพาะภายในราชอาณาจักรไทยครบทั้ง 77 จังหวัดเท่านั้น (งดจัดส่งต่างประเทศ)</p>
        <h2>2. ความถูกต้องของราคาและโปรโมชั่น</h2>
        <p>ราคาสินค้าทุกรายการแสดงเป็นสกุลเงินบาทไทย (THB · ฿) รวมภาษีมูลค่าเพิ่มแล้ว คูปองส่วนลดและบัตรของขวัญสามารถใช้ได้ตามเงื่อนไขยอดสั่งซื้อขั้นต่ำและระยะเวลาที่กำหนดในหน้าโปรโมชั่น</p>
        <h2>3. การยืนยันคำสั่งซื้อและการจัดส่ง</h2>
        <ul>
          <li>จัดส่งด่วนพร้อมประกันภัยพัสดุทั่วประเทศไทย ภายใน 1–3 วันทำการหลังยืนยันการชำระเงิน</li>
          <li>บริการ <strong>Click & Collect</strong> รับสินค้าที่สำนักงานใหญ่อินเตอร์ไทมส์หรือเคาน์เตอร์สาขาที่ร่วมรายการ พร้อมบริการตัดสายนาฬิกาฟรี</li>
        </ul>
        <h2>4. การรับประกันศูนย์ไทย 2 ปีเต็ม</h2>
        <p>นาฬิกาทุกเรือนจาก Olym Pianus, Olympia Star และ Ogival เป็นสินค้าของแท้ 100% มาพร้อมกล่องคู่มือและใบรับประกันศูนย์ไทยจาก บริษัท อินเตอร์ไทมส์ จำกัด นาน 2 ปีเต็ม (ครอบคลุมกลไกตัวเครื่องและแบตเตอรี่ตามเงื่อนไขบริษัท)</p>
      `,
      contentEn: `
        <h2>1. Thailand-Exclusive Service Scope</h2>
        <p><strong>www.opwatch.co.th</strong> is operated by <strong>Inter Times Co., Ltd.</strong> and ships authentic timepieces exclusively within all 77 provinces of Thailand.</p>
        <h2>2. Pricing, Vouchers & Loyalty Points</h2>
        <p>All prices are quoted in Thai Baht (฿ THB) inclusive of VAT. Promotional codes, OP Privilege Points, and OPWatch Gift Cards apply in accordance with published campaign terms.</p>
        <h2>3. Insured Delivery & Official 2-Year Warranty</h2>
        <p>Every Olym Pianus, Olympia Star, and Ogival timepiece ships with its official presentation box and a 2-Year Thailand Official Warranty serviced by Inter Times Co., Ltd.</p>
      `,
      banner: '/images/op/hero-gold-stones.jpg',
      seoTitle: 'ข้อตกลงและเงื่อนไขการใช้บริการ | OPWatch Thailand',
      seoDescription: 'ข้อตกลงและเงื่อนไขการสั่งซื้อนาฬิกาของแท้ Olym Pianus, Olympia Star และ Ogival บนเว็บไซต์ OPWatch.co.th',
      seoKeywords: 'ข้อตกลงและเงื่อนไข, Terms and Conditions, OPWatch, อินเตอร์ไทมส์',
      ogImage: '/images/logos/inter-times-blue.jpg',
      canonicalUrl: 'https://www.opwatch.co.th/pages/terms-and-conditions',
      aseoSummary: 'การสั่งซื้อบน opwatch.co.th จัดส่งพร้อมประกันภัยเฉพาะในประเทศไทย 77 จังหวัด ราคาแสดงเป็นเงินบาทไทย พร้อมรับประกันศูนย์ไทย 2 ปีเต็มโดย บริษัท อินเตอร์ไทมส์ จำกัด',
      aseoFaqs: [
        { q: 'OPWatch จัดส่งต่างประเทศหรือไม่?', a: 'จัดส่งเฉพาะภายในประเทศไทยครบทั้ง 77 จังหวัดเท่านั้น เพื่อคุ้มครองสิทธิ์การรับประกันศูนย์ไทยอย่างสมบูรณ์' },
        { q: 'นาฬิกาทุกเรือนรับประกันกี่ปี?', a: 'รับประกันศูนย์ไทยอย่างเป็นทางการนาน 2 ปีเต็ม โดย บริษัท อินเตอร์ไทมส์ จำกัด' }
      ],
      schemaType: 'WebPage',
      status: 'published',
      sortOrder: 3
    },
    {
      slug: 'return-policy',
      category: 'service',
      title: 'นโยบายการเปลี่ยนและคืนสินค้า 14 วัน',
      titleTh: 'นโยบายการเปลี่ยนและคืนสินค้าภายใน 14 วัน (Return & Exchange)',
      titleEn: '14-Day Return & Exchange Policy',
      summary: 'มั่นใจทุกการสั่งซื้อออนไลน์ ด้วยสิทธิ์เปลี่ยนหรือคืนสินค้าภายใน 14 วัน หากพบความบกพร่องจากการผลิตหรือการจัดส่ง',
      summaryEn: 'Shop with complete peace of mind with our 14-day return and exchange assurance.',
      contentTh: `
        <h2>เงื่อนไขการเปลี่ยนและคืนสินค้าภายใน 14 วัน</h2>
        <p>เพื่อให้ท่านมั่นใจสูงสุดในการสั่งซื้อเรือนเวลาออนไลน์กับ <strong>OPWatch.co.th</strong> ท่านสามารถแจ้งขอเปลี่ยนหรือคืนสินค้าได้ภายใน <strong>14 วัน</strong> นับจากวันที่ได้รับสินค้า ในกรณีดังต่อไปนี้:</p>
        <ul>
          <li>สินค้ามีความบกพร่องด้านกลไกหรือตำหนิจากการผลิตตั้งแต่เปิดกล่อง</li>
          <li>ได้รับสินค้าไม่ตรงตามรหัสรุ่นหรือสีหน้าปัดที่ระบุในคำสั่งซื้อ</li>
          <li>ความเสียหายที่เกิดขึ้นระหว่างการขนส่ง (แนะนำถ่ายวิดีโอขณะเปิดกล่องพัสดุเพื่อความรวดเร็วในการเคลมประกันภัย)</li>
        </ul>
        <h2>สภาพสินค้าสำหรับการเปลี่ยน/คืน</h2>
        <p>ตัวเรือนและสายนาฬิกาต้องยังไม่ผ่านการใช้งานจริง ฟิล์มกันรอย ป้ายแท็ก กล่องนาฬิกา หมอนรอง คู่มือ และใบรับประกันศูนย์ไทยต้องอยู่ครบถ้วนสมบูรณ์ (กรณีขอตัดสายล่วงหน้าตามขนาดข้อมือ ยังคงได้รับสิทธิ์เคลมเต็มจำนวนหากพบความบกพร่องของกลไกจากการผลิต)</p>
        <h2>ขั้นตอนการแจ้งเคลมด่วน</h2>
        <p>ติดต่อทีมบริการลูกค้า โทร. <strong>02 251 5777</strong> หรือส่งรูป/วิดีโอทาง <strong>LINE ID: opwatch.th</strong> บริษัทฯ รับผิดชอบค่าจัดส่งไป-กลับทั้งหมดในกรณีความผิดพลาดจากสินค้า</p>
      `,
      contentEn: `
        <h2>14-Day Return & Exchange Assurance</h2>
        <p>You may request an exchange or return within <strong>14 days</strong> of delivery if your timepiece exhibits a manufacturing defect, transit damage, or model discrepancy. Items must remain unworn with protective films, tags, presentation box, and Thailand warranty card intact.</p>
      `,
      banner: '/images/op/lifestyle-men.jpg',
      seoTitle: 'นโยบายการเปลี่ยนและคืนสินค้า 14 วัน | OPWatch Thailand',
      seoDescription: 'เงื่อนไขการเปลี่ยนและคืนนาฬิกาภายใน 14 วัน พร้อมดูแลค่าจัดส่งเคลมฟรีโดย บริษัท อินเตอร์ไทมส์ จำกัด',
      seoKeywords: 'เปลี่ยนคืนสินค้า, Return Policy, เคลมนาฬิกา OPWatch',
      ogImage: '/images/logos/inter-times-blue.jpg',
      canonicalUrl: 'https://www.opwatch.co.th/pages/return-policy',
      aseoSummary: 'ลูกค้า OPWatch.co.th สามารถแจ้งเปลี่ยนหรือคืนสินค้าได้ภายใน 14 วันนับจากวันรับสินค้า หากพบตำหนิจากการผลิตหรือได้รับรุ่นไม่ตรงคำสั่งซื้อ โดยบริษัท อินเตอร์ไทมส์ จำกัด ดูแลค่าจัดส่งเคลมฟรี',
      aseoFaqs: [
        { q: 'เปลี่ยนหรือคืนสินค้าได้ภายในกี่วัน?', a: 'แจ้งเปลี่ยนหรือคืนได้ภายใน 14 วันนับจากวันที่ได้รับพัสดุ ผ่าน LINE ID: opwatch.th หรือโทร 02 251 5777' }
      ],
      schemaType: 'FAQPage',
      status: 'published',
      sortOrder: 4
    },
    {
      slug: 'authenticity-warranty',
      category: 'service',
      title: 'รับประกันสินค้าของแท้ 100% & ศูนย์บริการไทย',
      titleTh: 'การรับประกันสินค้าของแท้ 100% & ศูนย์บริการอินเตอร์ไทมส์ 2 ปีเต็ม',
      titleEn: '100% Authenticity Guarantee & 2-Year Official Service Center',
      summary: 'ทุกเรือนส่งตรงจากตัวแทนจำหน่ายแต่เพียงผู้เดียวในประเทศไทย พร้อมช่างผู้ชำนาญการและอะไหล่แท้มาตรฐานโรงงาน',
      summaryEn: 'Every watch is guaranteed 100% authentic direct from Thailand sole distributor Inter Times Co., Ltd.',
      contentTh: `
        <h2>การันตีของแท้ 100% จากผู้นำเข้าอย่างเป็นทางการ</h2>
        <p><strong>บริษัท อินเตอร์ไทมส์ จำกัด</strong> คือผู้นำเข้าและตัวแทนจำหน่ายนาฬิกา <strong>Olym Pianus</strong>, <strong>Olympia Star</strong> และ <strong>Ogival</strong> อย่างเป็นทางการในประเทศไทย ทุกเรือนเวลาบนเว็บไซต์ <strong>opwatch.co.th</strong> ผ่านการตรวจสอบคุณภาพ (QC) ความเที่ยงตรงของกลไกและซีลกันน้ำก่อนจัดส่งถึงมือท่าน</p>
        <h2>สิทธิประโยชน์จากใบรับประกันศูนย์ไทย 2 ปี</h2>
        <ul>
          <li>ดูแลตรวจเช็คกลไกออโตเมติกและควอตซ์ฟรีตลอดระยะเวลารับประกัน 2 ปี</li>
          <li>บริการเปลี่ยนถ่านมาตรฐานสวิส/ญี่ปุ่นแท้ พร้อมทดสอบแรงดันกันน้ำด้วยเครื่องมือเฉพาะทาง</li>
          <li>อะไหล่แท้ตรงรุ่นจากโรงงานผู้ผลิต ทั้งกระจกแซฟไฟร์ เม็ดมะยม ขอบเซรามิก และสายสแตนเลส 316L</li>
        </ul>
      `,
      contentEn: `
        <h2>100% Authentic Direct from Official Distributor</h2>
        <p>Every Olym Pianus, Olympia Star, and Ogival timepiece sold on opwatch.co.th is backed by a 2-Year Thailand Official Warranty serviced at Inter Times Co., Ltd. Head Office in Ratchathewi, Bangkok.</p>
      `,
      banner: '/images/op/banner-899832ags.jpg',
      seoTitle: 'รับประกันของแท้ 100% ศูนย์ไทย 2 ปีเต็ม | OPWatch Thailand',
      seoDescription: 'มั่นใจนาฬิกาของแท้ 100% จาก บริษัท อินเตอร์ไทมส์ จำกัด พร้อมศูนย์บริการมาตรฐานและอะไหล่แท้ครบทุกรุ่น',
      seoKeywords: 'รับประกันนาฬิกา OP, ศูนย์ซ่อม Olym Pianus, ศูนย์บริการ Ogival ไทย',
      ogImage: '/images/logos/inter-times-blue.jpg',
      canonicalUrl: 'https://www.opwatch.co.th/pages/authenticity-warranty',
      aseoSummary: 'นาฬิกาทุกเรือนบน opwatch.co.th เป็นของแท้ 100% จาก บริษัท อินเตอร์ไทมส์ จำกัด มาพร้อมใบรับประกันศูนย์ไทย 2 ปีเต็มและบริการอะไหล่แท้ครบวงจร',
      aseoFaqs: [
        { q: 'ส่งซ่อมหรือเคลมประกันได้ที่ไหน?', a: 'ส่งเข้ารับบริการได้ที่ศูนย์บริการ บริษัท อินเตอร์ไทมส์ จำกัด ถนนเพชรบุรีตัดใหม่ เขตราชเทวี กรุงเทพฯ โทร 02 251 5777 หรือผ่านเคาน์เตอร์ห้างชั้นนำทั่วประเทศ' }
      ],
      schemaType: 'FAQPage',
      status: 'published',
      sortOrder: 5
    }
  ]
}

export function defaultCalendarEvents() {
  const now = new Date()
  const fmt = (offsetDays: number) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return [
    {
      title: 'ตรวจเช็คสต็อก Olym Pianus & Ogival ประจำสัปดาห์',
      cat: 'deadline',
      date: fmt(-1),
      startTime: '09:30',
      endTime: '11:00',
      allday: false,
      location: 'คลังสินค้าสำนักงานใหญ่ อินเตอร์ไทมส์ (เพชรบุรีตัดใหม่)',
      notes: 'ตรวจสอบซีเรียลนัมเบอร์ ใบรับประกันศูนย์ไทย 2 ปี และกล่องของขวัญก่อนจัดส่งคำสั่งซื้อออนไลน์',
      refCode: 'QC-WK01',
      assignee: 'ฝ่ายคลังสินค้า & QC',
      status: 'active'
    },
    {
      title: 'ประชุมทีมการตลาด & วางแคมเปญหน้าแรก OPWatch',
      cat: 'meeting',
      date: fmt(0),
      startTime: '10:30',
      endTime: '12:00',
      allday: false,
      location: 'ห้องประชุมชั้น 3 อินเตอร์ไทมส์ / Google Meet',
      notes: 'อัปเดตแบนเนอร์โปรโมชั่นประจำเดือน คูปองส่วนลดสมาชิก และยอดคลิกจาก Shopee Official Mall',
      refCode: 'MKT-SYNC',
      assignee: 'ทีมการตลาด & อีคอมเมิร์ซ',
      status: 'active'
    },
    {
      title: 'AI Content & ปรับภาพสตูดิโอคอลเลกชันใหม่ 20 รุ่น',
      cat: 'ai',
      date: fmt(0),
      startTime: '14:00',
      endTime: '16:00',
      allday: false,
      location: 'OPWatch AI Studio (/office/ai)',
      notes: 'ใช้ OP-COPY และระบบปรับภาพอัตโนมัติ (Studio White 1:1) อัปเดตรูปสินค้าและ SEO/ASEO',
      refCode: 'AI-STUDIO',
      assignee: 'OP-COPY + OP-VISION',
      status: 'active'
    },
    {
      title: 'รอบจัดส่งด่วน EMS / Kerry รอบบ่าย & แจ้งเลขพัสดุ',
      cat: 'order',
      date: fmt(1),
      startTime: '13:30',
      endTime: '15:30',
      allday: false,
      location: 'จุดแพ็กสินค้า OPWatch Boutique',
      notes: 'แพ็กกันกระแทก 3 ชั้น พร้อมผูกริบบิ้น Gift Wrap สำหรับออร์เดอร์ของขวัญ',
      refCode: 'SHIP-PM',
      assignee: 'ฝ่ายจัดส่ง',
      status: 'active'
    },
    {
      title: 'ถ่ายทำวิดีโอรีวิว Ogival Lucky Fish Swiss Automatic',
      cat: 'campaign',
      date: fmt(3),
      startTime: '11:00',
      endTime: '15:00',
      allday: false,
      location: 'โชว์รูมอินเตอร์ไทมส์ มักกะสัน',
      notes: 'ถ่ายภาพ Macro หน้าปัดแกะสลักและคลิป TikTok / Facebook Reels',
      refCode: 'CONTENT-OGV',
      assignee: 'ทีมคอนเทนต์',
      status: 'active'
    },
    {
      title: 'แคมเปญ Mega Watch Days ลดสูงสุด 35% + คูปอง OPWELCOME500',
      cat: 'campaign',
      date: `${ym}-11`,
      startTime: '00:00',
      endTime: '23:59',
      allday: true,
      location: 'opwatch.co.th & Shopee Official',
      notes: 'เปิดแบนเนอร์หลักหน้าเว็บไซต์ + ส่งบรอดแคสต์ LINE @opwatch.th',
      refCode: 'MEGA-11',
      assignee: 'ทีมอีคอมเมิร์ซ',
      status: 'active'
    },
    {
      title: 'เติมสต็อกเคาน์เตอร์ เซ็นทรัลเวิลด์ & เซ็นทรัล ลาดพร้าว',
      cat: 'order',
      date: fmt(5),
      startTime: '10:00',
      endTime: '16:00',
      allday: false,
      location: 'เซ็นทรัลเวิลด์ / เซ็นทรัล ลาดพร้าว',
      notes: 'จัดส่งรุ่นขายดี Sportmaster Automatic และ Lady Jewelry รองรับบริการ Click & Collect',
      refCode: 'BR-RESTOCK',
      assignee: 'ทีมดูแลสาขา',
      status: 'active'
    },
    {
      title: 'สรุปยอดขายผู้บริหาร & รายงานภาษีมูลค่าเพิ่มประจำเดือน',
      cat: 'deadline',
      date: `${ym}-28`,
      startTime: '15:00',
      endTime: '17:00',
      allday: false,
      location: 'ฝ่ายบัญชีและการเงิน อินเตอร์ไทมส์',
      notes: 'Export CSV รายงานคำสั่งซื้อและตรวจสอบยอดโอนทุกช่องทางในหน้า /office/reports',
      refCode: 'FIN-CLOSE',
      assignee: 'ผู้บริหาร & บัญชี',
      status: 'active'
    }
  ]
}

export function defaultAiRuns() {
  const now = new Date()
  const iso = (minsAgo: number) => new Date(now.getTime() - minsAgo * 60000).toISOString()
  return [
    {
      agentCode: 'OP-COPY',
      task: 'product_full',
      model: 'Horology Thai AI Studio',
      provider: 'OPWatch Built-in + LLM Ready',
      promptSummary: 'เขียนคำบรรยายไทย/อังกฤษ Olym Pianus Sportmaster Automatic Sapphire',
      outputPreview: 'เรือนเวลาสปอร์ตหรูกระจกแซฟไฟร์แท้ กลไกออโตเมติกญี่ปุ่น รับประกันศูนย์ไทย 2 ปี โดย บริษัท อินเตอร์ไทมส์ จำกัด',
      tokens: 640,
      durationMs: 420,
      status: 'done',
      createdAt: iso(18)
    },
    {
      agentCode: 'OP-SEO',
      task: 'product_seo',
      model: 'Horology Thai AI Studio',
      provider: 'OPWatch Built-in + LLM Ready',
      promptSummary: 'สร้าง Meta Title, Description & ASEO FAQ สำหรับ Ogival Swiss Automatic',
      outputPreview: 'Ogival นาฬิกาสวิสแท้ สัญลักษณ์ปลาโชคดี รับประกันศูนย์ไทย 2 ปี ส่งฟรีทั่วประเทศ พร้อม FAQ 3 ข้อสำหรับ AI Search',
      tokens: 510,
      durationMs: 360,
      status: 'done',
      createdAt: iso(47)
    },
    {
      agentCode: 'OP-PROMO',
      task: 'promo_copy',
      model: 'Horology Thai AI Studio',
      provider: 'OPWatch Built-in + LLM Ready',
      promptSummary: 'ร่างแคมเปญโปรโมชั่นประจำเดือน + ข้อความบรอดแคสต์ LINE @opwatch.th',
      outputPreview: 'แคมเปญ Exclusive Timepiece Privilege ลดสูงสุด 30% พร้อมบริการห่อของขวัญฟรีและรับสินค้าที่สาขา',
      tokens: 485,
      durationMs: 310,
      status: 'done',
      createdAt: iso(95)
    }
  ]
}

export function defaultOfficers(passwordHash: string, adminEmail = 'admin@opwatch.co.th') {
  const cleanAdminEmail = String(adminEmail || 'admin@opwatch.co.th').trim().toLowerCase()
  const list: Record<string, any>[] = [
    {
      code: 'OFC-001',
      name: 'ผู้บริหารสูงสุด · บริษัท อินเตอร์ไทมส์ จำกัด',
      email: cleanAdminEmail,
      passwordHash,
      phone: '02 251 5777',
      role: 'ceo',
      department: 'คณะผู้บริหาร (Executive Board)',
      position: 'Chief Executive Officer (CEO)',
      permissions: ['*'],
      status: 'active'
    },
    {
      code: 'OFC-002',
      name: 'ธนภัทร ศรีสุวรรณ (IT. Admin)',
      email: 'it@opwatch.co.th',
      passwordHash,
      phone: '02 251 5777 ต่อ 108',
      role: 'it_admin',
      department: 'เทคโนโลยีสารสนเทศ (IT & Digital)',
      position: 'Head of IT & System Administrator',
      permissions: ['*'],
      status: 'active'
    },
    {
      code: 'OFC-003',
      name: 'พิมพ์ชนก วัฒนากุล (Marketing / Sales)',
      email: 'marketing@opwatch.co.th',
      passwordHash,
      phone: '02 251 5777 ต่อ 204',
      role: 'marketing_sales',
      department: 'การตลาดและฝ่ายขายออนไลน์',
      position: 'Digital Marketing & E-Commerce Lead',
      permissions: [
        'dashboard', 'calendar', 'ai', 'orders', 'orders_fulfill',
        'products_view', 'products_retail', 'products_edit',
        'promotions', 'promotions_view', 'customers', 'pages', 'warranty', 'chats', 'reports'
      ],
      status: 'active'
    },
    {
      code: 'OFC-004',
      name: 'กิตติพงศ์ วงศ์สวัสดิ์ (คลังสินค้า 5 ช่องทาง)',
      email: 'warehouse@opwatch.co.th',
      passwordHash,
      phone: '02 251 5777 ต่อ 305',
      role: 'warehouse',
      department: 'คลังสินค้ากลางและจัดส่ง (Omnichannel Warehouse)',
      position: 'Warehouse & Marketplace Stock Manager',
      permissions: [
        'dashboard', 'calendar', 'warehouse', 'warehouse_5ch',
        'products_view', 'products_stock', 'orders', 'orders_fulfill', 'warranty'
      ],
      status: 'active'
    },
    {
      code: 'DLR-001',
      name: 'สยามไทม์ แกลเลอรี่ · ตัวแทนจำหน่ายทางการ',
      email: 'dealer@opwatch.co.th',
      passwordHash,
      phone: '081 899 2455',
      role: 'dealer',
      department: 'เครือข่ายตัวแทนจำหน่าย (Authorized Dealer)',
      position: 'Platinum Authorized Partner',
      dealerCode: 'DLR-BKK-01',
      dealerName: 'สยามไทม์ แกลเลอรี่ (Siam Time Gallery)',
      dealerTier: 'Platinum',
      discountPct: 35,
      branchSlug: 'central-chidlom-watch-galleria',
      permissions: [
        'dealer_portal', 'warehouse', 'warehouse_dealer',
        'products_view', 'products_dealer', 'promotions_view', 'orders_pickup', 'warranty'
      ],
      status: 'active'
    },
    {
      code: 'DLR-002',
      name: 'ลานนา วอทช์ บูติก เชียงใหม่ · ตัวแทนจำหน่าย',
      email: 'dealer-cnx@opwatch.co.th',
      passwordHash,
      phone: '089 755 8899',
      role: 'dealer',
      department: 'เครือข่ายตัวแทนจำหน่ายภาคเหนือ',
      position: 'Gold Authorized Partner',
      dealerCode: 'DLR-CNX-02',
      dealerName: 'ลานนา วอทช์ บูติก เชียงใหม่',
      dealerTier: 'Gold',
      discountPct: 30,
      branchSlug: 'central-chiangmai-counter',
      permissions: [
        'dealer_portal', 'warehouse', 'warehouse_dealer',
        'products_view', 'products_dealer', 'promotions_view', 'orders_pickup', 'warranty'
      ],
      status: 'active'
    }
  ]

  // If cleanAdminEmail isn't ceo@opwatch.co.th, also create ceo@opwatch.co.th alias for clarity
  if (cleanAdminEmail !== 'ceo@opwatch.co.th') {
    list.splice(1, 0, {
      code: 'OFC-001B',
      name: 'วรเมธ อินเตอร์ไทมส์ (CEO)',
      email: 'ceo@opwatch.co.th',
      passwordHash,
      phone: '02 251 5777',
      role: 'ceo',
      department: 'คณะผู้บริหาร (Executive Board)',
      position: 'Managing Director',
      permissions: ['*'],
      status: 'active'
    })
  }
  return list
}

export function defaultWarranties() {
  return [
    {
      warrantyNo: 'WRT-20261101-A91',
      customerName: 'คุณณัฐพล รัตนโชติ',
      phone: '089-412-8899',
      email: 'nattapol.r@example.com',
      lineId: 'nattapol.watch',
      brandSlug: 'olympianus',
      productSku: 'OP-899832AGS',
      productName: 'Olym Pianus Sportmaster Automatic Sapphire',
      serialNo: 'OP26-899832-00418',
      purchaseDate: '2026-10-25',
      purchaseChannel: 'website',
      dealerOrBranch: 'สั่งซื้อผ่านเว็บไซต์ opwatch.co.th',
      warrantyUntil: '2028-10-25',
      status: 'verified',
      adminNote: 'ตรวจสอบหมายเลขเครื่องและใบเสร็จเรียบร้อย รับประกันศูนย์ไทย 2 ปีเต็ม'
    },
    {
      warrantyNo: 'WRT-20261102-B42',
      customerName: 'คุณอภิญญา เลิศสกุล',
      phone: '081-775-3320',
      email: 'apinya.l@example.com',
      lineId: 'apinya_l',
      brandSlug: 'ogival',
      productSku: 'OG-358-61AGR',
      productName: 'Ogival Lucky Fish Skeleton Swiss Automatic',
      serialNo: 'OG26-35861-00921',
      purchaseDate: '2026-10-29',
      purchaseChannel: 'dealer',
      dealerOrBranch: 'สยามไทม์ แกลเลอรี่ (DLR-BKK-01)',
      registeredByDealer: 'DLR-BKK-01',
      warrantyUntil: '2028-10-29',
      status: 'verified',
      adminNote: 'ตัวแทนจำหน่าย DLR-BKK-01 ลงทะเบียนหน้าเคาน์เตอร์ให้ลูกค้า'
    },
    {
      warrantyNo: 'WRT-20261103-C77',
      customerName: 'คุณศุภชัย ทองดี',
      phone: '092-601-4411',
      email: 'supachai.t@example.com',
      lineId: 'supachai92',
      brandSlug: 'olympia-star',
      productSku: 'OPA-58012MK',
      productName: 'Olympia Star Swiss Quartz Ultra-Slim Sapphire',
      serialNo: 'OPA26-58012-00155',
      purchaseDate: '2026-11-02',
      purchaseChannel: 'shopee',
      dealerOrBranch: 'OPWatch Official Shopee Mall',
      warrantyUntil: '2028-11-02',
      status: 'pending',
      adminNote: 'รอเจ้าหน้าที่ตรวจสอบรูปใบเสร็จ Shopee Mall'
    }
  ]
}

export function defaultRepairs() {
  return [
    {
      ticketNo: 'REP-20261101-701',
      warrantyNo: 'WRT-20261101-A91',
      customerName: 'คุณกิตติศักดิ์ เจริญผล',
      phone: '086-515-9090',
      email: 'kittisak.j@example.com',
      lineId: 'kittisak_j',
      brandSlug: 'olympianus',
      productSku: 'OP-89322AGSK',
      productName: 'Olym Pianus Gentleman Automatic',
      serialNo: 'OP25-89322-01190',
      serviceType: 'movement_overhaul',
      symptom: 'นาฬิกาเดินเร็วกว่าปกติประมาณวันละ 25 วินาที ต้องการตรวจเช็กกำลังลานและล้างเครื่องมาตรฐานศูนย์',
      images: ['/images/op/portrait-8909amk.jpg'],
      dropoffMethod: 'head_office',
      branchSlug: 'inter-times-head-office',
      estimatedCost: 0,
      status: 'repairing',
      technicianNote: 'อยู่ในระยะรับประกันศูนย์ 2 ปี ช่างเทคนิคกำลังปรับตั้ง Timegrapher และทดสอบกันน้ำ 5 ATM ฟรีไม่มีค่าใช้จ่าย'
    },
    {
      ticketNo: 'REP-20261103-702',
      warrantyNo: '',
      customerName: 'คุณมนัสนันท์ วงศ์ไพศาล',
      phone: '084-228-7112',
      email: 'manassanan@example.com',
      lineId: 'manas_watch',
      brandSlug: 'olympia-star',
      productSku: 'OPA-28039DLS',
      productName: 'Olympia Star Lady Jewelry Swiss Quartz',
      serialNo: 'OPA23-28039-00612',
      serviceType: 'battery_seal',
      symptom: 'ถ่านหมดและต้องการเปลี่ยนซีลยางกันน้ำพร้อมทำความสะอาดสายสเตนเลสด้วยคลื่นอัลตราโซนิก',
      images: ['/images/op/watch-82672-lady.png'],
      dropoffMethod: 'branch_dropoff',
      branchSlug: 'siam-paragon-watch-galleria',
      estimatedCost: 450,
      status: 'received',
      submittedByDealer: 'DLR-BKK-01',
      technicianNote: 'รับเรือนเวลาจากเคาน์เตอร์สยามพารากอน เตรียมส่งเข้าห้องแล็บสำนักงานใหญ่ถนนเพชรบุรีตัดใหม่'
    }
  ]
}

export function defaultTreePages(allProducts: Record<string, any>[]) {
  const byBrand = (b: string, limit = 6, keyword = '') => {
    const brandItems = allProducts.filter((p) => p.brand === b && p.status === 'active')
    if (keyword) {
      const kw = keyword.toLowerCase()
      const matched = brandItems.filter((p) =>
        `${p.name || ''} ${p.nameTh || ''} ${p.sku || ''} ${p.shortDescription || ''}`.toLowerCase().includes(kw)
      )
      if (matched.length >= 2) return matched.slice(0, limit).map((p) => Number(p.id))
    }
    return brandItems.slice(0, limit).map((p) => Number(p.id))
  }

  // Note: `parentSlug` is resolved to numeric `parentId` during seeding in `seed.ts`
  return [
    // ==================== ROOT 1: หน้าหลักเว็บไซต์ & หน้าหลักของระบบ ====================
    {
      slug: 'site-home',
      parentSlug: null,
      pageType: 'system_page',
      routePath: '/',
      category: 'main_menu',
      heroEyebrow: 'OFFICIAL SOLE DISTRIBUTOR THAILAND · INTER TIMES CO., LTD.',
      title: 'หน้าแรกเว็บไซต์ (Home Boutique)',
      titleTh: 'เรือนเวลาแท้ระดับตำนาน ประจำประเทศไทย',
      titleEn: 'Official Swiss & Japanese Horology Boutique in Thailand',
      summary: 'ศูนย์รวมนาฬิกา Olym Pianus, Olympia Star และ Ogival ของแท้ 100% กระจกแซฟไฟร์แท้ รับประกันศูนย์ไทย 2 ปี โดย บริษัท อินเตอร์ไทมส์ จำกัด',
      summaryEn: 'Official Thailand flagship store for Olym Pianus, Olympia Star, and Ogival timepieces with 2-year warranty.',
      contentTh: `<p>คัดสรรเรือนเวลาคุณภาพสูงโดย <strong>บริษัท อินเตอร์ไทมส์ จำกัด</strong> ตัวแทนจำหน่ายอย่างเป็นทางการแต่เพียงผู้เดียวในประเทศไทย ทุกเรือนมาพร้อมกระจกแซฟไฟร์แท้ กันรอยขีดข่วน และบริการดูแลหลังการขายโดยช่างผู้ชำนาญการประจำศูนย์เพชรบุรีตัดใหม่</p>`,
      contentEn: `<p>Curated official timepieces by <strong>Inter Times Co., Ltd.</strong>, sole authorized distributor in Thailand.</p>`,
      banner: '/images/op/hero-diver-dark.jpg',
      styleConfig: {
        fontFamily: 'Prompt',
        headingColor: '#ffffff',
        textColor: '#1e2438',
        accentColor: '#c9a84c',
        bgColor: '#0c1228',
        overlayOpacity: 0.55,
        headingSize: 'xl'
      },
      productIds: [...byBrand('olympianus', 3), ...byBrand('olympia-star', 2), ...byBrand('ogival', 3)],
      ctaText: 'เลือกชมคอลเลกชันทั้งหมด',
      ctaUrl: '/products',
      seoTitle: 'OPWatch.co.th | นาฬิกา Olym Pianus, Olympia Star, Ogival ศูนย์ไทยแท้ 100%',
      seoDescription: 'ช้อปนาฬิกาข้อมือ Olym Pianus, Olympia Star และ Ogival ของแท้ประกันศูนย์ไทย 2 ปี โดย บริษัท อินเตอร์ไทมส์ จำกัด ส่งฟรีทั่วไทย',
      seoKeywords: 'Olym Pianus, Olympia Star, Ogival, นาฬิกาข้อมือของแท้, OPWatch, อินเตอร์ไทมส์',
      status: 'published',
      sortOrder: 10
    },
    {
      slug: 'site-about',
      parentSlug: 'site-home',
      pageType: 'system_page',
      routePath: '/about',
      category: 'main_menu',
      heroEyebrow: 'HERITAGE & CRAFTSMANSHIP',
      title: 'เกี่ยวกับเรา (บริษัท อินเตอร์ไทมส์ จำกัด)',
      titleTh: 'กว่าทศวรรษแห่งความไว้วางใจ ผู้นำเข้าเรือนเวลาคุณภาพสู่เมืองไทย',
      titleEn: 'About Inter Times Co., Ltd. — Official Watch Distributor Thailand',
      summary: 'เรื่องราวของ บริษัท อินเตอร์ไทมส์ จำกัด ผู้แทนจำหน่ายนาฬิกา Olym Pianus, Olympia Star และ Ogival อย่างเป็นทางการในประเทศไทย',
      contentTh: `<h2>มาตรฐานเรือนเวลาแท้ที่คนไทยไว้วางใจ</h2><p><strong>บริษัท อินเตอร์ไทมส์ จำกัด</strong> มุ่งมั่นคัดสรรนาฬิกาที่เปี่ยมด้วยคุณค่าทางวิศวกรรมและดีไซน์เหนือกาลเวลา พร้อมศูนย์บริการมาตรฐานสากล ณ ถนนเพชรบุรีตัดใหม่ กรุงเทพมหานคร และเคาน์เตอร์ห้างสรรพสินค้าชั้นนำทั่วประเทศ</p>`,
      banner: '/images/op/hero-ceramic-dark.jpg',
      styleConfig: { fontFamily: 'Prompt', headingColor: '#ffffff', textColor: '#23264d', accentColor: '#1d2088', bgColor: '#141a38', overlayOpacity: 0.58, headingSize: 'lg' },
      productIds: byBrand('olympianus', 4),
      seoTitle: 'เกี่ยวกับเรา | บริษัท อินเตอร์ไทมส์ จำกัด · OPWatch Thailand',
      seoDescription: 'รู้จัก บริษัท อินเตอร์ไทมส์ จำกัด ผู้นำเข้าและจัดจำหน่ายนาฬิกา Olym Pianus, Olympia Star และ Ogival อย่างเป็นทางการในประเทศไทย',
      seoKeywords: 'บริษัท อินเตอร์ไทมส์ จำกัด, Inter Times, ตัวแทนจำหน่าย Olym Pianus, Ogival ประเทศไทย',
      status: 'published',
      sortOrder: 11
    },
    {
      slug: 'site-services',
      parentSlug: 'site-home',
      pageType: 'system_page',
      routePath: '/services',
      category: 'main_menu',
      heroEyebrow: 'AUTHORIZED SERVICE CENTER',
      title: 'บริการหลังการขาย & ศูนย์ซ่อมมาตรฐาน',
      titleTh: 'ศูนย์บริการครบวงจร ดูแลเรือนเวลาคู่ใจโดยช่างผู้เชี่ยวชาญ',
      titleEn: 'Official Horology Service & Care Center',
      summary: 'บริการล้างเครื่อง เปลี่ยนถ่านสวิส ซีลยางกันน้ำ ตัดสาย และตรวจเช็กความเที่ยงตรงด้วยเครื่องมือมาตรฐานสวิส',
      contentTh: `<h2>ดูแลทุกรายละเอียดโดยทีมช่างอินเตอร์ไทมส์</h2><p>เรือนเวลาทุกเรือนจาก OPWatch ได้รับสิทธิ์ตรวจเช็กสภาพกลไก ทดสอบแรงดันน้ำ และบริการทำความสะอาดตัวเรือนด้วยเครื่อง Ultrasonic ตลอดอายุการรับประกัน</p>`,
      banner: '/images/op/portrait-8909amk.jpg',
      styleConfig: { fontFamily: 'Prompt', headingColor: '#ffffff', textColor: '#23264d', accentColor: '#1d2088', bgColor: '#101836', overlayOpacity: 0.6, headingSize: 'lg' },
      productIds: [],
      ctaText: 'ลงทะเบียนรับประกัน / แจ้งซ่อมออนไลน์',
      ctaUrl: '/warranty',
      seoTitle: 'ศูนย์ซ่อมนาฬิกาและบริการหลังการขาย | OPWatch Thailand',
      seoDescription: 'ศูนย์บริการซ่อมบำรุง ล้างเครื่อง เปลี่ยนถ่าน และตรวจสอบกันน้ำมาตรฐานศูนย์ไทย โดย บริษัท อินเตอร์ไทมส์ จำกัด',
      seoKeywords: 'ศูนย์ซ่อม Olym Pianus, ซ่อมนาฬิกา Ogival, ประกันศูนย์อินเตอร์ไทมส์',
      status: 'published',
      sortOrder: 12
    },
    {
      slug: 'site-warranty',
      parentSlug: 'site-home',
      pageType: 'system_page',
      routePath: '/warranty',
      category: 'main_menu',
      heroEyebrow: 'ONLINE E-WARRANTY & REPAIR PORTAL',
      title: 'ระบบลงทะเบียนรับประกันและแจ้งซ่อมออนไลน์',
      titleTh: 'ลงทะเบียนรับประกันศูนย์ไทย 2 ปี & แจ้งซ่อมเรือนเวลาออนไลน์',
      titleEn: 'Online E-Warranty Registration & Watch Repair Submission',
      summary: 'บันทึกข้อมูลรับประกันเข้าสู่คลังข้อมูลศูนย์ใหญ่อินเตอร์ไทมส์ทันที พร้อมติดตามสถานะงานซ่อมแบบเรียลไทม์ตลอด 24 ชั่วโมง',
      contentTh: `<p>ไม่ว่าท่านจะซื้อนาฬิกาผ่านเว็บไซต์ <strong>opwatch.co.th</strong>, Shopee, Lazada, TikTok Shop หรือร้านตัวแทนจำหน่ายทั่วประเทศ สามารถกรอกลงทะเบียนรับประกันออนไลน์และแจ้งส่งซ่อมได้ในหน้านี้ทันที</p>`,
      banner: '/images/op/banner-899832ags.jpg',
      styleConfig: { fontFamily: 'Prompt', headingColor: '#ffffff', textColor: '#23264d', accentColor: '#c9a84c', bgColor: '#13193b', overlayOpacity: 0.62, headingSize: 'lg' },
      productIds: [],
      seoTitle: 'ลงทะเบียนรับประกันออนไลน์ & แจ้งซ่อมนาฬิกา | OPWatch Thailand',
      seoDescription: 'ลงทะเบียนใบรับประกันอีเล็กทรอนิกส์ (E-Warranty) และส่งคำร้องแจ้งซ่อมนาฬิกา Olym Pianus, Olympia Star, Ogival ออนไลน์',
      seoKeywords: 'ลงทะเบียนรับประกัน Olym Pianus, แจ้งซ่อมนาฬิกาออนไลน์, E-Warranty OPWatch, เช็กสถานะซ่อมนาฬิกา',
      status: 'published',
      sortOrder: 13
    },
    {
      slug: 'site-branches',
      parentSlug: 'site-home',
      pageType: 'system_page',
      routePath: '/branches',
      category: 'main_menu',
      heroEyebrow: 'BOUTIQUES & COUNTERS THAILAND',
      title: 'สาขาและเคาน์เตอร์ห้างสรรพสินค้า',
      titleTh: 'สาขาและจุดบริการรับสินค้าหน้าร้าน (Click & Collect)',
      titleEn: 'Authorized Department Store Counters & Boutiques',
      summary: 'พบเคาน์เตอร์นาฬิกา Olym Pianus, Olympia Star และ Ogival ในห้างสรรพสินค้าชั้นนำ พร้อมบริการรับสินค้าหน้าร้านและตัดสายฟรี',
      contentTh: `<p>ลูกค้าสามารถเลือกบริการรับสินค้าที่สาขาใกล้บ้าน (Click & Collect) เพื่อรับบริการปรับขนาดสายข้อมือให้พอดีโดยผู้เชี่ยวชาญประจำเคาน์เตอร์</p>`,
      banner: '/images/op/lifestyle-men.jpg',
      styleConfig: { fontFamily: 'Prompt', headingColor: '#ffffff', textColor: '#23264d', accentColor: '#1d2088', bgColor: '#171d42', overlayOpacity: 0.55, headingSize: 'lg' },
      productIds: [],
      seoTitle: 'สาขาและเคาน์เตอร์ห้างสรรพสินค้า | OPWatch Thailand',
      seoDescription: 'ค้นหาสาขาและเคาน์เตอร์นาฬิกา Olym Pianus, Olympia Star, Ogival ในเซ็นทรัล สยามพารากอน และสำนักงานใหญ่อินเตอร์ไทมส์',
      seoKeywords: 'สาขา Olym Pianus, เคาน์เตอร์ Ogival, รับสินค้าหน้าร้าน OPWatch',
      status: 'published',
      sortOrder: 14
    },
    {
      slug: 'site-contact',
      parentSlug: 'site-home',
      pageType: 'system_page',
      routePath: '/contact',
      category: 'main_menu',
      heroEyebrow: 'CONCIERGE & HEAD OFFICE',
      title: 'ติดต่อเรา (Contact Concierge)',
      titleTh: 'ติดต่อสำนักงานใหญ่ บริษัท อินเตอร์ไทมส์ จำกัด',
      titleEn: 'Contact Inter Times Co., Ltd. Bangkok',
      summary: 'สอบถามข้อมูลรุ่นนาฬิกา สมัครตัวแทนจำหน่าย หรือติดต่อฝ่ายบริการลูกค้า โทร. 02 251 5777 และ LINE ID: opwatch.th',
      contentTh: `<p>สำนักงานใหญ่ตั้งอยู่ที่ 1091/229 ซอย 35 ถนนเพชรบุรีตัดใหม่ แขวงมักกะสัน เขตราชเทวี กรุงเทพมหานคร 10400 เปิดทำการจันทร์–ศุกร์ 09:00–18:00 น.</p>`,
      banner: '/images/op/lifestyle-lady.jpg',
      styleConfig: { fontFamily: 'Prompt', headingColor: '#ffffff', textColor: '#23264d', accentColor: '#1d2088', bgColor: '#182046', overlayOpacity: 0.55, headingSize: 'lg' },
      productIds: [],
      seoTitle: 'ติดต่อเรา | บริษัท อินเตอร์ไทมส์ จำกัด · โทร 02 251 5777',
      seoDescription: 'ช่องทางติดต่อ บริษัท อินเตอร์ไทมส์ จำกัด โทร 02 251 5777, LINE: opwatch.th และแผนที่สำนักงานใหญ่เพชรบุรีตัดใหม่',
      seoKeywords: 'ติดต่ออินเตอร์ไทมส์, เบอร์โทร OPWatch, สมัครตัวแทนจำหน่ายนาฬิกา',
      status: 'published',
      sortOrder: 15
    },

    // ==================== ROOT 2: หน้ากั้นแบรนด์ OLYM PIANUS + SERIES STORIES ====================
    {
      slug: 'brand-gate-olympianus',
      parentSlug: null,
      pageType: 'brand_gate',
      routePath: '/brands/olympianus',
      brandSlug: 'olympianus',
      category: 'brand_gate',
      heroEyebrow: 'BRAND PAVILION · JAPANESE MOVEMENT × SWISS HERITAGE',
      title: 'หน้ากั้นแบรนด์ Olym Pianus (OP)',
      titleTh: 'OLYM PIANUS — จิตวิญญาณสปอร์ตหรู ผสานกลไกญี่ปุ่นความเที่ยงตรงสูง',
      titleEn: 'OLYM PIANUS — Prestige Japanese Movement & Sapphire Crystal',
      summary: 'หน้ากั้นต้อนรับเข้าสู่จักรวาล Olym Pianus ถ่ายทอดเอกลักษณ์กระจกแซฟไฟร์แท้ทุกรุ่น ตัวเรือนสเตนเลสสตีล 316L และคอลเลกชันยอดนิยมระดับตำนาน',
      contentTh: `
        <h2>ทำไมนักสะสมชาวไทยจึงเลือก Olym Pianus?</h2>
        <p><strong>Olym Pianus (OP)</strong> ถือกำเนิดจากแนวคิดที่ต้องการมอบเรือนเวลามาตรฐานสวิสในราคาที่เข้าถึงได้จริง โดยผสานความทนทานและซ่อมบำรุงง่ายของกลไกออโตเมติกและควอตซ์ชั้นนำจากประเทศญี่ปุ่น เข้ากับกระจก <strong>Sapphire Crystal แท้</strong> ที่ทนทานต่อรอยขีดข่วนเหนือกว่ากระจกทั่วไปหลายเท่าตัว</p>
        <p>สำรวจเรื่องราวประจำแต่ละซีรีส์ด้านล่าง เพื่อค้นหาเรือนเวลาที่สะท้อนบุคลิกของคุณอย่างสมบูรณ์แบบ</p>
      `,
      banner: '/images/op/hero-diver-dark.jpg',
      gallery: ['/images/op/banner-899832ags.jpg', '/images/op/portrait-diver.jpg', '/images/op/hero-gold-stones.jpg'],
      styleConfig: {
        fontFamily: 'Prompt',
        headingColor: '#ffffff',
        textColor: '#1e2438',
        accentColor: '#1d2088',
        bgColor: '#0e1330',
        overlayOpacity: 0.56,
        headingSize: 'xl'
      },
      productIds: byBrand('olympianus', 8),
      ctaText: 'ดูนาฬิกา Olym Pianus ทั้งหมด',
      ctaUrl: '/products?brand=olympianus',
      seoTitle: 'Olym Pianus (OP) Thailand | หน้ากั้นแบรนด์และเรื่องราวประจำซีรีส์ของแท้ศูนย์ไทย',
      seoDescription: 'สัมผัสเรื่องราวแบรนด์ Olym Pianus (OP) นาฬิกากระจกแซฟไฟร์แท้ กลไกญี่ปุ่น พร้อมเจาะลึกทุกซีรีส์ยอดนิยม Sportmaster, Open-Heart และ Lady Jewelry',
      seoKeywords: 'Olym Pianus, นาฬิกา OP, OP Sportmaster, Olym Pianus Automatic, นาฬิกาแซฟไฟร์',
      status: 'published',
      sortOrder: 20
    },
    {
      slug: 'series-op-sportmaster',
      parentSlug: 'brand-gate-olympianus',
      pageType: 'series_story',
      routePath: '/pages/series-op-sportmaster',
      brandSlug: 'olympianus',
      seriesKey: 'sportmaster',
      category: 'series_story',
      heroEyebrow: 'SERIES STORY · OLYM PIANUS SPORTMASTER',
      title: 'Story ซีรีส์ OP Sportmaster Automatic',
      titleTh: 'OP Sportmaster Series — ตำนานสปอร์ตขอบเซรามิกและสาย Jubilee อันทรงพลัง',
      titleEn: 'OP Sportmaster Automatic Series Story',
      summary: 'เจาะลึกซีรีส์เรือธงที่ขายดีที่สุดของ Olym Pianus โดดเด่นด้วยขอบหน้าปัดหยักและขอบเซรามิก กระจกแซฟไฟร์เลนส์ขยายวันที่ และกลไกออโตเมติกขึ้นลานมือ',
      contentTh: `
        <h2>แรงบันดาลใจแห่งความสำเร็จบนข้อมือสุภาพบุรุษ</h2>
        <p>ซีรีส์ <strong>OP Sportmaster</strong> (อาทิรหัสตระกูล 89322 และ 899832) ได้รับการยกย่องให้เป็นหนึ่งในเรือนเวลาสปอร์ตเดรสที่คุ้มค่าที่สุดในประเทศไทย ตัวเรือนสเตนเลสสตีล 316L ขัดแต่งสลับเงาและด้านอย่างประณีต มาพร้อมเม็ดมะยมขันเกลียวป้องกันน้ำ และพรายน้ำสว่างชัดเจนในที่มืด</p>
        <ul>
          <li><strong>กระจกหน้าปัด:</strong> Sapphire Crystal แท้ พร้อมเลนส์ขยายวันที่ (Cyclops)</li>
          <li><strong>หัวใจขับเคลื่อน:</strong> กลไก Japanese Automatic รองรับการขึ้นลานด้วยมือและแฮ็กเข็มวินาที</li>
          <li><strong>ความสบายในการสวมใส่:</strong> สายสเตนเลสสตีลตันโอบรับข้อมือคนเอเชีย พร้อมบานพับล็อกสองชั้น</li>
        </ul>
      `,
      banner: '/images/op/banner-899832ags.jpg',
      gallery: ['/images/op/portrait-diver.jpg', '/images/op/square-diver-glow.jpg'],
      styleConfig: {
        fontFamily: 'Prompt',
        headingColor: '#ffffff',
        textColor: '#1f2440',
        accentColor: '#c9a84c',
        bgColor: '#0b152c',
        overlayOpacity: 0.52,
        headingSize: 'xl'
      },
      productIds: byBrand('olympianus', 8, '89'),
      ctaText: 'ช้อปซีรีส์ Sportmaster ทั้งหมด',
      ctaUrl: '/products?brand=olympianus',
      seoTitle: 'OP Sportmaster Series Story | เจาะลึกซีรีส์สปอร์ตออโตเมติก Olym Pianus',
      seoDescription: 'เรื่องราวและจุดเด่นของซีรีส์ Olym Pianus Sportmaster Automatic กระจกแซฟไฟร์แท้ ขอบเซรามิก พร้อมรุ่นแนะนำที่เชื่อมโยงให้ช้อปทันที',
      seoKeywords: 'OP Sportmaster, Olym Pianus 89322, Olym Pianus 899832, นาฬิกาสปอร์ตออโตเมติก',
      status: 'published',
      sortOrder: 21
    },
    {
      slug: 'series-op-open-heart',
      parentSlug: 'brand-gate-olympianus',
      pageType: 'series_story',
      routePath: '/pages/series-op-open-heart',
      brandSlug: 'olympianus',
      seriesKey: 'open-heart',
      category: 'series_story',
      heroEyebrow: 'SERIES STORY · OLYM PIANUS OPEN-HEART',
      title: 'Story ซีรีส์ OP Open-Heart Mechanical',
      titleTh: 'OP Open-Heart Series — สุนทรียะแห่งกลไกจักรกลที่เต้นอยู่บนหน้าปัด',
      titleEn: 'OP Open-Heart Mechanical Series Story',
      summary: 'เผยจังหวะการทำงานของ Balance Wheel ผ่านช่องหน้าต่าง Open-Heart ผสานความคลาสสิกเหนือกาลเวลาเข้ากับฝาหลังเปลือยโชว์โรเตอร์',
      contentTh: `
        <h2>ศิลปะแห่งจักรกลที่สัมผัสได้ในทุกวินาที</h2>
        <p>สำหรับผู้ที่หลงใหลในเสน่ห์ของนาฬิกาจักรกล ซีรีส์ <strong>OP Open-Heart</strong> เปิดมุมมองให้เห็นหัวใจสำคัญของกลไกที่ขยับตัวอย่างเที่ยงตรงที่ตำแหน่ง 9 นาฬิกา เสริมความหรูหราด้วยเข็มทรง Dauphine และหลักชั่วโมงประดับคริสตัลหรือขีดทองชมพูสุดประณีต</p>
      `,
      banner: '/images/op/openheart-stones.jpg',
      gallery: ['/images/op/portrait-8934msk.jpg', '/images/op/portrait-99141agnsk.jpg'],
      styleConfig: {
        fontFamily: 'IBM Plex Sans Thai',
        headingColor: '#fff8eb',
        textColor: '#2a2438',
        accentColor: '#b7791f',
        bgColor: '#1f1629',
        overlayOpacity: 0.58,
        headingSize: 'lg'
      },
      productIds: byBrand('olympianus', 6, '99'),
      ctaText: 'เลือกชมรุ่น Open-Heart',
      ctaUrl: '/products?brand=olympianus',
      seoTitle: 'OP Open-Heart Series Story | นาฬิกาโชว์กลไก Olym Pianus ของแท้ศูนย์ไทย',
      seoDescription: 'สัมผัสความงามของซีรีส์ Olym Pianus Open-Heart โชว์กลไกออโตเมติกผ่านหน้าปัดแซฟไฟร์แท้ พร้อมรายการนาฬิกาที่เกี่ยวข้อง',
      seoKeywords: 'Olym Pianus Open Heart, นาฬิกาโชว์กลไก, OP Automatic Open Heart',
      status: 'published',
      sortOrder: 22
    },
    {
      slug: 'series-op-lady-jewelry',
      parentSlug: 'brand-gate-olympianus',
      pageType: 'series_story',
      routePath: '/pages/series-op-lady-jewelry',
      brandSlug: 'olympianus',
      seriesKey: 'lady-jewelry',
      category: 'series_story',
      heroEyebrow: 'SERIES STORY · OLYM PIANUS LADY & PAIR',
      title: 'Story ซีรีส์ OP Lady Jewelry & Couple',
      titleTh: 'OP Lady & Couple Series — ประกายเครื่องประดับหรูเหนือกาลเวลาสำหรับสุภาพสตรี',
      titleEn: 'OP Lady Jewelry & Pair Watch Series',
      summary: 'ดีไซน์ตัวเรือนบางเฉียบประดับคริสตัลเจียระไนและหน้าปัดมุกแท้ (Mother of Pearl) มอบเป็นของขวัญล้ำค่าในทุกโอกาสสำคัญ',
      contentTh: `
        <h2>เมื่อเรือนเวลาและจิวเวลรี่หลอมรวมเป็นหนึ่งเดียว</h2>
        <p>ซีรีส์สุภาพสตรีและนาฬิกาคู่รักของ <strong>Olym Pianus</strong> โดดเด่นด้วยการคัดสรรหน้าปัดเปลือกมุกธรรมชาติที่เล่นแสงแตกต่างกันในแต่ละเรือน ล้อมกรอบคริสตัลน้ำงามและกระจกแซฟไฟร์ป้องกันรอยขีดข่วนในชีวิตประจำวัน</p>
      `,
      banner: '/images/op/hero-gold-stones.jpg',
      gallery: ['/images/op/lifestyle-lady.jpg', '/images/op/square-gold-stones.jpg'],
      styleConfig: {
        fontFamily: 'Prompt',
        headingColor: '#ffffff',
        textColor: '#2d2235',
        accentColor: '#d4889c',
        bgColor: '#2b1929',
        overlayOpacity: 0.54,
        headingSize: 'lg'
      },
      productIds: byBrand('olympianus', 6, 'L'),
      ctaText: 'ชมคอลเลกชันสุภาพสตรี',
      ctaUrl: '/products?brand=olympianus',
      seoTitle: 'OP Lady Jewelry Series | นาฬิกาผู้หญิงและนาฬิกาคู่รัก Olym Pianus',
      seoDescription: 'เรื่องราวซีรีส์นาฬิกาสุภาพสตรี Olym Pianus ประดับคริสตัล หน้าปัดมุกแท้ กระจกแซฟไฟร์ รับประกันศูนย์ไทย 2 ปี',
      seoKeywords: 'นาฬิกาผู้หญิง Olym Pianus, นาฬิกาคู่รัก OP, OP Lady Watch',
      status: 'published',
      sortOrder: 23
    },

    // ==================== ROOT 3: หน้ากั้นแบรนด์ OLYMPIA STAR + SERIES STORIES ====================
    {
      slug: 'brand-gate-olympia-star',
      parentSlug: null,
      pageType: 'brand_gate',
      routePath: '/brands/olympia-star',
      brandSlug: 'olympia-star',
      category: 'brand_gate',
      heroEyebrow: 'BRAND PAVILION · SWISS QUARTZ PRECISION SINCE 1958',
      title: 'หน้ากั้นแบรนด์ Olympia Star (OPA)',
      titleTh: 'OLYMPIA STAR — ความเที่ยงตรงระดับขุมพลังสวิสควอตซ์ ในดีไซน์บางเฉียบสง่างาม',
      titleEn: 'OLYMPIA STAR — Swiss Movement Elegance & Ultra-Slim Design',
      summary: 'หน้ากั้นแบรนด์ Olympia Star ถ่ายทอดจิตวิญญาณช่อมะกอกแห่งสันติภาพและชัยชนะ ขับเคลื่อนด้วยขุมพลัง Swiss Ronda & ISA Movement แท้ทุกเรือน',
      contentTh: `
        <h2>ขุมพลังสวิสแท้ เพื่อความบางเฉียบและความแม่นยำสูงสุด</h2>
        <p><strong>Olympia Star (OPA)</strong> ก่อตั้งขึ้นในสวิตเซอร์แลนด์ตั้งแต่ปี ค.ศ. 1958 ทุกเรือนบรรจุกลไก <strong>Swiss Movement</strong> ที่มอบความเที่ยงตรงระดับวินาทีต่อเดือน ตัวเรือนออกแบบให้บางเบาแนบข้อมือ พร้อมกระจกแซฟไฟร์แท้ทุกรุ่น</p>
      `,
      banner: '/images/op/hero-ceramic-dark.jpg',
      styleConfig: {
        fontFamily: 'Prompt',
        headingColor: '#ffffff',
        textColor: '#1e2438',
        accentColor: '#2f5fd0',
        bgColor: '#101b3b',
        overlayOpacity: 0.56,
        headingSize: 'xl'
      },
      productIds: byBrand('olympia-star', 6),
      ctaText: 'ดูนาฬิกา Olympia Star ทั้งหมด',
      ctaUrl: '/products?brand=olympia-star',
      seoTitle: 'Olympia Star (OPA) Thailand | หน้ากั้นแบรนด์นาฬิกากลไกสวิสแท้ ศูนย์ไทย',
      seoDescription: 'เปิดประวัติและคอลเลกชัน Olympia Star (OPA) นาฬิกาขุมพลัง Swiss Movement ดีไซน์คลาสสิกบางเฉียบ กระจกแซฟไฟร์แท้',
      seoKeywords: 'Olympia Star, OPA Watch, นาฬิกาสวิสควอตซ์, Olympia Star ศูนย์ไทย',
      status: 'published',
      sortOrder: 30
    },
    {
      slug: 'series-opa-swiss-slim',
      parentSlug: 'brand-gate-olympia-star',
      pageType: 'series_story',
      routePath: '/pages/series-opa-swiss-slim',
      brandSlug: 'olympia-star',
      seriesKey: 'swiss-slim',
      category: 'series_story',
      heroEyebrow: 'SERIES STORY · OLYMPIA STAR SWISS ULTRA-SLIM',
      title: 'Story ซีรีส์ Olympia Star Swiss Ultra-Slim',
      titleTh: 'OPA Swiss Ultra-Slim — นิยามแห่ง Dress Watch บางเฉียบสำหรับผู้บริหาร',
      titleEn: 'Olympia Star Swiss Ultra-Slim Dress Series',
      summary: 'ตัวเรือนเพรียวบางสอดรับปลายแขนเสื้อเชิ้ตอย่างสมบูรณ์แบบ ขับเคลื่อนด้วยกลไก Swiss Ronda ประหยัดพลังงานยาวนานหลายปี',
      contentTh: `<p>ซีรีส์ <strong>Swiss Ultra-Slim</strong> ของ Olympia Star ออกแบบขึ้นสำหรับผู้บริหารและคนทำงานที่ต้องการความเรียบหรู สุภาพ และไม่ต้องกังวลเรื่องการตั้งเวลาใหม่แม้ไม่ได้สวมใส่ในวันหยุดสุดสัปดาห์</p>`,
      banner: '/images/op/portrait-82671m.jpg',
      styleConfig: {
        fontFamily: 'Prompt',
        headingColor: '#ffffff',
        textColor: '#1e2438',
        accentColor: '#2f5fd0',
        bgColor: '#122044',
        overlayOpacity: 0.55,
        headingSize: 'lg'
      },
      productIds: byBrand('olympia-star', 6),
      ctaText: 'เลือกชมซีรีส์ Olympia Star',
      ctaUrl: '/products?brand=olympia-star',
      seoTitle: 'Olympia Star Swiss Ultra-Slim Series | นาฬิกาผู้บริหารบางเฉียบกลไกสวิส',
      seoDescription: 'เจาะลึกซีรีส์ Olympia Star Swiss Ultra-Slim ดีไซน์บางเฉียบ กลไกสวิสแท้ กระจกแซฟไฟร์ ประกันศูนย์อินเตอร์ไทมส์ 2 ปี',
      seoKeywords: 'Olympia Star Ultra Slim, นาฬิกาบางเฉียบ, Dress Watch สวิส',
      status: 'published',
      sortOrder: 31
    },

    // ==================== ROOT 4: หน้ากั้นแบรนด์ OGIVAL + SERIES STORIES ====================
    {
      slug: 'brand-gate-ogival',
      parentSlug: null,
      pageType: 'brand_gate',
      routePath: '/brands/ogival',
      brandSlug: 'ogival',
      category: 'brand_gate',
      heroEyebrow: 'BRAND PAVILION · LA CHAUX-DE-FONDS SWITZERLAND SINCE 1903',
      title: 'หน้ากั้นแบรนด์ Ogival Swiss (ตั้งแต่ปี 1903)',
      titleTh: 'OGIVAL 1903 — ศิลปะเรือนเวลาสวิสชั้นสูง และสัญลักษณ์ปลากระโดดแห่งความโชคดี',
      titleEn: 'OGIVAL SWISS SINCE 1903 — Lucky Jumping Fish Haute Horlogerie',
      summary: 'หน้ากั้นแบรนด์ Ogival ตำนานเรือนเวลาจากเมือง La Chaux-de-Fonds ประเทศสวิตเซอร์แลนด์ โดดเด่นด้วยงานแกะสลักหน้าปัด Skeleton และอัญมณีมงคล',
      contentTh: `
        <h2>มากกว่าการบอกเวลา คือสัญลักษณ์แห่งความรักและคำอวยพรอันเป็นมงคล</h2>
        <p>ก่อตั้งขึ้นในปี ค.ศ. 1903 โดย René Brandt ณ เมืองแห่งการผลิตนาฬิกาสวิส <strong>La Chaux-de-Fonds</strong> แบรนด์ <strong>Ogival</strong> มีสัญลักษณ์ประจำตัวคือ “ปลาโชคดีกระโดด” (Lucky Jumping Fish) ซึ่งสื่อถึงความเจริญรุ่งเรือง ความรักที่เปี่ยมล้น และความสำเร็จก้าวหน้า</p>
      `,
      banner: '/images/op/portrait-8909amk.jpg',
      styleConfig: {
        fontFamily: 'IBM Plex Sans Thai',
        headingColor: '#fffaf0',
        textColor: '#261f1d',
        accentColor: '#b8860b',
        bgColor: '#231710',
        overlayOpacity: 0.58,
        headingSize: 'xl'
      },
      productIds: byBrand('ogival', 8),
      ctaText: 'สำรวจคอลเลกชัน Ogival Swiss ทั้งหมด',
      ctaUrl: '/products?brand=ogival',
      seoTitle: 'Ogival Watch Thailand | หน้ากั้นแบรนด์นาฬิกาสวิสแท้ปลาโชคดี ตั้งแต่ปี 1903',
      seoDescription: 'สัมผัสประวัติศาสตร์กว่า 120 ปีของนาฬิกาสวิส Ogival สัญลักษณ์ปลาโชคดี Skeleton และหน้าปัดงานศิลป์ นำเข้าโดย บริษัท อินเตอร์ไทมส์ จำกัด',
      seoKeywords: 'Ogival, นาฬิกาปลาโชคดี, Ogival Swiss Watch, Ogival Skeleton, นาฬิกาสวิสมงคล',
      status: 'published',
      sortOrder: 40
    },
    {
      slug: 'series-ogival-lucky-fish',
      parentSlug: 'brand-gate-ogival',
      pageType: 'series_story',
      routePath: '/pages/series-ogival-lucky-fish',
      brandSlug: 'ogival',
      seriesKey: 'lucky-fish',
      category: 'series_story',
      heroEyebrow: 'SERIES STORY · OGIVAL SKELETON & LUCKY FISH',
      title: 'Story ซีรีส์ Ogival Lucky Fish & Skeleton',
      titleTh: 'Ogival Lucky Fish Skeleton — งานฉลุลายจักรกลสวิสระดับมาสเตอร์พีซ',
      titleEn: 'Ogival Lucky Fish Skeleton Automatic Series',
      summary: 'ผลงานฉลุสะพานจักรด้วยความละเอียดระดับไมครอน ประดับลวดลายมงคลมังกร ม้าแปดตัว และปลาคู่โชคดี พร้อมขุมพลัง Swiss Automatic',
      contentTh: `
        <h2>หัตถศิลป์สวิสที่นักสะสมส่งต่อจากรุ่นสู่รุ่น</h2>
        <p>ซีรีส์ <strong>Ogival Skeleton & Lucky Fish</strong> คือจุดสูงสุดของงานฝีมือประจำแบรนด์ ช่างนาฬิกาบรรจงฉลุโครงสร้างกลไกและแกะสลักลวดลายมงคลเคลือบทองคำ พร้อมฝังเพชรและอัญมณีแท้บนหลักชั่วโมง เพื่อเสริมบารมีแก่ผู้ครอบครอง</p>
      `,
      banner: '/images/op/openheart-stones.jpg',
      styleConfig: {
        fontFamily: 'IBM Plex Sans Thai',
        headingColor: '#fff8dc',
        textColor: '#2a2118',
        accentColor: '#c59b27',
        bgColor: '#261a12',
        overlayOpacity: 0.6,
        headingSize: 'xl'
      },
      productIds: byBrand('ogival', 8, '358'),
      ctaText: 'ชมรุ่น Ogival Skeleton ทั้งหมด',
      ctaUrl: '/products?brand=ogival',
      seoTitle: 'Ogival Lucky Fish Skeleton Series | ซีรีส์นาฬิกาสวิสฉลุลายมงคลของแท้',
      seoDescription: 'เจาะลึกซีรีส์ Ogival Lucky Fish & Skeleton นาฬิกาสวิสออโตเมติกงานแกะสลักมงคล พร้อมรายการสินค้าที่เกี่ยวข้องให้เลือกชม',
      seoKeywords: 'Ogival Skeleton, Ogival 358, นาฬิกามังกร Ogival, นาฬิกาปลาคู่สวิส',
      status: 'published',
      sortOrder: 41
    },

    // ==================== ROOT 5: เรื่องโปรโมชั่น (PROMOTION STORIES) ====================
    {
      slug: 'site-promotions',
      parentSlug: null,
      pageType: 'system_page',
      routePath: '/promotions',
      category: 'promotion',
      heroEyebrow: 'EXCLUSIVE CAMPAIGNS & PRIVILEGES',
      title: 'ศูนย์รวมโปรโมชั่นและแคมเปญพิเศษ',
      titleTh: 'โปรโมชั่นประจำเดือน & สิทธิพิเศษสมาชิก OP Privilege',
      titleEn: 'Exclusive Timepiece Promotions & Collector Privileges',
      summary: 'รวมดีลสุดพิเศษ คูปองส่วนลด บริการห่อของขวัญสุดหรู และเรื่องราวแคมเปญคัดสรรเฉพาะลูกค้า opwatch.co.th',
      contentTh: `<p>พบข้อเสนอสุดพิเศษจาก <strong>บริษัท อินเตอร์ไทมส์ จำกัด</strong> ทั้งส่วนลดเฉพาะรุ่น คูปองสมาชิกใหม่ และชุดของขวัญประจำเทศกาล</p>`,
      banner: '/images/op/hero-gold-stones.jpg',
      styleConfig: {
        fontFamily: 'Prompt',
        headingColor: '#ffffff',
        textColor: '#23264d',
        accentColor: '#c9a84c',
        bgColor: '#1b1435',
        overlayOpacity: 0.56,
        headingSize: 'xl'
      },
      productIds: [...byBrand('olympianus', 4), ...byBrand('ogival', 4)],
      ctaText: 'เก็บคูปองและช้อปเลย',
      ctaUrl: '/promotions',
      seoTitle: 'โปรโมชั่นนาฬิกา Olym Pianus, Olympia Star, Ogival ล่าสุด | OPWatch',
      seoDescription: 'อัปเดตโปรโมชั่นนาฬิกาของแท้ศูนย์ไทย ลดสูงสุด 30% พร้อมคูปองส่วนลดและบริการจัดส่งฟรีทั่วประเทศ',
      seoKeywords: 'โปรโมชั่นนาฬิกา, ลดราคา Olym Pianus, คูปอง OPWatch, โปรนาฬิกา Ogival',
      status: 'published',
      sortOrder: 50
    },
    {
      slug: 'promo-story-collector-privilege',
      parentSlug: 'site-promotions',
      pageType: 'promo_story',
      routePath: '/pages/promo-story-collector-privilege',
      category: 'promotion',
      heroEyebrow: 'PROMOTION STORY · COLLECTOR PRIVILEGE',
      title: 'เรื่องโปรโมชั่น: Exclusive Sapphire Privilege',
      titleTh: 'แคมเปญ Exclusive Sapphire Privilege — อัปเกรดสู่กระจกแซฟไฟร์แท้ในราคาสุดคุ้ม',
      titleEn: 'Exclusive Sapphire Crystal Collector Campaign',
      summary: 'เรื่องราวเบื้องหลังแคมเปญที่เปิดโอกาสให้คนรักนาฬิกาเป็นเจ้าของเรือนเวลากระจกแซฟไฟร์แท้ พร้อมรับคะแนนสะสม OP Point X2 และบริการตัดสายพร้อมสวมใส่',
      contentTh: `
        <h2>ทำไมแคมเปญ Sapphire Privilege จึงห้ามพลาด?</h2>
        <p>ตลอดเดือนนี้ <strong>OPWatch Thailand</strong> คัดสรรเรือนเวลารุ่นยอดนิยมจากทั้ง 3 แบรนด์หลัก มอบส่วนลดพิเศษพร้อมสิทธิประโยชน์ 3 ต่อ:</p>
        <ul>
          <li><strong>ต่อที่ 1:</strong> ส่วนลดพิเศษหน้าเว็บไซต์สูงสุด 25–30% สำหรับรุ่นที่ร่วมรายการด้านล่าง</li>
          <li><strong>ต่อที่ 2:</strong> รับบริการปรับขนาดสายตามรอบข้อมือจริงฟรี เพียงระบุขนาดข้อมือในขั้นตอนสั่งซื้อ</li>
          <li><strong>ต่อที่ 3:</strong> ลงทะเบียน E-Warranty ออนไลน์รับความคุ้มครองศูนย์ไทยเต็มรูปแบบ 2 ปี</li>
        </ul>
      `,
      banner: '/images/op/lifestyle-sport.jpg',
      styleConfig: {
        fontFamily: 'Prompt',
        headingColor: '#ffffff',
        textColor: '#1e2438',
        accentColor: '#e11d48',
        bgColor: '#1f122b',
        overlayOpacity: 0.56,
        headingSize: 'xl'
      },
      productIds: [...byBrand('olympianus', 4), ...byBrand('olympia-star', 2), ...byBrand('ogival', 2)],
      ctaText: 'ใช้สิทธิ์ช้อปรุ่นร่วมรายการ',
      ctaUrl: '/promotions',
      seoTitle: 'แคมเปญ Exclusive Sapphire Privilege | เรื่องราวโปรโมชั่นพิเศษ OPWatch',
      seoDescription: 'อ่านรายละเอียดแคมเปญโปรโมชั่นพิเศษ Exclusive Sapphire Privilege พร้อมเลือกช้อปนาฬิการุ่นที่ร่วมรายการได้ทันที',
      seoKeywords: 'แคมเปญนาฬิกา, โปรโมชั่นแซฟไฟร์, OPWatch Sale',
      status: 'published',
      sortOrder: 51
    },
    {
      slug: 'promo-story-gift-season',
      parentSlug: 'site-promotions',
      pageType: 'promo_story',
      routePath: '/pages/promo-story-gift-season',
      category: 'promotion',
      heroEyebrow: 'PROMOTION STORY · GIFT OF TIME',
      title: 'เรื่องโปรโมชั่น: The Gift of Time ของขวัญแทนใจ',
      titleTh: 'The Gift of Time — มอบเรือนเวลาเป็นของขวัญล้ำค่า พร้อมกล่องหรูและการ์ดอวยพรฟรี',
      titleEn: 'The Gift of Time — Complimentary Boutique Gift Wrapping',
      summary: 'คัดสรรเรือนเวลาสำหรับมอบในวันครบรอบ วันเกิด วันรับปริญญา และโอกาสเกษียณอายุราชการ พร้อมบริการห่อของขวัญระดับบูติก',
      contentTh: `
        <h2>ของขวัญที่บอกเล่าความทรงจำในทุกวินาที</h2>
        <p>การมอบนาฬิกาคือการมอบ “เวลา” และความปรารถนาดีที่จะอยู่เคียงข้างผู้รับในทุกก้าวของชีวิต เลือกชมรุ่นยอดนิยมสำหรับเป็นของขวัญที่เชื่อมโยงไว้ด้านล่าง พร้อมเลือกบริการห่อของขวัญและพิมพ์ข้อความการ์ดอวยพรได้ฟรีในหน้าชำระเงิน</p>
      `,
      banner: '/images/op/hero-gold-stones.jpg',
      styleConfig: {
        fontFamily: 'Prompt',
        headingColor: '#fff9eb',
        textColor: '#282032',
        accentColor: '#c9a84c',
        bgColor: '#291c34',
        overlayOpacity: 0.55,
        headingSize: 'lg'
      },
      productIds: [...byBrand('olympianus', 3, 'L'), ...byBrand('ogival', 3)],
      ctaText: 'เลือกนาฬิกาสำหรับเป็นของขวัญ',
      ctaUrl: '/products',
      seoTitle: 'The Gift of Time โปรโมชั่นนาฬิกาของขวัญ ห่อของขวัญฟรี | OPWatch',
      seoDescription: 'คัดสรรนาฬิกาของขวัญวันเกิด วันครบรอบ วันเกษียณ พร้อมบริการห่อของขวัญบูติกและการ์ดอวยพรฟรีจาก OPWatch Thailand',
      seoKeywords: 'นาฬิกาของขวัญ, ของขวัญวันครบรอบ, ของขวัญเกษียณ นาฬิกา, ห่อของขวัญนาฬิกา',
      status: 'published',
      sortOrder: 52
    },

    // ==================== ROOT 6: นโยบายกฎหมายและเงื่อนไข (LEGAL GROUP) ====================
    {
      slug: 'legal-center',
      parentSlug: null,
      pageType: 'legal',
      routePath: '/pages/privacy-policy',
      category: 'legal',
      heroEyebrow: 'POLICIES & COMPLIANCE',
      title: 'ศูนย์รวมนโยบายและเงื่อนไขบริการ',
      titleTh: 'นโยบายคุ้มครองผู้บริโภค การรับประกัน และกฎหมาย PDPA',
      titleEn: 'Customer Policies, Warranty Terms & PDPA Compliance',
      summary: 'หมวดหลักรวบรวมนโยบายความเป็นส่วนตัว นโยบายคุกกี้ การจัดส่ง การเปลี่ยนคืนสินค้า และเงื่อนไขการรับประกันศูนย์ไทย',
      contentTh: `<p>เลือกดูรายละเอียดนโยบายแต่ละหัวข้อได้จากเมนูย่อยภายใต้หมวดนี้</p>`,
      banner: '/images/op/hero-ceramic-dark.jpg',
      styleConfig: { fontFamily: 'Prompt', headingColor: '#ffffff', textColor: '#23264d', accentColor: '#1d2088', bgColor: '#131836', overlayOpacity: 0.6, headingSize: 'lg' },
      productIds: [],
      seoTitle: 'นโยบายและเงื่อนไขการให้บริการ | OPWatch Thailand',
      seoDescription: 'รวมนโยบายความเป็นส่วนตัว PDPA เงื่อนไขการรับประกันศูนย์ไทย 2 ปี และการจัดส่งสินค้าของ OPWatch.co.th',
      seoKeywords: 'นโยบาย OPWatch, เงื่อนไขรับประกันนาฬิกา, PDPA',
      status: 'published',
      sortOrder: 90
    }
  ]
}


