// File: src/app/api/auth/register/route.ts

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma'; // Akses konektor yang baru dibuat
import { RegisterCredentials } from '@/types/auth'; // Tipe dari frontend
import { SignJWT } from 'jose'; // <-- PERUBAHAN: Import dari jose

export async function POST(request: Request) {
    try {
        const body: RegisterCredentials = await request.json();
        const { name, email, password } = body;
        
        // Validasi Input
        if (!name || !email || !password || password.length < 6) {
            return NextResponse.json({ message: 'Input wajib diisi (password min 6 karakter).' }, { status: 400 });
        }

        // Cek User
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ message: 'Email sudah terdaftar.' }, { status: 409 });
        }

        // Hash Password dan Simpan User
        const passwordHash = await bcrypt.hash(password, 10); 
        const newUser = await prisma.user.create({
            data: { name, email, passwordHash },
            select: { id: true, name: true, email: true }
        });

        // 6. Buat JWT Token (Ganti Logika JWT)
        const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-development');

        const token = await new SignJWT({ userId: newUser.id })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(JWT_SECRET);

        // 7. Kirim Respons Sukses (AuthResponse)
        return NextResponse.json({ 
            token, 
            user: { id: newUser.id, name: newUser.name, email: newUser.email } 
        }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Registrasi gagal. Server error.' }, { status: 500 });
    }
}