type ImageFormatSupport = {
  avif: boolean
  webp: boolean
}

let _imageFormatSupportPromise: Promise<ImageFormatSupport> | null = null

function detectImageFormatByDataUri(dataUri: string): Promise<boolean> {
  return new Promise((resolve) => {
    // SSR / 非浏览器环境
    if (typeof Image === 'undefined') return resolve(false)

    const img = new Image()
    img.onload = () => resolve(img.width > 0 && img.height > 0)
    img.onerror = () => resolve(false)
    img.src = dataUri
  })
}

/**
 * 检测浏览器对图片格式的支持情况（带缓存）。
 */
export function detectImageFormatSupport(): Promise<ImageFormatSupport> {
  if (_imageFormatSupportPromise) return _imageFormatSupportPromise

  // 1x1 AVIF / WebP data URI（用于快速探测）
  const avifDataUri =
    'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAG1pZjFhdmlmAAAAAG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAtaWxvYwAAAAAAAQABAAAAAAABAAEAAAABAAEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAABAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
  const webpDataUri =
    'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA='

  _imageFormatSupportPromise = Promise.all([
    detectImageFormatByDataUri(avifDataUri),
    detectImageFormatByDataUri(webpDataUri)
  ]).then(([avif, webp]) => ({ avif, webp }))

  return _imageFormatSupportPromise
}

/**
 * 探测 AVIF/WebP 支持并给根节点添加 class：
 * - 支持则加 `.avif` / `.webp`
 * - 不支持则加 `.no-avif` / `.no-webp`
 *
 * 说明：
 * - 常用于 background-image 的格式切换（配合 SCSS：`.avif & { ... }` / `.webp & { ... }`）
 * - 函数为异步：建议在应用启动时调用一次（如 main.ts）
 */
export async function applyImageFormatClasses(
  opts: { element?: HTMLElement } = {}
): Promise<ImageFormatSupport> {
  const { element = document.documentElement } = opts

  // SSR / 非浏览器环境
  if (typeof document === 'undefined' || !element?.classList) {
    return { avif: false, webp: false }
  }

  const support = await detectImageFormatSupport()

  const avifClass = `avif`
  const webpClass = `webp`

  // 清理旧标记（避免重复调用产生脏数据）
  element.classList.remove(avifClass, webpClass)

  if (support.avif) element.classList.add(avifClass)
  if (support.webp) element.classList.add(webpClass)

  return support
}
