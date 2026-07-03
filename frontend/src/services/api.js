import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('biblioteca_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('biblioteca_token');
      localStorage.removeItem('biblioteca_user');
      window.location.href = '/login';
    }

    const message = error.response?.data?.message || error.message || 'Erro na requisição';
    const errorWithMessage = new Error(message);
    errorWithMessage.status = error.response?.status;
    errorWithMessage.data = error.response?.data;
    
    return Promise.reject(errorWithMessage);
  }
);

export default api;