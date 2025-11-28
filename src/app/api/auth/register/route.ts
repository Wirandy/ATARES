// File: src/app/api/auth/register/route.ts

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { RegisterCredentials } from '@/types/auth';
import { SignJWT } from 'jose';

export async function POST(request: Request) {
    try {
        const body: RegisterCredentials = await request.json();
        // ✅ FIX 1: Tambah phoneNumber
        const { name, email, phoneNumber, password } = body;
        
        // ✅ FIX 2: Validasi phoneNumber
        if (!name || !email || !phoneNumber || !password || password.length < 6) {
            return NextResponse.json({ 
                message: 'Input wajib diisi (password min 6 karakter).' 
            }, { status: 400 });
        }

        // Cek User (email dulu)
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ message: 'Email sudah terdaftar.' }, { status: 409 });
        }

        // ✅ FIX 3: Cek phoneNumber juga (opsional, biar aman)
        const existingPhoneUser = await prisma.user.findUnique({ where: { phoneNumber } });
        if (existingPhoneUser) {
            return NextResponse.json({ message: 'Nomor HP sudah terdaftar.' }, { status: 409 });
        }

        // Hash Password
        const passwordHash = await bcrypt.hash(password, 10); 
        // ✅ FIX 4: Tambah phoneNumber ke DB
        const newUser = await prisma.user.create({
            data: { 
                name, 
                email, 
                phoneNumber,  // ✅ TAMBAH INI
                passwordHash 
            },
            select: { id: true, name: true, email: true, phoneNumber: true }  // ✅ Tambah phoneNumber ke response
        });

        // JWT Token
        const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-development');

        const token = await new SignJWT({ userId: newUser.id })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(JWT_SECRET);

        // Response
        return NextResponse.json({ 
            token, 
            user: { 
                id: newUser.id, 
                name: newUser.name, 
                email: newUser.email,
                phoneNumber: newUser.phoneNumber  // ✅ Return phoneNumber
            } 
        }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Registrasi gagal. Server error.' }, { status: 500 });
    }
}