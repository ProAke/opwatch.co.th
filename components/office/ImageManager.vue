<script setup lang="ts">
import {
  autoEnhanceFile,
  autoEnhanceExistingUrl,
  renderEnhancedDataUrl,
  DEFAULT_ENHANCE_OPTIONS,
  type EnhanceOptions
} from '~/utils/autoImageEnhance'

const props = withDefaults(
  defineProps<{
    modelValue: string[]
    defaultPreset?: 'watch-square' | 'banner-wide' | 'keep-ratio'
  }>(),
  {
    defaultPreset: 'watch-square'
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: string[]): void
}>()

const toast = useToast()
const uploading = ref(false)
const enhancingIdx = ref<number | null>(null)
const batchEnhancing = ref(false)
const draggingZone = ref(false)
const dragIdx = ref<number | null>(null)
const urlInput = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

// Auto-enhance on upload ON by default!
const autoEnhanceOnUpload = ref(true)
const enhancePreset = ref<'watch-square' | 'banner-wide' | 'keep-ratio'>(props.defaultPreset)

// Interactive Studio Modal
const studioOpen = ref(false)
const studioTargetIdx = ref<number | null>(null)
const studioSourceUrl = ref('')
const studioPreviewUrl = ref('')
const studioBusy = ref(false)
const studioOpts = reactive<Required<EnhanceOptions>>({
  ...DEFAULT_ENHANCE_OPTIONS,
  preset: props.defaultPreset
})

const list = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []))

function updateList(next: string[]) {
  emit('update:modelValue', next)
}

async function uploadSingleFile(file: File): Promise<string | null> {
  const fd = new FormData()
  fd.append('files', file, file.name)
  const res = await $fetch<{ ok: boolean; urls: string[] }>('/api/admin/upload', {
    method: 'POST',
    body: fd
  })
  return res.urls?.[0] || null
}

async function handleFiles(files: FileList | File[]) {
  const arr = Array.from(files).filter((f) => f.type.startsWith('image/'))
  if (!arr.length) return
  uploading.value = true
  try {
    const fd = new FormData()
    for (const rawFile of arr) {
      let toSend = rawFile
      if (autoEnhanceOnUpload.value && import.meta.client) {
        try {
          toSend = await autoEnhanceFile(rawFile, { preset: enhancePreset.value })
        } catch {
          toSend = rawFile
        }
      }
      fd.append('files', toSend, toSend.name)
    }
    const res = await $fetch<{ ok: boolean; urls: string[] }>('/api/admin/upload', {
      method: 'POST',
      body: fd
    })
    if (res.urls?.length) {
      const cleaned = list.value.filter((u) => u && u !== '/images/op/watch-990-083-blue.png')
      updateList([...cleaned, ...res.urls])
      toast.success(
        autoEnhanceOnUpload.value
          ? `อัปโหลดและปรับภาพสตูดิโออัตโนมัติสำเร็จ ${res.urls.length} รูป`
          : `อัปโหลดรูปภาพสำเร็จ ${res.urls.length} รูป`
      )
    }
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || 'อัปโหลดรูปภาพไม่สำเร็จ')
  } finally {
    uploading.value = false
    draggingZone.value = false
  }
}

async function quickAutoEnhanceAt(idx: number) {
  if (!import.meta.client) return
  const targetUrl = list.value[idx]
  if (!targetUrl) return
  enhancingIdx.value = idx
  try {
    const enhancedFile = await autoEnhanceExistingUrl(targetUrl, { preset: enhancePreset.value })
    const newUrl = await uploadSingleFile(enhancedFile)
    if (newUrl) {
      const next = list.value.slice()
      next[idx] = newUrl
      updateList(next)
      toast.success('✨ ปรับแสง พื้นขาวคลีน และความคมชัดอัตโนมัติเรียบร้อยแล้ว')
    }
  } catch (err: any) {
    toast.error(err?.message || 'ไม่สามารถปรับภาพอัตโนมัติได้')
  } finally {
    enhancingIdx.value = null
  }
}

async function batchAutoEnhanceAll() {
  if (!import.meta.client || !list.value.length) return
  batchEnhancing.value = true
  try {
    const next = list.value.slice()
    let count = 0
    for (let i = 0; i < next.length; i++) {
      enhancingIdx.value = i
      const enhancedFile = await autoEnhanceExistingUrl(next[i], { preset: enhancePreset.value })
      const newUrl = await uploadSingleFile(enhancedFile)
      if (newUrl) {
        next[i] = newUrl
        count++
      }
    }
    updateList(next)
    toast.success(`✨ ปรับภาพสตูดิโออัตโนมัติครบทั้ง ${count} รูปเรียบร้อยแล้ว`)
  } catch {
    toast.error('ปรับภาพแบบกลุ่มไม่สำเร็จบางรายการ')
  } finally {
    enhancingIdx.value = null
    batchEnhancing.value = false
  }
}

