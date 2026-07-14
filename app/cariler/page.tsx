'use client';

import AppShell from '@/components/layout/AppShell';
import RoleGuard from '@/components/RoleGuard';
import { useAppStore } from '@/store/useAppStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useState } from 'react';
import type { Cari, Fatura, Cek } from '@/types';


type Tab = 'liste' | 'detay';

const emptyForm = {
  unvan: '', tip: 'Müşteri' as Cari['tip'], yetkili: '', telefon: '', email: '', adres: '',
  bakiyeUSD: 0, bakiyeTRY: 0,
};

const NOTLAR_RENKLER = ['#fef9c3', '#d1fae5', '#dbeafe', '#fce7f3', '#ede9fe'];

function CarilerPage() {
  const { cariler, addCari, updateCari, deleteCari, faturalar, addFatura, updateFaturaDurum, cekler, addCek } = useAppStore();
  const { format, convert } = useCurrencyStore();

  const [tab, setTab] = useState<Tab>('liste');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  // Cari notu state'i (localStorage'a kaydedilir Zustand üzerinden — basitçe map olarak)
  const [cariNotlari, setCariNotlari] = useState<Record<string, string[]>>(() => {
    try { return JSON.parse(localStorage.getItem('cari_notlari') || '{}'); } catch { return {}; }
  });
  const [yeniNot, setYeniNot] = useState('');

  // Fatura ekleme modal
  const [showFaturaModal, setShowFaturaModal] = useState(false);
  const [faturaForm, setFaturaForm] = useState({ faturaNo: '', tarih: new Date().toISOString().split('T')[0], tip: 'Satış' as 'Satış' | 'Alış', tutar: 0, doviz: 'TRY', durum: 'Ödenmedi' });

  const selectedCari = cariler.find(c => c.id === selectedId);
  const cariFaturalar = faturalar.filter(f => f.cari === selectedCari?.unvan);
  const cariCekler = cekler.filter(ck => ck.cari === selectedCari?.unvan);

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (c: Cari) => {
    setEditId(c.id);
    setForm({ unvan: c.unvan, tip: c.tip, yetkili: c.yetkili, telefon: c.telefon, email: c.email || '', adres: c.adres || '', bakiyeUSD: c.bakiyeUSD, bakiyeTRY: c.bakiyeTRY });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.unvan) return alert('Ünvan zorunludur!');
    if (editId) {
      updateCari(editId, form);
    } else {
      addCari({ id: 'CAR-' + Date.now(), kod: 'CR-' + Math.floor(Math.random() * 10000), ...form });
    }
    setShowModal(false);
  };

  const openDetay = (id: string) => {
    setSelectedId(id);
    setTab('detay');
  };

  const addNot = () => {
    if (!yeniNot.trim() || !selectedId) return;
    const updated = { ...cariNotlari, [selectedId]: [...(cariNotlari[selectedId] || []), yeniNot.trim()] };
    setCariNotlari(updated);
    localStorage.setItem('cari_notlari', JSON.stringify(updated));
    setYeniNot('');
  };

  const removeNot = (idx: number) => {
    if (!selectedId) return;
    const list = [...(cariNotlari[selectedId] || [])];
    list.splice(idx, 1);
    const updated = { ...cariNotlari, [selectedId]: list };
    setCariNotlari(updated);
    localStorage.setItem('cari_notlari', JSON.stringify(updated));
  };

  const saveFatura = () => {
    if (!selectedCari || !faturaForm.faturaNo) return alert('Fatura No zorunlu!');
    addFatura({ id: 'FAT-' + Date.now(), ...faturaForm, cari: selectedCari.unvan });
    setShowFaturaModal(false);
    setFaturaForm({ faturaNo: '', tarih: new Date().toISOString().split('T')[0], tip: 'Satış', tutar: 0, doviz: 'TRY', durum: 'Ödenmedi' });
  };

  // Alacak hesaplama: satış faturaları - tahsilat
  const alacakTRY = selectedCari
    ? cariFaturalar.filter(f => f.tip === 'Satış' && f.durum !== 'Ödendi').reduce((acc, f) => acc + convert(f.tutar, f.doviz, 'TRY'), 0)
    : 0;
  const borcTRY = selectedCari
    ? cariFaturalar.filter(f => f.tip === 'Alış' && f.durum !== 'Ödendi').reduce((acc, f) => acc + convert(f.tutar, f.doviz, 'TRY'), 0)
    : 0;

  // Piyasa alacakları özet (tüm cariler)
  const toplamAlacak = cariler.reduce((acc, c) => {
    const satislar = faturalar.filter(f => f.cari === c.unvan && f.tip === 'Satış' && f.durum !== 'Ödendi')
      .reduce((s, f) => s + convert(f.tutar, f.doviz, 'TRY'), 0);
    return acc + satislar;
  }, 0);

  return (
    <AppShell>
      {tab === 'liste' ? (
        <>
          <div className="page-header">
            <div>
              <h1 className="page-title">Cari Hesap Yönetimi</h1>
              <p className="page-subtitle">
                {cariler.length} cari — Toplam Piyasa Alacağı: {' '}
                <strong style={{ color: 'var(--accent-success)' }}>{format(toplamAlacak, 'TRY')}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-secondary"
                onClick={() => window.location.href = '/borclular'}
                style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', borderColor: 'rgba(16,185,129,0.2)' }}
              >
                <i className="bx bx-list-check" /> Hızlı Borçlular (Cari Dışı)
              </button>
              <button className="btn btn-primary" onClick={openNew}>
                <i className="bx bx-user-plus" /> Yeni Cari Kart
              </button>
            </div>
          </div>

          {/* Alacak Özet Kartı */}
          <div className="glass-card" style={{ padding: '16px 24px', marginBottom: 20, background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.05))' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>Toplam Piyasa Alacağı</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-success)' }}>{format(toplamAlacak, 'TRY')}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>Aktif Cari Sayısı</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{cariler.length}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>Toplam Çek/Senet</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-warning)' }}>{cekler.length} adet</div>
              </div>
            </div>
          </div>

          <div className="glass-card table-card">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Kod</th>
                    <th>Ünvan / Yetkili</th>
                    <th>Tip</th>
                    <th>Telefon</th>
                    <th>Alacak (TRY)</th>
                    <th>Bakiye (USD)</th>
                    <th>Bakiye (TRY)</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {cariler.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 48 }}>
                        Henüz cari kaydı yok. Yeni Cari Kart ekleyin.
                      </td>
                    </tr>
                  ) : (
                    cariler.map(c => {
                      const cAlacak = faturalar.filter(f => f.cari === c.unvan && f.tip === 'Satış' && f.durum !== 'Ödendi')
                        .reduce((acc, f) => acc + convert(f.tutar, f.doviz, 'TRY'), 0);
                      return (
                        <tr key={c.id}>
                          <td><span className="mono-tag">{c.kod}</span></td>
                          <td>
                            <button
                              onClick={() => openDetay(c.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                            >
                              <strong style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>{c.unvan}</strong>
                            </button>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.yetkili}</div>
                          </td>
                          <td>
                            <span className={`badge ${c.tip === 'Müşteri' ? 'badge-blue' : c.tip === 'Tedarikçi' ? 'badge-yellow' : 'badge-green'}`}>
                              {c.tip}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{c.telefon}</td>
                          <td style={{ fontWeight: 600, color: cAlacak > 0 ? 'var(--accent-success)' : 'var(--text-muted)' }}>
                            {cAlacak > 0 ? format(cAlacak, 'TRY') : '—'}
                          </td>
                          <td style={{ color: c.bakiyeUSD >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                            {format(c.bakiyeUSD || 0, 'USD')}
                          </td>
                          <td style={{ color: c.bakiyeTRY >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                            {format(c.bakiyeTRY || 0, 'TRY')}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 5 }}>
                              <button className="btn btn-primary btn-sm btn-icon" title="Detay" onClick={() => openDetay(c.id)}>
                                <i className="bx bx-show" />
                              </button>
                              <button className="btn btn-secondary btn-sm btn-icon" title="Düzenle" onClick={() => openEdit(c)}>
                                <i className="bx bx-edit" />
                              </button>
                              <button className="btn btn-danger btn-sm btn-icon" title="Sil" onClick={() => { if (confirm('Sil?')) deleteCari(c.id); }}>
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
        </>
      ) : (
        /* ===== DETAY SAYFASI ===== */
        selectedCari ? (
          <>
            <div className="page-header">
              <div>
                <button className="btn btn-secondary btn-sm" onClick={() => setTab('liste')} style={{ marginBottom: 8 }}>
                  <i className="bx bx-arrow-back" /> Geri
                </button>
                <h1 className="page-title">{selectedCari.unvan}</h1>
                <p className="page-subtitle">
                  {selectedCari.tip} · {selectedCari.yetkili} · {selectedCari.telefon}
                </p>
              </div>
              <div className="header-actions">
                <button className="btn btn-success" onClick={() => {
                  setFaturaForm({ ...faturaForm, faturaNo: 'FTR-' + Date.now().toString().slice(-5) });
                  setShowFaturaModal(true);
                }}>
                  <i className="bx bx-plus" /> Fatura Ekle
                </button>
                <button className="btn btn-secondary" onClick={() => openEdit(selectedCari)}>
                  <i className="bx bx-edit" /> Düzenle
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
              {/* Alacak/Borç Kartları */}
              <div className="glass-card stat-card" style={{ background: 'rgba(16,185,129,0.06)' }}>
                <div className="stat-icon green"><i className="bx bx-trending-up" /></div>
                <div>
                  <div className="stat-label">Bu Cariden Alacak</div>
                  <div className="stat-value-primary" style={{ color: 'var(--accent-success)' }}>{format(alacakTRY, 'TRY')}</div>
                  <div className="stat-value-secondary">{cariFaturalar.filter(f => f.tip === 'Satış').length} satış faturası</div>
                </div>
              </div>
              <div className="glass-card stat-card" style={{ background: 'rgba(239,68,68,0.06)' }}>
                <div className="stat-icon red"><i className="bx bx-trending-down" /></div>
                <div>
                  <div className="stat-label">Bu Cariye Borç</div>
                  <div className="stat-value-primary" style={{ color: 'var(--accent-danger)' }}>{format(borcTRY, 'TRY')}</div>
                  <div className="stat-value-secondary">{cariFaturalar.filter(f => f.tip === 'Alış').length} alış faturası</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {/* Faturalar */}
              <div className="glass-card table-card">
                <div className="table-toolbar" style={{ padding: '12px 16px' }}>
                  <strong style={{ fontSize: '0.9rem' }}>Faturalar</strong>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Tarih</th>
                      <th>Tip</th>
                      <th>Tutar</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cariFaturalar.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>Fatura yok</td></tr>
                    ) : cariFaturalar.map(f => (
                      <tr key={f.id}>
                        <td><span className="mono-tag">{f.faturaNo}</span></td>
                        <td style={{ fontSize: '0.8rem' }}>{f.tarih}</td>
                        <td><span className={`badge ${f.tip === 'Satış' ? 'badge-green' : 'badge-yellow'}`}>{f.tip}</span></td>
                        <td style={{ fontWeight: 600 }}>{format(f.tutar, f.doviz)}</td>
                        <td><span className={`badge ${f.durum === 'Ödendi' ? 'badge-green' : 'badge-red'}`}>{f.durum}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Çek/Senet */}
              <div className="glass-card table-card">
                <div className="table-toolbar" style={{ padding: '12px 16px' }}>
                  <strong style={{ fontSize: '0.9rem' }}>Çek & Senet Portföyü</strong>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Evrak No</th>
                      <th>Vade</th>
                      <th>Tutar</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cariCekler.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>Çek/senet yok</td></tr>
                    ) : cariCekler.map(ck => (
                      <tr key={ck.id}>
                        <td><span className="mono-tag">{ck.evrakNo}</span></td>
                        <td style={{ fontSize: '0.8rem' }}>{ck.vade}</td>
                        <td style={{ fontWeight: 600 }}>{format(ck.tutar, ck.doviz)}</td>
                        <td><span className={`badge ${ck.durum === 'Ödendi' ? 'badge-green' : 'badge-yellow'}`}>{ck.durum}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notlar */}
            <div className="glass-card" style={{ padding: 20, marginTop: 18 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 14 }}>
                <i className="bx bx-note" style={{ color: 'var(--accent-warning)', marginRight: 6 }} />
                Cari Notları
              </h3>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <input
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="Not ekle... (ör: son görüşme, teklif durumu, ödeme tercihi)"
                  value={yeniNot}
                  onChange={e => setYeniNot(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addNot()}
                />
                <button className="btn btn-primary" onClick={addNot}>
                  <i className="bx bx-plus" /> Ekle
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {(cariNotlari[selectedId!] || []).length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Henüz not yok.</p>
                ) : (
                  (cariNotlari[selectedId!] || []).map((not, i) => (
                    <div
                      key={i}
                      style={{
                        background: NOTLAR_RENKLER[i % NOTLAR_RENKLER.length],
                        color: '#1a1a2e',
                        padding: '10px 14px',
                        borderRadius: 10,
                        maxWidth: 260,
                        fontSize: '0.88rem',
                        position: 'relative',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                      }}
                    >
                      {not}
                      <button
                        onClick={() => removeNot(i)}
                        style={{
                          position: 'absolute', top: 4, right: 6,
                          background: 'rgba(0,0,0,0.1)', border: 'none',
                          borderRadius: '50%', width: 18, height: 18,
                          cursor: 'pointer', fontSize: '0.75rem', color: '#333',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >×</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : null
      )}

      {/* Cari Kayıt Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="glass-card modal" style={{ width: 540 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editId ? 'Cari Düzenle' : 'Yeni Cari Kart'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}><i className="bx bx-x" /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Ünvan *</label>
                <input className="form-input" value={form.unvan} onChange={e => setForm({ ...form, unvan: e.target.value })} placeholder="Firma / Kişi adı" autoFocus />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Tip</label>
                  <select className="form-select" value={form.tip} onChange={e => setForm({ ...form, tip: e.target.value as Cari['tip'] })}>
                    <option>Müşteri</option>
                    <option>Tedarikçi</option>
                    <option>Her İkisi</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Yetkili</label>
                  <input className="form-input" value={form.yetkili} onChange={e => setForm({ ...form, yetkili: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input className="form-input" value={form.telefon} onChange={e => setForm({ ...form, telefon: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">E-posta</label>
                  <input className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Adres</label>
                <input className="form-input" value={form.adres} onChange={e => setForm({ ...form, adres: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Bakiye (USD)</label>
                  <input type="number" className="form-input" value={form.bakiyeUSD} onChange={e => setForm({ ...form, bakiyeUSD: +e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Bakiye (TRY)</label>
                  <input type="number" className="form-input" value={form.bakiyeTRY} onChange={e => setForm({ ...form, bakiyeTRY: +e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
              <button className="btn btn-primary" onClick={handleSave}><i className="bx bx-check" /> Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* Fatura Ekleme Modal */}
      {showFaturaModal && (
        <div className="modal-overlay" onClick={() => setShowFaturaModal(false)}>
          <div className="glass-card modal" style={{ width: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Yeni Fatura — {selectedCari?.unvan}</span>
              <button className="modal-close" onClick={() => setShowFaturaModal(false)}><i className="bx bx-x" /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Fatura No *</label>
                  <input className="form-input" value={faturaForm.faturaNo} onChange={e => setFaturaForm({ ...faturaForm, faturaNo: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tarih</label>
                  <input type="date" className="form-input" value={faturaForm.tarih} onChange={e => setFaturaForm({ ...faturaForm, tarih: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tip</label>
                  <select className="form-select" value={faturaForm.tip} onChange={e => setFaturaForm({ ...faturaForm, tip: e.target.value as 'Satış' | 'Alış' })}>
                    <option value="Satış">Satış</option>
                    <option value="Alış">Alış</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Durum</label>
                  <select className="form-select" value={faturaForm.durum} onChange={e => setFaturaForm({ ...faturaForm, durum: e.target.value })}>
                    <option value="Ödenmedi">Ödenmedi</option>
                    <option value="Kısmi">Kısmi Ödeme</option>
                    <option value="Ödendi">Ödendi</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tutar</label>
                  <input type="number" className="form-input" value={faturaForm.tutar || ''} onChange={e => setFaturaForm({ ...faturaForm, tutar: +e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Para Birimi</label>
                  <select className="form-select" value={faturaForm.doviz} onChange={e => setFaturaForm({ ...faturaForm, doviz: e.target.value })}>
                    <option value="TRY">₺ TRY</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowFaturaModal(false)}>İptal</button>
              <button className="btn btn-primary" onClick={saveFatura}><i className="bx bx-check" /> Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function CarilerPageWithGuard() {
  return (
    <RoleGuard permission="canViewCariler">
      <CarilerPage />
    </RoleGuard>
  );
}
