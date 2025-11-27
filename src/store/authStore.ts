// File: src/store/authStore.ts

import { create } from 'zustand';
import { User } from '@/types/auth';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    // FUNGSI LOGIN BARU: Hanya simpan User object
    login: (user) => {
        // Hapus: localStorage.setItem('token', token);
        set({ user, isAuthenticated: true });
    },

    // FUNGSI LOGOUT BARU: Menghapus data user dari store
    logout: () => {
        // Hapus: localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
        // NOTE: Penghapusan cookie JWT akan dilakukan oleh authService.logoutApi()
    },
}));