<script setup lang="ts">
const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string[]): void
}>()

const toast = useToast()
const uploading = ref(false)
const draggingZone = ref(false)
const dragIdx = ref<number | null>(null)
const urlInput = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const list = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []))

function updateList(next: string[]) {
  emit('update:modelValue', next)
}

async function handleFiles(files: FileList | File[]) {
  const arr = Array.from(files).filter((f) => f.type.startsWith('image/'))
  if (!arr.length) return
  uploading.value = true
  try {
    const fd = new FormData()
    for (const f of arr) fd.append('files', f, f.name)
    const res = await $fetch<{ ok: boolean; urls: string[] }>('/api/admin/upload', {
      method: 'POST',
      body: fd
    })
    if (res.urls?.length) {
      const cleaned = list.value.filter((u) => u && u !== '/images/op/watch-990-083-blue.png')
      updateList([...cleaned, ...res.urls])
      toast.success(`อัปโหลดรูปภาพสำเร็จ ${res.urls.length} ไฟล์`)
    }
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || 'อัปโหลดรูปภาพไม่สำเร็จ')
  } finally {
    uploading.value = false
    draggingZone.value = false
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
    <!-- Drag-and-Drop Upload Zone -->
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
        hidden
        @change="(e: any) => e.target?.files && handleFiles(e.target.files)"
      />
      <div class="op-imgmgr__drop-icon">⬆</div>
      <div class="op-imgmgr__drop-title">
        {{ uploading ? 'กำลังอัปโหลดรูปภาพ...' : 'ลากไฟล์รูปภาพมาวางที่นี่ (Drag & Drop) หรือคลิกเพื่อเลือกไฟล์' }}
      </div>
      <div class="op-imgmgr__drop-sub">
        รองรับ JPG, PNG, WebP อัปโหลดได้หลายไฟล์พร้อมกัน · ลากการ์ดด้านล่างเพื่อสลับตำแหน่งรูปภาพได้ทันที
      </div>
    </div>

    <!-- Add External URL -->
    <div class="op-imgmgr__urlrow">
      <input
        v-model="urlInput"
        class="erp-input"
        placeholder="หรือวางลิงก์รูปภาพ https://... (เช่น รูปจาก Shopee / CDN)"
        @keyup.enter="addByUrl"
      />
      <button type="button" class="erp-btn" @click="addByUrl">+ เพิ่มลิงก์รูป</button>
    </div>

    <!-- Sortable Gallery Grid -->
    <div class="op-imgmgr__grid">
      <div
        v-for="(img, idx) in list"
        :key="img + '-' + idx"
        class="op-imgmgr__card"
        :class="{ 'is-cover': idx === 0, 'is-dragging': dragIdx === idx }"
        draggable="true"
        @dragstart="onCardDragStart(idx)"
        @dragover.prevent
        @drop.prevent="onCardDrop(idx)"
      >
        <div class="op-imgmgr__thumb">
          <span class="op-imgmgr__badge">{{ idx === 0 ? '★ ภาพหลัก #1' : `#${idx + 1}` }}</span>
          <img
            :src="img"
            alt=""
            referrerpolicy="no-referrer"
            @error="(e: any) => { if (e?.target) e.target.src = '/images/op/watch-990-083-blue.png' }"
          />
        </div>
        <input
          :value="img"
          class="op-imgmgr__path"
          @change="(e: any) => { const n = list.slice(); n[idx] = e.target.value; updateList(n) }"
        />
        <div class="op-imgmgr__actions">
          <button type="button" class="op-imgmgr__act" :disabled="idx === 0" title="เลื่อนซ้าย" @click="moveBy(idx, -1)">◀</button>
          <button type="button" class="op-imgmgr__act" :disabled="idx === list.length - 1" title="เลื่อนขวา" @click="moveBy(idx, 1)">▶</button>
          <button v-if="idx > 0" type="button" class="op-imgmgr__act op-imgmgr__act--main" @click="setPrimary(idx)">ตั้งเป็นภาพหลัก</button>
          <button type="button" class="op-imgmgr__act op-imgmgr__act--del" title="ลบรูป" @click="removeAt(idx)">✕</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.op-imgmgr { display: flex; flex-direction: column; gap: 14px; }
.op-imgmgr__drop {
  border: 1.5px dashed #294169;
  border-radius: 14px;
  padding: 22px 18px;
  text-align: center;
  background: rgba(13, 23, 42, 0.72);
  cursor: pointer;
  transition: all 0.16s ease;
}
.op-imgmgr__drop:hover,
.op-imgmgr__drop.is-over {
  border-color: #22d3ee;
  background: rgba(34, 211, 238, 0.08);
}
.op-imgmgr__drop-icon { font-size: 22px; color: #22d3ee; margin-bottom: 4px; }
.op-imgmgr__drop-title { font-size: 13.5px; font-weight: 600; color: #e2e8f0; }
.op-imgmgr__drop-sub { font-size: 11.5px; color: #7c8fb0; margin-top: 4px; }
.op-imgmgr__urlrow { display: flex; gap: 8px; }
.op-imgmgr__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
  gap: 12px;
}
.op-imgmgr__card {
  background: #0b1426;
  border: 1px solid #1d2d4b;
  border-radius: 12px;
  padding: 8px;
  cursor: grab;
  transition: all 0.15s ease;
}
.op-imgmgr__card.is-cover {
  border-color: rgba(34, 211, 238, 0.55);
  box-shadow: 0 0 0 1px rgba(34, 211, 238, 0.25);
}
.op-imgmgr__card.is-dragging { opacity: 0.45; }
.op-imgmgr__thumb {
  position: relative;
  aspect-ratio: 1;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  display: grid;
  place-items: center;
}
.op-imgmgr__thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.op-imgmgr__badge {
  position: absolute;
  top: 6px;
  left: 6px;
  background: rgba(6, 12, 24, 0.85);
  color: #67e8f9;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
}
.op-imgmgr__path {
  width: 100%;
  margin-top: 6px;
  padding: 4px 6px;
  font-size: 11px;
  color: #94a3b8;
  background: #060b16;
  border: 1px solid #16223a;
  border-radius: 6px;
}
.op-imgmgr__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
}
.op-imgmgr__act {
  background: #13203a;
  color: #cbd5e1;
  border: 1px solid #1f3154;
  border-radius: 6px;
  padding: 3px 7px;
  font-size: 11px;
  cursor: pointer;
}
.op-imgmgr__act:disabled { opacity: 0.35; cursor: not-allowed; }
.op-imgmgr__act--main { flex: 1; color: #67e8f9; border-color: rgba(34, 211, 238, 0.35); }
.op-imgmgr__act--del { margin-left: auto; color: #fda4af; }
</style>
