import Flex from '@/gComponents/flex/flex.vue'

import type { App } from 'vue'

export const setupGlobalComponents = (app: App<Element>) => {
  app.component('Flex', Flex)
}
