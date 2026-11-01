<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { site } = useSite()
const { customer, logout } = useAuth()
const route = useRoute()

const links = computed(() => [
  { key: 'index', label: t('admin.dashboard'), to: localePath('/office'), exact: true },
  { key: 'products', label: t('admin.products'), to: localePath('/office/products'), exact: false },
  { key: 'brands', label: t('admin.brands'), to: localePath('/office/brands'), exact: false },
  { key: 'categories', label: t('admin.categories'), to: localePath('/office/categories'), exact: false },
  { key: 'orders', label: t('admin.orders'), to: localePath('/office/orders'), exact: false },
  { key: 'customers', label: t('admin.customers'), to: localePath('/office/customers'), exact: false },
  { key: 'settings', label: t('admin.settings'), to: localePath('/office/settings'), exact: false }
])

function isActive(l: { to: string; exact: boolean }) {
  if (l.exact) return route.path === l.to
  return route.path === l.to || route.path.startsWith(l.to + '/')
}

async function doLogout() {
  await logout()
  navigateTo(localePath('/office/login'))
}
</script>

<template>
  <div class="office">
    <aside class="office__side">
      <NuxtLink :to="localePath('/office')" class="office__brand">
        <span class="brandmark">OP</span>
        <div class="office__brandtext">
          <span>{{ site.name || 'Opwatch' }}</span>
          <small class="tiny upper">BACK OFFICE</small>
        </div>
      </NuxtLink>

      <nav class="office__nav" aria-label="Office Navigation">
        <NuxtLink
          v-for="l in links"
          :key="l.key"
          :to="l.to"
          class="office__link"
          :class="{ 'is-active': isActive(l) }"
        >
          {{ l.label }}
        </NuxtLink>
      </nav>

      <div class="office__foot">
        <NuxtLink :to="localePath('/')" class="office__link">{{ t('admin.backToSite') }} ↗</NuxtLink>
        <button class="office__link" @click="doLogout">{{ t('nav.logout') }}</button>
      </div>
    </aside>

    <div class="office__main">
      <header class="office__top">
        <div class="row gap-12">
          <span class="office__pill tiny upper">/office</span>
          <span class="tiny upper faint">{{ site.name }}</span>
        </div>
        <div class="row gap-16">
          <LocaleSwitch />
          <span class="small muted">{{ customer?.email }}</span>
        </div>
      </header>
      <div class="office__content">
        <slot />
      </div>
    </div>
    <ToastHost />
  </div>
</template>

<style scoped>
.office { display: grid; grid-template-columns: 248px 1fr; min-height: 100vh; background: var(--ivory); }
.office__side {
  background: #121110;
  color: #cfc8b9;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  border-right: 1px solid rgba(176, 141, 87, 0.18);
}
.office__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
  color: #f4f0e8;
  font-family: var(--font-roman, var(--font-display));
  font-size: 17px;
  font-weight: 500;
  letter-spacing: 0.1em;
  margin-bottom: 22px;
}
.office__brandtext { display: flex; flex-direction: column; gap: 3px; }
.office__brandtext small { color: var(--gold); font-size: 9px; letter-spacing: 0.22em; font-family: var(--font-sans); }
.brandmark {
  font-family: var(--font-roman, var(--font-display));
  font-size: 14px;
  color: var(--gold);
  border: 1px solid var(--gold);
  border-radius: 50%;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.office__nav { display: flex; flex-direction: column; gap: 3px; flex: 1; }
.office__link {
  display: block;
  padding: 11px 14px;
  border-radius: var(--radius);
  font-size: 13px;
  letter-spacing: 0.04em;
  color: #bfb7a9;
  transition: all 0.18s;
  background: transparent;
  border: 0;
  width: 100%;
  text-align: left;
  cursor: pointer;
}
.office__link:hover { background: rgba(255, 255, 255, 0.07); color: #fff; }
.office__link.is-active {
  background: rgba(176, 141, 87, 0.16);
  color: #fff;
  border-left: 2px solid var(--gold);
  padding-left: 12px;
}

.office__foot {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.09);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.office__main { padding: 0 44px 60px; min-width: 0; }
.office__top {
  height: 74px;
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--paper);
  margin: 0 -44px 34px;
  padding-inline: 44px;
}
.office__pill {
  background: var(--gold-tint);
  color: var(--gold);
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 600;
  letter-spacing: 0.12em;
}
.office__content { max-width: 1140px; }

@media (max-width: 900px) {
  .office { grid-template-columns: 1fr; }
  .office__side { position: static; height: auto; flex-direction: row; align-items: center; overflow-x: auto; padding: 14px 18px; gap: 8px; }
  .office__brand { padding-bottom: 0; border: 0; margin: 0; white-space: nowrap; }
  .office__brandtext small { display: none; }
  .office__nav { flex-direction: row; gap: 4px; flex: none; }
  .office__link { white-space: nowrap; }
  .office__link.is-active { border-left: 0; }
  .office__foot { margin: 0; padding: 0; border: 0; flex-direction: row; }
  .office__main { padding: 0 20px 48px; }
  .office__top { margin: 0 -20px 26px; padding-inline: 20px; }
}
</style>
