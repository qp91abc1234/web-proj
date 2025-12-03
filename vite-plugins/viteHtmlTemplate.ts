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
  if (typeof minify === 'object') return minify
  return DEFAULT_MINIFY_OPTIONS
}

/**
 * Vite HTML 模板插件
 * 支持 EJS 模板渲染和 HTML 压缩
 */
export default function ViteHtmlTemplate(opts: Options = {}): PluginOption {
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
      name: 'vite-html-template',
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

            // 查找匹配的注入配置
            let matchedConfig: InjectData = {}
            for (const item of injectData) {
              const pattern = new RegExp(item.regex || '.*')
              if (pattern.test(htmlName)) {
                matchedConfig = item
                log(`Matched inject config with regex: ${item.regex}`)
                break
              }
            }

            // 合并 EJS 数据：环境变量 -> define 配置 -> 自定义数据
            const ejsData: Record<string, any> = {
              ...config.env,
              ...(config.define ?? {}),
              ...(matchedConfig.data ?? {})
            }

            // 渲染 EJS 模板
            const renderedHtml = await render(html, ejsData, matchedConfig.ejsOptions)
            log(`Template rendered successfully for ${htmlName}`)

            return {
              html: renderedHtml,
              tags: matchedConfig.tags ?? []
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
