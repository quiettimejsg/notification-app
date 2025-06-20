const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { User } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 获取用户列表（管理员）
router.get('/users', authenticateToken, requireAdmin, [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('per_page').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: '参数验证失败',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;
    const offset = (page - 1) * perPage;

    const { count, rows: users } = await User.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit: perPage,
      offset: offset
    });

    const totalPages = Math.ceil(count / perPage);

    res.json({
      users: users.map(user => user.toJSON()),
      total: count,
      pages: totalPages,
      current_page: page,
      per_page: perPage
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取单个用户信息（管理员）
router.get('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: '无效的用户ID' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json(user.toJSON());
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 更新用户信息（管理员）
router.put('/users/:id', authenticateToken, requireAdmin, [
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('用户名长度必须在3-50个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  body('isAdmin').optional().isBoolean().withMessage('管理员状态必须是布尔值'),
  body('password').optional().isLength({ min: 6 }).withMessage('密码长度至少6个字符')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: '输入验证失败',
        errors: errors.array()
      });
    }

    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: '无效的用户ID' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 检查用户名是否已被其他用户使用
    if (req.body.username && req.body.username !== user.username) {
      const existingUser = await User.findOne({ 
        where: { 
          username: req.body.username,
          id: { [require('sequelize').Op.ne]: userId }
        } 
      });
      if (existingUser) {
        return res.status(400).json({ message: '用户名已存在' });
      }
    }

    // 更新用户信息
    const updateData = {};
    if (req.body.username !== undefined) updateData.username = req.body.username;
    if (req.body.isAdmin !== undefined) updateData.isAdmin = req.body.isAdmin;

    await user.update(updateData);

    // 如果提供了新密码，更新密码
    if (req.body.password) {
      await user.setPassword(req.body.password);
      await user.save();
    }

    res.json(user.toJSON());
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 删除用户（管理员）
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: '无效的用户ID' });
    }

    // 不能删除自己
    if (userId === req.user.userId) {
      return res.status(400).json({ message: '不能删除自己的账户' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    await user.destroy();

    res.json({ message: '用户已删除' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;

