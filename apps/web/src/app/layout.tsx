import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import ConvexClientProvider from './ConvexClientProvider';

const manrope = Manrope({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Motiion',
  description: 'Where professional dancers get hired.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={manrope.className}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
