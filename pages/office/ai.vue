<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })

const toast = useToast()

const [{ data: aiData, refresh: refreshAi }, { data: settingsData, refresh: refreshSettings }] = await Promise.all([
  useFetch<any>('/api/admin/ai/status'),
  useFetch<any>('/api/admin/settings')
])

// Provider Connection Config
const aiForm = reactive({
  provider: settingsData.value?.ai?.provider || 'auto',
  model: settingsData.value?.ai?.model || '',
  baseUrl: settingsData.value?.ai?.baseUrl || 'https://openrouter.ai/api/v1',
  apiKey: '',
  brandVoice:
    settingsData.value?.ai?.brandVoice ||
    'หรูหรา น่าเชื่อถือ เป็นทางการในฐานะตัวแทนจำหน่ายนาฬิกาของแท้ในประเทศไทย บริษัท อินเตอร์ไทมส์ จำกัด',
  webhookUrl: settingsData.value?.ai?.webhookUrl || ''
})

const savingConn = ref(false)
const testingConn = ref(false)
const testResult = ref<any>(null)

// Hermes 20-Token Rotating Pool
const hermesBusy = ref(false)
const revealedTokens = ref<{ slot: number; token: string }[]>([])

// Multi-Section AI Content Studio Playground
const studioTab = ref<'product' | 'promo' | 'coupon' | 'page' | 'order' | 'freeform'>('product')
const studioLoading = ref(false)
const studioOutput = ref<any>(null)

const studioInput = reactive({
  productName: 'Olym Pianus Sportmaster Automatic Sapphire 899832AGS',
  brand: 'Olym Pianus',
  price: 6900,
  promoTitle: 'แคมเปญ Exclusive Sapphire Days ลดสูงสุด 35%',
  promoChannel: 'website',
  couponCode: 'OPVIP800',
  couponValue: 800,
  pageTitle: 'คู่มือการดูแลรักษานาฬิกาออโตเมติกและกระจกแซฟไฟร์',
  orderNo: 'OPW-20261103',
  customerName: 'คุณธนกร',
  trackingNumber: 'TH0192837465A',
  freePrompt: 'เขียนโพสต์แนะนำ Ogival Lucky Fish Swiss Automatic สำหรับผู้บริหารที่มองหาของขวัญมงคล'
})

function selectProviderPreset(p: string) {
  aiForm.provider = p
  if (p === 'openrouter') {
    aiForm.baseUrl = 'https://openrouter.ai/api/v1'
    if (!aiForm.model) aiForm.model = 'openai/gpt-4o-mini'
  } else if (p === 'openai') {
    aiForm.baseUrl = 'https://api.openai.com/v1'
    if (!aiForm.model) aiForm.model = 'gpt-4o-mini'
  } else if (p === 'google') {
    if (!aiForm.model) aiForm.model = 'gemini-2.0-flash'
  } else if (p === 'anthropic') {
    if (!aiForm.model) aiForm.model = 'claude-3-5-sonnet-latest'
  }
}

async function saveAiConnection() {
  savingConn.value = true
  try {
    await $fetch('/api/admin/settings', {
      method: 'PUT',
      body: { ai: aiForm }
    })
    aiForm.apiKey = ''
    await Promise.all([refreshAi(), refreshSettings()])
    toast.success('บันทึกการตั้งค่าการเชื่อมต่อ AI เรียบร้อยแล้ว')
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || 'บันทึกการเชื่อมต่อ AI ไม่สำเร็จ')
  } finally {
    savingConn.value = false
  }
}

async function runConnectionTest() {
  testingConn.value = true
  try {
    testResult.value = await $fetch('/api/admin/ai/test', { method: 'POST' })
    if (testResult.value?.ok) toast.success(testResult.value.message)
    else toast.error(testResult.value?.message || 'การทดสอบพบข้อผิดพลาด')
  } catch {
    toast.error('ไม่สามารถทดสอบการเชื่อมต่อได้')
  } finally {
    testingConn.value = false
  }
}

