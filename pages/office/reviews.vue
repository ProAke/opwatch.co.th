<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })

const toast = useToast()
const activeTab = ref<'articles' | 'customers'>('articles')

const { data, refresh } = await useFetch<any>('/api/admin/reviews')

const rootPageId = computed<number | null>(() => data.value?.rootPageId || null)
const articles = computed<any[]>(() => data.value?.articles || [])
const reviews = computed<any[]>(() => data.value?.reviews || [])
const products = computed<any[]>(() => data.value?.products || [])

// Article / Product Review Editor Modal
const showEditor = ref(false)
const editingId = ref<number | null>(null)
const savingArticle = ref(false)
const aiBusy = ref(false)
const aiPrompt = ref('')
const prodSearch = ref('')

const artForm = reactive({
  slug: '',
  brandSlug: 'olympianus',
  category: 'hands-on-review',
  heroEyebrow: 'HANDS-ON WATCH REVIEW',
  titleTh: '',
  titleEn: '',
  summary: '',
  contentTh: '',
  banner: '/images/op/banner-899832ags.jpg',
  rating: 4.9,
  testedSku: '',
  author: 'ทีมผู้เชี่ยวชาญเรือนเวลา อินเตอร์ไทมส์',
  readMinutes: 5,
  prosText: 'กระจก Sapphire Crystal แท้กันรอยขีดข่วน\nตัวเรือนสแตนเลสสตีล 316L ขัดแต่งประณีต\nรับประกันศูนย์ไทย 2 ปี บริษัท อินเตอร์ไทมส์ จำกัด',
  scoreDesign: 9.7,
  scoreMovement: 9.6,
  scoreMaterial: 9.8,
  scoreValue: 9.9,
  productIds: [] as number[],
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  status: 'published'
})

function openNewArticle() {
  editingId.value = null
  artForm.slug = ''
  artForm.brandSlug = 'olympianus'
  artForm.category = 'hands-on-review'
  artForm.heroEyebrow = 'HANDS-ON WATCH REVIEW · OPWATCH THAILAND'
  artForm.titleTh = ''
  artForm.titleEn = ''
  artForm.summary = ''
  artForm.contentTh = ''
  artForm.banner = '/images/op/banner-899832ags.jpg'
  artForm.rating = 4.9
  artForm.testedSku = ''
  artForm.author = 'ทีมผู้เชี่ยวชาญเรือนเวลา อินเตอร์ไทมส์'
  artForm.readMinutes = 5
  artForm.prosText = 'กระจก Sapphire Crystal แท้กันรอยขีดข่วน\nตัวเรือนสแตนเลสสตีล 316L ขัดแต่งประณีต\nรับประกันศูนย์ไทย 2 ปี บริษัท อินเตอร์ไทมส์ จำกัด'
  artForm.scoreDesign = 9.7
  artForm.scoreMovement = 9.6
  artForm.scoreMaterial = 9.8
  artForm.scoreValue = 9.9
  artForm.productIds = []
  artForm.seoTitle = ''
  artForm.seoDescription = ''
  artForm.seoKeywords = ''
  artForm.status = 'published'
  showEditor.value = true
}

