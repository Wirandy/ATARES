'use client';

import { useState, useRef, useEffect } from 'react';
import styles from '@/app/dashboard/analysis/Analysis.module.css';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

interface Advice {
  type: string;
  treatment: string;
  advice: string;
}

interface AnalysisResultType {
  image_result: string;
  counts: Record<string, number>;
  expert_advice: Advice[];
}

// Definisikan Props untuk komponen ChatSection
interface ChatSectionProps {
  analysisResult: AnalysisResultType | null;
}

export default function ChatSection({ analysisResult }: ChatSectionProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm your skincare assistant. Capture your photo to get started, and I'll help you understand your skin analysis results and recommend the best skincare routine for you.",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
    if (analysisResult) {
        let summaryText = "**Analysis Complete!** Here are the findings:\n\n";

        // 1. Ringkasan Deteksi
        const detectedIssues = Object.entries(analysisResult.counts)
            .filter(([_, count]) => count > 0)
            .map(([issue, count]) => `${issue} (${count})`);
        
        summaryText += `**Detected:** ${detectedIssues.join(', ') || 'No major issues detected.'}\n\n`;

        // 2. Tambahkan Saran Ahli (Expert Advice) - PASTIKAN BLOK INI ADA
        if (analysisResult.expert_advice && analysisResult.expert_advice.length > 0) {
            analysisResult.expert_advice.forEach((advice, index) => {
                summaryText += `--- **Expert Advice for ${advice.type}** ---\n`;
                summaryText += `**Treatment:** ${advice.treatment}\n`;
                summaryText += `**Advice:** ${advice.advice}\n\n`;
            });
        } else {
            summaryText += "No specific expert advice available for the detected conditions.\n\n";
        }
        
        // Buat pesan bot baru
        const resultMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: summaryText, // <-- INI YANG AKAN MENAMPILKAN RINGKASAN DAN SARAN
            sender: 'bot',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, resultMessage]);
    }
}, [analysisResult]);

    const handleSend = () => {
        if (!input.trim()) return;

        setTimeout(() => {
        const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: "Saat ini, saya hanya dapat menganalisis hasil kulit Anda. Silakan coba upload gambar!",
            sender: 'bot',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
        }, 500);

        const newMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        setInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className={`glass-panel ${styles.chatSection}`}>
            <div className={styles.sectionHeader}>
                <div>
                    <h3>AI Skincare Assistant</h3>
                    <p className={styles.subHeader}>Ask me anything about your skin</p>
                </div>
            </div>

            <div className={styles.messagesContainer}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`${styles.message} ${msg.sender === 'user' ? styles.userMessage : styles.botMessage}`}>
                        {msg.sender === 'bot' && (
                            <div className={styles.botIcon}>
                                <img
                                    src="/robot-avatar.jpg"
                                    alt="AI"
                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                />
                            </div>
                        )}
                        <div className={styles.messageContent}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your skin analysis..."
                    className={styles.chatInput}
                />
                <button onClick={handleSend} className={styles.sendButton}>
                    ➤
                </button>
            </div>
        </div>
    );
}
