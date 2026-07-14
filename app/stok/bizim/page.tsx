'use client';

import AppShell from '@/components/layout/AppShell';
import { useAppStore } from '@/store/useAppStore';
import { useState } from 'react';

export default function BizimMalzemeleriPage() {
  const { bizim_malzemeler, addBizimMalzeme, updateBizimMalzemeStok } = useAppStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    ad: '', kategori: '', birim: 'Adet', stok: 0, kritikStok: 5, maliyetBirim: 0,
  });

  const filtered = bizim_malzemeler.filter(
    (i) =>
      i.ad?.toLowerCase().includes(search.toLowerCase()) ||
      i.kod?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.ad) return alert('Ad zorunludur!');
    addBizimMalzeme({
      id: 'BM-' + Date.now(),
      kod: 'BM-' + Math.floor(Math.random() * 10000),
      kayipZayiatAdet: 0,
      zayiatMaliyeti: 0,
      doviz: 'TRY',
      gorsel: '',
      aciklama: form.ad,
      ...form,
    });
    setShowModal(false);
    setForm({ ad: '', kategori: '', birim: 'Adet', stok: 0, kritikStok: 5, maliyetBirim: 0 });
  };

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1 className="page-title">Bizim Malzemelerimiz</h1>
          <p className="page-subtitle">İç kullanım, demirbaşlar, araç-gereç ve sarf malzemeleri takibi</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bx bx-plus" /> Yeni Malzeme Ekle
        </button>
      </div>

      <div className="glass-card table-card">
        <div className="table-toolbar">
          <div className="table-search">
            <i className="bx bx-search table-search-icon" />
            <input
              type="text"
              placeholder="Malzeme adı veya kod ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kod</th>
                <th>Malzeme Adı</th>
                <th>Kategori</th>
                <th>Mevcut Stok</th>
                <th>Kayıp Düşüm</th>
                <th>Zayiat Maliyet</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                    {bizim_malzemeler.length === 0 ? 'Henüz malzeme yok. Yeni malzeme ekleyin.' : 'Sonuç bulunamadı.'}
                  </td>
                </tr>
              ) : (
                filtered.map((i) => {
                  const isCritical = i.stok <= i.kritikStok;
                  return (
                    <tr key={i.id}>
                      <td><span className="mono-tag">{i.kod}</span></td>
                      <td>
                        <strong>{i.ad}</strong>
                        <br />
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{i.aciklama}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{i.kategori}</td>
                      <td>
                        <span className={`badge ${isCritical ? 'badge-red' : 'badge-green'}`}>
                          {i.stok} {i.birim}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            if (confirm(`${i.ad} için 1 kayıp düşülsün mü?`)) {
                              updateBizimMalzemeStok(i.id, 1);
                            }
                          }}
                        >
                          <i className="bx bx-minus" /> 1 Kayıp Düş
                        </button>
                      </td>
                      <td style={{ color: 'var(--accent-danger)', fontWeight: 600 }}>
                        {i.zayiatMaliyeti?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                          ({i.kayipZayiatAdet} adet kayıp)
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="glass-card modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Yeni Malzeme Ekle</span>
              <button className="modal-close" onClick={() => setShowModal(false)}><i className="bx bx-x" /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Malzeme Adı *</label>
                <input className="form-input" value={form.ad} onChange={(e) => setForm({ ...form, ad: e.target.value })} autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <input className="form-input" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Birim</label>
                  <select className="form-select" value={form.birim} onChange={(e) => setForm({ ...form, birim: e.target.value })}>
                    <option>Adet</option><option>Metre</option><option>Kg</option><option>Litre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Başlangıç Stok</label>
                  <input type="number" className="form-input" value={form.stok} onChange={(e) => setForm({ ...form, stok: +e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Kritik Stok</label>
                  <input type="number" className="form-input" value={form.kritikStok} onChange={(e) => setForm({ ...form, kritikStok: +e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Maliyet (TRY/Birim)</label>
                  <input type="number" className="form-input" value={form.maliyetBirim} onChange={(e) => setForm({ ...form, maliyetBirim: +e.target.value })} />
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
    </AppShell>
  );
}
