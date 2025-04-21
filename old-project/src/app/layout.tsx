import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { DatabaseService } from '@/services/database.service';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Podplai Studio',
  description: 'AI-powered podcast platform',
};

// Initialize the database when the server starts
if (typeof window === 'undefined') {
  const dbService = DatabaseService.getInstance();
  dbService.initialize().catch(console.error);
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-black dark:text-white transition-colors`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
