<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    minHeight?: number
  }>(),
  {
    modelValue: '',
    placeholder: 'พิมพ์เนื้อหา จัดรูปแบบตัวอักษร แทรกตาราง หรือสลับดูโค้ด HTML...',
    minHeight: 220
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const editorEl = ref<HTMLDivElement | null>(null)
const sourceMode = ref(false)
const localHtml = ref(props.modelValue || '')

watch(
  () => props.modelValue,
  (val) => {
    const next = val || ''
    localHtml.value = next
    if (editorEl.value && !sourceMode.value && editorEl.value.innerHTML !== next) {
      editorEl.value.innerHTML = next
    }
  }
)

onMounted(() => {
  if (editorEl.value) {
    editorEl.value.innerHTML = props.modelValue || ''
  }
})

function syncFromDom() {
  if (!editorEl.value) return
  const html = editorEl.value.innerHTML
  localHtml.value = html
  emit('update:modelValue', html)
}

function onSourceInput(e: Event) {
  const val = (e.target as HTMLTextAreaElement).value
  localHtml.value = val
  emit('update:modelValue', val)
}

function toggleSource() {
  sourceMode.value = !sourceMode.value
  nextTick(() => {
    if (!sourceMode.value && editorEl.value) {
      editorEl.value.innerHTML = localHtml.value || ''
    }
  })
}

function exec(cmd: string, value?: string) {
  if (sourceMode.value || !import.meta.client) return
  editorEl.value?.focus()
  document.execCommand(cmd, false, value)
  syncFromDom()
}

function insertTable() {
  const tableHtml = `
    <table style="width:100%;border-collapse:collapse;margin:12px 0;">
      <tbody>
        <tr><th style="border:1px solid #cbd5e1;padding:8px;text-align:left;background:#f8fafc;">คุณสมบัติ</th><td style="border:1px solid #cbd5e1;padding:8px;">รายละเอียด</td></tr>
        <tr><th style="border:1px solid #cbd5e1;padding:8px;text-align:left;background:#f8fafc;">กระจกหน้าปัด</th><td style="border:1px solid #cbd5e1;padding:8px;">Sapphire Crystal กันรอยขีดข่วน</td></tr>
        <tr><th style="border:1px solid #cbd5e1;padding:8px;text-align:left;background:#f8fafc;">การรับประกัน</th><td style="border:1px solid #cbd5e1;padding:8px;">ศูนย์ไทย 2 ปี (บริษัท อินเตอร์ไทมส์ จำกัด)</td></tr>
      </tbody>
    </table><p></p>`
  exec('insertHTML', tableHtml)
}

function insertCallout() {
  const html = `<blockquote style="border-left:4px solid #1d2088;padding:12px 16px;background:#f1f5f9;margin:12px 0;color:#0f172a;"><strong>สิทธิพิเศษศูนย์ไทย:</strong> ของแท้ 100% พร้อมบริการห่อของขวัญฟรี และรับประกันศูนย์ไทย 2 ปีเต็ม</blockquote><p></p>`
  exec('insertHTML', html)
}

function promptLink() {
  if (!import.meta.client) return
  const url = window.prompt('ระบุ URL ลิงก์ปลายทาง:', 'https://')
  if (url) exec('createLink', url)
}

function promptImage() {
  if (!import.meta.client) return
  const url = window.prompt('ระบุ URL รูปภาพ:', '/images/op/banner-899832ags.jpg')
  if (url) exec('insertHTML', `<img src="${url}" alt="" style="max-width:100%;height:auto;border-radius:8px;margin:8px 0;" />`)
}
</script>

<template>
  <div class="op-rte">
    <div class="op-rte__bar">
      <div class="op-rte__grp">
        <button type="button" class="op-rte__btn" title="ย่อหน้าปกติ" @click="exec('formatBlock', 'P')">P</button>
        <button type="button" class="op-rte__btn" title="หัวข้อ H2" @click="exec('formatBlock', 'H2')">H2</button>
        <button type="button" class="op-rte__btn" title="หัวข้อ H3" @click="exec('formatBlock', 'H3')">H3</button>
      </div>
      <div class="op-rte__grp">
        <button type="button" class="op-rte__btn" title="ตัวหนา" @click="exec('bold')"><strong>B</strong></button>
        <button type="button" class="op-rte__btn" title="ตัวเอียง" @click="exec('italic')"><em>I</em></button>
        <button type="button" class="op-rte__btn" title="ขีดเส้นใต้" @click="exec('underline')"><u>U</u></button>
      </div>
      <div class="op-rte__grp">
        <button type="button" class="op-rte__btn" title="รายการจุด" @click="exec('insertUnorderedList')">• List</button>
        <button type="button" class="op-rte__btn" title="รายการลำดับเลข" @click="exec('insertOrderedList')">1. List</button>
        <button type="button" class="op-rte__btn" title="แทรกตาราง" @click="insertTable">⊞ ตาราง</button>
        <button type="button" class="op-rte__btn" title="กล่องข้อความเด่น" @click="insertCallout">❝ กล่องเด่น</button>
      </div>
      <div class="op-rte__grp">
        <button type="button" class="op-rte__btn" title="แทรกลิงก์" @click="promptLink">🔗 ลิงก์</button>
        <button type="button" class="op-rte__btn" title="แทรกรูปภาพ" @click="promptImage">🖼 รูป</button>
        <button type="button" class="op-rte__btn" title="ล้างการจัดรูปแบบ" @click="exec('removeFormat')">⌫</button>
      </div>
      <button
        type="button"
        class="op-rte__btn op-rte__btn--code"
        :class="{ 'is-active': sourceMode }"
        @click="toggleSource"
      >
        &lt;/&gt; HTML
      </button>
    </div>

    <textarea
      v-if="sourceMode"
      :value="localHtml"
      class="op-rte__source"
      :style="{ minHeight: minHeight + 'px' }"
      @input="onSourceInput"
    />
    <div
      v-else
      ref="editorEl"
      class="op-rte__canvas"
      contenteditable="true"
      :data-placeholder="placeholder"
      :style="{ minHeight: minHeight + 'px' }"
      @input="syncFromDom"
      @blur="syncFromDom"
    />
    <div class="op-rte__foot">
      <span>CKEditor-Style Free Rich Editor · รองรับตาราง รูปภาพ และ HTML เต็มรูปแบบ</span>
      <span>{{ localHtml.replace(/<[^>]+>/g, '').length }} ตัวอักษร</span>
    </div>
  </div>
</template>

<style scoped>
.op-rte {
  border: 1px solid #1e2d4a;
  border-radius: 12px;
  overflow: hidden;
  background: #08101f;
}
.op-rte__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: #0d172b;
  border-bottom: 1px solid #1e2d4a;
}
.op-rte__grp {
  display: inline-flex;
  gap: 3px;
  padding-right: 6px;
  border-right: 1px solid #1b2844;
}
.op-rte__btn {
  background: #121f38;
  color: #cbd5e1;
  border: 1px solid #1f3052;
  border-radius: 7px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.14s ease;
}
.op-rte__btn:hover {
  border-color: #22d3ee;
  color: #ffffff;
}
.op-rte__btn--code {
  margin-left: auto;
  font-family: monospace;
}
.op-rte__btn--code.is-active {
  background: rgba(34, 211, 238, 0.18);
  border-color: #22d3ee;
  color: #67e8f9;
}
.op-rte__canvas {
  padding: 14px 16px;
  color: #f1f5f9;
  font-size: 14px;
  line-height: 1.75;
  outline: none;
  background: #0a1222;
}
.op-rte__canvas:empty::before {
  content: attr(data-placeholder);
  color: #526484;
}
.op-rte__canvas :deep(h2),
.op-rte__canvas :deep(h3),
.op-rte__canvas :deep(h4) {
  color: #67e8f9;
  margin: 12px 0 6px;
  font-weight: 600;
}
.op-rte__canvas :deep(ul),
.op-rte__canvas :deep(ol) {
  padding-left: 22px;
  margin: 8px 0;
}
.op-rte__canvas :deep(a) {
  color: #38bdf8;
  text-decoration: underline;
}
.op-rte__source {
  width: 100%;
  border: 0;
  padding: 14px 16px;
  background: #050a14;
  color: #a5f3fc;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12.5px;
  line-height: 1.65;
  outline: none;
  resize: vertical;
}
.op-rte__foot {
  display: flex;
  justify-content: space-between;
  padding: 6px 12px;
  font-size: 11px;
  color: #64748b;
  background: #070d19;
  border-top: 1px solid #16223a;
}
</style>
