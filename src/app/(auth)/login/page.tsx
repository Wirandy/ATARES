'use client';

import { useState, useEffect } from 'react'; 
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'; 
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import styles from './Login.module.css';
import { LoginResponse } from '@/types/auth'; // <--- Import tipe LoginResponse

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams(); 
    const login = useAuthStore((state) => state.login);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Dapatkan path redirect dari URL, default ke /dashboard
    const redirectPath = searchParams.get('redirect') || '/dashboard';

    useEffect(() => {
        // Cek apakah user sudah login di client-side state
        if (useAuthStore.getState().user) {
            router.replace(redirectPath);
        }
    }, [router, redirectPath]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Kita tentukan tipe response sebagai LoginResponse agar TypeScript senang
            const response: LoginResponse = await authService.login(formData); 
            
            // Simpan user ke authStore
            // PERHATIKAN: Jika authStore masih error tipe data, kita perbaiki di langkah selanjutnya
            login(response.user);
            
            // 1. Ambil redirect path dari response API, jika tidak ada, pakai path dari URL.
            const finalRedirect = response.redirectTo || redirectPath; 

            // 2. Navigasi
            router.replace(finalRedirect);

        } catch (err: any) {
            // Tangani error dengan aman
            const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
            setError(errorMessage);
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Ripple Elements */}
            <div className={`${styles.rippleBase} ${styles.centerRipple}`}></div>
            <div className={`${styles.rippleBase} ${styles.cornerRipple1}`}></div>
            <div className={`${styles.rippleBase} ${styles.cornerRipple2}`}></div>

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