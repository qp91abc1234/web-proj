import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { RouteRecordRaw } from 'vue-router'
import type {
  RouteConfigList,
  ButtonPermissionMap,
  ButtonPermissionList
} from '@/common/types/permission'

// 视图组件模块映射（用于动态导入）
const viewComponentModules = import.meta.glob('@/views/*/*.vue')

// 路由配置数据（实际项目中应该从后端获取）
const ROUTE_CONFIG: RouteConfigList = [
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
  // 权限是否已初始化
  const isInitialized = ref(false)
  // 按钮权限映射表
  const buttonPermissionMap = ref<ButtonPermissionMap>({})
  // 路由树
  const routeTree = ref<RouteRecordRaw[]>([])
  // 路由映射表（用于面包屑等场景）
  const routeMap = ref<Record<string, { title: string; jumpPath: string | undefined }>>({})

  /**
   * 初始化权限数据并构建路由树
   * TODO: 实际项目中应该从后端接口获取权限数据
   */
  async function initPermissions() {
    // TODO: 这里应该调用接口获取按钮权限列表
    // const buttonList = await fetchButtonPermissions()
    initButtonPermissions([])

    // 构建路由树
    buildRouteTree(ROUTE_CONFIG, routeTree.value)
  }

  /**
   * 初始化按钮权限映射表
   * @param buttonList 按钮权限列表
   */
  function initButtonPermissions(buttonList: ButtonPermissionList) {
    buttonPermissionMap.value = {}
    buttonList.forEach((button) => {
      buttonPermissionMap.value[button.code] = {
        name: button.name,
        hidden: button.hidden
      }
    })
  }

  /**
   * 递归构建路由树
   * @param routeConfigs 路由配置数组
   * @param routes 存放路由的容器
   * @param parentPath 父级路径
   * @returns 返回是否所有子路由都被禁用及第一个可见路径
   */
  function buildRouteTree(
    routeConfigs: RouteConfigList,
    routes: RouteRecordRaw[] = [],
    parentPath = '/'
  ): { allDisabled: boolean; firstVisiblePath: string } {
    let allDisabled = true
    let firstVisiblePath = ''

    for (const routeConfig of routeConfigs) {
      const isDisabled = routeConfig.disabled ?? false
      const isVisible = routeConfig.visible ?? true

      // 跳过被禁用的路由
      if (isDisabled) {
        continue
      }
      allDisabled = false

      // 构建完整路由路径
      const routePath = parentPath.endsWith('/')
        ? `${parentPath}${routeConfig.path}`
        : `${parentPath}/${routeConfig.path}`

      // 构建路由记录对象
      const routeRecord: any = {
        path: routePath,
        name: routePath,
        component: routeConfig.compPath ? viewComponentModules[routeConfig.compPath] : undefined,
        meta: {
          title: routeConfig.title,
          icon: routeConfig.icon,
          visible: isVisible
        }
      }

      // 记录第一个可见路径
      if (!firstVisiblePath && isVisible) {
        firstVisiblePath = routePath
      }

      // 处理子路由
      if (!routeConfig.compPath && routeConfig.children && routeConfig.children.length > 0) {
        routeRecord.children = []
        const { allDisabled: childAllDisabled, firstVisiblePath: childFirstVisiblePath } =
          buildRouteTree(routeConfig.children, routeRecord.children, routePath)

        // 如果所有子路由都被禁用，跳过当前路由
        if (childAllDisabled) {
          continue
        }

        // 设置重定向到第一个可见的子路由
        if (childFirstVisiblePath) {
          routeRecord.redirect = childFirstVisiblePath
        } else {
          // 如果没有可见的子路由，隐藏父路由
          routeRecord.meta!.visible = false
        }
      }

      // 使用完整路径作为 key，避免重复
      routeMap.value[routePath] = {
        title: routeConfig.title,
        jumpPath: routeRecord.redirect || routeRecord.path
      }

      routes.push(routeRecord)
    }

    return { allDisabled, firstVisiblePath }
  }

  /**
   * 重置权限状态
   */
  function reset() {
    isInitialized.value = false
    buttonPermissionMap.value = {}
    routeTree.value = []
    routeMap.value = {}
  }

  return {
    isInitialized,
    buttonPermissionMap,
    routeTree,
    routeMap,
    initPermissions,
    reset
  }
})
