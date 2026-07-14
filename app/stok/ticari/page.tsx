'use client';

import AppShell from '@/components/layout/AppShell';
import { useAppStore } from '@/store/useAppStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useState, useMemo } from 'react';
import type { TicariUrun } from '@/types';

const PLACEHOLDER = '/placeholder-product.png';

const KDV_ORAN = 1.20; // %20 KDV

// ─── Ürün Düzenleme Modal ────────────────────────────────────────────────────
function UrunDuzenleModal({
  urun,
  onClose,
  onSave,
}: {
  urun: TicariUrun;
  onClose: () => void;
  onSave: (id: string, data: Partial<TicariUrun>) => void;
}) {
  const [form, setForm] = useState({
    ad: urun.ad ?? '',
    marka: urun.marka ?? '',
    anaKategori: urun.anaKategori ?? '',
    alisFiyati: String(urun.alisFiyati ?? 0),
    doviz: urun.doviz ?? ('USD' as 'USD' | 'EUR' | 'TRY'),
    toptanciStok: String(urun.toptanciStok ?? 0),
    bayiStok: String(urun.bayiStok ?? 0),
    aciklama: urun.aciklama ?? '',
  });

  const handleSave = () => {
    onSave(urun.id, {
      ad: form.ad,
      marka: form.marka,
      anaKategori: form.anaKategori,
      aciklama: form.aciklama,
      doviz: form.doviz,
      alisFiyati: parseFloat(form.alisFiyati) || 0,
      toptanciStok: parseInt(form.toptanciStok) || 0,
      bayiStok: parseInt(form.bayiStok) || 0,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card modal"
        style={{ width: 520, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-title">✏️ Ürün Düzenle</span>
          <button className="modal-close" onClick={onClose}><i className="bx bx-x" /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Görsel + Stok Kodu */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <img
              src={urun.gorsel || PLACEHOLDER}
              onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
              style={{ width: 72, height: 72, objectFit: 'contain', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', padding: 6, flexShrink: 0 }}
              alt=""
            />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 3 }}>Stok Kodu (değiştirilemez)</div>
              <span className="mono-tag" style={{ fontSize: '0.85rem' }}>{urun.kod || urun.barkod || '—'}</span>
            </div>
          </div>

          {/* Form Alanları */}
          {([
            { label: 'Ürün Adı *', key: 'ad', type: 'text' },
            { label: 'Marka', key: 'marka', type: 'text' },
            { label: 'Kategori', key: 'anaKategori', type: 'text' },
          ] as const).map(f => (
            <div key={f.key} className="form-group">
              <label className="form-label">{f.label}</label>
              <input
                className="form-input"
                type={f.type}
                value={form[f.key]}
                onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
              />
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Alış Fiyatı</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                min="0"
                value={form.alisFiyati}
                onChange={e => setForm(v => ({ ...v, alisFiyati: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Para Birimi</label>
              <select
                className="form-input"
                value={form.doviz}
                onChange={e => setForm(v => ({ ...v, doviz: e.target.value as 'USD' | 'EUR' | 'TRY' }))}
              >
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="TRY">₺ TRY</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Toptan Stok</label>
              <input
                className="form-input"
                type="number"
                min="0"
                value={form.toptanciStok}
                onChange={e => setForm(v => ({ ...v, toptanciStok: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bayi Stok</label>
              <input
                className="form-input"
                type="number"
                min="0"
                value={form.bayiStok}
                onChange={e => setForm(v => ({ ...v, bayiStok: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Açıklama</label>
            <textarea
              className="form-input"
              rows={3}
              value={form.aciklama}
              onChange={e => setForm(v => ({ ...v, aciklama: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* KDV Hesaplama Önizleme */}
          <div style={{ background: 'rgba(59,130,246,0.06)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>📊 KDV Hesaplama Önizleme</div>
            <div style={{ display: 'flex', gap: 20, fontSize: '0.85rem' }}>
              <span>Alış: <strong>{Number(form.alisFiyati).toFixed(2)} {form.doviz}</strong></span>
              <span>+%20 KDV: <strong>{(Number(form.alisFiyati) * KDV_ORAN).toFixed(2)} {form.doviz}</strong></span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>İptal</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <i className="bx bx-save" /> Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────
export default function TicariStokPage() {
  const { ticari_urunler, deleteTicariUrun, updateTicariUrun } = useAppStore();
  const { convert, format, displayCurrency, setDisplayCurrency } = useCurrencyStore();
  const { can } = useAuthStore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [detayUrun, setDetayUrun] = useState<TicariUrun | null>(null);
  const [duzenleUrun, setDuzenleUrun] = useState<TicariUrun | null>(null);

  const categories = useMemo(
    () => [...new Set(ticari_urunler.map(u => u.anaKategori))].filter(Boolean).sort(),
    [ticari_urunler]
  );

  const filtered = useMemo(() => {
    let items = ticari_urunler;
    if (activeCategory !== 'all') items = items.filter(u => u.anaKategori === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(u =>
        u.ad?.toLowerCase().includes(q) ||
        u.kod?.toLowerCase().includes(q) ||
        u.barkod?.toLowerCase().includes(q) ||
        u.model?.toLowerCase().includes(q) ||
        u.marka?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [ticari_urunler, activeCategory, search]);

  const handleDelete = (id: string, ad: string) => {
    if (window.confirm(`"${ad}" ürününü silmek istediğinize emin misiniz?`)) {
      deleteTicariUrun(id);
    }
  };

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1 className="page-title">Ticari Satış Ürünleri</h1>
          <p className="page-subtitle">
            {filtered.length} / {ticari_urunler.length} ürün
            {activeCategory !== 'all' && <> — <strong style={{ color: 'var(--accent-primary)' }}>{activeCategory}</strong></>}
          </p>
        </div>
        <div className="header-actions">
          <div className="cur-toggle">
            {(['USD', 'EUR', 'TRY'] as const).map(cur => (
              <button
                key={cur}
                className={`cur-btn ${displayCurrency === cur ? 'active' : ''}`}
                onClick={() => setDisplayCurrency(cur)}
              >
                {cur === 'USD' ? '$ USD' : cur === 'EUR' ? '€ EUR' : '₺ TL'}
              </button>
            ))}
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => { setSearch(''); setActiveCategory('all'); }}
          >
            <i className="bx bx-reset" /> Sıfırla
          </button>
        </div>
      </div>

      <div className="stok-layout">
        {/* Kategori Sidebar */}
        <div className="glass-card cat-sidebar">
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Kategoriler
          </h3>
          <ul className="cat-list">
            <li
              className={`cat-item ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              <span>Tümü</span>
              <span className="cat-count">{ticari_urunler.length}</span>
            </li>
            {categories.map(cat => {
              const cnt = ticari_urunler.filter(u => u.anaKategori === cat).length;
              return (
                <li
                  key={cat}
                  className={`cat-item ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                  title={cat}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                    {cat}
                  </span>
                  <span className="cat-count">{cnt}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Ürün Tablosu */}
        <div className="glass-card table-card">
          {/* Arama */}
          <div className="table-toolbar">
            <div className="table-search">
              <i className="bx bx-search table-search-icon" />
              <input
                type="text"
                placeholder="Stok kodu, ürün adı, marka veya model..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {filtered.length} ürün
            </span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 52 }}>Görsel</th>
                  <th style={{ width: 110 }}>Stok Kodu</th>
                  <th style={{ width: 100 }}>Marka</th>
                  <th>Ürün Adı</th>
                  <th style={{ width: 80 }}>Stok</th>
                  {can('canViewPrices') && <th style={{ width: 120 }}>Alış ({displayCurrency})</th>}
                  {can('canViewPrices') && <th style={{ width: 140 }}>Alış + %20 KDV</th>}
                  <th style={{ width: 85, textAlign: 'center' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={can('canViewPrices') ? 8 : 6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px 20px' }}>
                      <i className="bx bx-package" style={{ fontSize: 40, display: 'block', marginBottom: 8 }} />
                      Ürün bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filtered.slice(0, 300).map(u => {
                    const alisRaw = convert(u.alisFiyati, u.doviz || 'USD', displayCurrency);
                    const alisKdvli = alisRaw * KDV_ORAN;
                    const urunLinki = u.urunLinki || '';

                    return (
                      <tr key={u.id}>
                        {/* Görsel */}
                        <td data-label="Görsel">
                          <div
                            onClick={() => urunLinki && window.open(urunLinki, '_blank')}
                            style={{ cursor: urunLinki ? 'pointer' : 'default' }}
                            title={urunLinki ? 'Ürün sayfasına git' : u.ad}
                          >
                            <img
                              src={u.gorsel || PLACEHOLDER}
                              className="product-thumb"
                              alt={u.ad}
                              onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                              style={{ transition: 'transform 0.2s' }}
                              onMouseEnter={e => { if (urunLinki) (e.target as HTMLImageElement).style.transform = 'scale(1.12)'; }}
                              onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = 'scale(1)'; }}
                            />
                          </div>
                        </td>

                        {/* Stok Kodu */}
                        <td data-label="Stok Kodu">
                          <span className="mono-tag" style={{ fontSize: '0.75rem' }}>
                            {u.kod || u.barkod || '—'}
                          </span>
                        </td>

                        {/* Marka + Kategori */}
                        <td data-label="Marka">
                          <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--accent-primary)' }}>
                            {u.marka || '—'}
                          </div>
                          <div style={{ marginTop: 3 }}>
                            <span className="badge badge-blue" style={{ fontSize: '0.62rem' }}>
                              {u.anaKategori?.length > 18 ? u.anaKategori.slice(0, 18) + '…' : u.anaKategori}
                            </span>
                          </div>
                        </td>

                        {/* Ürün Adı */}
                        <td data-label="Ürün Adı" style={{ maxWidth: 260 }}>
                          <div
                            style={{
                              fontWeight: 500, fontSize: '0.87rem', lineHeight: 1.4,
                              cursor: urunLinki ? 'pointer' : 'default',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}
                            title={u.ad}
                            onClick={() => urunLinki && window.open(urunLinki, '_blank')}
                          >
                            {u.ad}
                          </div>
                          {u.model && u.model !== u.ad && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                              {u.model.length > 55 ? u.model.slice(0, 55) + '…' : u.model}
                            </div>
                          )}
                        </td>

                        {/* Stok */}
                        <td data-label="Stok">
                          <div style={{ fontSize: '0.78rem', lineHeight: 1.6 }}>
                            <div>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Top: </span>
                              <strong>{(u.toptanciStok ?? 0) >= 999 ? '∞' : u.toptanciStok ?? 0}</strong>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Bay: </span>
                              <strong>{(u.bayiStok ?? 0) >= 999 ? '∞' : u.bayiStok ?? 0}</strong>
                            </div>
                          </div>
                        </td>

                        {/* Alış Fiyatı (KDV HARİÇ) */}
                        {can('canViewPrices') && (
                          <td data-label={`Alış (${displayCurrency})`} style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                            {format(alisRaw, displayCurrency)}
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>KDV hariç</div>
                          </td>
                        )}

                        {/* Alış + %20 KDV */}
                        {can('canViewPrices') && (
                          <td data-label="Alış +KDV" style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '0.9rem' }}>
                            {format(alisKdvli, displayCurrency)}
                            <div style={{ fontSize: '0.68rem', color: '#10b981' }}>+%20 KDV dahil</div>
                          </td>
                        )}

                        {/* İşlemler */}
                        <td data-label="İşlemler" style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                            {urunLinki && (
                              <a
                                href={urunLinki}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary btn-sm btn-icon"
                                title="Sitede Gör"
                              >
                                <i className="bx bx-link-external" />
                              </a>
                            )}
                            <button
                              className="btn btn-secondary btn-sm btn-icon"
                              title="Detay"
                              onClick={() => setDetayUrun(u)}
                            >
                              <i className="bx bx-show" />
                            </button>
                            <button
                              className="btn btn-primary btn-sm btn-icon"
                              title="Düzenle"
                              onClick={() => setDuzenleUrun(u)}
                            >
                              <i className="bx bx-edit" />
                            </button>
                            <button
                              className="btn btn-danger btn-sm btn-icon"
                              title="Sil"
                              onClick={() => handleDelete(u.id, u.ad)}
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

            {filtered.length > 300 && (
              <div style={{ padding: '10px 20px', color: 'var(--text-muted)', fontSize: '0.8rem', borderTop: '1px solid var(--border)' }}>
                <i className="bx bx-info-circle" /> {filtered.length - 300} ürün daha — arama yaparak daraltın
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detay Modal */}
      {detayUrun && (
        <div className="modal-overlay" onClick={() => setDetayUrun(null)}>
          <div
            className="glass-card modal"
            style={{ width: 520 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <span className="modal-title">📦 Ürün Detayı</span>
              <button className="modal-close" onClick={() => setDetayUrun(null)}><i className="bx bx-x" /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 18, marginBottom: 20 }}>
                <img
                  src={detayUrun.gorsel || PLACEHOLDER}
                  onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                  style={{ width: 110, height: 110, objectFit: 'contain', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', padding: 6, flexShrink: 0 }}
                  alt={detayUrun.ad}
                />
                <div>
                  <span className="mono-tag" style={{ fontSize: '0.75rem' }}>{detayUrun.kod || detayUrun.barkod}</span>
                  <span className="badge badge-blue" style={{ marginLeft: 6, fontSize: '0.68rem' }}>{detayUrun.anaKategori}</span>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: 8, lineHeight: 1.4 }}>{detayUrun.ad}</div>
                  <div style={{ color: 'var(--accent-primary)', fontSize: '0.82rem', marginTop: 4 }}>{detayUrun.marka}</div>
                  {detayUrun.urunLinki && (
                    <a href={detayUrun.urunLinki} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
                      <i className="bx bx-link-external" /> Hedefbayi.com
                    </a>
                  )}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Stok Kodu', value: detayUrun.kod || '—' },
                  { label: 'Marka', value: detayUrun.marka || '—' },
                  { label: `Alış (${displayCurrency}) KDV Hariç`, value: format(convert(detayUrun.alisFiyati, detayUrun.doviz || 'USD', displayCurrency), displayCurrency) },
                  { label: `Alış + %20 KDV`, value: format(convert(detayUrun.alisFiyati, detayUrun.doviz || 'USD', displayCurrency) * KDV_ORAN, displayCurrency) },
                  { label: 'Toptan Stok', value: (detayUrun.toptanciStok ?? 0) >= 999 ? 'Sınırsız' : String(detayUrun.toptanciStok ?? 0) },
                  { label: 'Bayi Stok', value: (detayUrun.bayiStok ?? 0) >= 999 ? 'Sınırsız' : String(detayUrun.bayiStok ?? 0) },
                ].map(item => (
                  <div key={item.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDetayUrun(null)}>Kapat</button>
              <button className="btn btn-primary" onClick={() => { setDuzenleUrun(detayUrun); setDetayUrun(null); }}>
                <i className="bx bx-edit" /> Düzenle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Düzenleme Modal */}
      {duzenleUrun && (
        <UrunDuzenleModal
          urun={duzenleUrun}
          onClose={() => setDuzenleUrun(null)}
          onSave={updateTicariUrun}
        />
      )}
    </AppShell>
  );
}
