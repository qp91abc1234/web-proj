<script setup lang="ts">
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
 * 1. 基础用法（src 带后缀，后缀为降级格式）
 * <responsive-image src="/images/banner.png" alt="横幅" />
 *
 * 2. 自定义尺寸断点
 * <responsive-image
 *   src="/images/product.png"
 *   :widths="[200, 400, 800]"
 *   sizes="(max-width: 600px) 200px, 400px"
 * />
 *
 * 3. 禁用某些格式（仅用降级格式）
 * <responsive-image src="/images/photo.png" :formats="['avif', 'webp']" />
 *
 * 4. 关键图片（不懒加载）
 * <responsive-image src="/images/hero.png" :lazy="false" />
 */
import { computed, useAttrs } from 'vue'
import { useResponseImage } from './use-response-image'

const attrs = useAttrs()

const { getParam } = useResponseImage()

const props = withDefaults(
  defineProps<{
    /** 图片路径（需带后缀，后缀为降级格式，如 .png；解析后前半部分为 baseSrc） */
    src: string
    /** CDN 基础路径 */
    cdnBase?: string
    /** 图片格式列表 */
    formats?: string[]
    /** 图片宽度断点 */
    widths?: number[]
    /** sizes 属性 */
    sizes?: string
    /** 是否懒加载 */
    lazy?: boolean
  }>(),
  {
    cdnBase: '',
    formats: undefined,
    widths: undefined,
    sizes: undefined,
    lazy: true
  }
)

defineOptions({ inheritAttrs: false })

const emit = defineEmits<{
  load: [Event]
  error: [Error]
}>()

/**
 * 解析 src：带后缀的路径 → { baseSrc, fallbackFormat }
 * 后缀为降级格式（如 .png），前面内容为 baseSrc，用于拼接多格式/多尺寸 URL
 */
const parsedSrc = computed(() => {
  const src = props.src
  if (!src) {
    return { baseSrc: '', fallbackFormat: 'png' }
  }
  const pathOnly = src.split('?')[0]
  const lastDot = pathOnly.lastIndexOf('.')
  if (lastDot === -1) {
    return { baseSrc: src, fallbackFormat: 'png' }
  }
  const baseSrc = pathOnly.slice(0, lastDot)
  const fallbackFormat = pathOnly.slice(lastDot + 1).toLowerCase()
  return { baseSrc, fallbackFormat }
})

/**
 * 获取降级方案的图片地址（使用最小宽度的 fallback 格式）
 */
const fallbackSrc = computed(() => {
  const { baseSrc, fallbackFormat } = parsedSrc.value
  if (props.widths && props.widths.length > 0) {
    const minWidth = Math.min(...props.widths)
    return getImageUrl(baseSrc, fallbackFormat, minWidth)
  }
  return getImageUrl(baseSrc, fallbackFormat)
})

const parsedCdnBase = computed(() => {
  return props.cdnBase || getParam('cdnBase')
})

const parsedFormats = computed(() => {
  return props.formats || getParam('formats')
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

/**
 * 生成完整的图片路径
 */
const getImageUrl = (baseSrc: string, format: string, width?: number): string => {
  const widthSuffix = width ? `-${width}w` : ''

  // 如果是完整的 URL，直接使用
  if (baseSrc.startsWith('http://') || baseSrc.startsWith('https://')) {
    return `${baseSrc}${widthSuffix}.${format}`
  }

  const fullBase = parsedCdnBase.value ? `${parsedCdnBase.value}${baseSrc}` : baseSrc
  return `${fullBase}${widthSuffix}.${format}`
}

/**
 * 生成 srcset 字符串
 */
const generateSrcset = (format: string): string => {
  const { baseSrc } = parsedSrc.value
  if (props.widths && props.widths.length > 0) {
    return props.widths
      .map((width) => `${getImageUrl(baseSrc, format, width)} ${width}w`)
      .join(', ')
  }
  return `${getImageUrl(baseSrc, format)}`
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
    <!-- 不同格式的 source，降级格式由 src 后缀决定，放在 img 中 -->
    <source
      v-for="format in parsedFormats.filter((f) => f !== parsedSrc.fallbackFormat)"
      :key="format"
      :type="getMimeType(format)"
      :srcset="generateSrcset(format)"
      :sizes="sizes"
    />

    <!-- 降级方案 -->
    <img
      v-bind="attrs"
      :src="fallbackSrc"
      :srcset="generateSrcset(parsedSrc.fallbackFormat)"
      :sizes="sizes"
      :loading="lazy ? 'lazy' : 'eager'"
      @load="handleLoad"
      @error="handleError"
    />
  </picture>
</template>

<style lang="scss" scoped></style>
