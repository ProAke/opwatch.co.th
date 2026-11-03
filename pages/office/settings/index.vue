<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })

const toast = useToast()
const { refresh: refreshPublicSite } = useSite()
const tab = ref<'company' | 'social' | 'promo' | 'ai'>('company')

const { data, refresh } = await useFetch<any>('/api/admin/settings')

const siteForm = reactive({
  name: 'OPWatch Thailand',
  companyName: 'บริษัท อินเตอร์ไทมส์ จำกัด',
  tagline: 'ตัวแทนจำหน่ายนาฬิกา Olym Pianus, Olympia Star และ Ogival อย่างเป็นทางการในประเทศไทย',
  email: 'info@opwatch.co.th',
  phone: '02 251 5777',
  address: '1091/229 ซอย 35 ถนนเพชรบุรีตัดใหม่ แขวงมักกะสัน เขตราชเทวี กรุงเทพมหานคร 10400',
  currency: 'THB',
  currencySymbol: '฿',
  shippingFee: 0,
  freeShippingThreshold: 0,
  announcement: 'ของแท้ 100% ประกันศูนย์ไทย 2 ปี โดย บริษัท อินเตอร์ไทมส์ จำกัด · ส่งด่วนฟรีทั่วไทย',
  lineId: 'opwatch.th',
  lineUrl: 'https://line.me/ti/p/~opwatch.th',
  facebookUrl: 'https://www.facebook.com/OPwatchThailand',
  tiktokUrl: 'https://www.tiktok.com/@opwatchthailand',
  shopeeUrl: 'https://shopee.co.th/opwatchthailand',
  chatEnabled: true,
  chatGreetingTh: 'สวัสดีครับ ยินดีต้อนรับสู่ OPWatch Boutique สอบถามรุ่นนาฬิกา คูปอง หรือเช็คสาขาใกล้บ้านได้เลยครับ',
  promoHomeEnabled: true,
  promoHomeColumns: 4 as 3 | 4 | 6,
  promoHomeLimit: 8,
  giftWrapEnabled: true,
  giftWrapFee: 0,
  bahtPerPoint: 25,
  returnWindowDays: 14,
  warrantyYears: 2,
  giftCardEnabled: true,
  branchPickupEnabled: true
})

const aiForm = reactive({
  enabled: true,
  provider: 'openai' as 'openai' | 'gemini' | 'anthropic' | 'custom',
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini'
})

watch(
  data,
  (val) => {
    if (val?.site) Object.assign(siteForm, val.site)
    if (val?.ai) {
      aiForm.enabled = val.ai.enabled !== false
      aiForm.provider = val.ai.provider || 'openai'
      aiForm.baseUrl = val.ai.baseUrl || 'https://api.openai.com/v1'
      aiForm.model = val.ai.model || 'gpt-4o-mini'
    }
  },
  { immediate: true }
)

const saving = ref(false)
const testingAi = ref(false)
const aiTestOutput = ref('')

async function saveAllSettings() {
  saving.value = true
  try {
    const aiPayload: Record<string, any> = {
      enabled: aiForm.enabled,
      provider: aiForm.provider,
      baseUrl: aiForm.baseUrl,
      model: aiForm.model
    }
    if (aiForm.apiKey.trim()) aiPayload.apiKey = aiForm.apiKey.trim()

    await $fetch('/api/admin/settings', {
      method: 'PUT',
      body: {
        site: siteForm,
        ai: aiPayload
      }
    })
    aiForm.apiKey = ''
    await refresh()
    await refreshPublicSite()
    toast.success('บันทึกการตั้งค่าทั้งหมดเรียบร้อย!')
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'บันทึกการตั้งค่าไม่สำเร็จ')
  } finally {
    saving.value = false
  }
}

