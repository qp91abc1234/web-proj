import { inject, provide } from 'vue'

export function useContext<T extends (...args: any[]) => any>(contextName: string, fn: T) {
  type Context = ReturnType<T>
  const injectKey = Symbol(contextName)

  function useProvide(...args: Parameters<T>) {
    const context: Context = fn(...args)
    provide(injectKey, context)
    return context
  }

  function useInject() {
    return inject(injectKey) as Context
  }

  return {
    useProvide,
    useInject
  }
}
