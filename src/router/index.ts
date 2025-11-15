import { createRouter, createWebHashHistory } from 'vue-router'

import { useAppStore } from '@/store/modules/appStore'
import { usePermissionStore } from '@/store/modules/permissionStore'

import { allRoutes, buildAsyncRoutes } from './routeSetting'

import type { App } from 'vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: allRoutes
})

router.beforeEach(async (to, _from, next) => {
  const permissionStore = usePermissionStore()
  const appStore = useAppStore()

  if (!permissionStore.isAuth) {
    await permissionStore.getPermission()
    await buildAsyncRoutes(router)
    permissionStore.isAuth = true
  }

  if (to.matched.length === 0) {
    if (router.hasRoute(to.path)) {
      next({ path: to.path })
    } else {
      next({ path: '/404' })
    }
  } else {
    appStore.changeTab(
      {
        title: to.meta.title || '',
        path: to.path
      },
      false
    )
    next()
  }
})

export const setupRouter = (app: App<Element>) => {
  app.use(router)
}
