'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import styles from './Login.module.css';

export default function LoginPage() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // --- KODE LAMA (MOCK) DIHAPUS, DIGANTI DENGAN KODE BARU ---
            
            // 1. Panggil API Login yang baru Anda buat
            const response = await authService.login(formData); //
            
            // 2. Jika sukses (status 200), simpan token dan user ke Zustand Store
            login(response.user); // menghapus response.token dari sini karena token diatur oleh HTTP-only cookie
            
            // 3. Arahkan ke Dashboard
            router.push('/dashboard'); 

        } catch (err: any) {
            // Tangani error dari backend (misalnya 401 Kredensial tidak valid)
            setError(err.response?.data?.message || 'Login failed. Please try again.');
            setLoading(false); 
        } 
        // Note: Bagian finally (jika ada) di file original harus tetap dipertahankan.
    };

    return (
        <div className={styles.container}>
            <div className={`glass-panel ${styles.card}`}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Welcome Back</h1>
                    <p className={styles.subtitle}>Sign in to continue your skin analysis</p>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        label="Email"
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%', marginTop: '0.5rem' }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className={styles.footer}>
                    Don't have an account?
                    <Link href="/register" className={styles.link}>Sign up</Link>
                </div>
            </div>
        </div>
    );
}
