'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { useState } from 'react';

export default function Topbar() {
  const { rates, isLive, displayCurrency, setDisplayCurrency } = useCurrencyStore();
  const { currentUser, logout, can } = useAuthStore();
  const { teklifler } = useAppStore();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);

  // 2+ gündür bekleyen teklifler
  const twoDayTeklifler = teklifler.filter(t => {
    if (t.durum !== 'Bekliyor') return false;
    // eslint-disable-next-line react-hooks/purity
    const diff = (Date.now() - new Date(t.tarih).getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 2;
  });

  // Tüm bekleyen teklifler
  const pendingTeklifler = teklifler.filter(t => t.durum === 'Bekliyor');

  // Bildirimler
  const notifications = [
    ...twoDayTeklifler.map(t => ({
      id: t.id,
      type: 'urgent' as const,
      title: '⚠️ Teklif beklemede!',
      body: `${(t as { musteriAd?: string, cariUnvan?: string }).musteriAd || t.cariUnvan || 'Müşteri'} teklifinin yanıt verilmesi gerekiyor (2+ gün)`,
      href: '/teklifler',
      time: new Date(t.tarih).toLocaleDateString('tr-TR'),
    })),
    ...pendingTeklifler.slice(0, 3).filter(t => {
      // eslint-disable-next-line react-hooks/purity
      const diff = (Date.now() - new Date(t.tarih).getTime()) / (1000 * 60 * 60 * 24);
      return diff < 2;
    }).map(t => ({
      id: t.id + '-pending',
      type: 'info' as const,
      title: '📋 Yeni teklif',
      body: `${(t as { musteriAd?: string, cariUnvan?: string }).musteriAd || t.cariUnvan || 'Müşteri'} için teklif beklemede`,
      href: '/teklifler',
      time: new Date(t.tarih).toLocaleDateString('tr-TR'),
    })),
  ];

  const totalNotif = notifications.length;

  const handleLogout = () => {
    logout();
    router.replace('/auth/login');
  };

  return (
    <header className="topbar">
      {/* Döviz Kurları */}
      <div className="rate-group">
        {[
          { cur: 'USD', val: rates.USD },
          { cur: 'EUR', val: rates.EUR },
          { cur: 'GBP', val: rates.GBP },
        ].map(r => (
          <div key={r.cur} className="rate-pill" title={isLive ? 'Canlı veri' : 'Sabit veri'}>
            <span className="rate-cur">{r.cur}</span>
            <span className="rate-val">{typeof r.val === 'number' ? r.val.toFixed(2) : '—'}</span>
            <i className="bx bx-trending-up rate-up" style={{ fontSize: '0.9rem' }} />
          </div>
        ))}
        {isLive && (
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-success)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Canlı
          </span>
        )}
      </div>

      {/* Sağ Taraf */}
      <div className="topbar-right">
        {/* Para Birimi Toggle */}
        <div className="cur-toggle">
          {(['USD', 'EUR', 'TRY'] as const).map((cur) => (
            <button
              key={cur}
              className={`cur-btn ${displayCurrency === cur ? 'active' : ''}`}
              onClick={() => setDisplayCurrency(cur)}
            >
              {cur === 'USD' ? '$ Dolar' : cur === 'EUR' ? '€ Euro' : '₺ TL'}
            </button>
          ))}
        </div>

        {/* Hızlı Borçlular */}
        <Link href="/borclular" className="topbar-btn" title="Borçlular & Alacaklılar (Hızlı Takip)" style={{ color: '#10b981' }}>
          <i className="bx bx-list-check" />
        </Link>

        {/* Yeni Teklif */}
        <Link href="/teklifler/yeni" className="topbar-btn" title="Yeni Teklif">
          <i className="bx bx-file-blank" />
        </Link>

        {/* Bildirim Butonu */}
        <div style={{ position: 'relative' }}>
          <button
            className="topbar-btn"
            title={`${totalNotif} bildirim`}
            onClick={() => setNotifOpen(v => !v)}
            style={{ position: 'relative' }}
          >
            <i className={`bx ${totalNotif > 0 ? 'bx-bell bx-tada' : 'bx-bell'}`} />
            {totalNotif > 0 && (
              <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 16, height: 16, borderRadius: '50%',
                background: '#ef4444', color: '#fff',
                fontSize: '0.62rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--bg-main)',
                lineHeight: 1,
              }}>
                {totalNotif > 9 ? '9+' : totalNotif}
              </span>
            )}
          </button>

          {/* Bildirim Paneli */}
          {notifOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 49 }}
                onClick={() => setNotifOpen(false)}
              />
              <div style={{
                position: 'absolute', top: '110%', right: 0,
                width: 340, zIndex: 50,
                background: 'rgba(10,17,40,0.97)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(20px)',
                overflow: 'hidden',
              }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>🔔 Bildirimler</span>
                  {totalNotif > 0 && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{totalNotif} yeni</span>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: '28px 18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <i className="bx bx-check-circle" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />
                    Tüm teklifler yanıtlandı 🎉
                  </div>
                ) : (
                  notifications.map(n => (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => setNotifOpen(false)}
                      style={{
                        display: 'block', padding: '12px 18px',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        textDecoration: 'none',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}
                    >
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: 3,
                      }}>
                        <span style={{
                          fontWeight: 700, fontSize: '0.82rem',
                          color: n.type === 'urgent' ? '#f59e0b' : 'var(--text-primary)',
                        }}>
                          {n.title}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.time}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {n.body}
                      </div>
                    </Link>
                  ))
                )}
                <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border)' }}>
                  <Link
                    href="/teklifler"
                    onClick={() => setNotifOpen(false)}
                    style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', textDecoration: 'none' }}
                  >
                    Tüm tekliflere git →
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Kullanıcı Bilgisi + Çıkış */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px' }}>
          <span style={{
            fontSize: '1.15rem',
            background: currentUser?.role === 'admin' ? 'rgba(245,158,11,0.15)'
              : currentUser?.role === 'yonetici' ? 'rgba(16,185,129,0.15)'
              : 'rgba(59,130,246,0.15)',
            width: 34, height: 34, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {currentUser?.avatar ?? '🛡️'}
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'none' }}
            className="topbar-username">
            {currentUser?.displayName}
          </span>
        </div>

        {/* Admin Paneli Linki (sadece admin) */}
        {can('canViewAdmin') && (
          <Link href="/admin" className="topbar-btn" title="Admin Paneli" style={{ color: '#f59e0b' }}>
            <i className="bx bx-shield-quarter" />
          </Link>
        )}

        {/* Çıkış */}
        <button className="topbar-btn" title="Çıkış Yap" onClick={handleLogout}>
          <i className="bx bx-power-off" />
        </button>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media (min-width: 768px) { .topbar-username { display: block !important; } }
        @media (max-width: 768px) {
          .topbar {
            padding: 0 12px 0 54px !important;
            height: 58px !important;
            min-height: 58px !important;
          }
          .rate-group {
            display: none !important;
          }
          .topbar-right {
            gap: 5px !important;
          }
          .cur-toggle button {
            padding: 4px 6px !important;
            font-size: 0.72rem !important;
          }
        }
      `}</style>
    </header>
  );
}
