import type { PluginOption, ResolvedConfig, HtmlTagDescriptor } from 'vite'
import { render } from 'ejs'
import path from 'node:path'
import type { Options as EJSOptions } from 'ejs'
import type { Options as MinifyOptions } from 'html-minifier-terser'
import { minify as minifyFn } from 'html-minifier-terser'
import ansi from 'ansi-colors'
import { createLogger } from './utils/logger'
import type { ViteHtmlTransformOptions } from './types/viteHtmlTransform'

/**
 * 默认的 HTML 压缩配置
 */
const DEFAULT_MINIFY_OPTIONS: MinifyOptions = {
  collapseWhitespace: true,
  keepClosingSlash: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyCSS: true
}

/**
 * 获取标准化的压缩配置
 */
function normalizeMinifyOptions(minify?: boolean | MinifyOptions): MinifyOptions | false {
  if (minify === false) return false

  // 用户传入对象时，与默认压缩策略合并，这样只需覆盖关心的字段
  if (typeof minify === 'object') {
    return {
      ...DEFAULT_MINIFY_OPTIONS,
      ...minify
    }
  }

  // 未传或传 true 时，使用默认压缩策略
  return DEFAULT_MINIFY_OPTIONS
}

/**
 * Vite HTML 转换插件
 * 支持 EJS 模板渲染和 HTML 压缩
 */
export default function ViteHtmlTransform(opts: ViteHtmlTransformOptions = {}): PluginOption {
  const minifyOptions = normalizeMinifyOptions(opts.minify)
  const injectData = opts.inject ?? []
  const verbose = opts.verbose ?? false
  let config: ResolvedConfig

  // 创建日志记录器
  const logger = createLogger(verbose)

  return [
    {
      name: 'vite-html-transform',
      configResolved(cfg) {
        config = cfg
        logger('verbose', 'vite-html-transform', '插件初始化完成')
      },
      transformIndexHtml: {
        order: 'pre',
        handler: async (html, ctx) => {
          try {
            const htmlName = path.basename(ctx.filename)
            logger('verbose', 'vite-html-transform', `正在处理 HTML 文件: ${ansi.yellow(htmlName)}`)

            // 查找所有匹配的注入配置，并按顺序依次生效（后面的可以覆盖前面的字段）
            const matchedConfigs = injectData.filter((item) => {
              const pattern = new RegExp(item.regex || '.*')
              return pattern.test(htmlName)
            })

            if (matchedConfigs.length > 0) {
              logger(
                'verbose',
                'vite-html-transform',
                `匹配到 ${ansi.magenta(matchedConfigs.length.toString())} 个注入配置: ${matchedConfigs.map((item) => ansi.gray(item.regex || '.*')).join(', ')}`
              )
            }

            // 依次合并 data，后匹配的配置可以覆盖前面的同名字段
            const mergedData = matchedConfigs.reduce<Record<string, any>>((acc, item) => {
              if (item.data) {
                Object.assign(acc, item.data)
              }
              return acc
            }, {})

            // 合并 tags：简单拼接数组，保持先后顺序
            const mergedTags = matchedConfigs.reduce<HtmlTagDescriptor[]>((acc, item) => {
              if (item.tags && item.tags.length > 0) {
                acc.push(...item.tags)
              }
              return acc
            }, [])

            // 合并 EJS 选项：后匹配的配置覆盖前面的同名选项
            const mergedEjsOptions = matchedConfigs.reduce<EJSOptions | undefined>((acc, item) => {
              if (!item.ejsOptions) return acc
              return {
                ...(acc ?? {}),
                ...item.ejsOptions
              }
            }, undefined)

            // 合并 EJS 数据：环境变量 -> define 配置 -> 自定义数据（多配置合并后）
            const ejsData: Record<string, any> = {
              ...config.env,
              ...(config.define ?? {}),
              ...mergedData
            }

            // 渲染 EJS 模板
            const renderedHtml = await render(html, ejsData, mergedEjsOptions)
            logger('verbose', 'vite-html-transform', `模板渲染成功: ${ansi.yellow(htmlName)}`)

            return {
              html: renderedHtml,
              tags: mergedTags
            }
          } catch (error) {
            logger('error', 'vite-html-transform', `处理 HTML 失败: ${error}`)
            throw error
          }
        }
      }
    },
    {
      name: 'vite-html-compress',
      enforce: 'post',
      apply: 'build',
      async generateBundle(_, bundle) {
        if (minifyOptions === false) {
          logger('verbose', 'vite-html-compress', 'HTML 压缩已禁用')
          return
        }

        logger('info', 'vite-html-compress', '\n开始压缩 HTML...')
        let processedCount = 0
        const results: Array<{ fileName: string; originalSize: number; newSize: number }> = []

        try {
          const bundleKeys = Object.keys(bundle)

          for (const key of bundleKeys) {
            const item = bundle[key]

            // 只处理 HTML 资源
            if (
              item.type === 'asset' &&
              item.fileName.endsWith('.html') &&
              typeof item.source === 'string'
            ) {
              logger('verbose', 'vite-html-compress', `正在压缩: ${ansi.yellow(item.fileName)}`)
              const originalSize = item.source.length

              item.source = await minifyFn(item.source, minifyOptions)

              const newSize = item.source.length
              results.push({ fileName: item.fileName, originalSize, newSize })

              processedCount++
            }
          }

          if (processedCount > 0) {
            logger('success', 'vite-html-compress', '\n压缩结果:')
            for (const { fileName, originalSize, newSize } of results) {
              const saved = ((1 - newSize / originalSize) * 100).toFixed(2)
              const savedBytes = originalSize - newSize
              logger(
                'success',
                'vite-html-compress',
                `${ansi.yellow(fileName)}: ${ansi.gray(`${originalSize}B`)} -> ${ansi.gray(`${newSize}B`)} ${ansi.green(`(节省 ${savedBytes}B, ${saved}%)`)}`,
                true
              )
            }
            logger('success', 'vite-html-compress', `压缩完成！共处理 ${processedCount} 个文件\n`)
          } else {
            logger('info', 'vite-html-compress', ansi.gray('没有需要压缩的 HTML 文件\n'))
          }
        } catch (error) {
          logger('error', 'vite-html-compress', `压缩 HTML 失败: ${error}`)
          throw error
        }
      }
    }
  ]
}
