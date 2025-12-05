import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { CacheData } from '../types/viteImgUpload'
import type { Logger } from '../utils/logger'

export class CacheManager {
  private cacheData: CacheData = { images: {} }
  private enabled: boolean
  private cacheFilePath: string
  private logger: Logger

  constructor(enabled: boolean, cacheFile: string, projectRoot: string, logger: Logger) {
    this.enabled = enabled
    this.cacheFilePath = resolve(projectRoot, cacheFile)
    this.logger = logger
  }

  /**
   * 计算文件内容的哈希值
   */
  getContentHash(buffer: Buffer): string {
    return createHash('md5').update(buffer).digest('hex')
  }

  /**
   * 加载缓存
   */
  load(): void {
    if (!this.enabled) return

    try {
      if (existsSync(this.cacheFilePath)) {
        const content = readFileSync(this.cacheFilePath, 'utf-8')
        this.cacheData = JSON.parse(content)
        this.logger(
          'info',
          'img-upload',
          `加载缓存成功，共 ${Object.keys(this.cacheData.images).length} 条记录`
        )
      }
    } catch (error) {
      this.logger('error', 'img-upload', '加载缓存失败')
      console.error(error)
      this.cacheData = { images: {} }
    }
  }

  /**
   * 保存缓存
   */
  save(): void {
    if (!this.enabled) return

    try {
      writeFileSync(this.cacheFilePath, JSON.stringify(this.cacheData, null, 2), 'utf-8')
      this.logger('info', 'img-upload', '缓存已保存')
    } catch (error) {
      this.logger('error', 'img-upload', '保存缓存失败')
      console.error(error)
    }
  }

  /**
   * 从缓存中获取 URL
   */
  get(hash: string): string | null {
    if (!this.enabled) return null
    return this.cacheData.images[hash]?.url || null
  }

  /**
   * 更新缓存
   */
  set(hash: string, url: string): void {
    if (!this.enabled) return
    this.cacheData.images[hash] = {
      url,
      uploadedAt: Date.now()
    }
  }
}
