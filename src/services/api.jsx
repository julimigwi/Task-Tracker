import axios from 'axios';

// Environment-based configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/v1';
const NOTIFY_SERVER_URL = process.env.REACT_APP_NOTIFY_URL || 'http://localhost:7000';

// Create main API instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Default timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for auth tokens and common headers
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add request ID for tracking
  config.headers['X-Request-ID'] = crypto.randomUUID();
  
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  response => {
    // You can transform response data here if needed
    return response.data;
  },
  error => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: 'Network error - please check your connection',
        isNetworkError: true,
        original: error
      });
    }

    // Handle specific status codes
    switch (error.response.status) {
      case 401:
        // Trigger logout or token refresh
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

// Retry utility for failed requests
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

// Auth API endpoints
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (updates) => api.patch('/auth/profile', updates)
};

// Task API endpoints
export const taskApi = {
  getAll: (userId, params = {}) => api.get(`/tasks?userId=${userId}`, { params }),
  getById: (taskId) => api.get(`/tasks/${taskId}`),
  create: (taskData) => api.post('/tasks', taskData),
  delete: (taskId) => api.delete(`/tasks/${taskId}`),
  update: (taskId, updates) => api.patch(`/tasks/${taskId}`, updates),
  updateStatus: (taskId, status) => api.patch(`/tasks/${taskId}/status`, { status }),
  search: (userId, query) => api.get(`/tasks/search?userId=${userId}&q=${query}`),
  bulkUpdate: (taskIds, updates) => api.patch('/tasks/bulk-update', { taskIds, updates })
};

// Notification API endpoints
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

// File upload helper (separate instance for uploads)
export const uploadApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Longer timeout for uploads
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

// Health check endpoint
export const checkApiHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 2000 });
    return response.status === 200;
  } catch {
    return false;
  }
};

// Export base API instance for custom requests
export default api;