'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import styles from './Profile.module.css';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import router from 'next/router';

export default function ProfilePage() {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    // Dummy data if user is not logged in (for preview)
    const initialUser = user ? { ...user, role: 'Member', phoneNumber: '-' } : {
        name: "Guest User",
        email: "guest@example.com",
        phoneNumber: "-",
        role: "Guest"
    };

    const [formData, setFormData] = useState({
        name: initialUser.name,
        phoneNumber: initialUser.phoneNumber || '-'
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                phoneNumber: (user as any).phoneNumber || '-'
            });
        }
    }, [user]);

    const handleLogout = async () => {
        await authService.logoutApi();
        logout();
        router.push('/login');
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: initialUser.name,
            phoneNumber: initialUser.phoneNumber || '-'
        });
    };

    const handleSave = () => {
        console.log("Saving profile:", formData);
        setIsEditing(false);
        alert("Profile updated! (Simulation)");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
            {/* Ripple animations */}
            <div className={`${styles.rippleBase} ${styles.centerRipple}`} style={{ animationDelay: '0s' }}></div>
            <div className={`${styles.rippleBase} ${styles.centerRipple}`} style={{ animationDelay: '1.3s' }}></div>
            <div className={`${styles.rippleBase} ${styles.centerRipple}`} style={{ animationDelay: '2.6s' }}></div>

            <div className={`${styles.rippleBase} ${styles.cornerRipple1}`} style={{ animationDelay: '0.5s' }}></div>
            <div className={`${styles.rippleBase} ${styles.cornerRipple1}`} style={{ animationDelay: '3s' }}></div>

            <div className={`${styles.rippleBase} ${styles.cornerRipple2}`} style={{ animationDelay: '1s' }}></div>
            <div className={`${styles.rippleBase} ${styles.cornerRipple2}`} style={{ animationDelay: '4s' }}></div>

            <div className={styles.profileCard}>
                <div className={styles.header}>
                    <div className={styles.avatarContainer}>
                        {getInitials(formData.name)}
                    </div>
                    {isEditing ? (
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={styles.nameInput}
                            style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'white',
                                borderRadius: '8px',
                                padding: '4px 8px',
                                width: '100%'
                            }}
                        />
                    ) : (
                        <h1 className={styles.name}>{formData.name}</h1>
                    )}
                    <span className={styles.role}>{initialUser.role}</span>
                </div>

                <div className={styles.infoSection}>
                    <div className={styles.infoGroup}>
                        <label className={styles.label}>Email Address</label>
                        <div className={styles.value} style={{ opacity: 0.7 }}>{initialUser.email} (Cannot be changed)</div>
                    </div>
                    <div className={styles.infoGroup}>
                        <label className={styles.label}>Phone Number</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className={styles.input}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: 'white',
                                    borderRadius: '6px',
                                    padding: '4px 8px',
                                    width: '100%',
                                    marginTop: '4px'
                                }}
                            />
                        ) : (
                            <div className={styles.value}>{formData.phoneNumber}</div>
                        )}
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
                    {isEditing ? (
                        <>
                            <button className={styles.editBtn} onClick={handleSave} style={{ backgroundColor: '#4ade80', color: '#000' }}>Save Changes</button>
                            <button className={styles.logoutBtn} onClick={handleCancel} style={{ backgroundColor: '#f87171' }}>Cancel</button>
                        </>
                    ) : (
                        <>
                            <button className={styles.editBtn} onClick={handleEdit}>Edit Profile</button>
                            <button className={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
