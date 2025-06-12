# 通知应用技术架构设计

## 系统架构

### 前端 (React)
- **框架**: React 18
- **UI库**: Tailwind CSS + Shadcn/UI
- **图标**: Lucide React
- **状态管理**: React Context + useState/useReducer
- **路由**: React Router
- **国际化**: react-i18next
- **Markdown渲染**: react-markdown
- **HTTP客户端**: Axios

### 后端 (Flask)
- **框架**: Flask
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **ORM**: SQLAlchemy
- **认证**: Flask-JWT-Extended
- **文件上传**: Flask-Upload
- **CORS**: Flask-CORS
- **API文档**: Flask-RESTX

## 数据库设计

### 用户表 (users)
```sql
id: INTEGER PRIMARY KEY
username: VARCHAR(50) UNIQUE NOT NULL
password_hash: VARCHAR(255) NOT NULL
is_admin: BOOLEAN DEFAULT FALSE
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### 通知表 (notifications)
```sql
id: INTEGER PRIMARY KEY
title: VARCHAR(200) NOT NULL
content: TEXT NOT NULL (Markdown格式)
priority: ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium'
author_id: INTEGER FOREIGN KEY REFERENCES users(id)
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
is_published: BOOLEAN DEFAULT TRUE
```

### 附件表 (attachments)
```sql
id: INTEGER PRIMARY KEY
notification_id: INTEGER FOREIGN KEY REFERENCES notifications(id)
filename: VARCHAR(255) NOT NULL
original_filename: VARCHAR(255) NOT NULL
file_path: VARCHAR(500) NOT NULL
file_size: INTEGER NOT NULL
mime_type: VARCHAR(100) NOT NULL
uploaded_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

## API接口设计

### 认证相关
- POST /api/auth/login - 用户登录
- POST /api/auth/logout - 用户登出
- GET /api/auth/me - 获取当前用户信息

### 通知相关
- GET /api/notifications - 获取通知列表
- GET /api/notifications/:id - 获取单个通知详情
- POST /api/notifications - 创建新通知 (管理员)
- PUT /api/notifications/:id - 更新通知 (管理员)
- DELETE /api/notifications/:id - 删除通知 (管理员)

### 文件相关
- POST /api/upload - 上传文件
- GET /api/files/:filename - 下载文件

## 功能特性

### 用户功能
- 查看通知列表
- 查看通知详情
- 按优先级筛选
- 搜索通知
- 多语言切换
- 深色模式切换

### 管理员功能
- 所有用户功能
- 创建/编辑/删除通知
- 设置通知优先级
- 上传附件
- Markdown编辑器

### 界面特性
- 响应式设计
- 深色模式支持
- 多语言支持 (中文简体/繁体、英语、日语)
- 流畅动画效果
- 现代化UI设计

## 部署方案
- 前端: 静态文件部署
- 后端: Flask应用部署
- 数据库: SQLite文件或PostgreSQL
- 文件存储: 本地文件系统

