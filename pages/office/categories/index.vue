<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })
const localePath = useLocalePath()
onMounted(() => {
  navigateTo(localePath('/office/brands'))
})
</script>

<template>
  <div class="erp-panel">กำลังนำทางไปยังหน้าจัดการแบรนด์และหมวดหมู่สินค้า...</div>
</template>
