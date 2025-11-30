import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Jalur yang ingin kita lindungi
const protectedPaths = ['/dashboard'];
// Jalur yang diizinkan tanpa token
const publicPaths = ['/login', '/register', '/'];

// Next.js akan memproses ini di Edge Runtime
export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;
    let isAuthenticated = false;

    // 1. Verifikasi Status Otentikasi (Cek Token)
    if (token) {
        try {
            const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');

            // Verifikasi menggunakan JOSE (Edge Compatible)
            await jwtVerify(token, JWT_SECRET);
            isAuthenticated = true;
        } catch (error) {
            // Token kadaluarsa/tidak valid: Lanjutkan sebagai unauthenticated
            // console.error("JWT Verification failed in middleware");
        }
    }

    // 2. LOGIKA REDIRECT

    // A) Jika user belum terotentikasi dan mencoba mengakses jalur terproteksi:
    if (!isAuthenticated && protectedPaths.some(path => pathname.startsWith(path))) {
        // Redirect paksa ke /login
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // B) Jika user sudah terotentikasi dan mencoba mengakses jalur publik (/login, /register):
    if (isAuthenticated && publicPaths.includes(pathname)) {
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
    matcher: [
        '/dashboard/:path*', // Lindungi semua di bawah /dashboard
        '/',
        '/login',
        '/register',
    ],
};