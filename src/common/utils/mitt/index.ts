import mitt, { type Emitter } from 'mitt'
import { getCurrentScope, onScopeDispose } from 'vue'
import { INTERNAL_EVENT_NAMES } from './constants'
import { isInternalEventName } from './utils'

import type {
  AllEvents,
  EventHandlerRecord,
  Events,
  InternalEventName,
  InternalEvents
} from './types'

/**
 * 全局事件总线实例（内部使用）
 *
 * 使用 mitt 库实现的轻量级事件总线，用于跨组件通信
 *
 * ⚠️ 不直接暴露，统一通过 `useEventBus()` 使用
 */
const eventBus: Emitter<AllEvents> = mitt<AllEvents>()

/**
 * 事件总线 Composable
 *
 * 提供类型安全的事件监听和发送，统一的事件总线访问入口。
 *
 * 能力概览：
 * - `on / off / clear / getEvents`：当前实例级监听管理
 * - `offGlobal / clearGlobal / getEventsGlobal`：全局监听管理
 * - 内部事件监听采用懒注册：首次业务监听时注册，实例清空后可再次注册
 *
 * @param autoCleanup - 是否自动清理监听器
 *   - `true`: 在 Vue 组件中使用，组件卸载时自动清理（默认）
 *   - `false`: 在非组件环境使用（路由守卫、请求拦截器、Pinia Store 等）
 *
 * @returns 事件总线方法
 */
