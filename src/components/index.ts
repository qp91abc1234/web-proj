import GFlex from '@/components/g-flex/g-flex.vue'
import NinePatchImage from '@/components/nine-patch-image/nine-patch-image.vue'
import ResponsiveImage from '@/components/responsive-image/responsive-image.vue'
import ResponsiveBackground from '@/components/responsive-image/responsive-background.vue'
import { useResponseImage } from '@/components/responsive-image/use-response-image'

import type { App } from 'vue'

export const setupGlobalComponents = (app: App<Element>) => {
  const { setupResponseImage } = useResponseImage()
  setupResponseImage({
    disabled: !!import.meta.env.DEV,
    formats: ['avif', 'webp'],
    retinas: [1, 2, 3],
    getImageUrl: (src: string, format: string, scale: number) => {
      return `${src}?x-oss-process=image/format,${format}/resize,p_${Math.round(scale * 100)}`
    }
  })

  app.component('GFlex', GFlex)
  app.component('NinePatchImage', NinePatchImage)
  app.component('ResponsiveImage', ResponsiveImage)
  app.component('ResponsiveBackground', ResponsiveBackground)
}
