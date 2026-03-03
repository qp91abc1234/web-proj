import mitt from 'mitt'

import { INTERNAL_EVENT_NAMES } from './constants'

import type { Events } from './types'

const internalEventBus = mitt()

/**
 * 内部控制事件总线（仅负责全局清理相关事件）。
 *
 * 说明：
 * - 业务监听副本由 useEventBus 维护，并通过 options.handlers 传入
 * - 本模块只负责：
 *   1) 懒注册/解绑内部控制事件监听
 *   2) 发送全局 off/clear 控制事件
 */
export function useInternalEventBus(options: {
  onOffGlobalListeners: (event: keyof Events) => void
  onClearAllListeners: () => void
}) {
  let hasInternalListenersRegistered = false

  const offGlobalHandler = (data: unknown) => {
    if (!data || typeof data !== 'object' || !('event' in data)) {
      return
    }
    options.onOffGlobalListeners((data as { event: keyof Events }).event)
  }

  const clearAllHandler = () => {
    options.onClearAllListeners()
  }

  const registerInternalListenersIfNeeded = () => {
    if (hasInternalListenersRegistered) {
      return
    }
    internalEventBus.on(INTERNAL_EVENT_NAMES.OFF_GLOBAL_LISTENERS, offGlobalHandler)
    internalEventBus.on(INTERNAL_EVENT_NAMES.CLEAR_ALL_LISTENERS, clearAllHandler)
    hasInternalListenersRegistered = true
  }

  const clearInternalListeners = () => {
    if (!hasInternalListenersRegistered) {
      return
    }
    internalEventBus.off(INTERNAL_EVENT_NAMES.OFF_GLOBAL_LISTENERS, offGlobalHandler)
    internalEventBus.off(INTERNAL_EVENT_NAMES.CLEAR_ALL_LISTENERS, clearAllHandler)
    hasInternalListenersRegistered = false
  }

  return {
    registerInternalListenersIfNeeded,
    clearInternalListeners,
    emitOffGlobalListeners(event: keyof Events): void {
      internalEventBus.emit(INTERNAL_EVENT_NAMES.OFF_GLOBAL_LISTENERS, { event })
    },
    emitClearAllListeners(): void {
      internalEventBus.emit(INTERNAL_EVENT_NAMES.CLEAR_ALL_LISTENERS)
    }
  }
}
