const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Notification, User, Attachment } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// 获取公开通知列表
router.get('/notifications', [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('per_page').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('优先级无效'),
  query('search').optional().isLength({ max: 100 }).withMessage('搜索关键词过长')
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
    const priority = req.query.priority;
    const search = req.query.search;

    // 构建查询条件
    const whereConditions = { isPublished: true };
    
    if (priority) {
      whereConditions.priority = priority;
    }

    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }

    // 计算偏移量
    const offset = (page - 1) * perPage;

    // 查询通知
    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        },
        {
          model: Attachment,
          as: 'attachments'
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: perPage,
      offset: offset
    });

    const totalPages = Math.ceil(count / perPage);

    res.json({
      notifications: notifications,
      total: count,
      pages: totalPages,
      current_page: page,
      per_page: perPage
    });
  } catch (error) {
    console.error('获取通知列表错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取单个通知详情
router.get('/notifications/:id', async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    if (isNaN(notificationId)) {
      return res.status(400).json({ message: '无效的通知ID' });
    }

    const notification = await Notification.findOne({
      where: { 
        id: notificationId,
        isPublished: true 
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        },
        {
          model: Attachment,
          as: 'attachments'
        }
      ]
    });

    if (!notification) {
      return res.status(404).json({ message: '通知不存在' });
    }

    res.json(notification);
  } catch (error) {
    console.error('获取通知详情错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 创建新通知（管理员）
router.post('/notifications', authenticateToken, requireAdmin, [
  body('title').notEmpty().isLength({ max: 200 }).withMessage('标题不能为空且长度不超过200字符'),
  body('content').notEmpty().withMessage('内容不能为空'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('优先级无效'),
  body('isPublished').optional().isBoolean().withMessage('发布状态必须是布尔值')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: '输入验证失败',
        errors: errors.array()
      });
    }

    const { title, content, priority = 'medium', isPublished = true } = req.body;

    const notification = await Notification.create({
      title,
      content,
      priority,
      authorId: req.user.userId,
      isPublished
    });

    // 获取完整的通知信息（包含作者信息）
    const fullNotification = await Notification.findByPk(notification.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        },
        {
          model: Attachment,
          as: 'attachments'
        }
      ]
    });

    res.status(201).json(fullNotification);
  } catch (error) {
    console.error('创建通知错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 更新通知（管理员）
router.put('/notifications/:id', authenticateToken, requireAdmin, [
  body('title').optional().isLength({ max: 200 }).withMessage('标题长度不超过200字符'),
  body('content').optional().notEmpty().withMessage('内容不能为空'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('优先级无效'),
  body('isPublished').optional().isBoolean().withMessage('发布状态必须是布尔值')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: '输入验证失败',
        errors: errors.array()
      });
    }

    const notificationId = parseInt(req.params.id);
    if (isNaN(notificationId)) {
      return res.status(400).json({ message: '无效的通知ID' });
    }

    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      return res.status(404).json({ message: '通知不存在' });
    }

    // 更新字段
    const updateData = {};
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.content !== undefined) updateData.content = req.body.content;
    if (req.body.priority !== undefined) updateData.priority = req.body.priority;
    if (req.body.isPublished !== undefined) updateData.isPublished = req.body.isPublished;

    await notification.update(updateData);

    // 获取更新后的完整通知信息
    const updatedNotification = await Notification.findByPk(notificationId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        },
        {
          model: Attachment,
          as: 'attachments'
        }
      ]
    });

    res.json(updatedNotification);
  } catch (error) {
    console.error('更新通知错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 删除通知（管理员）
router.delete('/notifications/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    if (isNaN(notificationId)) {
      return res.status(400).json({ message: '无效的通知ID' });
    }

    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      return res.status(404).json({ message: '通知不存在' });
    }

    await notification.destroy();

    res.json({ message: '通知已删除' });
  } catch (error) {
    console.error('删除通知错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取管理员通知列表（包括未发布的）
router.get('/admin/notifications', authenticateToken, requireAdmin, [
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

    const { count, rows: notifications } = await Notification.findAndCountAll({
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        },
        {
          model: Attachment,
          as: 'attachments'
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: perPage,
      offset: offset
    });

    const totalPages = Math.ceil(count / perPage);

    res.json({
      notifications: notifications,
      total: count,
      pages: totalPages,
      current_page: page,
      per_page: perPage
    });
  } catch (error) {
    console.error('获取管理员通知列表错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;

