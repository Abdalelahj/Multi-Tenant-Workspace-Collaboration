import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Reasonix — Workspace Collaboration',
  description:
    'Multi-tenant real-time workspace collaboration platform built with Next.js, NestJS, PostgreSQL (Neon), and Redis.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="h-full bg-gray-950 text-gray-100 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
