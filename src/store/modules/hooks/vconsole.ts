import VConsole from 'vconsole'

import { createStorageRef } from '@/common/utils/storage'

/** VConsole 容器元素 ID */
const VCONSOLE_ELEMENT_ID = '__vconsole'

/** VConsole 存储的 key 名称 */
const VCONSOLE_STORAGE_KEY = 'vConsole'

/**
 * 切换 VConsole 的显示状态
 * @param isShow - 是否显示
 */
function toggleVConsole(isShow: boolean): void {
  const element = document.getElementById(VCONSOLE_ELEMENT_ID)

  if (isShow) {
    if (element) {
      // 如果已存在，直接显示
      element.style.display = 'block'
    } else {
      // 如果不存在，创建新实例（实例会自动挂载到 DOM）
      try {
        new VConsole()
      } catch (error) {
        console.error('[VConsole] Failed to initialize:', error)
      }
    }
  } else if (element) {
    // 隐藏而不是销毁，避免重复初始化
    element.style.display = 'none'
  }
}

/**
 * VConsole Hook
 * 提供响应式的 VConsole 控制功能，状态会持久化到 localStorage
 *
 * @returns vConsole - 控制 VConsole 显示/隐藏的响应式引用
 *
 * @example
 * ```ts
 * const { vConsole } = useVConsole()
 *
 * // 显示 VConsole
 * vConsole.value = true
 *
 * // 隐藏 VConsole
 * vConsole.value = false
 * ```
 */
export function useVConsole() {
  const vConsole = createStorageRef(VCONSOLE_STORAGE_KEY, false, {
    onChange: toggleVConsole,
    immediate: true
  })

  return {
    vConsole
  }
}
