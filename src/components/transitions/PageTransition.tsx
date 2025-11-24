'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './PageTransition.module.css';

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const [isAnimating, setIsAnimating] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Trigger animation on route change
        setIsAnimating(true);

        const timer = setTimeout(() => {
            setIsAnimating(false);
        }, 1500); // Match animation duration

        return () => clearTimeout(timer);
    }, [pathname]);

    return (
        <>
            {isAnimating && (
                <div className={styles.overlay}>
                    <div className={styles.ripple}></div>
                </div>
            )}
            {children}
        </>
    );
}
