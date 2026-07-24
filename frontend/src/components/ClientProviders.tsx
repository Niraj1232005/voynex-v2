'use client';
import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ToastProvider } from '@/contexts/ToastContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GPTChatbot from '@/components/GPTChatbot';
import AuthModal from '@/components/AuthModal';
import { usePathname } from 'next/navigation';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardLayout = pathname?.startsWith('/admin') || pathname?.startsWith('/agency');

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <div className="flex min-h-screen flex-col">
              {!isDashboardLayout && <Header />}
              <main className="flex-1">{children}</main>
              {!isDashboardLayout && <Footer />}
            </div>
            <GPTChatbot />
            <AuthModal />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
