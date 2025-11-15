<script setup lang="ts">
import { ref, computed } from 'vue'

import { vTextTruncated } from './vTextTruncated'

const props = withDefaults(
  defineProps<{
    content: string
    placement?: string
    tooltip?: boolean
    lines?: number // 显示行数，默认1行
  }>(),
  {
    content: '',
    placement: '',
    tooltip: true,
    lines: 1
  }
)

const isTruncated = ref(true)

// 根据行数计算样式类名
const truncateClass = computed(() => {
  return props.lines === 1 ? 'truncate-single' : 'truncate-multiple'
})
</script>

<template>
  <div>
    <el-tooltip :placement="placement" :disabled="!tooltip || !isTruncated" :content="content">
      <template #content> <slot name="content"></slot> </template>
      <div
        :class="truncateClass"
        :style="{ '-webkit-line-clamp': lines }"
        v-textTruncated="{ callback: (val) => (isTruncated = val), lines }"
      >
        {{ content }}
      </div>
    </el-tooltip>
  </div>
</template>

<style lang="scss" scoped>
/* 单行截断 */
.truncate-single {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 多行截断 */
.truncate-multiple {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all; /* 强制换行 */
}
</style>
