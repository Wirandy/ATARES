import { create } from 'zustand';
import { User } from '@/types/auth';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User) => void; // hapus parameter token
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    login: (user) => {
        set({ user, isAuthenticated: true }); // hapus localStorage.setItem('token', token); karena token diurus oleh HTTP-only cookie
    },
    logout: () => {
        fetch('/api/logout', { method: 'POST' }); // hapus token dari HTTP-only cookie -> Panggil API logout yang akan menghapus cookie di server
        set({ user: null, token: null, isAuthenticated: false });
    },
}));
