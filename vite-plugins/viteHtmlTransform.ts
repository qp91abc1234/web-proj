import type { PluginOption, ResolvedConfig } from 'vite'
import type { HtmlTagDescriptor } from 'vite'
import type { Options as EJSOptions } from 'ejs'
import { render } from 'ejs'
import path from 'node:path'
import type { Options as MinifyOptions } from 'html-minifier-terser'
import { minify as minifyFn } from 'html-minifier-terser'

/**
 * HTML 注入数据配置
 */
interface InjectData {
  /** 用于匹配 HTML 文件名的正则表达式字符串 */
  regex?: string
  /** 要注入到模板的数据 */
  data?: Record<string, any>
  /** 要注入到 HTML 的标签 */
  tags?: HtmlTagDescriptor[]
  /** EJS 模板选项 */
  ejsOptions?: EJSOptions
}

/**
 * 插件配置选项
 */
interface Options {
  /** HTML 压缩配置，false 表示不压缩，true 或不传表示使用默认配置 */
  minify?: boolean | MinifyOptions
  /** HTML 注入配置数组 */
  inject?: InjectData[]
  /** 是否启用详细日志 */
  verbose?: boolean
}

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
export default function ViteHtmlTransform(opts: Options = {}): PluginOption {
  const minifyOptions = normalizeMinifyOptions(opts.minify)
  const injectData = opts.inject ?? []
  const verbose = opts.verbose ?? false
  let config: ResolvedConfig

  function log(message: string, ...args: any[]) {
    if (verbose) {
      console.log(`[vite-html-template] ${message}`, ...args)
    }
  }

  return [
    {
      name: 'vite-html-transform',
      configResolved(cfg) {
        config = cfg
        log('Plugin initialized')
      },
      transformIndexHtml: {
        order: 'pre',
        handler: async (html, ctx) => {
          try {
            const htmlName = path.basename(ctx.filename)
            log(`Processing HTML file: ${htmlName}`)

            // 查找所有匹配的注入配置，并按顺序依次生效（后面的可以覆盖前面的字段）
            const matchedConfigs = injectData.filter((item) => {
              const pattern = new RegExp(item.regex || '.*')
              return pattern.test(htmlName)
            })

            if (matchedConfigs.length > 0) {
              log(
                `Matched ${matchedConfigs.length} inject config(s):`,
                matchedConfigs.map((item) => item.regex)
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
            log(`Template rendered successfully for ${htmlName}`)

            return {
              html: renderedHtml,
              tags: mergedTags
            }
          } catch (error) {
            console.error('[vite-html-template] Failed to process HTML:', error)
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
          log('HTML minification is disabled')
          return
        }

        log('Starting HTML minification...')
        let processedCount = 0

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
              log(`Minifying: ${item.fileName}`)
              const originalSize = item.source.length

              item.source = await minifyFn(item.source, minifyOptions)

              const newSize = item.source.length
              const saved = ((1 - newSize / originalSize) * 100).toFixed(2)
              log(`${item.fileName}: ${originalSize} -> ${newSize} bytes (saved ${saved}%)`)

              processedCount++
            }
          }

          log(`HTML minification completed. Processed ${processedCount} file(s)`)
        } catch (error) {
          console.error('[vite-html-compress] Failed to minify HTML:', error)
          throw error
        }
      }
    }
  ]
}
