import { defineStore } from 'pinia'

import { useTabs } from './hooks/useTabs'
import { useVConsole } from './hooks/vconsole'
import { useTheme } from '@/store/modules/hooks/useTheme'
import { useMobile } from '@/store/modules/hooks/useMobile'

import { createStorageRef } from '@/common/utils/storage'

export const useAppStore = defineStore('app', () => {
  const siderCollapsed = createStorageRef('siderCollapsed', false)

  const vConsoleHook = useVConsole()
  const themeHook = useTheme()
  const mobileHook = useMobile()
  const tabsHook = useTabs()

  return {
    siderCollapsed,
    ...vConsoleHook,
    ...themeHook,
    ...mobileHook,
    ...tabsHook
  }
})
