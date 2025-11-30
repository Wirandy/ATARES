'use client';

import { useState } from 'react';
import styles from './History.module.css';

// Mock Data
const HISTORY_DATA = [
    {
        id: 1,
        date: '23 November 2025',
        time: '14:30',
        score: 83,
        type: 'Combination',
        imageUrl: 'https://placehold.co/600x400/png?text=Analysis+1',
        metrics: {
            health: 83,
            hydration: 72,
            texture: 78
        }
    },
    {
        id: 2,
        date: '20 November 2025',
        time: '09:15',
        score: 81,
        type: 'Combination',
        imageUrl: 'https://placehold.co/600x400/png?text=Analysis+2',
        metrics: {
            health: 81,
            hydration: 70,
            texture: 75
        }
    },
    {
        id: 3,
        date: '17 November 2025',
        time: '16:45',
        score: 79,
        type: 'Combination',
        imageUrl: 'https://placehold.co/600x400/png?text=Analysis+3',
        metrics: {
            health: 79,
            hydration: 68,
            texture: 72
        }
    },
    {
        id: 4,
        date: '14 November 2025',
        time: '11:20',
        score: 77,
        type: 'Oily',
        imageUrl: 'https://placehold.co/600x400/png?text=Analysis+4',
        metrics: {
            health: 77,
            hydration: 65,
            texture: 70
        }
    }
];

export default function HistoryPage() {
    const [selectedItem, setSelectedItem] = useState(HISTORY_DATA[0]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Analysis History</h1>
                <p className={styles.subtitle}>Track your skin health progress over time</p>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statsCard}>
                    <div className={styles.statsInfo}>
                        <h4>Total Scans</h4>
                        <p>5</p>
                    </div>
                </div>
                <div className={styles.statsCard}>
                    <div className={styles.statsInfo}>
                        <h4>Avg Score</h4>
                        <p>80</p>
                    </div>
                </div>
                <div className={styles.statsCard}>
                    <div className={styles.statsInfo}>
                        <h4>Progress</h4>
                        <p>+5%</p>
                    </div>
                </div>
                <div className={styles.statsCard}>
                    <div className={styles.statsInfo}>
                        <h4>Last Scan</h4>
                        <p>2 days ago</p>
                    </div>
                </div>
            </div>

            <div className={styles.mainGrid}>
                {/* Left Column: History List */}
                <div className={styles.historyList}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', color: 'white' }}>
                        <span>Filter by: </span>
                        <select style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '0.5rem' }}>
                            <option>Last Month</option>
                        </select>
                    </div>

                    {HISTORY_DATA.map((item) => (
                        <div
                            key={item.id}
                            className={`${styles.historyItem} ${selectedItem.id === item.id ? styles.active : ''}`}
                            onClick={() => setSelectedItem(item)}
                        >
                            <img src={item.imageUrl} alt="Thumbnail" className={styles.itemThumbnail} />
                            <div className={styles.itemInfo}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className={styles.itemDate}>{item.date}</span>
                                    <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.2)', padding: '0.1rem 0.5rem', borderRadius: '1rem' }}>
                                        {item.type}
                                    </span>
                                </div>
                                <span className={styles.itemTime}>{item.time}</span>

                                <div className={styles.itemScore}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                        <span>Overall Score</span>
                                        <span>{item.score}%</span>
                                    </div>
                                    <div className={styles.scoreBar}>
                                        <div className={styles.scoreFill} style={{ width: `${item.score}%` }}></div>
                                    </div>
                                </div>

                                <div className={styles.itemActions}>
                                    <span className={styles.actionBtn}>View</span>
                                    <span className={styles.actionBtn}>Export</span>
                                    <span className={styles.actionBtn}>Delete</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Column: Detailed View */}
                <div className={styles.detailView}>
                    <div className={styles.detailHeader}>
                        <h3>Detailed Analysis</h3>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{selectedItem.date}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{selectedItem.time}</div>
                        </div>
                    </div>

                    <div className={styles.detailImageContainer}>
                        <img src={selectedItem.imageUrl} alt="Analysis Detail" className={styles.detailImage} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Skin Type</span>
                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.25rem 1rem', borderRadius: '1rem' }}>
                            {selectedItem.type}
                        </span>
                    </div>

                    <div className={styles.metricsGrid}>
                        <div className={styles.metricItem}>
                            <div className={styles.metricHeader}>
                                <span>Overall Health</span>
                                <span>{selectedItem.metrics.health}%</span>
                            </div>
                            <div className={styles.metricBarBg}>
                                <div className={styles.metricBarFill} style={{ width: `${selectedItem.metrics.health}%` }}></div>
                            </div>
                        </div>
                        <div className={styles.metricItem}>
                            <div className={styles.metricHeader}>
                                <span>Hydration</span>
                                <span>{selectedItem.metrics.hydration}%</span>
                            </div>
                            <div className={styles.metricBarBg}>
                                <div className={styles.metricBarFill} style={{ width: `${selectedItem.metrics.hydration}%` }}></div>
                            </div>
                        </div>
                        <div className={styles.metricItem}>
                            <div className={styles.metricHeader}>
                                <span>Texture</span>
                                <span>{selectedItem.metrics.texture}%</span>
                            </div>
                            <div className={styles.metricBarBg}>
                                <div className={styles.metricBarFill} style={{ width: `${selectedItem.metrics.texture}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.recommendationBox}>
                        <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                            Your skin condition on this date was very good. Continue your current skincare routine!
                        </p>
                    </div>

                    <button className={styles.downloadBtn}>
                        📥 Download Report
                    </button>
                </div>
            </div>
        </div>
    );
}
