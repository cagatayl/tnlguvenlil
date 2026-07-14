'use client';

import AppShell from '@/components/layout/AppShell';
import { useAppStore } from '@/store/useAppStore';
import { useState } from 'react';
import type { Yapilacak } from '@/types';

export default function PlanlamaPage() {
  const { yapilacaklar, addYapilacak, toggleYapilacak, deleteYapilacak } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ baslik: '', tarih: '', atanan: '', aciliyet: 'Normal' });

  const handleSave = () => {
    if (!form.baslik) return alert('Başlık zorunludur!');
    addYapilacak({ id: 'TSK-' + Date.now(), ...form, tamamlandi: false });
    setShowModal(false);
    setForm({ baslik: '', tarih: '', atanan: '', aciliyet: 'Normal' });
  };

  const tamamlandi = yapilacaklar.filter((t) => t.tamamlandi);
  const bekleyen = yapilacaklar.filter((t) => !t.tamamlandi);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1 className="page-title">Planlama & Şantiye Takibi</h1>
          <p className="page-subtitle">{bekleyen.length} bekleyen, {tamamlandi.length} tamamlanan görev</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bx bx-plus" /> Yeni Görev Ekle
        </button>
      </div>

      <div className="glass-card table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Tarih</th>
                <th>Başlık & Şantiye</th>
                <th>Atanan Kişi</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {yapilacaklar.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                    Henüz görev yok. Yeni görev ekleyin.
                  </td>
                </tr>
              ) : (
                yapilacaklar.map((t) => (
                  <tr key={t.id} style={{ opacity: t.tamamlandi ? 0.55 : 1 }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={t.tamamlandi}
                        onChange={() => toggleYapilacak(t.id)}
                        style={{ cursor: 'pointer', accentColor: 'var(--accent-primary)', width: 16, height: 16 }}
                      />
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t.tarih}</td>
                    <td>
                      <strong style={{ textDecoration: t.tamamlandi ? 'line-through' : 'none' }}>
                        {t.baslik}
                      </strong>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.atanan}</td>
                    <td>
                      {t.tamamlandi ? (
                        <span className="badge badge-green">Tamamlandı</span>
                      ) : (
                        <span className={`badge ${t.aciliyet?.includes('Acil') ? 'badge-red' : 'badge-yellow'}`}>
                          {t.aciliyet}
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-success btn-sm btn-icon" onClick={() => toggleYapilacak(t.id)} title={t.tamamlandi ? 'Geri Al' : 'Tamamla'}>
                          <i className={`bx ${t.tamamlandi ? 'bx-undo' : 'bx-check'}`} />
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => { if(confirm('Sil?')) deleteYapilacak(t.id); }}>
                          <i className="bx bx-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="glass-card modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Yeni Görev Ekle</span>
              <button className="modal-close" onClick={() => setShowModal(false)}><i className="bx bx-x" /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Başlık *</label>
                <input className="form-input" value={form.baslik} onChange={(e) => setForm({ ...form, baslik: e.target.value })} placeholder="Görev / Şantiye başlığı" autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Tarih</label>
                <input type="date" className="form-input" value={form.tarih} onChange={(e) => setForm({ ...form, tarih: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Atanan Kişi/Ekip</label>
                <input className="form-input" value={form.atanan} onChange={(e) => setForm({ ...form, atanan: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Aciliyet</label>
                <select className="form-select" value={form.aciliyet} onChange={(e) => setForm({ ...form, aciliyet: e.target.value })}>
                  <option>Normal</option>
                  <option>Acil</option>
                  <option>Çok Acil</option>
                  <option>Düşük</option>
                </select>
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
