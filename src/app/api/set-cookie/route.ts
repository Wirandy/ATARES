// File: src/app/api/set-cookie/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { token } = await request.json();

    if (!token) {
        return NextResponse.json({ message: "Token is missing" }, { status: 400 });
    }

    // Menggunakan Next.js untuk membuat respons dengan header Set-Cookie
    const response = NextResponse.json({ success: true, message: "Cookie set" }, { status: 200 });

    // SET COOKIE: Token akan berlaku selama 7 hari, HTTP-only, dan Secure (di production)
    response.cookies.set('token', token, {
        httpOnly: true, // WAJIB! Mencegah akses dari JavaScript browser (keamanan)
        secure: process.env.NODE_ENV === 'production', // Hanya melalui HTTPS di production
        maxAge: 60 * 60 * 24 * 7, // 7 hari
        path: '/', // Berlaku untuk seluruh domain
    });

    return response;
}