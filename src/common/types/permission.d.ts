export type IBtnPermissionList = { code: string; name: string; hidden: boolean }[]
export type IBtnPermisionMap = { [key: string]: { name: string; hidden: boolean } }

export interface IRouteData {
  path: string
  title: string
  icon?: string
  compPath?: string
  disabled?: boolean // 路由是否禁用
  visible?: boolean // 是否显示在菜单树
  children?: IRouteData[]
}

export type IRouteDataArr = IRouteData[]