function openEditArticle(art: any) {
  editingId.value = Number(art.id)
  const sc = art.styleConfig || {}
  const vs = sc.verdictScore || {}
  artForm.slug = art.slug || ''
  artForm.brandSlug = art.brandSlug || ''
  artForm.category = art.category || 'hands-on-review'
  artForm.heroEyebrow = art.heroEyebrow || 'HANDS-ON WATCH REVIEW'
  artForm.titleTh = art.titleTh || art.title || ''
  artForm.titleEn = art.titleEn || ''
  artForm.summary = art.summary || ''
  artForm.contentTh = art.contentTh || art.content || ''
  artForm.banner = art.banner || '/images/op/banner-899832ags.jpg'
  artForm.rating = Number(sc.rating || 4.9)
  artForm.testedSku = sc.testedSku || ''
  artForm.author = sc.author || 'ทีมผู้เชี่ยวชาญเรือนเวลา อินเตอร์ไทมส์'
  artForm.readMinutes = Number(sc.readMinutes || 5)
  artForm.prosText = Array.isArray(sc.pros) ? sc.pros.join('\n') : ''
  artForm.scoreDesign = Number(vs.design || 9.7)
  artForm.scoreMovement = Number(vs.movement || 9.6)
  artForm.scoreMaterial = Number(vs.material || 9.8)
  artForm.scoreValue = Number(vs.value || 9.9)
  artForm.productIds = Array.isArray(art.productIds) ? art.productIds.map(Number) : []
  artForm.seoTitle = art.seoTitle || ''
  artForm.seoDescription = art.seoDescription || ''
  artForm.seoKeywords = art.seoKeywords || ''
  artForm.status = art.status || 'published'
  showEditor.value = true
}

async function generateWithAi() {
  aiBusy.value = true
  try {
    const res = await $fetch<any>('/api/admin/ai/generate', {
      method: 'POST',
      body: {
        task: 'article_review',
        input: {
          brandSlug: artForm.brandSlug,
          testedSku: artForm.testedSku || '899832AGS',
          category: artForm.category,
          titleTh: artForm.titleTh,
          prompt: aiPrompt.value
        }
      }
    })
    const out = res?.result || {}
    if (out.titleTh) artForm.titleTh = out.titleTh
    if (out.titleEn) artForm.titleEn = out.titleEn
    if (out.heroEyebrow) artForm.heroEyebrow = out.heroEyebrow
    if (out.summary) artForm.summary = out.summary
    if (out.contentTh) artForm.contentTh = out.contentTh
    if (out.seoTitle) artForm.seoTitle = out.seoTitle
    if (out.seoDescription) artForm.seoDescription = out.seoDescription
    if (out.seoKeywords) artForm.seoKeywords = out.seoKeywords
    if (out.styleConfig?.pros) artForm.prosText = out.styleConfig.pros.join('\n')
    toast.success('✨ AI สร้างบทความรีวิว คะแนนทดสอบ และ SEO เรียบร้อยแล้ว')
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'AI ไม่สามารถสร้างเนื้อหาได้')
  } finally {
    aiBusy.value = false
  }
}

const filteredProducts = computed(() => {
  const kw = prodSearch.value.trim().toLowerCase()
  return products.value
    .filter((p) => {
      if (artForm.brandSlug && p.brand !== artForm.brandSlug) return false
      if (!kw) return true
      return `${p.sku || ''} ${p.nameTh || ''} ${p.name || ''}`.toLowerCase().includes(kw)
    })
    .slice(0, 18)
})

function toggleProd(id: number) {
  const idx = artForm.productIds.indexOf(Number(id))
  if (idx >= 0) artForm.productIds.splice(idx, 1)
  else artForm.productIds.push(Number(id))
}

