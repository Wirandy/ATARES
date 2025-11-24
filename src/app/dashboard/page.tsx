'use client';

import { useAuthStore } from '@/store/authStore';
import styles from './Profile.module.css';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    // Dummy data if user is not logged in (for preview)
    const displayUser = user ? { ...user, role: 'Member' } : {
        name: "Guest User",
        email: "guest@example.com",
        role: "Guest"
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className={styles.container}>
            <div className={styles.profileCard}>
                <div className={styles.header}>
                    <div className={styles.avatarContainer}>
                        {getInitials(displayUser.name)}
                    </div>
                    <h1 className={styles.name}>{displayUser.name}</h1>
                    <span className={styles.role}>{displayUser.role}</span>
                </div>

                <div className={styles.infoSection}>
                    <div className={styles.infoGroup}>
                        <label className={styles.label}>Email Address</label>
                        <div className={styles.value}>{displayUser.email}</div>
                    </div>
                    <div className={styles.infoGroup}>
                        <label className={styles.label}>Phone Number</label>
                        <div className={styles.value}>-</div>
                    </div>
                    <div className={styles.infoGroup}>
                        <label className={styles.label}>Member Since</label>
                        <div className={styles.value}>November 2025</div>
                    </div>
                    <div className={styles.infoGroup}>
                        <label className={styles.label}>Skin Type</label>
                        <div className={styles.value}>Not set</div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.editBtn}>Edit Profile</button>
                    <button className={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
                </div>
            </div>
        </div>
    );
}
