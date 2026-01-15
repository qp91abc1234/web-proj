import type { LogTransport, LogExtra, LogRecord } from './types.d'
import { LogLevel } from './types.d'
import { ConsoleTransport } from './transports/console-transport'

/**
 * 日志管理器
 */
export class Logger {
  private transports: LogTransport[]
  private minLevel: LogLevel = LogLevel.DEBUG

  constructor(transports?: LogTransport[]) {
    // 如果没有传入传输器，默认使用控制台传输器
    this.transports = transports && transports.length > 0 ? transports : [new ConsoleTransport()]

    // 生产环境默认只记录 WARN 及以上级别
    if (!import.meta.env.DEV) {
      this.minLevel = LogLevel.WARN
    }
  }

  /**
   * 设置最低日志级别
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level
  }

  /**
   * 记录日志
   */
  private log(level: LogLevel, message: string, extra?: LogExtra, error?: unknown): void {
    // 过滤低于最低级别的日志
    if (level < this.minLevel) {
      return
    }

    const record: LogRecord = {
      level,
      message,
      extra,
      timestamp: new Date().toISOString(),
      error
    }

    // 分发到所有传输器
    this.transports.forEach((transport) => {
      try {
        transport.log(record)
      } catch (e) {
        // 日志系统本身不应该抛出错误
        console.error('[Logger] Transport error:', e)
      }
    })
  }

  /**
   * DEBUG 级别日志
   * 用于详细的调试信息，生产环境通常不输出
   */
  debug(message: string, extra?: LogExtra): void {
    this.log(LogLevel.DEBUG, message, extra)
  }

  /**
   * INFO 级别日志
   * 用于一般性的信息记录，如用户操作、业务流程等
   */
  info(message: string, extra?: LogExtra): void {
    this.log(LogLevel.INFO, message, extra)
  }

  /**
   * WARN 级别日志
   * 用于警告信息，不影响功能但需要关注
   */
  warn(message: string, extra?: LogExtra): void {
    this.log(LogLevel.WARN, message, extra)
  }

  /**
   * ERROR 级别日志
   * 用于错误信息，需要立即关注和处理
   */
  error(message: string, extra?: LogExtra, error?: unknown): void {
    this.log(LogLevel.ERROR, message, extra, error)
  }
}
