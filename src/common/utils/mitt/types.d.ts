import { INTERNAL_EVENT_NAMES } from './constants'

/**
 * 内部事件名联合类型（symbol）。
 */
export type InternalEventName = (typeof INTERNAL_EVENT_NAMES)[keyof typeof INTERNAL_EVENT_NAMES]

/**
 * 内部事件 payload 映射：
 * - OFF_GLOBAL_LISTENERS: 指定要全局移除的业务事件名
 * - CLEAR_ALL_LISTENERS: 清空所有监听器，无需 payload
 */
export type InternalEvents = {
  [INTERNAL_EVENT_NAMES.OFF_GLOBAL_LISTENERS]: { event: keyof Events }
  [INTERNAL_EVENT_NAMES.CLEAR_ALL_LISTENERS]: void
}

/**
 * 事件总线事件类型定义
 *
 * 在这里定义所有需要使用的事件及其参数类型，确保类型安全
 *
 * @example
 * ```ts
 * // 定义事件
 * export type Events = {
 *   'user:login': { userId: string; username: string }
 *   'user:logout': void
 *   'theme:change': { theme: 'light' | 'dark' }
 * }
 * ```
 */
export type Events = {
  // 在这里添加事件类型定义...
}

/**
 * 所有事件类型（业务事件 + 内部事件）。
 */
export type AllEvents = Events & InternalEvents
export type EventKey = keyof AllEvents
export type EventHandlerRecord = { event: EventKey; handler: (data: any) => void }
