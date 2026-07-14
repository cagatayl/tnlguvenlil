'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const store = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!store.isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    if (pathname.startsWith('/admin') && !store.can('canViewAdmin')) {
      router.replace('/dashboard');
      return;
    }

    store.logActivity(`${pathname} sayfasını ziyaret etti`, pathname);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, store.isAuthenticated, pathname]);


  if (!hydrated) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#060b18', flexDirection: 'column', gap: 16
      }}>
        <div style={{
          width: 40, height: 40, border: '3px solid rgba(59,130,246,0.2)',
          borderTopColor: '#3b82f6', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
          Sistem yükleniyor...
        </span>
      </div>
    );
  }

  if (!store.isAuthenticated) return null;

  return <>{children}</>;
}

export function LockedPage({ message = 'Bu sayfaya erişim yetkiniz yok.' }: { message?: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '60vh', gap: 16,
      textAlign: 'center', padding: 32,
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'rgba(239,68,68,0.08)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        border: '2px solid rgba(239,68,68,0.2)',
      }}>
        <i className="bx bx-lock" style={{ fontSize: 36, color: '#ef4444' }} />
      </div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
        🔒 Kilitli Sayfa
      </h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: 380, margin: 0 }}>{message}</p>
    </div>
  );
}

export function useAuth() {
  return useAuthStore();
}
