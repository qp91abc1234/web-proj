import ansi from 'ansi-colors'
import type { Plugin, ResolvedConfig } from 'vite'
import type {
  ViteImgUploadOptions,
  OutputBundle,
  OutputAsset,
  OutputChunk
} from '../types/viteImgUpload'
import { createLogger } from '../utils/logger'
import { CacheManager } from './cache'
import {
  isMatch,
  createImagePattern,
  createCssUrlPattern,
  uploadWithConcurrencyLimit
} from './utils'

export default function viteImgUpload(options: ViteImgUploadOptions): Plugin {
  const {
    enable = true,
    include,
    exclude,
    upload,
    removeAfterUpload = true,
    concurrency = 5,
    cache = true,
    cacheFile = 'node_modules/.vite-img-upload-cache.json'
  } = options

  const logger = createLogger(false)
  let viteConfig: ResolvedConfig
  let cacheManager: CacheManager

  if (!upload) {
    throw new Error('[vite-plugin-img-upload] upload 函数是必需的')
  }

  // 上传所有图片并返回文件名到 URL 的映射
  async function uploadImages(bundle: OutputBundle): Promise<{
    fileUrlMap: Map<string, string>
    uploadedCount: number
    cachedCount: number
  }> {
    const fileUrlMap = new Map<string, string>()
    let uploadedCount = 0
    let cachedCount = 0

    // 收集所有需要上传的图片任务
    const uploadTasks: Array<() => Promise<void>> = []

    for (const key of Object.keys(bundle)) {
      const item = bundle[key] as OutputAsset

      // 过滤非 Asset 或非图片文件
      if (item.type !== 'asset' || !isMatch(item.fileName, include, exclude)) continue

      const originalSource = item.source
      const buffer = Buffer.isBuffer(originalSource) ? originalSource : Buffer.from(originalSource)

      // 计算文件内容哈希
      const contentHash = cacheManager.getContentHash(buffer)

      // 检查缓存
      const cachedUrl = cacheManager.get(contentHash)
      if (cachedUrl) {
        fileUrlMap.set(item.fileName, cachedUrl)
        cachedCount++
        logger(
          'verbose',
          'img-upload',
          `使用缓存: ${ansi.cyan(item.fileName)} -> ${ansi.green(cachedUrl)}`,
          true
        )
        continue
      }

      // 创建上传任务函数（不立即执行）
      const uploadTask = async () => {
        try {
          const url = await upload(item.fileName, buffer)

          // 检查返回的 URL 是否有效
          if (!url || typeof url !== 'string' || url.trim() === '') {
            logger('error', 'img-upload', `上传失败: ${item.fileName} (未返回有效的 URL)`)
            return
          }

          fileUrlMap.set(item.fileName, url)
          uploadedCount++
          // 更新缓存
          cacheManager.set(contentHash, url)
          logger(
            'verbose',
            'img-upload',
            `上传成功: ${ansi.cyan(item.fileName)} -> ${ansi.green(url)}`,
            true
          )
        } catch (error) {
          logger('error', 'img-upload', `上传失败: ${item.fileName}`)
          console.error(error)
        }
      }

      uploadTasks.push(uploadTask)
    }

    // 使用并发控制执行所有上传任务
    if (uploadTasks.length > 0) {
      logger('info', 'img-upload', `需上传 ${uploadTasks.length} 张图片，并发数: ${concurrency}`)
      await uploadWithConcurrencyLimit(uploadTasks, concurrency)
    }

    return { fileUrlMap, uploadedCount, cachedCount }
  }

  // 替换 JS/TS chunk 中的图片引用
  function replaceReferencesInChunks(
    bundle: OutputBundle,
    fileUrlMap: Map<string, string>
  ): number {
    let replacedCount = 0

    for (const key of Object.keys(bundle)) {
      const item = bundle[key]
      if (item.type !== 'chunk') continue

      const chunk = item as OutputChunk
      let code = chunk.code
      let hasReplaced = false

      // 遍历所有上传的图片，替换引用
      fileUrlMap.forEach((url, fileName) => {
        const pattern = createImagePattern(fileName)
        const newCode = code.replace(pattern, `$1${url}$1`)
        if (newCode !== code) {
          code = newCode
          hasReplaced = true
        }
      })

      if (hasReplaced) {
        chunk.code = code
        replacedCount++
      }
    }

    return replacedCount
  }

  // 替换 CSS 等资源文件中的图片引用
  function replaceReferencesInAssets(
    bundle: OutputBundle,
    fileUrlMap: Map<string, string>
  ): number {
    let replacedCount = 0

    for (const key of Object.keys(bundle)) {
      const item = bundle[key]
      if (item.type !== 'asset') continue

      const asset = item as OutputAsset
      if (!asset.fileName.endsWith('.css')) continue

      let source = asset.source.toString()
      let hasReplaced = false

      fileUrlMap.forEach((url, fileName) => {
        const pattern = createCssUrlPattern(fileName)
        const newSource = source.replace(pattern, `url($1${url}$1)`)
        if (newSource !== source) {
          source = newSource
          hasReplaced = true
        }
      })

      if (hasReplaced) {
        asset.source = source
        replacedCount++
      }
    }

    return replacedCount
  }

  // 从 bundle 中移除已上传的图片文件
  function removeImagesFromBundle(bundle: OutputBundle, fileUrlMap: Map<string, string>): number {
    const removedFiles: string[] = []

    fileUrlMap.forEach((_, fileName) => {
      for (const key of Object.keys(bundle)) {
        if (bundle[key].fileName === fileName) {
          delete bundle[key]
          removedFiles.push(fileName)
          break
        }
      }
    })

    if (removedFiles.length > 0) {
      logger('success', 'img-upload', `已从产物中移除 ${removedFiles.length} 个图片文件`)
    }

    return removedFiles.length
  }

  return {
    name: 'vite-plugin-img-upload',
    apply: 'build',
    enforce: 'post',

    configResolved(config) {
      if (!enable) return

      viteConfig = config

      // 初始化缓存管理器
      cacheManager = new CacheManager(cache, cacheFile, viteConfig.root, logger)
      cacheManager.load()

      // 检查插件执行顺序，确保图片压缩插件在上传插件之前
      const plugins = config.plugins as Plugin[]
      const compressPluginIndex = plugins.findIndex((p) => p.name === 'vite-plugin-img-compress')
      const uploadPluginIndex = plugins.findIndex((p) => p.name === 'vite-plugin-img-upload')

      // 如果两个插件都存在
      if (compressPluginIndex !== -1 && uploadPluginIndex !== -1) {
        // 检查压缩插件是否在上传插件之后
        if (compressPluginIndex > uploadPluginIndex) {
          logger(
            'error',
            'img-upload',
            `插件顺序错误！图片压缩插件 (vite-plugin-img-compress) 必须在图片上传插件 (vite-plugin-img-upload) 之前执行。`
          )
          throw new Error(
            `[vite-plugin-img-upload] 插件顺序错误！请调整 plugins 数组，确保压缩插件在上传插件之前。`
          )
        }
      }
    },

    async generateBundle(_, bundle: OutputBundle) {
      if (!enable) return

      // 步骤 1: 上传所有图片
      logger('info', 'img-upload', '开始处理图片...')
      const { fileUrlMap, uploadedCount, cachedCount } = await uploadImages(bundle)

      const totalImages = uploadedCount + cachedCount
      if (totalImages === 0) {
        logger('info', 'img-upload', '没有图片需要处理')
        return
      }

      // 显示统计信息
      if (cachedCount > 0) {
        logger(
          'info',
          'img-upload',
          `图片处理完成：新上传 ${uploadedCount} 张，使用缓存 ${cachedCount} 张`
        )
      } else {
        logger('info', 'img-upload', `图片上传完成：共 ${uploadedCount} 张`)
      }

      // 保存缓存
      if (uploadedCount > 0) {
        cacheManager.save()
      }

      // 步骤 2: 替换代码中的图片引用
      logger('info', 'img-upload', `开始替换引用...`)
      const chunkReplacedCount = replaceReferencesInChunks(bundle, fileUrlMap)
      const assetReplacedCount = replaceReferencesInAssets(bundle, fileUrlMap)
      const totalReplacedCount = chunkReplacedCount + assetReplacedCount

      logger('success', 'img-upload', `引用替换完成，共替换 ${totalReplacedCount} 个文件`)

      // 步骤 3: 从 bundle 中移除图片文件
      if (removeAfterUpload) {
        removeImagesFromBundle(bundle, fileUrlMap)
      }

      logger('success', 'img-upload', `✓ 图片上传插件执行完成！`)
    }
  }
}
