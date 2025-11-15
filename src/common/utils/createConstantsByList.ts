type DataItem = {
  id: string
  [key: string]: any
}

type DataList<T extends DataItem> = T[]

type DataKeyMap<T extends DataItem> = {
  [K in Uppercase<T['id']>]: T['id']
}

type DataMap<T extends DataItem> = {
  [K in Uppercase<T['id']>]: T
}

type DataConstants<T extends DataItem, P extends string> = {
  [K in `${P}_LIST`]: DataList<T>
} & {
  [K in `${P}_KEY`]: DataKeyMap<T>
} & {
  [K in `${P}_MAP`]: DataMap<T>
}

// 使用示例：
// const { DIALOG_LIST, DIALOG_KEY, DIALOG_MAP } = createConstantsByList(
//   [{ id: 'dialog1', name: 'dialog1' }, { id: 'dialog2', name: 'dialog2' }] as const,
//   'DIALOG'
// )

export function createConstantsByList<T extends DataItem, P extends string>(
  list: T[],
  prefix: P = 'STATUS' as P
) {
  const statusList = list
  const statusKey = list.reduce((acc, item) => {
    acc[item.id.toUpperCase()] = item.id
    return acc
  }, {} as DataKeyMap<T>)

  const statusMap = list.reduce((acc, item) => {
    acc[item.id.toUpperCase()] = item
    return acc
  }, {} as DataMap<T>)

  return {
    [prefix.toUpperCase() + '_LIST']: statusList,
    [prefix.toUpperCase() + '_KEY']: statusKey,
    [prefix.toUpperCase() + '_MAP']: statusMap
  } as DataConstants<T, P>
}
