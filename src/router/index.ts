import { createRouter, createWebHashHistory } from 'vue-router'

import { useAppStore } from '@/store/modules/appStore'
import { usePermissionStore } from '@/store/modules/permissionStore'

import { allRoutes, buildAsyncRoutes } from './routeSetting'

import type { App } from 'vue'
// import { useUserStore } from '@/store/modules/userStore'

const router = createRouter({
  history: createWebHashHistory(),
  routes: allRoutes
})

router.beforeEach(async (to, _from, next) => {
  const permissionStore = usePermissionStore()
  const appStore = useAppStore()
  // const userStore = useUserStore()

  // if (userStore.token) {
  if (!permissionStore.isInitialized) {
    await permissionStore.initPermissions()
    await buildAsyncRoutes(router)
    permissionStore.isInitialized = true
  }

  if (to.matched.length === 0) {
    if (router.hasRoute(to.path)) {
      next({ path: to.path })
    } else {
      next({ path: '/404' })
    }
  } else if (to.path === '/login') {
    next({ path: '/home' })
  } else {
    appStore.openTab(
      {
        title: to.meta.title || '',
        path: to.path
      },
      false
    )
    next()
  }
  // } else if (to.path !== '/login') {
  //   next({ path: '/login' })
  // } else {
  //   next()
  // }
})

export const setupRouter = (app: App<Element>) => {
  app.use(router)
}
