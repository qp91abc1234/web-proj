import type { WatchOptions, WatchSource, WatchStopHandle } from 'vue'
import { watch } from 'vue'

/**
 * 异步 watch 的回调函数类型
 * @param newValue 新值
 * @param oldValue 旧值
 * @param isValid 检查当前回调是否仍然有效（未被新的 watch 触发覆盖）
 * @param signal AbortController 的 signal，用于取消异步操作
 */
type AsyncWatchCallback<T> = (
  newValue: T,
  oldValue: T | undefined,
  isValid: () => boolean,
  signal: AbortSignal
) => Promise<void>

/**
 * 创建一个支持异步操作的 watch，自动处理竞态条件
 * @param source watch 的数据源
 * @param asyncFn 异步回调函数
 * @param options watch 选项
 *
 * @description
 * 当 source 变化时，会自动取消上一次未完成的异步操作，避免竞态问题。
 * 提供 signal 用于取消 fetch 等支持 AbortController 的操作，
 * 提供 isValid 函数用于在异步操作中检查当前回调是否仍然有效。
 *
 * @example
 * ```ts
 * useAsyncWatch(userId, async (id, _, isValid, signal) => {
 *   const [user, orders, posts] = await Promise.all([
 *     axios.get(`/api/user/${id}`, { signal }),
 *     axios.get(`/api/orders/${id}`, { signal }),
 *     axios.get(`/api/posts/${id}`, { signal })
 *   ])
 *
 *   // 统一检查，统一更新
 *   if (isValid()) {
 *     userData.value = { user, orders, posts }
 *   }
 * })
 * ```
 */
export function useAsyncWatch<T>(
  source: WatchSource<T>,
  asyncFn: AsyncWatchCallback<T>,
  options?: WatchOptions
): WatchStopHandle {
  let requestId = 0
  let controller: AbortController | null = null

  return watch(
    source,
    async (newValue, oldValue) => {
      const currentId = ++requestId
      controller?.abort()
      controller = new AbortController()

      // 提供一个检查函数给用户
      const isValid = () => currentId === requestId

      try {
        await asyncFn(newValue, oldValue, isValid, controller.signal)
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError' && isValid()) {
          throw err
        }
      }
    },
    options
  )
}
