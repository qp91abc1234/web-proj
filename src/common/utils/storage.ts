import { ref, watch } from 'vue'

type StorageType = 'local' | 'session'

export function createStorageObject<T extends object>(
  type: StorageType = 'local',
  storagePrefix: string = ''
) {
  const store = type === 'session' ? window.sessionStorage : window.localStorage
  const storage = {
    set<K extends keyof T>(key: K, value: T[K]) {
      const json = JSON.stringify(value)
      store.setItem(`${storagePrefix}${key as string}`, json)
    },
    get<K extends keyof T>(key: K): T[K] | null {
      const json = store.getItem(`${storagePrefix}${key as string}`)
      if (json) {
        let storageData: T[K] | null = null

        try {
          storageData = JSON.parse(json)
        } catch {
          return null
        }

        return storageData as T[K]
      }
      return null
    },
    remove(key: keyof T) {
      store.removeItem(`${storagePrefix}${key as string}`)
    },
    clear() {
      store.clear()
    }
  }
  return storage
}

export function createStorageRef<T>(
  name: string,
  defaultVal: T,
  opts: { cb?: (val) => void; immediate?: boolean } = {}
) {
  const storage = createStorageObject<{
    [key: string]: T
  }>('local', 'storageRef_')

  const ret = ref<T>(storage.get(name) ?? defaultVal)
  watch(
    ret,
    (val) => {
      storage.set(name, val)
      if (opts.cb) {
        opts.cb(val)
      }
    },
    {
      immediate: opts.immediate,
      deep: typeof defaultVal === 'object'
    }
  )
  return ret
}
