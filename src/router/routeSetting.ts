import { usePermissionStore } from '@/store/modules/permissionStore'

import type { Router } from 'vue-router'

export async function buildAsyncRoutes(router: Router) {
  const permissionStore = usePermissionStore()

  permissionStore.routeList.forEach((item) => {
    router.addRoute(allRoutesName, item)
  })
}

const allRoutesName = Symbol('/')
export const allRoutes = {
  path: '/',
  redirect: '/home',
  name: allRoutesName,
  component: () => import('@/modules/layout/layout.vue'),
  children: [
    {
      path: '/403',
      component: () => import('@/views/error/error.vue'),
      meta: {
        visible: false,
        title: '403'
      }
    }
  ]
}
