<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })

const localePath = useLocalePath()
const { site } = useSite()
const toast = useToast()

const search = ref('')
const brandFilter = ref('')
const page = ref(1)

const { data, refresh, pending } = await useFetch<any>('/api/admin/products', {
  query: computed(() => ({
    q: search.value || undefined,
    brand: brandFilter.value || undefined,
    page: page.value,
    limit: 25
  }))
})

const items = computed(() => data.value?.items || data.value?.products || [])
const total = computed(() => Number(data.value?.total || items.value.length))

// Quick Shopee 1-Click Create Modal
const quickShopeeOpen = ref(false)
const quickShopeeUrl = ref('')
const quickShopeeSaving = ref(false)

async function quickImportAndCreate() {
  if (!quickShopeeUrl.value.trim()) return
  quickShopeeSaving.value = true
  try {
    const res = await $fetch<any>('/api/admin/products/shopee-import', {
      method: 'POST',
      body: { url: quickShopeeUrl.value.trim(), saveImmediately: true }
    })
    toast.success('ดึงและบันทึกสินค้าจาก Shopee สำเร็จ!')
    quickShopeeOpen.value = false
    quickShopeeUrl.value = ''
    await refresh()
    if (res.product?.id) {
      await navigateTo(localePath(`/office/products/${res.product.id}`))
    }
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'กรุณาเปิดหน้าเพิ่มสินค้าเพื่อวางข้อมูลเสริมจาก Shopee')
    await navigateTo(localePath('/office/products/new'))
  } finally {
    quickShopeeSaving.value = false
  }
}

async function removeProduct(p: any) {
  if (!import.meta.client || !window.confirm(`ยืนยันการลบสินค้า "${p.nameTh || p.sku}"?`)) return
  try {
    await $fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' })
    toast.success('ลบสินค้าเรียบร้อย')
    await refresh()
  } catch {
    toast.error('ลบสินค้าไม่สำเร็จ')
  }
}

const fmt = (v: number) => formatPrice(Number(v || 0), site.value.currencySymbol || '฿', 'th-TH')

useHead({ title: 'จัดการสินค้า 405+ รุ่น & ดึง Shopee — OPWatch Office' })
</script>

