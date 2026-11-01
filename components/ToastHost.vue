<script setup lang="ts">
const { t, te } = useI18n()
const { toasts, dismiss } = useToast()
</script>

<template>
  <div class="toasts" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="tst in toasts" :key="tst.id" class="toast" :class="`toast--${tst.type}`" @click="dismiss(tst.id)">
        <svg v-if="tst.type === 'success'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
          <path d="m5 13 4 4L19 7" />
        </svg>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
          <path d="M12 8v5M12 16.5v.5" /><circle cx="12" cy="12" r="9" />
        </svg>
        <span>{{ tst.message.includes('.') && te(tst.message) ? t(tst.message) : tst.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  bottom: 26px;
  right: 26px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}
.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--ink);
  color: #f7f4ee;
  padding: 13px 20px;
  border-radius: var(--radius);
  font-size: 13px;
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
  cursor: pointer;
  max-width: 340px;
}
.toast--error { background: var(--danger); color: #fff; }
.toast--info { background: var(--gold); color: #fff; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s var(--ease); }
.toast-enter-from { opacity: 0; transform: translateX(24px); }
.toast-leave-to { opacity: 0; transform: translateX(24px); }
</style>
