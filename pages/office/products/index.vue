<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })

const localePath = useLocalePath()
const officeAuth = useOfficeAuth()
const { site } = useSite()
const toast = useToast()

const isDealer = computed(() => officeAuth.role.value === 'dealer')
const canEditProduct = computed(() => officeAuth.hasPermission('products_edit'))

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
        <div class="erp-kicker">{{ isDealer ? 'AUTHORIZED DEALER WHOLESALE CATALOG' : 'MODULE 7.2 · CATALOGUE & 5-CHANNEL STOCK' }}</div>
        <h1 class="erp-h1">{{ isDealer ? `แคตตาล็อกราคาเฉพาะตัวแทนจำหน่าย (${total} รุ่น)` : `ระบบจัดการสินค้า (ทั้งหมด ${total} รุ่น)` }}</h1>
        <p class="erp-sub">
          <template v-if="isDealer">
            แสดงราคาส่งเฉพาะตัวแทนจำหน่าย เทียบราคาขายปลีก พร้อมสถานะคลังสินค้าหน้าร้านของตัวแทนเอง
          </template>
          <template v-else>
            ดึงสินค้าจาก Shopee, จัดการราคาขายปลีก, สต็อก 5 ช่องทาง, ปรับภาพสตูดิโออัตโนมัติ และ AI SEO + ASEO
          </template>
        </p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <NuxtLink to="/office/warehouse" class="erp-btn erp-btn--ghost">
          📦 {{ isDealer ? 'คลังสินค้าตัวแทนเอง' : 'คลังสินค้า 5 ช่องทาง' }} →
        </NuxtLink>
        <button v-if="canEditProduct" type="button" class="erp-btn erp-btn--violet" @click="quickShopeeOpen = !quickShopeeOpen">
          🛍 ดึงสินค้าด่วนจากลิงก์ Shopee
        </button>
        <NuxtLink v-if="canEditProduct" :to="localePath('/office/products/new')" class="erp-btn erp-btn--primary">
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
              <th>{{ isDealer ? 'ราคาเฉพาะตัวแทน' : 'ราคาขาย' }}</th>
              <th>{{ isDealer ? 'คลังร้านตัวเอง' : 'สต็อก 5 ช่องทาง' }}</th>
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
                <div style="font-family:monospace;font-size:11.5px;color:#6c5ce7">{{ p.sku }}</div>
                <div style="font-weight:600">{{ p.nameTh || p.nameEn }}</div>
              </td>
              <td><span class="erp-chip">{{ p.brandSlug }}</span></td>
              <td>
                <template v-if="isDealer">
                  <strong style="color:#6c5ce7">{{ fmt(p.effectiveDealerPrice || p.dealerPrice) }}</strong>
                  <div style="font-size:11px;color:#94a3b8">ป้าย: {{ fmt(p.price) }}</div>
                </template>
                <template v-else>
                  <strong>{{ fmt(p.price) }}</strong>
                  <div v-if="p.originalPrice > p.price" style="font-size:11px;color:#94a3b8;text-decoration:line-through">
                    {{ fmt(p.originalPrice) }}
                  </div>
                  <div v-if="p.dealerPrice" style="font-size:11px;color:#6c5ce7">
                    ตัวแทน: {{ fmt(p.dealerPrice) }}
                  </div>
                </template>
              </td>
              <td>
                <template v-if="isDealer">
                  <span style="font-weight:700;color:#0e9f6e">{{ p.dealerOwnStock || 0 }} เรือน</span>
                </template>
                <template v-else>
                  <span :style="{ color: Number(p.stock) <= 3 ? '#e11d48' : '#0e9f6e', fontWeight: 700 }">
                    รวม {{ p.stock }}
                  </span>
                  <div style="font-size:10.5px;color:#8a8fb1">
                    W:{{ p.stockWeb ?? '-' }} · S:{{ p.stockShopee ?? '-' }} · L:{{ p.stockLazada ?? '-' }} · T:{{ p.stockTiktok ?? '-' }} · D:{{ p.stockDealer ?? '-' }}
                  </div>
                </template>
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
                  <NuxtLink v-if="canEditProduct" :to="localePath(`/office/products/${p.id}`)" class="erp-btn erp-btn--sm">แก้ไข / AI</NuxtLink>
                  <NuxtLink v-else to="/office/warehouse" class="erp-btn erp-btn--sm">สต็อก</NuxtLink>
                  <NuxtLink :to="localePath(`/products/${p.slug}`)" target="_blank" class="erp-btn erp-btn--sm">ดูหน้าเว็บ</NuxtLink>
                  <button v-if="canEditProduct" type="button" class="erp-btn erp-btn--sm erp-btn--danger" @click="removeProduct(p)">ลบ</button>
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
