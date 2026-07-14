'use client';

import AppShell from '@/components/layout/AppShell';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import React, { useState } from 'react';
import type { Yapilacak } from '@/types';

export default function PlanlamaPage() {
  const { 
    yapilacaklar, addYapilacak, toggleYapilacak, deleteYapilacak, 
    requestYapilacakOnay, approveYapilacakOnay, rejectYapilacakOnay 
  } = useAppStore();
  const { currentUser } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [showTechModal, setShowTechModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [techNote, setTechNote] = useState('');
  const [form, setForm] = useState({ baslik: '', tarih: '', atanan: '', aciliyet: 'Normal' });

  const handleSave = () => {
    if (!form.baslik) return alert('Başlık zorunludur!');
    addYapilacak({ id: 'TSK-' + Date.now(), ...form, tamamlandi: false });
    setShowModal(false);
    setForm({ baslik: '', tarih: '', atanan: '', aciliyet: 'Normal' });
  };

  const handleTechSave = () => {
    if (!selectedTask) return;
    if (!techNote.trim()) return alert('Lütfen bir not girin!');
    requestYapilacakOnay(selectedTask, techNote);
    setShowTechModal(false);
    setSelectedTask(null);
    setTechNote('');
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
        {currentUser?.role !== 'tekniker' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <i className="bx bx-plus" /> Yeni Görev Ekle
          </button>
        )}
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
                {currentUser?.role !== 'tekniker' && <th>İşlem</th>}
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
                  <React.Fragment key={t.id}>
                  <tr style={{ opacity: t.tamamlandi ? 0.55 : 1 }}>
                    <td>
                      {currentUser?.role !== 'tekniker' ? (
                        <input
                          type="checkbox"
                          checked={t.tamamlandi}
                          onChange={() => toggleYapilacak(t.id)}
                          style={{ cursor: 'pointer', accentColor: 'var(--accent-primary)', width: 16, height: 16 }}
                        />
                      ) : (
                        <i className={`bx ${t.tamamlandi ? 'bx-check-square' : 'bx-square'}`} style={{ color: t.tamamlandi ? '#10b981' : 'var(--text-muted)' }} />
                      )}
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
                      ) : t.onayBekliyor ? (
                        <span className="badge badge-amber" style={{ animation: 'pulse 2s infinite' }}>Onay Bekliyor</span>
                      ) : (
                        <span className={`badge ${t.aciliyet?.includes('Acil') ? 'badge-red' : 'badge-yellow'}`}>
                          {t.aciliyet}
                        </span>
                      )}
                    </td>
                    {currentUser?.role !== 'tekniker' ? (
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {t.onayBekliyor ? (
                            <>
                              <button className="btn btn-success btn-sm" onClick={() => approveYapilacakOnay(t.id)}>Onayla</button>
                              <button className="btn btn-danger btn-sm" onClick={() => rejectYapilacakOnay(t.id)}>Reddet</button>
                            </>
                          ) : (
                            <>
                              <button className="btn btn-success btn-sm btn-icon" onClick={() => toggleYapilacak(t.id)} title={t.tamamlandi ? 'Geri Al' : 'Tamamla'}>
                                <i className={`bx ${t.tamamlandi ? 'bx-undo' : 'bx-check'}`} />
                              </button>
                              <button className="btn btn-danger btn-sm btn-icon" onClick={() => { if(confirm('Sil?')) deleteYapilacak(t.id); }}>
                                <i className="bx bx-trash" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    ) : (
                      <td>
                        {!t.tamamlandi && !t.onayBekliyor && (
                          <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => { setSelectedTask(t.id); setShowTechModal(true); }}
                          >
                            İş Bitti Bildir
                          </button>
                        )}
                        {t.onayBekliyor && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>İnceleniyor...</span>}
                      </td>
                    )}
                  </tr>
                  {/* Eğer onay bekliyorsa ve not girilmişse ek bir satırda göster */}
                  {t.onayBekliyor && t.teknikNot && (
                    <tr>
                      <td colSpan={6} style={{ padding: '8px 16px', background: 'rgba(245, 158, 11, 0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.85rem' }}>
                          <i className="bx bx-message-square-detail" style={{ color: '#f59e0b', marginTop: 2 }} />
                          <div>
                            <div style={{ color: '#e2e8f0', marginBottom: 2 }}><strong>Teknik Ekip Notu:</strong> {t.teknikNot}</div>
                            {t.teknikTarih && <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Bildirim Zamanı: {new Date(t.teknikTarih).toLocaleString('tr-TR')}</div>}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
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

      {showTechModal && (
        <div className="modal-overlay" onClick={() => setShowTechModal(false)}>
          <div className="glass-card modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">İşi Bitir & Onaya Gönder</span>
              <button className="modal-close" onClick={() => setShowTechModal(false)}><i className="bx bx-x" /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Yapılan İşlem Notu *</label>
                <textarea 
                  className="form-input" 
                  value={techNote} 
                  onChange={(e) => setTechNote(e.target.value)} 
                  placeholder="Kablolar çekildi, test edildi vb." 
                  rows={4}
                  autoFocus 
                />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Bu notu gönderdiğinizde, görev onaya düşecek ve yöneticiniz onayladığında tamamen kapanacaktır.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowTechModal(false)}>İptal</button>
              <button className="btn btn-primary" onClick={handleTechSave}><i className="bx bx-send" /> Onaya Gönder</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
