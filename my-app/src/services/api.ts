import axios from 'axios';
import { loadingStore } from './loadingStore';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  loadingStore.start();
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers.delete('Content-Type');
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    loadingStore.stop();
    return response;
  },
  (error) => {
    loadingStore.stop();
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.setItem('authExpired', 'true');
    }
    return Promise.reject(error);
  }
);

export default api;
