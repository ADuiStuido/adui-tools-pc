<div align="center">
  <a href="https://github.com/ADuiStuido/adui-tools-pc">
    <img alt="ADui Tools" width="215" src="./public/adui-tools-logo.svg">
  </a>
  <h1>ADui Tools</h1>
  <p align="center">
    <strong>A cross-platform AI & utility desktop application for developers</strong>
  </p>

[![license](https://img.shields.io/github/license/ADuiStuido/adui-tools-pc.svg)](LICENSE)
[![Vue](https://img.shields.io/badge/Vue-3.5.18-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.6-646CFF.svg)](https://vitejs.dev/)

  <p align="center"><a href="README.md">简体中文</a> | English</p>

</div>

## ✨ Features

### 🤖 AI Chat

- Integrated with multiple AI providers:
  - ChatGPT
  - DeepSeek
  - Tencent Yuanbao
  - Doubao
  - Qwen
  - Wenxin Yiyan
- Multi-turn contextual conversations
- Markdown rendering & code highlighting
- Conversation management (create / rename / archive)
- Local persistence with SQLite

### 🛠 Developer Tools

- **JSON → Dart Model Generator**
  - Automatic type inference
  - Nested structure support
  - Generates `fromJson / toJson`

- **Color Converter**
  - HEX / RGB / RGBA / HSL
  - Real-time conversion & preview

- **Translation Tools**
  - Baidu Translate
  - Youdao Translate

### 🌐 Network & Proxy

- Built-in proxy configuration
  - HTTP / HTTPS
  - SOCKS5
- Global proxy and per-service override
- No Proxy (domain bypass)
- Designed for restricted network environments (e.g. ChatGPT)

### 💾 Local-First

- All data stored locally in SQLite
- Unified management for conversations, messages, settings, and tool history
- API keys stored locally only

## 📦 Tech Stack

| Layer      | Tech                    |
| ---------- | ----------------------- |
| Frontend   | Vue 3 (Composition API) |
| Build Tool | Vite                    |
| Desktop    | Tauri                   |
| UI         | Naive UI                |
| State      | Pinia                   |
| Storage    | SQLite                  |
| Language   | TypeScript              |

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- Rust >= 1.70
- pnpm / npm / yarn

### Install

```bash
pnpm install
```

### Development

```bash
pnpm tauri dev
```

### Build

```bash
pnpm tauri build
```

## ⚙️ Configuration

### AI Providers

- API key per provider
- Provider binding per conversation
- System prompt support

### Proxy

- HTTP / HTTPS / SOCKS5
- Global / per-service proxy
- Domain bypass (No Proxy)

> All configurations are stored locally in SQLite and take effect immediately.

## 🔐 Security

- API keys are stored locally only
- No chat or tool data is uploaded
- Local database can be cleared at any time

## 🧩 Extensibility

ADui Tools is designed with a modular architecture:

- Independent UI
- Independent business logic
- Automatic access to unified storage & network layers

## 🗺 Roadmap

- Prompt template system
- AI comparison mode
- Regex tool
- Timestamp converter
- Markdown tools
- HTTP debug tool
- Plugin-based tool ecosystem

## 🤝 Contributing

Contributions are welcome!

- Fork this repository
- Create your feature branch
- Commit your changes
- Open a Pull Request

## 📄 License

MIT License

## 🙌 Acknowledgements

- Vue
- Vite
- Tauri
- Naive UI
- All AI providers
