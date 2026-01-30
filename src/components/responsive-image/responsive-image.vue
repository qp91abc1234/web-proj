<script setup lang="ts">
import { cdnBase } from './setupResponseImage'

/**
 * ResponsiveImage - 响应式图片组件
 *
 * 功能：
 * - 自动生成多种格式（AVIF/WebP/JPG）
 * - 自动生成多种尺寸（响应式）
 * - 支持懒加载
 * - 支持 CDN 路径
 *
 * 使用示例：
 *
 * 1. 基础用法
 * <responsive-image src="/images/banner" alt="横幅" />
 *
 * 2. 自定义尺寸断点
 * <responsive-image
 *   src="/images/product"
 *   :widths="[200, 400, 800]"
 *   sizes="(max-width: 600px) 200px, 400px"
 * />
 *
 * 3. 禁用某些格式
 * <responsive-image src="/images/photo" :formats="['avif', 'webp']" />
 *
 * 4. 关键图片（不懒加载）
 * <responsive-image src="/images/hero" :lazy="false" />
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 图片基础路径（不含宽度和格式后缀） */
    src: string
    /** 图片描述 */
    alt?: string
    /** 图片格式列表 */
    formats?: string[]
    /** 降级方案格式 */
    fallbackFormat?: string
    /** 图片宽度断点 */
    widths?: number[]
    /** sizes 属性 */
    sizes?: string
    /** 是否懒加载 */
    lazy?: boolean
    /** 图片类名 */
    imgClass?: string
    /** 图片样式 */
    imgStyle?: Record<string, string>
  }>(),
  {
    alt: '',
    widths: undefined,
    formats: () => ['avif', 'webp'],
    fallbackFormat: 'png',
    sizes: undefined,
    lazy: true,
    imgClass: '',
    imgStyle: undefined
  }
)

const emit = defineEmits<{
  load: [Event]
  error: [Error]
}>()

/**
 * 生成完整的图片路径
 */
const getImageUrl = (baseSrc: string, format: string, width?: number): string => {
  const widthSuffix = width ? '-' + width + 'w' : ''

  // 如果是完整的 URL，直接使用
  if (baseSrc.startsWith('http://') || baseSrc.startsWith('https://')) {
    return `${baseSrc}${widthSuffix}.${format}`
  }

  const fullBase = cdnBase ? `${cdnBase}${baseSrc}` : baseSrc
  return `${fullBase}${widthSuffix}.${format}`
}

/**
 * 生成 srcset 字符串
 */
const generateSrcset = (format: string): string => {
  if (props.widths && props.widths.length > 0) {
    return props.widths
      .map((width) => `${getImageUrl(props.src, format, width)} ${width}w`)
      .join(', ')
  }
  return `${getImageUrl(props.src, format)}`
}

/**
 * 获取降级方案的图片地址（使用最小宽度的 png）
 */
const fallbackSrc = computed(() => {
  if (props.widths && props.widths.length > 0) {
    const minWidth = Math.min(...props.widths)
    return getImageUrl(props.src, props.fallbackFormat, minWidth)
  }
  return getImageUrl(props.src, props.fallbackFormat)
})

/**
 * 获取 MIME 类型
 */
const getMimeType = (format: string): string => {
  const mimeTypes: Record<string, string> = {
    avif: 'image/avif',
    webp: 'image/webp',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png'
  }
  return mimeTypes[format] || `image/${format}`
}

const handleLoad = (e: Event) => {
  emit('load', e)
}

const handleError = (e: Event) => {
  const error = new Error('Image load failed')
  // 保留原始事件信息
  if (e.target instanceof HTMLImageElement) {
    error.message = `Image load failed: ${e.target.src}`
  }
  // 将原始事件附加到错误对象上，方便调试
  ;(error as any).originalEvent = e
  emit('error', error)
}
</script>

<template>
  <picture class="responsive-image">
    <!-- 不同格式的 source，png 作为降级方案放在 img 标签中 -->
    <source
      v-for="format in formats.filter((f) => f !== fallbackFormat)"
      :key="format"
      :type="getMimeType(format)"
      :srcset="generateSrcset(format)"
      :sizes="sizes"
    />

    <!-- 降级方案 -->
    <img
      :src="fallbackSrc"
      :srcset="generateSrcset(fallbackFormat)"
      :sizes="sizes"
      :alt="alt"
      :loading="lazy ? 'lazy' : 'eager'"
      :class="imgClass"
      :style="imgStyle"
      @load="handleLoad"
      @error="handleError"
    />
  </picture>
</template>

<style lang="scss" scoped>
.responsive-image {
  display: inline-block;
  line-height: 0;

  img {
    display: block;
    max-width: 100%;
    height: auto;
  }
}
</style>
