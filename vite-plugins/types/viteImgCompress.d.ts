import type {
  SharpOptions,
  JpegOptions,
  PngOptions,
  WebpOptions,
  AvifOptions,
  GifOptions
} from 'sharp'

export type ImageExt = 'jpg' | 'jpeg' | 'png' | 'gif' | 'webp' | 'avif' | 'svg'

export interface ViteImgCompressOptions {
  /**
   * 是否开启压缩
   * @default true
   */
  enable?: boolean

  /**
   * 是否输出日志
   * @default true
   */
  verbose?: boolean

  /**
   * 包含的文件模式
   */
  include?: string | RegExp | (string | RegExp)[]

  /**
   * 排除的文件模式
   */
  exclude?: string | RegExp | (string | RegExp)[]

  /**
   * 最小文件大小 (bytes)，小于此大小的文件不压缩
   * @default 10240 (10KB)
   */
  threshold?: number

  /**
   * JPEG/JPG 压缩配置
   */
  jpeg?: JpegOptions

  /**
   * PNG 压缩配置
   */
  png?: PngOptions

  /**
   * WebP 压缩配置
   */
  webp?: WebpOptions

  /**
   * AVIF 压缩配置
   */
  avif?: AvifOptions

  /**
   * GIF 压缩配置
   */
  gif?: GifOptions

  /**
   * Sharp 通用配置
   */
  sharpOptions?: SharpOptions
}

export interface OutputAsset {
  type: 'asset'
  fileName: string
  name?: string
  source: string | Buffer | Uint8Array
}

export interface OutputChunk {
  type: 'chunk'
  fileName: string
  code: string
}

export type OutputBundle = Record<string, OutputAsset | OutputChunk>
