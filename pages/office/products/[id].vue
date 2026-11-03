<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })
const route = useRoute()
const id = computed(() => Number(route.params.id))
useHead({ title: 'แก้ไขข้อมูลสินค้า — OPWatch Office' })
</script>

<template>
  <OfficeProductEditorForm :product-id="id" />
</template>
