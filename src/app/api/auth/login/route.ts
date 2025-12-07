import { NextResponse, NextRequest } from 'next/server'; // Tambah NextRequest
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { LoginCredentials } from '@/types/auth';
import jwt from 'jsonwebtoken'; 
import { cookies } from 'next/headers'; 

export async function POST(request: NextRequest) { // Gunakan NextRequest untuk akses URL yang lebih mudah
    
    // --- TAMBAHAN BARU: 1. Tentukan Path Redirect ---
    const url = new URL(request.url);
    const redirectTo = url.searchParams.get('redirect') || '/dashboard'; // Default ke /dashboard
    // -----------------------------------------------
    
    // 1. Ambil body sebagai TEXT untuk menghindari 'stream already consumed'
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
                action = requestBody.action || 'login'; 
            } else {
                return NextResponse.json({ message: 'Empty request body.' }, { status: 400 });
            }
        } catch (e) {
            console.error("Error parsing JSON:", e);
            return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
        }
    }


    // --- 2. HANDLER AI ANALYSIS (JANGAN DIUBAH) ---
    if (action === 'analysis' && requestBody instanceof FormData) { 
        // ... (Logika Handler AI Analysis tetap sama)
        const cookieStore = (await cookies()) as any;
        const token = cookieStore.get('token')?.value || cookieStore.get('authToken')?.value; 
        if (!token) return NextResponse.json({error: 'Unauthorized. Token not found.'}, {status: 401});

        const file = requestBody.get('image') as File | null;
        if (!file) return NextResponse.json({error: 'No image provided for analysis'}, {status: 400});
        
        const aiForm = new FormData();
        aiForm.append('file', file);
        
        try {
            // Catatan: Pastikan endpoint /detect ini sesuai dengan yang kamu jalankan di FastAPI!
            const aiResponse = await fetch('http://localhost:8000/detect', { 
                method: 'POST',
                body: aiForm,
            });

            if (!aiResponse.ok) {
                const errorText = await aiResponse.text();
                console.error("AI Service Error:", errorText);
                return NextResponse.json({error: `AI service returned status ${aiResponse.status}`}, {status: 500});
            }

            const aiResult = await aiResponse.json();
            return NextResponse.json(aiResult);
            
        } catch (e) {
            console.error("Fetch Error:", e);
            return NextResponse.json({error: 'Could not connect to AI service (port 8000).'}, {status: 503});
        }
    }
    
    // --- 3. HANDLER LOGIN ---

    if (action !== 'login') {
        return NextResponse.json({ message: 'Unknown action or request type.' }, { status: 400 });
    }
    
    try {
        const body: LoginCredentials = requestBody; 
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ message: 'Email dan password wajib diisi.' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, name: true, passwordHash: true }
        });

        if (!user) {
            return NextResponse.json({ message: 'Kredensial tidak valid (User tidak ditemukan).' }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return NextResponse.json({ message: 'Kredensial tidak valid (Password salah).' }, { status: 401 });
        }

        const { passwordHash, ...userWithoutHash } = user;
        
        // 6. Buat JWT Token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'ini-rahasia-banget-ganti-dengan-yang-panjang-123',
            { expiresIn: '7d' }
        );

        // 7. Kirim Respons Sukses + SET COOKIE TOKEN
        const response = NextResponse.json({
            success: true,
            token, 
            user: userWithoutHash,
            redirectTo: redirectTo, // <--- MODIFIKASI KRITIS: KIRIM PATH TUJUAN KE CLIENT
        }, { status: 200 });

        // SET COOKIE
        response.cookies.set('token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'lax', 
            path: '/', 
            maxAge: 60 * 60 * 24 * 7 
        });

        return response;

    } catch (error) {
        console.error("Login Handler Error (Orisinal):", error);
        return NextResponse.json({ message: 'Login gagal. Server error.' }, { status: 500 });
    }
}