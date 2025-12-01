// src/services/authService.ts

import api from './api';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', credentials);
    return response.data;
  },

  logout: () => {
    console.log('Logged out');
  }
};