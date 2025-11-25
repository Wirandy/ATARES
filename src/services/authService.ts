import api from './api';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth';

const setTokenCookie = async (token: string) => { // Fungsi baru yang memanggil API /api/set-cookie (Langkah 2 Fase 4)
    await api.post('/set-cookie', { token }); // API akan menyimpan token ke HTTP-only cookie
};

const logoutApi = async () => { // Fungsi baru yang memanggil API /api/auth/logout (Langkah 3 Fase 4)
    await api.post('/auth/logout'); // API akan menghapus cookie token
};

export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', credentials);
        return response.data;
    },

    setTokenCookie,  
    logoutApi,

    // Ganti fungsi logout lama dengan peringatan/deprecate
    logout: () => { 
        console.warn('Fungsi logout lama tidak digunakan lagi. Gunakan logoutApi() dan useAuthStore().logout().');
    }
};
