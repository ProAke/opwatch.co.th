<script setup lang="ts">
definePageMeta({ layout: false })

const officeAuth = useOfficeAuth()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errMsg = ref('')

if (!officeAuth.ready.value) {
  await officeAuth.refresh()
}

if (officeAuth.officer.value) {
  await navigateTo(officeAuth.officer.value.defaultHome || '/office')
}

const blockedMemberNotice = computed(
  () => route.query.blocked === 'member' || officeAuth.customerBlockedFromOffice.value
)

const roleBadges = [
  { key: 'ceo', label: 'CEO', color: '#6c5ce7' },
  { key: 'it_admin', label: 'IT. Admin', color: '#3ba7ff' },
  { key: 'marketing_sales', label: 'Marketing / Sales', color: '#ff6b9d' },
  { key: 'warehouse', label: 'คลังสินค้า (5 ช่องทาง)', color: '#22c793' },
  { key: 'dealer', label: 'ตัวแทนจำหน่าย (Dealer)', color: '#ffb020' }
]

async function submit() {
  errMsg.value = ''
  loading.value = true
  try {
    const officer = await officeAuth.login(email.value, password.value)
    toast.success(`เข้าสู่ระบบสำเร็จ: ${officer.roleLabelTh || officer.name}`)
    router.push(officer.defaultHome || '/office')
  } catch (err: any) {
    errMsg.value = err?.data?.statusMessage || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง (เฉพาะเจ้าหน้าที่และตัวแทนจำหน่ายเท่านั้น)'
  } finally {
    loading.value = false
  }
}

useHead({ title: 'เข้าสู่ระบบเจ้าหน้าที่และตัวแทนจำหน่าย · OPWatch Smart ERP' })
</script>

