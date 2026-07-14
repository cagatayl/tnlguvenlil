'use client';

import AppShell from '@/components/layout/AppShell';
import { useEkapStore, Ihale } from '@/store/useEkapStore';
import { useState, useEffect } from 'react';

export default function EkapPage() {
  const { ihaleler, isLoading, lastUpdate, fetchIhaleler } = useEkapStore();
  const [filterIl, setFilterIl] = useState('Tümü');
  const [filterKategori, setFilterKategori] = useState('Tümü');

  useEffect(() => {
    if (ihaleler.length === 0 && !isLoading) {
      fetchIhaleler();
    }
  }, []);

  const iller = ['Tümü', ...new Set(ihaleler.map(i => i.il))].sort();
  const kategoriler = ['Tümü', ...new Set(ihaleler.map(i => i.kategori))].sort();

  const filtered = ihaleler.filter(i => {
    if (filterIl !== 'Tümü' && i.il !== filterIl) return false;
    if (filterKategori !== 'Tümü' && i.kategori !== filterKategori) return false;
    return true;
  });

  return (
    <AppShell>
      <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="bx bx-buildings" style={{ color: 'var(--accent-primary)', fontSize: 32 }} />
            EKAP İhale Takip Sistemi
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Doğu ve Güneydoğu Anadolu bölgesindeki güncel güvenlik ve alarm ihaleleri
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {lastUpdate && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Son Güncelleme: <strong style={{ color: 'var(--text-primary)' }}>{new Date(lastUpdate).toLocaleString('tr-TR')}</strong>
            </span>
          )}
          <button 
            className="btn btn-outline-danger" 
            onClick={() => useEkapStore.getState().setIhaleler([])}
            style={{ padding: '10px 20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, borderColor: '#ef4444', color: '#ef4444' }}
          >
            <i className="bx bx-trash" style={{ fontSize: 20 }} /> 
            Listeyi Sıfırla
          </button>
          
          <button 
            className="btn btn-primary" 
            onClick={() => fetchIhaleler()} 
            disabled={isLoading}
            style={{ padding: '10px 20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
          >
            <i className={`bx ${isLoading ? 'bx-loader-alt bx-spin' : 'bx-radar'}`} style={{ fontSize: 20 }} /> 
            {isLoading ? 'Proxy ile Taranıyor...' : 'Proxy ile EKAP Taraması'}
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Şehir:</span>
          <select 
            className="form-select" 
            value={filterIl} 
            onChange={e => setFilterIl(e.target.value)}
            style={{ width: 160 }}
          >
            {iller.map(il => <option key={il} value={il}>{il}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Kategori:</span>
          <select 
            className="form-select" 
            value={filterKategori} 
            onChange={e => setFilterKategori(e.target.value)}
            style={{ width: 160 }}
          >
            {kategoriler.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Toplam <strong>{filtered.length}</strong> ihale bulunuyor.
        </div>
      </div>

      <div className="glass-card table-card">
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>İhale Adı & Kurum</th>
              <th>Şehir</th>
              <th>Kategori</th>
              <th>İhale Tarihi</th>
              <th>Son Başvuru</th>
              <th style={{ textAlign: 'right' }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && ihaleler.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 32, marginBottom: 10, color: 'var(--accent-primary)' }} />
                  <div>Güncel ihaleler taranıyor, lütfen bekleyin...</div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  Arama kriterlerinize uygun açık ihale bulunamadı.
                </td>
              </tr>
            ) : (
              filtered.map(ihale => (
                <tr key={ihale.id}>
                  <td data-label="İhale Adı" style={{ maxWidth: 300 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.4 }}>
                      {ihale.baslik}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                      <i className="bx bxs-institution" style={{ marginRight: 4 }} />
                      {ihale.kurum}
                    </div>
                  </td>
                  <td data-label="Şehir">
                    <span className="badge badge-gray" style={{ fontSize: '0.75rem' }}>{ihale.il}</span>
                  </td>
                  <td data-label="Kategori">
                    <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>{ihale.kategori}</span>
                  </td>
                  <td data-label="İhale Tarihi" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {ihale.tarih}
                  </td>
                  <td data-label="Son Başvuru" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444' }}>
                    {ihale.sonTarih}
                  </td>
                  <td data-label="İşlem" style={{ textAlign: 'right' }}>
                    <a 
                      href={ihale.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-sm btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    >
                      İlana Git <i className="bx bx-link-external" style={{ marginLeft: 4 }} />
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
