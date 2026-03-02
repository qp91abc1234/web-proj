import { INTERNAL_EVENT_NAME_SET } from './constants'
import type { EventKey, InternalEventName } from './types'

/**
 * 类型守卫：判断事件名是否为内部事件（symbol），并对类型进行收窄。
 */
export const isInternalEventName = (event: EventKey): event is InternalEventName =>
  INTERNAL_EVENT_NAME_SET.has(event as InternalEventName)
