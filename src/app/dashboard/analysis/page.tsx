'use client';

import { useState } from 'react';
import CameraSection from '@/components/analysis/CameraSection';
import ChatSection from '@/components/analysis/ChatSection';
import styles from './Analysis.module.css';

// --- DEFINISI TIPE DATA ---
interface Advice {
    type: string;
    treatment: string;
    advice: string;
}

// UPDATE INTERFACE INI:
interface AnalysisResultType {
    image_result: string; // Base64 encoded image
    counts: Record<string, number>; 
    expert_advice: Advice[];
    debug_logs?: string[]; // <--- TAMBAHKAN BARIS INI (tanda tanya artinya opsional)
}

export default function AnalysisPage() {
    const [step, setStep] = useState<'UPLOAD' | 'PROCESSING' | 'RESULT'>('UPLOAD');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null); 
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = async (file: File) => {
        // 1. Reset State dan Set Step
        setError(null);
        setAnalysisResult(null);
        setStep('PROCESSING');

        // Create a preview URL (preview gambar yang diambil)
        const imageUrl = URL.createObjectURL(file);
        setCapturedImage(imageUrl);
        
        try {
            // 2. Siapkan FormData untuk API Call
            const formData = new FormData();
            formData.append('file', file);
            formData.append('action', 'analysis'); 
            
            // 3. Panggil API FastAPI (diasumsikan endpoint sudah /analyze)
            const response = await fetch('http://localhost:8000/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error || `Analysis failed with status ${response.status}.`;
                setError(errorMessage);
                throw new Error(errorMessage);
            }

            // 4. Proses Hasil
            const data: AnalysisResultType = await response.json();

            // FIX KRITIS DAN AGRESIF: Menghapus karakter non-Base64 yang merusak URL
            if (data.image_result) {
                // 1. Membersihkan string: Hapus semua karakter yang BUKAN Base64 (+, /, =, huruf, angka)
                // Kita asumsikan prefix 'data:' yang asli sudah hilang (karena error)
                let base64Data = data.image_result.replace(/^data:image\/[a-z]+;base64,/, '').trim();
                
                // Hapus karakter ilegal (non-Base64)
                base64Data = base64Data.replace(/[^A-Z0-9+/=]/gi, ''); 
                
                // 2. Tambahkan prefix Data URI yang bersih
                data.image_result = `data:image/jpeg;base64,${base64Data}`;
            }
            
            // 5. Update State UTAMA (menampilkan hasil)
            setAnalysisResult(data);
            setStep('RESULT'); 
            
            // --- MODIFIKASI: TAMPILKAN LOG DEBUG SECARA GAMBLANG ---
            if (data.debug_logs) {
                console.log("================ DEBUG LOGS START ================");
                // Print setiap baris log secara terpisah agar mudah dibaca
                console.log(data.debug_logs.join("\n")); 
                console.log("================ DEBUG LOGS END =================");
            } else {
                console.log("WARNING: Tidak ada debug_logs dalam response API");
            }
            // --------------------------------------------------------

            console.log("Analysis Result from API:", data);

            // === BAGIAN YANG DIPINDAH: SIMPAN KE DATABASE (History) ===
            // Dijalankan secara asinkron (non-blocking) agar tidak menghalangi UI update.
            (async () => {
                try {
                    // Hitung total jerawat dari semua kategori
                    const totalPimpleCount = Object.values(data.counts).reduce((a, b) => a + b, 0);

                    // Gabungkan semua saran jadi satu string
                    const recommendationText = data.expert_advice
                        .map(advice => `${advice.type}: ${advice.advice}`)
                        .join('\n');

                    await fetch('/api/analysis/save', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            imageUrl: data.image_result,
                            pimpleCount: totalPimpleCount,
                            recommendations: recommendationText,
                        }),
                    });
                    console.log('Analysis berhasil disimpan ke riwayat!');
                } catch (saveError) {
                    // Hanya log error jika penyimpanan gagal, tidak perlu tampilkan ke user
                    console.error('Gagal menyimpan ke history:', saveError);
                }
            })();
            // === AKHIR BAGIAN NON-BLOCKING ===

        } catch (e: any) {
            // Tangani error jika fetch ke /analyze gagal
            console.error("Analysis Fetch Error:", e);
            setStep('UPLOAD'); // Kembali ke UPLOAD
            // Hanya set error jika belum di-set di blok if (!response.ok)
            if (!error) {
                setError(e.message || 'An unexpected error occurred during analysis.');
            }
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setAnalysisResult(null);
        setStep('UPLOAD');
        setError(null);
    };

    console.log("Current Step State:", step); // <-- TAMBAHKAN BARIS INI DI SINI!

    return (
        <div className={styles.container}>
            {/* ... (Ripple animations dan Header tidak berubah) */}

            <div className={`${styles.rippleBase} ${styles.centerRipple}`} style={{ animationDelay: '0s' }}></div>
            <div className={`${styles.rippleBase} ${styles.centerRipple}`} style={{ animationDelay: '1.3s' }}></div>
            <div className={`${styles.rippleBase} ${styles.centerRipple}`} style={{ animationDelay: '2.6s' }}></div>

            <div className={`${styles.rippleBase} ${styles.cornerRipple1}`} style={{ animationDelay: '0.5s' }}></div>
            <div className={`${styles.rippleBase} ${styles.cornerRipple1}`} style={{ animationDelay: '3s' }}></div>

            <div className={`${styles.rippleBase} ${styles.cornerRipple2}`} style={{ animationDelay: '1s' }}></div>
            <div className={`${styles.rippleBase} ${styles.cornerRipple2}`} style={{ animationDelay: '4s' }}></div>

            <div className={styles.header}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', paddingTop: '1rem' }}>Skin Analysis</h1>
                <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                    {step === 'UPLOAD' ? 'Position your face in the camera and capture' :
                        step === 'PROCESSING' ? 'Analyzing your skin...' :
                            'Here are your results'}
                </p>
            </div>

            {/* BARIS UNTUK TAMPILKAN ERROR */}
            {error && (
                <div style={{ color: 'red', padding: '10px', backgroundColor: 'rgba(255, 0, 0, 0.1)', margin: '1rem' }}>
                    <p>🚨 Error: {error}</p>
                    <button onClick={handleRetake} style={{ marginTop: '5px' }}>Try Again</button>
                </div>
            )}
            {/* END BARIS ERROR */}

            <div className={styles.gridContainer}>
                <div className={styles.leftColumn}>
                    {step === 'UPLOAD' && (
                        <CameraSection onCapture={handleFileSelect} />
                    )}

                    {step === 'PROCESSING' && (
                        <div className={`glass-panel ${styles.processingState}`}>
                            <div className={styles.spinner}></div>
                            <h3>Processing Image...</h3>
                            <img src={capturedImage || ''} alt="Processing" className={styles.previewImage} />
                        </div>
                    )}

                    {step === 'RESULT' && analysisResult && ( 
                        <div className={`glass-panel ${styles.resultState}`}>
                            <img 
                                src={analysisResult.image_result}
                                alt="Analysis Result with Detections" 
                                className={styles.resultImage} 
                            />   
                            <div className={styles.resultActions} style={{ marginTop: '1rem' }}> 
                                <button className="btn btn-primary" onClick={handleRetake}>Analyze Another</button>
                            </div>
                        </div>
                    )}
                </div>
                <ChatSection analysisResult={analysisResult} /> 
            </div>
        </div>
    );
}