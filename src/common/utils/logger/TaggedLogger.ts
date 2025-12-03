import type { LogExtra } from './types'
import { Logger } from './Logger'

/**
 * 带标签的日志器
 * 自动为所有日志添加固定的 tag
 */
export class TaggedLogger {
  constructor(
    private logger: Logger,
    private tag: string
  ) {}

  debug(message: string, extra?: LogExtra): void {
    this.logger.debug(message, { ...(extra || {}), tag: this.tag })
  }

  info(message: string, extra?: LogExtra): void {
    this.logger.info(message, { ...(extra || {}), tag: this.tag })
  }

  warn(message: string, extra?: LogExtra): void {
    this.logger.warn(message, { ...(extra || {}), tag: this.tag })
  }

  error(message: string, extra?: LogExtra, error?: unknown): void {
    this.logger.error(message, { ...(extra || {}), tag: this.tag }, error)
  }
}
