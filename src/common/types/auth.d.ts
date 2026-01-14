/**
 * 验证码响应数据
 */
export interface CaptchaResponse {
  /** 验证码ID */
  captchaId: string
  /** SVG图片数据 */
  svg: string
}

/**
 * 登录请求参数
 */
export interface LoginParams {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
  /** 验证码ID */
  captchaId: string
  /** 验证码 */
  captchaCode: string
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
  /** 用户ID */
  userId: number
  /** 访问令牌 */
  token: string
  /** 刷新令牌 */
  refreshToken: string
}
