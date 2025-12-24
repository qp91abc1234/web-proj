import type { FileChunk } from './types'

/**
 * 默认分片大小：1MB
 */
export const CHUNK_SIZE = 1024 * 1024 // 1MB

/**
 * 格式化文件大小
 * @param bytes 文件大小（字节）
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * 生成唯一 ID
 * @returns 唯一 ID 字符串
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 将文件分割成多个分片
 * @param file 原始文件
 * @param chunkSize 分片大小（字节），默认 1MB
 * @returns 分片数组
 */
export function createFileChunks(file: File, chunkSize: number = CHUNK_SIZE): FileChunk[] {
  const chunks: FileChunk[] = []
  const totalChunks = Math.ceil(file.size / chunkSize)

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)
    const chunkName = `${file.name}-${i}`

    chunks.push({
      index: i,
      file: chunk,
      name: chunkName,
      size: chunk.size
    })
  }

  return chunks
}

/**
 * 计算文件分片数量
 * @param fileSize 文件大小（字节）
 * @param chunkSize 分片大小（字节），默认 1MB
 * @returns 分片数量
 */
export function calculateChunkCount(fileSize: number, chunkSize: number = CHUNK_SIZE): number {
  return Math.ceil(fileSize / chunkSize)
}

/**
 * 是否为图片文件
 * @param type MIME 类型
 * @returns 是否为图片
 */
export function isImage(type: string): boolean {
  return /^image\/(jpg|jpeg|png|gif|webp)$/i.test(type)
}
