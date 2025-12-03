/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

/**
 * 日志额外信息
 * 包含日志的附加信息，如标签、用户信息、路由等
 */
export interface LogExtra {
  /**
   * 日志分类标签，方便过滤和检索
   * 例如：'api', 'user', 'router', 'storage' 等
   */
  tag?: string

  /**
   * 用户信息（不要包含敏感数据）
   */
  userId?: string | number

  /**
   * 当前路由
   */
  route?: string

  /**
   * 额外的业务信息
   */
  [key: string]: any
}

/**
 * 日志记录接口
 */
export interface LogRecord {
  level: LogLevel
  message: string
  extra?: LogExtra
  timestamp: string
  error?: unknown
}

/**
 * 日志传输接口
 * 用于后续接入真实的日志上报服务
 */
export interface LogTransport {
  log(record: LogRecord): void
}
