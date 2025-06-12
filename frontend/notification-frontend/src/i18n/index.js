import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 语言资源
const resources = {
  'zh-CN': {
    translation: {
      // 通用
      'common.loading': '加载中...',
      'common.error': '错误',
      'common.success': '成功',
      'common.confirm': '确认',
      'common.cancel': '取消',
      'common.save': '保存',
      'common.delete': '删除',
      'common.edit': '编辑',
      'common.create': '创建',
      'common.search': '搜索',
      'common.filter': '筛选',
      'common.all': '全部',
      'common.back': '返回',
      'common.next': '下一页',
      'common.prev': '上一页',
      'common.page': '第 {{current}} 页，共 {{total}} 页',
      
      // 应用标题
      'app.title': '通知管理系统',
      'app.subtitle': '局域网通知发布平台',
      'app.footer': '通知管理系统 - 支持Markdown格式、文件附件、多优先级管理',
      
      // 登录
      'login.title': '通知管理系统',
      'login.subtitle': '请登录以访问通知管理功能',
      'login.username': '用户名',
      'login.password': '密码',
      'login.usernameRequired': '请输入用户名',
      'login.passwordRequired': '请输入密码',
      'login.submit': '登录',
      'login.loggingIn': '登录中...',
      'login.defaultAccount': '默认管理员账号：admin / admin123',
      
      // 导航
      'nav.notifications': '通知列表',
      'nav.createNotification': '发布通知',
      'nav.admin': '管理员',
      'nav.logout': '登出',
      'nav.darkMode': '深色模式',
      'nav.lightMode': '浅色模式',
      'nav.language': '语言',
      
      // 通知列表
      'notifications.title': '通知列表',
      'notifications.search': '搜索通知标题或内容...',
      'notifications.noNotifications': '暂无通知',
      'notifications.priority.low': '低',
      'notifications.priority.medium': '中',
      'notifications.priority.high': '高',
      'notifications.priority.urgent': '紧急',
      'notifications.priority.lowPriority': '低优先级',
      'notifications.priority.mediumPriority': '中优先级',
      'notifications.priority.highPriority': '高优先级',
      'notifications.priority.urgentPriority': '紧急',
      'notifications.author': '发布者',
      'notifications.publishTime': '发布时间',
      'notifications.updateTime': '更新时间',
      'notifications.attachments': '{{count}} 个附件',
      
      // 通知详情
      'notification.backToList': '返回列表',
      'notification.author': '发布者：{{author}}',
      'notification.publishTime': '发布时间：{{time}}',
      'notification.updateTime': '更新时间：{{time}}',
      'notification.attachments': '附件 ({{count}})',
      'notification.download': '下载',
      'notification.notFound': '通知不存在',
      'notification.loadError': '获取通知详情失败',
      
      // 创建/编辑通知
      'createNotification.title': '发布新通知',
      'createNotification.subtitle': '创建并发布新的通知消息',
      'editNotification.title': '编辑通知',
      'editNotification.subtitle': '修改通知内容和设置',
      'notificationForm.title': '通知标题',
      'notificationForm.titleRequired': '请输入通知标题',
      'notificationForm.priority': '优先级',
      'notificationForm.content': '通知内容',
      'notificationForm.contentRequired': '请输入通知内容',
      'notificationForm.contentSupport': '支持Markdown格式',
      'notificationForm.preview': '预览',
      'notificationForm.edit': '编辑',
      'notificationForm.attachments': '附件',
      'notificationForm.uploadText': '点击上传文件或拖拽文件到此处',
      'notificationForm.uploadSupport': '支持图片、视频、音频、文档等格式，单个文件最大50MB',
      'notificationForm.uploading': '正在上传文件...',
      'notificationForm.uploadedFiles': '已上传的附件 ({{count}})',
      'notificationForm.publish': '立即发布',
      'notificationForm.publishNotification': '发布通知',
      'notificationForm.updateNotification': '更新通知',
      'notificationForm.saving': '保存中...',
      'notificationForm.noContent': '暂无内容',
      
      // 错误消息
      'error.loginFailed': '登录失败',
      'error.invalidCredentials': '用户名或密码错误',
      'error.networkError': '网络错误',
      'error.serverError': '服务器错误',
      'error.uploadFailed': '文件上传失败',
      'error.deleteFailed': '删除失败',
      'error.saveFailed': '保存失败',
      'error.loadFailed': '加载失败',
    }
  },
  'zh-TW': {
    translation: {
      // 通用
      'common.loading': '載入中...',
      'common.error': '錯誤',
      'common.success': '成功',
      'common.confirm': '確認',
      'common.cancel': '取消',
      'common.save': '儲存',
      'common.delete': '刪除',
      'common.edit': '編輯',
      'common.create': '建立',
      'common.search': '搜尋',
      'common.filter': '篩選',
      'common.all': '全部',
      'common.back': '返回',
      'common.next': '下一頁',
      'common.prev': '上一頁',
      'common.page': '第 {{current}} 頁，共 {{total}} 頁',
      
      // 應用標題
      'app.title': '通知管理系統',
      'app.subtitle': '區域網路通知發布平台',
      'app.footer': '通知管理系統 - 支援Markdown格式、檔案附件、多優先級管理',
      
      // 登入
      'login.title': '通知管理系統',
      'login.subtitle': '請登入以存取通知管理功能',
      'login.username': '使用者名稱',
      'login.password': '密碼',
      'login.usernameRequired': '請輸入使用者名稱',
      'login.passwordRequired': '請輸入密碼',
      'login.submit': '登入',
      'login.loggingIn': '登入中...',
      'login.defaultAccount': '預設管理員帳號：admin / admin123',
      
      // 導航
      'nav.notifications': '通知清單',
      'nav.createNotification': '發布通知',
      'nav.admin': '管理員',
      'nav.logout': '登出',
      'nav.darkMode': '深色模式',
      'nav.lightMode': '淺色模式',
      'nav.language': '語言',
      
      // 通知清單
      'notifications.title': '通知清單',
      'notifications.search': '搜尋通知標題或內容...',
      'notifications.noNotifications': '暫無通知',
      'notifications.priority.low': '低',
      'notifications.priority.medium': '中',
      'notifications.priority.high': '高',
      'notifications.priority.urgent': '緊急',
      'notifications.priority.lowPriority': '低優先級',
      'notifications.priority.mediumPriority': '中優先級',
      'notifications.priority.highPriority': '高優先級',
      'notifications.priority.urgentPriority': '緊急',
      'notifications.author': '發布者',
      'notifications.publishTime': '發布時間',
      'notifications.updateTime': '更新時間',
      'notifications.attachments': '{{count}} 個附件',
      
      // 通知詳情
      'notification.backToList': '返回清單',
      'notification.author': '發布者：{{author}}',
      'notification.publishTime': '發布時間：{{time}}',
      'notification.updateTime': '更新時間：{{time}}',
      'notification.attachments': '附件 ({{count}})',
      'notification.download': '下載',
      'notification.notFound': '通知不存在',
      'notification.loadError': '獲取通知詳情失敗',
      
      // 建立/編輯通知
      'createNotification.title': '發布新通知',
      'createNotification.subtitle': '建立並發布新的通知訊息',
      'editNotification.title': '編輯通知',
      'editNotification.subtitle': '修改通知內容和設定',
      'notificationForm.title': '通知標題',
      'notificationForm.titleRequired': '請輸入通知標題',
      'notificationForm.priority': '優先級',
      'notificationForm.content': '通知內容',
      'notificationForm.contentRequired': '請輸入通知內容',
      'notificationForm.contentSupport': '支援Markdown格式',
      'notificationForm.preview': '預覽',
      'notificationForm.edit': '編輯',
      'notificationForm.attachments': '附件',
      'notificationForm.uploadText': '點擊上傳檔案或拖拽檔案到此處',
      'notificationForm.uploadSupport': '支援圖片、影片、音訊、文件等格式，單個檔案最大50MB',
      'notificationForm.uploading': '正在上傳檔案...',
      'notificationForm.uploadedFiles': '已上傳的附件 ({{count}})',
      'notificationForm.publish': '立即發布',
      'notificationForm.publishNotification': '發布通知',
      'notificationForm.updateNotification': '更新通知',
      'notificationForm.saving': '儲存中...',
      'notificationForm.noContent': '暫無內容',
      
      // 錯誤訊息
      'error.loginFailed': '登入失敗',
      'error.invalidCredentials': '使用者名稱或密碼錯誤',
      'error.networkError': '網路錯誤',
      'error.serverError': '伺服器錯誤',
      'error.uploadFailed': '檔案上傳失敗',
      'error.deleteFailed': '刪除失敗',
      'error.saveFailed': '儲存失敗',
      'error.loadFailed': '載入失敗',
    }
  },
  'en': {
    translation: {
      // Common
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.confirm': 'Confirm',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.create': 'Create',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.all': 'All',
      'common.back': 'Back',
      'common.next': 'Next',
      'common.prev': 'Previous',
      'common.page': 'Page {{current}} of {{total}}',
      
      // App Title
      'app.title': 'Notification Management System',
      'app.subtitle': 'LAN Notification Publishing Platform',
      'app.footer': 'Notification Management System - Supports Markdown format, file attachments, multi-priority management',
      
      // Login
      'login.title': 'Notification Management System',
      'login.subtitle': 'Please login to access notification management features',
      'login.username': 'Username',
      'login.password': 'Password',
      'login.usernameRequired': 'Please enter username',
      'login.passwordRequired': 'Please enter password',
      'login.submit': 'Login',
      'login.loggingIn': 'Logging in...',
      'login.defaultAccount': 'Default admin account: admin / admin123',
      
      // Navigation
      'nav.notifications': 'Notifications',
      'nav.createNotification': 'Create Notification',
      'nav.admin': 'Admin',
      'nav.logout': 'Logout',
      'nav.darkMode': 'Dark Mode',
      'nav.lightMode': 'Light Mode',
      'nav.language': 'Language',
      
      // Notification List
      'notifications.title': 'Notifications',
      'notifications.search': 'Search notification title or content...',
      'notifications.noNotifications': 'No notifications',
      'notifications.priority.low': 'Low',
      'notifications.priority.medium': 'Medium',
      'notifications.priority.high': 'High',
      'notifications.priority.urgent': 'Urgent',
      'notifications.priority.lowPriority': 'Low Priority',
      'notifications.priority.mediumPriority': 'Medium Priority',
      'notifications.priority.highPriority': 'High Priority',
      'notifications.priority.urgentPriority': 'Urgent',
      'notifications.author': 'Author',
      'notifications.publishTime': 'Published',
      'notifications.updateTime': 'Updated',
      'notifications.attachments': '{{count}} attachments',
      
      // Notification Detail
      'notification.backToList': 'Back to List',
      'notification.author': 'Author: {{author}}',
      'notification.publishTime': 'Published: {{time}}',
      'notification.updateTime': 'Updated: {{time}}',
      'notification.attachments': 'Attachments ({{count}})',
      'notification.download': 'Download',
      'notification.notFound': 'Notification not found',
      'notification.loadError': 'Failed to load notification details',
      
      // Create/Edit Notification
      'createNotification.title': 'Create New Notification',
      'createNotification.subtitle': 'Create and publish a new notification message',
      'editNotification.title': 'Edit Notification',
      'editNotification.subtitle': 'Modify notification content and settings',
      'notificationForm.title': 'Notification Title',
      'notificationForm.titleRequired': 'Please enter notification title',
      'notificationForm.priority': 'Priority',
      'notificationForm.content': 'Notification Content',
      'notificationForm.contentRequired': 'Please enter notification content',
      'notificationForm.contentSupport': 'Supports Markdown format',
      'notificationForm.preview': 'Preview',
      'notificationForm.edit': 'Edit',
      'notificationForm.attachments': 'Attachments',
      'notificationForm.uploadText': 'Click to upload files or drag files here',
      'notificationForm.uploadSupport': 'Supports images, videos, audio, documents, etc. Max file size: 50MB',
      'notificationForm.uploading': 'Uploading files...',
      'notificationForm.uploadedFiles': 'Uploaded attachments ({{count}})',
      'notificationForm.publish': 'Publish immediately',
      'notificationForm.publishNotification': 'Publish Notification',
      'notificationForm.updateNotification': 'Update Notification',
      'notificationForm.saving': 'Saving...',
      'notificationForm.noContent': 'No content',
      
      // Error Messages
      'error.loginFailed': 'Login failed',
      'error.invalidCredentials': 'Invalid username or password',
      'error.networkError': 'Network error',
      'error.serverError': 'Server error',
      'error.uploadFailed': 'File upload failed',
      'error.deleteFailed': 'Delete failed',
      'error.saveFailed': 'Save failed',
      'error.loadFailed': 'Load failed',
    }
  },
  'ja': {
    translation: {
      // 共通
      'common.loading': '読み込み中...',
      'common.error': 'エラー',
      'common.success': '成功',
      'common.confirm': '確認',
      'common.cancel': 'キャンセル',
      'common.save': '保存',
      'common.delete': '削除',
      'common.edit': '編集',
      'common.create': '作成',
      'common.search': '検索',
      'common.filter': 'フィルター',
      'common.all': 'すべて',
      'common.back': '戻る',
      'common.next': '次へ',
      'common.prev': '前へ',
      'common.page': '{{current}} / {{total}} ページ',
      
      // アプリタイトル
      'app.title': '通知管理システム',
      'app.subtitle': 'LAN通知配信プラットフォーム',
      'app.footer': '通知管理システム - Markdown形式、ファイル添付、多優先度管理をサポート',
      
      // ログイン
      'login.title': '通知管理システム',
      'login.subtitle': '通知管理機能にアクセスするにはログインしてください',
      'login.username': 'ユーザー名',
      'login.password': 'パスワード',
      'login.usernameRequired': 'ユーザー名を入力してください',
      'login.passwordRequired': 'パスワードを入力してください',
      'login.submit': 'ログイン',
      'login.loggingIn': 'ログイン中...',
      'login.defaultAccount': 'デフォルト管理者アカウント：admin / admin123',
      
      // ナビゲーション
      'nav.notifications': '通知一覧',
      'nav.createNotification': '通知作成',
      'nav.admin': '管理者',
      'nav.logout': 'ログアウト',
      'nav.darkMode': 'ダークモード',
      'nav.lightMode': 'ライトモード',
      'nav.language': '言語',
      
      // 通知一覧
      'notifications.title': '通知一覧',
      'notifications.search': '通知タイトルまたは内容を検索...',
      'notifications.noNotifications': '通知がありません',
      'notifications.priority.low': '低',
      'notifications.priority.medium': '中',
      'notifications.priority.high': '高',
      'notifications.priority.urgent': '緊急',
      'notifications.priority.lowPriority': '低優先度',
      'notifications.priority.mediumPriority': '中優先度',
      'notifications.priority.highPriority': '高優先度',
      'notifications.priority.urgentPriority': '緊急',
      'notifications.author': '作成者',
      'notifications.publishTime': '公開日時',
      'notifications.updateTime': '更新日時',
      'notifications.attachments': '{{count}} 個の添付ファイル',
      
      // 通知詳細
      'notification.backToList': '一覧に戻る',
      'notification.author': '作成者：{{author}}',
      'notification.publishTime': '公開日時：{{time}}',
      'notification.updateTime': '更新日時：{{time}}',
      'notification.attachments': '添付ファイル ({{count}})',
      'notification.download': 'ダウンロード',
      'notification.notFound': '通知が見つかりません',
      'notification.loadError': '通知詳細の取得に失敗しました',
      
      // 通知作成/編集
      'createNotification.title': '新しい通知を作成',
      'createNotification.subtitle': '新しい通知メッセージを作成して公開',
      'editNotification.title': '通知を編集',
      'editNotification.subtitle': '通知内容と設定を変更',
      'notificationForm.title': '通知タイトル',
      'notificationForm.titleRequired': '通知タイトルを入力してください',
      'notificationForm.priority': '優先度',
      'notificationForm.content': '通知内容',
      'notificationForm.contentRequired': '通知内容を入力してください',
      'notificationForm.contentSupport': 'Markdown形式をサポート',
      'notificationForm.preview': 'プレビュー',
      'notificationForm.edit': '編集',
      'notificationForm.attachments': '添付ファイル',
      'notificationForm.uploadText': 'ファイルをクリックしてアップロードするか、ここにドラッグ',
      'notificationForm.uploadSupport': '画像、動画、音声、文書などの形式をサポート。最大ファイルサイズ：50MB',
      'notificationForm.uploading': 'ファイルをアップロード中...',
      'notificationForm.uploadedFiles': 'アップロード済み添付ファイル ({{count}})',
      'notificationForm.publish': 'すぐに公開',
      'notificationForm.publishNotification': '通知を公開',
      'notificationForm.updateNotification': '通知を更新',
      'notificationForm.saving': '保存中...',
      'notificationForm.noContent': 'コンテンツがありません',
      
      // エラーメッセージ
      'error.loginFailed': 'ログインに失敗しました',
      'error.invalidCredentials': 'ユーザー名またはパスワードが正しくありません',
      'error.networkError': 'ネットワークエラー',
      'error.serverError': 'サーバーエラー',
      'error.uploadFailed': 'ファイルのアップロードに失敗しました',
      'error.deleteFailed': '削除に失敗しました',
      'error.saveFailed': '保存に失敗しました',
      'error.loadFailed': '読み込みに失敗しました',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh-CN', // 默认语言
    fallbackLng: 'zh-CN',
    
    interpolation: {
      escapeValue: false, // React已经默认转义
    },
    
    // 调试模式
    debug: false,
  });

export default i18n;

