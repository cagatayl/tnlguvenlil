'use client';

import AppShell from '@/components/layout/AppShell';
import RoleGuard from '@/components/RoleGuard';
import { useAppStore } from '@/store/useAppStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import Link from 'next/link';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement);

function StatCard({ label, valuePrimary, valueSecondary, iconClass, colorClass }: any) {
  return (
    <div className="glass-card stat-card">
      <div className={`stat-icon ${colorClass}`}><i className={`bx ${iconClass}`} /></div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value-primary">{valuePrimary}</div>
        <div className="stat-value-secondary">{valueSecondary}</div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { ticari_urunler, bizim_malzemeler, teklifler, yapilacaklar, faturalar, cariler, cekler, toggleYapilacak } = useAppStore();
  const { convert, format } = useCurrencyStore();
  const { can } = useAuthStore();

  // Gerçek verilerden hesaplama
  const onayliTeklifler = teklifler.filter(t => t.durum === 'Onaylandı');
  const bekleyenTeklifler = teklifler.filter(t => t.durum === 'Bekliyor');
  const toplamSatisUSD = onayliTeklifler.reduce((acc, t) => acc + convert(t.tutarDoviz || 0, t.doviz || 'USD', 'USD'), 0);

  const stokDegeriUSD = ticari_urunler.reduce(
    (acc, u) => acc + u.alisFiyati * ((u.toptanciStok || 0) + (u.bayiStok || 0)), 0
  );
  const zayiatTRY = bizim_malzemeler.reduce((acc, u) => acc + (u.zayiatMaliyeti || 0), 0);

  // Piyasa alacağı (ödenmemiş satış faturaları)
  const alacakTRY = faturalar
    .filter(f => f.tip === 'Satış' && f.durum !== 'Ödendi')
    .reduce((acc, f) => acc + convert(f.tutar, f.doviz, 'TRY'), 0);

  const pendingTasks = yapilacaklar.filter(t => !t.tamamlandi);

  // Kategori dağılımı için doughnut
  const catCounts: Record<string, number> = {};
  ticari_urunler.forEach(u => {
    const cat = u.anaKategori || 'Diğer';
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  });
  const topCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 7);

  const doughnutData = {
    labels: topCats.map(([k]) => k),
    datasets: [{
      data: topCats.map(([, v]) => v),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'],
      borderWidth: 0,
    }],
  };

  // Teklif durumları
  const teklifData = {
    labels: ['Bekliyor', 'Onaylandı', 'Reddedildi', 'İptal'],
    datasets: [{
      data: [
        teklifler.filter(t => t.durum === 'Bekliyor').length,
        teklifler.filter(t => t.durum === 'Onaylandı').length,
        teklifler.filter(t => t.durum === 'Reddedildi').length,
        teklifler.filter(t => t.durum === 'İptal').length,
      ],
      backgroundColor: ['#f59e0b', '#10b981', '#ef4444', '#6b7280'],
      borderWidth: 0,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#8a9bc5', font: { family: 'Inter', size: 11 }, boxWidth: 12 } },
    },
  };

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1 className="page-title">İstatistik & Yönetim Merkezi</h1>
          <p className="page-subtitle">Gerçek zamanlı finansal durum, stok ve görev özeti</p>
        </div>
        <Link href="/teklifler/yeni" className="btn btn-primary">
          <i className="bx bx-plus" /> Hızlı Teklif
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          label="Onaylı Satışlar (USD)"
          valuePrimary={can('canViewPrices') ? format(toplamSatisUSD, 'USD') : '*** (Gizli)'}
          valueSecondary={can('canViewPrices') ? format(convert(toplamSatisUSD, 'USD', 'TRY'), 'TRY') : 'Fiyat yetkisi gereklidir'}
          iconClass="bx-cart-alt"
          colorClass="blue"
        />
        <StatCard
          label="Piyasa Alacağı"
          valuePrimary={can('canViewPrices') ? format(alacakTRY, 'TRY') : '*** (Gizli)'}
          valueSecondary={`${faturalar.filter(f => f.tip === 'Satış' && f.durum !== 'Ödendi').length} ödenmemiş fatura`}
          iconClass="bx-wallet-alt"
          colorClass="green"
        />
        <StatCard
          label="Ticari Stok Değeri"
          valuePrimary={can('canViewPrices') ? format(stokDegeriUSD, 'USD') : '*** (Gizli)'}
          valueSecondary={`${ticari_urunler.length} ürün çeşidi`}
          iconClass="bx-package"
          colorClass="amber"
        />
        <StatCard
          label="Toplam Zayiat"
          valuePrimary={can('canViewPrices') ? format(zayiatTRY, 'TRY') : '*** (Gizli)'}
          valueSecondary={`${bizim_malzemeler.reduce((a, b) => a + b.kayipZayiatAdet, 0)} adet kayıp`}
          iconClass="bx-error-circle"
          colorClass="red"
        />
      </div>

      {/* İkinci satır: özet kartlar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 24 }}>
        {[
          { label: 'Toplam Teklif', val: teklifler.length, sub: `${bekleyenTeklifler.length} bekliyor`, icon: 'bx-file', color: '#3b82f6' },
          { label: 'Aktif Cari', val: cariler.length, sub: `${cariler.filter(c => c.tip === 'Müşteri').length} müşteri`, icon: 'bx-group', color: '#10b981' },
          { label: 'Çek/Senet', val: cekler.length, sub: `${cekler.filter(c => c.durum === 'Bekliyor').length} bekliyor`, icon: 'bx-credit-card', color: '#f59e0b' },
          { label: 'Bekleyen Görev', val: pendingTasks.length, sub: `${yapilacaklar.filter(t => t.aciliyet?.includes('Acil')).length} acil`, icon: 'bx-task', color: '#8b5cf6' },
        ].map((item, i) => (
          <div key={i} className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${item.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={`bx ${item.icon}`} style={{ color: item.color, fontSize: '1.4rem' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: item.color, lineHeight: 1.2 }}>{item.val}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Grafikler + Todo */}
      <div className="dashboard-grid">
        {/* Sol: Grafikler */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="glass-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 600, fontSize: '0.95rem' }}>Ürün Kategori Dağılımı</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ticari_urunler.length} ürün</span>
            </div>
            <div style={{ height: 200, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'center' }}>
              <div style={{ height: 200 }}>
                <Doughnut data={doughnutData} options={{ ...chartOptions, cutout: '65%' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {topCats.map(([cat, count], i) => (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: doughnutData.datasets[0].backgroundColor[i], flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 600, fontSize: '0.95rem' }}>Teklif Durumu Dağılımı</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{teklifler.length} toplam</span>
            </div>
            {teklifler.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30, fontSize: '0.85rem' }}>
                Henüz teklif yok. <Link href="/teklifler/yeni" style={{ color: 'var(--accent-primary)' }}>İlk teklifi oluştur →</Link>
              </div>
            ) : (
              <div style={{ height: 150 }}>
                <Doughnut data={teklifData} options={{ ...chartOptions, cutout: '60%' }} />
              </div>
            )}
          </div>
        </div>

        {/* Sağ: Yapılacaklar */}
        <div className="glass-card todo-card">
          <div className="todo-header">
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              Haftalık İş & Şantiye Takibi
            </span>
            <Link href="/planlama" className="btn btn-primary btn-sm">
              <i className="bx bx-plus" /> Ekle
            </Link>
          </div>

          {pendingTasks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: 24 }}>
              🎉 Bekleyen görev yok!
            </p>
          ) : (
            pendingTasks.slice(0, 8).map(t => (
              <div key={t.id} className="todo-item">
                <input type="checkbox" className="todo-check" checked={t.tamamlandi} onChange={() => toggleYapilacak(t.id)} />
                <div>
                  <div className={`todo-title ${t.tamamlandi ? 'done' : ''}`}>{t.baslik}</div>
                  <div className="todo-meta">
                    {t.tarih && <span><i className="bx bx-calendar" /> {t.tarih}</span>}
                    {t.atanan && <span><i className="bx bx-user" /> {t.atanan}</span>}
                    <span className={`badge ${t.aciliyet?.includes('Acil') ? 'badge-red' : 'badge-yellow'}`} style={{ fontSize: '0.68rem' }}>
                      {t.aciliyet}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Hızlı Özet */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Hızlı Erişim
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link href="/teklifler/yeni" className="btn btn-primary btn-sm"><i className="bx bx-file" /> Teklif</Link>
              <Link href="/cariler" className="btn btn-secondary btn-sm"><i className="bx bx-group" /> Cariler</Link>
              <Link href="/stok/ticari" className="btn btn-secondary btn-sm"><i className="bx bx-package" /> Stok</Link>
              <Link href="/faturalar" className="btn btn-secondary btn-sm"><i className="bx bx-receipt" /> Fatura</Link>
            </div>
            </div>
          </div>
        </div>
    </AppShell>
  );
}

export default function DashboardPageWithGuard() {
  return (
    <RoleGuard permission="canViewDashboard">
      <DashboardPage />
    </RoleGuard>
  );
}
