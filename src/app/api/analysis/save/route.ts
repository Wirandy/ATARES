// src/app/api/analysis/save/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here'; // sesuaikan dengan .env kamu

export async function POST(request: NextRequest) {
  try {
    // 1. Ambil token dari cookie (sesuai auth kamu di feature/backend-auth-final)
    const token = (await cookies()).get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Verifikasi JWT & ambil userId
    let userId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 3. Ambil data dari body
    const body = await request.json();
    const { imageUrl, pimpleCount, recommendations } = body;

    if (!imageUrl || pimpleCount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 4. Simpan ke DB (pastikan nama field sesuai schema.prisma kamu!
    const newAnalysis = await prisma.analysis.create({
      data: {
        userId: userId,
        imageUrl: imageUrl,
        pimpleCount: pimpleCount,
        recommendations: recommendations || null,
        // confidence: confidence || null,          // kalau ada kolom ini, aktifkan
      },
    });

    return NextResponse.json({ success: true, analysis: newAnalysis }, { status: 201 });

  } catch (error: any) {
    console.error('Save analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}