async function openStudioModal(idx: number) {
  if (!import.meta.client) return
  studioTargetIdx.value = idx
  studioSourceUrl.value = list.value[idx]
  Object.assign(studioOpts, DEFAULT_ENHANCE_OPTIONS, { preset: enhancePreset.value })
  studioOpen.value = true
  await refreshStudioPreview()
}

async function refreshStudioPreview() {
  if (!import.meta.client || !studioSourceUrl.value) return
  studioBusy.value = true
  try {
    const { dataUrl } = await renderEnhancedDataUrl(studioSourceUrl.value, studioOpts)
    studioPreviewUrl.value = dataUrl
  } catch {
    studioPreviewUrl.value = studioSourceUrl.value
  } finally {
    studioBusy.value = false
  }
}

async function applyStudioResult() {
  if (studioTargetIdx.value === null || !studioSourceUrl.value) return
  studioBusy.value = true
  try {
    const file = await autoEnhanceExistingUrl(studioSourceUrl.value, studioOpts)
    const uploaded = await uploadSingleFile(file)
    if (uploaded) {
      const next = list.value.slice()
      next[studioTargetIdx.value] = uploaded
      updateList(next)
      toast.success('บันทึกภาพที่ปรับแต่งสตูดิโอเรียบร้อยแล้ว')
      studioOpen.value = false
    }
  } catch {
    toast.error('บันทึกภาพที่ปรับแต่งไม่สำเร็จ')
  } finally {
    studioBusy.value = false
  }
}

function onDropFiles(e: DragEvent) {
  draggingZone.value = false
  if (e.dataTransfer?.files?.length) {
    handleFiles(e.dataTransfer.files)
  }
}

function addByUrl() {
  const u = urlInput.value.trim()
  if (!u) return
  updateList([...list.value, u])
  urlInput.value = ''
}

function removeAt(idx: number) {
  const next = list.value.slice()
  next.splice(idx, 1)
  updateList(next.length ? next : ['/images/op/watch-990-083-blue.png'])
}

function setPrimary(idx: number) {
  if (idx <= 0) return
  const next = list.value.slice()
  const [picked] = next.splice(idx, 1)
  next.unshift(picked)
  updateList(next)
}

function moveBy(idx: number, dir: number) {
  const target = idx + dir
  if (target < 0 || target >= list.value.length) return
  const next = list.value.slice()
  const tmp = next[idx]
  next[idx] = next[target]
  next[target] = tmp
  updateList(next)
}

function onCardDragStart(idx: number) {
  dragIdx.value = idx
}

function onCardDrop(targetIdx: number) {
  if (dragIdx.value === null || dragIdx.value === targetIdx) {
    dragIdx.value = null
    return
  }
  const next = list.value.slice()
  const [moved] = next.splice(dragIdx.value, 1)
  next.splice(targetIdx, 0, moved)
  dragIdx.value = null
  updateList(next)
}
</script>

