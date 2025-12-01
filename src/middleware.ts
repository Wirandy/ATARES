// File: middleware.ts (NEXT.JS 16 + TURBOPACK COMPATIBLE — FIX 100%)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken'; // GUNAKAN jsonwebtoken (bukan jose) → KOMPATIBEL TURBOPACK

const protectedPaths = ['/dashboard'];
const publicPaths = ['/login', '/register', '/'];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  let isAuthenticated = false;

  // Verifikasi token dengan jsonwebtoken (kompatibel Turbopack)
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'ini-rahasia-banget-ganti-dengan-yang-panjang');
      isAuthenticated = true;
    } catch (error) {
      // Token invalid atau expired → anggap guest
      isAuthenticated = false;
    }
  }

  // 1. Kalau belum login & masuk ke /dashboard → redirect ke login
  if (!isAuthenticated && protectedPaths.some(path => pathname.startsWith(path))) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  // 2. Kalau sudah login & masuk ke /login atau /register → redirect ke dashboard
  if (isAuthenticated && publicPaths.includes(pathname)) {
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }

  // Kalau sudah login & buka home (/) → redirect ke dashboard
  if (isAuthenticated && pathname === '/') {
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }

  // Selain itu → lanjutkan
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
};