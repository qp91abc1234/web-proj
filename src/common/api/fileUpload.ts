import pLimit from 'p-limit'
import { request, requestGet } from '../utils/request'

/**
 * 上传文件响应类型（后端直接返回字符串数组）
 */
export type UploadFilesResponse = string[]

/**
 * 文件上传并发限制器
 * 普通上传和分片上传共用，最多同时进行 5 个上传任务
 */
const uploadLimit = pLimit(5)

/**
 * OSS 信息响应类型
 */
export interface OssInfoResponse {
  policy: string
  OSSAccessKeyId: string
  Signature: string
  host: string
}

/**
 * 多文件上传（带并发控制）
 * @param files 文件列表
 * @param onProgress 上传进度回调
 */
export function uploadFiles(
  files: File[],
  onProgress?: (progress: number) => void
): Promise<UploadFilesResponse> {
  return uploadLimit(async () => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })

    return request<string[]>({
      url: '/file-upload/uploadFiles',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percent)
        }
      }
    }).then((res) => res.data || [])
  })
}

/**
 * 上传文件分片（带并发控制）
 * @param file 文件分片
 * @param chunkName 分片名称（格式：文件名-序号）
 * @param onProgress 上传进度回调
 */
export function uploadChunk(
  file: Blob,
  chunkName: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  return uploadLimit(async () => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', chunkName)

    return request({
      url: '/file-upload/uploadChunk',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percent)
        }
      }
    }).then(() => undefined)
  })
}

/**
 * 合并文件分片
 * @param fileName 文件名
 */
export function mergeChunks(fileName: string): Promise<string> {
  return requestGet<string>('/file-upload/merge', { name: fileName }).then((res) => {
    // 后端直接返回字符串 URL，但被包装在 ApiResponse 中
    return res.data || ''
  })
}

/**
 * 获取 OSS 信息
 */
export function getOssInfo(): Promise<OssInfoResponse> {
  return requestGet<OssInfoResponse>('/file-upload/ossInfo').then((res) => res.data)
}
