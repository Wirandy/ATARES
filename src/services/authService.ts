// src/services/authService.ts

import api from './api';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);  // TAMBAH /api/
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', credentials);  // TAMBAH /api/
    return response.data;
  },

  logout: () => {
    // Clear Zustand & redirect (cookie auto-expire)
    console.log('Logged out');
  }
};