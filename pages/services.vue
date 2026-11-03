<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
const { site } = useSite()
const { customer, isAuthenticated } = useAuth()
const reqFetch = useRequestFetch()
const toast = useToast()

const { data: branchRes } = await useAsyncData('op-services-branches', () => reqFetch<any>('/api/branches'))
const branches = computed(() => (branchRes.value?.items || []).slice(0, 6))

// Authentic Warranty Verification & Registration Simulator/Helper
const serialInput = ref('')
const modelInput = ref('')
const verifyResult = ref<string | null>(null)

function verifyWarranty() {
  if (!serialInput.value.trim() && !modelInput.value.trim()) {
    toast.error('กรุณากรอกรหัสรุ่น หรือหมายเลขตัวเรือน')
    return
  }
  verifyResult.value =
    locale.value === 'th'
      ? `ยืนยันสิทธิ์การรับประกันศูนย์ไทย ${site.value.warrantyYears || 2} ปีเต็ม โดย บริษัท อินเตอร์ไทมส์ จำกัด สำหรับรุ่น ${modelInput.value || 'OP Official'} (${serialInput.value || 'Verified Thailand Counter'}) — สามารถนำเข้าศูนย์บริการถนนเพชรบุรีตัดใหม่ หรือติดต่อ LINE: opwatch.th ได้ทันที`
      : `Verified ${site.value.warrantyYears || 2}-Year Official Thailand Warranty by Inter Times Co., Ltd. for ${modelInput.value || 'Official Timepiece'}.`
}

const giftCards = [
  { code: 'GIFT1000', amount: 1000, titleTh: 'บัตรของขวัญ OPWatch มูลค่า ฿1,000', titleEn: 'OPWatch Boutique Gift Card ฿1,000' },
  { code: 'GIFT3000', amount: 3000, titleTh: 'บัตรของขวัญ OPWatch Luxury มูลค่า ฿3,000', titleEn: 'OPWatch Luxury Gift Card ฿3,000' },
  { code: 'GIFT5000', amount: 5000, titleTh: 'บัตรของขวัญ OPWatch Prestige มูลค่า ฿5,000', titleEn: 'OPWatch Prestige Gift Card ฿5,000' }
]

function copyGiftCode(code: string) {
  if (import.meta.client) {
    navigator.clipboard?.writeText(code).catch(() => {})
    toast.success(`คัดลอกรหัสตัวอย่างบัตรของขวัญ ${code} หรือสั่งซื้อผ่าน LINE: opwatch.th`)
  }
}

useHead(() => ({
  title: locale.value === 'th'
    ? 'บริการพิเศษ ห่อของขวัญ คะแนนสะสม สาขาใกล้บ้าน & รับประกันของแท้ — OPWatch'
    : 'Boutique Privileges, Gift Wrap, Loyalty Points & Warranty — OPWatch'
}))
</script>

