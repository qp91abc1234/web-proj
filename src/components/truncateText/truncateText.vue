<script setup lang="ts">
import { ref } from 'vue'

import { vTextTruncated } from './vTextTruncated'

withDefaults(
  defineProps<{
    content: string
    placement?: string
    tooltip?: boolean
  }>(),
  {
    content: '',
    placement: 'right',
    tooltip: true
  }
)

const isTruncated = ref(true)
</script>

<template>
  <el-tooltip :placement="placement" :disabled="!tooltip || !isTruncated" :content="content">
    <span class="truncate" v-textTruncated="(val) => (isTruncated = val)">
      {{ content }}
    </span>
  </el-tooltip>
</template>

<style lang="scss" scoped></style>
