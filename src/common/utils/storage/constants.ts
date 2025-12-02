/**
 * localStorage 存储 key 常量
 * 所有 localStorage 的 key 都应该在这里定义
 *
 * ⚠️ 注意：添加新的 key 后，需要在 storage.ts 的 LocalStorage 接口中添加对应的类型定义
 */
export const LOCAL_STORAGE_KEYS = {
  // 示例：可以根据实际需求添加
  // theme: 'theme'
} as const

/**
 * sessionStorage 存储 key 常量
 * 所有 sessionStorage 的 key 都应该在这里定义
 *
 * ⚠️ 注意：添加新的 key 后，需要在 storage.ts 的 SessionStorage 接口中添加对应的类型定义
 */
export const SESSION_STORAGE_KEYS = {
  // 示例：可以根据实际需求添加
  // tempToken: 'tempToken'
} as const

/**
 * localStorage key 的类型
 */
export type LocalStorageKey = keyof typeof LOCAL_STORAGE_KEYS

/**
 * sessionStorage key 的类型
 */
export type SessionStorageKey = keyof typeof SESSION_STORAGE_KEYS
