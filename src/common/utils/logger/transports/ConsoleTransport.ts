import type { LogTransport, LogRecord } from '../types.d'
import { LogLevel } from '../types.d'
import { formatDateTime } from '@/common/utils'

/**
 * 控制台日志传输器
 * 在开发环境提供美化的日志输出，生产环境提供简洁的结构化日志
 */
export class ConsoleTransport implements LogTransport {
  private readonly isDev: boolean

  constructor() {
    this.isDev = import.meta.env.DEV
  }

  log(record: LogRecord): void {
    if (this.isDev) {
      this.logDev(record)
    } else {
      this.logProd(record)
    }
  }

  /**
   * 开发环境：美化的分组日志
   */
  private logDev(record: LogRecord): void {
    const { level, message, extra, timestamp, error } = record

    const levelInfo = this.getLevelInfo(level)
    const tag = extra?.tag ? `[${extra.tag}]` : ''
    const time = formatDateTime(timestamp, { template: 'HH:mm:ss.SSS' })

    if (console.groupCollapsed) {
      console.groupCollapsed(
        // 标题行：等级 + 标签 + 时间
        `%c${levelInfo.label}%c ${tag} @ ${time}`,
        // 主标签：深色和浅色模式下都对比度足够
        `color:#fff;background:${levelInfo.color};padding:2px 6px;border-radius:2px;font-weight:bold;`,
        // 时间：浅灰色
        'color:#9ca3af;font-size:0.9em;'
      )

      if (message) {
        console.log('📝 Message:', message)
      }

      if (extra && Object.keys(extra).length > 0) {
        console.log('📋 Extra:', extra)
      }

      if (error !== undefined) {
        console.error('Error:', error)
      }

      console.groupEnd()
    } else {
      // 降级：不支持分组的控制台
      const method = this.getConsoleMethod(level)
      console[method](`${levelInfo.label} ${tag} ${message}`, {
        timestamp,
        extra,
        error
      })
    }
  }

  /**
   * 生产环境：简洁的结构化日志
   */
  private logProd(record: LogRecord): void {
    const { level, message, extra, timestamp, error } = record
    const method = this.getConsoleMethod(level)

    const logData: any = {
      level: LogLevel[level],
      message,
      timestamp
    }

    if (extra && Object.keys(extra).length > 0) {
      logData.extra = extra
    }

    if (error !== undefined) {
      logData.error = error
    }

    console[method]('[APP]', logData)
  }

  /**
   * 获取日志级别的显示信息
   */
  private getLevelInfo(level: LogLevel): { label: string; color: string } {
    switch (level) {
      case LogLevel.DEBUG:
        return { label: '🐛 DEBUG', color: '#909399' }
      case LogLevel.INFO:
        return { label: 'ℹ️ INFO', color: '#409EFF' }
      case LogLevel.WARN:
        return { label: '⚠️ WARN', color: '#E6A23C' }
      case LogLevel.ERROR:
        return { label: '❌ ERROR', color: '#b91c1c' }
      default:
        return { label: 'LOG', color: '#909399' }
    }
  }

  /**
   * 获取对应的 console 方法
   */
  private getConsoleMethod(level: LogLevel): 'log' | 'info' | 'warn' | 'error' {
    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        return 'log'
      case LogLevel.WARN:
        return 'warn'
      case LogLevel.ERROR:
        return 'error'
      default:
        return 'log'
    }
  }
}
