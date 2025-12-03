import { Logger } from './Logger'

export { LogLevel } from './types'

/**
 * 全局日志实例
 * 默认使用控制台传输器（在 Logger 构造函数中自动创建）
 */
const logger = new Logger()

/**
 * 导出全局日志实例
 *
 * @example
 * // 基础使用
 * import { logger } from '@/common/utils/logger'
 *
 * logger.debug('调试信息', { userId: 123 })
 * logger.info('用户登录成功', { userId: 123, username: 'admin' })
 * logger.warn('请求耗时过长', { url: '/api/data', duration: 3000 })
 * logger.error('接口请求失败', { url: '/api/data' }, error)
 */
export { logger }
