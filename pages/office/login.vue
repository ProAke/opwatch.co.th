<script setup lang="ts">
definePageMeta({ layout: false })

const auth = useAuth()
const router = useRouter()
const toast = useToast()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errMsg = ref('')

const isStaffOrAdmin = computed(() => {
  const c = auth.customer.value
  if (!c) return false
  return Boolean(c.isAdmin || ['ceo', 'admin', 'staff'].includes(String(c.role || '').toLowerCase()))
})

if (isStaffOrAdmin.value) {
  await navigateTo('/office')
}

async function submit() {
  errMsg.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    if (!isStaffOrAdmin.value) {
      await auth.logout()
      errMsg.value = 'บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานระบบจัดการหลังบ้าน OPWatch ERP'
      return
    }
    toast.success('เข้าสู่ระบบ OPWatch ERP สำเร็จ')
    router.push('/office')
  } catch (err: any) {
    errMsg.value = err?.data?.statusMessage || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
  } finally {
    loading.value = false
  }
}

useHead({ title: 'เข้าสู่ระบบ · OPWatch Smart ERP' })
</script>

<template>
  <div class="mng-login">
    <div class="mng-login__card">
      <div class="mng-login__head">
        <div class="mng-login__logo">OP</div>
        <div>
          <span class="mng-login__eyebrow">INTER TIMES CO., LTD. · SMART ERP</span>
          <h1>OPWatch Workspace</h1>
          <p>ระบบบริหารสินค้า ปฏิทินแคมเปญ ผู้ช่วย AI และอีคอมเมิร์ซครบวงจร</p>
        </div>
      </div>

      <div v-if="errMsg" class="mng-login__err">{{ errMsg }}</div>

      <form class="mng-login__form" @submit.prevent="submit">
        <div class="mng-login__field">
          <label>อีเมลผู้ดูแลระบบ / พนักงาน</label>
          <input v-model="email" type="email" required autocomplete="username" placeholder="admin@opwatch.co.th" />
        </div>
        <div class="mng-login__field">
          <label>รหัสผ่าน</label>
          <input v-model="password" type="password" required autocomplete="current-password" placeholder="••••••••" />
        </div>
        <button type="submit" class="mng-login__btn" :disabled="loading">
          {{ loading ? 'กำลังตรวจสอบสิทธิ์...' : 'เข้าสู่ระบบจัดการหลังบ้าน →' }}
        </button>
      </form>

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
  max-width: 450px;
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
  margin-bottom: 22px;
}
.mng-login__logo {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: linear-gradient(135deg, #8e7cf3 0%, #6c5ce7 60%, #4a3fd1 100%);
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
  display: grid;
  place-items: center;
  box-shadow: 0 10px 24px rgba(108, 92, 231, 0.32);
}
.mng-login__eyebrow {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #6c5ce7;
}
.mng-login__head h1 {
  margin: 4px 0 4px;
  font-size: 22px;
  font-weight: 700;
  color: #23264d;
}
.mng-login__head p {
  margin: 0;
  font-size: 12.5px;
  color: #8a8fb1;
}
.mng-login__err {
  margin-bottom: 14px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #ffecef;
  border: 1px solid #fecdd3;
  color: #e11d48;
  font-size: 12.5px;
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
  font-size: 12.5px;
  font-weight: 600;
  color: #454a75;
}
.mng-login__field input {
  padding: 11px 14px;
  border-radius: 12px;
  border: 1px solid #dfe2f2;
  background: #f6f7fc;
  color: #23264d;
  font-size: 14px;
  font-family: inherit;
  outline: none;
}
.mng-login__field input:focus {
  background: #ffffff;
  border-color: #6c5ce7;
  box-shadow: 0 0 0 3px #efedfd;
}
.mng-login__btn {
  margin-top: 6px;
  padding: 12px 16px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #8e7cf3 0%, #6c5ce7 60%, #4a3fd1 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(108, 92, 231, 0.28);
}
.mng-login__btn:hover { filter: brightness(1.04); }
.mng-login__foot {
  margin-top: 22px;
  padding-top: 14px;
  border-top: 1px solid #e9ebf6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11.5px;
  color: #8a8fb1;
}
.mng-login__foot a {
  color: #6c5ce7;
  font-weight: 600;
  text-decoration: none;
}
</style>
