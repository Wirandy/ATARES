// File: src/app/api/auth/login/route.ts (FINAL MODIFIED VERSION)

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { LoginCredentials } from '@/types/auth';
import jwt from 'jsonwebtoken'; 
import { cookies } from 'next/headers'; // <-- WAJIB: Untuk membaca token saat Analysis

export async function POST(request: Request) {
    
    // 1. Ambil body sebagai TEXT untuk menghindari 'stream already consumed'
    // Kloning request untuk memastikan body stream bisa dibaca ulang
    const requestClone = request.clone(); 
    const contentType = request.headers.get('content-type');

    let action: string | null = null;
    let requestBody: any;
    
    // --- PENANGANAN BODY DINAMIS ---
    
    // A) Jika permintaan adalah File Upload (Analysis):
    if (contentType?.includes('multipart/form-data')) {
        try {
            const formData = await request.formData();
            action = formData.get('action') as string | null;
            requestBody = formData;
        } catch (e) {
            // Jika gagal parse FormData, ini adalah error 
            console.error("Error parsing FormData:", e);
            return NextResponse.json({ message: 'Error processing file upload.' }, { status: 400 });
        }
    } 
    // B) Jika permintaan adalah JSON (Login, Register, dll.):
    else {
        try {
            const requestText = await requestClone.text();
            if (requestText) {
                requestBody = JSON.parse(requestText);
                action = requestBody.action || 'login'; // Asumsi default adalah 'login'
            } else {
                 return NextResponse.json({ message: 'Empty request body.' }, { status: 400 });
            }
        } catch (e) {
            // Jika gagal parse JSON
            console.error("Error parsing JSON:", e);
            return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
        }
    }


    // --- 2. HANDLER AI ANALYSIS (Prioritas Tinggi) ---
    if (action === 'analysis' && requestBody instanceof FormData) { 
        
        // Dapatkan store cookies, paksa TypeScript untuk menganggapnya sebagai 'any'
        const cookieStore = (await cookies()) as any;
        
        // Akses method .get() dari objek yang sudah di-unwrap
        const token = cookieStore.get('token')?.value || cookieStore.get('authToken')?.value;    
        if (!token) return NextResponse.json({error: 'Unauthorized. Token not found.'}, {status: 401});

        // Cek File
        const file = requestBody.get('image') as File | null;
        if (!file) return NextResponse.json({error: 'No image provided for analysis'}, {status: 400});
        
        // Panggil Python AI (FastAPI di port 8000)
        const aiForm = new FormData();
        aiForm.append('file', file); // <-- PERBAIKAN: Mengirim field sebagai 'file'
        
        try {
            const aiResponse = await fetch('http://localhost:8000/detect', { 
                method: 'POST',
                body: aiForm,
            });

            if (!aiResponse.ok) {
                // Jika server AI memberikan error
                const errorText = await aiResponse.text();
                console.error("AI Service Error:", errorText);
                return NextResponse.json({error: `AI service returned status ${aiResponse.status}`}, {status: 500});
            }

            const aiResult = await aiResponse.json();
            return NextResponse.json(aiResult);
            
        } catch (e) {
            // Error jika tidak bisa terhubung ke port 8000
            console.error("Fetch Error:", e);
            return NextResponse.json({error: 'Could not connect to AI service (port 8000).'}, {status: 503});
        }
    }
    
    // --- 3. HANDLER LOGIN (Logika Orisinal Anda) ---

    // Jika action bukan 'login', atau formatnya tidak sesuai yang diharapkan untuk login, tolak.
    if (action !== 'login') {
        return NextResponse.json({ message: 'Unknown action or request type.' }, { status: 400 });
    }
    
    // Lanjutkan dengan logika Login orisinal Anda:
    try {
        // requestBody adalah hasil parse JSON dari requestText
        const body: LoginCredentials = requestBody; 
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ message: 'Email dan password wajib diisi.' }, { status: 400 });
        }

        // Cari User dan Ambil Hash Password
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, name: true, passwordHash: true }
        });

        if (!user) {
            return NextResponse.json({ message: 'Kredensial tidak valid (User tidak ditemukan).' }, { status: 401 });
        }

        // Verifikasi Password (Bandingkan Hash)
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return NextResponse.json({ message: 'Kredensial tidak valid (Password salah).' }, { status: 401 });
        }

        // Hapus passwordHash dari objek user untuk respons
        const { passwordHash, ...userWithoutHash } = user;
        
        // 6. Buat JWT Token
        const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'ini-rahasia-banget-ganti-dengan-yang-panjang-123',
        { expiresIn: '7d' }
        );

        // 7. Kirim Respons Sukses + SET COOKIE TOKEN (INI YANG KAMU KURANG!)
        const response = NextResponse.json({
            success: true,
            token,                    // tetap kirim token (buat client kalau butuh)
            user: userWithoutHash
        }, { status: 200 });

        // INI BARIS SAKTI YANG HARUS DITAMBAHKAN
        response.cookies.set('token', token, {
            httpOnly: true,                              // wajib! biar aman dari XSS
            secure: process.env.NODE_ENV === 'production', // di local = false
            sameSite: 'lax',                             // biar bisa redirect dari login
            path: '/',                                   // PALING PENTING! biar semua halaman bisa baca
            maxAge: 60 * 60 * 24 * 7                     // 7 hari
        });

        return response;

    } catch (error) {
        console.error("Login Handler Error (Orisinal):", error);
        return NextResponse.json({ message: 'Login gagal. Server error.' }, { status: 500 });
    }
}