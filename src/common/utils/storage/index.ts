/**
 * Storage 工具模块
 *
 * @example
 * ```ts
 * // 使用 createStorageObject 创建自定义存储对象
 * import { createStorageObject } from '@/common/utils/storage'
 *
 * // 使用全局存储对象
 * import { appLocalStorage, appSessionStorage } from '@/common/utils/storage'
 *
 * // 使用 createStorageRef 创建响应式存储引用
 * import { createStorageRef } from '@/common/utils/storage'
 * ```
 */

// 导出类型
export type { StorageType, StorageRefOptions } from './types'
export type { LocalStorage, SessionStorage } from './storage'
export type { LocalStorageKey, SessionStorageKey } from './constants'

// 导出常量
export { LOCAL_STORAGE_KEYS, SESSION_STORAGE_KEYS } from './constants'

// 导出函数
export { createStorageObject } from './createStorageObject'
export { createStorageRef } from './storageRef'

// 导出全局对象
export { appLocalStorage, appSessionStorage } from './storage'
