import { defineStore } from 'pinia'

import { createStorageRef } from '@/common/utils/storage'
import { useMobile } from './hooks/useMobile'
import { useTabs } from './hooks/useTabs'
import { useTheme } from './hooks/useTheme'
import { useVConsole } from './hooks/useVconsole'

/**
 * 应用全局状态 Store
 * 管理应用级别的全局状态，包括：
 * - 侧边栏折叠状态
 * - VConsole 调试工具
 * - 主题配置（亮/暗色模式、主题色）
 * - 移动端适配
 * - 标签页管理
 *
 * @example
 * ```ts
 * const appStore = useAppStore()
 *
 * // 切换侧边栏
 * appStore.siderCollapsed = true
 *
 * // 切换暗色模式
 * appStore.themeCfg.darkMode = true
 *
 * // 打开标签页
 * appStore.openTab({ title: '首页', path: '/home' })
 * ```
 */
export const useAppStore = defineStore('app', () => {
  // ==================== 侧边栏状态 ====================
  /** 侧边栏是否折叠 */
  const siderCollapsed = createStorageRef('siderCollapsed', false)

  // ==================== VConsole 调试工具 ====================
  const { vConsole } = useVConsole()

  // ==================== 主题配置 ====================
  const { themeCfg } = useTheme()

  // ==================== 移动端检测 ====================
  const { isMobile } = useMobile()

  // ==================== 标签页管理 ====================
  const {
    currentTabPath,
    currentTabIndex,
    tabs,
    openTab,
    closeTab,
    closeRightTabs,
    closeOtherTabs,
    closeAllTabs
  } = useTabs()

  return {
    // 侧边栏
    siderCollapsed,

    // VConsole
    vConsole,

    // 主题
    themeCfg,

    // 移动端
    isMobile,

    // 标签页
    currentTabPath,
    currentTabIndex,
    tabs,
    openTab,
    closeTab,
    closeRightTabs,
    closeOtherTabs,
    closeAllTabs
  }
})