<template>
  <div>
    <div class="erp-page-head">
      <div>
        <div class="erp-kicker">MODULE 7.2 · CATALOGUE &amp; SHOPEE SYNC</div>
        <h1 class="erp-h1">ระบบจัดการสินค้า (ทั้งหมด {{ total }} รุ่น)</h1>
        <p class="erp-sub">
          ดึงสินค้าจาก Shopee, จัดเรียงรูปภาพแบบลากวาง, แก้ไขเนื้อหาด้วย CKEditor ฟรี พร้อม SEO + ASEO และ AI Automation
        </p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button type="button" class="erp-btn erp-btn--violet" @click="quickShopeeOpen = !quickShopeeOpen">
          🛍 ดึงสินค้าด่วนจากลิงก์ Shopee
        </button>
        <NuxtLink :to="localePath('/office/products/new')" class="erp-btn erp-btn--primary">
          + เพิ่มสินค้าใหม่
        </NuxtLink>
      </div>
    </div>

    <!-- Quick Shopee Bar -->
    <div v-if="quickShopeeOpen" class="erp-panel" style="border-color:#f97316">
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <strong style="color:#fdba74">🛍 Quick Shopee Import:</strong>
        <input
          v-model="quickShopeeUrl"
          class="erp-input"
          style="flex:1;min-width:260px"
          placeholder="วางลิงก์สินค้า Shopee เช่น https://shopee.co.th/...-i.12345.67890"
        />
        <button type="button" class="erp-btn erp-btn--primary" :disabled="quickShopeeSaving" @click="quickImportAndCreate">
          {{ quickShopeeSaving ? 'กำลังดึงข้อมูล...' : 'ดึงและเปิดหน้าแก้ไขทันที →' }}
        </button>
      </div>
    </div>

    <!-- Search & Brand Filter -->
    <div class="erp-panel">
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px">
        <input
          v-model="search"
          class="erp-input"
          style="flex:1;min-width:240px"
          placeholder="ค้นหาชื่อรุ่น รหัส SKU หรือคำสำคัญ..."
        />
        <select v-model="brandFilter" class="erp-select" style="width:210px">
          <option value="">ทุกแบรนด์ (Olym Pianus / Olympia Star / Ogival)</option>
          <option value="olympianus">Olym Pianus</option>
          <option value="olympia-star">Olympia Star</option>
          <option value="ogival">Ogival</option>
        </select>
        <button type="button" class="erp-btn" @click="page = 1; refresh()">ค้นหา</button>
      </div>

      <div class="erp-table-wrap">
        <table class="erp-table">
          <thead>
            <tr>
              <th>รูป</th>
              <th>รหัส SKU / ชื่อรุ่น</th>
              <th>แบรนด์</th>
              <th>ราคาขาย</th>
              <th>สต็อก</th>
              <th>SEO/ASEO</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in items" :key="p.id">
              <td>
                <img
                  :src="(p.images && p.images[0]) || p.image || '/images/op/watch-990-083-blue.png'"
                  alt=""
                  style="width:46px;height:46px;object-fit:contain;background:#fff;border-radius:7px;padding:3px"
                  referrerpolicy="no-referrer"
                  @error="(e: any) => { if (e?.target) e.target.src = '/images/op/watch-990-083-blue.png' }"
                />
              </td>
              <td>
                <div style="font-family:monospace;font-size:11.5px;color:#67e8f9">{{ p.sku }}</div>
                <div style="font-weight:600">{{ p.nameTh || p.nameEn }}</div>
              </td>
              <td><span class="erp-chip">{{ p.brandSlug }}</span></td>
              <td>
                <strong>{{ fmt(p.price) }}</strong>
                <div v-if="p.originalPrice > p.price" style="font-size:11px;color:#94a3b8;text-decoration:line-through">
                  {{ fmt(p.originalPrice) }}
                </div>
              </td>
              <td>
                <span :style="{ color: Number(p.stock) <= 3 ? '#fda4af' : '#6ee7b7', fontWeight: 700 }">
                  {{ p.stock }}
                </span>
              </td>
              <td>
                <span class="erp-chip" :class="p.seoTitle || p.aseoSummary ? 'erp-chip--violet' : ''">
                  {{ p.seoTitle || p.aseoSummary ? '✓ SEO/ASEO' : 'Auto' }}
                </span>
              </td>
              <td>
                <span class="erp-chip" :class="p.active !== false ? 'erp-chip--mint' : 'erp-chip--rose'">
                  {{ p.active !== false ? 'เปิดขาย' : 'ซ่อน' }}
                </span>
              </td>
              <td>
                <div style="display:flex;gap:6px">
                  <NuxtLink :to="localePath(`/office/products/${p.id}`)" class="erp-btn erp-btn--sm">แก้ไข / AI</NuxtLink>
                  <NuxtLink :to="localePath(`/products/${p.slug}`)" target="_blank" class="erp-btn erp-btn--sm">ดูหน้าเว็บ</NuxtLink>
                  <button type="button" class="erp-btn erp-btn--sm erp-btn--danger" @click="removeProduct(p)">ลบ</button>
                </div>
              </td>
            </tr>
            <tr v-if="!pending && !items.length">
              <td colspan="8" style="text-align:center;padding:28px;color:#64748b">ไม่พบรายการสินค้าตามเงื่อนไข</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px">
        <span style="font-size:12.5px;color:#94a3b8">หน้า {{ page }} · ทั้งหมด {{ total }} รายการ</span>
        <div style="display:flex;gap:6px">
          <button type="button" class="erp-btn erp-btn--sm" :disabled="page <= 1" @click="page--">◀ ก่อนหน้า</button>
          <button type="button" class="erp-btn erp-btn--sm" :disabled="page * 25 >= total" @click="page++">ถัดไป ▶</button>
        </div>
      </div>
    </div>
  </div>
</template>
