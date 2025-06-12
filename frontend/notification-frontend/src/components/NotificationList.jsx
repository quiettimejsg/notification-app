import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { notificationAPI } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, Filter, Calendar, User, Paperclip, AlertCircle, Info, AlertTriangle, Zap, FileText } from 'lucide-react';

const NotificationList = ({ onNotificationClick }) => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // 优先级配置
  const priorityConfig = {
    low: { 
      label: t('notifications.priority.lowPriority'), 
      shortLabel: t('notifications.priority.low'),
      color: 'priority-low',
      icon: Info 
    },
    medium: { 
      label: t('notifications.priority.mediumPriority'), 
      shortLabel: t('notifications.priority.medium'),
      color: 'priority-medium',
      icon: AlertCircle 
    },
    high: { 
      label: t('notifications.priority.highPriority'), 
      shortLabel: t('notifications.priority.high'),
      color: 'priority-high',
      icon: AlertTriangle 
    },
    urgent: { 
      label: t('notifications.priority.urgentPriority'), 
      shortLabel: t('notifications.priority.urgent'),
      color: 'priority-urgent',
      icon: Zap 
    },
  };

  // 获取通知列表
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications();
      setNotifications(response.data || []);
      setError('');
    } catch (err) {
      setError(t('error.loadFailed'));
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 过滤通知
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
    
    return matchesSearch && matchesPriority;
  });

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 截取内容预览
  const getContentPreview = (content, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 animate-pulse">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-700 dark:text-gray-300">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 页面标题 */}
      <div className="animate-slideDown">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('notifications.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('app.subtitle')}
        </p>
      </div>

      {/* 搜索和筛选 */}
      <Card className="animate-slideUp animate-delay-100">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('notifications.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 transition-all duration-200 focus:scale-105"
              />
            </div>

            {/* 优先级筛选 */}
            <div className="flex gap-2">
              <Button
                variant={priorityFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPriorityFilter('all')}
                className="transition-all duration-200 hover:scale-105"
              >
                <Filter className="mr-2 h-4 w-4" />
                {t('common.all')}
              </Button>
              {Object.entries(priorityConfig).map(([priority, config]) => (
                <Button
                  key={priority}
                  variant={priorityFilter === priority ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPriorityFilter(priority)}
                  className="transition-all duration-200 hover:scale-105"
                >
                  <config.icon className="mr-2 h-4 w-4" />
                  {config.shortLabel}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive" className="animate-shake">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 通知列表 */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card className="animate-slideUp animate-delay-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mb-4 animate-float" />
              <p className="text-xl text-gray-500 dark:text-gray-400 text-center">
                {t('notifications.noNotifications')}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification, index) => {
            const priorityInfo = priorityConfig[notification.priority] || priorityConfig.medium;
            const PriorityIcon = priorityInfo.icon;
            
            return (
              <Card 
                key={notification.id} 
                className={`cursor-pointer hover-lift list-item animate-slideUp`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => onNotificationClick(notification)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {notification.title}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{t('notifications.author')}: {notification.author_username}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{t('notifications.publishTime')}: {formatDate(notification.created_at)}</span>
                        </div>
                        {notification.attachments && notification.attachments.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Paperclip className="h-4 w-4" />
                            <span>{t('notifications.attachments', { count: notification.attachments.length })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className={`${priorityInfo.color} flex items-center gap-1 ml-4`}>
                      <PriorityIcon className="h-3 w-3" />
                      {priorityInfo.shortLabel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-gray-700 dark:text-gray-300 line-clamp-3">
                    {getContentPreview(notification.content)}
                  </CardDescription>
                  {notification.updated_at !== notification.created_at && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {t('notifications.updateTime')}: {formatDate(notification.updated_at)}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* 分页信息 */}
      {filteredNotifications.length > 0 && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 animate-fadeIn animate-delay-500">
          <p>{t('common.page', { current: 1, total: 1 })}</p>
        </div>
      )}
    </div>
  );
};

export default NotificationList;

