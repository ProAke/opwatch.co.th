<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })
useHead({ title: 'เพิ่มสินค้าใหม่ / ดึงจาก Shopee — OPWatch Office' })
</script>

<template>
  <OfficeProductEditorForm :product-id="null" />
</template>