async function saveArticle() {
  if (!artForm.titleTh.trim()) {
    toast.error('กรุณาระบุหัวข้อบทความรีวิว')
    return
  }
  savingArticle.value = true
  try {
    const slug =
      artForm.slug.trim() ||
      `review-${(artForm.testedSku || artForm.brandSlug || 'watch').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`

    const payload = {
      parentId: rootPageId.value,
      slug,
      pageType: 'article_review',
      routePath: `/reviews/${slug}`,
      brandSlug: artForm.brandSlug,
      category: artForm.category,
      heroEyebrow: artForm.heroEyebrow,
      title: artForm.titleTh,
      titleTh: artForm.titleTh,
      titleEn: artForm.titleEn || artForm.titleTh,
      summary: artForm.summary,
      contentTh: artForm.contentTh,
      banner: artForm.banner,
      productIds: artForm.productIds,
      styleConfig: {
        fontFamily: 'Prompt',
        headingColor: '#ffffff',
        textColor: '#1e2438',
        accentColor: '#1d2088',
        bgColor: '#101638',
        overlayOpacity: 0.58,
        headingSize: 'xl',
        rating: Number(artForm.rating || 4.9),
        testedSku: artForm.testedSku,
        author: artForm.author,
        publishedAt: new Date().toISOString().slice(0, 10),
        readMinutes: Number(artForm.readMinutes || 5),
        verdictScore: {
          design: Number(artForm.scoreDesign || 9.7),
          movement: Number(artForm.scoreMovement || 9.6),
          material: Number(artForm.scoreMaterial || 9.8),
          value: Number(artForm.scoreValue || 9.9)
        },
        pros: artForm.prosText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      },
      seoTitle: artForm.seoTitle || `${artForm.titleTh} | OPWatch Thailand`,
      seoDescription: artForm.seoDescription || artForm.summary,
      seoKeywords: artForm.seoKeywords,
      status: artForm.status
    }

    if (editingId.value) {
      await $fetch(`/api/admin/pages/${editingId.value}`, { method: 'PUT', body: payload })
      toast.success('บันทึกการแก้ไขบทความรีวิวเรียบร้อย')
    } else {
      await $fetch('/api/admin/pages', { method: 'POST', body: payload })
      toast.success('เผยแพร่บทความรีวิวใหม่เรียบร้อย')
    }
    showEditor.value = false
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'บันทึกไม่สำเร็จ')
  } finally {
    savingArticle.value = false
  }
}

async function deleteArticle(art: any) {
  if (!window.confirm(`ยืนยันลบบทความ "${art.titleTh || art.title}" ?`)) return
  await $fetch(`/api/admin/pages/${art.id}`, { method: 'DELETE' })
  toast.success('ลบบทความเรียบร้อย')
  await refresh()
}

// Customer Review Moderation
async function toggleCustomerReviewStatus(rv: any) {
  const next = rv.status === 'approved' ? 'hidden' : 'approved'
  await $fetch(`/api/admin/reviews/${rv.id}`, {
    method: 'PUT',
    body: { status: next }
  })
  toast.success(next === 'approved' ? 'อนุมัติแสดงผลรีวิวแล้ว' : 'ซ่อนรีวิวจากหน้าเว็บแล้ว')
  await refresh()
}

async function removeCustomerReview(rv: any) {
  if (!window.confirm(`ลบความคิดเห็นของ "${rv.customerName}" ?`)) return
  await $fetch(`/api/admin/reviews/${rv.id}`, { method: 'DELETE' })
  toast.success('ลบรีวิวลูกค้าเรียบร้อย')
  await refresh()
}

useHead({ title: 'จัดการบทความ & รีวิวสินค้า — OPWatch ERP' })
</script>

