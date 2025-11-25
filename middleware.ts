// File: middleware.ts (di root proyek, sejajar dengan folder src)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Jalur yang ingin kita lindungi (semua yang ada di bawah /dashboard)
const protectedPaths = ['/dashboard'];
// Jalur yang diizinkan tanpa token, tetapi user yang sudah login tidak boleh mengaksesnya
const publicPaths = ['/login', '/register', '/']; 

export function middleware(request: NextRequest) {
    // 1. Ambil Token dari Cookies
    // Kita asumsikan token sudah disimpan di cookie bernama 'token' (akan diperbaiki di langkah selanjutnya)
    const token = request.cookies.get('token')?.value; 

    const { pathname } = request.nextUrl;

    // 2. Cek apakah pengguna mencoba mengakses jalur terproteksi
    const isProtected = protectedPaths.some(path => pathname.startsWith(path));

    if (isProtected) {
        // Jika token tidak ada (atau token tidak valid), alihkan ke Login
        if (!token) {
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }

        // 3. Verifikasi Token (Security Check)
        try {
            // Menggunakan JWT_SECRET yang sama dengan yang ada di .env Anda
            const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
            
            // Mencoba decode dan memverifikasi token
            jwt.verify(token, JWT_SECRET); 
            
            // Jika berhasil, request berlanjut
            return NextResponse.next();

        } catch (error) {
            // Jika verifikasi gagal (token kadaluarsa/dimanipulasi)
            console.error("JWT Verification failed:", error);
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }
    }

    // 4. Mencegah user yang sudah login mengakses Register/Login lagi
    const isPublicButLoggedIn = token && publicPaths.some(path => pathname === path);
    if (isPublicButLoggedIn) {
        // Alihkan user yang sudah login dari /login atau /register ke /dashboard
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

// 5. Konfigurasi untuk mengatur jalur mana yang harus dicek oleh middleware
export const config = {
    matcher: [
        /*
         * Mencocokkan semua jalur, kecuali:
         * 1. API routes (yang dimulai dengan /api, kita akan lindungi secara terpisah)
         * 2. file statis (_next/static, _next/image)
         * 3. public files (svg, jpg, dll.)
         */
        '/:path*', 
    ], 
};