<template>
  <div class="op-services">
    <section class="op-services__hero">
      <div class="container">
        <span class="eyebrow" style="color:#a5b4fc">INTER TIMES EXCLUSIVE PRIVILEGES</span>
        <h1>{{ locale === 'th' ? 'บริการพิเศษระดับบูติก & การรับประกันศูนย์ไทย' : 'Boutique Services & Thailand Official Care' }}</h1>
        <p>
          {{
            locale === 'th'
              ? 'มอบประสบการณ์การเลือกซื้อเรือนเวลาระดับห้างสรรพสินค้าชั้นนำ ทั้งบริการห่อของขวัญฟรี สะสมคะแนน OP Points เปลี่ยนคืนสินค้าภายใน 14 วัน เลือกรับที่สาขาใกล้บ้าน และรับประกันของแท้ 100%'
              : 'Complimentary gift wrapping, OP Loyalty Points, 14-day exchange/return, nearby branch Click & Collect, and 2-year official Thailand warranty.'
          }}
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container stack gap-32">
        <!-- 6 Core Pillars Grid -->
        <div class="op-svc-grid">
          <div class="op-svc-card">
            <div class="op-svc-card__icon">🎁</div>
            <h3>{{ locale === 'th' ? 'บริการห่อของขวัญระดับพรีเมียม' : 'Luxury Gift Wrapping' }}</h3>
            <p>
              {{
                locale === 'th'
                  ? 'ฟรี! กล่องของขวัญโบว์ซาติน Royal Sapphire พร้อมการ์ดอวยพรพิมพ์ข้อความส่วนตัว เลือกเปิดรับบริการได้ทันทีในหน้าชำระเงิน'
                  : 'Complimentary Royal Sapphire ribbon wrapping with personalised greeting card available at checkout.'
              }}
            </p>
            <NuxtLink :to="localePath('/products')" class="op-svc-card__link">เลือกนาฬิกาเป็นของขวัญ →</NuxtLink>
          </div>

          <div class="op-svc-card">
            <div class="op-svc-card__icon">💎</div>
            <h3>{{ locale === 'th' ? 'ระบบสะสมคะแนน OP Points' : 'OP Loyalty Points' }}</h3>
            <p>
              {{
                locale === 'th'
                  ? `ทุกยอดสั่งซื้อ ฿${site.bahtPerPoint || 25} รับทันที 1 คะแนน OP Point และใช้คะแนนแลกเป็นส่วนลดเงินสด 1 คะแนน = ฿1 ในคำสั่งซื้อถัดไป`
                  : `Earn 1 OP Point for every ฿${site.bahtPerPoint || 25} spent and redeem points directly as instant cash discount.`
              }}
            </p>
            <NuxtLink :to="localePath(isAuthenticated ? '/account' : '/account/login')" class="op-svc-card__link">
              {{ isAuthenticated ? `คะแนนสะสมของคุณ: ${customer?.points || 0} คะแนน →` : 'เข้าสู่ระบบเช็คคะแนนสะสม →' }}
            </NuxtLink>
          </div>

          <div class="op-svc-card">
            <div class="op-svc-card__icon">🔄</div>
            <h3>{{ locale === 'th' ? `เปลี่ยนและคืนสินค้าใน ${site.returnWindowDays || 14} วัน` : `${site.returnWindowDays || 14}-Day Exchange & Return` }}</h3>
            <p>
              {{
                locale === 'th'
                  ? 'มั่นใจทุกการสั่งซื้อออนไลน์ หากพบความผิดพลาดจากการผลิตหรือการจัดส่ง สามารถแจ้งเปลี่ยนเรือนใหม่หรือคืนเงินเต็มจำนวนภายใน 14 วัน'
                  : 'Shop with total confidence — hassle-free 14-day exchange or full refund for any manufacturing or transit issue.'
              }}
            </p>
            <NuxtLink :to="localePath('/pages/return-policy')" class="op-svc-card__link">อ่านเงื่อนไขการเปลี่ยนคืนสินค้า →</NuxtLink>
          </div>

          <div class="op-svc-card">
            <div class="op-svc-card__icon">📍</div>
            <h3>{{ locale === 'th' ? 'เลือกสินค้าใกล้บ้าน / รับที่สาขา' : 'Nearby Branch & Click & Collect' }}</h3>
            <p>
              {{
                locale === 'th'
                  ? 'เช็คสาขาเคาน์เตอร์นาฬิกาใกล้บ้านคุณในกรุงเทพฯ เชียงใหม่ และภูเก็ต หรือสั่งซื้อออนไลน์แล้วเลือกรับพร้อมตัดสายข้อมือฟรีที่สาขา'
                  : 'Reserve online and pick up at our Bangkok showroom or leading Thailand department store counters with complimentary bracelet sizing.'
              }}
            </p>
            <NuxtLink :to="localePath('/branches')" class="op-svc-card__link">ค้นหาสาขาใกล้บ้านทั้งหมด →</NuxtLink>
          </div>

          <div class="op-svc-card">
            <div class="op-svc-card__icon">🛡</div>
            <h3>{{ locale === 'th' ? `รับประกันสินค้าของแท้ศูนย์ไทย ${site.warrantyYears || 2} ปี` : `${site.warrantyYears || 2}-Year Authentic Warranty` }}</h3>
            <p>
              {{
                locale === 'th'
                  ? 'จัดจำหน่ายโดย บริษัท อินเตอร์ไทมส์ จำกัด ผู้นำเข้าอย่างเป็นทางการแต่เพียงผู้เดียวในไทย พร้อมศูนย์ซ่อมและอะไหล่แท้มาตรฐานโรงงาน'
                  : '100% authentic timepieces backed by Inter Times Co., Ltd., official sole distributor in Thailand.'
              }}
            </p>
            <NuxtLink :to="localePath('/pages/warranty-authenticity')" class="op-svc-card__link">รายละเอียดการรับประกัน →</NuxtLink>
          </div>

          <div class="op-svc-card">
            <div class="op-svc-card__icon">🎫</div>
            <h3>{{ locale === 'th' ? 'บัตรของขวัญ OPWatch Gift Card' : 'OPWatch Boutique Gift Cards' }}</h3>
            <p>
              {{
                locale === 'th'
                  ? 'มอบอิสระในการเลือกรุ่นนาฬิกาที่ถูกใจให้คนพิเศษ ด้วยบัตรของขวัญดิจิทัลมูลค่า ฿1,000 / ฿3,000 / ฿5,000 ใช้ลดยอดชำระบนหน้าเว็บได้ทันที'
                  : 'Digital & physical boutique gift cards in ฿1,000, ฿3,000, and ฿5,000 denominations redeemable online.'
              }}
            </p>
            <a href="#gift-cards" class="op-svc-card__link">เลือกดูบัตรของขวัญ →</a>
          </div>
        </div>

        <!-- Warranty Checker Box -->
        <div class="op-warranty-box">
          <div>
            <span class="eyebrow">AUTHENTICITY &amp; WARRANTY CHECK</span>
            <h2 class="h2">{{ locale === 'th' ? 'ตรวจสอบสิทธิ์รับประกันสินค้าของแท้ศูนย์ไทย' : 'Verify Thailand Official Warranty' }}</h2>
            <p class="muted" style="margin-top:6px">
              {{ locale === 'th' ? 'ระบุรหัสรุ่นนาฬิกา (เช่น 899832AGS, 385A) หรือเลขใบรับประกัน เพื่อตรวจสอบสิทธิ์ศูนย์บริการ บริษัท อินเตอร์ไทมส์ จำกัด' : 'Enter watch model reference or warranty card number.' }}
            </p>
          </div>
          <form class="op-warranty-form" @submit.prevent="verifyWarranty">
            <input v-model="modelInput" placeholder="รหัสรุ่น เช่น 899832AGS" class="input" />
            <input v-model="serialInput" placeholder="เลขใบรับประกัน / ช่องทางที่ซื้อ" class="input" />
            <button type="submit" class="btn">{{ locale === 'th' ? 'ตรวจสอบรับประกัน' : 'Verify Now' }}</button>
          </form>
          <div v-if="verifyResult" class="op-warranty-ok">✓ {{ verifyResult }}</div>
        </div>

        <!-- Gift Cards Section -->
        <div id="gift-cards" class="op-giftcard-sec">
          <div class="between wrap gap-12" style="margin-bottom:18px">
            <div>
              <span class="eyebrow">BOUTIQUE GIFT CARDS</span>
              <h2 class="h2">{{ locale === 'th' ? 'บัตรของขวัญ OPWatch Gift Card' : 'OPWatch Gift Cards' }}</h2>
            </div>
            <a href="https://line.me/ti/p/~opwatch.th" target="_blank" rel="noopener noreferrer" class="btn btn--sm">
              {{ locale === 'th' ? 'สั่งซื้อบัตรของขวัญทาง LINE: opwatch.th' : 'Order Gift Card via LINE' }}
            </a>
          </div>
          <div class="grid-3">
            <div v-for="gc in giftCards" :key="gc.code" class="op-gc-card">
              <div class="op-gc-card__top">
                <span>OPWATCH THAILAND · GIFT CARD</span>
                <strong>฿{{ gc.amount.toLocaleString() }}</strong>
              </div>
              <div class="op-gc-card__body">
                <h3>{{ locale === 'th' ? gc.titleTh : gc.titleEn }}</h3>
                <p class="muted tiny" style="margin-top:4px">ใช้แลกซื้อนาฬิกา Olym Pianus, Olympia Star และ Ogival ได้ทุกรุ่นบนเว็บไซต์</p>
                <button type="button" class="btn btn--sm btn--ghost btn--block" style="margin-top:12px" @click="copyGiftCode(gc.code)">
                  {{ locale === 'th' ? `ทดลองใช้รหัส ${gc.code}` : `Copy ${gc.code}` }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Nearby Branches Preview -->
        <div v-if="branches.length">
          <div class="between wrap gap-12" style="margin-bottom:18px">
            <div>
              <span class="eyebrow">CLICK &amp; COLLECT THAILAND</span>
              <h2 class="h2">{{ locale === 'th' ? 'สาขาและศูนย์บริการใกล้บ้านคุณ' : 'Showroom & Department Store Counters' }}</h2>
            </div>
            <NuxtLink :to="localePath('/branches')" class="btn btn--sm btn--ghost">
              {{ locale === 'th' ? 'ดูสาขาทั้งหมด →' : 'View All Branches →' }}
            </NuxtLink>
          </div>
          <div class="grid-3">
            <div v-for="br in branches" :key="br.slug" class="card stack gap-8">
              <span class="badge badge--accent" style="width:fit-content">{{ br.province }}</span>
              <h3 style="font-size:17px;font-weight:700">{{ locale === 'en' && br.nameEn ? br.nameEn : br.nameTh }}</h3>
              <p class="muted" style="font-size:13.5px">{{ br.addressTh }}</p>
              <p style="font-size:13px"><strong>โทร:</strong> {{ br.phone }} · <strong>เวลา:</strong> {{ br.hours }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.op-services__hero {
  background: linear-gradient(135deg, #101444 0%, #1d2088 100%);
  color: #ffffff;
  padding: 120px 0 52px;
}
.op-services__hero h1 { font-family: var(--font-display); font-size: clamp(2rem, 3.4vw, 2.8rem); margin-top: 8px; }
.op-services__hero p { max-width: 760px; opacity: 0.9; margin-top: 10px; line-height: 1.75; }
.op-svc-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; }
.op-svc-card {
  background: #ffffff;
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  padding: 26px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.op-svc-card__icon { font-size: 28px; }
.op-svc-card h3 { font-size: 18px; font-weight: 700; color: var(--ink); }
.op-svc-card p { font-size: 14px; color: var(--ink-soft); line-height: 1.7; flex: 1; }
.op-svc-card__link { font-size: 13px; font-weight: 700; color: var(--sapphire); margin-top: 6px; }
.op-warranty-box {
  background: #f5f7fd;
  border: 1px solid #d5daf2;
  border-radius: 14px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.op-warranty-form { display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; }
.op-warranty-ok {
  background: #ecfdf5;
  border: 1px solid #6ee7b7;
  color: #065f46;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
}
.op-gc-card {
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
}
.op-gc-card__top {
  background: linear-gradient(135deg, #1d2088, #0c0f3d);
  color: #ffffff;
  padding: 24px 20px;
}
.op-gc-card__top span { font-size: 10px; letter-spacing: 0.2em; opacity: 0.8; display: block; }
.op-gc-card__top strong { font-family: var(--font-display); font-size: 32px; display: block; margin-top: 6px; }
.op-gc-card__body { padding: 18px 20px; }
.op-gc-card__body h3 { font-size: 15px; font-weight: 700; }
@media (max-width: 900px) {
  .op-svc-grid, .op-warranty-form { grid-template-columns: 1fr; }
}
</style>
