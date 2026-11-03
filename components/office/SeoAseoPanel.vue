<script setup lang="ts">
const props = defineProps<{
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  aseoSummary: string
  aseoFaqs: { q: string; a: string }[]
  previewUrl?: string
  aiLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:seoTitle', v: string): void
  (e: 'update:seoDescription', v: string): void
  (e: 'update:seoKeywords', v: string): void
  (e: 'update:aseoSummary', v: string): void
  (e: 'update:aseoFaqs', v: { q: string; a: string }[]): void
  (e: 'generateAi'): void
}>()

const score = computed(() => {
  let pts = 0
  if (props.seoTitle?.length >= 25 && props.seoTitle.length <= 75) pts += 25
  else if (props.seoTitle?.length > 5) pts += 15
  if (props.seoDescription?.length >= 70 && props.seoDescription.length <= 200) pts += 25
  else if (props.seoDescription?.length > 15) pts += 15
  if (props.seoKeywords?.split(',').filter((x) => x.trim()).length >= 3) pts += 15
  if (props.aseoSummary?.length >= 50) pts += 20
  if (Array.isArray(props.aseoFaqs) && props.aseoFaqs.filter((f) => f.q && f.a).length >= 2) pts += 15
  return Math.min(100, pts)
})

function addFaq() {
  const next = Array.isArray(props.aseoFaqs) ? [...props.aseoFaqs] : []
  next.push({ q: '', a: '' })
  emit('update:aseoFaqs', next)
}

function updateFaq(idx: number, key: 'q' | 'a', val: string) {
  const next = (Array.isArray(props.aseoFaqs) ? [...props.aseoFaqs] : []).map((f, i) =>
    i === idx ? { ...f, [key]: val } : f
  )
  emit('update:aseoFaqs', next)
}

function removeFaq(idx: number) {
  const next = (Array.isArray(props.aseoFaqs) ? [...props.aseoFaqs] : []).filter((_, i) => i !== idx)
  emit('update:aseoFaqs', next)
}
</script>

