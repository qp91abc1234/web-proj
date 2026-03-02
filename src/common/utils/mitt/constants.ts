import type { Events } from './types'

/**
 * 内部事件名称（仅事件总线内部使用）
 *
 * 约定：
 * - 使用 Symbol 避免与业务字符串事件名冲突
 * - 通过对象集中管理，方便后续扩展多个内部事件
 */
export const INTERNAL_EVENT_NAMES = {
  OFF_GLOBAL_LISTENERS: Symbol('event-bus:off-global-listeners'),
  CLEAR_ALL_LISTENERS: Symbol('event-bus:clear-all-listeners')
} as const

/**
 * 内部事件名集合，用于快速判断某个事件是否为内部事件。
 */
export const INTERNAL_EVENT_NAME_SET = new Set(Object.values(INTERNAL_EVENT_NAMES))

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
