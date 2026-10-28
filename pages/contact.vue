<script setup lang="ts">
const { t, locale } = useI18n()
const { site } = useSite()

const form = reactive({ name: '', email: '', message: '' })
const sent = ref(false)

function submit() {
  if (!form.name.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) || !form.message.trim()) return
  const subject = encodeURIComponent(`[${site.value.name}] ${form.message.slice(0, 60)}`)
  const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`)
  window.location.href = `mailto:${site.value.email}?subject=${subject}&body=${body}`
  sent.value = true
  useToast().success(t('account.profileSaved'))
}

useHead({ title: `${t('nav.contactUs')} — ${site.value.name}` })
</script>

<template>
  <section class="section">
    <div class="container contact">
      <div class="contact__form">
        <p class="eyebrow">{{ t('nav.contactUs') }}</p>
        <h1 class="page-title" style="margin: 14px 0 8px">{{ t('nav.contactUs') }}</h1>
        <p class="muted" style="margin-bottom: 36px">{{ site.tagline }}</p>

        <form @submit.prevent="submit">
          <div class="formgrid">
            <div class="field">
              <label class="label">{{ t('auth.name') }}</label>
              <input v-model="form.name" class="input" />
            </div>
            <div class="field">
              <label class="label">{{ t('auth.email') }}</label>
              <input v-model="form.email" type="email" class="input" />
            </div>
          </div>
          <div class="field" style="margin: 18px 0 24px">
            <label class="label">{{ t('checkout.note') }}</label>
            <textarea v-model="form.message" class="textarea" />
          </div>
          <button class="btn btn--gold" type="submit">{{ t('nav.contactUs') }}</button>
          <p v-if="sent" class="small" style="color: var(--success); margin-left: 14px">{{ t('account.profileSaved') }}</p>
        </form>
      </div>

      <aside class="contact__aside">
        <div class="infobox">
          <h3 class="tiny upper">{{ t('footer.contact') }}</h3>
          <a :href="`mailto:${site.email}`" class="infobox__link">{{ site.email }}</a>
          <a :href="`tel:${site.phone.replace(/[^\d+]/g, '')}`" class="infobox__link">{{ site.phone }}</a>
        </div>
        <div class="infobox">
          <h3 class="tiny upper">{{ t('checkout.shippingAddress') }}</h3>
          <p class="muted small">{{ site.name }}<br />Bangkok, Thailand</p>
        </div>
        <div class="infobox">
          <h3 class="tiny upper">{{ t('footer.followUs') }}</h3>
          <div class="row gap-12">
            <a href="#" aria-label="Facebook" class="socbtn">f</a>
            <a href="#" aria-label="Instagram" class="socbtn">◎</a>
            <a href="#" aria-label="LINE" class="socbtn">L</a>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.contact { display: grid; grid-template-columns: 1fr 340px; gap: 64px; align-items: start; }
.formgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.contact__aside { display: flex; flex-direction: column; gap: 22px; }
.infobox { border: 1px solid var(--line); background: var(--paper); padding: 24px; border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: 12px; }
.infobox h3 { color: var(--gold); margin-bottom: 4px; }
.infobox__link { font-size: 15px; }
.infobox__link:hover { color: var(--gold); }
.socbtn { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--line-strong); display: inline-flex; align-items: center; justify-content: center; font-size: 13px; color: var(--ink-soft); transition: all 0.2s; }
.socbtn:hover { border-color: var(--gold); color: var(--gold); }

@media (max-width: 900px) { .contact { grid-template-columns: 1fr; gap: 44px; } }
@media (max-width: 560px) { .formgrid { grid-template-columns: 1fr; } }
</style>
