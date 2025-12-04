import type { PngOptions, JpegOptions } from 'sharp'

/**
 * 资源匹配器类型
 */
export type AssetMatcher = RegExp | string | string[]

/**
 * 上传项接口
 */
export interface UploadItem {
  key?: string
  cacheKey?: string
  name: string
  md5Name: string
  source: Buffer
}

/**
 * 上传结果接口
 */
export interface UploadResult {
  url: string
}

/**
 * 日志信息接口
 */
export interface LogInfo {
  oldSize: number
  newSize: number
  url?: string
}

/**
 * 缓存数据接口
 */
export interface CacheData {
  [key: string]: string
}

/**
 * 插件配置选项
 */
export interface ViteImgUploadOptions {
  /** 是否启用日志输出 */
  log?: boolean
  /** 缓存配置，false 表示不使用缓存，'reset' 表示重置缓存 */
  cache?: boolean | 'reset'
  /** 用于测试文件名的正则表达式 */
  test?: RegExp
  /** 包含的资源匹配器 */
  include?: AssetMatcher
  /** 排除的资源匹配器 */
  exclude?: AssetMatcher
  /** PNG 格式压缩选项 */
  png?: PngOptions
  /** JPEG 格式压缩选项 */
  jpeg?: JpegOptions
  /** JPG 格式压缩选项 */
  jpg?: JpegOptions
  /** 上传函数 */
  upload: (uploadItems: UploadItem[]) => Promise<UploadResult[]>
}

/**
 * Bundle 资源类型定义
 */
export interface BundleAsset {
  type: 'asset'
  fileName: string
  name: string
  source: string | Buffer
}

/**
 * Bundle 代码块类型定义
 */
export interface BundleChunk {
  type: 'chunk'
  code: string
  fileName: string
}

/**
 * Bundle 项类型
 */
export type BundleItem = BundleAsset | BundleChunk

/**
 * 输出 Bundle 类型
 */
export interface OutputBundle {
  [key: string]: BundleItem
}
