import axios, { type AxiosInstance, type AxiosError } from 'axios'

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
 * - 统一处理 401（基于 data.status）
 * - 统一校验 data.status !== 200
 * - 其他情况返回 data 本身
 */
instance.interceptors.response.use(
  (response: any) => {
    const userStore = useUserStore()
    const { data, config } = response

    // 1. 处理自定义 401（未登录 / token 过期）
    if (data.status === 401) {
      if (!refreshing) {
        refreshing = true
        userStore
          .refresh()
          .then(() => {
            queue.forEach(({ resolve }) => resolve())
          })
          .catch(() => {
            userStore.logout()
            queue.forEach(({ reject }) => reject(response))
          })
          .finally(() => {
            refreshing = false
            queue.length = 0
          })
      }

      // 将当前请求挂起，等待刷新结果
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: () => resolve(instance(config)),
          reject
        })
      })
    }

    // 2. 非 200 状态统一视为 API 业务错误
    // 给 response 打上标记，方便全局错误处理快速识别
    if (data.status !== 200) {
      return Promise.reject({
        isApiBusinessError: true,
        response
      })
    }

    // 3. 成功：直接返回 data（保持你原有行为）
    return data
  },
  (error: AxiosError) => {
    // 网络错误、超时、非 2xx HTTP 状态等
    // 统一向上抛出，由业务层或全局异常处理决定后续行为
    return Promise.reject(error)
  }
)
