import { ref } from 'vue'

/**
 * 说明：配合 useContext 使用，用于页面内弹窗管理
 * 使用示例：
 * useDialog(['dialog1', 'dialog2'] as const)
 */
export function useDialog<T extends readonly string[]>(dialogNames: T) {
  type DialogName = T[number]

  const DIALOG_KEY = (dialogNames as unknown as string[]).reduce(
    (acc, item) => {
      acc[item.toUpperCase()] = item
      return acc
    },
    {} as {
      [K in Uppercase<DialogName>]: DialogName
    }
  )

  const dialogData = ref<{ [key in DialogName]: { visible: boolean; props: any } }>({} as any)

  dialogNames.forEach((key) => {
    dialogData.value[key] = {
      visible: false,
      props: {}
    }
  })

  const show = (dialogName: DialogName, props: any) => {
    dialogData.value[dialogName].visible = true
    dialogData.value[dialogName].props = { ...props, close: () => hide(dialogName) }
  }

  const hide = (dialogName: DialogName) => {
    dialogData.value[dialogName].visible = false
    dialogData.value[dialogName].props = {}
  }

  return {
    DIALOG_KEY,
    dialogData,
    show,
    hide
  }
}
