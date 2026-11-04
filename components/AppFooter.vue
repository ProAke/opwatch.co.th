<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()

function scrollToTop() {
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <footer class="op-ftr">
    <!-- Upper Main Footer: Official Thailand Distributor — บริษัท อินเตอร์ไทมส์ จำกัด -->
    <div class="op-ftr__main">
      <div class="container op-ftr__inner">
        <!-- Official Inter Times Blue Logo at Bottom (inter time จะอยู่ด้านล่าง) -->
        <div class="op-ftr__company-logo-wrap">
          <img
            src="/images/logos/inter-times-blue.jpg"
            alt="บริษัท อินเตอร์ไทมส์ จำกัด (Inter Times Co., Ltd.)"
            class="op-ftr__company-logo"
            loading="lazy"
          />
        </div>

        <!-- Official Address & Phone -->
        <div class="op-ftr__distributors">
          <h3 class="op-ftr__company-name">
            {{ locale === 'th' ? 'บริษัท อินเตอร์ไทมส์ จำกัด' : 'Inter Times Co., Ltd. (บริษัท อินเตอร์ไทมส์ จำกัด)' }}
          </h3>
          <p class="op-ftr__address">
            {{
              locale === 'th'
                ? '1091/229 ซอย 35 ถนนเพชรบุรีตัดใหม่ แขวงมักกะสัน เขตราชเทวี กรุงเทพมหานคร 10400'
                : '1091/229 Soi 35, New Phetchaburi Rd., Makkasan, Ratchathewi, Bangkok 10400, Thailand'
            }}
          </p>
          <p class="op-ftr__phone">
            <span>{{ locale === 'th' ? 'โทรศัพท์ :' : 'Tel :' }}</span>
            <a href="tel:022515777">02 251 5777</a>
          </p>
        </div>

        <!-- Official Channels: Line ID, Facebook Page, Shopee -->
        <div class="op-ftr__channels">
          <a
            href="https://line.me/ti/p/~opwatch.th"
            target="_blank"
            rel="noopener noreferrer"
            class="op-ftr__channel op-ftr__channel--line"
          >
            <span class="op-ftr__channel-badge">LINE</span>
            <span>Line ID : <strong>opwatch.th</strong></span>
          </a>

          <a
            href="https://www.facebook.com/OPwatchThailand"
            target="_blank"
            rel="noopener noreferrer"
            class="op-ftr__channel op-ftr__channel--fb"
          >
            <span class="op-ftr__channel-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.2H7.5V13h2.7v8h3.3Z" />
              </svg>
            </span>
            <span>Facebook : <strong>OPwatchThailand</strong></span>
          </a>

          <a
            href="https://www.tiktok.com/@opwatchthailand"
            target="_blank"
            rel="noopener noreferrer"
            class="op-ftr__channel op-ftr__channel--tiktok"
          >
            <span class="op-ftr__channel-badge" style="background:#111111;color:#fff">TT</span>
            <span>TikTok : <strong>@opwatchthailand</strong></span>
          </a>

          <a
            href="https://shopee.co.th/opwatchthailand"
            target="_blank"
            rel="noopener noreferrer"
            class="op-ftr__channel op-ftr__channel--shopee"
          >
            <span class="op-ftr__channel-badge">S</span>
            <span>Shopee : <strong>shopee.co.th/opwatchthailand</strong></span>
          </a>
        </div>

        <div class="op-ftr__cta">
          <NuxtLink :to="localePath('/promotions')" class="op-ftr__contact-btn" style="margin-right:8px;margin-bottom:8px">
            {{ locale === 'th' ? '🎁 รวมโปรโมชั่น & เก็บคูปองส่วนลด' : '🎁 Promotions & Vouchers' }}
          </NuxtLink>
          <NuxtLink :to="localePath('/services')" class="op-ftr__contact-btn" style="margin-right:8px;margin-bottom:8px">
            {{ locale === 'th' ? '✦ ห่อของขวัญ · เช็คสาขาใกล้บ้าน · ประกันแท้ 2 ปี' : '✦ Gift Wrap · Branches · 2-Yr Warranty' }}
          </NuxtLink>
          <NuxtLink :to="localePath('/warranty')" class="op-ftr__contact-btn" style="margin-bottom:8px">
            {{ locale === 'th' ? '🛡 ลงทะเบียนรับประกัน & แจ้งซ่อมออนไลน์' : '🛡 Online Warranty & Watch Repair' }}
          </NuxtLink>
        </div>

        <!-- Quick Navigation Links -->
        <nav class="op-ftr__quick" aria-label="Boutique links">
          <NuxtLink :to="localePath('/')">{{ locale === 'th' ? 'หน้าแรก' : 'Home' }}</NuxtLink>
          <NuxtLink :to="localePath('/promotions')">{{ locale === 'th' ? 'โปรโมชั่น' : 'Promotions' }}</NuxtLink>
          <NuxtLink :to="localePath('/products')">Collections</NuxtLink>
          <NuxtLink :to="localePath('/brands/olympianus')">Olym Pianus</NuxtLink>
          <NuxtLink :to="localePath('/brands/olympia-star')">Olympia Star</NuxtLink>
          <NuxtLink :to="localePath('/brands/ogival')">Ogival</NuxtLink>
          <NuxtLink :to="localePath('/warranty')">{{ locale === 'th' ? 'ลงทะเบียนประกัน & แจ้งซ่อม' : 'Warranty & Repair' }}</NuxtLink>
          <NuxtLink :to="localePath('/services')">{{ locale === 'th' ? 'บริการพิเศษ & บัตรของขวัญ' : 'Services & Gift Cards' }}</NuxtLink>
          <NuxtLink :to="localePath('/branches')">{{ locale === 'th' ? 'สาขาใกล้บ้าน' : 'Branches' }}</NuxtLink>
          <NuxtLink :to="localePath('/track')">{{ locale === 'th' ? 'เช็คสถานะพัสดุ' : 'Track Order' }}</NuxtLink>
          <NuxtLink :to="localePath('/contact')">{{ locale === 'th' ? 'ติดต่อเรา' : 'Contact' }}</NuxtLink>
        </nav>

        <!-- Legal & Policy Links (PDPA, Cookie, Terms, Return, Warranty) -->
        <nav class="op-ftr__quick" style="margin-top: 8px; opacity: 0.85; font-size: 12px" aria-label="Legal policies">
          <NuxtLink :to="localePath('/pages/privacy-policy')">{{ locale === 'th' ? 'นโยบายความเป็นส่วนตัว (PDPA)' : 'Privacy Policy' }}</NuxtLink>
          <NuxtLink :to="localePath('/pages/cookie-policy')">{{ locale === 'th' ? 'นโยบายคุกกี้' : 'Cookie Policy' }}</NuxtLink>
          <NuxtLink :to="localePath('/pages/terms-conditions')">{{ locale === 'th' ? 'ข้อตกลงและเงื่อนไข' : 'Terms & Conditions' }}</NuxtLink>
          <NuxtLink :to="localePath('/pages/return-policy')">{{ locale === 'th' ? 'เปลี่ยนและคืนสินค้า' : 'Exchange & Return' }}</NuxtLink>
          <NuxtLink :to="localePath('/pages/warranty-authenticity')">{{ locale === 'th' ? 'รับประกันสินค้าของแท้' : 'Authenticity Warranty' }}</NuxtLink>
        </nav>
      </div>
    </div>

    <!-- Bottom Copyright Socket Bar: Royal Sapphire (#1d2088) -->
    <div class="op-ftr__socket">
      <div class="container op-ftr__socket-row">
        <p>
          {{
            locale === 'th'
              ? '© สงวนลิขสิทธิ์ – บริษัท อินเตอร์ไทมส์ จำกัด (Opwatch.co.th) · โทร. 02 251 5777'
              : '© Copyright – Inter Times Co., Ltd. (Opwatch.co.th) · Tel. 02 251 5777'
          }}
        </p>
        <div class="op-ftr__socket-links">
          <NuxtLink :to="localePath('/brands/olympianus')">Olym Pianus</NuxtLink>
          <NuxtLink :to="localePath('/brands/olympia-star')">Olympia Star</NuxtLink>
          <NuxtLink :to="localePath('/brands/ogival')">Ogival</NuxtLink>
          <NuxtLink :to="localePath('/contact')">Contact</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Floating Scroll-to-Top Button -->
    <button type="button" class="op-ftr__top" aria-label="Scroll to top" @click="scrollToTop">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="m18 15-6-6-6 6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </footer>
</template>

<style scoped>
.op-ftr {
  position: relative;
}

.op-ftr__main {
  background: var(--platinum);
  color: var(--ink-soft);
  border-top: 1px solid var(--line-strong);
}
.op-ftr__inner {
  padding-block: 64px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.op-ftr__company-logo-wrap {
  margin-bottom: 20px;
}
.op-ftr__company-logo {
  height: 54px;
  width: auto;
  max-width: min(360px, 86vw);
  object-fit: contain;
  display: block;
  box-shadow: 0 6px 18px rgba(29, 32, 136, 0.14);
}

.op-ftr__distributors {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 760px;
}
.op-ftr__company-name {
  font-family: var(--font-display);
  font-size: 21px;
  font-weight: 600;
  color: var(--sapphire);
  letter-spacing: 0.03em;
}
.op-ftr__address {
  font-size: 15px;
  color: var(--ink);
  line-height: 1.7;
}
.op-ftr__phone {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--sapphire);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.op-ftr__phone a {
  color: var(--sapphire);
  letter-spacing: 0.05em;
}
.op-ftr__phone a:hover {
  text-decoration: underline;
}

.op-ftr__channels {
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}
.op-ftr__channel {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 9px 18px;
  background: #ffffff;
  border: 1px solid var(--line-strong);
  font-size: 13.5px;
  color: var(--ink);
  transition: transform 0.25s var(--ease), border-color 0.25s, box-shadow 0.25s;
}
.op-ftr__channel:hover {
  transform: translateY(-2px);
  border-color: var(--sapphire);
  box-shadow: 0 8px 20px rgba(25, 26, 53, 0.08);
}
.op-ftr__channel-badge {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-family: var(--font-sans);
  font-size: 9px;
  font-weight: 700;
  flex: none;
}
.op-ftr__channel--line .op-ftr__channel-badge {
  background: #06C755;
}
.op-ftr__channel--fb .op-ftr__channel-badge {
  background: #1877F2;
}
.op-ftr__channel--shopee .op-ftr__channel-badge {
  background: #EE4D2D;
  font-size: 13px;
}

.op-ftr__cta {
  margin-top: 26px;
}
.op-ftr__contact-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 34px;
  background: var(--sapphire);
  border: 1px solid var(--sapphire);
  color: #ffffff;
  font-family: var(--font-roman);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  transition: background 0.28s var(--ease), border-color 0.28s var(--ease), box-shadow 0.28s var(--ease);
}
.op-ftr__contact-btn:hover {
  background: var(--sapphire-bright);
  border-color: var(--sapphire-bright);
  box-shadow: 0 8px 22px rgba(29, 32, 136, 0.22);
}

.op-ftr__quick {
  margin-top: 34px;
  padding-top: 22px;
  border-top: 1px solid var(--line-strong);
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px 26px;
  font-family: var(--font-roman);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.op-ftr__quick a:hover {
  color: var(--sapphire);
}

.op-ftr__socket {
  background: var(--sapphire);
  border-top: 1px solid var(--sapphire-soft);
  padding-block: 16px;
  font-size: 11.5px;
  letter-spacing: 0.06em;
  color: #eeeeee;
}
.op-ftr__socket-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.op-ftr__socket-links {
  display: flex;
  gap: 20px;
  font-family: var(--font-roman);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.op-ftr__socket-links a {
  color: #ffffff;
  transition: color 0.2s;
}
.op-ftr__socket-links a:hover {
  color: #a4b9ff;
}

.op-ftr__top {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 40;
  width: 42px;
  height: 42px;
  background: #ffffff;
  border: 1px solid var(--line-strong);
  color: var(--sapphire);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow);
  transition: background 0.25s, color 0.25s, border-color 0.25s;
}
.op-ftr__top:hover {
  background: var(--sapphire);
  color: #ffffff;
  border-color: var(--sapphire);
}
</style>
