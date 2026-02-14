import GFlex from '@/components/g-flex/g-flex.vue'
import NinePatchImage from '@/components/nine-patch-image/nine-patch-image.vue'
import ResponsiveImage from '@/components/responsive-image/responsive-image.vue'
import ResponsiveBackground from '@/components/responsive-image/responsive-background.vue'
import { useResponseImage } from '@/components/responsive-image/use-response-image'

import type { App } from 'vue'

export const setupGlobalComponents = (app: App<Element>) => {
  const { setupResponseImage } = useResponseImage()
  setupResponseImage({
    cdnBase: import.meta.env.VITE_CDN_BASE,
    formats: ['avif', 'webp'],
    retinas: [1, 2, 3]
  })
  console.log('setupResponseImage', import.meta.env.VITE_CDN_BASE)

  app.component('GFlex', GFlex)
  app.component('NinePatchImage', NinePatchImage)
  app.component('ResponsiveImage', ResponsiveImage)
  app.component('ResponsiveBackground', ResponsiveBackground)
}
