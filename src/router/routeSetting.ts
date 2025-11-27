import { usePermissionStore } from '@/store/modules/permissionStore'

import type { Router } from 'vue-router'

const layoutRouteName = Symbol('/')

export async function buildAsyncRoutes(router: Router) {
  const permissionStore = usePermissionStore()

  permissionStore.routeTree.forEach((item) => {
    router.addRoute(layoutRouteName, item)
  })

  router.addRoute({
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error/error.vue'),
    meta: {
      visible: false,
      title: '404'
    }
  })
}

export const allRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/login.vue'),
    meta: {
      visible: false,
      title: '登录'
    }
  },
  {
    path: '/',
    redirect: '/home',
    name: layoutRouteName,
    component: () => import('@/modules/layout/layout.vue'),
    children: []
  }
]
