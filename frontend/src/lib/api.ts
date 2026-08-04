import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://roommate-matching-u6i7.onrender.com/api/v1' : 'http://localhost:5000/api/v1'),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('stayzen_v2_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('stayzen_v2_user');
      localStorage.removeItem('stayzen_v2_token');
      // If we are not already on the login page, redirect
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
