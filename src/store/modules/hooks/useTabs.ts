import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { usePermissionStore } from '../permissionStore'
import { createStorageRef } from '@/common/utils/storage'

/** 标签页数据结构 */
export interface Tab {
  /** 标签页标题 */
  title: string
  /** 路由路径 */
  path: string
}

/**
 * 获取默认标签页（首页）
 */
function getDefaultTab(permissionStore: ReturnType<typeof usePermissionStore>): Tab {
  const firstRoute = permissionStore.routeTree[0]
  return {
    title: (firstRoute?.meta?.title as string) || '首页',
    path: firstRoute?.path || '/'
  }
}

/**
 * 标签页管理 Hook
 * 提供多标签页的打开、切换、关闭等功能，状态会持久化到 localStorage
 *
 * @returns 标签页相关的状态和操作方法
 *
 * @example
 * ```ts
 * const { tabs, currentTabPath, openTab, closeTab } = useTabs()
 *
 * // 打开新标签页
 * openTab({ title: '用户管理', path: '/system/user' })
 *
 * // 关闭标签页
 * closeTab({ title: '用户管理', path: '/system/user' })
 * ```
 */
export function useTabs() {
  const router = useRouter()
  const permissionStore = usePermissionStore()

  const currentTabPath = createStorageRef('currentTabPath', '')
  const tabs = createStorageRef<Tab[]>('tabs', [])

  /**
   * 检查标签页是否存在
   */
  const hasTab = (path: string): boolean => {
    return tabs.value.some((tab) => tab.path === path)
  }

  /**
   * 根据路径查找标签页索引
   */
  const findTabIndex = (path: string): number => {
    return tabs.value.findIndex((tab) => tab.path === path)
  }

  /**
   * 获取当前激活的标签页索引
   */
  const currentTabIndex = computed(() => findTabIndex(currentTabPath.value))

  /**
   * 打开/切换到指定标签页
   * @param tab - 标签页信息
   * @param navigate - 是否触发路由跳转，默认为 true
   */
  const openTab = (tab: Tab, navigate = true): void => {
    // 如果已经是当前标签页，不做处理
    if (currentTabPath.value === tab.path) {
      return
    }

    // 如果标签页不存在，添加到列表
    if (!hasTab(tab.path)) {
      tabs.value.push(tab)
    }

    // 更新当前标签页
    currentTabPath.value = tab.path

    // 触发路由跳转
    if (navigate) {
      router.push(tab.path)
    }
  }

  /**
   * 关闭指定标签页
   * @param tab - 要关闭的标签页
   */
  const closeTab = (tab: Tab): void => {
    const closingIndex = findTabIndex(tab.path)
    const isClosingCurrent = currentTabPath.value === tab.path

    // 过滤掉要关闭的标签页
    tabs.value = tabs.value.filter((t) => t.path !== tab.path)

    // 如果关闭后没有标签页了，打开默认标签页
    if (tabs.value.length === 0) {
      openTab(getDefaultTab(permissionStore))
      return
    }

    // 如果关闭的是当前标签页，需要切换到其他标签页
    if (isClosingCurrent) {
      // 优先切换到右侧标签页，如果没有则切换到左侧
      const nextTab = tabs.value[closingIndex] || tabs.value[closingIndex - 1]
      openTab(nextTab)
    }
  }

  /**
   * 关闭指定标签页右侧的所有标签页
   * @param tab - 参考标签页
   */
  const closeRightTabs = (tab: Tab): void => {
    const targetIndex = findTabIndex(tab.path)
    if (targetIndex === -1) return

    const currentIndex = currentTabIndex.value

    // 保留目标标签页及其左侧的所有标签页
    tabs.value = tabs.value.slice(0, targetIndex + 1)

    // 如果当前标签页在右侧被关闭了，切换到最右侧的标签页
    if (currentIndex > targetIndex) {
      openTab(tabs.value[tabs.value.length - 1])
    }
  }

  /**
   * 关闭除指定标签页外的所有标签页
   * @param tab - 要保留的标签页
   */
  const closeOtherTabs = (tab: Tab): void => {
    tabs.value = [tab]
    openTab(tab)
  }

  /**
   * 关闭所有标签页并打开默认标签页
   */
  const closeAllTabs = (): void => {
    tabs.value = []
    currentTabPath.value = ''
    openTab(getDefaultTab(permissionStore))
  }

  return {
    /** 当前激活的标签页路径 */
    currentTabPath,
    /** 当前激活的标签页索引 */
    currentTabIndex,
    /** 标签页列表 */
    tabs,
    /** 打开/切换标签页 */
    openTab,
    /** 关闭标签页 */
    closeTab,
    /** 关闭右侧标签页 */
    closeRightTabs,
    /** 关闭其他标签页 */
    closeOtherTabs,
    /** 关闭所有标签页 */
    closeAllTabs
  }
}
