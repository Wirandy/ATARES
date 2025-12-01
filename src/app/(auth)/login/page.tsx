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
            const response = await authService.login(formData);
            login(response.user);

            router.replace('/dashboard');

        } catch (err: any) {
            // HANYA dipanggil jika Login GAGAL
            setError(err.response?.data?.message || 'Login failed. Please try again.');
            setLoading(false); // <-- RESET LOADING HANYA DI SINI
        }
        // JANGAN ADA BLOK FINALLY DI SINI
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