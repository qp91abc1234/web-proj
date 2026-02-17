<script setup lang="ts">
/**
 * ResponsiveBackground - 响应式背景组件
 *
 * 基于 ResponsiveImage，将图片作为背景层铺满容器，插槽内容叠在上层；图片层 pointer-events: none，不挡点击。
 * 图片相关 props（src/cdnBase/formats/widths/retinas/sizes/lazy）与 ResponsiveImage 一致。
 *
 * 使用示例：
 *
 * 1. 基础用法（铺满容器，默认 object-fit: cover / object-position: center）
 * <responsive-background src="bgUrl" class="my-page">
 *   <div>页面内容</div>
 * </responsive-background>
 *
 * 2. 自定义背景样式（如 objectFit / objectPosition）
 * <responsive-background
 *   :src="bgUrl"
 *   :bg-style="{ objectFit: 'contain', objectPosition: 'right bottom' }"
 * >
 *   <div>页面内容</div>
 * </responsive-background>
 */
import type { CSSProperties } from 'vue'
import ResponsiveImage from './responsive-image.vue'

withDefaults(
  defineProps<{
    /** 图片路径（与 ResponsiveImage 一致） */
    src: string
    /** 是否禁用 */
    disabled?: boolean
    /** CDN 基础路径 */
    cdnBase?: string
    /** 图片格式列表 */
    formats?: string[]
    /** 图片宽度断点 */
    widths?: number[]
    /** 像素密度倍数，用于和 widths 组合生成最终断点 */
    retinas?: number[]
    /** sizes 属性 */
    sizes?: string
    /** 获取图片 URL 的函数 */
    getImageUrl?: (src: string, format: string, scale: number) => string
    /** 是否懒加载 */
    lazy?: boolean
    /** 背景样式 */
    bgStyle?: CSSProperties
  }>(),
  {
    bgStyle: undefined
  }
)
</script>

<template>
  <div class="responsive-background">
    <responsive-image
      class="responsive-background-image"
      :img-style="bgStyle"
      :src="src"
      :disabled="disabled"
      :cdn-base="cdnBase"
      :formats="formats"
      :widths="widths"
      :retinas="retinas"
      :sizes="sizes"
      :get-image-url="getImageUrl"
      :lazy="lazy"
    />

    <div class="responsive-background-content">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.responsive-background {
  position: relative;
  overflow: hidden;
}

.responsive-background-image {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.responsive-background-content {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
}
</style>
