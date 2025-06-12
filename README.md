# 通知管理系统

一个功能完整的网页通知应用，支持管理员发布通知、用户查看通知、多语言、深色模式、响应式设计和动画效果。

## 功能特性

### 🔐 用户认证
- 管理员登录系统
- JWT令牌认证
- 安全的密码验证

### 📢 通知管理
- 管理员可发布新通知
- 支持Markdown格式内容
- 通知优先级管理（低、中、高、紧急）
- 文件附件上传（图片、视频、音频、文档）
- 通知编辑和删除

### 🌍 多语言支持
- 简体中文
- 繁體中文
- English
- 日本語

### 🎨 界面设计
- 现代化响应式设计
- 深色/浅色模式切换
- 流畅的动画效果
- 移动端适配
- 美观的UI组件

### 📱 响应式设计
- 桌面端优化
- 移动端适配
- 平板设备支持
- 触摸友好的交互

## 技术栈

### 后端
- **Flask** - Python Web框架
- **SQLAlchemy** - ORM数据库操作
- **Flask-JWT-Extended** - JWT认证
- **Flask-CORS** - 跨域支持
- **SQLite** - 轻量级数据库

### 前端
- **React** - 用户界面框架
- **Vite** - 构建工具
- **Tailwind CSS** - CSS框架
- **shadcn/ui** - UI组件库
- **Lucide React** - 图标库
- **react-i18next** - 国际化
- **react-markdown** - Markdown渲染
- **axios** - HTTP客户端

## 项目结构

```
notification-app/
├── backend/                    # 后端代码
│   └── notification-backend/
│       ├── src/
│       │   ├── main.py        # Flask应用入口
│       │   ├── models/        # 数据模型
│       │   │   └── user.py
│       │   └── routes/        # API路由
│       │       ├── auth.py    # 认证路由
│       │       ├── notification.py # 通知路由
│       │       └── upload.py  # 文件上传路由
│       ├── requirements.txt   # Python依赖
│       └── venv/             # 虚拟环境
├── frontend/                  # 前端代码
│   └── notification-frontend/
│       ├── src/
│       │   ├── App.jsx       # 主应用组件
│       │   ├── main.jsx      # 应用入口
│       │   ├── App.css       # 动画样式
│       │   ├── components/   # React组件
│       │   │   ├── LoginPage.jsx
│       │   │   ├── NotificationList.jsx
│       │   │   ├── NotificationDetail.jsx
│       │   │   ├── AdminNotificationForm.jsx
│       │   │   └── LanguageSelector.jsx
│       │   ├── contexts/     # React上下文
│       │   │   └── AuthContext.jsx
│       │   ├── services/     # API服务
│       │   │   └── api.js
│       │   └── i18n/        # 国际化配置
│       │       └── index.js
│       ├── package.json      # 前端依赖
│       └── index.html       # HTML入口
└── docs/                    # 项目文档
    └── architecture.md      # 架构设计文档
```

## 快速开始

### 环境要求
- Python 3.8+
- Node.js 16+
- pnpm 或 npm

### 后端启动

1. 进入后端目录：
```bash
cd notification-app/backend/notification-backend
```

2. 激活虚拟环境：
```bash
source venv/bin/activate
```

3. 安装依赖：
```bash
pip install -r requirements.txt
```

4. 启动后端服务：
```bash
python src/main.py
```

后端服务将在 `http://localhost:5001` 启动

### 前端启动

1. 进入前端目录：
```bash
cd notification-app/frontend/notification-frontend
```

2. 安装依赖：
```bash
pnpm install
```

3. 启动开发服务器：
```bash
pnpm run dev --host
```

前端应用将在 `http://localhost:5174` 启动

### 默认账号
- 用户名：`admin`
- 密码：`admin123`

## API接口

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息

### 通知接口
- `GET /api/notifications` - 获取通知列表
- `POST /api/notifications` - 创建新通知
- `GET /api/notifications/{id}` - 获取通知详情
- `PUT /api/notifications/{id}` - 更新通知
- `DELETE /api/notifications/{id}` - 删除通知

### 文件上传接口
- `POST /api/upload` - 上传文件
- `GET /api/files/{filename}` - 下载文件

## 数据库模型

### User（用户）
- `id` - 用户ID
- `username` - 用户名
- `password_hash` - 密码哈希
- `is_admin` - 是否为管理员
- `created_at` - 创建时间

### Notification（通知）
- `id` - 通知ID
- `title` - 通知标题
- `content` - 通知内容（Markdown格式）
- `priority` - 优先级（low/medium/high/urgent）
- `author_id` - 作者ID
- `created_at` - 创建时间
- `updated_at` - 更新时间

### Attachment（附件）
- `id` - 附件ID
- `notification_id` - 关联通知ID
- `filename` - 文件名
- `original_filename` - 原始文件名
- `file_size` - 文件大小
- `mime_type` - 文件类型
- `created_at` - 创建时间

## 部署说明

### 生产环境部署

1. **后端部署**：
   - 使用 Gunicorn 或 uWSGI 作为 WSGI 服务器
   - 配置 Nginx 作为反向代理
   - 使用 PostgreSQL 或 MySQL 替代 SQLite

2. **前端部署**：
   - 构建生产版本：`pnpm run build`
   - 将 `dist` 目录部署到静态文件服务器
   - 配置 Nginx 服务静态文件

3. **环境变量配置**：
   ```bash
   # 后端环境变量
   SECRET_KEY=your-secret-key
   DATABASE_URL=your-database-url
   JWT_SECRET_KEY=your-jwt-secret
   
   # 前端环境变量
   VITE_API_BASE_URL=https://your-api-domain.com
   ```

### Docker部署

创建 `docker-compose.yml`：

```yaml
version: '3.8'
services:
  backend:
    build: ./backend/notification-backend
    ports:
      - "5001:5001"
    environment:
      - SECRET_KEY=your-secret-key
      - DATABASE_URL=sqlite:///notifications.db
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads

  frontend:
    build: ./frontend/notification-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

## 开发指南

### 添加新语言

1. 在 `src/i18n/index.js` 中添加新语言资源
2. 在 `LanguageSelector.jsx` 中添加语言选项
3. 测试所有界面的翻译效果

### 自定义主题

1. 修改 `App.css` 中的CSS变量
2. 更新 Tailwind 配置文件
3. 调整深色模式样式

### 添加新功能

1. 后端：在 `routes/` 目录添加新路由
2. 前端：在 `components/` 目录添加新组件
3. 更新 API 服务和类型定义

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题，请通过以下方式联系：
- 创建 GitHub Issue
- 发送邮件至项目维护者

---

**通知管理系统** - 让团队沟通更高效！

