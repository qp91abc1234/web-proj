<script setup lang="ts">
import { ref, computed, useAttrs } from 'vue'

import { vTextTruncated } from './vTextTruncated'

// 注意：由于根元素是 el-tooltip（它自己禁用了 inheritAttrs）
// 所以这里禁不禁用 inheritAttrs 其实没有区别
// 但为了代码清晰，明确表示"我们要手动控制 class 的应用位置"，还是建议禁用
defineOptions({
  inheritAttrs: false
})

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

const attrs = useAttrs()
const isTruncated = ref(true)

// 根据行数计算样式类名，合并外部传入的 class
const truncateClass = computed(() => {
  const baseClass = props.lines === 1 ? 'truncate-single' : 'truncate-multiple'
  // 合并外部传入的 class
  const externalClass = attrs.class || ''
  return [baseClass, externalClass].filter(Boolean).join(' ')
})

// 计算合并后的 style
const truncateStyle = computed(() => {
  return {
    '-webkit-line-clamp': props.lines,
    ...((attrs.style as Record<string, any>) || {})
  }
})
</script>

<template>
  <el-tooltip :placement="placement" :disabled="!tooltip || !isTruncated" :content="content">
    <template #content> <slot name="content"></slot> </template>
    <span
      :class="truncateClass"
      :style="truncateStyle"
      v-textTruncated="{ callback: (val) => (isTruncated = val), lines }"
    >
      {{ content }}
    </span>
  </el-tooltip>
</template>

<style lang="scss" scoped>
/* 单行截断 */
.truncate-single {
  display: inline-block;
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
