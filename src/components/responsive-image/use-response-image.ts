import { inject, provide } from 'vue'

const keyResponseImage = Symbol('responseImage')

interface ResponseImageContext {
  disabled?: boolean
  cdnBase?: string
  formats?: string[]
  widths?: number[]
  retinas?: number[]
  sizes?: string
  getImageUrl?: (src: string, format: string, scale: number) => string
}

export const useResponseImage = () => {
  const setupResponseImage = (params: ResponseImageContext = {}) => {
    provide<ResponseImageContext>(keyResponseImage, params)
  }

  const getParam = (key: string) => {
    const responseImage = inject<ResponseImageContext>(keyResponseImage, {})
    return responseImage[key]
  }

  return {
    setupResponseImage,
    getParam
  }
}
