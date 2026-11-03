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
        <tr><th style="border:1px solid #e2e8f0;padding:8px;text-align:left;background:#f8fafc;">คุณสมบัติ</th><td style="border:1px solid #e2e8f0;padding:8px;">รายละเอียด</td></tr>
        <tr><th style="border:1px solid #e2e8f0;padding:8px;text-align:left;background:#f8fafc;">กระจกหน้าปัด</th><td style="border:1px solid #e2e8f0;padding:8px;">Sapphire Crystal กันรอยขีดข่วน</td></tr>
        <tr><th style="border:1px solid #e2e8f0;padding:8px;text-align:left;background:#f8fafc;">การรับประกัน</th><td style="border:1px solid #e2e8f0;padding:8px;">ศูนย์ไทย 2 ปี (บริษัท อินเตอร์ไทมส์ จำกัด)</td></tr>
      </tbody>
    </table><p></p>`
  exec('insertHTML', tableHtml)
}

function insertCallout() {
  const html = `<blockquote style="border-left:4px solid #6c5ce7;padding:12px 16px;background:#f5f3ff;margin:12px 0;color:#23264d;"><strong>สิทธิพิเศษศูนย์ไทย:</strong> ของแท้ 100% พร้อมบริการห่อของขวัญฟรี และรับประกันศูนย์ไทย 2 ปีเต็ม</blockquote><p></p>`
  exec('insertHTML', html)
}

function promptLink() {
  if (!import.meta.client) return
  const url = window.prompt('ระบุ URL ลิงก์ปลายทาง:', 'https://')
  if (url) exec('createLink', url)
}

function promptImage() {
  if (!import.meta.client) return
  const url = window.prompt('ระบุ URL รูปภาพ (หรืออัปโหลดผ่านแกลเลอรีแล้วคัดลอกลิงก์):', '/images/op/')
  if (url) exec('insertImage', url)
}
</script>

<template>
  <div class="op-rte">
    <div class="op-rte__bar">
      <div class="op-rte__grp">
        <button type="button" class="op-rte__btn" title="ตัวหนา" @click="exec('bold')"><b>B</b></button>
        <button type="button" class="op-rte__btn" title="ตัวเอียง" @click="exec('italic')"><i>I</i></button>
        <button type="button" class="op-rte__btn" title="ขีดเส้นใต้" @click="exec('underline')"><u>U</u></button>
      </div>
      <div class="op-rte__grp">
        <button type="button" class="op-rte__btn" @click="exec('formatBlock', 'H2')">H2</button>
        <button type="button" class="op-rte__btn" @click="exec('formatBlock', 'H3')">H3</button>
        <button type="button" class="op-rte__btn" @click="exec('formatBlock', 'P')">ย่อหน้า</button>
      </div>
      <div class="op-rte__grp">
        <button type="button" class="op-rte__btn" @click="exec('insertUnorderedList')">• รายการ</button>
        <button type="button" class="op-rte__btn" @click="exec('insertOrderedList')">1. ลำดับ</button>
        <button type="button" class="op-rte__btn" @click="insertTable">⊞ ตารางสเปก</button>
        <button type="button" class="op-rte__btn" @click="insertCallout">❝ กล่องไฮไลต์</button>
      </div>
      <div class="op-rte__grp">
        <button type="button" class="op-rte__btn" @click="promptLink">🔗 ลิงก์</button>
        <button type="button" class="op-rte__btn" @click="promptImage">🖼 รูป</button>
        <button type="button" class="op-rte__btn" @click="exec('removeFormat')">ล้างฟอร์แมต</button>
      </div>
      <button
        type="button"
        class="op-rte__btn op-rte__btn--code"
        :class="{ 'is-active': sourceMode }"
        @click="toggleSource"
      >
        &lt;/&gt; {{ sourceMode ? 'โหมดแก้ไขปกติ' : 'ดู/แก้โค้ด HTML' }}
      </button>
    </div>

    <textarea
      v-if="sourceMode"
      :value="localHtml"
      class="op-rte__source"
      :style="{ minHeight: `${props.minHeight}px` }"
      spellcheck="false"
      @input="onSourceInput"
    />
    <div
      v-else
      ref="editorEl"
      class="op-rte__canvas"
      contenteditable="true"
      :data-placeholder="props.placeholder"
      :style="{ minHeight: `${props.minHeight}px` }"
      @input="syncFromDom"
      @blur="syncFromDom"
    />
    <div class="op-rte__foot">
      <span>WYSIWYG Rich HTML Editor · รองรับตาราง หัวข้อ รายการ และ HTML Source</span>
      <span>{{ (localHtml || '').length.toLocaleString() }} ตัวอักษร</span>
    </div>
  </div>
</template>

<style scoped>
.op-rte {
  border: 1px solid var(--line, #e9ebf6);
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
}
.op-rte__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: #f6f7fc;
  border-bottom: 1px solid var(--line, #e9ebf6);
}
.op-rte__grp {
  display: inline-flex;
  gap: 4px;
  padding-right: 6px;
  border-right: 1px solid var(--line, #e9ebf6);
}
.op-rte__btn {
  background: #ffffff;
  color: var(--ink-2, #454a75);
  border: 1px solid var(--line-2, #dfe2f2);
  border-radius: 8px;
  padding: 4px 9px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.14s ease;
}
.op-rte__btn:hover {
  border-color: var(--violet, #6c5ce7);
  color: var(--violet, #6c5ce7);
  background: var(--violet-soft, #efedfd);
}
.op-rte__btn--code {
  margin-left: auto;
  font-family: 'JetBrains Mono', monospace;
}
.op-rte__btn--code.is-active {
  background: var(--violet, #6c5ce7);
  border-color: var(--violet, #6c5ce7);
  color: #ffffff;
}
.op-rte__canvas {
  padding: 14px 16px;
  color: var(--ink, #23264d);
  font-size: 14px;
  line-height: 1.75;
  outline: none;
  background: #ffffff;
}
.op-rte__canvas:empty::before {
  content: attr(data-placeholder);
  color: var(--muted, #8a8fb1);
}
.op-rte__canvas :deep(h2),
.op-rte__canvas :deep(h3),
.op-rte__canvas :deep(h4) {
  color: var(--violet, #6c5ce7);
  margin: 12px 0 6px;
  font-weight: 600;
}
.op-rte__canvas :deep(ul),
.op-rte__canvas :deep(ol) {
  padding-left: 22px;
  margin: 8px 0;
}
.op-rte__canvas :deep(a) {
  color: var(--violet, #6c5ce7);
  text-decoration: underline;
}
.op-rte__source {
  width: 100%;
  border: 0;
  padding: 14px 16px;
  background: #1e2140;
  color: #e9e7ff;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
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
  color: var(--muted, #8a8fb1);
  background: #fbfbfe;
  border-top: 1px solid var(--line, #e9ebf6);
}
</style>