<template>
  <div class="op-imgmgr">
    <!-- Auto Image Enhancement Studio Bar -->
    <div class="op-imgmgr__studio-bar">
      <div class="op-imgmgr__studio-left">
        <button
          type="button"
          class="switch"
          :class="{ on: autoEnhanceOnUpload }"
          @click="autoEnhanceOnUpload = !autoEnhanceOnUpload"
        />
        <div>
          <div class="op-imgmgr__studio-title">
            ✨ ปรับภาพอัตโนมัติ (AI Studio Auto-Enhance)
            <span class="badge" :class="autoEnhanceOnUpload ? 'b-purple' : 'b-grey'">
              {{ autoEnhanceOnUpload ? 'ทำงานอัตโนมัติเมื่ออัปโหลด' : 'ปิดโหมดอัตโนมัติ' }}
            </span>
          </div>
          <div class="op-imgmgr__studio-sub">
            จัดกึ่งกลางเรือนเวลา · ล้างพื้นหลังขาวคลีน (#FFFFFF) · ปรับแสง คอนทราสต์ และความคมชัดกระจกแซฟไฟร์อัตโนมัติ
          </div>
        </div>
      </div>

      <div class="op-imgmgr__studio-actions">
        <select v-model="enhancePreset" class="erp-select" style="width: auto; min-width: 195px">
          <option value="watch-square">⌚ สตูดิโอนาฬิกา 1:1 (1200×1200)</option>
          <option value="banner-wide">🖼 แบนเนอร์ 16:9 (1600×900)</option>
          <option value="keep-ratio">📐 คงสัดส่วนเดิม + เพิ่มคมชัด</option>
        </select>
        <button
          v-if="list.length"
          type="button"
          class="erp-btn erp-btn--primary erp-btn--sm"
          :disabled="batchEnhancing || uploading"
          @click="batchAutoEnhanceAll"
        >
          {{ batchEnhancing ? 'กำลังปรับภาพ...' : `✨ ปรับอัตโนมัติทั้ง ${list.length} รูป` }}
        </button>
      </div>
    </div>

    <!-- Dropzone -->
    <div
      class="op-imgmgr__drop"
      :class="{ 'is-over': draggingZone }"
      @dragover.prevent="draggingZone = true"
      @dragleave.prevent="draggingZone = false"
      @drop.prevent="onDropFiles"
      @click="fileInput?.click()"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        style="display: none"
        @change="(e: any) => e.target?.files && handleFiles(e.target.files)"
      />
      <div class="op-imgmgr__drop-icon">📸</div>
      <div class="op-imgmgr__drop-title">
        {{
          uploading
            ? 'กำลังอัปโหลดและปรับแสงสตูดิโออัตโนมัติ...'
            : 'ลากไฟล์รูปนาฬิกามาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์จากเครื่อง (เลือกได้หลายรูป)'
        }}
      </div>
      <div class="op-imgmgr__drop-sub">
        รองรับ JPG, PNG, WEBP, GIF (สูงสุด 8MB/ไฟล์) · ลากการ์ดด้านล่างเพื่อเรียงลำดับ · รูปที่ 1 คือรูปปกสินค้า
      </div>
    </div>

    <!-- Add External URL -->
    <div class="op-imgmgr__urlrow">
      <input
        v-model="urlInput"
        class="erp-input"
        placeholder="หรือวาง URL รูปภาพภายนอก / รูปจากคลัง เช่น https://... หรือ /uploads/..."
        @keydown.enter.prevent="addByUrl"
      />
      <button type="button" class="erp-btn erp-btn--ghost" @click="addByUrl">+ เพิ่มลิงก์รูป</button>
    </div>

    <!-- Sortable Gallery Grid -->
    <div v-if="list.length" class="op-imgmgr__grid">
      <div
        v-for="(src, idx) in list"
        :key="`${src}-${idx}`"
        class="op-imgmgr__card"
        :class="{ 'is-cover': idx === 0 }"
        draggable="true"
        @dragstart="onCardDragStart(idx)"
        @dragover.prevent
        @drop.prevent="onCardDrop(idx)"
      >
        <div class="op-imgmgr__thumb">
          <img :src="src" alt="" />
          <span v-if="idx === 0" class="op-imgmgr__badge">★ รูปหลัก (Cover)</span>
          <span v-else class="op-imgmgr__num">#{{ idx + 1 }}</span>
        </div>

        <div class="op-imgmgr__enhance-row">
          <button
            type="button"
            class="op-imgmgr__magic-btn"
            :disabled="enhancingIdx === idx"
            @click="quickAutoEnhanceAt(idx)"
          >
            {{ enhancingIdx === idx ? 'กำลังปรับ...' : '✨ ปรับอัตโนมัติ' }}
          </button>
          <button type="button" class="op-imgmgr__studio-btn" @click="openStudioModal(idx)">
            🎨 ปรับละเอียด
          </button>
        </div>

        <div class="op-imgmgr__actions">
          <button v-if="idx > 0" type="button" title="ตั้งเป็นรูปหลัก" @click="setPrimary(idx)">★ ตั้งเป็นหลัก</button>
          <button type="button" :disabled="idx === 0" title="เลื่อนซ้าย" @click="moveBy(idx, -1)">←</button>
          <button type="button" :disabled="idx === list.length - 1" title="เลื่อนขวา" @click="moveBy(idx, 1)">→</button>
          <button type="button" class="is-del" title="ลบรูปนี้" @click="removeAt(idx)">ลบ</button>
        </div>
      </div>
    </div>

    <!-- Interactive Studio Adjust Modal -->
    <div v-if="studioOpen" class="erp-modal-backdrop" @click.self="studioOpen = false">
      <div class="erp-modal" style="max-width: 860px">
        <div class="erp-card__head" style="margin-bottom: 14px">
          <div>
            <div class="erp-card__title">🎨 OPWatch Image Studio — ปรับแต่งภาพนาฬิกา &amp; แบนเนอร์</div>
            <div class="erp-card__sub">เปรียบเทียบภาพต้นฉบับ (Before) กับภาพสตูดิโอที่ปรับแต่งแล้ว (After) แบบสดๆ</div>
          </div>
          <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" @click="studioOpen = false">✕ ปิด</button>
        </div>

        <div class="op-studio-compare">
          <div class="op-studio-pane">
            <div class="op-studio-lbl">ต้นฉบับ (Before)</div>
            <div class="op-studio-frame"><img :src="studioSourceUrl" alt="Before" /></div>
          </div>
          <div class="op-studio-pane is-after">
            <div class="op-studio-lbl">✨ หลังปรับสตูดิโอ (After Preview)</div>
            <div class="op-studio-frame"><img :src="studioPreviewUrl || studioSourceUrl" alt="After" /></div>
          </div>
        </div>

        <div class="erp-form-grid" style="margin-top: 16px">
          <div class="erp-field">
            <label class="erp-label">สัดส่วนภาพสตูดิโอ (Aspect Preset)</label>
            <select v-model="studioOpts.preset" class="erp-select" @change="refreshStudioPreview">
              <option value="watch-square">⌚ นาฬิกาสตูดิโอ 1:1 (1200×1200 พื้นขาว)</option>
              <option value="banner-wide">🖼 แบนเนอร์ 16:9 (1600×900)</option>
              <option value="keep-ratio">📐 คงสัดส่วนต้นฉบับ</option>
            </select>
          </div>
          <div class="erp-field">
            <label class="erp-label">ระยะขอบรอบตัวเรือน (Padding {{ Math.round(studioOpts.paddingRatio * 100) }}%)</label>
            <input v-model.number="studioOpts.paddingRatio" type="range" min="0.02" max="0.22" step="0.02" @change="refreshStudioPreview" />
          </div>
          <div class="erp-field">
            <label class="erp-label">ความสว่าง (Brightness: {{ studioOpts.brightness }})</label>
            <input v-model.number="studioOpts.brightness" type="range" min="-25" max="30" step="1" @change="refreshStudioPreview" />
          </div>
          <div class="erp-field">
            <label class="erp-label">คอนทราสต์ตัวเรือน (Contrast: {{ studioOpts.contrast }})</label>
            <input v-model.number="studioOpts.contrast" type="range" min="-20" max="35" step="1" @change="refreshStudioPreview" />
          </div>
          <div class="erp-field">
            <label class="erp-label">ความสดของสีหน้าปัด (Saturation: {{ studioOpts.saturation }})</label>
            <input v-model.number="studioOpts.saturation" type="range" min="-20" max="30" step="1" @change="refreshStudioPreview" />
          </div>
          <div class="erp-field">
            <label class="erp-label">ความคมชัดเข็ม &amp; แซฟไฟร์ (Sharpness: {{ Math.round(studioOpts.sharpness * 100) }}%)</label>
            <input v-model.number="studioOpts.sharpness" type="range" min="0" max="0.75" step="0.05" @change="refreshStudioPreview" />
          </div>
        </div>

        <div style="display: flex; gap: 18px; flex-wrap: wrap; margin-top: 12px">
          <label style="display: inline-flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer">
            <input v-model="studioOpts.cleanWhiteBg" type="checkbox" @change="refreshStudioPreview" />
            ปรับพื้นหลังเทา/อมเหลืองให้ขาวสะอาด (#FFFFFF)
          </label>
          <label style="display: inline-flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer">
            <input v-model="studioOpts.autoTrim" type="checkbox" @change="refreshStudioPreview" />
            ตัดขอบว่างและจัดกึ่งกลางเรือนเวลาอัตโนมัติ (Smart Auto-Trim)
          </label>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px">
          <button type="button" class="erp-btn erp-btn--ghost" @click="studioOpen = false">ยกเลิก</button>
          <button type="button" class="erp-btn erp-btn--primary" :disabled="studioBusy" @click="applyStudioResult">
            {{ studioBusy ? 'กำลังประมวลผล...' : '✨ บันทึกและแทนที่ด้วยภาพสตูดิโอนี้' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.op-imgmgr { display: flex; flex-direction: column; gap: 12px; }
.op-imgmgr__studio-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  padding: 12px 16px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f5f3ff 0%, #eef6ff 100%);
  border: 1px solid #dfd9fb;
}
.op-imgmgr__studio-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 240px; }
.op-imgmgr__studio-title { font-size: 13.5px; font-weight: 600; color: var(--ink, #23264d); display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.op-imgmgr__studio-sub { font-size: 11.5px; color: var(--ink-2, #454a75); margin-top: 2px; }
.op-imgmgr__studio-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.op-imgmgr__drop {
  border: 1.8px dashed #c8cdf0;
  border-radius: 14px;
  padding: 22px 18px;
  text-align: center;
  background: #fbfbfe;
  cursor: pointer;
  transition: all 0.16s ease;
}
.op-imgmgr__drop:hover,
.op-imgmgr__drop.is-over {
  border-color: var(--violet, #6c5ce7);
  background: var(--violet-soft, #efedfd);
}
.op-imgmgr__drop-icon { font-size: 26px; margin-bottom: 4px; }
.op-imgmgr__drop-title { font-size: 13.5px; font-weight: 600; color: var(--ink, #23264d); }
.op-imgmgr__drop-sub { font-size: 11.5px; color: var(--muted, #8a8fb1); margin-top: 4px; }
.op-imgmgr__urlrow { display: flex; gap: 8px; }
.op-imgmgr__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
  gap: 12px;
}
.op-imgmgr__card {
  background: #ffffff;
  border: 1px solid var(--line, #e9ebf6);
  border-radius: 14px;
  overflow: hidden;
  cursor: grab;
  box-shadow: 0 2px 8px rgba(46, 50, 102, 0.05);
  transition: transform 0.14s ease, border-color 0.14s ease;
}
.op-imgmgr__card:hover { transform: translateY(-2px); border-color: #c5bef8; }
.op-imgmgr__card.is-cover { border-color: var(--violet, #6c5ce7); box-shadow: 0 0 0 2px rgba(108, 92, 231, 0.16); }
.op-imgmgr__thumb {
  position: relative;
  aspect-ratio: 1 / 1;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}
.op-imgmgr__thumb img { max-width: 100%; max-height: 100%; object-fit: contain; }
.op-imgmgr__badge {
  position: absolute;
  top: 7px;
  left: 7px;
  padding: 3px 8px;
  font-size: 10.5px;
  font-weight: 600;
  border-radius: 999px;
  background: var(--violet, #6c5ce7);
  color: #ffffff;
}
.op-imgmgr__num {
  position: absolute;
  top: 7px;
  left: 7px;
  padding: 2px 7px;
  font-size: 10px;
  border-radius: 999px;
  background: rgba(35, 38, 77, 0.72);
  color: #ffffff;
}
.op-imgmgr__enhance-row {
  display: flex;
  gap: 4px;
  padding: 6px 6px 0;
  border-top: 1px solid var(--line, #e9ebf6);
  background: #fafbff;
}
.op-imgmgr__magic-btn,
.op-imgmgr__studio-btn {
  flex: 1;
  font-size: 11px;
  font-weight: 600;
  padding: 5px 6px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid #dcd7fb;
  background: var(--violet-soft, #efedfd);
  color: var(--violet, #6c5ce7);
}
.op-imgmgr__studio-btn {
  background: #ffffff;
  color: var(--ink-2, #454a75);
  border-color: var(--line, #e9ebf6);
}
.op-imgmgr__magic-btn:hover { background: var(--violet, #6c5ce7); color: #ffffff; }
.op-imgmgr__actions {
  display: flex;
  gap: 4px;
  padding: 6px;
  background: #fafbff;
}
.op-imgmgr__actions button {
  flex: 1;
  background: #ffffff;
  color: var(--ink-2, #454a75);
  border: 1px solid var(--line, #e9ebf6);
  border-radius: 7px;
  padding: 4px 5px;
  font-size: 11px;
  cursor: pointer;
}
.op-imgmgr__actions button:hover:not(:disabled) { border-color: var(--violet, #6c5ce7); color: var(--violet, #6c5ce7); }
.op-imgmgr__actions button:disabled { opacity: 0.35; cursor: not-allowed; }
.op-imgmgr__actions button.is-del { color: var(--red, #ff5c7a); }

.op-studio-compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.op-studio-pane {
  border: 1px solid var(--line, #e9ebf6);
  border-radius: 14px;
  padding: 10px;
  background: #f6f7fc;
}
.op-studio-pane.is-after {
  border-color: #c7bef8;
  background: #f8f7ff;
}
.op-studio-lbl { font-size: 12px; font-weight: 600; color: var(--ink, #23264d); margin-bottom: 8px; }
.op-studio-frame {
  aspect-ratio: 1 / 1;
  max-height: 290px;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid var(--line, #e9ebf6);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.op-studio-frame img { max-width: 100%; max-height: 100%; object-fit: contain; }
@media (max-width: 680px) {
  .op-studio-compare { grid-template-columns: 1fr; }
}
</style>
