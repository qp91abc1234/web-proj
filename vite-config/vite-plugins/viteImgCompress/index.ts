import path from 'node:path'
import sharp from 'sharp'
import ansi from 'ansi-colors'
import type { Plugin } from 'vite'
import type { ViteImgCompressOptions, OutputBundle, OutputAsset } from '../types/viteImgCompress'
import { createLogger } from '../utils/logger'

const IMAGE_REGEX = /\.(jpg|jpeg|png|gif|webp|avif)$/i

export default function viteImgCompress(options: ViteImgCompressOptions = {}): Plugin {
  const {
    enable = true,
    verbose = false,
    threshold = 10240, // 10KB
    include,
    exclude,
    jpeg,
    png,
    webp,
    avif,
    gif,
    sharpOptions
  } = options

  const logger = createLogger(verbose)

  // 匹配文件是否为图片且符合 include/exclude 规则
  function isMatch(fileName: string): boolean {
    if (!IMAGE_REGEX.test(fileName)) return false

    // 如果指定了 include，必须匹配 include
    if (include) {
      const includes = Array.isArray(include) ? include : [include]
      const isIncluded = includes.some((pattern) =>
        pattern instanceof RegExp ? pattern.test(fileName) : fileName.includes(pattern)
      )
      if (!isIncluded) return false
    }

    // 如果指定了 exclude，不能匹配 exclude
    if (exclude) {
      const excludes = Array.isArray(exclude) ? exclude : [exclude]
      const isExcluded = excludes.some((pattern) =>
        pattern instanceof RegExp ? pattern.test(fileName) : fileName.includes(pattern)
      )
      if (isExcluded) return false
    }

    return true
  }

  return {
    name: 'vite-plugin-img-compress',
    apply: 'build',
    enforce: 'post',

    async generateBundle(_, bundle: OutputBundle) {
      if (!enable) return

      logger('info', 'img-compress', '开始压缩图片...')

      const files: string[] = []
      let compressedCount = 0
      let totalOldSize = 0
      let totalNewSize = 0

      const promises = Object.keys(bundle).map(async (key) => {
        const item = bundle[key] as OutputAsset

        // 过滤非 Asset 或非图片文件
        if (item.type !== 'asset' || !isMatch(item.fileName)) return

        // 过滤小文件
        const originalSource = item.source
        const buffer = Buffer.isBuffer(originalSource)
          ? originalSource
          : Buffer.from(originalSource)

        if (buffer.length < threshold) return

        try {
          const ext = path.extname(item.fileName).toLowerCase().slice(1)
          let sharpInstance = sharp(buffer, sharpOptions)

          // 根据扩展名应用配置
          switch (ext) {
            case 'jpg':
            case 'jpeg':
              if (jpeg) sharpInstance = sharpInstance.jpeg(jpeg)
              break
            case 'png':
              if (png) sharpInstance = sharpInstance.png(png)
              break
            case 'webp':
              if (webp) sharpInstance = sharpInstance.webp(webp)
              break
            case 'avif':
              if (avif) sharpInstance = sharpInstance.avif(avif)
              break
            case 'gif':
              if (gif) sharpInstance = sharpInstance.gif(gif)
              break
            default:
              return // 不支持的格式跳过
          }

          const compressedBuffer = await sharpInstance.toBuffer()

          // 如果压缩后体积变小，则替换
          if (compressedBuffer.length < buffer.length) {
            item.source = compressedBuffer

            compressedCount++
            totalOldSize += buffer.length
            totalNewSize += compressedBuffer.length

            const ratio = ((1 - compressedBuffer.length / buffer.length) * 100).toFixed(2)
            files.push(
              `${ansi.cyan(item.fileName)}: ${(buffer.length / 1024).toFixed(2)}kb -> ${(
                compressedBuffer.length / 1024
              ).toFixed(2)}kb (${ansi.green(ratio + '%')})`
            )
          }
        } catch (error) {
          logger('error', 'img-compress', `压缩失败: ${item.fileName}`)
          console.error(error)
        }
      })

      await Promise.all(promises)

      if (compressedCount > 0) {
        if (files.length > 0) {
          files.forEach((msg) => logger('verbose', 'img-compress', msg, true))
        }

        const totalRatio = ((1 - totalNewSize / totalOldSize) * 100).toFixed(2)
        const savedSize = ((totalOldSize - totalNewSize) / 1024).toFixed(2)

        logger(
          'success',
          'img-compress',
          `压缩完成！共处理 ${compressedCount} 张图片，节省 ${savedSize}KB (${totalRatio}%)`
        )
      } else {
        logger('info', 'img-compress', '没有图片需要压缩或压缩后体积未减小')
      }
    }
  }
}
