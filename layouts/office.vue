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
        <OpCrest size="sm" theme="dark" sublabel="BACK OFFICE" />
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
          <LocaleSwitch :light-surface="true" />
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
.office { display: grid; grid-template-columns: 256px 1fr; min-height: 100vh; background: var(--ivory); }
.office__side {
  background: var(--ink);
  color: #d6d7ea;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}
.office__brand {
  display: flex;
  align-items: center;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 22px;
}

.office__nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.office__link {
  display: block;
  padding: 11px 14px;
  font-size: 13.5px;
  letter-spacing: 0.04em;
  color: #c5c7de;
  transition: all 0.18s;
  background: transparent;
  border: 0;
  width: 100%;
  text-align: left;
  cursor: pointer;
}
.office__link:hover { background: rgba(255, 255, 255, 0.07); color: #ffffff; }
.office__link.is-active {
  background: rgba(54, 59, 214, 0.32);
  color: #ffffff;
  border-left: 2px solid var(--champagne-soft);
  padding-left: 12px;
}

.office__foot {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.office__main { padding: 0 44px 60px; min-width: 0; }
.office__top {
  height: 74px;
  border-bottom: 1px solid var(--line-strong);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--paper);
  margin: 0 -44px 34px;
  padding-inline: 44px;
}
.office__pill {
  background: var(--sapphire-tint);
  color: var(--sapphire);
  padding: 4px 12px;
  border: 1px solid #cfd2f2;
  font-weight: 600;
  letter-spacing: 0.14em;
}
.office__content { max-width: 1140px; }

@media (max-width: 900px) {
  .office { grid-template-columns: 1fr; }
  .office__side { position: static; height: auto; flex-direction: row; align-items: center; overflow-x: auto; padding: 14px 18px; gap: 8px; }
  .office__brand { padding-bottom: 0; border: 0; margin: 0; white-space: nowrap; }
  .office__nav { flex-direction: row; gap: 4px; flex: none; }
  .office__link { white-space: nowrap; }
  .office__link.is-active { border-left: 0; }
  .office__foot { margin: 0; padding: 0; border: 0; flex-direction: row; }
  .office__main { padding: 0 20px 48px; }
  .office__top { margin: 0 -20px 26px; padding-inline: 20px; }
}
</style>
