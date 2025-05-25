import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'tailwindcss/tailwind.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css' // 更新路径
import './index.css'
import 'primeicons/primeicons.css'


import VMdEditor from '@kangc/v-md-editor/lib/codemirror-editor';
import '@kangc/v-md-editor/lib/style/codemirror-editor.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';

// highlightjs
import hljs from 'highlight.js';

// codemirror 编辑器的相关资源
import Codemirror from 'codemirror';
// mode
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/vue/vue';
// edit
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/matchbrackets';
// placeholder
import 'codemirror/addon/display/placeholder';
// active-line
import 'codemirror/addon/selection/active-line';
// scrollbar
import 'codemirror/addon/scroll/simplescrollbars';
import 'codemirror/addon/scroll/simplescrollbars.css';
// style
import 'codemirror/lib/codemirror.css';

import permissionDirective from '~/directives/permission'
import { useWebSocketStore } from '~/stores/websocket';
import enUS from '@kangc/v-md-editor/lib/lang/en-US';
import { useUserStore } from '~/stores/user';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
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

VMdEditor.lang.use('en-US', enUS);

VMdEditor.Codemirror = Codemirror;
VMdEditor.use(vuepressTheme, {
	Hljs: hljs,
});

app.use(VMdEditor);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
	app.component(key, component)
  }
app.use(pinia)
app.use(router)
app.use(ElementPlus)

const userStore = useUserStore();
const wsStore = useWebSocketStore();
if (userStore.isLoggedInState){
	console.log('WebSocket 连接');
	wsStore.connect();
  }

app.mount('#app')