<template>
  <div class="seo-studio">
    <div class="seo-studio__head">
      <div>
        <div class="seo-studio__title">SEO &amp; ASEO Intelligence Studio</div>
        <div class="seo-studio__sub">
          ปรับแต่งการค้นหา Google (SEO) + AI Search Engine / ChatGPT / Gemini / Perplexity (ASEO) ทั้งแบบ AI อัตโนมัติและแก้ไขเอง (Manual)
        </div>
      </div>
      <div class="seo-studio__right">
        <div class="seo-studio__score" :class="score >= 80 ? 'is-good' : score >= 50 ? 'is-mid' : ''">
          คะแนน SEO/ASEO: <strong>{{ score }}/100</strong>
        </div>
        <button type="button" class="erp-btn erp-btn--primary" :disabled="aiLoading" @click="emit('generateAi')">
          {{ aiLoading ? 'กำลังประมวลผล AI...' : '✨ ให้ AI สร้าง SEO + ASEO อัตโนมัติ' }}
        </button>
      </div>
    </div>

    <!-- Live Google SERP Preview -->
    <div class="seo-studio__serp">
      <div class="seo-studio__serp-tag">ตัวอย่างผลลัพธ์บน Google Search (SERP Preview)</div>
      <div class="seo-studio__serp-url">{{ previewUrl || 'https://www.opwatch.co.th/...' }}</div>
      <div class="seo-studio__serp-title">{{ seoTitle || 'ยังไม่ได้ระบุ SEO Title — กดปุ่ม AI หรือพิมพ์ด้านล่าง' }}</div>
      <div class="seo-studio__serp-desc">{{ seoDescription || 'คำอธิบาย Meta Description ที่ช่วยเพิ่มอัตราคลิก (CTR) บนผลการค้นหา Google...' }}</div>
    </div>

    <!-- Standard SEO Fields -->
    <div class="erp-form-grid">
      <div class="erp-field">
        <label class="erp-label">SEO Meta Title ({{ (seoTitle || '').length }}/70)</label>
        <input
          :value="seoTitle"
          class="erp-input"
          placeholder="เช่น Olym Pianus รุ่น 899832AGS ของแท้ กระจกแซฟไฟร์ | OPWatch ศูนย์ไทย"
          @input="(e: any) => emit('update:seoTitle', e.target.value)"
        />
      </div>
      <div class="erp-field">
        <label class="erp-label">Focus Keywords (คั่นด้วยจุลภาค ,)</label>
        <input
          :value="seoKeywords"
          class="erp-input"
          placeholder="เช่น Olym Pianus, นาฬิกาของแท้, กระจกแซฟไฟร์, OPWatch"
          @input="(e: any) => emit('update:seoKeywords', e.target.value)"
        />
      </div>
    </div>

    <div class="erp-field">
      <label class="erp-label">SEO Meta Description ({{ (seoDescription || '').length }}/160)</label>
      <textarea
        :value="seoDescription"
        class="erp-textarea"
        rows="2"
        placeholder="สรุปจุดเด่น ราคา โปรโมชั่น และการรับประกันศูนย์ไทย 2 ปี..."
        @input="(e: any) => emit('update:seoDescription', e.target.value)"
      />
    </div>

    <!-- ASEO (Answer Engine Optimization) Block -->
    <div class="seo-studio__aseo">
      <div class="seo-studio__aseo-head">
        <div>
          <span class="erp-chip erp-chip--violet">ASEO · AI Search Ready</span>
          <strong style="margin-left: 8px; color: #e2e8f0; font-size: 13.5px">ข้อมูลสรุปสำหรับ AI Search &amp; JSON-LD FAQ Schema</strong>
        </div>
        <button type="button" class="erp-btn erp-btn--sm" @click="addFaq">+ เพิ่มคำถาม Q&amp;A</button>
      </div>

      <div class="erp-field" style="margin-top: 10px">
        <label class="erp-label">ASEO Entity Summary (บทสรุปข้อเท็จจริงให้ AI อ้างอิงแบรนด์อย่างแม่นยำ)</label>
        <textarea
          :value="aseoSummary"
          class="erp-textarea"
          rows="2"
          placeholder="สรุปข้อเท็จจริงครบถ้วนสำหรับ AI เช่น แบรนด์ รุ่น กลไก กระจก ราคา ตัวแทนจำหน่าย บริษัท อินเตอร์ไทมส์ จำกัด..."
          @input="(e: any) => emit('update:aseoSummary', e.target.value)"
        />
      </div>

      <div v-if="aseoFaqs && aseoFaqs.length" class="seo-studio__faqs">
        <div v-for="(faq, idx) in aseoFaqs" :key="idx" class="seo-studio__faq-row">
          <div style="flex: 1; display: grid; gap: 6px">
            <input
              :value="faq.q"
              class="erp-input"
              placeholder="คำถาม (Q): เช่น นาฬิการุ่นนี้รับประกันศูนย์ไทยกี่ปี?"
              @input="(e: any) => updateFaq(idx, 'q', e.target.value)"
            />
            <input
              :value="faq.a"
              class="erp-input"
              placeholder="คำตอบ (A): รับประกันศูนย์ไทย 2 ปีเต็ม โดย บริษัท อินเตอร์ไทมส์ จำกัด..."
              @input="(e: any) => updateFaq(idx, 'a', e.target.value)"
            />
          </div>
          <button type="button" class="erp-btn erp-btn--sm" style="color: #fda4af" @click="removeFaq(idx)">ลบ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.seo-studio { display: flex; flex-direction: column; gap: 14px; }
.seo-studio__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}
.seo-studio__title { font-size: 15px; font-weight: 700; color: #f8fafc; }
.seo-studio__sub { font-size: 12px; color: #8da0c2; margin-top: 2px; }
.seo-studio__right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.seo-studio__score {
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid #334155;
  background: #0f172a;
  color: #cbd5e1;
}
.seo-studio__score.is-good { border-color: rgba(52, 211, 153, 0.45); color: #6ee7b7; background: rgba(52, 211, 153, 0.1); }
.seo-studio__score.is-mid { border-color: rgba(251, 191, 36, 0.45); color: #fde68a; background: rgba(251, 191, 36, 0.1); }
.seo-studio__serp {
  background: #070d1a;
  border: 1px solid #1b2a47;
  border-radius: 12px;
  padding: 12px 16px;
}
.seo-studio__serp-tag { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 4px; }
.seo-studio__serp-url { font-size: 12px; color: #34d399; }
.seo-studio__serp-title { font-size: 16px; font-weight: 600; color: #60a5fa; margin-top: 2px; }
.seo-studio__serp-desc { font-size: 12.5px; color: #94a3b8; margin-top: 3px; line-height: 1.5; }
.seo-studio__aseo {
  background: rgba(167, 139, 250, 0.06);
  border: 1px solid rgba(167, 139, 250, 0.25);
  border-radius: 12px;
  padding: 14px;
}
.seo-studio__aseo-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
.seo-studio__faqs { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
.seo-studio__faq-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 8px;
  background: #091121;
  border: 1px solid #1c2c4c;
  border-radius: 10px;
}
</style>
