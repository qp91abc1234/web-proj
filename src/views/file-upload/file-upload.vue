<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload, View, Document, RefreshRight } from '@element-plus/icons-vue'
import { uploadFiles, uploadChunk, mergeChunks } from '@/common/api/fileUpload'
import {
  createFileChunks,
  CHUNK_SIZE,
  BATCH_UPLOAD_SIZE,
  isImage,
  formatFileSize,
  generateId
} from './utils'
import type { UploadFile } from './types'
import { debounce } from 'lodash-es'

// 定义组件名称，用于 keep-alive
defineOptions({
  name: 'FileUpload'
})

const fileList = ref<UploadFile[]>([])
// 预览相关
const previewImageRefs = ref<Record<string, any>>({})
const previewSrcList = computed(() => {
  return fileList.value
    .filter((file) => isImage(file.type) && file.status === 'success')
    .map((file) => file.url)
})

// 上传组件引用
const uploadRef = ref()

/**
 * 处理文件选择（防抖包装）
 */
const handleFileSelect = debounce((_file: any, fileList: any[]) => {
  const files = fileList.map((f: any) => f.raw).filter(Boolean)
  if (files.length > 0) {
    handleFileChange(files)
    // 清空组件内部的文件列表，避免重复处理
    uploadRef.value?.clearFiles()
  }
}, 100)

/**
 * 处理文件选择
 */
const handleFileChange = async (files: FileList | File[] | null) => {
  if (!files || files.length === 0) return

  const fileArray = Array.isArray(files) ? files : Array.from(files)

  // 按原始顺序处理文件，保持列表顺序一致
  const smallFiles: File[] = []
  const uploadPromises: Promise<{ success: number; failed: number }>[] = []

  /**
   * 将小文件数组分批上传
   * @param files 小文件数组
   */
  const batchUploadSmallFiles = (files: File[]) => {
    if (files.length === 0) return

    // 如果文件数量超过推荐值，分成多个批次
    if (files.length > BATCH_UPLOAD_SIZE) {
      for (let i = 0; i < files.length; i += BATCH_UPLOAD_SIZE) {
        const batch = files.slice(i, i + BATCH_UPLOAD_SIZE)
        uploadPromises.push(handleNormalUpload(batch))
      }
    } else {
      // 数量在推荐值内，一次性上传
      uploadPromises.push(handleNormalUpload(files))
    }
  }

  fileArray.forEach((file) => {
    if (file.size < CHUNK_SIZE) {
      // 小文件收集起来，等待批量上传
      smallFiles.push(file)
    } else {
      // 遇到大文件时，先上传之前收集的小文件（如果有）
      if (smallFiles.length > 0) {
        batchUploadSmallFiles(smallFiles)
        smallFiles.length = 0 // 清空已处理的小文件
      }
      // 大文件立即处理
      uploadPromises.push(handleChunkUpload(file))
    }
  })

  // 处理剩余的小文件
  if (smallFiles.length > 0) {
    batchUploadSmallFiles(smallFiles)
  }

  // 等待所有上传完成，统计结果
  const results = await Promise.all(uploadPromises)
  let totalSuccess = 0
  let totalFailed = 0

  results.forEach((result) => {
    totalSuccess += result.success
    totalFailed += result.failed
  })

  // 显示统一提示
  if (totalFailed === 0) {
    ElMessage.success(`全部上传成功，共 ${totalSuccess} 个文件`)
  } else if (totalSuccess === 0) {
    ElMessage.error(`全部上传失败，共 ${totalFailed} 个文件`)
  } else {
    ElMessage.warning(`上传完成：成功 ${totalSuccess} 个，失败 ${totalFailed} 个`)
  }
}

/**
 * 普通上传（支持多文件）
 * @param files 要上传的文件数组
 * @param fileItems 可选，如果提供则使用现有的文件项（用于重试），否则创建新的
 * @returns 返回成功和失败的数量
 */
const handleNormalUpload = async (
  files: File[],
  fileItems?: UploadFile[]
): Promise<{ success: number; failed: number }> => {
  if (files.length === 0) return { success: 0, failed: 0 }

  // 如果没有提供 fileItems，则创建新的文件项
  if (!fileItems) {
    fileItems = files.map((file) => {
      const id = generateId()
      fileList.value.push({
        id,
        name: file.name,
        url: '',
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0,
        errorMessage: '',
        originalFile: file // 保存原始文件对象，用于重试
      })
      return fileList.value[fileList.value.length - 1]
    })
  }

  try {
    const result = await uploadFiles(files, (progress) => {
      // 整体进度平均分配给所有文件
      fileItems!.forEach((uploadedFile) => {
        uploadedFile.progress = progress
      })
    })

    // 如果执行到这里，说明请求成功，result 一定包含所有文件的 URL
    if (result && result.length > 0) {
      // 将返回的 URL 分配给对应的文件
      fileItems!.forEach((uploadedFile, index) => {
        uploadedFile.url = result[index]
        uploadedFile.status = 'success'
        uploadedFile.progress = 100
      })
      return { success: result.length, failed: 0 }
    } else {
      throw new Error('上传失败：未返回文件 URL')
    }
  } catch (error: any) {
    // 所有文件标记为失败
    fileItems!.forEach((uploadedFile) => {
      uploadedFile.status = 'error'
      uploadedFile.errorMessage = error.message || '上传失败'
    })
    return { success: 0, failed: files.length }
  }
}

