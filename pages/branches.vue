<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
const reqFetch = useRequestFetch()

const selectedProvince = ref('all')
const { data } = await useAsyncData('op-branches-page', () => reqFetch<any>('/api/branches'))

const items = computed(() => data.value?.items || [])
const provinces = computed(() => {
  const set = new Set<string>()
  for (const b of items.value) if (b.province) set.add(b.province)
  return Array.from(set)
})
const filtered = computed(() =>
  selectedProvince.value === 'all'
    ? items.value
    : items.value.filter((b: any) => b.province === selectedProvince.value)
)

useHead(() => ({
  title: locale.value === 'th' ? 'เลือกสินค้าใกล้บ้าน & สาขาทั่วประเทศไทย — OPWatch' : 'Thailand Branches & Click & Collect — OPWatch'
}))
</script>

<template>
  <div class="op-branches">
    <section class="op-branches__hero">
      <div class="container">
        <span class="eyebrow" style="color:#a5b4fc">THAILAND BOUTIQUE NETWORK</span>
        <h1>{{ locale === 'th' ? 'เลือกสินค้าใกล้บ้าน & สาขาทั่วประเทศไทย' : 'Nearby Branches & Service Center (Thailand)' }}</h1>
        <p>
          {{
            locale === 'th'
              ? 'เช็คจุดจำหน่ายและเคาน์เตอร์นาฬิกาของแท้ภายใต้การดูแลของ บริษัท อินเตอร์ไทมส์ จำกัด พร้อมบริการเลือกรับสินค้าที่สาขา (Click & Collect) และปรับขนาดสายนาฬิกาฟรี'
              : 'Visit our Bangkok Head Office Service Center or partner department store counters across Thailand.'
          }}
        </p>

        <div class="op-branches__filters">
          <button type="button" :class="{ 'is-active': selectedProvince === 'all' }" @click="selectedProvince = 'all'">
            {{ locale === 'th' ? 'ทุกจังหวัดในไทย' : 'All Thailand' }}
          </button>
          <button
            v-for="pv in provinces"
            :key="pv"
            type="button"
            :class="{ 'is-active': selectedProvince === pv }"
            @click="selectedProvince = pv"
          >
            {{ pv }}
          </button>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container grid-2">
        <div v-for="b in filtered" :key="b.slug" class="card stack gap-12">
          <div class="between wrap gap-8">
            <span class="badge badge--accent">{{ b.province }} · {{ b.district }}</span>
            <span v-if="b.hasPickup" class="badge" style="background:#ecfdf5;color:#065f46;border-color:#6ee7b7">
              ✓ รับสินค้าที่สาขาได้ (Click &amp; Collect)
            </span>
          </div>
          <h2 style="font-size:20px;font-weight:700">{{ locale === 'en' && b.nameEn ? b.nameEn : b.nameTh }}</h2>
          <p class="muted">{{ locale === 'en' && b.addressEn ? b.addressEn : b.addressTh }}</p>
          <div style="font-size:13.5px;display:grid;gap:4px">
            <div><strong>เวลาทำการ:</strong> {{ b.hours }}</div>
            <div><strong>โทรศัพท์:</strong> <a :href="`tel:${String(b.phone || '').replace(/\s+/g, '')}`">{{ b.phone }}</a></div>
            <div v-if="b.stockNote" style="color:var(--sapphire)"><strong>บริการประจำสาขา:</strong> {{ b.stockNote }}</div>
          </div>
          <div class="cluster gap-8" style="margin-top:6px">
            <a v-if="b.mapUrl" :href="b.mapUrl" target="_blank" rel="noopener noreferrer" class="btn btn--sm btn--ghost">
              🗺 เปิดแผนที่ Google Maps
            </a>
            <NuxtLink :to="localePath('/products')" class="btn btn--sm">
              เลือกสินค้าแล้วรับที่สาขานี้ →
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.op-branches__hero {
  background: linear-gradient(135deg, #101444 0%, #1d2088 100%);
  color: #ffffff;
  padding: 120px 0 46px;
}
.op-branches__hero h1 { font-family: var(--font-display); font-size: clamp(2rem, 3.2vw, 2.7rem); margin-top: 8px; }
.op-branches__hero p { max-width: 740px; opacity: 0.9; margin-top: 8px; line-height: 1.7; }
.op-branches__filters { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px; }
.op-branches__filters button {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.op-branches__filters button.is-active { background: #ffffff; color: var(--sapphire); }
</style>
