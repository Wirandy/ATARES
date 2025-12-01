'use client';

import { useState, useEffect } from 'react';
import styles from './History.module.css';

// TIPE DATA DARI DATABASE
interface AnalysisFromDB {
  id: string;
  imageUrl: string;
  pimpleCount: number;
  recommendations: string | null;
  createdAt: string; // ISO date dari Prisma
}

export default function HistoryPage() {
  const [histories, setHistories] = useState<AnalysisFromDB[]>([]);
  const [selectedItem, setSelectedItem] = useState<AnalysisFromDB | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AMBIL DATA DARI API SAAT HALAMAN DIBUKA
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/history');
        if (!res.ok) throw new Error('Gagal mengambil riwayat');
        const data = await res.json();
        setHistories(data.analyses);

        // Otomatis pilih yang paling baru
        if (data.analyses.length > 0) {
          setSelectedItem(data.analyses[0]);
        }
      } catch (err: any) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // HITUNG STATISTIK OTOMATIS
  const totalScans = histories.length;
  const avgScore = histories.length > 0
    ? Math.round(histories.reduce((acc, h) => acc + (100 - h.pimpleCount * 2), 0) / histories.length)
    : 0; // contoh: semakin sedikit jerawat → skor tinggi
  const lastScan = histories.length > 0
    ? new Date(histories[0].createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Belum ada';

  if (loading) {
    return <div className={styles.container}><p style={{ color: 'white', textAlign: 'center', marginTop: '3rem' }}>Loading riwayat...</p></div>;
  }

  if (error) {
    return <div className={styles.container}><p style={{ color: 'red' }}>Error: {error}</p></div>;
  }

  return (
    <div className={styles.container}>
      {/* Ripple animations tetap sama */}
      <div className={`${styles.rippleBase} ${styles.centerRipple}`} style={{ animationDelay: '0s' }}></div>
      <div className={`${styles.rippleBase} ${styles.centerRipple}`} style={{ animationDelay: '1.3s' }}></div>
      <div className={`${styles.rippleBase} ${styles.centerRipple}`} style={{ animationDelay: '2.6s' }}></div>
      <div className={`${styles.rippleBase} ${styles.cornerRipple1}`} style={{ animationDelay: '0.5s' }}></div>
      <div className={`${styles.rippleBase} ${styles.cornerRipple1}`} style={{ animationDelay: '3s' }}></div>
      <div className={`${styles.rippleBase} ${styles.cornerRipple2}`} style={{ animationDelay: '1s' }}></div>
      <div className={`${styles.rippleBase} ${styles.cornerRipple2}`} style={{ animationDelay: '4s' }}></div>

      <div className={styles.header}>
        <h1 className={styles.title}>Analysis History</h1>
        <p className={styles.subtitle}>Track your skin health progress over time</p>
      </div>

      {/* STATISTIK OTOMATIS */}
      <div className={styles.statsGrid}>
        <div className={styles.statsCard}>
          <div className={styles.statsInfo}>
            <h4>Total Scans</h4>
            <p>{totalScans}</p>
          </div>
        </div>
        <div className={styles.statsCard}>
          <div className={styles.statsInfo}>
            <h4>Avg Score</h4>
            <p>{avgScore}</p>
          </div>
        </div>
        <div className={styles.statsCard}>
          <div className={styles.statsInfo}>
            <h4>Progress</h4>
            <p>{totalScans > 1 ? '+3%' : '—'}</p>
          </div>
        </div>
        <div className={styles.statsCard}>
          <div className={styles.statsInfo}>
            <h4>Last Scan</h4>
            <p>{lastScan}</p>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* DAFTAR RIWAYAT */}
        <div className={styles.historyList}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', color: 'white' }}>
            <span>Filter by: </span>
            <select style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '0.5rem' }}>
              <option>Last Month</option>
            </select>
          </div>

          {histories.length === 0 ? (
            <p style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>
              Belum ada riwayat analisis. Lakukan analisis pertama kamu!
            </p>
          ) : (
            histories.map((item) => (
              <div
                key={item.id}
                className={`${styles.historyItem} ${selectedItem?.id === item.id ? styles.active : ''}`}
                onClick={() => setSelectedItem(item)}
              >
                <img src={item.imageUrl.includes('data:image') ? item.imageUrl : '/placeholder.jpg'} alt="Hasil" className={styles.itemThumbnail} />
                <div className={styles.itemInfo}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className={styles.itemDate}>
                      {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(255,0,0,0.3)', padding: '0.1rem 0.5rem', borderRadius: '1rem' }}>
                      {item.pimpleCount} jerawat
                    </span>
                  </div>
                  <span className={styles.itemTime}>
                    {new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <div className={styles.itemScore}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span>Skor Kesehatan</span>
                      <span>{100 - item.pimpleCount * 2}%</span>
                    </div>
                    <div className={styles.scoreBar}>
                      <div className={styles.scoreFill} style={{ width: `${100 - item.pimpleCount * 2}%` }}></div>
                    </div>
                  </div>

                  <div className={styles.itemActions}>
                    <span className={styles.actionBtn}>View</span>
                    <span className={styles.actionBtn}>Export</span>
                    <span className={styles.actionBtn}>Delete</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DETAIL VIEW */}
        <div className={styles.detailView}>
          {selectedItem ? (
            <>
              <div className={styles.detailHeader}>
                <h3>Detailed Analysis</h3>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    {new Date(selectedItem.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                    {new Date(selectedItem.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div className={styles.detailImageContainer}>
                <img 
                  src={selectedItem.imageUrl.includes('data:image') ? selectedItem.imageUrl : '/placeholder.jpg'} 
                  alt="Detail" 
                  className={styles.detailImage} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
                <span>Jumlah Jerawat</span>
                <span style={{ background: 'rgba(255,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '1rem', fontWeight: 'bold' }}>
                  {selectedItem.pimpleCount} butir
                </span>
              </div>

              <div className={styles.recommendationBox}>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {selectedItem.recommendations || 'Tidak ada rekomendasi dari expert system.'}
                </p>
              </div>

              <button className={styles.downloadBtn}>
                Download Report
              </button>
            </>
          ) : (
            <p style={{ color: 'white', textAlign: 'center', padding: '4rem' }}>
              Pilih satu analisis untuk lihat detail
            </p>
          )}
        </div>
      </div>
    </div>
  );
}