/**
 * 文件分片信息
 */
export interface FileChunk {
  index: number
  file: Blob
  name: string // 格式：原文件名-序号
  size: number
}

/**
 * 上传文件信息
 */
export interface UploadFile {
  id: string
  name: string
  url: string
  size: number
  type: string
  status: 'uploading' | 'merging' | 'success' | 'error'
  progress: number
  errorMessage?: string
}
