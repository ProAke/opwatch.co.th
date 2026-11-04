<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })

const toast = useToast()

const { data, refresh } = await useFetch<any>('/api/admin/pages')
const { data: prodRes } = await useFetch<any>('/api/admin/products', {
  query: { limit: 450 }
})

const pages = computed<any[]>(() => data.value?.items || [])
const allProducts = computed<any[]>(() => prodRes.value?.items || [])
const productById = computed(() => {
  const m = new Map<number, any>()
  for (const p of allProducts.value) m.set(Number(p.id), p)
  return m
})

// Tree state
const expandedIds = ref<Record<number, boolean>>({})
const treeSearch = ref('')
const selectedId = ref<number | null>(null)
const isCreatingNew = ref(false)

const pageTypeMeta: Record<string, { label: string; badge: string; icon: string }> = {
  system_page: { label: 'หน้าหลักเว็บไซต์', badge: 'b-blue', icon: '🌐' },
  brand_gate: { label: 'หน้ากั้นแบรนด์สินค้า', badge: 'b-purple', icon: '🏛' },
  series_story: { label: 'Story ประจำซีรีส์', badge: 'b-mint', icon: '⌚' },
  promo_story: { label: 'เรื่องโปรโมชั่น', badge: 'b-pink', icon: '🎁' },
  custom_landing: { label: 'หน้าสร้างใหม่ + เชื่อมสินค้า', badge: 'b-amber', icon: '✨' },
  legal: { label: 'นโยบาย / กฎหมาย', badge: 'b-gray', icon: '📜' }
}

interface TreeNode {
  page: any
  children: TreeNode[]
}

