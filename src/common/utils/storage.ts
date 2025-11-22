import { ref, watch } from 'vue'

type StorageType = 'local' | 'session'

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

    clear(): void {
      store.clear()
    }
  }
}

/**
 * createStorageRef 的配置选项
 */
interface StorageRefOptions<T> {
  /** 存储类型 */
  type?: StorageType
  /** 值变化时的回调函数 */
  onChange?: (value: T) => void
  /** 是否立即执行回调 */
  immediate?: boolean
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
 * // 基础用法
 * const theme = createStorageRef('theme', 'light')
 *
 * // 带回调
 * const count = createStorageRef('count', 0, {
 *   onChange: (val) => console.log('count changed:', val)
 * })
 *
 * // 使用 sessionStorage
 * const token = createStorageRef('token', '', { type: 'session' })
 * ```
 */
export function createStorageRef<T>(
  name: string,
  defaultValue: T,
  options: StorageRefOptions<T> = {}
) {
  const { type = 'local', onChange, immediate = false } = options

  const storage = createStorageObject<Record<string, T>>(type, 'storageRef_')

  // 初始化：从存储中读取，如果不存在则使用默认值
  const storedValue = storage.get(name)
  const initialValue = storedValue !== null ? storedValue : defaultValue

  const refValue = ref<T>(initialValue)

  // 监听变化并同步到存储
  watch(
    refValue,
    (newValue) => {
      storage.set(name, newValue)
      onChange?.(newValue)
    },
    {
      immediate,
      deep: typeof defaultValue === 'object' && defaultValue !== null
    }
  )

  return refValue
}
