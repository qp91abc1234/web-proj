import { h, render } from 'vue'

import type { Component } from 'vue'

export function dyncAddComponent(component: Component) {
  let container: HTMLDivElement

  const createContainer = () => {
    const ret = document.createElement('div')
    ret.style.position = 'fixed'
    ret.style.left = '0'
    ret.style.top = '0'
    ret.style.width = '100%'
    ret.style.height = '100%'
    document.body.appendChild(ret)
    return ret
  }

  return {
    open: (props: Record<string, any> = {}) => {
      container = createContainer()
      // 创建 vnode
      const vnode = h(component, {
        ...props,
        onClose: () => {
          // 清理渲染
          render(null, container)
          container.remove()
        }
      })

      // 渲染 vnode 到容器
      render(vnode, container)
    },
    close: () => {
      if (!container) return
      render(null, container)
      container.remove()
    }
  }
}
