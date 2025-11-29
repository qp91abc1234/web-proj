import mitt, { type Emitter } from 'mitt'
import { getCurrentInstance, onUnmounted } from 'vue'

import type { Events } from './types'

export { EVENT_NAMES } from './constants'

/**
 * 全局事件总线实例（内部使用）
 *
 * 使用 mitt 库实现的轻量级事件总线，用于跨组件通信
 *
 * ⚠️ 不直接暴露，统一通过 `useEventBus()` 使用
 */
const eventBus: Emitter<Events> = mitt<Events>()

/**
 * 事件总线 Composable
 *
 * 提供类型安全的事件监听和发送，统一的事件总线访问入口
 *
 * @param autoCleanup - 是否自动清理监听器
 *   - `true`: 在 Vue 组件中使用，组件卸载时自动清理（默认）
 *   - `false`: 在非组件环境使用（路由守卫、请求拦截器、Pinia Store 等）
 *
 * @returns 事件总线方法
 */
export function useEventBus(autoCleanup = true) {
  const handlers: Array<{ event: keyof Events; handler: any }> = []

  /**
   * 移除单个监听器（内部方法）
   */
  const removeHandler = <K extends keyof Events>(event: K, handler: (data: Events[K]) => void) => {
    eventBus.off(event, handler)
    const index = handlers.findIndex((h) => h.event === event && h.handler === handler)
    if (index > -1) {
      handlers.splice(index, 1)
    }
  }

  /**
   * 清理所有监听器（内部方法）
   */
  const clearAllHandlers = () => {
    handlers.forEach(({ event, handler }) => {
      eventBus.off(event, handler)
    })
    handlers.length = 0
  }

  // 自动清理：在 Vue 组件中使用时
  if (autoCleanup) {
    const instance = getCurrentInstance()
    if (instance) {
      // 在组件环境中，注册清理函数
      onUnmounted(clearAllHandlers)
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
      eventBus.on(event, handler)
      // 始终记录监听器，以便手动清理
      handlers.push({ event, handler })

      return () => removeHandler(event, handler)
    },

    /**
     * 监听一次事件（Promise 方式）
     * @example
     * ```ts
     * // 等待主题切换事件
     * const data = await bus.once('theme:change')
     * console.log('新主题:', data.theme)
     * ```
     */
    once<K extends keyof Events>(event: K): Promise<Events[K]> {
      return new Promise((resolve) => {
        const handler = (data: Events[K]) => {
          eventBus.off(event, handler)
          resolve(data)
        }
        eventBus.on(event, handler)
      })
    },

    /**
     * 取消监听
     */
    off<K extends keyof Events>(event: K, handler?: (data: Events[K]) => void): void {
      if (handler) {
        removeHandler(event, handler)
      } else {
        // 如果没有指定 handler，移除该事件的所有监听器
        eventBus.off(event)
      }
    },

    /**
     * 清除当前实例的所有监听器
     */
    clear: clearAllHandlers,

    /**
     * 获取当前实例注册的事件
     */
    getEvents(): Array<keyof Events> {
      return Array.from(new Set(handlers.map((h) => h.event)))
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
