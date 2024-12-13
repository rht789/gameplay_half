// src/services/api.js

import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the full error for debugging
    console.error('API Error:', {
      config: error.config,
      response: error.response,
      message: error.message
    });

    if (!error.response) {
      toast.error('Network error - Please check your connection');
      return Promise.reject(error);
    }

    // Handle specific error cases
    switch (error.response.status) {
      case 401:
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        break;
      case 403:
        toast.error('Access denied');
        break;
      case 404:
        toast.error('Resource not found');
        break;
      default:
        toast.error(error.response?.data?.message || 'An error occurred');
    }

    return Promise.reject(error);
  }
);

// Add Google auth method
api.googleAuth = async (credential) => {
  try {
    const response = await api.post('/auth/google', { credential });
    return response.data;
  } catch (error) {
    console.error('Google auth error:', error);
    throw error;
  }
};

export default api;