const treeRoots = computed<TreeNode[]>(() => {
  const list = pages.value
  const q = treeSearch.value.trim().toLowerCase()
  const byId = new Map<number, TreeNode>()
  for (const p of list) {
    byId.set(Number(p.id), { page: p, children: [] })
  }
  const roots: TreeNode[] = []
  for (const p of list) {
    const node = byId.get(Number(p.id))!
    const pid = p.parentId ? Number(p.parentId) : null
    if (pid && byId.has(pid) && pid !== Number(p.id)) {
      byId.get(pid)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  const sortNodes = (arr: TreeNode[]) => {
    arr.sort((a, b) => Number(a.page.sortOrder || 0) - Number(b.page.sortOrder || 0))
    for (const n of arr) sortNodes(n.children)
  }
  sortNodes(roots)

  if (!q) return roots
  const filterTree = (nodes: TreeNode[]): TreeNode[] => {
    const out: TreeNode[] = []
    for (const n of nodes) {
      const kids = filterTree(n.children)
      const hay = `${n.page.titleTh || ''} ${n.page.title || ''} ${n.page.slug || ''} ${n.page.seoKeywords || ''} ${n.page.routePath || ''}`.toLowerCase()
      if (hay.includes(q) || kids.length > 0) {
        out.push({ page: n.page, children: kids })
      }
    }
    return out
  }
  return filterTree(roots)
})

function isExpanded(id: number) {
  if (expandedIds.value[id] === undefined) return true
  return expandedIds.value[id]
}

function toggleExpand(id: number) {
  expandedIds.value[id] = !isExpanded(id)
}

// Editor Form State
const editorTab = ref<'content' | 'style' | 'products' | 'seo'>('content')
const saving = ref(false)
const aiRunning = ref(false)
const aiMatching = ref(false)
const aiBrief = ref('')

const form = reactive({
  parentId: null as number | null,
  slug: '',
  pageType: 'series_story',
  routePath: '',
  brandSlug: 'olympianus',
  seriesKey: '',
  heroEyebrow: '',
  titleTh: '',
  titleEn: '',
  summary: '',
  summaryEn: '',
  contentTh: '',
  contentEn: '',
  bannerUrls: ['/images/op/hero-diver-dark.jpg'] as string[],
  galleryUrls: [] as string[],
  ctaText: 'ชมเรือนเวลาในคอลเลกชันนี้',
  ctaUrl: '/products',
  styleConfig: {
    fontFamily: 'Prompt',
    headingColor: '#ffffff',
    textColor: '#1e2438',
    accentColor: '#1d2088',
    bgColor: '#0e1535',
    overlayOpacity: 0.56,
    headingSize: 'xl'
  },
  productIds: [] as number[],
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  aseoSummary: '',
  aseoFaqs: [] as { q: string; a: string }[],
  published: true,
  sortOrder: 50
})

function selectPage(p: any) {
  isCreatingNew.value = false
  selectedId.value = Number(p.id)
  const sc = p.styleConfig || {}
  form.parentId = p.parentId ? Number(p.parentId) : null
  form.slug = p.slug || ''
  form.pageType = p.pageType || 'custom_landing'
  form.routePath = p.routePath || `/pages/${p.slug}`
  form.brandSlug = p.brandSlug || ''
  form.seriesKey = p.seriesKey || ''
  form.heroEyebrow = p.heroEyebrow || ''
  form.titleTh = p.titleTh || p.title || ''
  form.titleEn = p.titleEn || ''
  form.summary = p.summary || p.excerptTh || ''
  form.summaryEn = p.summaryEn || ''
  form.contentTh = p.contentTh || ''
  form.contentEn = p.contentEn || ''
  form.bannerUrls = p.banner ? [p.banner] : ['/images/op/hero-diver-dark.jpg']
  form.galleryUrls = Array.isArray(p.gallery) ? [...p.gallery] : []
  form.ctaText = p.ctaText || ''
  form.ctaUrl = p.ctaUrl || ''
  form.styleConfig = {
    fontFamily: sc.fontFamily || 'Prompt',
    headingColor: sc.headingColor || '#ffffff',
    textColor: sc.textColor || '#1e2438',
    accentColor: sc.accentColor || '#1d2088',
    bgColor: sc.bgColor || '#0e1535',
    overlayOpacity: sc.overlayOpacity !== undefined ? Number(sc.overlayOpacity) : 0.56,
    headingSize: sc.headingSize || 'xl'
  }
  form.productIds = Array.isArray(p.productIds) ? p.productIds.map(Number).filter(Boolean) : []
  form.seoTitle = p.seoTitle || ''
  form.seoDescription = p.seoDescription || ''
  form.seoKeywords = p.seoKeywords || ''
  form.aseoSummary = p.aseoSummary || ''
  form.aseoFaqs = Array.isArray(p.aseoFaqs) ? [...p.aseoFaqs] : []
  form.published = p.status !== 'draft'
  form.sortOrder = Number(p.sortOrder ?? 50)
}

// Auto-select first root page on load
watch(
  pages,
  (list) => {
    if (list.length && !selectedId.value && !isCreatingNew.value) {
      selectPage(list[0])
    }
  },
  { immediate: true }
)

function startNewPage(parentNode?: any, defaultType = 'custom_landing') {
  isCreatingNew.value = true
  selectedId.value = null
  const inferredType = parentNode?.pageType === 'brand_gate'
    ? 'series_story'
    : parentNode?.slug === 'site-promotions'
      ? 'promo_story'
      : defaultType
  form.parentId = parentNode ? Number(parentNode.id) : null
  form.slug = ''
  form.pageType = inferredType
  form.routePath = ''
  form.brandSlug = parentNode?.brandSlug || (inferredType === 'series_story' ? 'olympianus' : '')
  form.seriesKey = ''
  form.heroEyebrow = inferredType === 'series_story' ? 'SERIES STORY · EXCLUSIVE COLLECTION' : inferredType === 'promo_story' ? 'PROMOTION STORY' : 'OPWATCH THAILAND'
  form.titleTh = ''
  form.titleEn = ''
  form.summary = ''
  form.summaryEn = ''
  form.contentTh = ''
  form.contentEn = ''
  form.bannerUrls = ['/images/op/banner-899832ags.jpg']
  form.galleryUrls = []
  form.ctaText = 'ดูสินค้าที่เกี่ยวข้องทั้งหมด'
  form.ctaUrl = '/products'
  form.styleConfig = {
    fontFamily: 'Prompt',
    headingColor: '#ffffff',
    textColor: '#1e2438',
    accentColor: '#1d2088',
    bgColor: '#0e1535',
    overlayOpacity: 0.56,
    headingSize: 'xl'
  }
  form.productIds = []
  form.seoTitle = ''
  form.seoDescription = ''
  form.seoKeywords = ''
  form.aseoSummary = ''
  form.aseoFaqs = []
  form.published = true
  form.sortOrder = 60
  editorTab.value = 'content'
}

// Keyword chip helper (`คำค้นหา / key`)
const keywordInput = ref('')
const keywordChips = computed(() =>
  String(form.seoKeywords || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)
)

function addKeywordChip() {
  const kw = keywordInput.value.trim()
  if (!kw) return
  const next = Array.from(new Set([...keywordChips.value, kw]))
  form.seoKeywords = next.join(', ')
  keywordInput.value = ''
}

function removeKeywordChip(kw: string) {
  form.seoKeywords = keywordChips.value.filter((x) => x !== kw).join(', ')
}

// Related Products Picker (`สร้างหน้าใหม่แล้วเอาสินค้าที่เกี่ยวข้องมาเชื่อมหน้าอีกที`)
const prodSearch = ref('')
const prodBrandFilter = ref('')

const linkedProducts = computed(() =>
  form.productIds.map((id) => productById.value.get(Number(id))).filter(Boolean)
)

const candidateProducts = computed(() => {
  const q = prodSearch.value.trim().toLowerCase()
  const bf = prodBrandFilter.value || ''
  const linkedSet = new Set(form.productIds.map(Number))
  return allProducts.value
    .filter((p) => {
      if (linkedSet.has(Number(p.id))) return false
      if (bf && String(p.brandSlug || p.brand) !== bf) return false
      if (!q) return true
      return `${p.sku || ''} ${p.nameTh || ''} ${p.name || ''}`.toLowerCase().includes(q)
    })
    .slice(0, 24)
})

function toggleLinkProduct(id: number) {
  const idx = form.productIds.indexOf(Number(id))
  if (idx >= 0) form.productIds.splice(idx, 1)
  else form.productIds.push(Number(id))
}

function moveLinked(idx: number, dir: -1 | 1) {
  const target = idx + dir
  if (target < 0 || target >= form.productIds.length) return
  const copy = [...form.productIds]
  const [moved] = copy.splice(idx, 1)
  copy.splice(target, 0, moved)
  form.productIds = copy
}

// AI Full Page + Style + Keywords + Auto-Match Watches
async function runAiPageAssistant(alsoMatchProducts = true) {
  if (!form.titleTh.trim() && !aiBrief.value.trim()) {
    toast.error('กรุณาพิมพ์หัวข้อหน้าเว็บ หรือคำสั่งสั้นๆ ให้ AI ช่วยจัดการ')
    return
  }
  aiRunning.value = true
  try {
    const res = await $fetch<any>('/api/admin/ai/generate', {
      method: 'POST',
      body: {
        task: 'page_full',
        agentCode: 'OP-CMS',
        input: {
          pageType: form.pageType,
          brandSlug: form.brandSlug,
          titleTh: form.titleTh || aiBrief.value,
          titleEn: form.titleEn || form.slug,
          prompt: aiBrief.value || form.summary || form.titleTh
        }
      }
    })
    const r = res?.result || {}
    if (r.heroEyebrow) form.heroEyebrow = r.heroEyebrow
    if (r.titleTh && !form.titleTh) form.titleTh = r.titleTh
    if (r.titleEn) form.titleEn = r.titleEn
    if (r.summary) form.summary = r.summary
    if (r.summaryEn) form.summaryEn = r.summaryEn
    if (r.contentTh) form.contentTh = r.contentTh
    if (r.contentEn) form.contentEn = r.contentEn
    if (r.ctaText) form.ctaText = r.ctaText
    if (r.ctaUrl && !form.ctaUrl) form.ctaUrl = r.ctaUrl
    if (r.styleConfig && typeof r.styleConfig === 'object') {
      Object.assign(form.styleConfig, r.styleConfig)
    }
    if (r.seoTitle) form.seoTitle = r.seoTitle
    if (r.seoDescription) form.seoDescription = r.seoDescription
    if (r.seoKeywords) form.seoKeywords = r.seoKeywords
    if (r.aseoSummary) form.aseoSummary = r.aseoSummary
    if (Array.isArray(r.aseoFaqs)) form.aseoFaqs = r.aseoFaqs

    if (alsoMatchProducts && ['brand_gate', 'series_story', 'promo_story', 'custom_landing'].includes(form.pageType)) {
      await autoMatchRelatedProducts(true)
    }
    toast.success('✨ AI สร้างหัวข้อ เนื้อหา คำค้นหา โทนสีฟอนต์ และเชื่อมสินค้าเรียบร้อย!')
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'AI ไม่สามารถสร้างเนื้อหาได้')
  } finally {
    aiRunning.value = false
  }
}

async function autoMatchRelatedProducts(silent = false) {
  aiMatching.value = true
  try {
    const res = await $fetch<any>('/api/admin/pages/match-products', {
      method: 'POST',
      body: {
        brandSlug: form.brandSlug,
        seriesKey: form.seriesKey,
        titleTh: form.titleTh,
        titleEn: form.titleEn,
        seoKeywords: form.seoKeywords,
        summary: form.summary,
        limit: 8
      }
    })
    if (Array.isArray(res?.productIds) && res.productIds.length) {
      form.productIds = res.productIds
      if (!silent) toast.success(`🤖 AI คัดเลือกและเชื่อมนาฬิกาที่เกี่ยวข้อง ${res.productIds.length} รุ่นเรียบร้อย`)
    }
  } catch {
    if (!silent) toast.error('คัดเลือกสินค้าอัตโนมัติไม่สำเร็จ')
  } finally {
    aiMatching.value = false
  }
}

async function savePage() {
  if (!form.titleTh.trim()) {
    toast.error('กรุณาระบุหัวข้อหน้าภาษาไทย')
    return
  }
  saving.value = true
  try {
    const payload = {
      parentId: form.parentId,
      slug: form.slug || undefined,
      pageType: form.pageType,
      routePath: form.routePath || (form.slug ? `/pages/${form.slug}` : undefined),
      brandSlug: form.brandSlug || null,
      seriesKey: form.seriesKey || null,
      category: form.pageType,
      heroEyebrow: form.heroEyebrow,
      title: form.titleTh,
      titleTh: form.titleTh,
      titleEn: form.titleEn || form.titleTh,
      summary: form.summary,
      summaryEn: form.summaryEn,
      contentTh: form.contentTh,
      contentEn: form.contentEn,
      banner: form.bannerUrls[0] || '/images/op/hero-diver-dark.jpg',
      gallery: form.galleryUrls,
      styleConfig: { ...form.styleConfig },
      productIds: form.productIds,
      ctaText: form.ctaText,
      ctaUrl: form.ctaUrl,
      seoTitle: form.seoTitle,
      seoDescription: form.seoDescription,
      seoKeywords: form.seoKeywords,
      aseoSummary: form.aseoSummary,
      aseoFaqs: form.aseoFaqs,
      status: form.published ? 'published' : 'draft',
      sortOrder: form.sortOrder
    }

    if (selectedId.value) {
      const res = await $fetch<any>(`/api/admin/pages/${selectedId.value}`, {
        method: 'PUT',
        body: payload
      })
      toast.success('บันทึกการตั้งค่าหน้าเว็บไซต์เรียบร้อย!')
      await refresh()
      if (res?.page) selectPage(res.page)
    } else {
      const res = await $fetch<any>('/api/admin/pages', {
        method: 'POST',
        body: payload
      })
      toast.success('สร้างหน้าใหม่ในโครงสร้าง Tree Menu สำเร็จ!')
      await refresh()
      if (res?.page) selectPage(res.page)
    }
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'บันทึกไม่สำเร็จ')
  } finally {
    saving.value = false
  }
}

