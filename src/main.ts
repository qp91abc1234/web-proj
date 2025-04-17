import { createApp } from 'vue'

import App from './App.vue'
import { setupPinia } from '@/store/index.ts'
import { setupRouter } from '@/router/index.ts'
import { setupGlobalComponents } from './gComponents'

import 'normalize.css'
import 'virtual:uno.css'

const app = createApp(App)
setupPinia(app)
setupRouter(app)
setupGlobalComponents(app)
app.mount('#app')
