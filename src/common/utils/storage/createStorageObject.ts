import type { StorageType } from './types'

/**
 * 创建类型安全的 Storage 操作对象
 * @param type - 存储类型：'local' 或 'session'
 * @param storagePrefix - 存储 key 的前缀
 * @returns Storage 操作对象
 *
 * @example
 * ```ts
 * interface UserStorage {
 *   token: string
 *   userInfo: { name: string; age: number }
 * }
 *
 * const storage = createStorageObject<UserStorage>('local', 'app_')
 * storage.set('token', 'abc123')
 * const token = storage.get('token') // string | null
 * ```
 */
export function createStorageObject<T extends object>(
  type: StorageType = 'local',
  storagePrefix: string = ''
) {
  const store = type === 'session' ? sessionStorage : localStorage

  const getFullKey = (key: keyof T): string => `${storagePrefix}${String(key)}`

  return {
    set<K extends keyof T>(key: K, value: T[K]): void {
      try {
        const json = JSON.stringify(value)
        store.setItem(getFullKey(key), json)
      } catch (error) {
        console.error(`[Storage] Failed to set "${String(key)}":`, error)
      }
    },

    get<K extends keyof T>(key: K): T[K] | null {
      try {
        const json = store.getItem(getFullKey(key))
        if (json === null) {
          return null
        }
        return JSON.parse(json) as T[K]
      } catch (error) {
        console.error(`[Storage] Failed to get "${String(key)}":`, error)
        return null
      }
    },

    remove(key: keyof T): void {
      store.removeItem(getFullKey(key))
    },

    has(key: keyof T): boolean {
      return store.getItem(getFullKey(key)) !== null
    },

    /**
     * 清除当前前缀下的所有数据
     * ⚠️ 只清除带有当前前缀的 keys，不会影响其他数据
     */
    clear(): void {
      if (!storagePrefix) {
        // 如果没有前缀，清空整个存储（谨慎使用）
        console.warn('[Storage] 没有设置前缀，将清空整个存储')
        store.clear()
        return
      }

      // 只清除带有当前前缀的 keys
      const keysToRemove: string[] = []
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i)
        if (key && key.startsWith(storagePrefix)) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach((key) => store.removeItem(key))
    },

    /**
     * 获取当前前缀下的所有 keys
     */
    keys(): Array<keyof T> {
      const keys: Array<keyof T> = []
      for (let i = 0; i < store.length; i++) {
        const fullKey = store.key(i)
        if (fullKey && fullKey.startsWith(storagePrefix)) {
          const key = fullKey.substring(storagePrefix.length)
          keys.push(key as keyof T)
        }
      }
      return keys
    }
  }
}
