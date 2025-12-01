// src/app/api/history/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token!, process.env.JWT_SECRET!) as { userId: string };

    const analyses = await prisma.analysis.findMany({
      where: { userId: decoded.userId },
      orderBy: { id: 'desc' },
    });

    return NextResponse.json({ analyses });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load history' }, { status: 500 });
  }
}