import sharp from 'sharp'
import path from 'node:path'
import ansi from 'ansi-colors'
import { promises as fs } from 'node:fs'
import { fileURLToPath } from 'node:url'

import type { ResolvedConfig } from 'vite'
import { createLogger } from './utils/logger'
import type {
  ViteImgUploadOptions,
  AssetMatcher,
  UploadItem,
  LogInfo,
  CacheData,
  BundleAsset,
  BundleChunk,
  OutputBundle
} from './types/viteImgUpload'

// 图片文件扩展名常量
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] as const
const IMAGE_REGEX = /\.(?:jpg|jpeg|png|gif|bmp|webp)$/i

// ESM 环境获取 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default function ViteImgUpload(opts: ViteImgUploadOptions) {
  let config: ResolvedConfig
  opts.log = opts.log ?? true
  opts.cache = opts.cache ?? true

  // 创建日志记录器
  const logger = createLogger()

  const logInfo: Record<string, LogInfo> = {}
  const imgsMap: Record<string, string> = {}

  function isImg(val: string): boolean {
    return IMAGE_REGEX.test(val)
  }

  function isAssetMatch(name: string, matcher: AssetMatcher): boolean {
    if (typeof matcher === 'string') return name === matcher
    if (matcher instanceof RegExp) return matcher.test(name)
    if (Array.isArray(matcher)) return matcher.includes(name)
    return false
  }

  function checkAsset(val: string): boolean {
    if (!isImg(val)) return false

    if (opts.include && isAssetMatch(val, opts.include)) {
      return true
    }

    if (opts.exclude && isAssetMatch(val, opts.exclude)) {
      return false
    }

    if (opts.test && !opts.test.test(val)) {
      return false
    }

    return true
  }

  async function getCache() {
    const filePath = path.join(__dirname, 'cache.json')

    let cache: CacheData = {}
    try {
      if (opts.cache === true) {
        // 检查文件是否存在并读取
        await fs.access(filePath, fs.constants.F_OK)
        const data = await fs.readFile(filePath, 'utf8')
        cache = JSON.parse(data) as CacheData
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && err.code === 'ENOENT') {
        // 文件不存在，创建空的缓存文件
        const dataToWrite = JSON.stringify(cache, null, 2)
        await fs.writeFile(filePath, dataToWrite, 'utf8')
      } else {
        console.error('读取缓存文件错误:', err)
      }
    }

    return {
      cache,
      async updateCache() {
        if (opts.cache === false) return
        try {
          const updatedJsonData = JSON.stringify(cache, null, 2)
          await fs.writeFile(filePath, updatedJsonData, 'utf8')
        } catch (err: unknown) {
          console.error('更新缓存文件错误:', err)
        }
      }
    }
  }

  async function compressImg(uploadItems: UploadItem[]): Promise<void> {
    const promises = uploadItems.map(async (item) => {
      const { name, source } = item
      const ext = path.extname(name).slice(1).toLowerCase()

      // 获取对应格式的压缩选项
      const formatOptions = opts[ext as 'png' | 'jpeg' | 'jpg'] || { quality: 80 }

      const buffer = await sharp(source)
        .toFormat(ext as any, formatOptions)
        .toBuffer()

      const oldSize = source.byteLength
      const newSize = buffer.byteLength

      // 记录日志信息
      logInfo[name] = {
        oldSize,
        newSize
      }

      // 只有压缩后更小才替换
      if (newSize < oldSize) {
        item.source = buffer
      }
    })

    await Promise.all(promises)
  }

  async function uploadImg(bundle: OutputBundle): Promise<void> {
    const { cache, updateCache } = await getCache()

    const uploadItems: UploadItem[] = []

    // 遍历 bundle 查找需要上传的图片资源
    for (const [key, item] of Object.entries(bundle)) {
      if (item.type === 'asset' && checkAsset(item.name)) {
        const assetItem = item as BundleAsset

        // 直接使用 key 作为缓存键，因为 Vite 的 key 已经包含了文件内容的 hash，ex.assets/avatar-CZJfXgmf.jpg
        if (cache[key]) {
          // 使用缓存的 URL
          imgsMap[key] = cache[key]
          delete bundle[key]
        } else {
          // 需要上传的资源
          const hashedFileName = path.basename(assetItem.fileName) // ex.avatar-CZJfXgmf.jpg
          uploadItems.push({
            key,
            name: assetItem.name,
            hashedFileName,
            source: assetItem.source as Buffer
          })
        }
      }
    }

    // 如果没有需要上传的图片，直接返回
    if (uploadItems.length === 0) {
      return
    }

    // 压缩图片
    await compressImg(uploadItems)

    // 上传图片
    const resultArr = await opts.upload(uploadItems)

    // 更新映射表和缓存
    uploadItems.forEach(({ key, name }, index) => {
      const url = resultArr[index].url
      imgsMap[key!] = url
      cache[key!] = url
      logInfo[name].url = url
      delete bundle[key!]
    })

    await updateCache()
  }

  function replaceImgPath(bundle: OutputBundle): void {
    // 构建图片路径匹配正则
    const imageExtPattern = IMAGE_EXTENSIONS.join('|')
    // 转义 config.base 中的特殊字符（如 . * + ? 等）
    const escapedBase = config.base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // 转义 assetsDir（通常就是 "assets"，但为了安全还是转义）
    const escapedAssetsDir = config.build.assetsDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // 文件名模式：允许字母、数字、连字符、下划线、点（用于 hash）
    // 例如：avatar-CZJfXgmf.jpg, logo_v2-Dt-tB2u3.png
    const fileNamePattern = '[a-zA-Z0-9._-]+'

    // 优化后的正则表达式，匹配多种路径格式：
    // 1. 绝对路径：/assets/image.jpg 或 /base/assets/image.jpg
    // 2. 相对路径：../assets/image.jpg 或 ../../assets/image.jpg
    // 3. 当前目录：./assets/image.jpg
    // 4. 直接路径：assets/image.jpg（较少见）
    //
    // 正则结构：
    // - (?:(?:\\.\\./)+|(?:\\./)?|) - 可选的相对路径前缀（../ 或 ./ 或空）
    // - ${escapedBase} - base 路径（通常是 /）
    // - (${escapedAssetsDir}/${fileNamePattern}\\.(${imageExtPattern})) - 捕获组：assets/文件名.扩展名
    const imageRegex = new RegExp(
      `(?:(?:\\.\\./)+|(?:\\./)?|)${escapedBase}(${escapedAssetsDir}/${fileNamePattern}\\.(${imageExtPattern}))`,
      'gi'
    )

    const replaceFunc = (match: string, p1: string): string => {
      // p1 是捕获的路径，格式：assets/文件名-hash.扩展名
      // 例如：assets/avatar-CZJfXgmf.jpg
      // 这个格式与 bundle 的 key 相同，可以直接用于查找映射
      const url = imgsMap[p1]
      if (url) {
        return url
      }
      return match
    }

    // 遍历所有 bundle 项，替换图片路径
    for (const item of Object.values(bundle)) {
      if (item.type === 'asset') {
        const assetItem = item as BundleAsset
        // 只处理字符串类型的 source（如 CSS 文件中的 url()）
        if (typeof assetItem.source === 'string') {
          assetItem.source = assetItem.source.replace(imageRegex, replaceFunc)
        }
      } else if (item.type === 'chunk') {
        // 处理 JS 代码中的图片路径引用
        const chunkItem = item as BundleChunk
        chunkItem.code = chunkItem.code.replace(imageRegex, replaceFunc)
      }
    }
  }

  return {
    name: 'vite-img-upload',
    enforce: 'post' as const,

    configResolved(cfg: ResolvedConfig) {
      config = cfg
    },

    async generateBundle(_, bundle: OutputBundle) {
      logger('info', 'vite-img-upload', '\n开始处理图片资源...')
      await uploadImg(bundle)
      replaceImgPath(bundle)
    },

    closeBundle() {
      if (!opts.log) return

      const logEntries = Object.entries(logInfo)
      if (logEntries.length === 0) {
        logger('success', 'vite-img-upload', '\n没有图片需要处理')
        return
      }

      logger('success', 'vite-img-upload', '\n处理结果:')

      for (const [key, item] of logEntries) {
        const sizeChange =
          item.oldSize > item.newSize
            ? `压缩: ${item.oldSize}B -> ${item.newSize}B (节省 ${((1 - item.newSize / item.oldSize) * 100).toFixed(2)}%)`
            : '压缩: 无'
        logger(
          'success',
          'vite-img-upload',
          `${ansi.yellow(key)}: ${item.url || '未上传'} ${sizeChange}`,
          true
        )
      }

      logger('success', 'vite-img-upload', '处理完成！\n')
    }
  }
}
