import type { App, ComponentPublicInstance } from 'vue'
import { ElMessage } from 'element-plus'

import { logger } from './logger'

/**
 * 标记是否已经安装过错误处理
 */
let installed = false

/**
 * 全局错误处理安装函数
 * 在应用创建阶段调用一次即可
 */
export function setupErrorHandling(app: App<Element>) {
  // 防止重复安装
  if (installed) {
    logger.warn('错误处理已经安装，跳过重复安装')
    return
  }
  installed = true

  /**
   * 1. Vue 应用内部错误（组件渲染、生命周期、watch 等）
   */
  app.config.errorHandler = (err, instance, info) => {
    const vm = instance as ComponentPublicInstance | null

    logger.error(
      err instanceof Error ? err.message : 'Vue 组件错误',
      {
        tag: 'error:vue',
        info,
        componentName: vm?.$options?.name,
        propsData: vm?.$props
      },
      err
    )
  }

  /**
   * 2. 同步 JS 运行时错误 & 资源加载错误
   */
  window.addEventListener(
    'error',
    (event) => {
      // 资源加载错误（如脚本、样式、图片等）
      const target = event.target as HTMLElement | null
      const isResourceError =
        target &&
        (target.tagName === 'SCRIPT' ||
          target.tagName === 'LINK' ||
          target.tagName === 'IMG' ||
          target.tagName === 'VIDEO' ||
          target.tagName === 'AUDIO')

      if (isResourceError) {
        logger.error(
          `资源加载失败: ${target.tagName}`,
          {
            tag: 'error:resource',
            tagName: target.tagName,
            src: (target as HTMLImageElement).src || (target as HTMLLinkElement).href
          },
          event
        )
        return
      }

      // JS 运行时错误
      logger.error(
        event.message || 'JS 运行时错误',
        {
          tag: 'error:js',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        },
        event.error || event
      )
    },
    true
  )

  /**
   * 3. 未处理的 Promise 异常
   * 统一在这里对各类错误进行分类、包装、日志记录和用户提示
   */
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason

    // 3.1 API 业务错误（后端返回的非 200 状态）
    if (reason && typeof reason === 'object' && (reason as any).isApiBusinessError) {
      const errorResponse = reason
      const { data, config } = errorResponse.response

      // 包装成标准 Error 对象
      const bizError = Object.assign(new Error(data.message || '业务错误'), {
        isApiBusinessError: true as const,
        status: data.status,
        data: data.data,
        config,
        raw: data
      })

      // 记录日志
      logger.error(
        data.message || '业务错误',
        {
          tag: 'error:business',
          status: data.status,
          url: config?.url,
          method: config?.method,
          response: data,
          unhandled: true
        },
        bizError
      )

      // 用户提示：优先使用后端返回的 message
      ElMessage.error(data.message || '操作失败，请稍后重试')

      return
    }

    // 3.2 Axios 网络错误（超时、500、404 等）
    if (reason && typeof reason === 'object' && (reason as any).isAxiosError) {
      const axiosError = reason as any
      const response = axiosError.response
      const responseData = response?.data

      // 优先使用后端返回的业务错误信息
      const errorMessage = responseData?.message || axiosError.message || '网络请求失败'
      const errorCode = responseData?.code || axiosError.code
      const httpStatus = response?.status

      // 记录日志
      logger.error(
        errorMessage,
        {
          tag: 'error:http',
          url: axiosError.config?.url,
          method: axiosError.config?.method,
          status: httpStatus,
          code: errorCode,
          unhandled: true
        },
        axiosError
      )

      // 用户提示：优先使用后端返回的 message，否则根据错误类型给出友好文案
      let message = errorMessage

      if (!responseData?.message) {
        // 如果没有后端消息，根据错误类型给出默认提示
        if (axiosError.code === 'ECONNABORTED') {
          message = '请求超时，请检查网络'
        } else {
          message = '服务器开小差了，请稍后重试'
        }
      }

      ElMessage.error(message)

      return
    }

    // 3.3 其他 Promise 异常（普通 Error 或其他类型）
    logger.error(
      reason instanceof Error ? reason.message : '未处理的 Promise 异常',
      {
        tag: 'error:promise',
        unhandled: true
      },
      reason
    )
  })
}