<template>
  <div>
    <div class="erp-page-head">
      <div>
        <div class="erp-kicker">HOROLOGY JOURNAL &amp; PRODUCT REVIEWS · บทความ-รีวิวสินค้า</div>
        <h1 class="erp-h1">บทความเจาะลึก &amp; รีวิวสินค้า ({{ articles.length }} บทความ · {{ reviews.length }} รีวิวลูกค้า)</h1>
        <p class="erp-sub">
          สร้างบทความรีวิวเรือนเวลาด้วย AI พร้อมตารางคะแนน Horologist Scorecard เชื่อมโยงสินค้ารุ่นจริง และดูแลความคิดเห็นจากลูกค้าหน้าเว็บ
        </p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <NuxtLink to="/reviews" target="_blank" class="erp-btn erp-btn--ghost">
          🌐 เปิดดูหน้า บทความ-รีวิวสินค้า ↗
        </NuxtLink>
        <button type="button" class="erp-btn erp-btn--primary" @click="openNewArticle">
          + เขียนบทความรีวิวสินค้าใหม่ (AI)
        </button>
      </div>
    </div>

    <!-- Switch Tabs -->
    <div style="display:flex;gap:8px;margin-bottom:18px">
      <button
        type="button"
        class="erp-btn"
        :class="activeTab === 'articles' ? 'erp-btn--primary' : 'erp-btn--ghost'"
        @click="activeTab = 'articles'"
      >
        📰 บทความ &amp; รีวิวเจาะลึก ({{ articles.length }})
      </button>
      <button
        type="button"
        class="erp-btn"
        :class="activeTab === 'customers' ? 'erp-btn--primary' : 'erp-btn--ghost'"
        @click="activeTab = 'customers'"
      >
        ⭐ รีวิวจากลูกค้าจริง ({{ reviews.length }})
      </button>
    </div>

    <!-- TAB 1: EDITORIAL ARTICLES & REVIEWS -->
    <div v-if="activeTab === 'articles'" class="erp-card" style="padding:0;overflow:hidden">
      <table class="erp-table">
        <thead>
          <tr>
            <th>ปก</th>
            <th>หัวข้อบทความ / รุ่นที่ทดสอบ</th>
            <th>หมวด / แบรนด์</th>
            <th>คะแนนรีวิว</th>
            <th>สินค้าที่เชื่อม</th>
            <th>สถานะ</th>
            <th style="text-align:right">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="art in articles" :key="art.id">
            <td style="width:74px">
              <img :src="art.banner || '/images/op/hero-diver-dark.jpg'" alt="" style="width:62px;height:42px;object-fit:cover;border-radius:8px" />
            </td>
            <td>
              <strong style="display:block;color:#1e293b">{{ art.titleTh || art.title }}</strong>
              <span style="font-size:12px;color:#64748b">
                /reviews/{{ art.slug }}
                <template v-if="art.styleConfig?.testedSku"> · รุ่นทดสอบ: <b>{{ art.styleConfig.testedSku }}</b></template>
              </span>
            </td>
            <td>
              <span class="erp-badge erp-badge--violet">{{ art.category || 'hands-on-review' }}</span>
              <div style="font-size:11.5px;color:#64748b;margin-top:3px">{{ art.brandSlug || 'ทุกแบรนด์' }}</div>
            </td>
            <td>
              <strong style="color:#d97706">★ {{ art.styleConfig?.rating || '4.9' }} / 5.0</strong>
            </td>
            <td>{{ Array.isArray(art.productIds) ? art.productIds.length : 0 }} รุ่น</td>
            <td>
              <span class="erp-badge" :class="art.status === 'published' ? 'erp-badge--mint' : 'erp-badge--amber'">
                {{ art.status === 'published' ? 'เผยแพร่แล้ว' : 'ฉบับร่าง' }}
              </span>
            </td>
            <td style="text-align:right;white-space:nowrap">
              <NuxtLink :to="`/reviews/${art.slug}`" target="_blank" class="erp-btn erp-btn--ghost" style="padding:5px 10px;font-size:12px;margin-right:4px">
                ดูหน้าจริง ↗
              </NuxtLink>
              <button type="button" class="erp-btn erp-btn--ghost" style="padding:5px 10px;font-size:12px;margin-right:4px" @click="openEditArticle(art)">
                แก้ไข
              </button>
              <button type="button" class="erp-btn erp-btn--ghost" style="padding:5px 10px;font-size:12px;color:#dc2626" @click="deleteArticle(art)">
                ลบ
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- TAB 2: CUSTOMER PRODUCT REVIEWS -->
    <div v-else class="erp-card" style="padding:0;overflow:hidden">
      <table class="erp-table">
        <thead>
          <tr>
            <th>ลูกค้าผู้รีวิว</th>
            <th>รุ่นนาฬิกา</th>
            <th>คะแนน</th>
            <th>ข้อความรีวิว</th>
            <th>สถานะ</th>
            <th style="text-align:right">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rv in reviews" :key="rv.id">
            <td>
              <strong>{{ rv.customerName }}</strong>
              <div style="font-size:11.5px;color:#64748b">{{ String(rv.createdAt || '').slice(0, 10) }}</div>
            </td>
            <td>
              <template v-if="rv.product">
                <strong>{{ rv.product.sku }}</strong>
                <div style="font-size:11.5px;color:#64748b">{{ rv.product.nameTh || rv.product.name }}</div>
              </template>
              <span v-else>#{{ rv.productId }}</span>
            </td>
            <td style="color:#f59e0b;font-weight:700">{{ '★'.repeat(Number(rv.rating || 5)) }} ({{ rv.rating }})</td>
            <td style="max-width:420px;font-size:13px;line-height:1.55">{{ rv.comment }}</td>
            <td>
              <span class="erp-badge" :class="rv.status === 'approved' ? 'erp-badge--mint' : 'erp-badge--amber'">
                {{ rv.status === 'approved' ? 'แสดงผลหน้าเว็บ' : 'ซ่อนอยู่' }}
              </span>
            </td>
            <td style="text-align:right;white-space:nowrap">
              <button type="button" class="erp-btn erp-btn--ghost" style="padding:5px 10px;font-size:12px;margin-right:4px" @click="toggleCustomerReviewStatus(rv)">
                {{ rv.status === 'approved' ? 'ซ่อน' : 'อนุมัติแสดงผล' }}
              </button>
              <button type="button" class="erp-btn erp-btn--ghost" style="padding:5px 10px;font-size:12px;color:#dc2626" @click="removeCustomerReview(rv)">
                ลบ
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ARTICLE / PRODUCT REVIEW EDITOR MODAL -->
    <div v-if="showEditor" class="rv-modal-backdrop" @click.self="showEditor = false">
      <div class="rv-modal">
        <div class="rv-modal__head">
          <div>
            <strong>{{ editingId ? 'แก้ไขบทความรีวิวสินค้า' : 'สร้างบทความ & รีวิวสินค้าใหม่' }}</strong>
            <span style="display:block;font-size:12px;color:#64748b">หัวข้อบนหน้าเว็บจะใช้ตัวอักษรสีขาว (#ffffff) บนแบนเนอร์สีน้ำเงินเข้มอัตโนมัติ</span>
          </div>
          <button type="button" class="erp-btn erp-btn--ghost" @click="showEditor = false">✕ ปิด</button>
        </div>

        <!-- AI One-Click Writer -->
        <div class="rv-ai-bar">
          <input
            v-model="aiPrompt"
            class="erp-input"
            placeholder="สั่ง AI เช่น 'รีวิวรุ่น 899832AGS เน้นขอบเซรามิก กระจกแซฟไฟร์ และความคุ้มค่าใส่ทำงาน'"
          />
          <button type="button" class="erp-btn erp-btn--primary" :disabled="aiBusy" @click="generateWithAi">
            {{ aiBusy ? 'กำลังเขียน...' : '✨ ให้ AI เขียนรีวิวสินค้า' }}
          </button>
        </div>

        <div class="rv-form-grid">
          <div>
            <label class="erp-label">หัวข้อบทความภาษาไทย *</label>
            <input v-model="artForm.titleTh" class="erp-input" placeholder="เช่น รีวิวเจาะลึก Olym Pianus 899832AGS..." />
          </div>
          <div>
            <label class="erp-label">URL Slug (เว้นว่างให้สร้างอัตโนมัติ)</label>
            <input v-model="artForm.slug" class="erp-input" placeholder="เช่น review-op-899832ags" />
          </div>
          <div>
            <label class="erp-label">แบรนด์สินค้า</label>
            <select v-model="artForm.brandSlug" class="erp-input">
              <option value="olympianus">Olym Pianus (OP)</option>
              <option value="olympia-star">Olympia Star</option>
              <option value="ogival">Ogival Swiss 1903</option>
              <option value="">บทความรวมทุกแบรนด์</option>
            </select>
          </div>
          <div>
            <label class="erp-label">หมวดบทความ</label>
            <select v-model="artForm.category" class="erp-input">
              <option value="hands-on-review">รีวิวใช้งานจริง (Hands-On Review)</option>
              <option value="comparison">เปรียบเทียบกลไก (Comparison)</option>
              <option value="buyers-guide">คู่มือเลือกซื้อ (Buyer’s Guide)</option>
              <option value="horology-care">การดูแลรักษา (Watch Care)</option>
            </select>
          </div>
          <div>
            <label class="erp-label">รหัสรุ่นที่ทดสอบ (Tested SKU)</label>
            <input v-model="artForm.testedSku" class="erp-input" placeholder="เช่น 899832AGS" />
          </div>
          <div>
            <label class="erp-label">คะแนนรวม (เต็ม 5.0 ★)</label>
            <input v-model.number="artForm.rating" type="number" step="0.1" min="1" max="5" class="erp-input" />
          </div>
          <div style="grid-column:1 / -1">
            <label class="erp-label">รูปปกบทความ (Banner URL)</label>
            <input v-model="artForm.banner" class="erp-input" />
          </div>
          <div style="grid-column:1 / -1">
            <label class="erp-label">คำโปรยสรุป (Summary)</label>
            <textarea v-model="artForm.summary" rows="2" class="erp-input" />
          </div>
          <div style="grid-column:1 / -1">
            <label class="erp-label">เนื้อหาบทความรีวิวฉบับเต็ม (รองรับ HTML &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;)</label>
            <textarea v-model="artForm.contentTh" rows="7" class="erp-input" />
          </div>
          <div style="grid-column:1 / -1">
            <label class="erp-label">จุดเด่นจากการทดสอบ (Pros — บรรทัดละ 1 ข้อ)</label>
            <textarea v-model="artForm.prosText" rows="3" class="erp-input" />
          </div>

          <div style="grid-column:1 / -1">
            <label class="erp-label">เลือกเชื่อมสินค้ารุ่นที่รีวิว ({{ artForm.productIds.length }} รุ่นที่เลือก)</label>
            <input v-model="prodSearch" class="erp-input" placeholder="ค้นหารหัส SKU หรือชื่อรุ่นเพื่อเชื่อมกับบทความ..." style="margin-bottom:8px" />
            <div class="rv-prod-chips">
              <button
                v-for="p in filteredProducts"
                :key="p.id"
                type="button"
                class="rv-prod-chip"
                :class="{ selected: artForm.productIds.includes(Number(p.id)) }"
                @click="toggleProd(Number(p.id))"
              >
                {{ artForm.productIds.includes(Number(p.id)) ? '✓ ' : '+ ' }}{{ p.sku }} — {{ p.nameTh || p.name }}
              </button>
            </div>
          </div>
        </div>

        <div class="rv-modal__foot">
          <button type="button" class="erp-btn erp-btn--ghost" @click="showEditor = false">ยกเลิก</button>
          <button type="button" class="erp-btn erp-btn--primary" :disabled="savingArticle" @click="saveArticle">
            {{ savingArticle ? 'กำลังบันทึก...' : '💾 บันทึกบทความรีวิวสินค้า' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rv-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgba(15, 23, 42, 0.52);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.rv-modal {
  width: min(880px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.24);
}
.rv-modal__head,
.rv-modal__foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.rv-modal__head {
  padding-bottom: 14px;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 14px;
}
.rv-modal__foot {
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  margin-top: 16px;
}
.rv-ai-bar {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  background: #f5f3ff;
  border: 1px solid #ddd6fe;
  margin-bottom: 16px;
}
.rv-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.rv-prod-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 150px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
}
.rv-prod-chip {
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  font-size: 12px;
  cursor: pointer;
}
.rv-prod-chip.selected {
  background: #6c5ce7;
  border-color: #6c5ce7;
  color: #ffffff;
  font-weight: 600;
}
</style>
