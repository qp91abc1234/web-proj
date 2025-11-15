# Vue3 后台管理系统框架

这是一个基于 Vue3 + Element Plus + Pinia 的现代化后台管理系统框架。

## 技术栈

- **核心框架**: Vue 3.5+
- **构建工具**: Vite 6.0+
- **UI 组件库**: Element Plus 2.9+
- **状态管理**: Pinia 2.3+
- **路由管理**: Vue Router 4.5+
- **CSS 框架**: UnoCSS
- **开发语言**: TypeScript 5.6+
- **代码规范**: ESLint + Prettier + Stylelint
- **HTTP 请求**: Axios 1.7+
- **工具库**: 
  - @vueuse/core - Vue Composition API 工具集
  - dayjs - 日期处理
  - lodash-es - 工具函数库
  - nanoid - 唯一ID生成
  - crypto-js - 加密库

## 功能特性

### 已实现功能

- ✅ 基于 Vue3 Composition API 的响应式开发
- ✅ TypeScript 全面支持
- ✅ 动态路由和权限管理
- ✅ 侧边栏菜单（支持收缩/展开）
- ✅ 页面标签导航
- ✅ 响应式布局（支持移动端）
- ✅ 主题切换功能
- ✅ 用户认证（Token + RefreshToken）
- ✅ 请求拦截和错误处理
- ✅ 404/403 错误页面
- ✅ 按钮级权限控制
- ✅ 移动端调试（VConsole）
- ✅ 本地存储封装
- ✅ 组件自动导入
- ✅ 代码规范检查

### 核心架构

#### 目录结构

\`\`\`
web-proj/
├── src/
│   ├── assets/              # 静态资源
│   ├── common/              # 公共资源
│   │   ├── hooks/          # 可复用的组合式函数
│   │   ├── scss/           # 全局样式
│   │   ├── types/          # TypeScript 类型定义
│   │   └── utils/          # 工具函数
│   ├── components/          # 业务组件
│   ├── gComponents/         # 全局组件
│   ├── modules/            # 功能模块
│   │   └── layout/         # 布局组件
│   ├── router/             # 路由配置
│   ├── store/              # 状态管理
│   │   └── modules/        # Pinia 模块
│   ├── views/              # 页面视图
│   ├── App.vue             # 根组件
│   ├── main.ts             # 入口文件
│   └── env.d.ts            # 环境变量类型定义
├── public/                  # 公共静态资源
├── dist/                    # 构建输出目录
├── .gitignore              # Git 忽略配置
├── .prettierrc             # Prettier 配置
├── .editorconfig           # 编辑器配置
├── eslint.config.mjs       # ESLint 配置
├── stylelint.config.mjs    # Stylelint 配置
├── tsconfig.json           # TypeScript 配置
├── uno.config.ts           # UnoCSS 配置
├── vite.config.ts          # Vite 配置
├── package.json            # 项目依赖
└── README.md               # 项目文档
\`\`\`

#### 核心功能说明

##### 1. 权限管理

项目采用基于角色的权限控制（RBAC）：

- **菜单权限**: 通过 `permissionStore` 动态生成菜单树和路由
- **按钮权限**: 通过 `btnMap` 控制按钮显示/隐藏
- **路由守卫**: 在路由跳转前验证权限

##### 2. 状态管理

使用 Pinia 进行状态管理，主要模块：

- **appStore**: 应用全局状态（侧边栏、主题、标签页等）
- **userStore**: 用户信息和认证状态
- **permissionStore**: 权限和菜单数据

##### 3. 请求封装

基于 Axios 封装了统一的请求方法：

- 自动添加 Token
- Token 过期自动刷新
- 统一错误处理
- 请求/响应拦截

##### 4. 布局系统

采用经典的后台管理系统布局：

- 顶部导航栏
- 左侧菜单栏（可收缩）
- 主内容区域
- 响应式适配（PC/移动端）

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8 (推荐)

### 安装依赖

\`\`\`bash
pnpm install
\`\`\`

### 开发模式

\`\`\`bash
pnpm dev
\`\`\`

访问 http://localhost:3500

### 构建生产版本

\`\`\`bash
pnpm build
\`\`\`

### 构建并查看打包分析

\`\`\`bash
pnpm build:stat
\`\`\`

### 预览生产版本

\`\`\`bash
pnpm preview
\`\`\`

## 配置说明

### 环境变量

项目支持多环境配置，在根目录创建对应的环境文件：

- \`.env\` - 所有环境共用
- \`.env.development\` - 开发环境
- \`.env.production\` - 生产环境

可用的环境变量：

\`\`\`
VITE_BASE_URL=接口基础路径
VITE_DEV_TOOL=是否启用开发者工具
VITE_VISUALIZER_TOOL=是否启用打包分析
\`\`\`

### 路由配置

在 \`src/store/modules/permissionStore.ts\` 中配置菜单：

\`\`\`typescript
const menuArr: IMenuArr = [
  {
    path: 'home',
    title: '首页',
    compPath: '/src/views/home/home.vue',
    icon: 'Sunny'
  },
  {
    path: 'system',
    title: '系统管理',
    icon: 'Setting',
    children: [
      {
        path: 'user',
        title: '用户管理',
        compPath: '/src/views/system/user.vue'
      }
    ]
  }
]
\`\`\`

## 开发指南

### 添加新页面

1. 在 \`src/views\` 下创建页面组件
2. 在 \`permissionStore\` 的 \`menuArr\` 中添加菜单项
3. 系统会自动注册路由

### 添加全局组件

1. 在 \`src/gComponents\` 下创建组件
2. 在 \`src/gComponents/index.ts\` 中注册

### 使用工具函数

项目提供了多个实用工具：

- \`createStorageRef\`: 创建持久化响应式数据
- \`createConstantsByList\`: 根据列表创建常量对象
- \`uniqueId\`: 生成唯一ID
- \`req\`: HTTP 请求实例

### 代码规范

运行以下命令检查和修复代码：

\`\`\`bash
# ESLint 检查
npx eslint .

# Stylelint 检查
npx stylelint "src/**/*.{vue,scss,css}"

# Prettier 格式化
npx prettier --write .
\`\`\`

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 常见问题

### 1. 组件自动导入不生效？

检查 \`auto-imports.d.ts\` 和 \`components.d.ts\` 是否正确生成。

### 2. 样式不生效？

确保在 Vue 组件中使用了正确的 scoped 属性，或者使用了 UnoCSS 的原子类。

### 3. 路由权限配置？

在 \`permissionStore\` 中配置菜单，系统会自动根据权限生成路由。

## 许可证

MIT License

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v0.0.1 (2025-11-15)

- 初始化项目
- 实现基础框架功能
- 添加权限管理系统
- 完善文档

