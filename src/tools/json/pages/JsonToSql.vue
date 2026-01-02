<script setup lang="ts">
import CodeEditor from '@/common/components/CodeEditor.vue'

const sqlValue = ref<string>('')
</script>

<template>
  <code-editor v-model="sqlValue" language="sql" />
</template>

<style scoped></style>
