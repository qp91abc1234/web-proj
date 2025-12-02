import { createApp } from 'vue'

import App from './App.vue'
import { setupPinia } from '@/store/index.ts'
import { setupRouter } from '@/router/index.ts'
import { setupErrorHandling } from '@/common/utils/setupErrorHandling'
import { setupGlobalComponents } from './components'

import 'normalize.css'
import 'virtual:uno.css'

const app = createApp(App)

// 注册全局状态管理
setupPinia(app)

// 注册路由
setupRouter(app)

// 注册全局组件
setupGlobalComponents(app)

// 安装全局异常处理
setupErrorHandling(app)

app.mount('#app')
