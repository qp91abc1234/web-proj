import { createStorageObject } from './createStorageObject'

/**
 * 应用全局 localStorage 接口定义
 * 用于定义整个应用使用的 localStorage 数据结构
 *
 * ⚠️ 注意：此接口的 key 必须与 constants.ts 中的 LOCAL_STORAGE_KEYS 一一对应
 */
export interface LocalStorage {
  // theme: 'light' | 'dark'
}

/**
 * 应用全局 sessionStorage 接口定义
 * 用于定义整个应用使用的 sessionStorage 数据结构
 *
 * ⚠️ 注意：此接口的 key 必须与 constants.ts 中的 SESSION_STORAGE_KEYS 一一对应
 */
export interface SessionStorage {
  // tempToken: string
}

/**
 * 基于 createStorageObject 创建的全局 localStorage 对象
 * 使用 'app_' 作为前缀，避免与其他存储冲突
 */
export const appLocalStorage = createStorageObject<LocalStorage>('local', 'app_')

/**
 * 基于 createStorageObject 创建的全局 sessionStorage 对象
 * 使用 'app_' 作为前缀，避免与其他存储冲突
 */
export const appSessionStorage = createStorageObject<SessionStorage>('session', 'app_')
