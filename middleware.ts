// middleware.ts (di root folder)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // Wajib ada untuk verifikasi

// Jalur yang ingin kita lindungi (akses hanya untuk authenticated user)
const protectedPaths = ['/dashboard', '/dashboard/analysis', '/dashboard/history', '/dashboard/profile'];
// Jalur yang diizinkan tanpa token (login, register, dan home)
const publicPaths = ['/login', '/register', '/'];

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;
    let isAuthenticated = false;

    // 1. Verifikasi Status Otentikasi (Cek Token dan Validasi)
    if (token) {
        try {
            // Secret key harus sama dengan yang digunakan di login/register
            const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-development');

            // ✅ PENTING: Lakukan Verifikasi JWT!
            await jwtVerify(token, JWT_SECRET); 
            isAuthenticated = true;

        } catch (error) {
            // Token kadaluarsa atau tidak valid: User harus dianggap unauthenticated
            // console.error("JWT Verification failed:", error.message);
            // Kita tidak perlu menghapus cookie di sini karena Next.js tidak mengizinkannya secara langsung di middleware. 
            // Cukup biarkan isAuthenticated = false, dan browser akan redirect ke login.
        }
    }

    // 2. LOGIKA REDIRECT

    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
    const isPublicPath = publicPaths.includes(pathname);


    // A) Jika user belum terotentikasi dan mencoba mengakses jalur terproteksi:
    if (!isAuthenticated && isProtectedPath) {
        // Redirect paksa ke /login
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirect', pathname); // Tambah redirect path
        return NextResponse.redirect(url);
    }

    // B) Jika user sudah terotentikasi (Token valid) dan mencoba mengakses jalur publik (/login, /register, /):
    if (isAuthenticated && isPublicPath) {
        // Redirect ke dashboard
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    // Default: Biarkan request berlanjut
    return NextResponse.next();
}

// Konfigurasi Matcher
export const config = {
    // Jalankan middleware untuk semua path yang relevan
    matcher: [
        '/dashboard/:path*', // Lindungi semua di bawah /dashboard
        '/',
        '/login',
        '/register',
    ],
};