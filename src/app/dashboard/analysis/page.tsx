'use client';

import { useState } from 'react';
import CameraSection from '@/components/analysis/CameraSection';
import ChatSection from '@/components/analysis/ChatSection';
import styles from './Analysis.module.css';

export default function AnalysisPage() {
    const [step, setStep] = useState<'UPLOAD' | 'PROCESSING' | 'RESULT'>('UPLOAD');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const handleFileSelect = async (file: File) => {
        // Create a preview URL for the captured file
        const imageUrl = URL.createObjectURL(file);
        setCapturedImage(imageUrl);
        setStep('PROCESSING');

        // Simulate analysis delay
        setTimeout(() => {
            setAnalysisResult({
                detections: ['Acne', 'Dark Spot'],
                recommendations: ['Use Salicylic Acid', 'Apply Sunscreen']
            });
            setStep('RESULT');
        }, 3000);
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setAnalysisResult(null);
        setStep('UPLOAD');
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

                    {step === 'RESULT' && (
                        <div className={`glass-panel ${styles.resultState}`}>
                            <img src={capturedImage || ''} alt="Result" className={styles.resultImage} />
                            <div className={styles.resultOverlay}>
                                {/* Mock Overlay */}
                                <div style={{ position: 'absolute', top: '30%', left: '40%', width: '50px', height: '50px', border: '2px solid red', borderRadius: '50%' }}></div>
                            </div>
                            <div className={styles.resultActions}>
                                <button className="btn btn-primary" onClick={handleRetake}>Analyze Another</button>
                            </div>
                        </div>
                    )}
                </div>

                <ChatSection />
            </div>
        </div>
    );
}
