<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
const reqFetch = useRequestFetch()
const toast = useToast()

const activeChannel = ref('all')
const savedCoupons = ref<string[]>([])

const { data } = await useAsyncData('op-all-promotions', () =>
  reqFetch<any>('/api/promotions')
)

const channels = [
  { key: 'all', th: 'ทุกช่องทางจำหน่าย', en: 'All Channels' },
  { key: 'website', th: 'เว็บไซต์ OPWatch.co.th', en: 'Official Website' },
  { key: 'shopee', th: 'Shopee Mall', en: 'Shopee Official' },
  { key: 'tiktok', th: 'TikTok Shop', en: 'TikTok Shop' },
  { key: 'line', th: 'LINE Official', en: 'LINE Official' },
  { key: 'facebook', th: 'Facebook Page', en: 'Facebook Page' },
  { key: 'store', th: 'เคาน์เตอร์ห้างสรรพสินค้า', en: 'Department Stores' }
]

const channelMeta: Record<string, { label: string; color: string }> = {
  website: { label: 'OPWATCH.CO.TH', color: '#1d2088' },
  shopee: { label: 'SHOPEE OFFICIAL', color: '#ee4d2d' },
  tiktok: { label: 'TIKTOK SHOP', color: '#111111' },
  line: { label: 'LINE OFFICIAL', color: '#06c755' },
  facebook: { label: 'FACEBOOK PAGE', color: '#1877f2' },
  store: { label: 'BOUTIQUE COUNTER', color: '#7c5a1e' }
}

const filteredPromos = computed(() => {
  const list = data.value?.items || []
  if (activeChannel.value === 'all') return list
  return list.filter((p: any) => p.channel === activeChannel.value)
})

const coupons = computed(() => data.value?.coupons || [])
const promoProducts = computed(() => data.value?.promoProducts || [])

onMounted(() => {
  try {
    const raw = localStorage.getItem('opwatch_saved_coupons')
    if (raw) savedCoupons.value = JSON.parse(raw)
  } catch {}
})

function collectCoupon(code: string) {
  if (!import.meta.client || !code) return
  if (!savedCoupons.value.includes(code)) {
    savedCoupons.value.push(code)
    localStorage.setItem('opwatch_saved_coupons', JSON.stringify(savedCoupons.value))
  }
  navigator.clipboard?.writeText(code).catch(() => {})
  toast.success(locale.value === 'th' ? `คัดลอกและเก็บคูปอง ${code} เรียบร้อย!` : `Collected coupon ${code}!`)
}

useHead(() => ({
  title: locale.value === 'th'
    ? 'โปรโมชั่นทุกช่องทาง & เก็บคูปองส่วนลด — OPWatch Thailand'
    : 'All-Channel Promotions & Vouchers — OPWatch Thailand',
  meta: [
    {
      name: 'description',
      content: 'รวมแคมเปญโปรโมชั่นนาฬิกาของแท้ Olym Pianus, Olympia Star และ Ogival จากทุกช่องทางจำหน่าย Website, Shopee, TikTok, LINE, Facebook และห้างสรรพสินค้าชั้นนำ'
    }
  ]
}))
</script>

