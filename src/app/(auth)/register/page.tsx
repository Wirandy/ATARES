'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import styles from './Register.module.css';

export default function RegisterPage() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    // ✅ FIX 1: Tambah phoneNumber di state
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        phoneNumber: '',  // ✅ TAMBAH INI
        password: '' 
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.register(formData);  // ✅ formData udah include phoneNumber
            await authService.setTokenCookie(response.token);
            login(response.user);

            // Arahkan ke Dashboard
            router.push('/dashboard');
            // CATATAN: Karena ini sukses, setLoading(false) tidak dipanggil

        } catch (err: any) {
            // HANYA dipanggil jika Register GAGAL
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
            setLoading(false); // <-- RESET LOADING HANYA DI SINI
        } 
    };

    return (
        <div className={styles.container}>
            <div className={`glass-panel ${styles.card}`}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Create Account</h1>
                    <p className={styles.subtitle}>Join ATARES for advanced skin analysis</p>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        label="Full Name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    
                    {/* ✅ FIX 2: Input Phone Number */}
                    <Input
                        label="Phone Number"
                        type="tel"  // ✅ BENAR
                        placeholder="+628xxxxxxxxxx"
                        value={formData.phoneNumber}  // ✅ BENAR
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}  // ✅ BENAR
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="Create a password"
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
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className={styles.footer}>
                    Already have an account?
                    <Link href="/login" className={styles.link}>Sign in</Link>
                </div>
            </div>
        </div>
    );
}