/**
 * 分片上传
 * @param file 要上传的文件
 * @param fileItem 可选，如果提供则使用现有的文件项（用于重试），否则创建新的
 * @returns 返回成功和失败的数量
 */
const handleChunkUpload = async (
  file: File,
  fileItem?: UploadFile
): Promise<{ success: number; failed: number }> => {
  const chunks = createFileChunks(file)
  let uploadedChunks = 0

  // 如果没有提供 fileItem，则创建新的文件项
  if (!fileItem) {
    const id = generateId()
    fileList.value.push({
      id,
      name: file.name,
      url: '',
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0,
      errorMessage: '',
      originalFile: file // 保存原始文件对象，用于重试
    })
    fileItem = fileList.value[fileList.value.length - 1]
  }

  try {
    // 上传所有分片
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      await uploadChunk(chunk.file, chunk.name, (chunkProgress) => {
        // 计算整体进度
        const chunkWeight = 90 / chunks.length // 90% 用于上传，10% 用于合并
        const currentChunkProgress = (chunkProgress / 100) * chunkWeight
        const previousChunksProgress = (uploadedChunks / chunks.length) * 90
        const totalProgress = previousChunksProgress + currentChunkProgress
        fileItem.progress = Math.round(totalProgress)
      })

      uploadedChunks++
      fileItem.progress = Math.round((uploadedChunks / chunks.length) * 90) // 90% 用于上传，10% 用于合并
    }

    // 合并分片
    fileItem.status = 'merging'
    fileItem.progress = 95
    const fileUrl = await mergeChunks(file.name)
    fileItem.status = 'success'
    fileItem.url = fileUrl
    fileItem.progress = 100

    return { success: 1, failed: 0 }
  } catch (error: any) {
    fileItem.status = 'error'
    fileItem.errorMessage = error.message || '上传失败'
    return { success: 0, failed: 1 }
  }
}

/**
 * 重试上传（单个文件）
 */
const handleRetry = async (fileItem: UploadFile) => {
  // 重置状态
  fileItem.status = 'uploading'
  fileItem.progress = 0
  fileItem.errorMessage = ''
  fileItem.url = ''

  // 根据文件大小决定使用普通上传还是分片上传
  let result: { success: number; failed: number }
  if (fileItem.originalFile.size < CHUNK_SIZE) {
    // 普通上传（传入现有的 fileItem，避免重复添加）
    result = await handleNormalUpload([fileItem.originalFile], [fileItem])
  } else {
    // 分片上传（传入现有的 fileItem，避免重复添加）
    result = await handleChunkUpload(fileItem.originalFile, fileItem)
  }

  // 重试时显示单个文件的提示
  if (result.success > 0) {
    ElMessage.success(`文件 ${fileItem.name} 重试上传成功`)
  } else {
    ElMessage.error(`文件 ${fileItem.name} 重试失败：${fileItem.errorMessage}`)
  }
}

/**
 * 清空列表
 */
const handleClear = () => {
  if (fileList.value.length === 0) {
    ElMessage.info('列表已为空')
    return
  }

  ElMessageBox.confirm('确定要清空所有文件吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    fileList.value = []
    ElMessage.success('清空成功')
  })
}

/**
 * 统计信息
 */
const stats = computed(() => {
  const total = fileList.value.length
  const success = fileList.value.filter((f) => f.status === 'success').length
  const uploading = fileList.value.filter((f) => f.status === 'uploading').length
  const error = fileList.value.filter((f) => f.status === 'error').length
  const totalSize = fileList.value.reduce((sum, f) => sum + f.size, 0)

  return {
    total,
    success,
    uploading,
    error,
    totalSize
  }
})
</script>

