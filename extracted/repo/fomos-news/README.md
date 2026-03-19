# Fomos News 🟢

> **AI & Crypto Daily Intelligence Platform**
> 
> *Architecting Intelligent Financial Decisions with AI Agents*

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-cyan.svg)](https://tailwindcss.com)

---

## 项目简介

**Fomos News** 是一个开源的 AI 与加密货币领域每日洞察平台，专为金融智能体（Financial AI Agent）从业者、投资者和研究人员设计。项目将每日的 AI 领域和加密货币领域的洞察任务产品化，以赛博朋克/黑客帝国终端美学呈现，支持明暗模式切换。

### 核心功能

| 功能模块 | 描述 |
|----------|------|
| 📰 新闻展示 | AI 趋势、产品洞察、加密货币、TradingAgent、全球动态五大分类 |
| 💡 每日简报 | 产品洞察日报，终端风格展示，含综合研判 |
| 📈 市场信号 | 多空概率、恐慌贪婪指数、情绪分析、加密价格实时展示 |
| 🏆 排行榜 | AI 模型排名、Agent 排名、TradingAgent 排名 |
| 🌐 生态图 | AI Agent 生态全景交互节点图 |
| 📧 邮件订阅 | 用户订阅每日简报邮件通知 |

---

## 技术栈

```
前端框架:  React 19 + TypeScript 5.6
路由:      Wouter 3.x (轻量级客户端路由)
样式:      Tailwind CSS 4.x + 自定义 CSS 变量
图表:      Recharts 2.x (AreaChart, BarChart, RadialBarChart)
动画:      Framer Motion + CSS 动画
UI 组件:   shadcn/ui (Radix UI 基础)
构建工具:  Vite 7.x
字体:      JetBrains Mono + Inter (Google Fonts)
```

---

## 快速开始

### 环境要求

- Node.js >= 18.0
- pnpm >= 8.0 (推荐) 或 npm/yarn

### 安装与运行

```bash
# 1. 克隆仓库
git clone https://github.com/your-org/fomos-news.git
cd fomos-news

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm dev

# 4. 访问 http://localhost:3000
```

### 构建生产版本

```bash
# 构建
pnpm build

# 预览生产构建
pnpm preview
```

---

## 项目结构

```
fomos-news/
├── client/
│   ├── index.html              # HTML 入口，引入 Google Fonts
│   └── src/
│       ├── App.tsx             # 路由配置
│       ├── index.css           # 全局样式 & 设计系统变量
│       ├── components/
│       │   ├── Layout.tsx      # 主布局（导航栏、Ticker、页脚）
│       │   └── SubscribeModal.tsx  # 邮件订阅弹窗
│       ├── pages/
│       │   ├── Home.tsx        # 首页（新闻流 + 市场信号）
│       │   ├── BriefingPage.tsx    # 每日简报页
│       │   ├── MarketsPage.tsx     # 市场信号页
│       │   ├── LeaderboardPage.tsx # 排行榜页
│       │   └── EcosystemPage.tsx   # 生态图页
│       └── lib/
│           └── sampleData.ts   # 示例数据（新闻、简报、排行、生态）
├── server/
│   └── index.ts                # Express 静态文件服务器
├── README.md
└── package.json
```

---

## 设计系统

Fomos News 采用**神经赛博朋克（Neural Cyberpunk）**设计风格：

### 颜色系统

| 变量 | 暗模式 | 亮模式 | 用途 |
|------|--------|--------|------|
| `--neon` | `#00FF88` | `#006633` | 主色调，霓虹绿 |
| `--background` | `#080C0A` | `#F0FFF4` | 页面背景 |
| `--cyber-red` | `#FF3366` | `#CC0033` | 空头/警告 |
| `--cyber-blue` | `#00D4FF` | `#0066CC` | 数据/链接 |
| `--cyber-orange` | `#FF8C00` | `#CC5500` | 强调/BTC |

### 字体规范

- **标题/数据**: `JetBrains Mono` — 等宽字体，黑客终端感
- **正文**: `Inter` — 高可读性，现代感
- **代码/终端**: `JetBrains Mono Regular`

### 组件类名

```css
.neon-text          /* 霓虹绿发光文字 */
.neon-card          /* 悬停时边框发光的卡片 */
.cyber-panel        /* 带扫描线动画的面板 */
.terminal-text      /* 等宽终端风格文字 */
.data-badge         /* 数据标签徽章 */
.scanlines          /* 扫描线叠加效果 */
```

---

## 数据接入

当前版本使用 `client/src/lib/sampleData.ts` 中的示例数据。生产环境可替换为以下数据源：

### 新闻数据

```typescript
// 替换 newsItems 为 API 调用
const { data } = await fetch('/api/news?category=ai&limit=20').then(r => r.json());
```

推荐数据源：
- **NewsAPI** — 全球新闻聚合
- **CryptoPanic** — 加密货币新闻
- **自建爬虫** — 针对 TechCrunch、CoinDesk 等

### 市场数据

```typescript
// 恐慌贪婪指数
const fgi = await fetch('https://api.alternative.me/fng/').then(r => r.json());

// 加密价格
const prices = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd').then(r => r.json());
```

### 邮件订阅

将 `SubscribeModal.tsx` 中的模拟 API 替换为真实服务：

```typescript
// Mailchimp
const response = await fetch('/api/subscribe', {
  method: 'POST',
  body: JSON.stringify({ email, list_id: 'YOUR_LIST_ID' })
});

// 或使用 Resend / SendGrid
```

---

## 部署

### Vercel (推荐)

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Manus 平台

本项目已在 Manus 平台部署，点击 Management UI 中的 **Publish** 按钮即可一键发布。

---

## 开发路线图

- [ ] **v1.1** — 接入真实新闻 API（NewsAPI + CryptoPanic）
- [ ] **v1.2** — 邮件订阅后端（Resend + 数据库存储）
- [ ] **v1.3** — 用户认证（收藏、个性化推送）
- [ ] **v1.4** — AI 自动摘要生成（接入 LLM API）
- [ ] **v2.0** — 实时 WebSocket 价格推送
- [ ] **v2.1** — TradingAgent 回测数据可视化
- [ ] **v2.2** — 多语言支持（EN/ZH/JP）

---

## 贡献指南

欢迎提交 PR 和 Issue！

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'feat: add your feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 提交 Pull Request

---

## 关于 Fomos

**Fomos** 是一家产品驱动的金融智能体 SaaS 初创公司。

> *Fomos is the financial AI agent that bridges intents and financial actions.*
> 
> **Mission**: Architecting Intelligent Financial Decisions with AI Agents.
> 
> **Vision**: Codifying Rationality, Unleashing Intuition.

---

## License

MIT License © 2026 Fomos Inc.

---

*Built with ❤️ and ☕ by the Fomos team.*
