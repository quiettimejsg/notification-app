const jwt = require('jsonwebtoken');
const { User } = require('../models');

// JWT认证中间件
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: '需要提供访问令牌' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 验证用户是否存在
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token无效' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token已过期' });
    }
    
    console.error('认证错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
};

// 管理员权限检查中间件
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: '需要管理员权限' });
    }
    next();
  } catch (error) {
    console.error('权限检查错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin
};

