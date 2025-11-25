// File: src/app/api/auth/login/route.ts

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma'; // Akses konektor
import { LoginCredentials } from '@/types/auth'; // Tipe data Login
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        const body: LoginCredentials = await request.json();
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
        
        // Buat JWT Token
        const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-development'; 
        const token = jwt.sign(
            { userId: user.id },
            JWT_SECRET,
            { expiresIn: '7d' } 
        );

        // Kirim Respons Sukses (AuthResponse)
        return NextResponse.json({ 
            token, 
            user: userWithoutHash 
        }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Login gagal. Server error.' }, { status: 500 });
    }
}