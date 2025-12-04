import ansi from 'ansi-colors'

/**
 * 日志级别类型
 * - info: 普通信息（青色标签）
 * - success: 成功信息（绿亮标签）
 * - error: 错误信息（红色标签）
 * - verbose: 详细日志（青色标签，仅在 verbose 模式下显示）
 */
export type LogLevel = 'info' | 'success' | 'error' | 'verbose'

/**
 * 日志函数类型
 */
export interface Logger {
  (level: LogLevel, tag: string, message: string, indent?: boolean): void
}

/**
 * 创建日志记录器
 * @param verbose - 是否启用详细日志模式
 * @returns 日志函数
 *
 * @example
 * ```ts
 * const log = createLogger(true)
 * log('info', 'my-plugin', '开始处理...')
 * log('success', 'my-plugin', '处理完成！')
 * log('verbose', 'my-plugin', '详细信息...') // 只在 verbose=true 时显示
 * log('success', 'my-plugin', '文件详情...', true) // 带缩进
 * ```
 */
export function createLogger(verbose = false): Logger {
  const colors: Record<LogLevel, (text: string) => string> = {
    info: ansi.cyan,
    success: ansi.greenBright,
    error: ansi.red,
    verbose: ansi.cyan
  }

  return (level: LogLevel, tag: string, message: string, indent = false) => {
    // verbose 级别的日志只在详细模式下显示
    if (level === 'verbose' && !verbose) return

    const prefix = indent ? '  ' : colors[level](`[${tag}]`) + ' '
    const logFn = level === 'error' ? console.error : console.log

    logFn(prefix + message)
  }
}
