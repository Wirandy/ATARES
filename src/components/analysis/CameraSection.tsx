'use client';

import { useState, useRef, useEffect } from 'react';
import styles from '@/app/dashboard/analysis/Analysis.module.css';

interface CameraSectionProps {
    onCapture: (file: File) => void;
}

export default function CameraSection({ onCapture }: CameraSectionProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isStreamActive, setIsStreamActive] = useState(false);
    const [error, setError] = useState('');
    const [debugStatus, setDebugStatus] = useState('Initializing...');
    const streamRef = useRef<MediaStream | null>(null);
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        initCamera();

        return () => {
            isMounted.current = false;
            stopCamera();
        };
    }, []);

    const initCamera = async () => {
        setDebugStatus('Checking permissions...');
        setError('');

        if (typeof window !== 'undefined' && !window.navigator?.mediaDevices) {
            const msg = 'Camera API not supported. Please use HTTPS or localhost.';
            setError(msg);
            setDebugStatus(msg);
            return;
        }

        try {
            setDebugStatus('Requesting camera access...');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
            });

            if (!isMounted.current) {
                // Component unmounted during request
                stream.getTracks().forEach(track => track.stop());
                return;
            }

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setDebugStatus('Stream active. Waiting for video...');

                videoRef.current.onloadedmetadata = () => {
                    if (!isMounted.current) return;
                    videoRef.current?.play()
                        .then(() => {
                            setIsStreamActive(true);
                            setDebugStatus('Camera ready.');
                        })
                        .catch(e => {
                            console.error("Play error:", e);
                            setDebugStatus(`Play error: ${e.message}`);
                        });
                };
            }
        } catch (err: any) {
            console.error("Error accessing camera:", err);
            if (!isMounted.current) return;

            setIsStreamActive(false);
            let errorMsg = `Camera error: ${err.message || 'Unknown error'}`;

            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                errorMsg = 'Permission denied. Please allow camera access.';
            } else if (err.name === 'NotFoundError') {
                errorMsg = 'No camera device found.';
            } else if (err.name === 'NotReadableError') {
                errorMsg = 'Camera is in use by another app.';
            }

            setError(errorMsg);
            setDebugStatus(errorMsg);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsStreamActive(false);
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0);

                canvasRef.current.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                        onCapture(file);
                    }
                }, 'image/jpeg');
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onCapture(e.target.files[0]);
        }
    };

    return (
        <div className={`glass-panel ${styles.cameraSection}`}>
            <div className={styles.sectionHeader}>
                <h3>Live Camera</h3>
            </div>

            <div className={styles.videoContainer}>
                {error ? (
                    <div className={styles.cameraError}>
                        <p style={{ marginBottom: '1rem' }}>{error}</p>
                        <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '1rem' }}>Status: {debugStatus}</p>
                        <button className="btn btn-primary" onClick={initCamera}>
                            Retry Camera
                        </button>
                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            playsInline
                            muted
                            className={styles.videoFeed}
                        />
                        <div className={styles.faceGuide}></div>
                        {!isStreamActive && (
                            <div style={{ position: 'absolute', color: 'white', background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                                {debugStatus}
                            </div>
                        )}
                    </>
                )}
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className={styles.controls}>
                <button
                    className="btn btn-primary"
                    onClick={handleCapture}
                    disabled={!isStreamActive}
                    style={{ opacity: isStreamActive ? 1 : 0.5 }}
                >
                    📷 Capture Photo
                </button>
                <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()}>
                    📤 Upload Photo
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept="image/*"
                    onChange={handleFileUpload}
                />
            </div>
        </div>
    );
}
