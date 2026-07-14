'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';

function NavItem({ href, icon, label, locked, badge }: {
  href: string; icon: string; label: string; locked?: boolean; badge?: number;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  if (locked) {
    return (
      <div className="nav-item nav-locked" title="Erişim kısıtlı">
        <i className={`bx ${icon} nav-icon`} />
        <span>{label}</span>
        <i className="bx bx-lock nav-lock-icon" />
      </div>
    );
  }

  return (
    <Link href={href} className={`nav-item ${isActive ? 'active' : ''}`}>
      <i className={`bx ${icon} nav-icon`} />
      <span>{label}</span>
      {badge ? <span className="nav-badge">{badge}</span> : null}
    </Link>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const { rates, setRates, isLive } = useCurrencyStore();
  const { currentUser, logout, can } = useAuthStore();
  const { teklifler } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Bekleyen teklifler sayısı
  const pendingTeklifler = teklifler.filter(t => t.durum === 'Bekliyor').length;
  // 2 gün bekleyen teklifler
  const twoDayOld = teklifler.filter(t => {
    if (t.durum !== 'Bekliyor') return false;
    // eslint-disable-next-line react-hooks/purity
    const diff = (Date.now() - new Date(t.tarih).getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 2;
  }).length;

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('/api/rates');
        const data = await res.json();
        if (data.USD) setRates({ USD: data.USD, EUR: data.EUR, GBP: data.GBP, TRY: 1 });
      } catch {}
    };
    fetchRates();
    const interval = setInterval(fetchRates, 300_000);
    return () => clearInterval(interval);
  }, [setRates]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const roleLabel = currentUser?.role === 'admin' ? 'Sistem Yöneticisi'
    : currentUser?.role === 'yonetici' ? 'Yönetici'
    : 'Teknik Ekip';

  const roleColor = currentUser?.role === 'admin' ? '#f59e0b'
    : currentUser?.role === 'yonetici' ? '#10b981'
    : '#3b82f6';

  return (
    <>
      {/* Mobil hamburger butonu */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Menü"
      >
        <i className={`bx ${mobileOpen ? 'bx-x' : 'bx-menu'}`} />
      </button>

      {/* Overlay (mobil) */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                <path d="M24 4L8 12V24C8 33.5 15.2 42.4 24 44C32.8 42.4 40 33.5 40 24V12L24 4Z" fill="url(#sg2)"/>
                <line x1="16" y1="20" x2="22" y2="20" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"/>
                <line x1="22" y1="20" x2="22" y2="24" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"/>
                <line x1="22" y1="24" x2="32" y2="24" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"/>
                <line x1="24" y1="28" x2="24" y2="32" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"/>
                <line x1="20" y1="28" x2="28" y2="28" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="22" cy="20" r="2.5" fill="#3b82f6"/>
                <circle cx="22" cy="24" r="2.5" fill="#f59e0b"/>
                <circle cx="24" cy="28" r="2.5" fill="#3b82f6"/>
                <defs>
                  <linearGradient id="sg2" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1e40af"/>
                    <stop offset="100%" stopColor="#0f172a"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.5px' }}>TNL</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '2.5px' }}>
                GÜVENLİK
              </div>
            </div>
          </div>

          {/* Döviz göstergesi */}
          <div className="sidebar-rates">
            <span className={`rate-dot ${isLive ? 'live' : ''}`} title={isLive ? 'Canlı kur' : 'Sabit kur'} />
            <span>$ {typeof rates.USD === 'object' ? (rates.USD as {satis?:number})?.satis?.toFixed(2) : rates.USD?.toFixed(2) ?? '—'}</span>
            <span>€ {typeof rates.EUR === 'object' ? (rates.EUR as {satis?:number})?.satis?.toFixed(2) : rates.EUR?.toFixed(2) ?? '—'}</span>
          </div>
        </div>

        <nav className="nav-scroll">
          {/* Dashboard */}
          {can('canViewDashboard')
            ? <NavItem href="/dashboard" icon="bx-grid-alt" label="İstatistik Merkezi" />
            : <NavItem href="/dashboard" icon="bx-grid-alt" label="İstatistik Merkezi" locked />
          }

          <div className="nav-section-title">STOK &amp; DEPO</div>
          <NavItem href="/stok/bizim" icon="bx-wrench" label="Bizim Malzemelerimiz" />
          <NavItem href="/stok/ticari" icon="bx-package" label="Ticari Ürünler" />

          <div className="nav-section-title">FİNANS &amp; SATIŞ</div>
          <NavItem
            href="/teklifler"
            icon="bx-file"
            label="Teklifler & Sipariş"
            badge={pendingTeklifler > 0 ? pendingTeklifler : undefined}
          />
          {can('canViewCariler')
            ? <NavItem href="/cariler" icon="bx-group" label="Cari Hesaplar" />
            : <NavItem href="/cariler" icon="bx-group" label="Cari Hesaplar" locked />
          }
          {can('canViewFaturalar')
            ? <NavItem href="/faturalar" icon="bx-receipt" label="Fatura & Çek Portföyü" />
            : <NavItem href="/faturalar" icon="bx-receipt" label="Fatura & Çek Portföyü" locked />
          }

          <div className="nav-section-title">AJANDA &amp; YÖNETİM</div>
          <NavItem href="/planlama" icon="bx-calendar" label="Planlama & Şantiye" />
          <NavItem href="/notlar" icon="bx-note" label="Yapışkan Notlar" />

          <div className="nav-section-title">İHALELER &amp; KAMU</div>
          <NavItem href="/ekap" icon="bx-buildings" label="EKAP İhaleleri" />

          {/* Admin paneli — sadece admin */}
          {can('canViewAdmin') && (
            <>
              <div className="nav-section-title">SİSTEM</div>
              <NavItem href="/admin" icon="bx-shield-quarter" label="Admin Paneli" />
            </>
          )}
        </nav>

        {/* Kullanıcı Kartı */}
        <div className="sidebar-footer">
          {/* 2 gün bekleyen teklif uyarısı */}
          {twoDayOld > 0 && (
            <Link href="/teklifler" className="sidebar-alert">
              <i className="bx bx-bell bx-tada" />
              <span>{twoDayOld} teklif 2+ gündür beklemede!</span>
            </Link>
          )}

          <div className="user-card">
            <div className="user-avatar-badge" style={{ background: roleColor }}>
              <span>{currentUser?.avatar ?? '👤'}</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="user-name">{currentUser?.displayName ?? 'Kullanıcı'}</div>
              <div className="user-role" style={{ color: roleColor }}>{roleLabel}</div>
            </div>
            <button
              onClick={handleLogout}
              className="logout-btn"
              title="Çıkış Yap"
            >
              <i className="bx bx-power-off" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
