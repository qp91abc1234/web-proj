import { usePermissionStore } from '@/store/modules/permission-store'

import type { Router } from 'vue-router'

const layoutRouteName = Symbol('/')

export async function buildAsyncRoutes(router: Router) {
  const permissionStore = usePermissionStore()
  if (permissionStore.isInitialized) {
    return
  }

  await permissionStore.initPermissions()
  permissionStore.routeTree.forEach((item) => {
    router.addRoute(layoutRouteName, item)
  })
  router.addRoute(layoutRouteName, {
    path: ':pathMatch(.*)*',
    component: () => import('@/views/error/error.vue'),
    meta: {
      title: '404'
    }
  })
  permissionStore.isInitialized = true
}

export const allRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/login.vue'),
    meta: {
      title: '登录'
    }
  },
  {
    path: '/',
    redirect: '/home',
    name: layoutRouteName,
    component: () => import('@/modules/layout/layout.vue'),
    children: [
      {
        path: '/home',
        component: () => import('@/views/home/home.vue'),
        meta: {
          title: '首页',
          icon: 'Sunny'
        }
      }
    ]
  },
  {
    path: '/test',
    component: () => import('@/views/test/test.vue'),
    meta: {
      title: '测试'
    }
  }
]