<template>
  <div class="mng-login">
    <div class="mng-login__card">
      <div class="mng-login__head">
        <img
          src="/images/logos/opwatch-logo-color.png"
          alt="Olympia Star Thailand · OPWatch"
          class="mng-login__logo-img"
        />
        <div>
          <span class="mng-login__eyebrow">INTER TIMES CO., LTD. · OFFICERS &amp; DEALERS PORTAL</span>
          <h1>OPWatch Workspace</h1>
          <p>ระบบบริหารหลังบ้านสำหรับเจ้าหน้าที่และตัวแทนจำหน่ายทางการ (แยกจากบัญชีลูกค้าหน้าเว็บ 100%)</p>
        </div>
      </div>

      <div class="mng-login__roles">
        <span
          v-for="rb in roleBadges"
          :key="rb.key"
          class="mng-login__role-chip"
          :style="{ '--rc': rb.color }"
        >
          <i></i>{{ rb.label }}
        </span>
      </div>

      <div v-if="blockedMemberNotice" class="mng-login__warn">
        <strong>แจ้งเตือนสิทธิ์การใช้งาน:</strong> บัญชีสมาชิกและลูกค้าหน้าเว็บไซต์ไม่สามารถเข้าสู่ระบบหลังบ้านได้ กรุณาเข้าสู่ระบบด้วยบัญชีเจ้าหน้าที่หรือตัวแทนจำหน่ายเท่านั้น
      </div>

      <div v-if="errMsg" class="mng-login__err">{{ errMsg }}</div>

      <form class="mng-login__form" @submit.prevent="submit">
        <div class="mng-login__field">
          <label>อีเมลเจ้าหน้าที่ / ตัวแทนจำหน่าย</label>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="username"
            placeholder="admin@opwatch.co.th หรือ dealer@opwatch.co.th"
          />
        </div>
        <div class="mng-login__field">
          <label>รหัสผ่าน</label>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="••••••••"
          />
        </div>
        <button type="submit" class="mng-login__btn" :disabled="loading">
          {{ loading ? 'กำลังตรวจสอบสิทธิ์...' : 'เข้าสู่ระบบเจ้าหน้าที่ / ตัวแทนจำหน่าย →' }}
        </button>
      </form>

      <div style="margin-top:12px;padding:9px 12px;border-radius:10px;background:#f8f7ff;border:1px solid #e9ebf6;font-size:11.5px;color:#64748b;text-align:center">
        📘 หลังเข้าสู่ระบบ สามารถเปิด <strong>คู่มือระบบจัดการเว็บไซต์</strong>, ปุ่มดึงข้อมูล Shopee และเปลี่ยนรหัสผ่านได้ที่เมนูด้านซ้าย
      </div>

      <div class="mng-login__foot">
        <NuxtLink to="/">← กลับสู่หน้าร้าน opwatch.co.th</NuxtLink>
        <span>Olym Pianus · Olympia Star · Ogival</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mng-login {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  font-family: 'Prompt', 'IBM Plex Sans Thai', sans-serif;
  background:
    radial-gradient(900px 480px at 15% 15%, rgba(108, 92, 231, 0.14), transparent 60%),
    radial-gradient(800px 440px at 85% 85%, rgba(59, 167, 255, 0.14), transparent 60%),
    #f6f7fc;
  color: #23264d;
}
.mng-login__card {
  width: 100%;
  max-width: 490px;
  background: #ffffff;
  border: 1px solid #e9ebf6;
  border-radius: 22px;
  padding: 32px 30px;
  box-shadow: 0 24px 60px rgba(60, 52, 140, 0.12);
}
.mng-login__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  margin-bottom: 16px;
}
.mng-login__logo-img {
  height: 76px;
  width: auto;
  object-fit: contain;
  display: block;
}
.mng-login__eyebrow {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #6c5ce7;
  background: #efedfd;
  padding: 4px 10px;
  border-radius: 999px;
  margin-bottom: 6px;
}
.mng-login__head h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #23264d;
}
.mng-login__head p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #8a8fb1;
  line-height: 1.5;
}
.mng-login__roles {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin-bottom: 18px;
}
.mng-login__role-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f6f7fc;
  border: 1px solid #e9ebf6;
  font-size: 11.5px;
  font-weight: 600;
  color: #454a75;
}
.mng-login__role-chip i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--rc, #6c5ce7);
}
.mng-login__warn {
  background: #fff6e4;
  border: 1px solid #ffd584;
  color: #9a5b00;
  padding: 11px 14px;
  border-radius: 12px;
  font-size: 12.5px;
  line-height: 1.5;
  margin-bottom: 14px;
}
.mng-login__err {
  background: #ffecef;
  border: 1px solid #ffc2ce;
  color: #d6294b;
  padding: 11px 14px;
  border-radius: 12px;
  font-size: 13px;
  margin-bottom: 16px;
}
.mng-login__form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.mng-login__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.mng-login__field label {
  font-size: 13px;
  font-weight: 600;
  color: #454a75;
}
.mng-login__field input {
  height: 44px;
  border-radius: 12px;
  border: 1px solid #dfe2f2;
  background: #fbfbfe;
  padding: 0 14px;
  font-size: 14px;
  color: #23264d;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.mng-login__field input:focus {
  outline: none;
  border-color: #6c5ce7;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.14);
}
.mng-login__btn {
  margin-top: 6px;
  height: 46px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #8e7cf3 0%, #6c5ce7 60%, #4a3fd1 100%);
  color: #ffffff;
  font-size: 14.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(108, 92, 231, 0.25);
  transition: transform 0.14s, opacity 0.14s;
}
.mng-login__btn:hover:not(:disabled) {
  transform: translateY(-1px);
}
.mng-login__btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.mng-login__foot {
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid #e9ebf6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12.5px;
  color: #8a8fb1;
}
.mng-login__foot a {
  color: #6c5ce7;
  font-weight: 600;
  text-decoration: none;
}
.mng-login__foot a:hover {
  text-decoration: underline;
}
</style>
