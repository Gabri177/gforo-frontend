# 🌟 Gforo - Forum Project Deployment Guide | Gforo 论坛项目部署指南

This guide helps you set up and run the Gforo forum project including backend, database, Redis, Kafka, and frontend locally.
本指南将帮助你本地部署并运行 Gforo 论坛项目，包括后端、数据库、Redis、Kafka 和前端部分。

---

## 🛠 Deployment Instructions | 部署说明

### 📦 Backend + Infrastructure Setup | 后端与基础设施配置

#### English

1. Ensure [Docker](https://www.docker.com/products/docker-desktop) and [Docker Compose](https://docs.docker.com/compose/) are installed.
2. Navigate to the deployment directory:

   ```bash
   cd ./deploy
   ```
3. Start all backend and infrastructure services:

   ```bash
   docker compose up -d
   ```
4. The backend will start and listen on port `80` by default.

#### 中文

1. 请确保已安装 [Docker](https://www.docker.com/products/docker-desktop) 和 [Docker Compose](https://docs.docker.com/compose/)。
2. 进入部署目录：

   ```bash
   cd ./deploy
   ```
3. 启动后端与基础设施容器：

   ```bash
   docker compose up -d
   ```
4. 默认后端服务监听 `80` 端口。

---

### 💻 Frontend Setup | 前端部署

#### English

1. Clone the frontend project to your local machine:

   ```bash
   git clone https://github.com/Gabri177/gforo-frontend.git
   ```
2. Replace the default frontend environment configuration:

   ```bash
   cp ./deploy/frontend/.env.development ./gforo-frontend/.env.development
   ```
3. Navigate to the frontend directory and run the dev server:

   ```bash
   cd ./gforo-frontend
   npm install
   npm run dev
   ```

#### 中文

1. 克隆前端项目到本地：

   ```bash
   git clone https://github.com/Gabri177/gforo-frontend.git
   ```
2. 替换默认的前端环境变量配置文件：

   ```bash
   cp ./deploy/frontend/.env.development ./gforo-frontend/.env.development
   ```
3. 进入前端目录并运行开发服务器：

   ```bash
   cd ./gforo-frontend
   npm install
   npm run dev
   ```

---

## ✅ Done! | 部署完成！

#### English

Your application will be running at:
**[http://localhost:5173](http://localhost:5173)**

#### 中文

你的应用将运行在：
**[http://localhost:5173](http://localhost:5173)**

---

## 🔗 Live Demo | 在线体验地址

You can try out the deployed version of Gforo here:
你可以在以下地址体验已部署的 Gforo 论坛：

🌐 **[https://foro.mistsiete.com/](https://foro.mistsiete.com/)**

> ⚠️ Note: Some admin functionalities may be restricted in the demo version.
> ⚠️ 注意：线上演示版本部分管理功能可能受限。

### 🧪 Admin Test Account | 管理员体验账号

* **Username | 用户名**: `AdminUser`
* **Password | 密码**: `333333`

---

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
