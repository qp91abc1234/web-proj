/**
 * Storage 工具模块
 */

import { createStorageObject } from './createStorageObject'
import type { LocalStorage, SessionStorage } from './types'

// 导出类型
export { createStorageRef } from './storageRef'

// 导出常量
export { LOCAL_STORAGE_KEYS, SESSION_STORAGE_KEYS } from './constants'

// 导出全局对象（基于 createStorageObject 创建）
export const appLocalStorage = createStorageObject<LocalStorage>('local', 'app_')
export const appSessionStorage = createStorageObject<SessionStorage>('session', 'app_')
