<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
    stacked?: boolean
    theme?: 'light' | 'dark'
    sublabel?: string
  }>(),
  {
    size: 'md',
    stacked: false,
    theme: 'dark',
    sublabel: 'OPWATCH OFFICIAL'
  }
)
</script>

<template>
  <span class="opcrest" :class="[`opcrest--${size}`, `opcrest--${theme}`, { 'opcrest--stacked': stacked }]">
    <!-- Authentic Olym Pianus Crowned Heraldic Shield Emblem -->
    <svg
      class="opcrest__shield"
      viewBox="0 0 64 76"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <!-- 5-point Horological Crown -->
      <path
        d="M15 19L12 8.5L22 14L32 5.5L42 14L52 8.5L49 19H15Z"
        stroke="currentColor"
        stroke-width="2.1"
        stroke-linejoin="round"
      />
      <circle cx="12" cy="6.5" r="1.7" fill="currentColor" />
      <circle cx="32" cy="3.8" r="2" fill="currentColor" />
      <circle cx="52" cy="6.5" r="1.7" fill="currentColor" />
      <!-- Heraldic Shield -->
      <path
        d="M14 23H50V44.5C50 56.5 41.5 65.2 32 70.5C22.5 65.2 14 56.5 14 44.5V23Z"
        stroke="currentColor"
        stroke-width="2.3"
        stroke-linejoin="round"
      />
      <path
        d="M18.2 27H45.8V44C45.8 53.6 39 60.8 32 65.4C25 60.8 18.2 53.6 18.2 44V27Z"
        stroke="currentColor"
        stroke-width="1"
        opacity="0.55"
      />
      <!-- Vertical OP Monogram inside Shield -->
      <ellipse cx="26.2" cy="45" rx="4.8" ry="10.2" stroke="currentColor" stroke-width="2.2" />
      <path
        d="M35.2 55.2V34.8H40.2C43 34.8 44.6 36.8 44.6 39.8C44.6 42.8 43 44.8 40.2 44.8H35.2"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <span class="opcrest__words">
      <span class="opcrest__script">Olym Pianus</span>
      <span v-if="sublabel" class="opcrest__sub">{{ sublabel }}</span>
    </span>
  </span>
</template>

<style scoped>
.opcrest {
  display: inline-flex;
  align-items: center;
  gap: 13px;
  user-select: none;
  transition: color 0.3s var(--ease);
}
.opcrest--stacked {
  flex-direction: column;
  text-align: center;
  gap: 11px;
}
.opcrest__shield {
  flex-shrink: 0;
  transition: color 0.3s var(--ease);
}

/* Dark theme (over dark hero imagery) */
.opcrest--dark .opcrest__shield { color: #ffffff; }
.opcrest--dark .opcrest__script { color: #ffffff; }
.opcrest--dark .opcrest__sub { color: #ffffff; }

/* Light theme (on #ffffff header, #f8f8f8 story, #f0f0f0 footer — exact olympianus.com Royal Sapphire & Midnight) */
.opcrest--light .opcrest__shield { color: var(--sapphire); }
.opcrest--light .opcrest__script { color: var(--ink); }
.opcrest--light .opcrest__sub { color: var(--sapphire); }

.opcrest--sm .opcrest__shield { width: 27px; height: 32px; }
.opcrest--md .opcrest__shield { width: 34px; height: 40px; }
.opcrest--lg .opcrest__shield { width: 58px; height: 68px; }

.opcrest__words {
  display: flex;
  flex-direction: column;
  line-height: 1.04;
}
.opcrest__script {
  font-family: var(--font-script);
  letter-spacing: 0.025em;
  white-space: nowrap;
  transition: color 0.3s var(--ease);
}
.opcrest--sm .opcrest__script { font-size: 26px; }
.opcrest--md .opcrest__script { font-size: 32px; }
.opcrest--lg .opcrest__script { font-size: 50px; }

.opcrest__sub {
  font-family: var(--font-roman);
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  margin-top: 2px;
  transition: color 0.3s var(--ease);
}
.opcrest--lg .opcrest__sub {
  font-size: 10px;
  letter-spacing: 0.38em;
  margin-top: 6px;
}
</style>