async function deleteCurrentPage() {
  if (!selectedId.value || !import.meta.client) return
  if (form.pageType === 'system_page') {
    toast.error('หน้าหลักของระบบไม่สามารถลบได้ (สามารถแก้ไขหัวข้อ รูป สี และเนื้อหาได้)')
    return
  }
  if (!window.confirm(`ยืนยันการลบหน้า "${form.titleTh}" ออกจาก Tree Menu?`)) return
  try {
    await $fetch(`/api/admin/pages/${selectedId.value}`, { method: 'DELETE' })
    toast.success('ลบหน้าเรียบร้อย')
    selectedId.value = null
    await refresh()
  } catch {
    toast.error('ลบไม่สำเร็จ')
  }
}

const previewLink = computed(() => {
  if (form.pageType === 'brand_gate' && form.brandSlug) return `/brands/${form.brandSlug}`
  if (form.pageType === 'system_page' && form.routePath) return form.routePath
  if (form.slug) return `/pages/${form.slug}`
  return '/'
})

const liveBannerStyle = computed(() => {
  const img = form.bannerUrls[0] || '/images/op/hero-diver-dark.jpg'
  const op = Number(form.styleConfig.overlayOpacity ?? 0.56)
  return {
    backgroundColor: form.styleConfig.bgColor || '#0e1535',
    backgroundImage: `linear-gradient(135deg, rgba(12,18,40,${op}), rgba(20,24,60,${op})), url('${img}')`,
    fontFamily: `'${form.styleConfig.fontFamily || 'Prompt'}', sans-serif`
  }
})

const stylePresets = [
  { name: 'Royal Sapphire (OP)', fontFamily: 'Prompt', headingColor: '#ffffff', textColor: '#1e2438', accentColor: '#1d2088', bgColor: '#0e1330', overlayOpacity: 0.56 },
  { name: 'Ogival Swiss Gold', fontFamily: 'IBM Plex Sans Thai', headingColor: '#fff8dc', textColor: '#261f1d', accentColor: '#c59b27', bgColor: '#231710', overlayOpacity: 0.6 },
  { name: 'Rose Campaign', fontFamily: 'Prompt', headingColor: '#ffffff', textColor: '#241c2c', accentColor: '#e11d48', bgColor: '#241023', overlayOpacity: 0.55 },
  { name: 'Minimal Horology', fontFamily: 'Noto Serif Thai', headingColor: '#f8fafc', textColor: '#0f172a', accentColor: '#0f766e', bgColor: '#0f172a', overlayOpacity: 0.62 }
]

useHead({ title: 'จัดการทุกหน้าเว็บไซต์แบบ Tree Menu + AI Studio — OPWatch ERP' })
</script>

