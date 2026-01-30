import { inject, provide } from 'vue'

const keyResponseImage = Symbol('responseImage')

interface ResponseImageContext {
  cdnBase: string
  formats: string[]
}

export const useResponseImage = () => {
  const setupResponseImage = (params: ResponseImageContext = { cdnBase: '', formats: [] }) => {
    provide<ResponseImageContext>(keyResponseImage, {
      cdnBase: params.cdnBase,
      formats: params.formats
    })
  }

  const getParam = (key: string) => {
    const responseImage = inject<ResponseImageContext>(keyResponseImage, {
      cdnBase: '',
      formats: []
    })
    return responseImage[key]
  }

  return {
    setupResponseImage,
    getParam
  }
}
