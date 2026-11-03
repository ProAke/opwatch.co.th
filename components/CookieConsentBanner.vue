<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
const visible = ref(false)

onMounted(() => {
  try {
    const saved = localStorage.getItem('opwatch_cookie_consent')
    if (!saved) visible.value = true
  } catch {
    visible.value = false
  }
})

function accept(mode: 'all' | 'essential') {
  try {
    localStorage.setItem('opwatch_cookie_consent', JSON.stringify({ mode, at: new Date().toISOString() }))
  } catch {}
  visible.value = false
}
</script>

<template>
  <Transition name="fade-drop">
    <div v-if="visible" class="op-cookie">
      <div class="container op-cookie__row">
        <p class="op-cookie__text">
          {{
            locale === 'th'
              ? 'เว็บไซต์นี้ใช้คุกกี้เพื่อประสบการณ์การเลือกซื้อเรือนเวลาและการจดจำตะกร้าสินค้าอย่างปลอดภัย ตามมาตรฐาน PDPA อ่านเพิ่มเติมที่ '
              : 'We use cookies to safeguard your shopping bag and personalise your boutique experience under Thailand PDPA. Learn more in our '
          }}
          <NuxtLink :to="localePath('/pages/cookie-policy')">{{ locale === 'th' ? 'นโยบายคุกกี้' : 'Cookie Policy' }}</NuxtLink>
          ·
          <NuxtLink :to="localePath('/pages/privacy-policy')">{{ locale === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy' }}</NuxtLink>
        </p>
        <div class="op-cookie__btns">
          <button type="button" class="op-cookie__btn op-cookie__btn--ghost" @click="accept('essential')">
            {{ locale === 'th' ? 'เฉพาะที่จำเป็น' : 'Essential Only' }}
          </button>
          <button type="button" class="op-cookie__btn op-cookie__btn--primary" @click="accept('all')">
            {{ locale === 'th' ? 'ยอมรับทั้งหมด' : 'Accept All' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.op-cookie {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 90;
  background: rgba(12, 16, 44, 0.96);
  color: #eef2ff;
  border-top: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(10px);
  padding: 13px 0;
}
.op-cookie__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.op-cookie__text {
  font-size: 13px;
  line-height: 1.55;
  flex: 1;
  min-width: 260px;
}
.op-cookie__text a {
  color: #93c5fd;
  text-decoration: underline;
}
.op-cookie__btns {
  display: flex;
  gap: 8px;
}
.op-cookie__btn {
  padding: 7px 15px;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}
.op-cookie__btn--ghost {
  background: transparent;
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.28);
}
.op-cookie__btn--primary {
  background: #ffffff;
  color: #1d2088;
  border: 1px solid #ffffff;
}
</style>