<template>
  <div class="op-promos-page">
    <!-- Hero Header -->
    <section class="op-promos-hero">
      <div class="container">
        <span class="eyebrow" style="color:#a5b4fc">OFFICIAL OMNICHANNEL CAMPAIGNS</span>
        <h1>
          {{ locale === 'th' ? 'ศูนย์รวมโปรโมชั่นทุกช่องทางจำหน่าย' : 'Official Promotions Across All Channels' }}
        </h1>
        <p>
          {{
            locale === 'th'
              ? 'รวมแคมเปญสิทธิพิเศษและคูปองส่วนลดจาก OPWatch.co.th, Shopee, TikTok Shop, LINE Official, Facebook และเคาน์เตอร์ห้างสรรพสินค้าทั่วประเทศไทย โดย บริษัท อินเตอร์ไทมส์ จำกัด'
              : 'Discover exclusive watch campaigns across Website, Shopee, TikTok Shop, LINE, Facebook, and Thailand department store counters.'
          }}
        </p>

        <!-- Channel Filter Pills -->
        <div class="op-promos-tabs">
          <button
            v-for="ch in channels"
            :key="ch.key"
            type="button"
            class="op-promos-tab"
            :class="{ 'is-active': activeChannel === ch.key }"
            @click="activeChannel = ch.key"
          >
            {{ locale === 'th' ? ch.th : ch.en }}
          </button>
        </div>
      </div>
    </section>

    <!-- Clickable Omnichannel Banner Cards -->
    <section class="section">
      <div class="container">
        <div class="op-promos-banners">
          <template v-for="p in filteredPromos" :key="p.id || p.slug">
            <!-- External Channel Link Banner -->
            <a
              v-if="p.targetUrl && p.targetUrl.startsWith('http')"
              :href="p.targetUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="op-chan-banner"
            >
              <div class="op-chan-banner__media">
                <img :src="p.bannerImage" :alt="p.titleTh" loading="lazy" />
                <span
                  class="op-chan-banner__chan"
                  :style="{ background: channelMeta[p.channel]?.color || '#1d2088' }"
                >
                  {{ channelMeta[p.channel]?.label || p.channel }}
                </span>
                <span v-if="p.badgeText" class="op-chan-banner__badge">{{ p.badgeText }}</span>
              </div>
              <div class="op-chan-banner__body">
                <h2>{{ locale === 'en' && p.titleEn ? p.titleEn : p.titleTh }}</h2>
                <p>{{ locale === 'en' && p.subtitleEn ? p.subtitleEn : p.subtitleTh }}</p>
                <div class="op-chan-banner__foot">
                  <span class="op-chan-banner__cta">
                    {{ locale === 'en' && p.ctaEn ? p.ctaEn : p.ctaTh || 'คลิกไปยังโปรโมชั่น' }} ↗
                  </span>
                  <button
                    v-if="p.couponCode"
                    type="button"
                    class="op-chan-banner__code"
                    @click.prevent="collectCoupon(p.couponCode)"
                  >
                    โค้ด: {{ p.couponCode }}
                  </button>
                </div>
              </div>
            </a>

            <!-- Internal Store Link Banner -->
            <NuxtLink
              v-else
              :to="localePath(p.targetUrl || '/products')"
              class="op-chan-banner"
            >
              <div class="op-chan-banner__media">
                <img :src="p.bannerImage" :alt="p.titleTh" loading="lazy" />
                <span
                  class="op-chan-banner__chan"
                  :style="{ background: channelMeta[p.channel]?.color || '#1d2088' }"
                >
                  {{ channelMeta[p.channel]?.label || p.channel }}
                </span>
                <span v-if="p.badgeText" class="op-chan-banner__badge">{{ p.badgeText }}</span>
              </div>
              <div class="op-chan-banner__body">
                <h2>{{ locale === 'en' && p.titleEn ? p.titleEn : p.titleTh }}</h2>
                <p>{{ locale === 'en' && p.subtitleEn ? p.subtitleEn : p.subtitleTh }}</p>
                <div class="op-chan-banner__foot">
                  <span class="op-chan-banner__cta">
                    {{ locale === 'en' && p.ctaEn ? p.ctaEn : p.ctaTh || 'เลือกช้อปสินค้าที่ร่วมรายการ' }} →
                  </span>
                  <button
                    v-if="p.couponCode"
                    type="button"
                    class="op-chan-banner__code"
                    @click.prevent="collectCoupon(p.couponCode)"
                  >
                    โค้ด: {{ p.couponCode }}
                  </button>
                </div>
              </div>
            </NuxtLink>
          </template>
        </div>

        <!-- Collectible Coupon Center (Central Online Style) -->
        <div v-if="coupons.length" class="op-voucher-hub">
          <div class="between wrap gap-12" style="margin-bottom: 18px">
            <div>
              <span class="eyebrow">COLLECTIBLE VOUCHERS &amp; GIFT CARDS</span>
              <h2 class="h2">{{ locale === 'th' ? 'เก็บคูปองส่วนลด & บัตรของขวัญ' : 'Collectible Discount Vouchers' }}</h2>
            </div>
            <NuxtLink :to="localePath('/checkout')" class="btn btn--sm btn--ghost">
              {{ locale === 'th' ? 'ใช้คูปองในตะกร้าสินค้า →' : 'Apply at Checkout →' }}
            </NuxtLink>
          </div>

          <div class="op-voucher-grid">
            <div v-for="cp in coupons" :key="cp.code" class="op-voucher-ticket">
              <div class="op-voucher-ticket__amt">
                <strong>
                  {{ cp.type === 'percent' ? `${cp.value}%` : `฿${Number(cp.value).toLocaleString()}` }}
                </strong>
                <span>{{ cp.isGiftCard ? 'GIFT CARD' : 'DISCOUNT' }}</span>
              </div>
              <div class="op-voucher-ticket__info">
                <h3>{{ locale === 'en' && cp.titleEn ? cp.titleEn : cp.titleTh }}</h3>
                <p>
                  {{ locale === 'th' ? `ขั้นต่ำ ฿${Number(cp.minSpend || 0).toLocaleString()}` : `Min spend ฿${Number(cp.minSpend || 0).toLocaleString()}` }}
                  <template v-if="cp.maxDiscount">
                    · {{ locale === 'th' ? `ลดสูงสุด ฿${Number(cp.maxDiscount).toLocaleString()}` : `Cap ฿${Number(cp.maxDiscount).toLocaleString()}` }}
                  </template>
                </p>
                <code>{{ cp.code }}</code>
              </div>
              <button
                type="button"
                class="op-voucher-ticket__btn"
                :class="{ 'is-saved': savedCoupons.includes(cp.code) }"
                @click="collectCoupon(cp.code)"
              >
                {{
                  savedCoupons.includes(cp.code)
                    ? locale === 'th' ? '✓ เก็บแล้ว' : '✓ Saved'
                    : locale === 'th' ? 'เก็บคูปอง' : 'Collect'
                }}
              </button>
            </div>
          </div>
        </div>

        <!-- Promotional Timepieces Showcase -->
        <div v-if="promoProducts.length" style="margin-top: 56px">
          <div class="between wrap gap-12" style="margin-bottom: 24px">
            <div>
              <span class="eyebrow">SPECIAL CAMPAIGN TIMEPIECES</span>
              <h2 class="h2">{{ locale === 'th' ? 'เรือนเวลาราคาพิเศษประจำแคมเปญ' : 'Campaign Featured Timepieces' }}</h2>
            </div>
            <NuxtLink :to="localePath('/products')" class="btn btn--sm btn--ghost">
              {{ locale === 'th' ? 'ดูสินค้าทั้งหมด 405 รุ่น →' : 'View All 405 Models →' }}
            </NuxtLink>
          </div>
          <div class="grid-4">
            <ProductCard v-for="item in promoProducts.slice(0, 8)" :key="item.id || item.slug" :product="item" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.op-promos-hero {
  background: linear-gradient(135deg, #0d1038 0%, #1d2088 65%, #16196b 100%);
  color: #ffffff;
  padding: 120px 0 48px;
}
.op-promos-hero h1 {
  font-family: var(--font-display);
  font-size: clamp(2rem, 3.6vw, 3rem);
  margin-top: 8px;
}
.op-promos-hero p {
  max-width: 760px;
  font-size: 15px;
  opacity: 0.9;
  margin-top: 10px;
  line-height: 1.7;
}
.op-promos-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 26px;
}
.op-promos-tab {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.16s ease;
}
.op-promos-tab.is-active,
.op-promos-tab:hover {
  background: #ffffff;
  color: var(--sapphire);
  border-color: #ffffff;
}
.op-promos-banners {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}
.op-chan-banner {
  background: #ffffff;
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.op-chan-banner:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 44px rgba(18, 22, 60, 0.12);
}
.op-chan-banner__media {
  position: relative;
  aspect-ratio: 16 / 8.5;
  overflow: hidden;
  background: #0f1335;
}
.op-chan-banner__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.55s var(--ease);
}
.op-chan-banner:hover .op-chan-banner__media img {
  transform: scale(1.05);
}
.op-chan-banner__chan {
  position: absolute;
  top: 12px;
  left: 12px;
  color: #ffffff;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.12em;
  padding: 5px 11px;
  border-radius: 999px;
}
.op-chan-banner__badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #c81e1e;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 4px;
}
.op-chan-banner__body {
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}
.op-chan-banner__body h2 {
  font-family: var(--font-display);
  font-size: 22px;
  color: var(--ink);
  line-height: 1.35;
}
.op-chan-banner__body p {
  font-size: 14px;
  color: var(--ink-soft);
  line-height: 1.65;
  flex: 1;
}
.op-chan-banner__foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--line);
}
.op-chan-banner__cta {
  font-size: 13px;
  font-weight: 700;
  color: var(--sapphire);
}
.op-chan-banner__code {
  background: #eef0ff;
  border: 1px dashed var(--sapphire);
  color: var(--sapphire);
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.op-voucher-hub {
  margin-top: 48px;
  padding: 28px;
  background: #f5f7fd;
  border: 1px solid #dce1f5;
  border-radius: 14px;
}
.op-voucher-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.op-voucher-ticket {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #ffffff;
  border: 1px solid #d5daf2;
  border-radius: 10px;
  padding: 14px 16px;
}
.op-voucher-ticket__amt {
  min-width: 88px;
  text-align: center;
  padding-right: 14px;
  border-right: 1.5px dashed #cbd5e1;
}
.op-voucher-ticket__amt strong { display: block; font-size: 22px; color: #b91c1c; line-height: 1.1; }
.op-voucher-ticket__amt span { font-size: 9.5px; font-weight: 700; letter-spacing: 0.12em; color: var(--muted); }
.op-voucher-ticket__info { flex: 1; }
.op-voucher-ticket__info h3 { font-size: 14px; font-weight: 700; color: var(--ink); }
.op-voucher-ticket__info p { font-size: 12px; color: var(--muted); margin-top: 2px; }
.op-voucher-ticket__info code {
  display: inline-block;
  margin-top: 4px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--sapphire);
  background: #eef0ff;
  padding: 2px 8px;
  border-radius: 4px;
}
.op-voucher-ticket__btn {
  background: var(--sapphire);
  color: #ffffff;
  border: 0;
  border-radius: 6px;
  padding: 9px 14px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}
.op-voucher-ticket__btn.is-saved {
  background: #166534;
}
@media (max-width: 900px) {
  .op-promos-banners,
  .op-voucher-grid { grid-template-columns: 1fr; }
}
</style>
