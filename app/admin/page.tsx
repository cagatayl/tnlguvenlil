'use client';

import AppShell from '@/components/layout/AppShell';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { USERS } from '@/lib/auth';

// ─── Yardımcı bileşenler ───────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, color, onClick }: {
  label: string; value: string | number; sub?: string;
  icon: string; color: string; onClick?: () => void;
}) {
  return (
    <div
      className="glass-card stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s' }}
      onMouseEnter={e => onClick && ((e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)')}
      onMouseLeave={e => onClick && ((e.currentTarget as HTMLDivElement).style.transform = '')}
    >
      <div className={`stat-icon ${color}`}><i className={`bx ${icon}`} /></div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value-primary">{value}</div>
        {sub && <div className="stat-value-secondary">{sub}</div>}
      </div>
    </div>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { currentUser, can, activityLogs, userLocation, userLocationsMap } = useAuthStore();
  const { teklifler, ticari_urunler, cariler, faturalar, cekler, bizim_malzemeler, updateTeklifDurum } = useAppStore();
  const { format, convert } = useCurrencyStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'genel' | 'kullanicilar' | 'log' | 'sistem'>('genel');

  useEffect(() => {
    if (!can('canViewAdmin')) router.push('/dashboard');
  }, [can, router]);

  if (!can('canViewAdmin')) return null;

  // ─── İstatistikler ────────────────────────────────────────────────────────
  const now = Date.now();
  const twoDayTeklifler = teklifler.filter(t => {
    if (t.durum !== 'Bekliyor') return false;
    return (now - new Date(t.tarih).getTime()) / 86400000 >= 2;
  });
  const bekleyen = teklifler.filter(t => t.durum === 'Bekliyor');
  const onaylanan = teklifler.filter(t => t.durum === 'Onaylandı');
  const totalTRY = onaylanan.reduce((s, t) => s + (t.tutarTRY || 0), 0);
  const vadesiGelen = cekler.filter(c => {
    if (c.durum !== 'Bekliyor') return false;
    return new Date(c.vade) <= new Date(new Date().setDate(new Date().getDate() + 7));
  });

  return (
    <AppShell>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <i className="bx bx-shield-quarter" style={{ color: '#f59e0b', marginRight: 8 }} />
            Admin Yönetim Merkezi
          </h1>
          <p className="page-subtitle">
            Sistem yönetimi — Sadece <strong style={{ color: '#f59e0b' }}>{currentUser?.displayName}</strong> erişebilir
          </p>
        </div>
        <div className="header-actions">
          <div style={{
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 10, padding: '6px 14px', fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Admin Modu Aktif
          </div>
        </div>
      </div>

      {/* Kritik Uyarılar */}
      {(twoDayTeklifler.length > 0 || vadesiGelen.length > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {twoDayTeklifler.length > 0 && (
            <div style={{
              background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: 14,
            }}>
              <i className="bx bx-bell bx-tada" style={{ color: '#f59e0b', fontSize: '1.4rem', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>
                  ⚠️ {twoDayTeklifler.length} teklif 2+ gündür yanıtsız!
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {twoDayTeklifler.map(t => (
                    <span key={t.id} style={{ marginRight: 14 }}>
                      📋 {(t as any).musteriAd || t.cariUnvan || 'Müşteri'} —{' '}
                      {new Date(t.tarih).toLocaleDateString('tr-TR')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          {vadesiGelen.length > 0 && (
            <div style={{
              background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <i className="bx bx-error-circle" style={{ color: '#ef4444', fontSize: '1.4rem' }} />
              <div>
                <div style={{ fontWeight: 700, color: '#ef4444' }}>
                  🔴 {vadesiGelen.length} çekin vadesi 7 gün içinde doluyor!
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stat Kartları */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard label="Toplam Teklif" value={teklifler.length} sub={`${bekleyen.length} bekliyor`} icon="bx-file" color="blue" onClick={() => router.push('/teklifler')} />
        <StatCard label="Onaylanan Ciro" value={format(convert(totalTRY, 'TRY', 'TRY'), 'TRY')} sub={`${onaylanan.length} teklif`} icon="bx-trending-up" color="green" />
        <StatCard label="Ticari Ürünler" value={ticari_urunler.length} sub="hedefbayi.com" icon="bx-package" color="blue" onClick={() => router.push('/stok/ticari')} />
        <StatCard label="Cari Hesaplar" value={cariler.length} sub={`${faturalar.length} fatura`} icon="bx-group" color="amber" onClick={() => router.push('/cariler')} />
        <StatCard label="Çek Portföyü" value={cekler.length} sub={`${vadesiGelen.length} vade yakın`} icon="bx-money" color={vadesiGelen.length > 0 ? 'red' : 'green'} onClick={() => router.push('/faturalar')} />
        <StatCard label="Malzeme (Depo)" value={bizim_malzemeler.length} sub="kendi envanteri" icon="bx-wrench" color="amber" onClick={() => router.push('/stok/bizim')} />
      </div>

      {/* Tab Navigasyon */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {([
          { key: 'genel', label: '📊 Genel Bakış', icon: 'bx-grid-alt' },
          { key: 'kullanicilar', label: '👥 Kullanıcılar', icon: 'bx-user' },
          { key: 'log', label: '📋 Aktivite Logu', icon: 'bx-list-ul' },
          { key: 'sistem', label: '⚙️ Sistem', icon: 'bx-cog' },
        ] as const).map(t => (
          <button
            key={t.key}
            className={`cur-btn ${activeTab === t.key ? 'active' : ''}`}
            style={{ fontSize: '0.82rem', padding: '8px 16px' }}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── TAB: GENEL BAKIŞ ───────────────────────────────────────────────── */}
      {activeTab === 'genel' && (
        <div className="admin-grid">
          {/* Teklif Durum Grafiği */}
          <div className="glass-card" style={{ padding: '20px 22px' }}>
            <div className="admin-section-title">📈 Teklif Durumu</div>
            {[
              { label: 'Bekliyor', count: bekleyen.length, total: teklifler.length || 1, color: '#f59e0b' },
              { label: 'Onaylandı', count: onaylanan.length, total: teklifler.length || 1, color: '#10b981' },
              { label: 'Reddedildi', count: teklifler.filter(t => t.durum === 'Reddedildi').length, total: teklifler.length || 1, color: '#ef4444' },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: item.color }}>{item.count}</span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${Math.round(item.count / item.total * 100)}%`,
                    background: item.color, borderRadius: 8,
                    transition: 'width 0.8s ease', boxShadow: `0 0 8px ${item.color}60`,
                  }} />
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 3 }}>
                  %{Math.round(item.count / item.total * 100)}
                </div>
              </div>
            ))}

            {/* Son 5 teklif */}
            <div className="admin-section-title" style={{ marginTop: 20 }}>Son Teklifler</div>
            {teklifler.slice(-5).reverse().map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8rem' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{(t as any).musteriAd || t.cariUnvan || '—'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{new Date(t.tarih).toLocaleDateString('tr-TR')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>{format(t.tutarTRY || 0, 'TRY')}</div>
                  <span className={`badge badge-${t.durum === 'Onaylandı' ? 'green' : t.durum === 'Reddedildi' ? 'red' : 'amber'}`} style={{ fontSize: '0.62rem' }}>
                    {t.durum}
                  </span>
                </div>
              </div>
            ))}
            {teklifler.length === 0 && (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20, fontSize: '0.85rem' }}>Henüz teklif yok</div>
            )}
          </div>

          {/* Konum Paneli */}
          <div className="glass-card" style={{ padding: '20px 22px' }}>
            <div className="admin-section-title">📍 Kullanıcı Konumları</div>
            {USERS.map(user => {
              const isCurrentUser = user.id === currentUser?.id;
              const location = isCurrentUser ? userLocation : (userLocationsMap?.[user.id] || userLocationsMap?.[user.displayName] || null);
              const roleColor = user.role === 'admin' ? '#f59e0b' : user.role === 'yonetici' ? '#10b981' : '#3b82f6';
              return (
                <div key={user.id} style={{ marginBottom: 16, padding: '12px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ fontSize: '1.2rem' }}>{user.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{user.displayName}</div>
                      <div style={{ fontSize: '0.72rem', color: roleColor, fontWeight: 600 }}>
                        {user.role === 'admin' ? 'Admin' : user.role === 'yonetici' ? 'Yönetici' : 'Teknik Ekip'}
                      </div>
                    </div>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: isCurrentUser ? '#10b981' : '#4a5a7a',
                      boxShadow: isCurrentUser ? '0 0 6px #10b981' : 'none',
                    }} />
                  </div>
                  {location ? (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span>🌐 <strong style={{ color: 'var(--text-secondary)' }}>{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</strong></span>
                        <span>📏 ±{Math.round(location.accuracy)}m</span>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        🕐 Son Konum: {new Date(location.timestamp).toLocaleString('tr-TR')}
                      </div>
                      <a
                        href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.72rem', color: '#3b82f6', textDecoration: 'none', marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <i className="bx bx-map-pin" /> Google Haritada Aç ({isCurrentUser ? 'Benim Konumum' : `${user.displayName} Konumu`})
                      </a>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <i className="bx bx-map-pin" /> Henüz konum alınmadı — kullanıcının uygulamayı açması ve izin vermesi gerekir
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Teknik Ekip Teklifleri */}
          <div className="glass-card" style={{ padding: '20px 22px', gridColumn: '1 / -1' }}>
            <div className="admin-section-title">⚙️ Teknik Ekip Onay Bekleyen Teklifler</div>
            {(() => {
              const teknikTeklifler = teklifler.filter((t: any) => t.kategori === 'Teknik Ekip Teklif Onayları');
              if (teknikTeklifler.length === 0) {
                return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0', fontSize: '0.85rem' }}>Teknik ekipten bekleyen teklif yok ✅</div>;
              }
              return (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Teklif No</th><th>Oluşturan</th><th>Müşteri</th><th>Tarih</th><th>Tutar</th><th>Durum</th><th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teknikTeklifler.map((t: any) => (
                      <tr key={t.id}>
                        <td><span className="mono-tag">{t.id}</span></td>
                        <td>{t.olusturanKullanici || '—'}</td>
                        <td>{t.musteriAd || t.cariUnvan || '—'}</td>
                        <td>{new Date(t.tarih).toLocaleDateString('tr-TR')}</td>
                        <td style={{ fontWeight: 700 }}>{format(t.tutarTRY || 0, 'TRY')}</td>
                        <td><span className={`badge badge-${t.durum === 'Onaylandı' ? 'green' : 'amber'}`}>{t.durum}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-primary btn-sm" onClick={() => updateTeklifDurum(t.id, 'Onaylandı')}>Onayla</button>
                            <button className="btn btn-danger btn-sm" onClick={() => updateTeklifDurum(t.id, 'Reddedildi')}>Reddet</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}
          </div>
        </div>
      )}

      {/* ─── TAB: KULLANICILAR ────────────────────────────────────────────────── */}
      {activeTab === 'kullanicilar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {USERS.map(user => {
            const isCurrentUser = user.id === currentUser?.id;
            const roleColor = user.role === 'admin' ? '#f59e0b' : user.role === 'yonetici' ? '#10b981' : '#3b82f6';
            const roleLabel = user.role === 'admin' ? 'Sistem Yöneticisi' : user.role === 'yonetici' ? 'Yönetici' : 'Teknik Ekip';
            const perms = user.role === 'admin'
              ? ['Dashboard', 'Cariler', 'Faturalar', 'Admin Paneli', 'PDF', 'Teklif Onaylama']
              : user.role === 'yonetici'
              ? ['Dashboard', 'Cariler', 'Faturalar', 'PDF', 'Teklif Onaylama']
              : ['Teklif Oluşturma', 'Stok Görüntüleme'];
            return (
              <div key={user.id} className="glass-card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 14, fontSize: '1.8rem',
                    background: `${roleColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `2px solid ${roleColor}40`, flexShrink: 0,
                  }}>
                    {user.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{user.displayName}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>@{user.username}</div>
                    <div style={{ marginTop: 4 }}>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 700, color: roleColor,
                        background: `${roleColor}18`, padding: '3px 10px', borderRadius: 20,
                      }}>
                        {roleLabel}
                      </span>
                      {isCurrentUser && <span style={{ marginLeft: 8, fontSize: '0.7rem', color: '#10b981' }}>● Aktif Oturum</span>}
                    </div>
                  </div>
                  {/* Şifre (sadece admin kendisi görür) */}
                  <div style={{ textAlign: 'right', fontSize: '0.78rem' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Kullanıcı Adı</div>
                    <span className="mono-tag">{user.username}</span>
                  </div>
                </div>

                {/* İzinler */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>Yetkiler</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {['Dashboard', 'Cariler', 'Faturalar', 'Admin Paneli', 'PDF', 'Teklif Onaylama', 'Teklif Oluşturma', 'Stok Görüntüleme'].map(p => {
                      const hasIt = perms.includes(p);
                      return (
                        <span key={p} style={{
                          fontSize: '0.7rem', padding: '3px 10px', borderRadius: 6,
                          background: hasIt ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.06)',
                          border: `1px solid ${hasIt ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.15)'}`,
                          color: hasIt ? '#10b981' : '#6b7280',
                        }}>
                          {hasIt ? '✓' : '✗'} {p}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Son aktivite */}
                {(() => {
                  const userLogs = activityLogs.filter(l => l.userId === user.id);
                  const last = userLogs[0];
                  if (!last) return null;
                  return (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                      <i className="bx bx-time" style={{ marginRight: 4 }} />
                      Son aktivite: <strong style={{ color: 'var(--text-secondary)' }}>{last.action}</strong> — {new Date(last.timestamp).toLocaleString('tr-TR')}
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── TAB: AKTİVİTE LOGU ──────────────────────────────────────────────── */}
      {activeTab === 'log' && (
        <div className="glass-card" style={{ padding: '20px 22px' }}>
          <div className="admin-section-title">
            📋 Tüm Aktivite Kayıtları ({activityLogs.length})
          </div>
          {activityLogs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>Henüz aktivite yok</div>
          ) : (
            <div className="activity-log">
              {activityLogs.map(log => {
                const user = USERS.find(u => u.id === log.userId);
                const roleColor = user?.role === 'admin' ? '#f59e0b' : user?.role === 'yonetici' ? '#10b981' : '#3b82f6';
                return (
                  <div key={log.id} className="activity-item">
                    <div style={{ fontSize: '1.1rem', flexShrink: 0 }}>{user?.avatar ?? '👤'}</div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600, color: roleColor }}>{log.displayName}</span>
                      <span style={{ color: 'var(--text-secondary)', marginLeft: 6, fontSize: '0.82rem' }}>{log.action}</span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        📍 {log.page}
                      </div>
                    </div>
                    <div className="activity-time">
                      {new Date(log.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      <br />
                      <span style={{ color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: SİSTEM ─────────────────────────────────────────────────────── */}
      {activeTab === 'sistem' && (
        <div className="admin-grid">
          {/* Sistem Bilgileri */}
          <div className="glass-card" style={{ padding: '20px 22px' }}>
            <div className="admin-section-title">⚙️ Sistem Bilgileri</div>
            {[
              { label: 'Uygulama Versiyonu', value: 'v2.0.0' },
              { label: 'Veritabanı', value: 'LocalStorage (Browser)' },
              { label: 'Ticari Ürün Sayısı', value: ticari_urunler.length.toLocaleString('tr-TR') },
              { label: 'Cari Sayısı', value: cariler.length },
              { label: 'Fatura Sayısı', value: faturalar.length },
              { label: 'Çek Sayısı', value: cekler.length },
              { label: 'Aktivite Kaydı', value: activityLogs.length },
              { label: 'Oturum Anahtarı', value: 'TNL_AUTH_SESSION' },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem',
              }}>
                <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                <strong style={{ color: 'var(--text-secondary)' }}>{item.value}</strong>
              </div>
            ))}
          </div>

          {/* Hesap Bilgileri */}
          <div className="glass-card" style={{ padding: '20px 22px' }}>
            <div className="admin-section-title">🔑 Hesap Bilgileri (Gizli)</div>
            {[
              { user: '👑 Çağatay (Admin)', username: 'Lixeniorr2323', note: 'Tam yetki' },
              { user: '👩‍💼 Sevgi Taneli', username: 'sevgi', note: 'Finans + Teklif onayı' },
              { user: '🔧 Teknik Ekip', username: 'teknik', note: 'Yalnızca teklif oluşturma' },
            ].map(c => (
              <div key={c.user} style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: 10, marginBottom: 10 }}>
                <div style={{ fontWeight: 600, marginBottom: 4, fontSize: '0.88rem' }}>{c.user}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Kullanıcı adı:</span>
                  <span className="mono-tag">{c.username}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  <i className="bx bx-info-circle" /> {c.note}
                </div>
              </div>
            ))}

            <div style={{ marginTop: 20, padding: '14px', background: 'rgba(239,68,68,0.06)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.15)', fontSize: '0.78rem', color: '#f87171' }}>
              <i className="bx bx-shield-x" /> Şifreler yalnızca yetkili admin tarafından değiştirilebilir. Şifre değişikliği için geliştiriciye başvurun.
            </div>
          </div>

          {/* Hızlı Aksiyonlar */}
          <div className="glass-card" style={{ padding: '20px 22px', gridColumn: '1 / -1' }}>
            <div className="admin-section-title">⚡ Hızlı Aksiyonlar</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {[
                { label: '📊 İstatistik Merkezi', href: '/dashboard', color: '#3b82f6' },
                { label: '📋 Teklifler', href: '/teklifler', color: '#10b981' },
                { label: '👥 Cariler', href: '/cariler', color: '#f59e0b' },
                { label: '📦 Ticari Stok', href: '/stok/ticari', color: '#8b5cf6' },
                { label: '🔧 Bizim Stok', href: '/stok/bizim', color: '#06b6d4' },
                { label: '🗒️ Faturalar', href: '/faturalar', color: '#ec4899' },
              ].map(a => (
                <a
                  key={a.href}
                  href={a.href}
                  style={{
                    display: 'block', padding: '14px 18px',
                    background: `${a.color}10`, border: `1px solid ${a.color}30`,
                    borderRadius: 12, textDecoration: 'none',
                    color: a.color, fontWeight: 600, fontSize: '0.85rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = `${a.color}20`;
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = `${a.color}10`;
                    (e.currentTarget as HTMLAnchorElement).style.transform = '';
                  }}
                >
                  {a.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </AppShell>
  );
}
