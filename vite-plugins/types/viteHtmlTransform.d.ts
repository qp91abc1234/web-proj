import type { HtmlTagDescriptor } from 'vite'
import type { Options as EJSOptions } from 'ejs'
import type { Options as MinifyOptions } from 'html-minifier-terser'

/**
 * HTML 注入数据配置
 */
export interface InjectData {
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
export interface ViteHtmlTransformOptions {
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
export type { MinifyOptions }
