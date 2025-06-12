import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 10000,
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  // 登录
  login: (credentials) => api.post('/auth/login', credentials),
  
  // 登出
  logout: () => api.post('/auth/logout'),
  
  // 获取当前用户信息
  getCurrentUser: () => api.get('/auth/me'),
  
  // 注册（管理员）
  register: (userData) => api.post('/auth/register', userData),
};

// 通知相关API
export const notificationAPI = {
  // 获取通知列表
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  
  // 获取单个通知
  getNotification: (id) => api.get(`/notifications/${id}`),
  
  // 创建通知（管理员）
  createNotification: (data) => api.post('/notifications', data),
  
  // 更新通知（管理员）
  updateNotification: (id, data) => api.put(`/notifications/${id}`, data),
  
  // 删除通知（管理员）
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  
  // 获取管理员通知列表
  getAdminNotifications: (params = {}) => api.get('/admin/notifications', { params }),
};

// 文件上传相关API
export const uploadAPI = {
  // 上传文件
  uploadFile: (formData) => api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // 删除附件
  deleteAttachment: (id) => api.delete(`/attachments/${id}`),
  
  // 获取通知附件
  getNotificationAttachments: (notificationId) => 
    api.get(`/notifications/${notificationId}/attachments`),
};

export default api;

