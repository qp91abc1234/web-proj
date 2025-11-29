import type { Events } from './types'

/**
 * 事件名称常量
 *
 * 使用常量代替字符串字面量，提供更好的：
 * - 类型提示和自动补全
 * - 防止拼写错误
 * - 便于重构和查找引用
 *
 * @example
 * ```ts
 * import { EVENT_NAMES } from '@/common/utils/mitt'
 *
 * // 1. 先在 types.d.ts 中定义事件类型
 * export type Events = {
 *   'user:login': { userId: string; username: string }
 * }
 *
 * // 2. 在这里添加对应常量
 * export const EVENT_NAMES = {
 *   USER_LOGIN: 'user:login'
 * } as const satisfies Record<string, keyof Events>
 *
 * // 3. 使用常量
 * bus.emit(EVENT_NAMES.USER_LOGIN, data)
 * ```
 */
export const EVENT_NAMES = {
  // 在这里添加事件名称常量...
} as const satisfies Record<string, keyof Events>
