'use client';

import { useState, useRef, useEffect } from 'react';
import styles from '@/app/dashboard/analysis/Analysis.module.css';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export default function ChatSection() {
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

    const handleSend = () => {
        if (!input.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        setInput('');

        // Mock bot response
        setTimeout(() => {
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm currently in demo mode. Once the analysis is complete, I can give you specific advice!",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botResponse]);
        }, 1000);
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
