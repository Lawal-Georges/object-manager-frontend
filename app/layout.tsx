import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Object Manager - Gestionnaire d\'objets',
    description: 'Application de gestion d\'objets avec upload d\'images et temps réel',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body className={inter.className}>
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                    {children}
                </div>
            </body>
        </html>
    );
}