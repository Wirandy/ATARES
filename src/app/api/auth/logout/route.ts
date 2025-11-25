// File: src/app/api/auth/logout/route.ts

import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true, message: "Logged out" }, { status: 200 });

    // Hapus Cookie dengan menyetelnya ke nilai kosong dan masa berlaku yang sudah lewat
    response.cookies.set('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0, // Segera kedaluwarsa
        path: '/',
    });

    return response;
}