import { requestPost } from '../utils/request'

/**
 * 登录请求参数
 */
export interface LoginParams {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
}

/**
 * 刷新令牌请求参数
 */
export interface RefreshTokenParams {
  /** 刷新令牌 */
  refreshToken: string
}

/**
 * 认证响应数据
 */
export interface AuthResponse {
  /** 访问令牌 */
  token: string
  /** 刷新令牌 */
  refreshToken: string
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
