<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
    stacked?: boolean
    sublabel?: string
  }>(),
  {
    size: 'md',
    stacked: false,
    sublabel: 'OPWATCH OFFICIAL'
  }
)
</script>

<template>
  <span class="opcrest" :class="[`opcrest--${size}`, { 'opcrest--stacked': stacked }]">
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
  gap: 12px;
  color: inherit;
  user-select: none;
}
.opcrest--stacked {
  flex-direction: column;
  text-align: center;
  gap: 10px;
}
.opcrest__shield {
  color: var(--gold);
  flex-shrink: 0;
}
.opcrest--sm .opcrest__shield { width: 26px; height: 31px; }
.opcrest--md .opcrest__shield { width: 32px; height: 38px; }
.opcrest--lg .opcrest__shield { width: 54px; height: 64px; }

.opcrest__words {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
}
.opcrest__script {
  font-family: var(--font-script);
  color: #ffffff;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.opcrest--sm .opcrest__script { font-size: 24px; }
.opcrest--md .opcrest__script { font-size: 29px; }
.opcrest--lg .opcrest__script { font-size: 46px; }

.opcrest__sub {
  font-family: var(--font-geo);
  font-size: 8.5px;
  font-weight: 500;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: var(--gold);
  margin-top: 2px;
}
.opcrest--lg .opcrest__sub {
  font-size: 10px;
  letter-spacing: 0.38em;
  margin-top: 5px;
}
</style>
