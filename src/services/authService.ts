// File: src/services/authService.ts

import api from './api';
import { LoginCredentials, LoginResponse, RegisterCredentials, User } from '@/types/auth';
import axios, { AxiosError } from 'axios';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const authService = {
  register: async (credentials: RegisterCredentials) => {
    const response = await api.post('/api/auth/register', credentials);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          throw axiosError;
        }
      }
      throw error;
    }
  },

  logout: async () => {
    await api.post('/api/auth/logout');
  },
};