import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { RouteRecordRaw } from 'vue-router'
import type { IMenuArr, IBtnPermision } from '@/common/types/permission'

const modules = import.meta.glob('@/views/*/*.vue')

export const usePermissionStore = defineStore('permission', () => {
  const isAuth = ref(false)
  const btnMap = ref<IBtnPermision>({})
  const menuTree = ref<RouteRecordRaw[]>([])
  const menuMap = ref<Record<string, { title: string; jumpPath: string | undefined }>>({})
  const routeList = ref<RouteRecordRaw[]>([])

  const menuArr: IMenuArr = [
    {
      path: 'home',
      title: '首页',
      compPath: '/src/views/home/home.vue',
      icon: 'Sunny'
    },
    {
      path: 'demo',
      title: '示例集合',
      icon: 'Moon',
      children: [
        {
          path: 'example',
          title: '示例',
          compPath: '/src/views/home/home.vue'
        },
        {
          path: 'example2',
          title: '示例2',
          compPath: '/src/views/home/home.vue'
        }
      ]
    }
  ]

  async function getPermission() {
    buildBtnPermission([])
    buildMenuPermission(menuArr, menuTree.value)
    routeList.value = flattenMenuTree(menuTree.value)
  }

  function buildBtnPermission(buttonList) {
    btnMap.value = {}
    buttonList.forEach((item: any) => {
      btnMap.value[item.code] = {
        name: item.name,
        hidden: item.hidden
      }
    })
  }

  function buildMenuPermission(menuArr: IMenuArr, container: any = [], path = '/') {
    let allHidden = true
    for (let i = 0; i < menuArr.length; i++) {
      const item = menuArr[i]
      const routePath = path.endsWith('/') ? `${path}${item.path}` : `${path}/${item.path}`
      const redirectPath =
        !item.compPath && item.children && item.children.length > 0
          ? `${routePath}/${item.children[0].path}`
          : undefined

      menuMap.value[item.path] = {
        title: item.title,
        jumpPath: item.compPath ? routePath : redirectPath
      }

      const routeObj: any = {
        path: routePath,
        name: routePath,
        redirect: redirectPath,
        component: item.compPath ? modules[item.compPath] : undefined,
        meta: {
          title: item.title,
          icon: item.icon,
          visible: !item.hidden
        }
      }

      if (!item.hidden) {
        allHidden = false
      }

      let noChildren = false
      if (item.children && item.children.length > 0) {
        noChildren = buildMenuPermission(item.children, (routeObj.children = []), routePath)
      }

      if (!noChildren) {
        container.push(routeObj)
      }
    }

    return allHidden
  }

  function flattenMenuTree(routes: Array<RouteRecordRaw>) {
    const ret: Array<RouteRecordRaw> = []
    routes.forEach((val) => {
      if (val.children) {
        ret.push(...flattenMenuTree(val.children))
      } else {
        ret.push(val)
      }
    })
    return ret
  }

  function reset() {
    isAuth.value = false
    btnMap.value = {} as any
    menuTree.value = []
  }

  return {
    isAuth,
    btnMap,
    menuTree,
    menuMap,
    routeList,
    getPermission,
    reset
  }
})
