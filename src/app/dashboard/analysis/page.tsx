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

interface AnalysisResultType {
    image_result: string; // Base64 encoded image
    counts: Record<string, number>; 
    expert_advice: Advice[];
}

export default function AnalysisPage() {
    const [step, setStep] = useState<'UPLOAD' | 'PROCESSING' | 'RESULT'>('UPLOAD');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    // FIX B: Mengganti type 'any' ke type yang benar
    const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null); 
    const [error, setError] = useState<string | null>(null); // FIX B: Menambah state error

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
            formData.append('image', file);
            formData.append('action', 'analysis'); 
            
            // 3. Panggil API Next.js di /api/auth/login
            const response = await fetch('/api/auth/login', { 
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                // Mencoba baca JSON response error
                const errorData = await response.json();
                const errorMessage = errorData.error || 'Analysis failed due to a server error.';
                setError(errorMessage);
                throw new Error(errorMessage);
            }

            // 4. Proses Hasil
            const data: AnalysisResultType = await response.json();

            // 5. Update State dengan Hasil Nyata
            setAnalysisResult(data); 
            setStep('RESULT');
            console.log("Analysis Result from API:", data); // <--- TAMBAHKAN INI

        } catch (e: any) {
            // Tangani error, tampilkan pesan
            console.error("Analysis Fetch Error:", e);
            setStep('UPLOAD'); // Kembali ke UPLOAD
            setError(e.message || 'An unexpected error occurred during analysis.');
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setAnalysisResult(null);
        setStep('UPLOAD');
        setError(null); // Tambahkan reset error saat retake
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

            {/* FIX A: MENGHAPUS DIV KOSONG YG MERUSAK LAYOUT GRID */}
            {/* HAPUS: <div className={styles.gridContainer}></div> */}

            <div className={styles.gridContainer}> {/* <-- Ini adalah grid container yang seharusnya */}
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
                            {/* Teks "Analysis Result with Detections" BISA DITAMBAHKAN DI SINI jika memang bagian dari UI */}   
                            <img 
                                src={`data:image/jpeg;base64,${analysisResult.image_result}`} 
                                alt="Analysis Result with Detections" 
                                className={styles.resultImage} 
                            />   
                            <div className={styles.resultActions} style={{ marginTop: '1rem' }}> 
                                <button className="btn btn-primary" onClick={handleRetake}>Analyze Another</button>
                            </div>
                        </div>
                    )}
                </div>
                {/* Baris 83 */}
                <ChatSection analysisResult={analysisResult} /> 
            </div>
        </div>
    );
}