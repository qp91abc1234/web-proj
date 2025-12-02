import { onScopeDispose, ref, watch } from 'vue'
import { createStorageObject } from './createStorageObject'
import type { StorageRefOptions } from './types'

/**
 * Storage 事件管理器（单例）
 * 用于统一管理所有 storageRef 的跨标签页同步事件监听
 */
class StorageEventManager {
  private static instance: StorageEventManager | null = null
  private listeners = new Map<string, Set<(event: StorageEvent) => void>>()
  private isListening = false

  private constructor() {}

  static getInstance(): StorageEventManager {
    if (!StorageEventManager.instance) {
      StorageEventManager.instance = new StorageEventManager()
    }
    return StorageEventManager.instance
  }

  /**
   * 全局 storage 事件处理器
   */
  private handleStorageEvent = (event: StorageEvent) => {
    if (!event.key) return

    const callbacks = this.listeners.get(event.key)
    if (callbacks) {
      callbacks.forEach((callback) => callback(event))
    }
  }

  /**
   * 注册监听器
   */
  on(key: string, callback: (event: StorageEvent) => void): void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    this.listeners.get(key)!.add(callback)

    // 如果还没有添加全局监听，则添加
    if (!this.isListening) {
      window.addEventListener('storage', this.handleStorageEvent)
      this.isListening = true
    }
  }

  /**
   * 移除监听器
   */
  off(key: string, callback: (event: StorageEvent) => void): void {
    const callbacks = this.listeners.get(key)
    if (callbacks) {
      callbacks.delete(callback)

      // 如果该 key 没有监听器了，删除该 key
      if (callbacks.size === 0) {
        this.listeners.delete(key)
      }
    }

    // 如果所有 key 都没有监听器了，移除全局监听
    if (this.listeners.size === 0 && this.isListening) {
      window.removeEventListener('storage', this.handleStorageEvent)
      this.isListening = false
    }
  }

  /**
   * 获取当前监听器数量（用于调试）
   */
  getListenerCount(): number {
    let count = 0
    this.listeners.forEach((callbacks) => {
      count += callbacks.size
    })
    return count
  }
}

/**
 * 创建与 localStorage 同步的响应式引用
 * @param name - 存储的 key 名称
 * @param defaultValue - 默认值
 * @param options - 配置选项
 * @returns 响应式引用
 *
 * @example
 * ```ts
 * // 基础用法（自动跨标签页同步）
 * const theme = createStorageRef('theme', 'light')
 *
 * // 带回调
 * const count = createStorageRef('count', 0, {
 *   onChange: (val) => console.log('count changed:', val)
 * })
 *
 * // 使用 sessionStorage（sessionStorage 不支持跨标签页同步）
 * const token = createStorageRef('token', '', { type: 'session' })
 *
 * // 禁用跨标签页同步
 * const localData = createStorageRef('data', {}, { sync: false })
 * ```
 */
export function createStorageRef<T>(
  name: string,
  defaultValue: T,
  options: StorageRefOptions<T> = {}
) {
  const { type = 'local', onChange, immediate = false, sync = true } = options

  const storage = createStorageObject<Record<string, T>>(type, 'storageRef_')
  const fullKey = `storageRef_${name}`

  // 初始化：从存储中读取，如果不存在则使用默认值
  const storedValue = storage.get(name)
  const initialValue = storedValue !== null ? storedValue : defaultValue

  const refValue = ref<T>(initialValue)

  // 标记：是否是由当前标签页触发的更新（用于避免重复触发）
  let isLocalUpdate = false

  // 监听变化并同步到存储
  watch(
    refValue,
    (newValue) => {
      isLocalUpdate = true
      storage.set(name, newValue)
      onChange?.(newValue)
      // 使用 setTimeout 确保同步代码执行完后再重置标记
      setTimeout(() => {
        isLocalUpdate = false
      }, 0)
    },
    {
      immediate,
      deep: typeof defaultValue === 'object' && defaultValue !== null
    }
  )

  // 跨标签页同步：监听其他标签页的存储变化
  // 注意：sessionStorage 不支持跨标签页通信
  if (sync && type === 'local') {
    const eventManager = StorageEventManager.getInstance()

    const handleStorageChange = (event: StorageEvent) => {
      // 如果是当前标签页触发的更新，忽略（避免循环）
      if (isLocalUpdate) {
        return
      }

      // 处理删除操作
      if (event.newValue === null) {
        refValue.value = defaultValue
        return
      }

      // 更新为新值
      try {
        const newValue = JSON.parse(event.newValue) as T
        refValue.value = newValue
      } catch (error) {
        console.error(`[Storage] 跨标签页同步失败 "${name}":`, error)
      }
    }

    // 注册到事件管理器（单例模式，全局只有一个 storage 监听器）
    eventManager.on(fullKey, handleStorageChange)

    // 自动清理：在 Vue 作用域销毁时移除监听器
    onScopeDispose(() => {
      eventManager.off(fullKey, handleStorageChange)
    })
  }

  return refValue
}
