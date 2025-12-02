export interface ErrorContext {
  /**
   * 错误大类：方便后续做统计和过滤
   */
  type?: 'js' | 'promise' | 'vue' | 'http' | 'business' | 'resource' | 'unknown'

  /**
   * 额外上下文信息，例如：接口地址、路由、用户操作描述等
   */
  message?: string
  [key: string]: any
}

/**
 * 统一错误日志函数
 * 当前阶段仅做控制台打印，后续可以很方便地替换为真实上报接口
 */
export function logError(error: unknown, context: ErrorContext = {}) {
  const time = new Date().toISOString()

  // 生产环境也建议至少保留一份简单日志，方便线上排查
  if (import.meta.env.DEV && console.groupCollapsed) {
    console.groupCollapsed(
      '%c[AppError]%c ' + (context.type || 'unknown') + ` @ ${time}`,
      'color:#fff;background:#f56c6c;padding:2px 4px;border-radius:2px;',
      'color:#909399;'
    )
    console.log('Context:', context)
    console.error('Error:', error)
    console.groupEnd()
  } else {
    console.error('[AppError]', { time, context, error })
  }
}
