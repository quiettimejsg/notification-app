const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { Notification, Attachment } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 配置文件上传
const UPLOAD_FOLDER = process.env.UPLOAD_PATH || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024; // 50MB

const ALLOWED_EXTENSIONS = new Set([
  'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg',
  'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm',
  'mp3', 'wav', 'ogg', 'aac',
  'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'zip', 'rar', '7z', 'tar', 'gz'
]);

// 检查文件扩展名
const allowedFile = (filename) => {
  if (!filename.includes('.')) return false;
  const extension = filename.split('.').pop().toLowerCase();
  return ALLOWED_EXTENSIONS.has(extension);
};

// 配置multer存储
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(UPLOAD_FOLDER, { recursive: true });
      cb(null, UPLOAD_FOLDER);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const uniqueName = uuidv4() + extension;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    if (allowedFile(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'), false);
    }
  }
});

// 上传文件
router.post('/upload', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '没有选择文件' });
    }

    const notificationId = req.body.notification_id ? parseInt(req.body.notification_id) : null;

    // 如果指定了notification_id，检查通知是否存在
    if (notificationId) {
      const notification = await Notification.findByPk(notificationId);
      if (!notification) {
        // 删除已上传的文件
        await fs.unlink(req.file.path).catch(() => {});
        return res.status(404).json({ message: '通知不存在' });
      }
    }

    // 创建附件记录
    const attachment = await Attachment.create({
      notificationId: notificationId,
      filename: req.file.filename,
      originalFilename: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });

    res.status(201).json({
      message: '文件上传成功',
      attachment: attachment
    });
  } catch (error) {
    // 如果出错，删除已上传的文件
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: `文件大小不能超过${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      });
    }

    console.error('文件上传错误:', error);
    res.status(500).json({ message: error.message || '服务器内部错误' });
  }
});

// 下载文件
router.get('/files/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    
    const attachment = await Attachment.findOne({ where: { filename } });
    if (!attachment) {
      return res.status(404).json({ message: '文件不存在' });
    }

    // 检查文件是否存在
    try {
      await fs.access(attachment.filePath);
    } catch (error) {
      return res.status(404).json({ message: '文件已被删除' });
    }

    // 设置响应头
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalFilename}"`);
    res.setHeader('Content-Type', attachment.mimeType);

    // 发送文件
    res.sendFile(path.resolve(attachment.filePath));
  } catch (error) {
    console.error('文件下载错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 删除附件
router.delete('/attachments/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const attachmentId = parseInt(req.params.id);
    if (isNaN(attachmentId)) {
      return res.status(400).json({ message: '无效的附件ID' });
    }

    const attachment = await Attachment.findByPk(attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: '附件不存在' });
    }

    // 删除文件
    try {
      await fs.unlink(attachment.filePath);
    } catch (error) {
      console.warn('删除文件失败:', error.message);
    }

    // 删除数据库记录
    await attachment.destroy();

    res.json({ message: '附件已删除' });
  } catch (error) {
    console.error('删除附件错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取通知的附件列表
router.get('/notifications/:id/attachments', async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    if (isNaN(notificationId)) {
      return res.status(400).json({ message: '无效的通知ID' });
    }

    const notification = await Notification.findOne({
      where: { 
        id: notificationId,
        isPublished: true 
      }
    });

    if (!notification) {
      return res.status(404).json({ message: '通知不存在' });
    }

    const attachments = await Attachment.findAll({
      where: { notificationId: notificationId }
    });

    res.json(attachments);
  } catch (error) {
    console.error('获取附件列表错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;