async function hermesAction(action: 'reveal' | 'rotate' | 'revoke' | 'strict') {
  hermesBusy.value = true
  try {
    const res = await $fetch<any>('/api/admin/hermes', {
      method: 'POST',
      body: { action }
    })
    if (res?.revealed) revealedTokens.value = res.revealed
    else if (action === 'revoke') revealedTokens.value = []
    await refreshAi()
    toast.success('อัปเดตชุด 20 Rotating API Tokens สำเร็จ')
  } catch {
    toast.error('จัดการชุดโทเคน Hermes ไม่สำเร็จ')
  } finally {
    hermesBusy.value = false
  }
}

async function copyHermes(mode: 'json' | 'env') {
  if (!revealedTokens.value.length || !import.meta.client) return
  const txt =
    mode === 'json'
      ? JSON.stringify(revealedTokens.value, null, 2)
      : `OPWATCH_HERMES_TOKENS="${revealedTokens.value.map((t) => t.token).join(',')}"`
  await navigator.clipboard.writeText(txt)
  toast.success(`คัดลอก ${mode.toUpperCase()} สำหรับ Hermes ลงคลิปบอร์ดแล้ว`)
}

async function runSectionStudio() {
  studioLoading.value = true
  studioOutput.value = null
  try {
    let task = 'freeform_draft'
    let input: Record<string, any> = {}
    if (studioTab.value === 'product') {
      task = 'product_full'
      input = { name: studioInput.productName, brand: studioInput.brand, price: studioInput.price }
    } else if (studioTab.value === 'promo') {
      task = 'promo_copy'
      input = { title: studioInput.promoTitle, channel: studioInput.promoChannel }
    } else if (studioTab.value === 'coupon') {
      task = 'coupon_copy'
      input = { code: studioInput.couponCode, value: studioInput.couponValue, type: 'fixed', minSpend: 4500 }
    } else if (studioTab.value === 'page') {
      task = 'page_full'
      input = { title: studioInput.pageTitle, topic: studioInput.pageTitle }
    } else if (studioTab.value === 'order') {
      task = 'order_reply'
      input = {
        orderNo: studioInput.orderNo,
        customerName: studioInput.customerName,
        trackingNumber: studioInput.trackingNumber
      }
    } else {
      task = 'freeform_draft'
      input = { prompt: studioInput.freePrompt, agentCode: 'OP-COPY' }
    }

    const res = await $fetch<any>('/api/admin/ai/generate', {
      method: 'POST',
      body: { task, input }
    })
    studioOutput.value = res?.result || null
    await refreshAi()
    toast.success('✨ สร้างเนื้อหาด้วย AI สำเร็จ!')
  } catch {
    toast.error('สร้างเนื้อหาไม่สำเร็จ')
  } finally {
    studioLoading.value = false
  }
}

async function copyStudioJson() {
  if (!studioOutput.value || !import.meta.client) return
  const text =
    studioOutput.value.content ||
    studioOutput.value.message ||
    studioOutput.value.descriptionTh ||
    JSON.stringify(studioOutput.value, null, 2)
  await navigator.clipboard.writeText(String(text).replace(/<[^>]+>/g, ''))
  toast.success('คัดลอกเนื้อหาลงคลิปบอร์ดแล้ว')
}

useHead({ title: 'AI Workforce & เชื่อมต่อ AI · OPWatch Smart ERP' })
</script>

