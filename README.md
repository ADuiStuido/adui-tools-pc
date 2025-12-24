<div align="center">
  <a href="https://github.com/ADuiStuido/adui-tools-pc">
    <img alt="ADui Tools" width="215" src="./public/adui-tools-logo.svg">
  </a>
  <h1>ADui Tools</h1>
  <p align="center">
    <strong>一个面向开发者的跨平台 AI & 实用工具桌面应用</strong>
  </p>

[![license](https://img.shields.io/github/license/ADuiStuido/adui-tools-pc.svg)](LICENSE)
[![Vue](https://img.shields.io/badge/Vue-3.5.18-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.6-646CFF.svg)](https://vitejs.dev/)

  <p align="center">简体中文 | <a href="README_EN.md">English</a></p>

</div>

---

## ✨ 功能特性

### 🤖 AI 对话

- 集成多种主流 AI 服务：
  - ChatGPT
  - DeepSeek
  - 腾讯元宝
  - 豆包
  - 通义千问
  - 文心一言
- 多轮上下文对话
- 支持 Markdown / 代码高亮
- 会话管理（新建 / 重命名 / 归档）
- 会话与消息本地持久化（SQLite）

### 🛠 开发者工具

- **JSON → Dart 实体类**
  - 自动类型推断
  - 支持嵌套结构
  - 生成 `fromJson / toJson`

- **色值转换**
  - HEX / RGB / RGBA / HSL
  - 实时转换 & 颜色预览

- **翻译工具**
  - 百度翻译
  - 有道翻译

### 🌐 网络与代理

- 内置代理设置
  - HTTP / HTTPS
  - SOCKS5
- 支持全局代理与按服务覆盖
- 支持 No Proxy（域名绕过）
- 适配 ChatGPT 等受限网络环境

### 💾 本地优先（Local-First）

- 所有数据存储于本地 SQLite
- 会话、消息、设置、工具历史统一管理
- API Key 仅存本地

---

## 📦 技术栈

| 层级     | 技术                     |
| -------- | ------------------------ |
| 前端     | Vue 3（Composition API） |
| 构建     | Vite                     |
| 桌面     | Tauri                    |
| UI       | Naive UI                 |
| 状态管理 | Pinia                    |
| 存储     | SQLite                   |
| 语言     | TypeScript               |

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- Rust >= 1.70
- pnpm / npm / yarn

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm tauri dev
```

### 构建应用

```bash
pnpm tauri build
```

---

## ⚙️ 配置说明

### AI 服务配置

- 每个 AI 服务独立配置 API Key
- 支持会话级 Provider 绑定
- 支持 System Prompt

### 代理配置

- 支持 HTTP / HTTPS / SOCKS5
- 支持：
  - 全局代理
  - 按服务覆盖
  - 域名绕过（No Proxy）

> 所有配置存储于本地 SQLite，修改即时生效。

---

## 🔐 安全性说明

- API Key 仅存本地
- 不会上传任何聊天或工具数据
- 可随时清空本地数据库

---

## 🧩 可扩展性

ADui Tools 采用模块化设计，新工具可以作为独立模块接入：

- 独立 UI
- 独立业务逻辑
- 自动接入统一存储与网络层

---

## 🗺 开发路线图

- Prompt 模板系统
- AI 对比模式
- 正则工具
- 时间戳转换
- Markdown 工具
- HTTP 调试工具
- 插件化工具生态

---

## 🤝 参与贡献

欢迎任何形式的贡献！

- Fork 本仓库
- 创建你的功能分支
- 提交代码
- 发起 Pull Request

---

## 📄 开源协议

MIT License

---

## 🙌 鸣谢

- Vue
- Vite
- Tauri
- Naive UI
- 所有 AI 服务提供方
