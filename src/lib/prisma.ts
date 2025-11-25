import { PrismaClient } from '@prisma/client';

// Tujuan: Membuat koneksi database tunggal (singleton)
// agar koneksi efisien dan tidak error di Next.js

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Gunakan instance global jika ada, atau buat yang baru.
const prisma = global.prisma || new PrismaClient();

// Penting: Hanya simpan di global saat development.
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// Ekspor konektor agar bisa dipakai oleh API Login dan Register
export default prisma;