import Link from 'next/link';
import styles from './Navbar.module.css';


export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>
                <Link href="/">ATARES</Link>
            </div>
            <div className={styles.navLinks}>
                <Link href="/" className={styles.link}>Home</Link>
                <Link href="/dashboard/analysis" className={styles.link}>Analysis</Link>
                <Link href="/dashboard/history" className={styles.link}>History</Link>
                <Link href="/dashboard" className={styles.link}>Profile</Link>
            </div>
            <div className={styles.actions}>
                <Link href="/login">
                    <button className={styles.button}>Login</button>
                </Link>
                <Link href="/register">
                    <button className={styles.button}>Sign Up</button>
                </Link>

            </div>
        </nav>
    );
}
