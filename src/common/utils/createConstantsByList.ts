type DataItem = {
  id: string
  [key: string]: any
}

type DataList<T extends DataItem> = readonly T[]

type DataKeyMap<T extends DataItem> = {
  [K in Uppercase<T['id']>]: T['id']
}

type DataMap<T extends DataItem> = {
  [K in Uppercase<T['id']>]: T
}

type DataConstants<T extends DataItem, P extends string> = {
  [K in `${Uppercase<P>}_LIST`]: DataList<T>
} & {
  [K in `${Uppercase<P>}_KEY`]: DataKeyMap<T>
} & {
  [K in `${Uppercase<P>}_MAP`]: DataMap<T>
}

/**
 * 根据数据列表创建常量对象
 *
 * @description
 * 该函数接收一个数据列表和前缀，生成三个常量对象：
 * - `{PREFIX}_LIST`: 原始数据列表
 * - `{PREFIX}_KEY`: ID 到 ID 的映射（大写键名）
 * - `{PREFIX}_MAP`: ID 到完整数据对象的映射（大写键名）
 *
 * @param list - 数据列表，每个元素必须包含 id 字段
 * @param prefix - 常量前缀，默认为 'STATUS'
 * @returns 包含 LIST、KEY、MAP 三个常量的对象
 *
 * @example
 * ```ts
 * // 定义对话框状态
 * const dialogList = [
 *   { id: 'create', name: '新建对话框', icon: 'plus' },
 *   { id: 'edit', name: '编辑对话框', icon: 'edit' },
 *   { id: 'delete', name: '删除对话框', icon: 'trash' }
 * ] as const
 *
 * const { DIALOG_LIST, DIALOG_KEY, DIALOG_MAP } = createConstantsByList(dialogList, 'DIALOG')
 *
 * // DIALOG_LIST: 原始列表
 * console.log(DIALOG_LIST) // [{ id: 'create', ... }, ...]
 *
 * // DIALOG_KEY: ID 映射（用于比较和赋值）
 * console.log(DIALOG_KEY.CREATE) // 'create'
 * console.log(DIALOG_KEY.EDIT) // 'edit'
 * if (currentDialog === DIALOG_KEY.CREATE) { ... }
 *
 * // DIALOG_MAP: 完整数据映射（用于快速查找）
 * console.log(DIALOG_MAP.CREATE) // { id: 'create', name: '新建对话框', icon: 'plus' }
 * const dialogName = DIALOG_MAP.EDIT.name // '编辑对话框'
 * ```
 *
 * @example
 * ```ts
 * // 用户状态管理
 * const userStatusList = [
 *   { id: 'active', label: '活跃', color: 'green' },
 *   { id: 'inactive', label: '未激活', color: 'gray' },
 *   { id: 'banned', label: '已封禁', color: 'red' }
 * ] as const
 *
 * const { USER_STATUS_LIST, USER_STATUS_KEY, USER_STATUS_MAP } =
 *   createConstantsByList(userStatusList, 'USER_STATUS')
 *
 * // 在组件中使用
 * const statusColor = USER_STATUS_MAP[user.status.toUpperCase()]?.color
 * ```
 */
export function createConstantsByList<T extends DataItem, P extends string>(
  list: readonly T[],
  prefix: P = 'STATUS' as P
): DataConstants<T, P> {
  if (!list || list.length === 0) {
    console.warn(`createConstantsByList: 传入的列表为空`)
  }

  const upperPrefix = prefix.toUpperCase()

  // 构建 KEY 映射：{ ID: 'id' }
  const keyMap = list.reduce((acc, item) => {
    const upperKey = item.id.toUpperCase() as Uppercase<T['id']>
    acc[upperKey] = item.id
    return acc
  }, {} as DataKeyMap<T>)

  // 构建 MAP 映射：{ ID: { id: 'id', ...otherProps } }
  const dataMap = list.reduce((acc, item) => {
    const upperKey = item.id.toUpperCase() as Uppercase<T['id']>
    acc[upperKey] = item
    return acc
  }, {} as DataMap<T>)

  return {
    [`${upperPrefix}_LIST`]: list,
    [`${upperPrefix}_KEY`]: keyMap,
    [`${upperPrefix}_MAP`]: dataMap
  } as DataConstants<T, P>
}
