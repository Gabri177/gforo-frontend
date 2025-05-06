import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'tailwindcss/tailwind.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css' // 更新路径
import './index.css'
import 'primeicons/primeicons.css'


import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
import permissionDirective from '~/directives/permission'
// highlightjs
import hljs from 'highlight.js';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// main.ts

(function getDeviceId() {
	let deviceId = localStorage.getItem('deviceId');
	if (!deviceId) {
	  deviceId = crypto.randomUUID(); // 或使用自定义生成方法
	  localStorage.setItem('deviceId', deviceId);
	}
})()

const app = createApp(App)
const pinia = createPinia()
app.directive('permission', permissionDirective)

VMdEditor.use(githubTheme, {
	Hljs: hljs,
  });

app.use(VMdEditor);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
	app.component(key, component)
  }
app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
