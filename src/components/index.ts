import GFlex from '@/components/gFlex/gFlex.vue'

import type { App } from 'vue'

export const setupGlobalComponents = (app: App<Element>) => {
  app.component('GFlex', GFlex)
}
