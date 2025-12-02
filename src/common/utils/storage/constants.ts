import type { LocalStorage, SessionStorage } from './types'

/**
 * localStorage 存储 key 常量
 * 所有 localStorage 的 key 都应该在这里定义
 *
 * ⚠️ 注意：
 * - key 集合必须覆盖 LocalStorage 接口中的所有字段
 * - 常量值必须是 LocalStorage 的合法 key（通常与字段名保持一致）
 */
export const LOCAL_STORAGE_KEYS = {
  // 示例：可以根据实际需求添加
  // theme: 'theme'
} as const satisfies Record<keyof LocalStorage, keyof LocalStorage>

/**
 * sessionStorage 存储 key 常量
 * 所有 sessionStorage 的 key 都应该在这里定义
 *
 * ⚠️ 注意：
 * - key 集合必须覆盖 SessionStorage 接口中的所有字段
 * - 常量值必须是 SessionStorage 的合法 key（通常与字段名保持一致）
 */
export const SESSION_STORAGE_KEYS = {
  // 示例：可以根据实际需求添加
  // tempToken: 'tempToken'
} as const satisfies Record<keyof SessionStorage, keyof SessionStorage>
