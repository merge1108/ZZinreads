import axios, { AxiosResponse } from 'axios';
import { ApiResponse, SyncResult, SystemHealth, SystemStatus } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response: AxiosResponse<ApiResponse<LoginResponse>> = await api.post('/auth/login', credentials);
    return response.data.data!;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },

  setToken: (token: string) => {
    localStorage.setItem('auth_token', token);
  },
};

export const syncApi = {
  manual: async (): Promise<SyncResult> => {
    const response: AxiosResponse<ApiResponse<SyncResult>> = await api.post('/sync/manual');
    return response.data.data!;
  },

  getHealth: async (): Promise<SystemHealth> => {
    const response: AxiosResponse<ApiResponse<SystemHealth>> = await api.get('/health');
    return response.data.data!;
  },

  getStatus: async (): Promise<SystemStatus> => {
    const response: AxiosResponse<ApiResponse<SystemStatus>> = await api.get('/status');
    return response.data.data!;
  },
};

export default api;