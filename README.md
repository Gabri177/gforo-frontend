## 🎨 Frontend Structure Overview | 前端结构概览

The frontend is built using **Vue 3**, **Vite**, **Element Plus**, and **TailwindCSS**, following a modular and maintainable structure.
前端使用 Vue 3 + Vite + Element Plus + TailwindCSS 构建，遵循模块化和高可维护性设计。

### 📁 Directory Breakdown | 目录结构简述

| 目录 / 文件       | 功能说明           | Description                               |
| ------------- | -------------- | ----------------------------------------- |
| `main.js`     | 入口文件，初始化应用     | App entry point                           |
| `App.vue`     | 根组件            | Root component                            |
| `index.css`   | 全局样式           | Global styles                             |
| `assets/`     | 静态资源（头像、SVG 等） | Static assets (e.g., avatars, SVGs)       |
| `router/`     | 路由配置           | Vue Router configuration                  |
| `stores/`     | 状态管理（Pinia）    | State management (Pinia stores)           |
| `api/`        | 所有后端 API 封装    | API abstraction for all backend modules   |
| `components/` | 可复用组件集合        | Reusable UI components                    |
| `views/`      | 路由页面视图         | Page-level views for routes               |
| `layout/`     | 页面布局组件（头部/底部）  | Layout components like Header/Footer      |
| `constants/`  | 权限标识、场景常量等     | Constants such as permission codes        |
| `axios/`      | Axios 实例封装     | Axios setup with interceptors             |
| `utils/`      | 通用工具函数         | Utility functions                         |
| `tools/`      | 特殊组件工具区块       | Small tool-like UI components             |
| `directives/` | 自定义指令（如权限指令）   | Custom directives (e.g., v-permission)    |
| `error/`      | 错误码定义与提示映射     | Error code mapping                        |
| `example/`    | 示例组件（调试用）      | Sample/test components (e.g., CAPTCHA/Ws) |

---

### 🗂 Views | 路由页面视图说明

| 页面                                               | 功能说明      | Description               |
| ------------------------------------------------ | --------- | ------------------------- |
| `Home.vue`                                       | 首页        | Homepage                  |
| `Login.vue` / `Register.vue`                     | 登录/注册页    | Auth pages                |
| `Post.vue` / `Posts.vue`                         | 帖子详情/列表页  | Post details and listings |
| `Profile.vue`                                    | 用户主页      | User profile              |
| `Message.vue`                                    | 私信聊天页     | Private messaging         |
| `Notification.vue`                               | 通知中心      | Notification center       |
| `Admin.vue`                                      | 管理后台主视图   | Admin dashboard           |
| `Settings.vue`                                   | 设置中心      | Account settings          |
| `ForgetPassword.vue` / `ForgetResetPassword.vue` | 忘记密码流程页   | Password recovery flow    |
| `SearchResultPage.vue`                           | 搜索结果页     | Post search result        |
| `UserPosts.vue` / `UserComments.vue`             | 用户发帖/评论历史 | User activity views       |
| `NotFound.vue`                                   | 404 页面    | Not found fallback page   |
| `About.vue`                                      | 项目介绍页     | About page                |

---

### 💡 Highlights | 特性亮点

* ✅ 全面使用 **组合式 API** + `Pinia` 状态管理
  Fully uses Vue Composition API + Pinia for global state
* ✅ 所有模块接口集中封装于 `/api`
  All module APIs are abstracted under `/api`
* ✅ 支持权限指令控制按钮展示（`v-permission`）
  Button-level permission control via custom directive
* ✅ 实时通知 / 私信使用 WebSocket 实现
  Realtime messaging with WebSocket
* ✅ 精细的模块拆分：视图、工具、组件独立可维护
  Clearly separated components and views
* ✅ 管理后台模块分组件管理：用户、内容、权限、统计等
  Admin area split into modules: user, content, permission, stats

---

### 🔧 Dev Tools & Dependencies | 开发工具与依赖

| 技术栈                | 用途 / Purpose                    |
| ------------------ | ------------------------------- |
| Vue 3              | 前端主框架 / Frontend framework      |
| Vite               | 构建工具 / Build tool               |
| Element Plus       | UI 组件库 / UI library             |
| TailwindCSS        | 原子化样式系统 / Utility-first CSS     |
| Pinia              | 状态管理 / State management         |
| Axios              | HTTP 通信封装 / HTTP client         |
| WebSocket (Native) | 实时通信模块 / Realtime communication |
| VMdEditor          | 富文本输入 / Markdown editor         |
