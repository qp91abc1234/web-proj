<script setup lang="ts">
/**
 * ResponsiveImage - 响应式图片组件
 *
 * 功能：
 * - 自动生成多种格式（AVIF/WebP/PNG）
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
 * 3. 指定高级格式与 Retina 倍率
 * <responsive-image src="/images/photo.png" :formats="['avif', 'webp']" :retinas="[1, 2, 3]" />
 */
import { computed, type CSSProperties } from 'vue'
import { useResponseImage } from './use-response-image'

const { getParam } = useResponseImage()

const props = withDefaults(
  defineProps<{
    /** 图片路径 */
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
    /** 图片样式 */
    imgStyle?: CSSProperties
  }>(),
  {
    disabled: undefined,
    cdnBase: '',
    formats: undefined,
    widths: undefined,
    retinas: undefined,
    sizes: undefined,
    getImageUrl: undefined,
    lazy: true,
    imgStyle: () => ({})
  }
)

const emit = defineEmits<{
  load: [Event]
  error: [Error]
}>()

const parsedDisabled = computed(() => {
  return props.disabled ?? getParam('disabled') ?? false
})

const parsedCdnBase = computed(() => {
  return props.cdnBase ?? getParam('cdnBase') ?? ''
})

const parsedFormats = computed(() => {
  if (parsedDisabled.value) {
    return []
  }
  return props.formats || getParam('formats') || []
})

const parsedWidths = computed(() => {
  if (parsedDisabled.value) {
    return []
  }
  return props.widths || getParam('widths') || []
})

const parsedRetinas = computed(() => {
  if (parsedDisabled.value) {
    return []
  }
  return props.retinas || getParam('retinas') || []
})

const parsedSizes = computed(() => {
  if (parsedDisabled.value) {
    return undefined
  }
  return props.sizes || getParam('sizes') || undefined
})

const parsedGetImageUrl = computed(() => {
  const fallback = (src: string) => src
  if (parsedDisabled.value) {
    return fallback
  }
  return props.getImageUrl || getParam('getImageUrl') || fallback
})

const parsedSrc = computed(() => {
  const cdnBase = parsedCdnBase.value
  let src = props.src
  let fallbackFormat = 'png'

  if (src) {
    src = src.split('?')[0]
    if (!src.startsWith('http://') && !src.startsWith('https://')) {
      src = cdnBase ? `${cdnBase}${src}` : src
    }
    const lastDot = src.lastIndexOf('.')
    if (lastDot !== -1) {
      fallbackFormat = src.slice(lastDot + 1).toLowerCase()
    }
  }

  return {
    src,
    fallbackFormat
  }
})

const fallbackSrc = computed(() => {
  const { src, fallbackFormat } = parsedSrc.value
  const widths = parsedWidths.value
  const retinas = parsedRetinas.value

  if (widths.length <= 0 && retinas.length > 0) {
    const minRetina = Math.min(...retinas)
    const maxRetina = Math.max(...retinas)
    const scale = minRetina / maxRetina
    return parsedGetImageUrl.value(src, fallbackFormat, scale)
  }

  const allWidths = new Set<number>()
  widths.forEach((width) => {
    if (retinas.length > 0) {
      retinas.forEach((retina) => {
        allWidths.add(width * retina)
      })
    } else {
      allWidths.add(width)
    }
  })

  if (allWidths.size > 0) {
    const minWidth = Math.min(...Array.from(allWidths))
    const maxWidth = Math.max(...Array.from(allWidths))
    const scale = minWidth / maxWidth
    return parsedGetImageUrl.value(src, fallbackFormat, scale)
  }

  return parsedGetImageUrl.value(src, fallbackFormat, 1)
})

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

const generateSrcset = (format: string): string => {
  const { src } = parsedSrc.value
  const widths = parsedWidths.value
  const retinas = parsedRetinas.value

  if (widths.length <= 0 && retinas.length > 0) {
    const maxRetina = Math.max(...parsedRetinas.value)
    return retinas
      .map((retina) => `${parsedGetImageUrl.value(src, format, retina / maxRetina)} ${retina}x`)
      .join(', ')
  }

  const allWidths = new Set<number>()
  widths.forEach((width) => {
    if (retinas.length > 0) {
      retinas.forEach((retina) => {
        allWidths.add(width * retina)
      })
    } else {
      allWidths.add(width)
    }
  })

  if (allWidths.size > 0) {
    const maxWidth = Math.max(...Array.from(allWidths))
    return Array.from(allWidths)
      .map((width) => `${parsedGetImageUrl.value(src, format, width / maxWidth)} ${width}w`)
      .join(', ')
  }

  return parsedGetImageUrl.value(src, format, 1)
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
  <picture>
    <!-- 不同格式的 source，降级格式由 src 后缀决定，放在 img 中 -->
    <source
      v-for="format in parsedFormats.filter((f) => f !== parsedSrc.fallbackFormat)"
      :key="format"
      :type="getMimeType(format)"
      :srcset="generateSrcset(format)"
      :sizes="parsedSizes"
    />

    <!-- 降级方案 -->
    <img
      :style="{
        width: '100%',
        height: '100%',
        objectPosition: 'center',
        ...imgStyle
      }"
      :src="fallbackSrc"
      :srcset="generateSrcset(parsedSrc.fallbackFormat)"
      :sizes="parsedSizes"
      :loading="lazy ? 'lazy' : 'eager'"
      @load="handleLoad"
      @error="handleError"
    />
  </picture>
</template>

<style lang="scss" scoped></style>
