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
export interface UploadedFile {
  id: string
  name: string
  url: string
  size: number
  type: string
  status: 'uploading' | 'success' | 'error'
  progress: number
  errorMessage?: string
}

/**
 * 上传中的文件信息
 */
export interface UploadingFile {
  id: string
  file: File
  chunks: FileChunk[]
  uploadedChunks: number
  totalChunks: number
  progress: number
  status: 'uploading' | 'merging' | 'success' | 'error'
  errorMessage?: string
}