<template>
  <div class="ai-hub">
    <!-- Top Telemetry Row -->
    <div class="kpi-row">
      <div class="kpi">
        <div class="erp-stat__label">สถานะสมองกล AI ปัจจุบัน</div>
        <div class="erp-stat__val" style="font-size: 20px; color: var(--violet)">
          {{ aiData?.provider === 'builtin' ? 'Built-in Horology AI' : aiData?.provider?.toUpperCase() }}
        </div>
        <div class="erp-stat__hint">Model: {{ aiData?.model }}</div>
      </div>
      <div class="kpi">
        <div class="erp-stat__label">AI Agents พร้อมทำงาน</div>
        <div class="erp-stat__val">{{ aiData?.agents?.length || 5 }} <small style="font-size: 13px; color: var(--muted)">Agents</small></div>
        <div class="erp-stat__hint">ครอบคลุมสินค้า · SEO · โปรโมชั่น · ภาพ · แชท</div>
      </div>
      <div class="kpi">
        <div class="erp-stat__label">ปริมาณ Tokens ที่ใช้สะสม</div>
        <div class="erp-stat__val">{{ (aiData?.telemetry?.totalRuns || 0) }} <small style="font-size: 13px; color: var(--muted)">งาน</small></div>
        <div class="erp-stat__hint">{{ (aiData?.telemetry?.totalTokens || 0).toLocaleString() }} / 500,000 Tokens</div>
      </div>
      <div class="kpi">
        <div class="erp-stat__label">Hermes API Token Pool</div>
        <div class="erp-stat__val">{{ aiData?.hermes?.activeCount || 0 }} / 20</div>
        <div class="erp-stat__hint">Rotating Slots สำหรับ Sub-Agents ภายนอก</div>
      </div>
    </div>

    <!-- 5 Specialized AI Agents Grid -->
    <div class="card">
      <div class="card-head">
        <div>
          <div class="card-title">🤖 ทีมงาน AI ประจำระบบ OPWatch (AI Workforce)</div>
          <div class="card-sub">ฝังปุ่มช่วยสร้างเนื้อหาไว้ครบทุกเมนู (สินค้า, โปรโมชั่น, คูปอง, หน้าเว็บ CMS, ปฏิทิน และคำสั่งซื้อ)</div>
        </div>
        <span class="badge b-green">🟢 พร้อมรับคำสั่งทุกโมดูล</span>
      </div>

      <div class="agent-cards">
        <div v-for="ag in aiData?.agents || []" :key="ag.code" class="agent-card">
          <div style="display: flex; align-items: center; gap: 10px">
            <div class="ag-ico" :style="{ background: ag.color }">{{ ag.avatar }}</div>
            <div>
              <b>{{ ag.code }} · {{ ag.name }}</b>
              <div style="font-size: 11.5px; color: var(--muted)">{{ ag.role }}</div>
            </div>
          </div>
          <div class="ag-meta">
            <span>รันแล้ว <b>{{ ag.runCount }}</b> ครั้ง</span>
            <span><b>{{ (ag.tokensUsed || 0).toLocaleString() }}</b> tokens</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Multi-Section AI Content Generator Playground -->
    <div class="card">
      <div class="card-head">
        <div>
          <div class="card-title">✨ สตูดิโอให้ AI ช่วยสร้างเนื้อหาในส่วนต่างๆ (Multi-Section AI Content Studio)</div>
          <div class="card-sub">ทดลองสร้างเนื้อหาพร้อมใช้ได้ทันที หรือกดปุ่ม ✨ AI ในหน้าสินค้า / โปรโมชั่น / หน้าเว็บ / ปฏิทิน โดยตรง</div>
        </div>
      </div>

      <div class="erp-tabs">
        <button type="button" class="erp-tab" :class="{ 'is-active': studioTab === 'product' }" @click="studioTab = 'product'">⌚ คำบรรยายสินค้า &amp; สเปก</button>
        <button type="button" class="erp-tab" :class="{ 'is-active': studioTab === 'promo' }" @click="studioTab = 'promo'">🎯 แคมเปญโปรโมชั่น</button>
        <button type="button" class="erp-tab" :class="{ 'is-active': studioTab === 'coupon' }" @click="studioTab = 'coupon'">🎟 โค้ดคูปองส่วนลด</button>
        <button type="button" class="erp-tab" :class="{ 'is-active': studioTab === 'page' }" @click="studioTab = 'page'">📄 บทความ &amp; หน้า CMS</button>
        <button type="button" class="erp-tab" :class="{ 'is-active': studioTab === 'order' }" @click="studioTab = 'order'">📦 แจ้งสถานะบิล &amp; เลขพัสดุ</button>
        <button type="button" class="erp-tab" :class="{ 'is-active': studioTab === 'freeform' }" @click="studioTab = 'freeform'">✍️ โพสต์โซเชียล / อิสระ</button>
      </div>

      <div class="erp-form-grid">
        <template v-if="studioTab === 'product'">
          <div class="erp-field">
            <label class="erp-label">ชื่อรุ่น / รหัสนาฬิกา</label>
            <input v-model="studioInput.productName" class="erp-input" />
          </div>
          <div class="erp-field">
            <label class="erp-label">แบรนด์ &amp; ราคา (฿)</label>
            <div style="display: flex; gap: 8px">
              <select v-model="studioInput.brand" class="erp-select">
                <option value="Olym Pianus">Olym Pianus</option>
                <option value="Olympia Star">Olympia Star</option>
                <option value="Ogival">Ogival</option>
              </select>
              <input v-model.number="studioInput.price" type="number" class="erp-input" />
            </div>
          </div>
        </template>

        <template v-else-if="studioTab === 'promo'">
          <div class="erp-field">
            <label class="erp-label">ชื่อแคมเปญโปรโมชั่น</label>
            <input v-model="studioInput.promoTitle" class="erp-input" />
          </div>
          <div class="erp-field">
            <label class="erp-label">ช่องทางแคมเปญ</label>
            <select v-model="studioInput.promoChannel" class="erp-select">
              <option value="website">Website (opwatch.co.th)</option>
              <option value="shopee">Shopee Official Mall</option>
              <option value="line">LINE @opwatch.th</option>
              <option value="branch">เคาน์เตอร์ห้าง 6 สาขา</option>
            </select>
          </div>
        </template>

        <template v-else-if="studioTab === 'coupon'">
          <div class="erp-field">
            <label class="erp-label">รหัสคูปอง</label>
            <input v-model="studioInput.couponCode" class="erp-input" />
          </div>
          <div class="erp-field">
            <label class="erp-label">มูลค่าส่วนลด (฿)</label>
            <input v-model.number="studioInput.couponValue" type="number" class="erp-input" />
          </div>
        </template>

        <template v-else-if="studioTab === 'page'">
          <div class="erp-field erp-field--full">
            <label class="erp-label">หัวข้อหน้าเว็บไซต์ / บทความความรู้เรื่องนาฬิกา</label>
            <input v-model="studioInput.pageTitle" class="erp-input" />
          </div>
        </template>

        <template v-else-if="studioTab === 'order'">
          <div class="erp-field">
            <label class="erp-label">เลขที่คำสั่งซื้อ &amp; ชื่อลูกค้า</label>
            <div style="display: flex; gap: 8px">
              <input v-model="studioInput.orderNo" class="erp-input" />
              <input v-model="studioInput.customerName" class="erp-input" />
            </div>
          </div>
          <div class="erp-field">
            <label class="erp-label">เลขพัสดุ (Tracking Number)</label>
            <input v-model="studioInput.trackingNumber" class="erp-input" />
          </div>
        </template>

        <template v-else>
          <div class="erp-field erp-field--full">
            <label class="erp-label">โจทย์คอนเทนต์ที่ต้องการให้ AI เขียน</label>
            <textarea v-model="studioInput.freePrompt" rows="2" class="erp-textarea" />
          </div>
        </template>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px">
        <button type="button" class="erp-btn erp-btn--primary" :disabled="studioLoading" @click="runSectionStudio">
          {{ studioLoading ? 'กำลังสร้างเนื้อหา...' : '✨ สร้างเนื้อหาทันที' }}
        </button>
      </div>

      <div v-if="studioOutput" class="studio-result-box">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
          <strong style="color: var(--violet)">✓ ผลลัพธ์เนื้อหาจาก AI พร้อมนำไปใช้งาน</strong>
          <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" @click="copyStudioJson">📋 คัดลอกเนื้อหา</button>
        </div>
        <pre>{{ JSON.stringify(studioOutput, null, 2) }}</pre>
      </div>
    </div>

    <!-- AI Provider Connection & Hermes 20-Token Pool (2 Columns) -->
    <div class="ai-grid-2">
      <!-- Left: Connect External LLM Provider -->
      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">🔌 ตั้งค่าการเชื่อมต่อผู้ให้บริการ AI (LLM Connection)</div>
            <div class="card-sub">รองรับ OpenRouter, OpenAI, Google Gemini, Anthropic Claude และ Custom Endpoint</div>
          </div>
          <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" :disabled="testingConn" @click="runConnectionTest">
            {{ testingConn ? 'กำลังทดสอบ...' : '🔄 ทดสอบการเชื่อมต่อสด' }}
          </button>
        </div>

        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px">
          <button
            v-for="[p, lbl] in [
              ['auto', '⚡ Auto (อัตโนมัติ)'],
              ['openrouter', '🌐 OpenRouter'],
              ['openai', '🟢 OpenAI'],
              ['google', '🔵 Google Gemini'],
              ['anthropic', '🟣 Claude'],
              ['custom', '⚙️ Custom Flow URL']
            ]"
            :key="p"
            type="button"
            class="chip"
            :class="{ on: aiForm.provider === p }"
            @click="selectProviderPreset(p)"
          >
            {{ lbl }}
          </button>
        </div>

        <div v-if="testResult" class="conn-banner" :class="testResult.ok ? 'is-ok' : 'is-warn'">
          {{ testResult.message }}
        </div>

        <div class="erp-form-grid">
          <div class="erp-field">
            <label class="erp-label">ชื่อโมเดล (Model ID)</label>
            <input v-model="aiForm.model" class="erp-input" placeholder="เช่น openai/gpt-4o-mini หรือ gemini-2.0-flash" />
          </div>
          <div class="erp-field">
            <label class="erp-label">API Base URL (สำหรับ OpenRouter / OpenAI / Custom)</label>
            <input v-model="aiForm.baseUrl" class="erp-input" placeholder="https://openrouter.ai/api/v1" />
          </div>
          <div class="erp-field erp-field--full">
            <label class="erp-label">
              API Key {{ aiData?.maskedKey ? `(บันทึกไว้แล้ว: ${aiData.maskedKey})` : '(เว้นว่างได้เพื่อใช้ Built-in Horology AI ฟรี)' }}
            </label>
            <input v-model="aiForm.apiKey" type="password" class="erp-input" placeholder="sk-or-v1-... / sk-... / AIza..." />
          </div>
          <div class="erp-field erp-field--full">
            <label class="erp-label">โทนเสียงของแบรนด์ (Brand Voice Prompt)</label>
            <textarea v-model="aiForm.brandVoice" rows="2" class="erp-textarea" />
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 14px">
          <button type="button" class="erp-btn erp-btn--primary" :disabled="savingConn" @click="saveAiConnection">
            {{ savingConn ? 'กำลังบันทึก...' : 'บันทึกการเชื่อมต่อ AI' }}
          </button>
        </div>
      </div>

      <!-- Right: Hermes & External AI 20-Token Rotating Pool (exact ProAke/mng-erp feature) -->
      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">🔑 Hermes &amp; External AI (20-Token Rotating Pool)</div>
            <div class="card-sub">ชุด API Token หมุนเวียน 20 ช่อง (Slot #01–#20) ลดคอขวดเมื่อรันหลาย Sub-Agent พร้อมกัน</div>
          </div>
          <span class="badge b-purple">{{ aiData?.hermes?.activeCount || 0 }} / 20 Slots</span>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px">
          <button type="button" class="erp-btn erp-btn--primary erp-btn--sm" :disabled="hermesBusy" @click="hermesAction('reveal')">
            🔑 สร้าง / ดู 20 Tokens
          </button>
          <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" :disabled="hermesBusy" @click="hermesAction('rotate')">
            🔄 หมุนเปลี่ยนใหม่ทั้ง 20 ตัว
          </button>
          <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" :disabled="hermesBusy" @click="hermesAction('strict')">
            {{ aiData?.hermes?.strictDualAuth ? '🔓 ปิด Strict Dual-Auth' : '🔒 เปิด Strict Dual-Auth' }}
          </button>
          <button
            v-if="aiData?.hermes?.activeCount"
            type="button"
            class="erp-btn erp-btn--danger erp-btn--sm"
            :disabled="hermesBusy"
            @click="hermesAction('revoke')"
          >
            🚫 เพิกถอนทั้งหมด
          </button>
        </div>

        <div v-if="revealedTokens.length" style="margin-bottom: 12px">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px">
            <b style="font-size: 12px; color: var(--mint)">✓ ปลดล็อกชุด 20 Rotating Tokens แล้ว</b>
            <div style="display: flex; gap: 6px">
              <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" @click="copyHermes('json')">📋 คัดลอก JSON</button>
              <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" @click="copyHermes('env')">📋 คัดลอก .env</button>
            </div>
          </div>
          <pre class="hermes-box">{{ revealedTokens.map((t) => `Slot #${String(t.slot).padStart(2, '0')} : ${t.token}`).join('\n') }}</pre>
        </div>

        <div v-if="(aiData?.hermes?.slots || []).length" class="slot-grid">
          <div
            v-for="s in aiData.hermes.slots"
            :key="s.slot"
            class="slot-chip"
            :class="{ active: !s.revoked }"
          >
            <div style="display: flex; justify-content: space-between; font-size: 10.5px">
              <b>#{{ String(s.slot).padStart(2, '0') }} {{ s.revoked ? '🔴' : '🟢' }}</b>
              <span>{{ s.useCount }} ครั้ง</span>
            </div>
            <code>{{ s.preview }}</code>
          </div>
        </div>
        <p v-else style="font-size: 12px; color: var(--muted)">
          กดปุ่ม <b>"🔑 สร้าง / ดู 20 Tokens"</b> เพื่อออกชุดโทเคนหมุนเวียนสำหรับเชื่อมต่อ Hermes หรือระบบอัตโนมัติภายนอก
        </p>
      </div>
    </div>

    <!-- Recent AI Runs Activity Log -->
    <div class="card">
      <div class="card-head">
        <div class="card-title">📜 ประวัติการทำงานของ AI ล่าสุด (AI Run Log)</div>
        <span class="badge b-blue">{{ (aiData?.recentRuns || []).length }} รายการล่าสุด</span>
      </div>
      <div class="erp-table-wrap">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Agent</th>
              <th>ประเภทงาน</th>
              <th>หัวข้อคำสั่ง</th>
              <th>ตัวอย่างผลลัพธ์</th>
              <th>Tokens</th>
              <th>ความเร็ว</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in aiData?.recentRuns || []" :key="r.id">
              <td><span class="badge b-purple">{{ r.agentCode }}</span></td>
              <td><code>{{ r.task }}</code></td>
              <td><b>{{ r.promptSummary }}</b></td>
              <td style="max-width: 340px; color: var(--ink-2)">{{ r.outputPreview }}</td>
              <td>{{ r.tokens }}</td>
              <td>{{ r.durationMs }} ms</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-hub { display: flex; flex-direction: column; gap: 20px; }
.agent-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}
.agent-card {
  padding: 14px;
  border-radius: 14px;
  background: var(--bg);
  border: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ag-ico {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 19px;
  color: #ffffff;
  flex-shrink: 0;
}
.ag-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11.5px;
  color: var(--muted);
  padding-top: 8px;
  border-top: 1px solid var(--line);
}

