'use client';

import AppShell from '@/components/layout/AppShell';
import { useAppStore } from '@/store/useAppStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

export default function TekliflerPage() {
  const { teklifler, cariler, updateTeklifDurum, deleteTeklif } = useAppStore();
  const { format, convert } = useCurrencyStore();
  const { can } = useAuthStore();

  const getCariBySId = (id: string) => cariler.find((c) => c.id === id);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1 className="page-title">Teklifler & Sipariş Yönetimi</h1>
          <p className="page-subtitle">Müşterilere sunulan teklifler ve sipariş onay süreçleri</p>
        </div>
        <Link href="/teklifler/yeni" className="btn btn-primary">
          <i className="bx bx-plus" /> Yeni Teklif Hazırla
        </Link>
      </div>

      <div className="glass-card table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Teklif No</th>
                <th>Tarih</th>
                <th>Cari (Müşteri)</th>
                <th>Ürün Sayısı</th>
                {can('canViewPrices') && <th>Tutar (Döviz)</th>}
                {can('canViewPrices') && <th>Tutar (TL)</th>}
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {teklifler.length === 0 ? (
                <tr>
                  <td colSpan={can('canViewPrices') ? 8 : 6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                    Henüz teklif yok.{' '}
                    <Link href="/teklifler/yeni" style={{ color: 'var(--accent-primary)' }}>
                      İlk teklifi oluştur →
                    </Link>
                  </td>
                </tr>
              ) : (
                teklifler.map((t) => {
                  const cari = getCariBySId(t.cariId);
                  const durumClass = {
                    'Bekliyor': 'badge-yellow',
                    'Onaylandı': 'badge-green',
                    'Reddedildi': 'badge-red',
                    'İptal': 'badge-gray',
                  }[t.durum] || 'badge-gray';
                  return (
                    <tr key={t.id}>
                      <td data-label="Teklif No"><strong style={{ fontFamily: 'monospace' }}>{t.id}</strong></td>
                      <td data-label="Tarih" style={{ color: 'var(--text-secondary)' }}>{t.tarih}</td>
                      <td data-label="Cari (Müşteri)">
                        <strong>{cari?.unvan || t.cariUnvan || '—'}</strong>
                        {cari?.yetkili && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cari.yetkili}</div>
                        )}
                      </td>
                      <td data-label="Ürün Sayısı" style={{ textAlign: 'center' }}>
                        <span className="badge badge-blue">{t.kalemler?.length || 0} ürün</span>
                      </td>
                      {can('canViewPrices') && <td data-label="Tutar (Döviz)" style={{ fontWeight: 600 }}>{format(t.tutarDoviz || 0, t.doviz || 'USD')}</td>}
                      {can('canViewPrices') && <td data-label="Tutar (TL)" style={{ color: 'var(--text-secondary)' }}>{format(t.tutarTRY || 0, 'TRY')}</td>}
                      <td data-label="Durum">
                        <select
                          className="form-select"
                          style={{
                            padding: '4px 24px 4px 10px',
                            fontSize: '0.75rem',
                            borderRadius: '6px',
                            background: t.durum === 'Onaylandı' ? 'rgba(16, 185, 129, 0.1)' :
                                      t.durum === 'Reddedildi' ? 'rgba(239, 68, 68, 0.1)' :
                                      t.durum === 'İptal' ? 'rgba(156, 163, 175, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: t.durum === 'Onaylandı' ? '#10b981' :
                                   t.durum === 'Reddedildi' ? '#ef4444' :
                                   t.durum === 'İptal' ? '#9ca3af' : '#f59e0b',
                            border: `1px solid ${t.durum === 'Onaylandı' ? 'rgba(16, 185, 129, 0.2)' :
                                                t.durum === 'Reddedildi' ? 'rgba(239, 68, 68, 0.2)' :
                                                t.durum === 'İptal' ? 'rgba(156, 163, 175, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          value={t.durum}
                          onChange={(e) => updateTeklifDurum(t.id, e.target.value as any)}
                        >
                          <option value="Bekliyor" style={{ color: '#000' }}>Bekliyor</option>
                          <option value="Onaylandı" style={{ color: '#000' }}>Onaylandı</option>
                          <option value="Reddedildi" style={{ color: '#000' }}>Reddedildi</option>
                          <option value="İptal" style={{ color: '#000' }}>İptal Edildi</option>
                        </select>
                      </td>
                      <td data-label="İşlemler">
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-success btn-sm btn-icon"
                            title="Yazdır / PDF"
                            onClick={() => window.print()}
                          >
                            <i className="bx bxs-file-pdf" />
                          </button>
                          <button
                            className="btn btn-danger btn-sm btn-icon"
                            title="Teklifi Sil"
                            onClick={() => {
                              if (confirm('Bu teklifi kalıcı olarak silmek istediğinize emin misiniz?')) {
                                deleteTeklif(t.id);
                              }
                            }}
                          >
                            <i className="bx bx-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
