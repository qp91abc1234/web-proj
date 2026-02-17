import GFlex from '@/components/g-flex/g-flex.vue'
import NinePatchImage from '@/components/nine-patch-image/nine-patch-image.vue'
import ResponsiveImage from '@/components/responsive-image/responsive-image.vue'
import ResponsiveBackground from '@/components/responsive-image/responsive-background.vue'

import type { App } from 'vue'

export const setupGlobalComponents = (app: App<Element>) => {
  app.component('GFlex', GFlex)
  app.component('NinePatchImage', NinePatchImage)
  app.component('ResponsiveImage', ResponsiveImage)
  app.component('ResponsiveBackground', ResponsiveBackground)
}
