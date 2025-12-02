/**
 * Storage 类型
 */
export type StorageType = 'local' | 'session'

/**
 * createStorageRef 的配置选项
 */
export interface StorageRefOptions<T> {
  /** 存储类型 */
  type?: StorageType
  /** 值变化时的回调函数 */
  onChange?: (value: T) => void
  /** 是否立即执行回调 */
  immediate?: boolean
  /** 是否启用跨标签页同步（默认 true） */
  sync?: boolean
}

/**
 * 应用全局 localStorage 接口定义（真源头）
 * 用于定义整个应用使用的 localStorage 数据结构
 *
 * ⚠️ 注意：
 * - 此接口的 key 会作为类型约束，驱动 LOCAL_STORAGE_KEYS 的定义
 * - 修改此接口后，需要同步在 constants.ts 的 LOCAL_STORAGE_KEYS 中添加对应常量
 */
export interface LocalStorage {
  // 在这里根据实际业务添加字段，例如：
  // theme: 'light' | 'dark'
}

/**
 * 应用全局 sessionStorage 接口定义（真源头）
 * 用于定义整个应用使用的 sessionStorage 数据结构
 *
 * ⚠️ 注意：
 * - 此接口的 key 会作为类型约束，驱动 SESSION_STORAGE_KEYS 的定义
 * - 修改此接口后，需要同步在 constants.ts 的 SESSION_STORAGE_KEYS 中添加对应常量
 */
export interface SessionStorage {
  // 在这里根据实际业务添加字段，例如：
  // tempToken: string
}
