export interface ViteImgUploadOptions {
  /**
   * 是否开启上传
   * @default true
   */
  enable?: boolean

  /**
   * 包含的文件模式
   */
  include?: string | RegExp | (string | RegExp)[]

  /**
   * 排除的文件模式
   */
  exclude?: string | RegExp | (string | RegExp)[]

  /**
   * 上传函数
   * @param fileName 文件名
   * @param content 文件内容
   * @returns 上传后的 URL
   */
  upload: (fileName: string, content: Buffer) => Promise<string>

  /**
   * 是否在上传后从产物中移除图片文件
   * @default true
   */
  removeAfterUpload?: boolean

  /**
   * 最大并发上传数
   * @default 5
   */
  concurrency?: number

  /**
   * 是否启用缓存（避免重复上传相同内容的图片）
   * @default true
   */
  cache?: boolean

  /**
   * 缓存文件路径（相对于项目根目录）
   * @default 'node_modules/.vite-img-upload-cache.json'
   */
  cacheFile?: string
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

export interface CacheData {
  images: Record<string, { url: string; uploadedAt: number }>
}
