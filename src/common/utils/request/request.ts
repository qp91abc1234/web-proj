import axios, { type AxiosInstance, type AxiosError, type AxiosResponse } from 'axios'

import { useUserStore } from '@/store/modules/userStore'

/**
 * 刷新 token 队列中的任务
 * 当刷新成功时重新发起原请求；失败时直接 reject 原响应/错误
 */
interface PendingTask {
  resolve: () => void
  reject: (reason?: any) => void
}

let refreshing = false
const queue: PendingTask[] = []

/**
 * 共享 Axios 实例
 * 挂载了统一的请求/响应拦截器
 */
export const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 3000
})

/**
 * 请求拦截：自动注入 Token
 */
instance.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers = config.headers ?? {}
      config.headers.authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error: AxiosError) => {
    // 请求还没发出去就失败（例如配置错误）
    // 不在这里做 UI 提示与日志上报，交由业务层或全局兜底处理
    return Promise.reject(error)
  }
)

/**
 * 响应拦截：
 * - 根据 HTTP 状态码和 code 字段处理错误
 * - TOKEN_EXPIRED: 续签 token
 * - TOKEN_INVALID: 清除 token，跳转登录
 * - 其他错误: 正常 reject
 */
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 成功响应（HTTP 200）- 直接返回 data
    return response.data
  },
  (error: AxiosError<{ code: string; message: string }>) => {
    const userStore = useUserStore()
    const { response, config } = error

    // 没有响应（网络错误、超时等）
    if (!response) {
      return Promise.reject(error)
    }

    const { status, data } = response

    // Token 过期 - 续签
    if (status === 401 && data.code === 'TOKEN_EXPIRED') {
      if (!refreshing) {
        refreshing = true
        userStore
          .refresh()
          .then(() => {
            queue.forEach(({ resolve }) => resolve())
          })
          .catch(() => {
            userStore.logout()
            queue.forEach(({ reject }) => reject(error))
          })
          .finally(() => {
            refreshing = false
            queue.length = 0
          })
      }

      // 将当前请求挂起，等待刷新结果
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: () => resolve(instance(config!)),
          reject
        })
      })
    }

    // Token 无效 - 清除 token，跳转登录
    if (status === 401 && data.code === 'TOKEN_INVALID') {
      userStore.logout()
      // 可以在这里跳转到登录页
      // router.push('/login')
    }

    return Promise.reject(error)
  }
)
