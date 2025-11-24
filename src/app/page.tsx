'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  const [ripples, setRipples] = useState<{ x: number, y: number, id: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = { x, y, id: Date.now() };
    setRipples(prev => [...prev, newRipple]);
  };

  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples(prev => prev.slice(1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [ripples]);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero} onClick={handleClick}>
        {/* Ripples */}
        <div className={`${styles.rippleBase} ${styles.centerRipple}`} style={{ animationDelay: '0s' }}></div>
        <div className={`${styles.rippleBase} ${styles.centerRipple}`} style={{ animationDelay: '1.3s' }}></div>
        <div className={`${styles.rippleBase} ${styles.centerRipple}`} style={{ animationDelay: '2.6s' }}></div>

        <div className={`${styles.rippleBase} ${styles.cornerRipple1}`} style={{ animationDelay: '0.5s' }}></div>
        <div className={`${styles.rippleBase} ${styles.cornerRipple1}`} style={{ animationDelay: '3s' }}></div>

        <div className={`${styles.rippleBase} ${styles.cornerRipple2}`} style={{ animationDelay: '1s' }}></div>
        <div className={`${styles.rippleBase} ${styles.cornerRipple2}`} style={{ animationDelay: '4s' }}></div>

        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className={styles.clickRipple}
            style={{ left: ripple.x, top: ripple.y }}
          />
        ))}

        <div className={styles.content}>
          <h1 className={styles.title}>Welcome to ATARES</h1>
          <p className={styles.description}>
            AI-powered skin analysis and expert system recommendations.
            <br />
            Advanced dermatology insights at your fingertips.
          </p>

          <div className={styles.actions}>
            <Link href="/dashboard/analysis">
              <button className="btn-analysis">Start Analysis</button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