export function useEventBus(autoCleanup = true) {
  let hasInternalListenersRegistered = false
  const handlers: EventHandlerRecord[] = []

  const internalEventHandlers = {
    /**
     * 通过内部事件触发：移除所有实例在指定业务事件上的监听器
     */
    [INTERNAL_EVENT_NAMES.OFF_GLOBAL_LISTENERS]: (
      data: InternalEvents[typeof INTERNAL_EVENT_NAMES.OFF_GLOBAL_LISTENERS]
    ) => {
      if (!data) {
        return
      }
      removeHandler(data.event as never)
    },
    /**
     * 通过内部事件触发：清理所有实例的全部监听器
     */
    [INTERNAL_EVENT_NAMES.CLEAR_ALL_LISTENERS]: () => {
      clearAllHandlers()
    }
  } as const satisfies { [K in InternalEventName]: (data: InternalEvents[K]) => void }

  /**
   * 首次业务监听时，批量注册所有内部事件监听
   */
  const registerInternalListenersIfNeeded = () => {
    if (hasInternalListenersRegistered) {
      return
    }

    const internalEvents = Object.getOwnPropertySymbols(
      internalEventHandlers
    ) as InternalEventName[]
    internalEvents.forEach((event) => {
      const handler = internalEventHandlers[event]
      eventBus.on(event, handler)
      handlers.push({ event, handler })
    })
    hasInternalListenersRegistered = true
  }

  /**
   * 移除监听器（内部方法）
   * - 传入 handler: 移除当前实例该事件的指定监听
   * - 不传 handler: 移除当前实例该事件的全部监听
   *
   * 额外策略：
   * - 若当前实例只剩内部事件监听，则会主动清空全部监听，避免内部监听常驻
   */
  const removeHandler = <K extends keyof Events>(event: K, handler?: (data: Events[K]) => void) => {
    for (let i = handlers.length - 1; i >= 0; i -= 1) {
      const item = handlers[i]
      if (item.event === event && (!handler || item.handler === handler)) {
        eventBus.off(item.event, item.handler)
        handlers.splice(i, 1)
      }
    }

    // 仅剩内部事件监听时，清理该实例全部监听器（包含内部监听）
    if (
      handlers.length <= Object.getOwnPropertySymbols(INTERNAL_EVENT_NAMES).length &&
      handlers.every((item) => isInternalEventName(item.event))
    ) {
      clearAllHandlers()
    }
  }

  /**
   * 清理当前实例注册的所有监听器（内部方法）
   */
  const clearAllHandlers = () => {
    handlers.forEach(({ event, handler }) => {
      eventBus.off(event, handler)
    })
    handlers.length = 0
    hasInternalListenersRegistered = false
  }

  // 自动清理：在 Vue 组件中使用时
  if (autoCleanup) {
    const scope = getCurrentScope()
    if (scope) {
      // 在任意 Vue 作用域中注册清理函数（组件 / effectScope 等）
      onScopeDispose(clearAllHandlers)
    } else if (import.meta.env.DEV) {
      // 开发环境提示：不在组件中使用，无法自动清理
      console.warn(
        '[useEventBus] 当前不在 Vue 组件环境中，监听器不会自动清理。' +
          '建议在非组件环境中传入 autoCleanup: false'
      )
    }
  }

  return {
    /**
     * 发送事件
     */
    emit<K extends keyof Events>(event: K, data: Events[K]): void {
      eventBus.emit(event, data)
    },

    /**
     * 监听事件
     * @returns 返回取消监听的函数
     */
    on<K extends keyof Events>(event: K, handler: (data: Events[K]) => void): () => void {
      registerInternalListenersIfNeeded()
      eventBus.on(event, handler)
      // 始终记录监听器，以便手动清理
      handlers.push({ event, handler })

      return () => removeHandler(event, handler)
    },

    /**
     * 监听一次事件（Promise 方式）
     *
     * 说明：
     * - Promise 仅在事件触发时 resolve
     * - 若监听在触发前被 `off / offGlobal / clear / clearGlobal` 移除，则不会自动 resolve/reject
     *   （调用方如需兜底可自行加超时控制）
     *
     * @example
     * ```ts
     * // 等待主题切换事件
     * const data = await bus.once('theme:change')
     * console.log('新主题:', data.theme)
     * ```
     */
    once<K extends keyof Events>(event: K): Promise<Events[K]> {
      registerInternalListenersIfNeeded()
      return new Promise((resolve) => {
        const handler = (data: Events[K]) => {
          removeHandler(event, handler)
          resolve(data)
        }
        eventBus.on(event, handler)
        // once 监听也纳入 handlers 管理，确保 clear/offGlobal 能统一清理
        handlers.push({ event, handler })
      })
    },

    /**
     * 清除当前实例在指定事件上的监听
     * - 传入 handler: 清除该事件下的指定监听
     * - 不传 handler: 清除该事件下的全部监听
     */
    off<K extends keyof Events>(event: K, handler?: (data: Events[K]) => void): void {
      removeHandler(event, handler)
    },

    /**
     * 清除当前实例注册的所有监听器
     */
    clear: clearAllHandlers,

    /**
     * 获取当前实例注册的事件
     */
    getEvents(): Array<keyof Events> {
      return Array.from(
        new Set(
          handlers
            .map((h) => h.event)
            .filter((event): event is keyof Events => !isInternalEventName(event))
        )
      )
    },

    /**
     * 全局清除指定事件：通过发送内部事件，通知所有 useEventBus 实例移除该事件监听器
     * （包含当前实例）
     */
    offGlobal<K extends keyof Events>(event: K): void {
      eventBus.emit(INTERNAL_EVENT_NAMES.OFF_GLOBAL_LISTENERS, { event })
    },

    /**
     * 全局清除：通过发送内部事件，通知所有 useEventBus 实例清理各自监听器
     * （包含当前实例）
     */
    clearGlobal(): void {
      eventBus.emit(INTERNAL_EVENT_NAMES.CLEAR_ALL_LISTENERS)
    },

    /**
     * 获取当前全局事件总线中已注册的业务事件（排除内部事件）
     */
    getEventsGlobal(): Array<keyof Events> {
      const globalEvents: Array<keyof Events> = []
      eventBus.all.forEach((handlerList, eventName) => {
        if (eventName === '*') {
          return
        }
        if (isInternalEventName(eventName) || handlerList.length === 0) {
          return
        }
        globalEvents.push(eventName)
      })
      return globalEvents
    }
  }
}

// ==================== 开发环境调试 ====================
if (import.meta.env.DEV) {
  // 开发环境下打印所有事件（可选）
  eventBus.on('*', (type, data) => {
    console.log(`[EventBus] ${String(type)}`, data)
  })
}
