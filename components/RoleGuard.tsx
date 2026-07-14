'use client';

import { useAuthStore } from '@/store/useAuthStore';
import type { Permission } from '@/lib/auth';

interface Props {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const DEFAULT_LOCKED = (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '60vh', gap: 18,
    textAlign: 'center', padding: 40,
  }}>
    <div style={{
      width: 96, height: 96, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(239,68,68,0.12), transparent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '2px solid rgba(239,68,68,0.15)',
      boxShadow: '0 0 40px rgba(239,68,68,0.08)',
    }}>
      <i className="bx bx-lock" style={{ fontSize: 44, color: '#ef4444' }} />
    </div>
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
        🔒 Yapımcı Tarafından Kilitlenmiştir
      </h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: 360, margin: '0 auto 16px', lineHeight: 1.6 }}>
        Bu bölüme erişim yetkiniz bulunmamaktadır. Yetki almak için sistem yöneticisi ile iletişime geçin.
      </p>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 10, padding: '8px 18px',
        fontSize: '0.82rem', color: '#f87171',
      }}>
        <i className="bx bx-shield-x" /> Erişim Kısıtlı
      </div>
    </div>
  </div>
);

export default function RoleGuard({ permission, fallback = DEFAULT_LOCKED, children }: Props) {
  const { can } = useAuthStore();

  if (!can(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
