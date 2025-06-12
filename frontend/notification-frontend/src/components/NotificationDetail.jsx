import React, { useState, useEffect } from 'react';
import { notificationAPI, uploadAPI } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Calendar, User, Download, FileText, Image, Video, Music, Archive, AlertCircle, Info, AlertTriangle, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const NotificationDetail = ({ notificationId, onBack }) => {
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 优先级配置
  const priorityConfig = {
    low: { 
      label: '低优先级', 
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      icon: Info 
    },
    medium: { 
      label: '中优先级', 
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      icon: AlertCircle 
    },
    high: { 
      label: '高优先级', 
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      icon: AlertTriangle 
    },
    urgent: { 
      label: '紧急', 
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      icon: Zap 
    },
  };

  // 获取文件图标
  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Video;
    if (mimeType.startsWith('audio/')) return Music;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return Archive;
    return FileText;
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 获取通知详情
  const fetchNotification = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotification(notificationId);
      setNotification(response.data);
      setError('');
    } catch (err) {
      setError('获取通知详情失败');
      console.error('Error fetching notification:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (notificationId) {
      fetchNotification();
    }
  }, [notificationId]);

  // 下载附件
  const handleDownload = (filename, originalFilename) => {
    const downloadUrl = `http://localhost:5001/api/files/${filename}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = originalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">加载中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回列表
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回列表
        </Button>
        <Alert>
          <AlertDescription>通知不存在</AlertDescription>
        </Alert>
      </div>
    );
  }

  const priorityInfo = priorityConfig[notification.priority] || priorityConfig.medium;
  const PriorityIcon = priorityInfo.icon;

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回列表
      </Button>

      {/* 通知详情 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold mb-3">
                {notification.title}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>发布者：{notification.author_username}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>发布时间：{formatDate(notification.created_at)}</span>
                </div>
                {notification.updated_at !== notification.created_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>更新时间：{formatDate(notification.updated_at)}</span>
                  </div>
                )}
              </div>
            </div>
            <Badge className={`${priorityInfo.color} flex items-center gap-1`}>
              <PriorityIcon className="h-4 w-4" />
              {priorityInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Markdown内容 */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <ReactMarkdown>{notification.content}</ReactMarkdown>
          </div>

          {/* 附件列表 */}
          {notification.attachments && notification.attachments.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">附件 ({notification.attachments.length})</h3>
              <div className="grid gap-3">
                {notification.attachments.map((attachment) => {
                  const FileIcon = getFileIcon(attachment.mime_type);
                  return (
                    <Card key={attachment.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileIcon className="h-8 w-8 text-blue-500" />
                          <div>
                            <p className="font-medium">{attachment.original_filename}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(attachment.file_size)} • {attachment.mime_type}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(attachment.filename, attachment.original_filename)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          下载
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationDetail;

