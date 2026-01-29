<script setup lang="ts">
/**
 * NinePatchImage - 九切图组件
 *
 * 功能：
 * - 支持九切图（9-patch）技术，保持边角清晰
 * - 适用于按钮背景、对话框、卡片边框等 UI 元素
 * - 纯 CSS 实现，轻量高效
 *
 * 使用示例：
 *
 * 1. 基础用法（CSS border-image 方式）
 * <nine-patch-image
 *   src="/images/button-bg.png"
 *   :width="200"
 *   :height="50"
 *   :slice="[10, 10, 10, 10]"
 * />
 *
 * 3. 自定义内容
 * <nine-patch-image src="/images/card-bg.png" :width="300" :height="200">
 *   <div class="content">卡片内容</div>
 * </nine-patch-image>
 */
import { computed } from 'vue'
import { normalizeCssSize } from '@/common/utils/css'

const props = withDefaults(
  defineProps<{
    /** 图片路径 */
    src: string
    /** 目标宽度（px） */
    width?: number | string
    /** 目标高度（px） */
    height?: number | string
    /** 九切图切割位置（单位 px）。支持：number（四边相同）或 [top, right, bottom, left] */
    slice: number | [number, number, number, number]
    /** 是否填充中间区域 */
    fill?: boolean
  }>(),
  {
    fill: true
  }
)

const normalizedSlice = computed<[number, number, number, number]>(() => {
  const s = props.slice
  return typeof s === 'number' ? [s, s, s, s] : s
})

/**
 * border-image 模式的样式
 */
const borderImageStyle = computed(() => {
  const [top, right, bottom, left] = normalizedSlice.value
  const fillValue = props.fill ? ' fill' : ''

  return {
    width: normalizeCssSize(props.width),
    height: normalizeCssSize(props.height),
    borderStyle: 'solid',
    borderWidth: `${top}px ${right}px ${bottom}px ${left}px`,
    borderImageSource: `url(${props.src})`,
    borderImageSlice: `${top} ${right} ${bottom} ${left}${fillValue}`,
    borderImageRepeat: 'stretch',
    borderImageWidth: `${top}px ${right}px ${bottom}px ${left}px`
  }
})
</script>

<template>
  <!-- border-image 模式 -->
  <div class="nine-patch-border" :style="borderImageStyle">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.nine-patch-border {
  position: relative;
  box-sizing: border-box;
  display: inline-block;
}
</style>
