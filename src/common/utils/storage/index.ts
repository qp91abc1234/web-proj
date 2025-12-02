/**
 * Storage 工具模块
 */

// 导出类型
export type { StorageType, StorageRefOptions } from './types'
export type { LocalStorage, SessionStorage } from './storage'
export type { LocalStorageKey, SessionStorageKey } from './constants'

// 导出常量
export { LOCAL_STORAGE_KEYS, SESSION_STORAGE_KEYS } from './constants'

// 导出全局对象
export { appLocalStorage, appSessionStorage } from './storage'

// 导出函数
export { createStorageRef } from './storageRef'
