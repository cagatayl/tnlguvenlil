'use client';

import AppShell from '@/components/layout/AppShell';
import RoleGuard from '@/components/RoleGuard';
import { useAppStore, INITIAL_HIZLI_BORCLULAR } from '@/store/useAppStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useState, useMemo, useEffect } from 'react';
import type { HizliBorclu } from '@/types';

export default function BorclularPage() {
  const { hizliBorclular = [], addHizliBorclu, updateHizliBorclu, deleteHizliBorclu } = useAppStore();
  const { format } = useCurrencyStore();

  // Otomatik yükleme (Eğer liste boşsa 42 öğeyi zorla yükle)
  useEffect(() => {
    if (hizliBorclular.length === 0) {
      INITIAL_HIZLI_BORCLULAR.forEach(item => {
        addHizliBorclu(item);
      });
    }
  }, [hizliBorclular.length, addHizliBorclu]);

  const [search, setSearch] = useState('');
  const [filterTip, setFilterTip] = useState<'ALL' | 'B' | 'A' | '-'>('ALL');
  const [filterDoviz, setFilterDoviz] = useState<'ALL' | 'TRY' | 'USD' | 'EUR'>('ALL');

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    ad: '',
    bakiye: 0,
    tip: 'B' as 'B' | 'A' | '-',
    doviz: 'TRY' as 'TRY' | 'USD' | 'EUR',
    not: '',
    telefon: '',
  });

  // Hızlı işlem (Tahsilat / Ödeme) modal state
  const [islemModal, setIslemModal] = useState<HizliBorclu | null>(null);
  const [islemTutar, setIslemTutar] = useState<number>(0);
  const [islemTip, setIslemTip] = useState<'TAHSILAT' | 'BORCLANDIR'>('TAHSILAT');

  // Filtrelenmiş liste
  const filteredList = useMemo(() => {
    return hizliBorclular.filter((item) => {
      if (filterTip !== 'ALL' && item.tip !== filterTip) return false;
      if (filterDoviz !== 'ALL' && item.doviz !== filterDoviz) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return item.ad.toLowerCase().includes(q) || (item.not && item.not.toLowerCase().includes(q));
      }
      return true;
    });
  }, [hizliBorclular, filterTip, filterDoviz, search]);

  // Toplam İstatistikler
  const stats = useMemo(() => {
    let topBorcluTRY = 0;
    let topBorcluUSD = 0;
    let topAlacakliTRY = 0;
    let topAlacakliUSD = 0;

    hizliBorclular.forEach((item) => {
      if (item.tip === 'B' || item.bakiye > 0) {
        if (item.doviz === 'TRY') topBorcluTRY += item.bakiye;
        if (item.doviz === 'USD') topBorcluUSD += item.bakiye;
      } else if (item.tip === 'A' || item.bakiye < 0) {
        if (item.doviz === 'TRY') topAlacakliTRY += Math.abs(item.bakiye);
        if (item.doviz === 'USD') topAlacakliUSD += Math.abs(item.bakiye);
      }
    });

    return { topBorcluTRY, topBorcluUSD, topAlacakliTRY, topAlacakliUSD };
  }, [hizliBorclular]);

  const openNew = () => {
    setEditId(null);
    setForm({ ad: '', bakiye: 0, tip: 'B', doviz: 'TRY', not: '', telefon: '' });
    setShowModal(true);
  };

  const openEdit = (item: HizliBorclu) => {
    setEditId(item.id);
    setForm({
      ad: item.ad,
      bakiye: item.bakiye,
      tip: item.tip,
      doviz: item.doviz,
      not: item.not || '',
      telefon: item.telefon || '',
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.ad.trim()) return alert('Kişi / Kurum Adı zorunludur!');
    
    // Otomatik tip belirleme
    let otomatikTip = form.tip;
    if (form.bakiye === 0) otomatikTip = '-';
    else if (form.bakiye < 0) otomatikTip = 'A';
    else if (form.bakiye > 0) otomatikTip = 'B';

    if (editId) {
      updateHizliBorclu(editId, {
        ad: form.ad.trim(),
        bakiye: Number(form.bakiye),
        tip: otomatikTip,
        doviz: form.doviz,
        not: form.not.trim(),
        telefon: form.telefon.trim(),
        sonIslemTarihi: new Date().toLocaleDateString('tr-TR'),
      });
    } else {
      addHizliBorclu({
        id: 'HB-' + Date.now(),
        ad: form.ad.trim().toUpperCase(),
        bakiye: Number(form.bakiye),
        tip: otomatikTip,
        doviz: form.doviz,
        not: form.not.trim(),
        telefon: form.telefon.trim(),
        sonIslemTarihi: new Date().toLocaleDateString('tr-TR'),
      });
    }
    setShowModal(false);
  };

  const handleQuickIslem = () => {
    if (!islemModal || !islemTutar) return alert('Geçerli bir tutar girin!');
    const tutarNum = Number(islemTutar);
    let newBakiye = islemModal.bakiye;

    if (islemTip === 'TAHSILAT') {
      // Borçludan tahsilat yapılınca bakiye düşer
      newBakiye -= tutarNum;
    } else {
      // Borçlandır yapılınca bakiye artar
      newBakiye += tutarNum;
    }

    let otomatikTip: 'B' | 'A' | '-' = 'B';
    if (newBakiye === 0) otomatikTip = '-';
    else if (newBakiye < 0) otomatikTip = 'A';

    updateHizliBorclu(islemModal.id, {
      bakiye: newBakiye,
      tip: otomatikTip,
      sonIslemTarihi: new Date().toLocaleDateString('tr-TR'),
    });

    setIslemModal(null);
    setIslemTutar(0);
  };

  return (
    <RoleGuard permission="canViewCariler">
      <AppShell>
        <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="bx bx-list-check" style={{ color: 'var(--accent-primary)', fontSize: 32 }} />
              Borçlular & Alacaklılar (Hızlı Takip)
            </h1>
            <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
              Cari hesap açmaya gerek kalmadan alacak verecek listesini anlık yönetin
            </p>
          </div>
          <button className="btn btn-primary" onClick={openNew} style={{ padding: '10px 20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bx bx-plus" style={{ fontSize: 20 }} /> Yeni Kişi / Kurum Ekle
          </button>
        </div>

        {/* İstatistik Özet Kartları */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '4px solid var(--accent-success)', background: 'linear-gradient(135deg, rgba(16,185,129,0.06), transparent)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOPLAM ALACAĞIMIZ [B] (TRY)</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-success)', marginTop: 6 }}>
              {format(stats.topBorcluTRY, 'TRY')}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Bize borcu olanlar listesi</div>
          </div>

          <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '4px solid #3b82f6', background: 'linear-gradient(135deg, rgba(59,130,246,0.06), transparent)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOPLAM ALACAĞIMIZ [B] (USD)</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#3b82f6', marginTop: 6 }}>
              {format(stats.topBorcluUSD, 'USD')}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Döviz bazlı borçlular</div>
          </div>

          <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '4px solid #ef4444', background: 'linear-gradient(135deg, rgba(239,68,68,0.06), transparent)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>BİZİM BORCUMUZ [A] (ALACAKLILAR)</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ef4444', marginTop: 6 }}>
              {format(stats.topAlacakliTRY, 'TRY')}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>+ {format(stats.topAlacakliUSD, 'USD')} Döviz borcu</div>
          </div>

          {/* NET DURUM KARTI */}
          <div className="glass-card" style={{ padding: '18px 20px', borderLeft: `4px solid ${stats.topBorcluTRY - stats.topAlacakliTRY >= 0 ? '#10b981' : '#ef4444'}`, background: `linear-gradient(135deg, ${stats.topBorcluTRY - stats.topAlacakliTRY >= 0 ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)'}, transparent)` }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>NET DURUM (TRY)</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: stats.topBorcluTRY - stats.topAlacakliTRY >= 0 ? '#10b981' : '#ef4444', marginTop: 6 }}>
              {format(Math.abs(stats.topBorcluTRY - stats.topAlacakliTRY), 'TRY')}
            </div>
            <div style={{ fontSize: '0.72rem', color: stats.topBorcluTRY - stats.topAlacakliTRY >= 0 ? '#10b981' : '#ef4444', marginTop: 4, fontWeight: 700 }}>
              {stats.topBorcluTRY - stats.topAlacakliTRY >= 0 ? '▲ Kârdayız (+)' : '▼ İçerdeyiz (Zarar -)'}
            </div>
          </div>
        </div>

        {/* Filtre ve Arama Çubuğu */}
        <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterTip('ALL')}
              className={`btn btn-sm ${filterTip === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Tümü ({hizliBorclular.length})
            </button>
            <button
              onClick={() => setFilterTip('B')}
              className={`btn btn-sm ${filterTip === 'B' ? 'btn-success' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <i className="bx bxs-flag-alt" style={{ color: '#10b981' }} /> Borçlular [B] ({hizliBorclular.filter(i => i.tip === 'B' || i.bakiye > 0).length})
            </button>
            <button
              onClick={() => setFilterTip('A')}
              className={`btn btn-sm ${filterTip === 'A' ? 'btn-danger' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <i className="bx bxs-flag-alt" style={{ color: '#ef4444' }} /> Alacaklılar [A] ({hizliBorclular.filter(i => i.tip === 'A' || i.bakiye < 0).length})
            </button>
            <button
              onClick={() => setFilterTip('-')}
              className={`btn btn-sm ${filterTip === '-' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Sıfır Bakiyeler ({hizliBorclular.filter(i => i.tip === '-' || i.bakiye === 0).length})
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', flex: '1 1 300px', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 8, padding: 2 }}>
              {(['ALL', 'TRY', 'USD'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setFilterDoviz(d)}
                  style={{
                    border: 'none',
                    background: filterDoviz === d ? 'var(--accent-primary)' : 'transparent',
                    color: filterDoviz === d ? '#fff' : 'var(--text-muted)',
                    padding: '4px 12px',
                    borderRadius: 6,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {d === 'ALL' ? 'Döviz: Tümü' : d}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: 240 }}>
              <i className="bx bx-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="İsim veya notlarda ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                }}
              />
            </div>
          </div>
        </div>

        {/* Borçlular Tablosu */}
        <div className="glass-card table-card" style={{ overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)', textAlign: 'left', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '14px 18px' }}>Kişi / Kurum Adı</th>
                  <th style={{ padding: '14px 18px', textAlign: 'center' }}>Durum</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Güncel Bakiye</th>
                  <th style={{ padding: '14px 18px', textAlign: 'center' }}>Para Birimi</th>
                  <th style={{ padding: '14px 18px' }}>Not / Açıklama</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Hızlı İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                      <i className="bx bx-info-circle" style={{ fontSize: 32, display: 'block', marginBottom: 8 }} />
                      Arama kriterlerinize uygun kişi/kurum bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => {
                    const isBorclu = item.tip === 'B' || item.bakiye > 0;
                    const isAlacakli = item.tip === 'A' || item.bakiye < 0;
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}>
                        <td data-label="Ad" style={{ padding: '14px 18px', fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{
                              width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                              background: isBorclu ? 'rgba(16,185,129,0.12)' : isAlacakli ? 'rgba(239,68,68,0.12)' : 'rgba(100,116,139,0.12)',
                              color: isBorclu ? '#10b981' : isAlacakli ? '#ef4444' : '#94a3b8',
                            }}>
                              <i className={`bx ${isBorclu ? 'bx-up-arrow-circle' : isAlacakli ? 'bx-down-arrow-circle' : 'bx-minus-circle'}`} />
                            </span>
                            <div>
                              <div>{item.ad}</div>
                              {item.telefon && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>📞 {item.telefon}</div>}
                            </div>
                          </div>
                        </td>

                        <td data-label="Durum" style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <span className={`badge ${isBorclu ? 'badge-success' : isAlacakli ? 'badge-danger' : 'badge-gray'}`} style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
                            {isBorclu ? 'B [BORÇLU]' : isAlacakli ? 'A [ALACAKLI]' : '- [SIFIR]'}
                          </span>
                        </td>

                        <td data-label="Bakiye" style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 800, fontSize: '1.02rem', color: isBorclu ? '#10b981' : isAlacakli ? '#ef4444' : 'var(--text-muted)' }}>
                          {format(Math.abs(item.bakiye), item.doviz)}
                          {isAlacakli && <span style={{ fontSize: '0.75rem', marginLeft: 4, opacity: 0.8 }}>(Eksi)</span>}
                        </td>

                        <td data-label="Döviz" style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: item.doviz === 'USD' ? '#3b82f6' : 'var(--text-primary)' }}>
                            {item.doviz === 'USD' ? '$ USD' : item.doviz === 'EUR' ? '€ EUR' : '₺ TRY'}
                          </span>
                        </td>

                        <td data-label="Not" style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: 260 }}>
                          {item.not ? (
                            <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: 6, border: '1px dashed var(--border)' }}>
                              💬 {item.not}
                            </span>
                          ) : (
                            <span style={{ opacity: 0.4 }}>—</span>
                          )}
                        </td>

                        <td data-label="İşlem" style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => { setIslemModal(item); setIslemTip('TAHSILAT'); setIslemTutar(0); }}
                              className="btn btn-sm btn-success"
                              title="Borçtan Düş / Tahsilat Yap"
                              style={{ padding: '5px 10px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <i className="bx bx-plus-circle" /> Tahsil Et
                            </button>
                            <button
                              onClick={() => { setIslemModal(item); setIslemTip('BORCLANDIR'); setIslemTutar(0); }}
                              className="btn btn-sm btn-secondary"
                              title="Borç Ekle / Alacaklandır"
                              style={{ padding: '5px 10px', fontSize: '0.76rem' }}
                            >
                              <i className="bx bx-minus-circle" /> Borç Ekle
                            </button>
                            <button
                              onClick={() => openEdit(item)}
                              className="btn btn-sm btn-icon btn-secondary"
                              title="Düzenle"
                            >
                              <i className="bx bx-edit" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`${item.ad} kişisini listeden silmek istediğinize emin misiniz?`)) {
                                  deleteHizliBorclu(item.id);
                                }
                              }}
                              className="btn btn-sm btn-icon btn-danger"
                              title="Sil"
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

        {/* Yeni/Düzenle Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
            <div className="glass-card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, padding: 26, position: 'relative', overflowY: 'auto', maxHeight: '90vh' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="bx bx-user-plus" style={{ color: 'var(--accent-primary)' }} />
                {editId ? 'Kişi / Kurum Düzenle' : 'Yeni Hızlı Borçlu / Alacaklı Ekle'}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Kişi / Kurum Ünvanı *</label>
                  <input
                    type="text"
                    placeholder="Örn: MEHMET GÖKALP veya ÇEVRE EKMEK"
                    value={form.ad}
                    onChange={(e) => setForm({ ...form, ad: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Başlangıç Bakiyesi</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.bakiye}
                      onChange={(e) => setForm({ ...form, bakiye: Number(e.target.value) })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Para Birimi</label>
                    <select
                      value={form.doviz}
                      onChange={(e) => setForm({ ...form, doviz: e.target.value as 'TRY' | 'USD' | 'EUR' })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600 }}
                    >
                      <option value="TRY">₺ TRY</option>
                      <option value="USD">$ USD</option>
                      <option value="EUR">€ EUR</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Durum / Tip (Opsiyonel)</label>
                  <select
                    value={form.tip}
                    onChange={(e) => setForm({ ...form, tip: e.target.value as 'B' | 'A' | '-' })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    <option value="B">Borçlu [B] — Bize Borcu Var (+ Artı Bakiye)</option>
                    <option value="A">Alacaklı [A] — Bizim Borcumuz Var (- Eksi Bakiye)</option>
                    <option value="-">Nötr [SIFIR] — Bakiye 0.00</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Telefon / İletişim (Opsiyonel)</label>
                  <input
                    type="text"
                    placeholder="05XX XXX XX XX"
                    value={form.telefon}
                    onChange={(e) => setForm({ ...form, telefon: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Kısa Not / Açıklama</label>
                  <input
                    type="text"
                    placeholder="Örn: 2 adet kamera takıldı veya elden alındı"
                    value={form.not}
                    onChange={(e) => setForm({ ...form, not: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ padding: '10px 18px' }}>
                  İptal
                </button>
                <button onClick={handleSave} className="btn btn-primary" style={{ padding: '10px 22px', fontWeight: 600 }}>
                  <i className="bx bx-check" /> {editId ? 'Güncelle' : 'Listeye Ekle'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hızlı Tahsilat / Borçlandırma Modalı */}
        {islemModal && (
          <div className="modal-overlay" onClick={() => setIslemModal(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
            <div className="glass-card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 420, padding: 26, position: 'relative', overflowY: 'auto', maxHeight: '90vh' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: islemTip === 'TAHSILAT' ? '#10b981' : '#f59e0b' }}>
                <i className={`bx ${islemTip === 'TAHSILAT' ? 'bx-money-withdraw' : 'bx-coin-stack'}`} />
                {islemTip === 'TAHSILAT' ? 'Hızlı Tahsilat Yap (Borçtan Düş)' : 'Hızlı Borç Ekle (Bakiye Artır)'}
              </h3>

              <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 10, marginBottom: 18, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>İşlem Yapılan Kişi:</div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginTop: 2 }}>{islemModal.ad}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Mevcut Bakiye:</span>
                  <strong style={{ color: islemModal.bakiye > 0 ? '#10b981' : '#ef4444' }}>{format(Math.abs(islemModal.bakiye), islemModal.doviz)}</strong>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  {islemTip === 'TAHSILAT' ? 'Alınan / Ödenen Tutar' : 'Eklenecek Borç Tutarı'} ({islemModal.doviz}) *
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={islemTutar || ''}
                  onChange={(e) => setIslemTutar(Number(e.target.value))}
                  autoFocus
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 800 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button onClick={() => setIslemModal(null)} className="btn btn-secondary" style={{ padding: '10px 18px' }}>
                  Vazgeç
                </button>
                <button
                  onClick={handleQuickIslem}
                  className={`btn ${islemTip === 'TAHSILAT' ? 'btn-success' : 'btn-primary'}`}
                  style={{ padding: '10px 24px', fontWeight: 700 }}
                >
                  <i className="bx bx-check" /> İşlemi Kaydet
                </button>
              </div>
            </div>
          </div>
        )}
      </AppShell>
    </RoleGuard>
  );
}