async function testAiEngine() {
  testingAi.value = true
  try {
    const res = await $fetch<any>('/api/admin/ai/generate', {
      method: 'POST',
      body: {
        task: 'seo-aseo',
        input: { nameTh: 'Olym Pianus 899832AGS Sapphire Automatic', brand: 'Olym Pianus', price: 5900 }
      }
    })
    aiTestOutput.value = `[${res.provider}] Title: ${res.result?.seoTitle} | ASEO: ${res.result?.aseoSummary}`
    toast.success('ทดสอบระบบ AI สำเร็จ!')
  } catch {
    toast.error('ทดสอบ AI ไม่สำเร็จ')
  } finally {
    testingAi.value = false
  }
}

useHead({ title: 'ตั้งค่าทั้งหมด (Unified Master Settings) — OPWatch Office' })
</script>

<template>
  <div>
    <div class="erp-page-head">
      <div>
        <div class="erp-kicker">MODULE 7.6 · UNIFIED SYSTEM CONFIGURATION</div>
        <h1 class="erp-h1">ตั้งค่าทั้งหมด (Master Settings &amp; AI Configuration)</h1>
        <p class="erp-sub">
          ศูนย์รวมการตั้งค่าทั้งของเดิมและของใหม่: ข้อมูลบริษัท โซเชียลมีเดีย แชท โปรโมชั่นหน้าแรก (3/4/6 ช่อง) บริการห่อของขวัญ คะแนนสะสม และ AI API
        </p>
      </div>
      <button type="button" class="erp-btn erp-btn--primary" :disabled="saving" @click="saveAllSettings">
        {{ saving ? 'กำลังบันทึก...' : '💾 บันทึกการตั้งค่าทั้งหมด' }}
      </button>
    </div>

    <div class="erp-tabs">
      <button type="button" class="erp-tab" :class="{ 'is-active': tab === 'company' }" @click="tab = 'company'">
        🏢 1. ข้อมูลบริษัท &amp; การจัดส่ง
      </button>
      <button type="button" class="erp-tab" :class="{ 'is-active': tab === 'social' }" @click="tab = 'social'">
        💬 2. โซเชียลมีเดีย &amp; ระบบแชท
      </button>
      <button type="button" class="erp-tab" :class="{ 'is-active': tab === 'promo' }" @click="tab = 'promo'">
        🎁 3. โปรโมชั่นหน้าแรก (3|4|6) &amp; บริการพิเศษ
      </button>
      <button type="button" class="erp-tab" :class="{ 'is-active': tab === 'ai' }" @click="tab = 'ai'">
        ✨ 4. ตั้งค่า AI Engine &amp; API Key
      </button>
    </div>

    <!-- TAB 1: COMPANY & SHIPPING -->
    <div v-if="tab === 'company'" class="erp-panel">
      <div class="erp-form-grid">
        <div class="erp-field">
          <label class="erp-label">ชื่อเว็บไซต์ / แบรนด์ร้านค้า</label>
          <input v-model="siteForm.name" class="erp-input" />
        </div>
        <div class="erp-field">
          <label class="erp-label">ชื่อนิติบุคคล (ผู้จัดจำหน่ายในไทย)</label>
          <input v-model="siteForm.companyName" class="erp-input" />
        </div>
        <div class="erp-field">
          <label class="erp-label">เบอร์โทรศัพท์ศูนย์บริการ</label>
          <input v-model="siteForm.phone" class="erp-input" />
        </div>
        <div class="erp-field">
          <label class="erp-label">อีเมลติดต่อ</label>
          <input v-model="siteForm.email" class="erp-input" />
        </div>
      </div>

      <div class="erp-field" style="margin-top:12px">
        <label class="erp-label">ที่อยู่สำนักงานใหญ่ / ศูนย์บริการประเทศไทย</label>
        <input v-model="siteForm.address" class="erp-input" />
      </div>

      <div class="erp-field" style="margin-top:12px">
        <label class="erp-label">ข้อความประกาศแถบด้านบนเว็บไซต์ (Announcement)</label>
        <input v-model="siteForm.announcement" class="erp-input" />
      </div>

      <div class="erp-form-grid" style="margin-top:12px">
        <div class="erp-field">
          <label class="erp-label">ค่าจัดส่งมาตรฐานในไทย (บาท · 0 = ส่งฟรี)</label>
          <input v-model.number="siteForm.shippingFee" type="number" class="erp-input" />
        </div>
        <div class="erp-field">
          <label class="erp-label">ยอดซื้อขั้นต่ำส่งฟรี (บาท)</label>
          <input v-model.number="siteForm.freeShippingThreshold" type="number" class="erp-input" />
        </div>
      </div>
    </div>

    <!-- TAB 2: SOCIAL & CHAT -->
    <div v-else-if="tab === 'social'" class="erp-panel">
      <div class="erp-form-grid">
        <div class="erp-field">
          <label class="erp-label">LINE Official ID</label>
          <input v-model="siteForm.lineId" class="erp-input" placeholder="opwatch.th" />
        </div>
        <div class="erp-field">
          <label class="erp-label">ลิงก์ LINE Official</label>
          <input v-model="siteForm.lineUrl" class="erp-input" />
        </div>
        <div class="erp-field">
          <label class="erp-label">ลิงก์ Facebook Page</label>
          <input v-model="siteForm.facebookUrl" class="erp-input" />
        </div>
        <div class="erp-field">
          <label class="erp-label">ลิงก์ TikTok Official</label>
          <input v-model="siteForm.tiktokUrl" class="erp-input" />
        </div>
        <div class="erp-field">
          <label class="erp-label">ลิงก์ Shopee Official Store</label>
          <input v-model="siteForm.shopeeUrl" class="erp-input" />
        </div>
        <div class="erp-field" style="justify-content:flex-end">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px">
            <input v-model="siteForm.chatEnabled" type="checkbox" /> เปิดใช้งานปุ่มแชทลอย (Floating Omnichannel Chat Hub) บนหน้าเว็บ
          </label>
        </div>
      </div>

      <div class="erp-field" style="margin-top:14px">
        <label class="erp-label">ข้อความต้อนรับอัตโนมัติในกล่องแชทหน้าเว็บ (ภาษาไทย)</label>
        <textarea v-model="siteForm.chatGreetingTh" class="erp-textarea" rows="2" />
      </div>
    </div>

    <!-- TAB 3: HOMEPAGE PROMO GRID (3 | 4 | 6) & SERVICES -->
    <div v-else-if="tab === 'promo'" class="erp-panel">
      <div class="erp-panel__title" style="margin-bottom:14px">การแสดงผลส่วนโปรโมชั่นหน้าแรก (ถัดจากโลโก้ 3 แบรนด์)</div>
      <div class="erp-form-grid erp-form-grid--3">
        <div class="erp-field">
          <label class="erp-label">จำนวนสินค้าโปรโมชั่นต่อ 1 แถว (3, 4 หรือ 6 ชิ้น)</label>
          <select v-model.number="siteForm.promoHomeColumns" class="erp-select">
            <option :value="3">แสดง 3 ชิ้นต่อแถว (การ์ดขนาดใหญ่พรีเมียม)</option>
            <option :value="4">แสดง 4 ชิ้นต่อแถว (มาตรฐานห้างออนไลน์)</option>
            <option :value="6">แสดง 6 ชิ้นต่อแถว (Flash Deal แสดงครบหลายรุ่น)</option>
          </select>
        </div>
        <div class="erp-field">
          <label class="erp-label">จำนวนสินค้าโปรโมชั่นสูงสุดบนหน้าแรก</label>
          <input v-model.number="siteForm.promoHomeLimit" type="number" min="3" max="24" class="erp-input" />
        </div>
        <div class="erp-field" style="justify-content:flex-end">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
            <input v-model="siteForm.promoHomeEnabled" type="checkbox" /> เปิดแสดงส่วนโปรโมชั่นบนหน้าแรก
          </label>
        </div>
      </div>

      <hr style="border:0;border-top:1px solid #1b2842;margin:20px 0" />

      <div class="erp-panel__title" style="margin-bottom:14px">บริการเสริมพิเศษ คะแนนสะสม OP Points &amp; การรับประกัน</div>
      <div class="erp-form-grid erp-form-grid--3">
        <div class="erp-field">
          <label class="erp-label">ค่าบริการห่อของขวัญ (บาท · 0 = ห่อฟรี)</label>
          <input v-model.number="siteForm.giftWrapFee" type="number" min="0" class="erp-input" />
        </div>
        <div class="erp-field">
          <label class="erp-label">อัตราการสะสมแต้ม (กี่บาท = 1 OP Point)</label>
          <input v-model.number="siteForm.bahtPerPoint" type="number" min="1" class="erp-input" />
        </div>
        <div class="erp-field">
          <label class="erp-label">ระยะเวลาเปลี่ยน/คืนสินค้า (วัน)</label>
          <input v-model.number="siteForm.returnWindowDays" type="number" min="1" class="erp-input" />
        </div>
        <div class="erp-field">
          <label class="erp-label">ระยะเวลารับประกันศูนย์ไทย (ปี)</label>
          <input v-model.number="siteForm.warrantyYears" type="number" min="1" class="erp-input" />
        </div>
      </div>
    </div>

    <!-- TAB 4: AI ENGINE & API -->
    <div v-else class="erp-panel">
      <div class="erp-panel__head">
        <div>
          <div class="erp-panel__title">ตั้งค่า AI Engine &amp; API Key สำหรับเขียนสินค้า, หน้า CMS และ SEO + ASEO</div>
          <div style="font-size:12px;color:#94a3b8;margin-top:3px">
            รองรับ OpenAI, Google Gemini, Anthropic Claude หรือ OpenAI-compatible API — และหากยังไม่ใส่ API Key ระบบมี Built-in Horology AI Engine ภาษาไทยพร้อมใช้งานทันที!
          </div>
        </div>
        <span class="erp-chip" :class="data?.ai?.hasApiKey ? 'erp-chip--mint' : 'erp-chip--cyan'">
          {{ data?.ai?.hasApiKey ? `✓ เชื่อมต่อ API Key แล้ว (${data?.ai?.maskedKey})` : '⚡ โหมด Built-in Horology AI พร้อมใช้งาน' }}
        </span>
      </div>

      <div class="erp-form-grid">
        <div class="erp-field">
          <label class="erp-label">ผู้ให้บริการ AI (Provider)</label>
          <select v-model="aiForm.provider" class="erp-select">
            <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
            <option value="gemini">Google Gemini (gemini-2.0-flash)</option>
            <option value="anthropic">Anthropic Claude (claude-3-5-sonnet)</option>
            <option value="custom">Custom OpenAI-Compatible Endpoint (DeepSeek / OpenRouter / Ollama)</option>
          </select>
        </div>
        <div class="erp-field">
          <label class="erp-label">ชื่อโมเดล (Model Name)</label>
          <input v-model="aiForm.model" class="erp-input" placeholder="เช่น gpt-4o-mini หรือ gemini-2.0-flash" />
        </div>
        <div class="erp-field">
          <label class="erp-label">API Key ใหม่ (เว้นว่างได้หากไม่ต้องการเปลี่ยน หรือใช้ Built-in AI)</label>
          <input v-model="aiForm.apiKey" type="password" class="erp-input" placeholder="sk-..." />
        </div>
        <div class="erp-field">
          <label class="erp-label">Base URL (สำหรับ OpenAI / Custom Endpoint)</label>
          <input v-model="aiForm.baseUrl" class="erp-input" placeholder="https://api.openai.com/v1" />
        </div>
      </div>

      <div style="margin-top:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <button type="button" class="erp-btn erp-btn--violet" :disabled="testingAi" @click="testAiEngine">
          {{ testingAi ? 'กำลังทดสอบ AI...' : '⚡ ทดสอบการสร้างเนื้อหาด้วย AI ทันที' }}
        </button>
        <span v-if="aiTestOutput" style="font-size:12px;color:#6ee7b7">{{ aiTestOutput }}</span>
      </div>
    </div>
  </div>
</template>
