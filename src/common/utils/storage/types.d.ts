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
