<script setup lang="ts">
const { t} = useI18n()
const localePath = useLocalePath()
const { site } = useSite()
const { customer, logout } = useAuth()

const links = computed(() => [
  { key: 'index', label: t('admin.dashboard'), to: '/admin' },
  { key: 'products', label: t('admin.products'), to: '/admin/products' },
  { key: 'orders', label: t('admin.orders'), to: '/admin/orders' },
  { key: 'customers', label: t('admin.customers'), to: '/admin/customers' },
  { key: 'categories', label: t('admin.categories'), to: '/admin/categories' },
  { key: 'settings', label: t('admin.settings'), to: '/admin/settings' }
])

const route = useRoute()

async function doLogout() {
  await logout()
  navigateTo('/')
}
</script>

<template>
  <div class="admin">
    <aside class="admin__side">
      <NuxtLink to="/" class="admin__brand">
        <span class="brandmark">OP</span>
        <span>Opwatch</span>
        <span class="tiny upper admin__brandtag">Admin</span>
      </NuxtLink>

      <nav class="admin__nav">
        <NuxtLink
          v-for="l in links"
          :key="l.key"
          :to="l.to"
          class="admin__link"
          :class="{ 'is-active': route.path === l.to || (l.to !== '/admin' && route.path.startsWith(l.to)) }"
        >
          {{ l.label }}
        </NuxtLink>
      </nav>

      <div class="admin__foot">
        <NuxtLink to="/" class="admin__link">{{ t('admin.backToSite') }}</NuxtLink>
        <button class="admin__link" @click="doLogout">{{ t('nav.logout') }}</button>
      </div>
    </aside>

    <div class="admin__main">
      <header class="admin__top">
        <p class="tiny upper faint">{{ site.name }}</p>
        <p class="small muted">{{ customer?.email }}</p>
      </header>
      <div class="admin__content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin { display: grid; grid-template-columns: 236px 1fr; min-height: 100vh; background: var(--ivory); }
.admin__side { background: var(--ink); color: #cfc8b9; padding: 30px 22px; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; }
.admin__brand { display: flex; align-items: center; gap: 10px; padding-bottom: 28px; border-bottom: 1px solid rgba(255,255,255,0.1); color: #f4f0e8; font-family: var(--font-display); font-size: 19px; font-weight: 600; letter-spacing: 0.08em; margin-bottom: 24px; }
.brandmark { font-family: var(--font-display); font-size: 15px; color: var(--gold); border: 1px solid var(--gold); border-radius: 50%; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; }
.admin__brandtag { margin-left: auto; color: var(--gold); font-size: 9px; }

.admin__nav { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.admin__link { display: block; padding: 11px 14px; border-radius: var(--radius); font-size: 13px; letter-spacing: 0.04em; color: #bfb7a9; transition: all 0.18s; background: transparent; border: 0; width: 100%; text-align: left; cursor: pointer; }
.admin__link:hover { background: rgba(255,255,255,0.07); color: #fff; }
.admin__link.is-active { background: rgba(255,255,255,0.1); color: #fff; border-left: 2px solid var(--gold); padding-left: 12px; }

.admin__foot { margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; gap: 4px; }

.admin__main { padding: 0 46px 60px; min-width: 0; }
.admin__top { height: 80px; border-bottom: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; background: var(--paper); margin: 0 -46px 34px; padding-inline: 46px; }
.admin__content { max-width: 1100px; }

@media (max-width: 860px) {
  .admin { grid-template-columns: 1fr; }
  .admin__side { position: static; height: auto; flex-direction: row; align-items: center; overflow-x: auto; padding: 14px 18px; gap: 8px; }
  .admin__brand { padding-bottom: 0; border: 0; margin: 0; white-space: nowrap; }
  .admin__brandtag { display: none; }
  .admin__nav { flex-direction: row; gap: 4px; flex: none; }
  .admin__link { white-space: nowrap; }
  .admin__link.is-active { border-left: 0; background: rgba(255,255,255,0.1); }
  .admin__foot { margin: 0; padding: 0; border: 0; flex-direction: row; }
  .admin__main { padding: 0 20px 48px; }
  .admin__top { margin: 0 -20px 26px; padding-inline: 20px; }
}
</style>
