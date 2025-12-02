import type { AxiosRequestConfig } from 'axios'

import { instance, type ApiResponse } from './request'

export type { ApiResponse } from './request'

/**
 * 类型化请求方法
 * - T 为后端 data 字段的类型
 *
 * @example
 * // 1. POST 请求
 * interface LoginResult { token: string }
 * const res = await request<LoginResult>({
 *   url: '/login',
 *   method: 'POST',
 *   data: { username: 'admin', password: '123456' }
 * })
 *
 * @example
 * // 2. GET 请求
 * const res = await request<UserInfo>({ url: '/user/info', method: 'GET' })
 */
export function request<T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return instance(config) as Promise<ApiResponse<T>>
}

/**
 * GET 请求语法糖
 * @param url - 请求地址
 * @param params - 查询参数
 * @param config - 额外 Axios 配置
 *
 * @example
 * const res = await requestGet<UserInfo>('/user/info', { id: '123' })
 */
export function requestGet<T = any>(
  url: string,
  params?: Record<string, any>,
  config: AxiosRequestConfig = {}
): Promise<ApiResponse<T>> {
  return request<T>({
    url,
    method: 'GET',
    params,
    ...config
  })
}

/**
 * POST 请求语法糖
 * @param url - 请求地址
 * @param data - 请求体
 * @param config - 额外 Axios 配置
 *
 * @example
 * const res = await requestPost<LoginResult>('/login', { username: 'admin', password: '123456' })
 */
export function requestPost<T = any, D = any>(
  url: string,
  data?: D,
  config: AxiosRequestConfig<D> = {}
): Promise<ApiResponse<T>> {
  return request<T>({
    url,
    method: 'POST',
    data,
    ...config
  })
}
