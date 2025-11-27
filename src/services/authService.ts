// File: src/services/authService.ts

import api from './api';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth'; //

// [FUNGSI BARU]: Memanggil Route Handler /api/set-cookie
const setTokenCookie = async (token: string) => {
    // Route Handler yang Anda buat akan menyimpan token di HTTP-only cookie
    await api.post('/set-cookie', { token });
};

// [FUNGSI BARU]: Memanggil Route Handler /api/auth/logout
const logoutApi = async () => {
    // Route Handler yang Anda buat akan menghapus cookie JWT
    await api.post('/auth/logout');
};

export const authService = {
    // Fungsi login/register tetap sama
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', credentials);
        return response.data;
    },

    // [PERUBAHAN]: Ekspor fungsi-fungsi baru
    setTokenCookie,
    logoutApi,

    // Fungsi logout lama, biarkan saja
    logout: () => {
        console.warn('Fungsi logout lama sudah dideprecate.');
    }
};