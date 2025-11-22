import { useRouter } from 'vue-router'

import { usePermissionStore } from '../permissionStore'
import { createStorageRef } from '@/common/utils/storage'

export interface ITab {
  title: string
  path: string
}

export function useTabs() {
  const router = useRouter()
  const permissionStore = usePermissionStore()
  const curTabPath = createStorageRef('curTabPath', '')
  const tabs = createStorageRef<ITab[]>('tabs', [])

  const changeTab = (tab: ITab, useRouter = true) => {
    if (curTabPath.value === tab.path) {
      return
    }
    if (!tabs.value.some((t) => t.path === tab.path)) {
      tabs.value.push(tab)
    }
    curTabPath.value = tab.path
    if (useRouter) {
      router.push(tab.path)
    }
  }

  const closeTab = (tab: ITab) => {
    let removeIndex = -1
    tabs.value = tabs.value.filter((t, index) => {
      if (curTabPath.value === t.path) {
        removeIndex = index
      }
      return t.path !== tab.path
    })
    if (tabs.value.length === 0) {
      changeTab({
        title: permissionStore.routeList[0].meta?.title || '',
        path: permissionStore.routeList[0].path
      })
    } else if (curTabPath.value === tab.path) {
      changeTab(tabs.value[removeIndex - 1] || tabs.value[removeIndex + 1])
    }
  }

  const closeRightTabs = (tab: ITab) => {
    const index = tabs.value.findIndex((val) => val.path === tab.path)
    const curTabIndex = tabs.value.findIndex((val) => val.path === curTabPath.value)
    tabs.value = tabs.value.slice(0, index + 1)
    if (curTabIndex > index) {
      changeTab(tabs.value[tabs.value.length - 1])
    }
  }

  const closeOtherTabs = (tab: ITab) => {
    tabs.value = tabs.value.filter((t) => t.path === tab.path)
    changeTab(tab)
  }

  const closeAllTabs = () => {
    tabs.value = []
    curTabPath.value = ''
    changeTab({
      title: permissionStore.routeList[0].meta?.title || '',
      path: permissionStore.routeList[0].path
    })
  }

  return {
    curTabPath,
    tabs,
    changeTab,
    closeTab,
    closeRightTabs,
    closeOtherTabs,
    closeAllTabs
  }
}
