import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import NotificationList from './components/NotificationList';
import NotificationDetail from './components/NotificationDetail';
import AdminNotificationForm from './components/AdminNotificationForm';
import LanguageSelector from './components/LanguageSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bell, Plus, Settings, LogOut, Moon, Sun, User, Shield } from 'lucide-react';
import './i18n';
import './App.css';

// 主应用内容组件
const AppContent = () => {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState('list'); // 'list', 'detail', 'create', 'edit'
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [editingNotification, setEditingNotification] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    // 从本地存储读取深色模式偏好
    const saved = localStorage.getItem('dark-mode');
    return saved ? JSON.parse(saved) : false;
  });

  // 初始化深色模式
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // 切换深色模式
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('dark-mode', JSON.stringify(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 处理登录成功
  const handleLoginSuccess = (userData) => {
    setCurrentView('list');
  };

  // 处理通知点击
  const handleNotificationClick = (notification) => {
    setSelectedNotificationId(notification.id);
    setCurrentView('detail');
  };

  // 处理返回列表
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedNotificationId(null);
    setEditingNotification(null);
  };

  // 处理创建通知
  const handleCreateNotification = () => {
    setEditingNotification(null);
    setCurrentView('create');
  };

  // 处理编辑通知
  const handleEditNotification = (notification) => {
    setEditingNotification(notification);
    setCurrentView('edit');
  };

  // 处理表单成功
  const handleFormSuccess = (notification) => {
    setCurrentView('list');
    setEditingNotification(null);
    // 可以在这里添加成功提示
  };

  // 处理登出
  const handleLogout = async () => {
    await logout();
    setCurrentView('list');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-700 dark:text-gray-300">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* 顶部导航栏 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 左侧 - Logo和标题 */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg transition-colors duration-200">
                <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                  {t('app.title')}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                  {t('app.subtitle')}
                </p>
              </div>
            </div>

            {/* 右侧 - 控制按钮和用户信息 */}
            <div className="flex items-center gap-3">
              {/* 语言选择器 */}
              <LanguageSelector />

              {/* 深色模式切换 */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDarkMode}
                className="transition-colors duration-200"
                title={darkMode ? t('nav.lightMode') : t('nav.darkMode')}
              >
                {darkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              {/* 管理员功能 */}
              {user?.is_admin && currentView === 'list' && (
                <Button
                  onClick={handleCreateNotification}
                  size="sm"
                  className="transition-colors duration-200"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('nav.createNotification')}
                </Button>
              )}

              {/* 用户信息 */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full transition-colors duration-200">
                  {user?.is_admin ? (
                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">
                    {user?.username}
                  </span>
                  {user?.is_admin && (
                    <Badge variant="secondary" className="text-xs">
                      {t('nav.admin')}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="transition-colors duration-200"
                  title={t('nav.logout')}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fadeIn">
          {currentView === 'list' && (
            <NotificationList onNotificationClick={handleNotificationClick} />
          )}
          
          {currentView === 'detail' && (
            <NotificationDetail
              notificationId={selectedNotificationId}
              onBack={handleBackToList}
            />
          )}
          
          {(currentView === 'create' || currentView === 'edit') && user?.is_admin && (
            <AdminNotificationForm
              editingNotification={editingNotification}
              onSuccess={handleFormSuccess}
              onCancel={handleBackToList}
            />
          )}
        </div>
      </main>

      {/* 底部信息 */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
            <p>{t('app.footer')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// 主应用组件
function App() {
  const { i18n } = useTranslation();

  // 初始化语言偏好
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

