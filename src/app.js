require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { initDatabase } = require('./models');
const { apiLimiter, loginLimiter, registerLimiter, uploadLimiter } = require('./middleware/rateLimiter');

// 导入路由
const authRoutes = require('./routes/auth');
const notificationRoutes = require('./routes/notifications');
const uploadRoutes = require('./routes/upload');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5001;

// 安全中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 日志中间件
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// CORS配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// 解析JSON和URL编码数据
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/static', express.static(path.join(__dirname, '../public')));

// API限流
app.use('/api', apiLimiter);

// 特定路由限流
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api/upload', uploadLimiter);

// 路由
app.use('/api', authRoutes);
app.use('/api', notificationRoutes);
app.use('/api', uploadRoutes);
app.use('/api', userRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 前端静态文件服务（用于生产环境）
app.use(express.static(path.join(__dirname, '../public')));

// SPA路由处理
app.get('*', (req, res) => {
  // 如果请求的是API路径，返回404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API端点不存在' });
  }
  
  // 否则返回index.html（用于SPA）
  const indexPath = path.join(__dirname, '../public/index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({ message: '页面不存在' });
    }
  });
});

// 全局错误处理中间件
app.use((error, req, res, next) => {
  console.error('全局错误:', error);
  
  // Multer错误处理
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      message: '文件大小超出限制' 
    });
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ 
      message: '意外的文件字段' 
    });
  }

  // JWT错误处理
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Token无效' });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token已过期' });
  }

  // 默认错误响应
  res.status(error.status || 500).json({
    message: error.message || '服务器内部错误'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ message: '资源不存在' });
});

// 启动服务器
const startServer = async () => {
  try {
    // 初始化数据库
    await initDatabase();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`服务器运行在端口 ${PORT}`);
      console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`健康检查: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});

// 启动应用
if (require.main === module) {
  startServer();
}

module.exports = app;