.studio-result-box {
  margin-top: 14px;
  padding: 14px;
  border-radius: 14px;
  background: #f8f7ff;
  border: 1px solid #d7d0fb;
}
.studio-result-box pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--ink);
  max-height: 300px;
  overflow-y: auto;
}

.ai-grid-2 {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 18px;
}
.conn-banner {
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12.5px;
  margin-bottom: 12px;
}
.conn-banner.is-ok { background: var(--mint-soft); color: #0e9f6e; border: 1px solid #a7f3d0; }
.conn-banner.is-warn { background: var(--yellow-soft); color: #b45309; border: 1px solid #fde68a; }

.hermes-box {
  padding: 10px 12px;
  border-radius: 10px;
  background: #1e2140;
  color: #e9e7ff;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  max-height: 150px;
  overflow-y: auto;
  margin: 0;
}
.slot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(125px, 1fr));
  gap: 7px;
}
.slot-chip {
  padding: 7px 9px;
  border-radius: 9px;
  border: 1px solid var(--line);
  background: var(--bg);
}
.slot-chip.active { border-color: #c8f2e2; background: #f4fcf9; }
.slot-chip code { font-size: 10.5px; color: var(--ink-2); display: block; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; }

@media (max-width: 1080px) {
  .ai-grid-2 { grid-template-columns: 1fr; }
}
</style>
