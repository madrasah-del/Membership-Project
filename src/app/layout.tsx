import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Epsom & Ewell Islamic Society',
  description: 'Official Membership Portal for the Epsom & Ewell Islamic Society',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased bg-slate-50 text-slate-900 selection:bg-brand-200 selection:text-brand-900 min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
