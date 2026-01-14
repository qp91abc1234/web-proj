import { requestPost, requestGet } from '../utils/request'
import type { CaptchaResponse, LoginParams, RefreshTokenParams, AuthResponse } from '../types/auth'

/**
 * 获取验证码
 * @returns 验证码响应数据
 */
export function getCaptcha(): Promise<CaptchaResponse> {
  return requestGet<CaptchaResponse>('/auth/captcha').then((res) => res.data)
}

/**
 * 用户登录
 * @param params 登录参数
 * @returns 认证响应数据
 */
export function login(params: LoginParams): Promise<AuthResponse> {
  return requestPost<AuthResponse>('/auth/login', params).then((res) => res.data)
}

/**
 * 刷新访问令牌
 * @param params 刷新令牌参数
 * @returns 认证响应数据
 */
export function refreshToken(params: RefreshTokenParams): Promise<AuthResponse> {
  return requestPost<AuthResponse>('/auth/refresh', params).then((res) => res.data)
}
