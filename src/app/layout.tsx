import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import PageTransition from "@/components/transitions/PageTransition";

export const metadata: Metadata = {
  title: "ATARES - Advanced Skin Analysis",
  description: "AI-powered skin analysis and expert system recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <PageTransition>
          <main className="container">
            {children}
          </main>
        </PageTransition>
      </body>
    </html>
  );
}
