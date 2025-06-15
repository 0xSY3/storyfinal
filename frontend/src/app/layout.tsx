import './globals.css';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import Providers from './providers';
import LayoutWrapper from './LayoutWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Story Protocol - Digital Content Licensing Platform',
  description: 'The first decentralized marketplace for licensing digital content. Create, protect, and monetize your intellectual property with blockchain technology.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ backgroundColor: '#0a0a0a' }}>
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}