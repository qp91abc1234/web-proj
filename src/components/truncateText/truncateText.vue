<script setup lang="ts">
/**
 * TruncateText - 文本截断组件
 *
 * 使用示例：
 *
 * 1. 基础用法（多行截断 + Tooltip）
 * <truncate-text :lines="2" >
 *   这是一段比较长的文案，当超过 2 行时会自动截断，并在 hover 时展示完整内容。
 * </truncate-text>
 *
 * 2. 自定义 Tooltip 内容
 * <truncate-text :lines="1" >
 *   <template #default>
 *     只显示一行的标题，超出部分省略号展示
 *   </template>
 *   <template #tooltip-content>
 *     这里是自定义的 tooltip 内容，可以放更详细的说明
 *   </template>
 * </truncate-text>
 */
import { ref, computed, useSlots } from 'vue'

import { vTextTruncated } from './vTextTruncated'

const props = withDefaults(
  defineProps<{
    placement?: string
    tooltip?: boolean
    lines?: number // 显示行数，默认1行
  }>(),
  {
    placement: undefined,
    tooltip: true,
    lines: 1
  }
)

const slots = useSlots()
const isTruncated = ref(true)

// 根据行数计算样式类名
const truncateClass = computed(() => {
  return props.lines === 1 ? 'truncate-single' : 'truncate-multiple'
})

// 判断是否存在 tooltip-content 插槽
const hasTooltipContent = computed(() => {
  return !!slots['tooltip-content']
})
</script>

<template>
  <div>
    <el-tooltip :placement="placement" :disabled="!tooltip || !isTruncated">
      <template #content>
        <!-- 如果提供了 tooltip-content 插槽则使用，否则使用默认插槽内容 -->
        <slot v-if="hasTooltipContent" name="tooltip-content"></slot>
        <slot v-else></slot>
      </template>
      <div
        :class="truncateClass"
        :style="{ '-webkit-line-clamp': lines }"
        v-textTruncated="{ callback: (val) => (isTruncated = val), lines }"
      >
        <!-- 显示主要内容 -->
        <slot></slot>
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
