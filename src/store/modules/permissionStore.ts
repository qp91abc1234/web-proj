import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { RouteRecordRaw } from 'vue-router'
import type { IRouteDataArr, IBtnPermisionMap, IBtnPermissionList } from '@/common/types/permission'

const modules = import.meta.glob('@/views/*/*.vue')

export const usePermissionStore = defineStore('permission', () => {
  const isAuth = ref(false)
  const btnMap = ref<IBtnPermisionMap>({})
  const routeTree = ref<RouteRecordRaw[]>([])
  const routeMap = ref<Record<string, { title: string; jumpPath: string | undefined }>>({})

  const routeDataArr: IRouteDataArr = [
    {
      path: 'home',
      title: '首页',
      compPath: '/src/views/home/home.vue',
      icon: 'Sunny'
    },
    {
      path: 'system',
      title: '系统管理',
      icon: 'Setting',
      children: [
        {
          path: 'user',
          title: '用户管理',
          compPath: '/src/views/system/user.vue'
        }
      ]
    }
  ]

  async function getPermission() {
    buildBtnPermission([])
    buildRouteTree(routeDataArr, routeTree.value)
  }

  function buildBtnPermission(buttonList: IBtnPermissionList) {
    btnMap.value = {}
    buttonList.forEach((item) => {
      btnMap.value[item.code] = {
        name: item.name,
        hidden: item.hidden
      }
    })
  }

  function buildRouteTree(routeDataArr: IRouteDataArr, container: any = [], path = '/') {
    let allDisabled = true
    let firstVisiblePath = ''

    for (let i = 0; i < routeDataArr.length; i++) {
      const item = routeDataArr[i]
      const isDisabled = item.disabled ?? false
      const isVisible = item.visible ?? true

      if (isDisabled) {
        continue
      }
      allDisabled = false

      const routePath = path.endsWith('/') ? `${path}${item.path}` : `${path}/${item.path}`
      const routeObj: any = {
        path: routePath,
        name: routePath,
        component: item.compPath ? modules[item.compPath] : undefined,
        meta: {
          title: item.title,
          icon: item.icon,
          visible: isVisible
        }
      }

      if (!firstVisiblePath && isVisible) {
        firstVisiblePath = routePath
      }

      if (!item.compPath && item.children && item.children.length > 0) {
        const { allDisabled: childAllDisabled, firstVisiblePath: childFirstVisiblePath } =
          buildRouteTree(item.children, (routeObj.children = []), routePath)

        if (childAllDisabled) {
          continue
        }

        if (childFirstVisiblePath) {
          routeObj.redirect = childFirstVisiblePath
        } else {
          routeObj.meta!.visible = false
        }
      }

      routeMap.value[item.path] = {
        title: item.title,
        jumpPath: routeObj.redirect || routeObj.path
      }

      container.push(routeObj)
    }

    return { allDisabled, firstVisiblePath }
  }

  function reset() {
    isAuth.value = false
    btnMap.value = {} as any
    routeTree.value = []
  }

  return {
    isAuth,
    btnMap,
    routeTree,
    routeMap,
    getPermission,
    reset
  }
})