<template>
  <div class="file-upload-page">
    <!-- 统计信息卡片 -->
    <el-card class="stats-card">
      <div class="stats-content">
        <div class="stat-item">
          <div class="stat-label">总文件数</div>
          <div class="stat-value">{{ stats.total }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">上传成功</div>
          <div class="stat-value success">{{ stats.success }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">上传中</div>
          <div class="stat-value uploading">{{ stats.uploading }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">上传失败</div>
          <div class="stat-value error">{{ stats.error }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">总大小</div>
          <div class="stat-value">{{ formatFileSize(stats.totalSize) }}</div>
        </div>
      </div>
    </el-card>

    <!-- 上传区域 -->
    <el-card class="upload-card">
      <template #header>
        <div class="card-header">
          <span>文件上传</span>
          <el-button v-if="fileList.length > 0" type="danger" size="small" @click="handleClear">
            清空列表
          </el-button>
        </div>
      </template>

      <el-upload
        ref="uploadRef"
        class="upload-area"
        drag
        :multiple="true"
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleFileSelect"
      >
        <el-icon class="upload-icon" :size="64"><Upload /></el-icon>
        <div class="upload-text">
          <p>将文件拖到此处，或<em>点击上传</em></p>
          <p class="upload-tip">小文件直接上传，大文件自动分片上传</p>
        </div>
      </el-upload>
    </el-card>

    <!-- 文件列表 -->
    <el-card v-if="fileList.length > 0" class="file-list-card">
      <template #header>
        <div class="card-header">
          <span>已上传文件（{{ fileList.length }}）</span>
        </div>
      </template>

      <div class="file-list">
        <div v-for="file in fileList" :key="file.id" class="file-item">
          <div class="file-info">
            <div class="file-icon">
              <el-image
                v-if="isImage(file.type) && file.status === 'success'"
                :ref="(el) => el && (previewImageRefs[file.id] = el)"
                :src="file.url"
                :preview-src-list="previewSrcList"
                :initial-index="previewSrcList.findIndex((url) => url === file.url)"
                :width="60"
                :height="60"
                fit="cover"
                class="file-thumbnail"
                :preview-teleported="true"
              />
              <el-icon v-else :size="40" color="#409eff"><Document /></el-icon>
            </div>
            <div class="file-details">
              <div class="file-name" :title="file.name">{{ file.name }}</div>
              <div class="file-meta">
                <span>{{ formatFileSize(file.size) }}</span>
                <span v-if="file.status === 'uploading'" class="upload-progress">
                  上传中 {{ file.progress }}%
                </span>
                <span v-else-if="file.status === 'error'" class="error-text">
                  {{ file.errorMessage || '上传失败' }}
                </span>
                <span v-else class="success-text">上传成功</span>
              </div>
              <el-progress
                v-if="file.status === 'uploading'"
                :percentage="file.progress"
                :stroke-width="4"
                class="progress-bar"
              />
            </div>
          </div>
          <div class="file-actions">
            <el-button
              v-if="isImage(file.type) && file.status === 'success'"
              type="primary"
              link
              :icon="View"
              @click="previewImageRefs[file.id]?.showPreview()"
            >
              预览
            </el-button>
            <el-button
              v-if="file.status === 'error'"
              type="primary"
              link
              :icon="RefreshRight"
              @click="handleRetry(file)"
            >
              重试
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 空状态提示 -->
    <el-empty v-if="fileList.length === 0" description="暂无上传文件" />
  </div>
</template>

<style lang="scss" scoped>
.file-upload-page {
  padding: 20px;

  .stats-card {
    margin-bottom: 20px;

    .stats-content {
      display: flex;
      flex-wrap: wrap;
      gap: 40px;

      .stat-item {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .stat-label {
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: var(--el-text-color-primary);

          &.success {
            color: var(--el-color-success);
          }

          &.uploading {
            color: var(--el-color-primary);
          }

          &.error {
            color: var(--el-color-danger);
          }
        }
      }
    }
  }

  .upload-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
    }

    .upload-area {
      width: 100%;

      :deep(.el-upload) {
        width: 100%;
      }

      :deep(.el-upload-dragger) {
        width: 100%;
        padding: 40px;
      }

      .upload-icon {
        margin-bottom: 16px;
        color: var(--el-color-primary);
      }

      .upload-text {
        text-align: center;

        p {
          margin: 8px 0;
          font-size: 16px;
          color: var(--el-text-color-regular);

          em {
            font-style: normal;
            color: var(--el-color-primary);
            cursor: pointer;
          }
        }

        .upload-tip {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  .file-list-card {
    .file-list {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .file-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
          border-color: var(--el-color-primary);
          box-shadow: 0 2px 8px rgb(64 158 255 / 10%);
        }

        .file-info {
          display: flex;
          flex: 1;
          gap: 16px;
          min-width: 0;

          .file-icon {
            flex-shrink: 0;
            width: 60px;
            height: 60px;

            .file-thumbnail {
              width: 100%;
              height: 100%;
              overflow: hidden;
              border-radius: 4px;
            }
          }

          .file-details {
            flex: 1;
            min-width: 0;

            .file-name {
              margin-bottom: 8px;
              overflow: hidden;
              text-overflow: ellipsis;
              font-size: 14px;
              font-weight: 500;
              color: var(--el-text-color-primary);
              white-space: nowrap;
            }

            .file-meta {
              display: flex;
              gap: 16px;
              align-items: center;
              font-size: 12px;
              color: var(--el-text-color-secondary);

              .upload-progress {
                color: var(--el-color-primary);
              }

              .success-text {
                color: var(--el-color-success);
              }

              .error-text {
                color: var(--el-color-danger);
              }
            }

            .progress-bar {
              margin-top: 8px;
            }
          }
        }

        .file-actions {
          display: flex;
          flex-shrink: 0;
          gap: 8px;
        }
      }
    }
  }
}

@media (width <= 768px) {
  .file-upload-page {
    padding: 12px;

    .stats-card {
      .stats-content {
        gap: 20px;
      }
    }

    .file-list-card {
      .file-list {
        .file-item {
          flex-direction: column;
          gap: 12px;
          align-items: flex-start;

          .file-actions {
            justify-content: flex-end;
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
