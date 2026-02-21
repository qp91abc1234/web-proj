// 按钮权限项
export interface ButtonPermission {
  id: number
  code: string
  name: string
  status: number
  menuId: number
}

// API权限项
export interface ApiPermission {
  id: number
  path: string // API路径，如 '/api/user/list'
  method: string // HTTP方法，如 'GET', 'POST'
  matchType: string // 匹配类型：'exact' 或 'prefix'
  desc: string // 描述
  createTime?: string
  updateTime?: string
}

// API权限列表
export type ApiPermissionList = ApiPermission[]

// 菜单项（基于RouteConfig扩展）
export interface MenuItem {
  id: number
  name: string // 菜单名称
  path: string
  icon: string
  compPath: string
  type: number // 类型：0-目录，1-菜单项
  sort: number // 排序值
  visible: boolean // 是否显示
  status: number // 0-禁用，1-启用
  isSystem: boolean // 是否系统菜单
  parentId: number | null // 父菜单ID，根菜单为null
  children: MenuItem[] // 子菜单
  createTime: string
  updateTime: string
}

export type CreateMenuItem = Omit<
  MenuItem,
  'id' | 'children' | 'createTime' | 'updateTime' | 'isSystem'
>

export type UpdateMenuItem = Partial<
  Omit<MenuItem, 'id' | 'children' | 'createTime' | 'updateTime' | 'isSystem'>
>

// 菜单树响应
export interface MenuTreeResponse {
  tree: MenuItem[]
}

// 菜单排序参数
export interface MenuSortParams {
  id: number
  parentId: number | null
  sort: number
}
