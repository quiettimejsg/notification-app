import React, { useState } from 'react';
import { notificationAPI, uploadAPI } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Upload, X, FileText, Image, Video, Music, Archive, Eye, EyeOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AdminNotificationForm = ({ onSuccess, onCancel, editingNotification = null }) => {
  const [formData, setFormData] = useState({
    title: editingNotification?.title || '',
    content: editingNotification?.content || '',
    priority: editingNotification?.priority || 'medium',
    is_published: editingNotification?.is_published ?? true,
  });
  const [attachments, setAttachments] = useState(editingNotification?.attachments || []);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // 优先级选项
  const priorityOptions = [
    { value: 'low', label: '低优先级', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: '中优先级', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: '高优先级', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: '紧急', color: 'bg-red-100 text-red-800' },
  ];

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

  // 处理表单输入
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // 处理优先级选择
  const handlePriorityChange = (value) => {
    setFormData(prev => ({
      ...prev,
      priority: value,
    }));
  };

  // 处理文件上传
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      for (const file of files) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        
        const response = await uploadAPI.uploadFile(formDataUpload);
        const attachment = response.data.attachment;
        
        setAttachments(prev => [...prev, attachment]);
      }
    } catch (err) {
      setError('文件上传失败：' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      // 清空文件输入
      e.target.value = '';
    }
  };

  // 删除附件
  const handleRemoveAttachment = async (attachmentId, isExisting = false) => {
    try {
      if (isExisting) {
        await uploadAPI.deleteAttachment(attachmentId);
      }
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    } catch (err) {
      setError('删除附件失败：' + (err.response?.data?.message || err.message));
    }
  };

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        attachments: attachments.map(att => att.id),
      };

      let response;
      if (editingNotification) {
        response = await notificationAPI.updateNotification(editingNotification.id, submitData);
      } else {
        response = await notificationAPI.createNotification(submitData);
      }

      onSuccess && onSuccess(response.data);
    } catch (err) {
      setError('保存失败：' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const selectedPriority = priorityOptions.find(opt => opt.value === formData.priority);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingNotification ? '编辑通知' : '发布新通知'}
          </CardTitle>
          <CardDescription>
            {editingNotification ? '修改通知内容和设置' : '创建并发布新的通知消息'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 标题 */}
            <div className="space-y-2">
              <Label htmlFor="title">通知标题 *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="请输入通知标题"
                required
                disabled={loading}
              />
            </div>

            {/* 优先级 */}
            <div className="space-y-2">
              <Label>优先级</Label>
              <Select value={formData.priority} onValueChange={handlePriorityChange}>
                <SelectTrigger>
                  <SelectValue>
                    {selectedPriority && (
                      <Badge className={selectedPriority.color}>
                        {selectedPriority.label}
                      </Badge>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <Badge className={option.color}>
                        {option.label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 内容 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">通知内容 * (支持Markdown格式)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      编辑
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      预览
                    </>
                  )}
                </Button>
              </div>
              
              {showPreview ? (
                <Card className="p-4 min-h-[200px]">
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <ReactMarkdown>{formData.content || '暂无内容'}</ReactMarkdown>
                  </div>
                </Card>
              ) : (
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="请输入通知内容，支持Markdown格式..."
                  rows={10}
                  required
                  disabled={loading}
                />
              )}
            </div>

            {/* 文件上传 */}
            <div className="space-y-2">
              <Label>附件</Label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                        点击上传文件或拖拽文件到此处
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        支持图片、视频、音频、文档等格式，单个文件最大50MB
                      </span>
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      disabled={uploading || loading}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* 上传进度 */}
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  正在上传文件...
                </div>
              )}

              {/* 附件列表 */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <Label>已上传的附件 ({attachments.length})</Label>
                  <div className="grid gap-2">
                    {attachments.map((attachment) => {
                      const FileIcon = getFileIcon(attachment.mime_type);
                      return (
                        <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileIcon className="h-6 w-6 text-blue-500" />
                            <div>
                              <p className="font-medium text-sm">{attachment.original_filename}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(attachment.file_size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveAttachment(attachment.id, !!editingNotification)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 发布设置 */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_published"
                name="is_published"
                checked={formData.is_published}
                onChange={handleInputChange}
                disabled={loading}
                className="rounded"
              />
              <Label htmlFor="is_published">立即发布</Label>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading || uploading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {editingNotification ? '更新通知' : '发布通知'}
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotificationForm;

