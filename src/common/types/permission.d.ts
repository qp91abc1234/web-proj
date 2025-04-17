export type IBtnPermision = { [key: string]: { name: string; hidden: boolean } }

export interface IMenu {
  path: string
  title: string
  icon?: string
  compPath?: string
  hidden?: boolean
  children?: IMenu[]
}

export type IMenuArr = IMenu[]
