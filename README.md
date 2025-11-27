This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

npm install

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# 🚀 BACKEND SETUP & SECURITY 
Project ini menggunakan **Next.js Route Handlers** untuk semua logika backend, dengan **Prisma** sebagai ORM dan **PostgreSQL** sebagai database.

# Database Connection (Wajib)
# Ganti user:password dengan kredensial PostgreSQL Anda
DATABASE_URL="postgresql://postgres:password@localhost:5432/ataresdb?schema=public"

# Keamanan JWT (Wajib)
# Kunci rahasia untuk enkripsi/dekripsi token
JWT_SECRET="YOUR_LONG_RANDOM_SECRET_KEY_HERE"

# Downgrade ke Prisma v6 (untuk menghindari error v7)
npm install prisma@6.0.0 @prisma/client@6.0.0 

# Instal library backend
npm install jsonwebtoken bcryptjs zod
npm install -D @types/jsonwebtoken @types/bcryptjs

# 1. Jalankan migrasi dan buat tabel (User, Analysis, ChatSession)
npx prisma migrate dev --name init_atares_db

# 2. Generate Prisma Client untuk kode TypeScript
npx prisma generate

