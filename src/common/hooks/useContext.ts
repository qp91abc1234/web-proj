import { inject, provide } from 'vue'

/**
 * 创建一个类型安全的 Vue Context Hook
 * @param contextName Context 的名称，用于调试和错误提示
 * @param fn 创建 context 值的工厂函数
 * @returns 返回 useProvide 和 useInject 方法
 *
 * @example
 * ```ts
 * const { useProvide, useInject } = useContext('UserContext', (userId: number) => {
 *   const user = ref(null)
 *   const loadUser = async () => { ... }
 *   return { user, loadUser }
 * })
 *
 * // 在父组件中
 * const context = useProvide(123)
 *
 * // 在子组件中
 * const context = useInject()
 * ```
 */
export function useContext<T extends (...args: any[]) => any>(contextName: string, fn: T) {
  type Context = ReturnType<T>
  const injectKey = Symbol(contextName)

  /**
   * 在父组件中提供 context
   */
  function useProvide(...args: Parameters<T>): Context {
    const context = fn(...args) as Context
    provide(injectKey, context)
    return context
  }

  /**
   * 在子组件中注入 context
   * @param defaultValue 可选的默认值，当未找到 provider 时使用
   * @throws 如果未找到 provider 且未提供默认值，则抛出错误
   */
  function useInject(defaultValue?: Context): Context {
    const context = inject<Context>(injectKey, defaultValue as Context)

    if (context === undefined) {
      throw new Error(
        `useInject('${contextName}') 必须在 useProvide('${contextName}') 的子组件中调用。` +
          `请确保在父组件中正确调用了 useProvide。`
      )
    }

    return context
  }

  return {
    useProvide,
    useInject
  }
}
