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
    placement: '',
    tooltip: true
  }
)

const isTruncated = ref(true)
</script>

<template>
  <div>
    <el-tooltip :placement="placement" :disabled="!tooltip || !isTruncated" :content="content">
      <template #content> <slot name="content"></slot> </template>
      <span class="truncate" v-textTruncated="(val) => (isTruncated = val)">
        {{ content }}
      </span>
    </el-tooltip>
  </div>
</template>

<style lang="scss" scoped>
.truncate {
  display: inline-block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
