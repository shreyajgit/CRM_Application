import axios from 'axios';

// Create a base axios instance with defaults
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear local storage and refresh page
      localStorage.removeItem('token');
      
      // Only redirect if not already on the home page
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

// Order API functions
export const getOrders = () => axios.get('/api/orders');
export const getOrder = (id) => axios.get(`/api/orders/${id}`);
export const createOrder = (orderData) => axios.post('/api/orders', orderData);
export const updateOrder = (id, orderData) => axios.put(`/api/orders/${id}`, orderData);
export const deleteOrder = (id) => axios.delete(`/api/orders/${id}`);

// Communication Log API functions
export const getCommunicationLogs = () => axios.get('/api/communication-logs');
export const getCommunicationLog = (id) => axios.get(`/api/communication-logs/${id}`);
export const createCommunicationLog = (logData) => axios.post('/api/communication-logs', logData);
export const updateCommunicationLog = (id, logData) => axios.put(`/api/communication-logs/${id}`, logData);
export const deleteCommunicationLog = (id) => axios.delete(`/api/communication-logs/${id}`);
export const getLogsByCampaign = (campaignId) => axios.get(`/api/communication-logs/campaign/${campaignId}`);
export const getLogsByCustomer = (customerId) => axios.get(`/api/communication-logs/customer/${customerId}`);
export const getCommunicationAnalytics = () => axios.get('/api/communication-logs/analytics');

export default api;