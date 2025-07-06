import axios from 'axios';

// Environment-based configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/v1';
const NOTIFY_SERVER_URL = process.env.REACT_APP_NOTIFY_URL || 'http://localhost:7000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for auth tokens
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Enhanced error handling
api.interceptors.response.use(
  response => response.data, // Directly return data
  error => Promise.reject({
    message: error.response?.data?.message || 'Request failed',
    status: error.response?.status,
    data: error.response?.data,
    original: error
  })
);

// Task API
export const taskApi = {
  get: (userId) => api.get(`/tasks?userId=${userId}`),
  create: (taskData) => api.post('/tasks', taskData),
  delete: (taskId) => api.delete(`/tasks/${taskId}`),
  update: (taskId, updates) => api.patch(`/tasks/${taskId}`, updates)
};

// Notification API with retries
export const notifyApi = {
  sms: async ({ phoneNumber, message }) => {
    try {
      return await axios.post(`${NOTIFY_SERVER_URL}/notify`, {
        phoneNumber,
        message
      }, { timeout: 3000 });
    } catch (err) {
      console.error('SMS notification failed:', err);
      throw err;
    }
  }
};