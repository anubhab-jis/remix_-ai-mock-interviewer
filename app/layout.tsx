import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'MockAI.pro - Bento Engine',
  description: 'Realistic HR & Technical Interview Simulator',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="font-sans antialiased bg-[#0F172A] text-[#F8FAFC]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
