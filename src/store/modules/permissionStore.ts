import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { RouteRecordRaw } from 'vue-router'
import type {
  IRouteDataArr,
  IBtnPermissionMap,
  IBtnPermissionList
} from '@/common/types/permission'

const modules = import.meta.glob('@/views/*/*.vue')

// 路由配置数据（实际项目中应该从后端获取）
const ROUTE_CONFIG: IRouteDataArr = [
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

export const usePermissionStore = defineStore('permission', () => {
  // 是否已认证
  const isAuth = ref(false)
  // 按钮权限映射表
  const buttonPermissionMap = ref<IBtnPermissionMap>({})
  // 路由树
  const routeTree = ref<RouteRecordRaw[]>([])
  // 路由映射表（用于面包屑等场景）
  const routeMap = ref<Record<string, { title: string; jumpPath: string | undefined }>>({})

  /**
   * 获取权限数据并构建路由树
   * TODO: 实际项目中应该从后端接口获取权限数据
   */
  async function getPermission() {
    // TODO: 这里应该调用接口获取按钮权限列表
    // const buttonList = await fetchButtonPermissions()
    buildButtonPermission([])

    // 构建路由树
    buildRouteTree(ROUTE_CONFIG, routeTree.value)
  }

  /**
   * 构建按钮权限映射表
   * @param buttonList 按钮权限列表
   */
  function buildButtonPermission(buttonList: IBtnPermissionList) {
    buttonPermissionMap.value = {}
    buttonList.forEach((item) => {
      buttonPermissionMap.value[item.code] = {
        name: item.name,
        hidden: item.hidden
      }
    })
  }

  /**
   * 递归构建路由树
   * @param routeDataArr 路由配置数组
   * @param routes 存放路由的容器
   * @param parentPath 父级路径
   * @returns 返回是否所有子路由都被禁用及第一个可见路径
   */
  function buildRouteTree(
    routeDataArr: IRouteDataArr,
    routes: RouteRecordRaw[] = [],
    parentPath = '/'
  ): { allDisabled: boolean; firstVisiblePath: string } {
    let allDisabled = true
    let firstVisiblePath = ''

    for (const item of routeDataArr) {
      const isDisabled = item.disabled ?? false
      const isVisible = item.visible ?? true

      // 跳过被禁用的路由
      if (isDisabled) {
        continue
      }
      allDisabled = false

      // 构建完整路由路径
      const routePath = parentPath.endsWith('/')
        ? `${parentPath}${item.path}`
        : `${parentPath}/${item.path}`

      // 构建路由对象
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

      // 记录第一个可见路径
      if (!firstVisiblePath && isVisible) {
        firstVisiblePath = routePath
      }

      // 处理子路由
      if (!item.compPath && item.children && item.children.length > 0) {
        routeObj.children = []
        const { allDisabled: childAllDisabled, firstVisiblePath: childFirstVisiblePath } =
          buildRouteTree(item.children, routeObj.children, routePath)

        // 如果所有子路由都被禁用，跳过当前路由
        if (childAllDisabled) {
          continue
        }

        // 设置重定向到第一个可见的子路由
        if (childFirstVisiblePath) {
          routeObj.redirect = childFirstVisiblePath
        } else {
          // 如果没有可见的子路由，隐藏父路由
          routeObj.meta!.visible = false
        }
      }

      // 使用完整路径作为 key，避免重复
      routeMap.value[routePath] = {
        title: item.title,
        jumpPath: routeObj.redirect || routeObj.path
      }

      routes.push(routeObj)
    }

    return { allDisabled, firstVisiblePath }
  }

  /**
   * 重置权限状态
   */
  function reset() {
    isAuth.value = false
    buttonPermissionMap.value = {}
    routeTree.value = []
    routeMap.value = {}
  }

  return {
    isAuth,
    buttonPermissionMap,
    routeTree,
    routeMap,
    getPermission,
    reset
  }
})
