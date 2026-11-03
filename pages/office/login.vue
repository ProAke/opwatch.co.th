<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { site } = useSite()
const { login, logout, isAuthenticated, customer } = useAuth()

const form = reactive({ email: '', password: '' })
const errors = ref<Record<string, string>>({})
const submitting = ref(false)

const hasOfficeRole = (u: any) =>
  Boolean(u?.isAdmin || ['ceo', 'admin', 'staff'].includes(String(u?.role || '').toLowerCase()))

if (isAuthenticated.value && hasOfficeRole(customer.value)) {
  navigateTo(localePath('/office'))
}

async function submit() {
  errors.value = {}
  if (!form.email.trim()) errors.value.email = t('validation.required')
  if (!form.password) errors.value.password = t('validation.required')
  if (Object.keys(errors.value).length) return

  submitting.value = true
  try {
    const u = await login(form.email, form.password)
    if (!hasOfficeRole(u)) {
      useToast().error('บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานระบบหลังบ้าน ERP (สำหรับ CEO / Admin / Staff)')
      await logout()
      return
    }
    navigateTo(localePath('/office'))
  } catch (err: any) {
    const data = err?.data?.errors
    if (data) errors.value = data
    else useToast().error(t('auth.invalidCredentials'))
  } finally {
    submitting.value = false
  }
}

useHead({ title: `OPWatch ERP Sign In — ${site.value.name}` })
definePageMeta({ layout: false })
</script>

<template>
  <div class="erp-login">
    <div class="erp-login__card">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
        <div class="erp-login__orb">OP</div>
        <div>
          <div style="font-size:15px;font-weight:800;letter-spacing:0.08em;color:#f8fafc">OPWATCH · ERP</div>
          <div style="font-size:10.5px;letter-spacing:0.14em;color:#64748b">INTER TIMES WORKFORCE PORTAL</div>
        </div>
      </div>

      <h1 style="font-size:22px;font-weight:700;color:#ffffff">เข้าสู่ระบบบริหารจัดการ (ERP)</h1>
      <p style="font-size:13px;color:#94a3b8;margin:6px 0 24px">
        รองรับสิทธิ์ผู้ใช้งานระดับ CEO, Admin และเจ้าหน้าที่ปฏิบัติการ (Staff)
      </p>

      <form @submit.prevent="submit">
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:12px;color:#9fb0cf;margin-bottom:5px">{{ t('auth.email') }}</label>
          <input v-model="form.email" type="email" class="erp-login__input" autocomplete="username" placeholder="admin@opwatch.co.th" />
          <span v-if="errors.email" style="color:#fda4af;font-size:12px">{{ errors.email }}</span>
        </div>
        <div style="margin-bottom:20px">
          <label style="display:block;font-size:12px;color:#9fb0cf;margin-bottom:5px">{{ t('auth.password') }}</label>
          <input v-model="form.password" type="password" class="erp-login__input" autocomplete="current-password" placeholder="••••••••" />
          <span v-if="errors.password" style="color:#fda4af;font-size:12px">{{ errors.password }}</span>
        </div>
        <button class="erp-login__btn" type="submit" :disabled="submitting">
          {{ submitting ? 'กำลังตรวจสอบสิทธิ์...' : 'เข้าสู่ระบบ OPWatch ERP →' }}
        </button>
      </form>

      <div style="margin-top:20px;text-align:center">
        <NuxtLink :to="localePath('/')" style="font-size:12.5px;color:#67e8f9">← กลับสู่หน้าร้านค้า OPWatch.co.th</NuxtLink>
      </div>
    </div>
    <ToastHost />
  </div>
</template>

<style scoped>
.erp-login {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(800px 440px at 20% 0%, rgba(34, 211, 238, 0.14), transparent 60%),
    radial-gradient(700px 420px at 85% 15%, rgba(167, 139, 250, 0.12), transparent 60%),
    #04070e;
}
.erp-login__card {
  width: 100%;
  max-width: 430px;
  background: linear-gradient(180deg, rgba(14, 23, 42, 0.96), rgba(7, 12, 24, 0.96));
  border: 1px solid #1e2f4f;
  border-radius: 18px;
  padding: 32px 28px;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.55);
}
.erp-login__orb {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  background: linear-gradient(135deg, #22d3ee, #34d399);
  color: #03131d;
  font-weight: 800;
  display: grid;
  place-items: center;
}
.erp-login__input {
  width: 100%;
  background: #060c18;
  color: #f8fafc;
  border: 1px solid #22355a;
  border-radius: 10px;
  padding: 11px 13px;
  font-size: 14px;
  outline: none;
}
.erp-login__input:focus { border-color: #22d3ee; }
.erp-login__btn {
  width: 100%;
  padding: 12px;
  border: 0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #03131d;
  background: linear-gradient(135deg, #22d3ee, #34d399);
  cursor: pointer;
}
</style>