<template>
  <div>
    <div class="erp-page-head">
      <div>
        <div class="erp-kicker">FULL-WEBSITE HIERARCHICAL TREE MENU CMS · AI POWERED</div>
        <h1 class="erp-h1">ระบบจัดการเนื้อหาทุกหน้าแบบ Tree Menu ({{ pages.length }} หน้า)</h1>
        <p class="erp-sub">
          ปรับหัวข้อ คำค้นหา รูปภาพ สีฟอนต์ เนื้อหา หน้ากั้นแบรนด์ เรื่องโปรโมชั่น Story ประจำซีรีส์ และสร้างหน้าใหม่เชื่อมสินค้าด้วย AI (ส่วนรายการสินค้าจัดการที่หน้าสินค้า)
        </p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <NuxtLink to="/office/products" class="erp-btn erp-btn--ghost">
          ⌚ ไปจัดการรายการสินค้า (405+ รุ่น) →
        </NuxtLink>
        <button type="button" class="erp-btn erp-btn--ghost" @click="startNewPage(undefined, 'series_story')">
          + สร้าง Story ซีรีส์ใหม่
        </button>
        <button type="button" class="erp-btn erp-btn--primary" @click="startNewPage(undefined, 'custom_landing')">
          + สร้างหน้าใหม่ &amp; เชื่อมสินค้า
        </button>
      </div>
    </div>

    <div class="tree-cms-layout">
      <!-- ==================== LEFT PANE: HIERARCHICAL TREE MENU ==================== -->
      <aside class="tree-pane">
        <div class="tree-pane__top">
          <strong>🌳 โครงสร้างเว็บไซต์ (Tree Menu)</strong>
          <input v-model="treeSearch" class="erp-input" style="margin-top:8px;height:36px;font-size:13px" placeholder="ค้นหาหน้าใน Tree Menu..." />
        </div>

        <div class="tree-list">
          <template v-for="root in treeRoots" :key="root.page.id">
            <!-- Level 0 Root Node -->
            <div class="tree-node-wrap">
              <div
                class="tree-row is-root"
                :class="{ active: selectedId === Number(root.page.id) && !isCreatingNew }"
                @click="selectPage(root.page)"
              >
                <button
                  v-if="root.children.length"
                  type="button"
                  class="tree-exp"
                  @click.stop="toggleExpand(Number(root.page.id))"
                >
                  {{ isExpanded(Number(root.page.id)) ? '▾' : '▸' }}
                </button>
                <span v-else class="tree-exp-spacer">•</span>

                <span class="tree-ico">{{ pageTypeMeta[root.page.pageType]?.icon || '📄' }}</span>
                <div class="tree-txt">
                  <strong>{{ root.page.title || root.page.titleTh }}</strong>
                  <small>{{ root.page.routePath || `/pages/${root.page.slug}` }}</small>
                </div>
                <button
                  type="button"
                  class="tree-add-sub"
                  title="เพิ่มหน้าย่อยภายใต้หมวดนี้"
                  @click.stop="startNewPage(root.page)"
                >
                  +ย่อย
                </button>
              </div>

              <!-- Level 1 Sub-menu Children -->
              <div v-if="root.children.length && isExpanded(Number(root.page.id))" class="tree-children">
                <div v-for="child in root.children" :key="child.page.id">
                  <div
                    class="tree-row is-child"
                    :class="{ active: selectedId === Number(child.page.id) && !isCreatingNew }"
                    @click="selectPage(child.page)"
                  >
                    <span class="tree-branch">├─</span>
                    <span class="tree-ico">{{ pageTypeMeta[child.page.pageType]?.icon || '📄' }}</span>
                    <div class="tree-txt">
                      <strong>{{ child.page.title || child.page.titleTh }}</strong>
                      <small>
                        {{ pageTypeMeta[child.page.pageType]?.label || child.page.pageType }}
                        <template v-if="Array.isArray(child.page.productIds) && child.page.productIds.length">
                          · 🔗 {{ child.page.productIds.length }} รุ่น
                        </template>
                      </small>
                    </div>
                    <button
                      type="button"
                      class="tree-add-sub"
                      title="เพิ่มหน้าย่อยระดับที่ 3"
                      @click.stop="startNewPage(child.page)"
                    >
                      +
                    </button>
                  </div>

                  <!-- Level 2 Grandchildren -->
                  <div v-if="child.children.length" class="tree-children is-l2">
                    <div
                      v-for="sub in child.children"
                      :key="sub.page.id"
                      class="tree-row is-child"
                      :class="{ active: selectedId === Number(sub.page.id) && !isCreatingNew }"
                      @click="selectPage(sub.page)"
                    >
                      <span class="tree-branch">└─</span>
                      <span class="tree-ico">{{ pageTypeMeta[sub.page.pageType]?.icon || '📄' }}</span>
                      <div class="tree-txt">
                        <strong>{{ sub.page.title || sub.page.titleTh }}</strong>
                        <small>{{ sub.page.routePath || `/pages/${sub.page.slug}` }}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Dedicated Shortcut Node for Products (`ส่วนสินค้าให้ไปจัดการหน้าสินค้า`) -->
          <NuxtLink to="/office/products" class="tree-product-shortcut">
            <span>⌚</span>
            <div>
              <strong>หมวดจัดการสินค้า (Products Studio)</strong>
              <small>จัดการนาฬิการายเรือน รูปภาพ สต็อก 5 ช่องทาง ไปที่หน้าสินค้า →</small>
            </div>
          </NuxtLink>
        </div>
      </aside>

      <!-- ==================== RIGHT PANE: FULL PAGE & AI STUDIO EDITOR ==================== -->
      <section class="editor-pane">
        <!-- AI Co-Pilot Bar -->
        <div class="ai-cms-bar">
          <div style="flex:1;min-width:240px">
            <div style="font-size:12px;font-weight:700;color:#6c5ce7;margin-bottom:4px">
              🤖 ผู้ช่วย AI ประจำหน้าเว็บ (สร้างหัวข้อ · คำค้นหา · สีฟอนต์ · เนื้อหา Story · เชื่อมสินค้าอัตโนมัติ)
            </div>
            <input
              v-model="aiBrief"
              class="erp-input"
              placeholder="พิมพ์โจทย์ให้ AI เช่น 'สร้างหน้า Story ซีรีส์นาฬิกาดำน้ำขอบเซรามิก สีน้ำเงินทอง พร้อมเลือกสินค้าที่เข้ากัน'..."
            />
          </div>
          <button
            type="button"
            class="erp-btn erp-btn--violet"
            :disabled="aiRunning"
            @click="runAiPageAssistant(true)"
          >
            {{ aiRunning ? 'AI กำลังออกแบบหน้าเว็บ...' : '✨ ให้ AI ช่วยจัดการทั้งหน้า' }}
          </button>
        </div>

        <!-- Live Header & Typography/Color Preview -->
        <div class="live-hero-preview" :style="liveBannerStyle">
          <div class="live-hero-preview__meta">
            <span class="live-pill">{{ pageTypeMeta[form.pageType]?.label || form.pageType }}</span>
            <NuxtLink :to="previewLink" target="_blank" class="live-open-link">เปิดดูหน้าเว็บจริง ↗</NuxtLink>
          </div>
          <div class="live-hero-preview__eyebrow" :style="{ color: form.styleConfig.accentColor }">
            {{ form.heroEyebrow || 'OFFICIAL HOROLOGY STORY' }}
          </div>
          <h2 :style="{ color: form.styleConfig.headingColor }">
            {{ form.titleTh || 'หัวข้อหน้าเว็บไซต์ของคุณจะแสดงผลที่นี่แบบสด (Live Preview)' }}
          </h2>
          <p>{{ form.summary || 'คำโปรยสรุปเนื้อหาประจำหน้า รองรับการปรับเปลี่ยนฟอนต์ สี และภาพพื้นหลังได้อย่างอิสระ' }}</p>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:8px">
            <span
              v-if="form.ctaText"
              class="live-cta"
              :style="{ background: form.styleConfig.accentColor }"
            >
              {{ form.ctaText }} →
            </span>
            <span style="font-size:11.5px;opacity:0.85">
              ฟอนต์: {{ form.styleConfig.fontFamily }} · สินค้าที่เชื่อมไว้: {{ form.productIds.length }} รุ่น
            </span>
          </div>
        </div>

        <!-- Editor Sub-Tabs -->
        <div class="cms-tabs">
          <button type="button" :class="{ active: editorTab === 'content' }" @click="editorTab = 'content'">
            1. หัวข้อ · รูปภาพ · เนื้อหารายละเอียด
          </button>
          <button type="button" :class="{ active: editorTab === 'style' }" @click="editorTab = 'style'">
            2. สีฟอนต์ &amp; ดีไซน์ประจำหน้า
          </button>
          <button type="button" :class="{ active: editorTab === 'products' }" @click="editorTab = 'products'">
            3. เชื่อมสินค้าที่เกี่ยวข้อง ({{ form.productIds.length }} รุ่น)
          </button>
          <button type="button" :class="{ active: editorTab === 'seo' }" @click="editorTab = 'seo'">
            4. คำค้นหา (Key) &amp; SEO / ASEO
          </button>
        </div>

        <!-- ==================== SUB-TAB 1: HEADLINE, IMAGES & RICH CONTENT ==================== -->
        <div v-show="editorTab === 'content'" class="erp-panel">
          <div class="erp-grid-3">
            <div class="erp-field">
              <label class="erp-label">ประเภทหน้าเว็บไซต์ *</label>
              <select v-model="form.pageType" class="erp-select">
                <option value="brand_gate">🏛 หน้ากั้นสำหรับแบรนด์สินค้า (Brand Gate)</option>
                <option value="series_story">⌚ Story ประจำซีรีส์นาฬิกา (Series Story)</option>
                <option value="promo_story">🎁 เรื่องโปรโมชั่น / แคมเปญ (Promo Story)</option>
                <option value="custom_landing">✨ หน้าเนื้อหาสร้างใหม่ + เชื่อมสินค้า</option>
                <option value="system_page">🌐 หน้าหลักของระบบเว็บไซต์</option>
                <option value="legal">📜 หน้านโยบาย / กฎหมาย PDPA</option>
              </select>
            </div>

            <div class="erp-field">
              <label class="erp-label">อยู่ภายใต้เมนูหลัก (Parent Tree Node)</label>
              <select v-model="form.parentId" class="erp-select">
                <option :value="null">-- เป็นเมนูระดับบนสุด (Root Menu) --</option>
                <option
                  v-for="pg in pages.filter((x) => Number(x.id) !== selectedId)"
                  :key="pg.id"
                  :value="Number(pg.id)"
                >
                  {{ pg.title || pg.titleTh }} ({{ pg.slug }})
                </option>
              </select>
            </div>

            <div class="erp-field">
              <label class="erp-label">แบรนด์ที่เกี่ยวข้อง (สำหรับหน้ากั้นแบรนด์ / ซีรีส์)</label>
              <select v-model="form.brandSlug" class="erp-select">
                <option value="">-- ทุกแบรนด์ / ไม่จำกัดแบรนด์ --</option>
                <option value="olympianus">Olym Pianus (OP)</option>
                <option value="olympia-star">Olympia Star (OPA)</option>
                <option value="ogival">Ogival (Swiss 1903)</option>
              </select>
            </div>
          </div>

          <div class="erp-grid-2" style="margin-top:12px">
            <div class="erp-field">
              <label class="erp-label">ป้ายกำกับเหนือหัวข้อ (Hero Eyebrow)</label>
              <input v-model="form.heroEyebrow" class="erp-input" placeholder="เช่น SERIES STORY · OLYM PIANUS SPORTMASTER" />
            </div>
            <div class="erp-field">
              <label class="erp-label">URL Slug (ภาษาอังกฤษ)</label>
              <input v-model="form.slug" class="erp-input" :disabled="form.pageType === 'system_page'" placeholder="เช่น series-op-ceramic-diver" />
            </div>
            <div class="erp-field">
              <label class="erp-label">หัวข้อหลักภาษาไทย (Headline TH) *</label>
              <input v-model="form.titleTh" class="erp-input" placeholder="ระบุหัวข้อหลักของหน้า" />
            </div>
            <div class="erp-field">
              <label class="erp-label">หัวข้อภาษาอังกฤษ (Headline EN)</label>
              <input v-model="form.titleEn" class="erp-input" placeholder="English Headline" />
            </div>
          </div>

          <div class="erp-field" style="margin-top:12px">
            <label class="erp-label">คำโปรยสรุปเนื้อหาบนส่วนหัว (Hero Subtitle / Summary)</label>
            <textarea v-model="form.summary" rows="2" class="erp-textarea" placeholder="สรุปใจความสำคัญของหน้ากั้นแบรนด์ เรื่องโปรโมชั่น หรือซีรีส์..." />
          </div>

          <!-- Quick Search Keywords (`คำค้นหา / key`) right on main tab too -->
          <div class="erp-field" style="margin-top:12px">
            <label class="erp-label">🔑 คำค้นหาประจำหน้า (Search Keywords / Key)</label>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px">
              <input
                v-model="keywordInput"
                class="erp-input"
                style="flex:1;min-width:220px"
                placeholder="พิมพ์คำค้นหาแล้วกด Enter เช่น OP Sportmaster, นาฬิกาดำน้ำแซฟไฟร์..."
                @keydown.enter.prevent="addKeywordChip"
              />
              <button type="button" class="erp-btn erp-btn--ghost" @click="addKeywordChip">+ เพิ่มคำค้นหา</button>
            </div>
            <div v-if="keywordChips.length" style="display:flex;gap:6px;flex-wrap:wrap">
              <span v-for="kw in keywordChips" :key="kw" class="kw-chip">
                # {{ kw }}
                <button type="button" @click="removeKeywordChip(kw)">×</button>
              </span>
            </div>
          </div>

          <!-- Image Replacement & Insertion (`การแทรกการเปลี่ยนภาพ`) -->
          <div style="margin-top:16px;padding:14px;border-radius:14px;background:#f6f7fc;border:1px solid #e9ebf6">
            <div style="font-weight:700;color:#23264d;margin-bottom:8px">🖼 ภาพแบนเนอร์ส่วนหัว (เปลี่ยนภาพ / ปรับแสงอัตโนมัติ Auto-Studio)</div>
            <OfficeImageManager v-model="form.bannerUrls" />
          </div>

          <div style="margin-top:12px;padding:14px;border-radius:14px;background:#fbfbfe;border:1px solid #e9ebf6">
            <div style="font-weight:700;color:#23264d;margin-bottom:8px">📸 แกลเลอรีภาพประกอบเรื่องราวเพิ่มเติม (Story Gallery — แทรกหลายรูปได้)</div>
            <OfficeImageManager v-model="form.galleryUrls" />
          </div>

          <!-- Rich HTML Content (`เพิ่มเนื้อหาในรายละเอียด`) -->
          <div style="margin-top:16px">
            <OfficeRichEditor v-model="form.contentTh" label="📝 เนื้อหาในรายละเอียด (ภาษาไทย — แทรกหัวข้อย่อย รายการ และรูปภาพประกอบได้)" />
          </div>
          <div style="margin-top:14px">
            <OfficeRichEditor v-model="form.contentEn" label="🌐 เนื้อหาในรายละเอียด (English Content)" />
          </div>

          <div class="erp-grid-3" style="margin-top:14px">
            <div class="erp-field">
              <label class="erp-label">ข้อความปุ่ม Call-to-Action</label>
              <input v-model="form.ctaText" class="erp-input" placeholder="เช่น เลือกชมคอลเลกชันทั้งหมด" />
            </div>
            <div class="erp-field">
              <label class="erp-label">ลิงก์ปลายทางปุ่ม CTA</label>
              <input v-model="form.ctaUrl" class="erp-input" placeholder="/products?brand=olympianus" />
            </div>
            <div class="erp-field">
              <label class="erp-label">ลำดับในเมนูย่อย (Sort Order)</label>
              <input v-model.number="form.sortOrder" type="number" class="erp-input" />
            </div>
          </div>
        </div>

        <!-- ==================== SUB-TAB 2: FONT & COLORS (`สีฟ้อนต์`) ==================== -->
        <div v-show="editorTab === 'style'" class="erp-panel">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:14px">
            <div>
              <h3 style="margin:0;font-size:16px;color:#23264d">🎨 ปรับแต่งสีและฟอนต์ประจำหน้า (Typography &amp; Color Palette)</h3>
              <p style="margin:3px 0 0;font-size:12.5px;color:#8a8fb1">เลือกชุดสีสำเร็จรูปตามอารมณ์แบรนด์ หรือเลือกสีฟอนต์และพื้นหลังเองได้ทุกจุด</p>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <button
                v-for="pr in stylePresets"
                :key="pr.name"
                type="button"
                class="erp-btn erp-btn--ghost erp-btn--sm"
                @click="Object.assign(form.styleConfig, pr)"
              >
                {{ pr.name }}
              </button>
            </div>
          </div>

          <div class="erp-grid-3">
            <div class="erp-field">
              <label class="erp-label">รูปแบบฟอนต์หลักประจำหน้า (Font Family)</label>
              <select v-model="form.styleConfig.fontFamily" class="erp-select">
                <option value="Prompt">Prompt (โมเดิร์นหรู · มาตรฐาน OPWatch)</option>
                <option value="IBM Plex Sans Thai">IBM Plex Sans Thai (สวิสคลาสสิก อ่านคมชัด)</option>
                <option value="Noto Serif Thai">Noto Serif Thai (บทความ Story ระดับ Haute Horlogerie)</option>
                <option value="Kanit">Kanit (แคมเปญโปรโมชั่นโดดเด่น)</option>
                <option value="Sarabun">Sarabun (ทางการ / นโยบายกฎหมาย)</option>
              </select>
            </div>

            <div class="erp-field">
              <label class="erp-label">ขนาดหัวข้อใหญ่ (Heading Scale)</label>
              <select v-model="form.styleConfig.headingSize" class="erp-select">
                <option value="md">ขนาดมาตรฐาน (Medium)</option>
                <option value="lg">ขนาดใหญ่ (Large)</option>
                <option value="xl">ขนาดพิเศษสำหรับหน้ากั้นแบรนด์ / ซีรีส์ (Hero XL)</option>
              </select>
            </div>

            <div class="erp-field">
              <label class="erp-label">ความเข้มเงาพื้นหลังแบนเนอร์ ({{ Math.round((form.styleConfig.overlayOpacity || 0.56) * 100) }}%)</label>
              <input v-model.number="form.styleConfig.overlayOpacity" type="range" min="0.2" max="0.9" step="0.04" style="margin-top:10px" />
            </div>
          </div>

          <div class="color-picker-grid">
            <label class="color-card">
              <span>สีฟอนต์หัวข้อ (Heading Color)</span>
              <div>
                <input v-model="form.styleConfig.headingColor" type="color" />
                <code>{{ form.styleConfig.headingColor }}</code>
              </div>
            </label>
            <label class="color-card">
              <span>สีฟอนต์เนื้อหา (Body Text Color)</span>
              <div>
                <input v-model="form.styleConfig.textColor" type="color" />
                <code>{{ form.styleConfig.textColor }}</code>
              </div>
            </label>
            <label class="color-card">
              <span>สีไฮไลต์ &amp; ปุ่ม (Accent Color)</span>
              <div>
                <input v-model="form.styleConfig.accentColor" type="color" />
                <code>{{ form.styleConfig.accentColor }}</code>
              </div>
            </label>
            <label class="color-card">
              <span>สีพื้นหลัง Hero (Hero Surface)</span>
              <div>
                <input v-model="form.styleConfig.bgColor" type="color" />
                <code>{{ form.styleConfig.bgColor }}</code>
              </div>
            </label>
          </div>
        </div>

        <!-- ==================== SUB-TAB 3: LINK RELATED PRODUCTS (`เชื่อมสินค้าที่เกี่ยวข้อง`) ==================== -->
        <div v-show="editorTab === 'products'" class="erp-panel">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px">
            <div>
              <h3 style="margin:0;font-size:16px;color:#23264d">⌚ เชื่อมสินค้าที่เกี่ยวข้องเข้ากับหน้านี้ ({{ linkedProducts.length }} รุ่น)</h3>
              <p style="margin:3px 0 0;font-size:12.5px;color:#8a8fb1">
                เลือกนาฬิกาที่เกี่ยวข้องกับหน้ากั้นแบรนด์ เรื่องโปรโมชั่น หรือ Story ประจำซีรีส์ เพื่อให้ลูกค้ากดช้อปจากท้ายเนื้อหาได้ทันที
              </p>
            </div>
            <button
              type="button"
              class="erp-btn erp-btn--violet"
              :disabled="aiMatching"
              @click="autoMatchRelatedProducts(false)"
            >
              {{ aiMatching ? 'AI กำลังจับคู่รุ่นนาฬิกา...' : '🤖 ให้ AI คัดเลือกสินค้าที่เกี่ยวข้องให้อัตโนมัติ' }}
            </button>
          </div>

          <!-- Currently Linked Watches -->
          <div v-if="linkedProducts.length" class="linked-grid">
            <div v-for="(lp, idx) in linkedProducts" :key="lp.id" class="linked-watch">
              <img :src="(lp.images && lp.images[0]) || '/images/hero-watch.jpg'" :alt="lp.sku" />
              <div class="linked-watch__info">
                <code>{{ lp.sku }}</code>
                <strong>{{ lp.nameTh || lp.name }}</strong>
                <span>฿{{ Number(lp.price || 0).toLocaleString() }}</span>
              </div>
              <div class="linked-watch__acts">
                <button type="button" title="เลื่อนขึ้น" @click="moveLinked(idx, -1)">↑</button>
                <button type="button" title="เลื่อนลง" @click="moveLinked(idx, 1)">↓</button>
                <button type="button" class="rm" title="เอาออกจากหน้านี้" @click="toggleLinkProduct(lp.id)">✕</button>
              </div>
            </div>
          </div>
          <div v-else style="padding:18px;border-radius:12px;background:#f6f7fc;color:#8a8fb1;text-align:center;margin-bottom:14px;font-size:13px">
            ยังไม่ได้เชื่อมสินค้าเข้ากับหน้านี้ — กดปุ่ม <strong>“ให้ AI คัดเลือกสินค้าให้อัตโนมัติ”</strong> หรือค้นหาและคลิกเลือกจากด้านล่างได้เลย
          </div>

          <!-- Search & Pick More Watches -->
          <div style="border-top:1px solid #e9ebf6;padding-top:14px;margin-top:14px">
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
              <input
                v-model="prodSearch"
                class="erp-input"
                style="flex:1;min-width:220px"
                placeholder="ค้นหารุ่นนาฬิกาด้วยรหัส SKU หรือชื่อรุ่นเพื่อนำมาเชื่อมกับหน้านี้..."
              />
              <select v-model="prodBrandFilter" class="erp-select" style="width:190px">
                <option value="">ทุกแบรนด์</option>
                <option value="olympianus">Olym Pianus</option>
                <option value="olympia-star">Olympia Star</option>
                <option value="ogival">Ogival</option>
              </select>
            </div>

            <div class="candidate-grid">
              <button
                v-for="cp in candidateProducts"
                :key="cp.id"
                type="button"
                class="cand-card"
                @click="toggleLinkProduct(cp.id)"
              >
                <img :src="(cp.images && cp.images[0]) || '/images/hero-watch.jpg'" :alt="cp.sku" />
                <div>
                  <code>{{ cp.sku }}</code>
                  <strong>{{ cp.nameTh || cp.name }}</strong>
                  <span>+ เชื่อมเข้าหน้านี้ · ฿{{ Number(cp.price || 0).toLocaleString() }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- ==================== SUB-TAB 4: SEARCH KEYS, SEO & ASEO ==================== -->
        <div v-show="editorTab === 'seo'">
          <OfficeSeoAseoPanel
            v-model:seo-title="form.seoTitle"
            v-model:seo-description="form.seoDescription"
            v-model:seo-keywords="form.seoKeywords"
            v-model:aseo-summary="form.aseoSummary"
            v-model:aseo-faqs="form.aseoFaqs"
            :ai-running="aiRunning"
            @ai-generate="runAiPageAssistant(false)"
          />
        </div>

        <!-- Sticky Action Footer -->
        <div class="cms-save-bar">
          <label style="display:inline-flex;align-items:center;gap:8px;font-size:13.5px;font-weight:600;color:#23264d;cursor:pointer">
            <input v-model="form.published" type="checkbox" />
            <span>เปิดเผยแพร่หน้านี้บนเว็บไซต์ทันที (Published)</span>
          </label>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button
              v-if="selectedId && form.pageType !== 'system_page'"
              type="button"
              class="erp-btn erp-btn--danger"
              @click="deleteCurrentPage"
            >
              ลบหน้านี้
            </button>
            <NuxtLink :to="previewLink" target="_blank" class="erp-btn erp-btn--ghost">
              ดูหน้าเว็บจริง ↗
            </NuxtLink>
            <button type="button" class="erp-btn erp-btn--primary" :disabled="saving" @click="savePage">
              {{ saving ? 'กำลังบันทึก...' : '💾 บันทึกการตั้งค่าหน้านี้' }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.tree-cms-layout {
  display: grid;
  grid-template-columns: 350px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}
@media (max-width: 1080px) {
  .tree-cms-layout {
    grid-template-columns: 1fr;
  }
}
.tree-pane {
  background: #ffffff;
  border: 1px solid #e9ebf6;
  border-radius: 18px;
  padding: 14px;
  position: sticky;
  top: 78px;
  max-height: calc(100vh - 96px);
  overflow-y: auto;
}
.tree-pane__top strong {
  font-size: 14px;
  color: #23264d;
}
.tree-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tree-row {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 10px;
  border-radius: 11px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.14s, border-color 0.14s;
}
.tree-row:hover {
  background: #f6f7fc;
}
.tree-row.active {
  background: #efedfd;
  border-color: #c5bdf9;
}
.tree-row.is-root {
  background: #fbfbfe;
  border-color: #eef0f8;
}
.tree-row.is-root.active {
  background: #efedfd;
  border-color: #8e7cf3;
}
.tree-exp {
  width: 20px;
  height: 20px;
  border: 0;
  border-radius: 6px;
  background: #eef0f8;
  color: #454a75;
  cursor: pointer;
  font-size: 11px;
  padding: 0;
}
.tree-exp-spacer {
  width: 20px;
  text-align: center;
  color: #8a8fb1;
}
.tree-children {
  margin-left: 14px;
  padding-left: 8px;
  border-left: 1.5px dashed #dfe2f2;
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.tree-children.is-l2 {
  margin-left: 18px;
}
.tree-branch {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #a0a6c4;
}
.tree-ico {
  font-size: 15px;
}
.tree-txt {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.tree-txt strong {
  font-size: 12.5px;
  color: #23264d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tree-txt small {
  font-size: 10.5px;
  color: #8a8fb1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tree-add-sub {
  padding: 2px 7px;
  border-radius: 7px;
  border: 1px solid #dfe2f2;
  background: #ffffff;
  color: #6c5ce7;
  font-size: 10.5px;
  font-weight: 700;
  cursor: pointer;
  opacity: 0.78;
}
.tree-add-sub:hover {
  opacity: 1;
  border-color: #6c5ce7;
}
.tree-product-shortcut {
  margin-top: 10px;
  padding: 11px 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f3f0ff, #e9f3ff);
  border: 1px dashed #8e7cf3;
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.tree-product-shortcut strong {
  display: block;
  font-size: 12.5px;
  color: #23264d;
}
.tree-product-shortcut small {
  font-size: 11px;
  color: #6c5ce7;
}

.editor-pane {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.ai-cms-bar {
  background: linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%);
  border: 1px solid #dcd6fc;
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}
.live-hero-preview {
  border-radius: 18px;
  padding: 24px 26px;
  background-size: cover;
  background-position: center;
  color: #ffffff;
  box-shadow: 0 14px 32px rgba(20, 24, 60, 0.14);
}
.live-hero-preview__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.live-pill {
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 11px;
  font-weight: 700;
}
.live-open-link {
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  text-decoration: underline;
}
.live-hero-preview__eyebrow {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}
.live-hero-preview h2 {
  margin: 0 0 6px;
  font-size: 22px;
}
.live-hero-preview p {
  margin: 0;
  font-size: 13.5px;
  opacity: 0.9;
  max-width: 780px;
}
.live-cta {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
}
.cms-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.cms-tabs button {
  padding: 9px 15px;
  border-radius: 11px;
  border: 1px solid #dfe2f2;
  background: #ffffff;
  color: #454a75;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.cms-tabs button.active {
  background: #6c5ce7;
  color: #ffffff;
  border-color: #6c5ce7;
}
.kw-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #efedfd;
  color: #6c5ce7;
  font-size: 12px;
  font-weight: 600;
}
.kw-chip button {
  border: 0;
  background: transparent;
  color: #6c5ce7;
  cursor: pointer;
  font-weight: 700;
  padding: 0;
}
.color-picker-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 12px;
}
.color-card {
  background: #f6f7fc;
  border: 1px solid #e9ebf6;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
}
.color-card span {
  font-size: 12.5px;
  font-weight: 600;
  color: #454a75;
}
.color-card div {
  display: flex;
  align-items: center;
  gap: 10px;
}
.color-card input[type='color'] {
  width: 38px;
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
}
.linked-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
}
.linked-watch {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  background: #f8f7ff;
  border: 1px solid #d8d2fb;
}
.linked-watch img {
  width: 48px;
  height: 48px;
  object-fit: contain;
  background: #ffffff;
  border-radius: 8px;
}
.linked-watch__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.linked-watch__info code {
  font-size: 11px;
  color: #6c5ce7;
}
.linked-watch__info strong {
  font-size: 12.5px;
  color: #23264d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.linked-watch__info span {
  font-size: 12px;
  color: #0e9f6e;
  font-weight: 700;
}
.linked-watch__acts {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.linked-watch__acts button {
  width: 24px;
  height: 22px;
  border-radius: 6px;
  border: 1px solid #dfe2f2;
  background: #ffffff;
  font-size: 11px;
  cursor: pointer;
}
.linked-watch__acts button.rm {
  color: #e11d48;
}
.candidate-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 8px;
  max-height: 340px;
  overflow-y: auto;
}
.cand-card {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: 11px;
  border: 1px solid #e9ebf6;
  background: #ffffff;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
}
.cand-card:hover {
  border-color: #6c5ce7;
  background: #fbfaff;
}
.cand-card img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}
.cand-card div {
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.cand-card code {
  font-size: 10.5px;
  color: #8a8fb1;
}
.cand-card strong {
  font-size: 12px;
  color: #23264d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cand-card span {
  font-size: 11px;
  color: #6c5ce7;
  font-weight: 600;
}
.cms-save-bar {
  background: #ffffff;
  border: 1px solid #e9ebf6;
  border-radius: 16px;
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
