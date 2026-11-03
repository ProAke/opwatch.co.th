<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })
const localePath = useLocalePath()
onMounted(() => {
  navigateTo(localePath('/office/staff'))
})
</script>

<template>
  <div class="erp-panel">กำลังนำทางไปยังหน้าบริหารงานเจ้าหน้าที่และสมาชิก...</div>
</template>
