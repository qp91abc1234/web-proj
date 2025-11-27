// 按钮权限项
export interface ButtonPermission {
  code: string
  name: string
  hidden: boolean
}

// 按钮权限列表
export type ButtonPermissionList = ButtonPermission[]

// 按钮权限映射表
export type ButtonPermissionMap = Record<string, Omit<ButtonPermission, 'code'>>

// 路由配置项
export interface RouteConfig {
  path: string
  title: string
  icon?: string
  compPath?: string
  disabled?: boolean // 路由是否禁用
  visible?: boolean // 是否显示在菜单树
  children?: RouteConfig[]
}

// 路由配置列表
export type RouteConfigList = RouteConfig[]
