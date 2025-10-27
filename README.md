# 🎓 学生服务问答系统

# 🎓 学生服务问答系统

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://azusa-dom.github.io/Student_app/)

[![Python](https://img.shields.io/badge/Python-3.8+-blue)](https://python.org)[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://azusa-dom.github.io/Student_app/)

[![React](https://img.shields.io/badge/React-18+-61dafb)](https://reactjs.org)[![Python](https://img.shields.io/badge/Python-3.8+-blue)](https://python.org)

[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688)](https://fastapi.tiangolo.com)[![React](https://img.shields.io/badge/React-18+-61dafb)](https://reactjs.org)

[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688)](https://fastapi.tiangolo.com)

智能学生服务问答系统，集成 LLM、RAG 检索、现代前端与 FastAPI 后端。

智能学生服务问答系统，集成 LLM、RAG 检索、现代前端与 FastAPI 后端。

## 📁 项目结构

## 📁 项目结构

```

Student_app/```

├── 📂 src/                    # React 前端源码Student_app/

│   ├── components/            # UI 组件├── 📂 src/                    # React 前端源码

│   ├── auth/                  # 认证模块│   ├── components/            # UI 组件

│   └── services/              # API 服务│   ├── auth/                  # 认证模块

├── 📂 scripts/                # Python 后端核心│   └── services/              # API 服务

│   ├── qa_enhanced_wrapper.py # 增强问答逻辑├── 📂 scripts/                # Python 后端核心

│   ├── llm_client.py          # LLM 客户端│   ├── qa_enhanced_wrapper.py # 增强问答逻辑

│   └── enhanced_retriever.py  # RAG 检索器│   ├── llm_client.py          # LLM 客户端

├── 📂 config/                 # 配置文件│   └── enhanced_retriever.py  # RAG 检索器

│   ├── vite.config.js         # Vite 配置├── 📂 config/                 # 配置文件

│   ├── nixpacks.toml          # Railway 部署│   ├── vite.config.js         # Vite 配置

│   └── tailwind.config.js     # 样式配置│   ├── nixpacks.toml          # Railway 部署

├── 📂 demo/                   # 演示页面│   └── tailwind.config.js     # 样式配置

│   └── demo_qa.html           # 独立问答页面├── 📂 demo/                   # 演示页面

├── 📂 deployment/             # 部署脚本│   └── demo_qa.html           # 独立问答页面

├── 📂 docs/                   # 详细文档├── 📂 deployment/             # 部署脚本

└── 📂 public/                 # 静态资源├── 📂 docs/                   # 详细文档

```└── 📂 public/                 # 静态资源

```

## 🚀 快速开始

## 🚀 快速开始

### 方法一：使用 Makefile（推荐）

### 方法一：使用 Makefile（推荐）

```bash

# 1. 配置环境变量```bash

cp .env.example .env# 1. 配置环境变量

# 编辑 .env 填入你的 GROQ_API_KEYcp .env.example .env

# 编辑 .env 填入你的 GROQ_API_KEY

# 2. 一键安装依赖

make env-setup# 2. 一键安装依赖

make env-setup

# 3. 启动服务

make dev              # 同时启动前后端# 3. 启动服务

# 或分别启动：make dev              # 同时启动前后端

make dev-backend      # 仅后端 (127.0.0.1:5051)# 或分别启动：

make dev-frontend     # 仅前端 (localhost:5173)make dev-backend      # 仅后端 (127.0.0.1:5051)

make dev-frontend     # 仅前端 (localhost:5173)

# 4. 停止服务

make stop# 4. 停止服务

```make stop

```

### 方法二：手动启动

### 方法二：手动启动

```bash

# 安装依赖```bash

pip install -r requirements.txt# 安装依赖

npm installpip install -r requirements.txt

npm install

# 启动后端

python api_qa.py# 启动后端

python api_qa.py

# 启动前端（新终端）

npm run dev# 启动前端（新终端）

```npm run dev

```

## ✨ 核心功能- 一键安装依赖：`make env-setup`

- 仅后端：`make dev-backend`（http://127.0.0.1:5051）

### 🤖 智能问答- 仅前端：`make dev-frontend`（http://localhost:5173）

- **LLM 集成**: 支持 Groq API (Llama 3.1-70B)- 同时启动：`make dev`（后端后台 + 前端前台）

- **RAG 检索**: 基于 UCL 服务数据的增强检索- 停止服务：`make stop`

- **多语言**: 中英文界面切换

- **实时响应**: 流式对话体验

## ✨ Key Features

### 🎯 服务覆盖

- **校园活动**: 活动注册、日程管理### 📅 Activity Management

- **校园服务**: 设施信息、紧急联系- **Event Registration**: Seamless registration for campus activities and events

- **学术支持**: 课程咨询、评估指导- **Calendar Integration**: Activities automatically sync with personal calendar

- **邮件集成**: 校园邮件系统- **Activity Tracking**: Follow and manage subscribed activities



### 🔧 技术特性### 🏫 Campus Services

- **现代架构**: React + FastAPI + Vite- **Campus Information**: Access to campus facilities and services

- **响应式设计**: 移动端友好- **Emergency Support**: Quick access to emergency contacts and procedures

- **主题系统**: 可自定义界面主题- **Mail Integration**: Campus mail system integration

- **云端部署**: Railway + GitHub Pages

### 🌐 User Experience

## 📊 API 接口- **Internationalization**: Multi-language support with navigation localization

- **Theme System**: Customizable themes for personalized experience

| 端点 | 方法 | 描述 |- **Responsive Design**: Optimized for desktop and mobile devices

|------|------|------|

| `/` | GET | 主页面 (demo_qa.html) |## 🛠 Technology Stack

| `/api/health` | GET | 健康检查 |

| `/api/qa` | GET/POST | 问答接口 |- **Frontend**: JavaScript (84.8%), HTML, CSS (12.8%)

| `/api/feedback` | POST | 用户反馈 |- **Build Tool**: Vite

- **Styling**: Tailwind CSS

## 🛠 开发环境- **Deployment**: GitHub Pages

- **Version Control**: Git with automated deployment scripts

### 本地命令

- `make env-setup` - 安装依赖## 🚀 Getting Started

- `make dev` - 启动开发环境

- `make dev-backend` - 仅后端 (127.0.0.1:5051)  ### Prerequisites

- `make dev-frontend` - 仅前端 (localhost:5173)- Node.js (v14 or higher)

- `make stop` - 停止所有服务- npm or yarn package manager

- `make clean` - 清理构建文件

### Installation

### 环境配置

```bash1. Clone the repository

# .env 文件配置```bash

GROQ_API_KEY=your_groq_api_key_heregit clone https://github.com/azusa-dom/Student_app.git

MODEL_PROVIDER=groqcd Student_app

``````



## 🚢 部署方式2. Install dependencies

```bash

### GitHub Pages (前端)npm install

```bash```

npm run build

npm run deploy3. Start development server

``````bash

npm run dev

### Railway (全栈)```

```bash

railway up --service student_app4. Open your browser and navigate to `http://localhost:3000`

```

## 📁 Project Structure

## 📚 文档目录

- [API 文档](docs/API/) - 接口详细说明```

- [部署指南](docs/DEPLOYMENT/) - 部署配置说明  Student_app/

- [前端开发](docs/FRONTEND/) - React 开发指南├── src/                    # Source code

- [后端开发](docs/BACKEND/) - FastAPI 开发指南├── public/                 # Static assets

- [LLM 配置](docs/LLM/) - 大模型集成指南├── backend/               # Backend services

├── dist/                  # Build output

## 🧪 测试├── .github/workflows/     # GitHub Actions

├── *.css                  # Component styles

```bash├── *.sh                   # Deployment scripts

# 运行测试└── configuration files

make test```



# 手动测试## 🔧 Available Scripts

python -m pytest tests/

```- `npm run dev` - Start development server

- `npm run build` - Build for production

## 🤝 贡献指南- `npm run deploy` - Deploy to GitHub Pages

- `./build-deploy.sh` - Automated build and deployment

1. Fork 本仓库- `./check-status.sh` - Check deployment status

2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)

3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)## 🚀 Deployment

4. 推送到分支 (`git push origin feature/AmazingFeature`)

5. 创建 Pull RequestThe application is automatically deployed to GitHub Pages using custom deployment scripts. The deployment process includes:



## 📝 更新日志1. Automated building with Vite

2. CSS optimization and cleanup

- ✅ 重构项目结构，分类整理配置文件3. GitHub Pages deployment

- ✅ 集成 LLM 增强问答功能4. Status monitoring and reporting

- ✅ 添加 Makefile 本地快捷命令

- ✅ 完善 Railway + GitHub Pages 双重部署## 🧪 Testing

- ✅ 优化 RAG 检索和多语言支持

Comprehensive testing suite includes:

## 📄 许可证- AuthProvider functionality tests

- Component integration tests

本项目目前未设许可证。如需使用，请联系仓库所有者。- Service layer testing (ActivityService, ActivityManager)



## 👨‍💻 作者## 🤝 Contributing



**azusa-dom**1. Fork the repository

- GitHub: [@azusa-dom](https://github.com/azusa-dom)2. Create your feature branch (`git checkout -b feature/AmazingFeature`)

3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)

## 🐛 问题反馈4. Push to the branch (`git push origin feature/AmazingFeature`)

5. Open a Pull Request

如遇到问题或有建议，请在 [Issues](https://github.com/azusa-dom/Student_app/issues) 中提出。

## 📝 Recent Updates

---

- ✅ Integrated activity registration and tracking with calendar

*为学生社区用心构建 ❤️*- ✅ Enhanced ActivityService and ActivityManager
- ✅ Fixed CSS issues in CampusPage and EmergencyPage
- ✅ Completed AuthProvider fixes with comprehensive testing
- ✅ Added theme system and new pages (Mail/Campus)
- ✅ Implemented navigation internationalization

## 📄 License

This project is currently unlicensed. Please contact the repository owner for usage permissions.

## 👨‍💻 Author

**azusa-dom**
- GitHub: [@azusa-dom](https://github.com/azusa-dom)

## 🐛 Issues & Support

If you encounter any issues or have questions, please [open an issue](https://github.com/azusa-dom/Student_app/issues) on GitHub.

---

*Built with ❤️ for the student community*
