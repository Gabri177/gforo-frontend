import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'tailwindcss/tailwind.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css' // 更新路径
import './index.css'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// main.ts

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
	app.component(key, component)
  }
app.use(store)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
