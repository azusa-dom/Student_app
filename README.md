
# 学生服务问答系统

集成 LLM（tinyllama）、RAG 检索、现代前端与 API。

## 文档入口
- 详细文档见 `docs/` 目录（API、部署、前端、后端、LLM、RAG、工作日志）

## 快速开始
1. 安装依赖：`pip install -r requirements.txt`、`npm install`
2. 启动后端：`python api_qa.py`
3. 启动前端：`npm run dev`
4. 访问 `localhost:5173` 或部署页面


## 本地快捷命令（新增）

已提供 Makefile 与 `.env.example`，便于快捷启动和本地配置：

- 复制 `.env.example` 为 `.env`，填入：`GROQ_API_KEY=...`，`MODEL_PROVIDER=groq`（`.env` 已加入 `.gitignore`，不要提交密钥）
- 一键安装依赖：`make env-setup`
- 仅后端：`make dev-backend`（http://127.0.0.1:5051）
- 仅前端：`make dev-frontend`（http://localhost:5173）
- 同时启动：`make dev`（后端后台 + 前端前台）
- 停止服务：`make stop`


## ✨ Key Features

### 📅 Activity Management
- **Event Registration**: Seamless registration for campus activities and events
- **Calendar Integration**: Activities automatically sync with personal calendar
- **Activity Tracking**: Follow and manage subscribed activities

### 🏫 Campus Services
- **Campus Information**: Access to campus facilities and services
- **Emergency Support**: Quick access to emergency contacts and procedures
- **Mail Integration**: Campus mail system integration

### 🌐 User Experience
- **Internationalization**: Multi-language support with navigation localization
- **Theme System**: Customizable themes for personalized experience
- **Responsive Design**: Optimized for desktop and mobile devices

## 🛠 Technology Stack

- **Frontend**: JavaScript (84.8%), HTML, CSS (12.8%)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Deployment**: GitHub Pages
- **Version Control**: Git with automated deployment scripts

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone https://github.com/azusa-dom/Student_app.git
cd Student_app
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## 📁 Project Structure

```
Student_app/
├── src/                    # Source code
├── public/                 # Static assets
├── backend/               # Backend services
├── dist/                  # Build output
├── .github/workflows/     # GitHub Actions
├── *.css                  # Component styles
├── *.sh                   # Deployment scripts
└── configuration files
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run deploy` - Deploy to GitHub Pages
- `./build-deploy.sh` - Automated build and deployment
- `./check-status.sh` - Check deployment status

## 🚀 Deployment

The application is automatically deployed to GitHub Pages using custom deployment scripts. The deployment process includes:

1. Automated building with Vite
2. CSS optimization and cleanup
3. GitHub Pages deployment
4. Status monitoring and reporting

## 🧪 Testing

Comprehensive testing suite includes:
- AuthProvider functionality tests
- Component integration tests
- Service layer testing (ActivityService, ActivityManager)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Recent Updates

- ✅ Integrated activity registration and tracking with calendar
- ✅ Enhanced ActivityService and ActivityManager
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
