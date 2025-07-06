import axios from 'axios';

// ✅ 1. Updated default base URL (no `/v1` for JSON Server)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const NOTIFY_SERVER_URL = process.env.REACT_APP_NOTIFY_URL || 'http://localhost:7000';

// Main Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add request ID
  config.headers['X-Request-ID'] = crypto.randomUUID();
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  response => response.data,
  error => {
    if (!error.response) {
      return Promise.reject({
        message: 'Network error - please check your connection',
        isNetworkError: true,
        original: error
      });
    }

    switch (error.response.status) {
      case 401:
        break;
      case 403:
        error.response.data.message = 'You are not authorized to perform this action';
        break;
      case 429:
        error.response.data.message = 'Too many requests - please slow down';
        break;
      case 500:
        error.response.data.message = 'Server error - please try again later';
        break;
    }

    return Promise.reject({
      message: error.response?.data?.message || 'Request failed',
      status: error.response?.status,
      data: error.response?.data,
      original: error
    });
  }
);

// Retry logic
const withRetry = async (fn, retries = 2, delay = 1000) => {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0 || err.status === 400 || err.status === 401) {
      throw err;
    }
    await new Promise(res => setTimeout(res, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
};

// ✅ Auth API (still mock)
export const authApi = {
  register: (userData) => api.post('/users', userData),
  login: (credentials) =>
    api.get(`/users?email=${credentials.email}&password=${credentials.password}`),
  logout: () => Promise.resolve(), // no-op for mock
  getProfile: () => Promise.resolve(), // mock
  updateProfile: (updates) => Promise.resolve(updates)
};

// ✅ Task API for JSON Server (corrected endpoints)
export const taskApi = {
  getAll: (userId, params = {}) =>
    api.get(`/tasks`, { params: { userId, ...params } }),

  getById: (userId, taskId) =>
    api.get(`/tasks/${taskId}`),

  create: (taskData) =>
    api.post('/tasks', taskData),

  update: (taskId, updates) =>
    api.patch(`/tasks/${taskId}`, updates),

  delete: (taskId) =>
    api.delete(`/tasks/${taskId}`),

  // ✅ Updated for JSON Server — direct PATCH to /tasks/:id
  updateStatus: (taskId, completed) =>
    api.patch(`/tasks/${taskId}`, { completed })
};

// ✅ Notification API (unchanged)
export const notifyApi = {
  sms: async (data) => withRetry(() =>
    axios.post(`${NOTIFY_SERVER_URL}/notify/sms`, data, { timeout: 3000 })
  ),
  email: async (data) => withRetry(() =>
    axios.post(`${NOTIFY_SERVER_URL}/notify/email`, data, { timeout: 5000 })
  ),
  push: async (data) => withRetry(() =>
    axios.post(`${NOTIFY_SERVER_URL}/notify/push`, data, { timeout: 5000 })
  )
};

// ✅ File Upload API (unchanged)
export const uploadApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

uploadApi.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fileApi = {
  upload: (file, progressCallback) => {
    const formData = new FormData();
    formData.append('file', file);

    return uploadApi.post('/files', formData, {
      onUploadProgress: progressEvent => {
        if (progressCallback) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          progressCallback(percentCompleted);
        }
      }
    });
  },
  delete: (fileId) => api.delete(`/files/${fileId}`)
};

// ✅ Health check
export const checkApiHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 2000 });
    return response.status === 200;
  } catch {
    return false;
  }
};

// Default export
export default api;
