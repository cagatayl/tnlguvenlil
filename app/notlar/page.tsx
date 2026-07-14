'use client';

import AppShell from '@/components/layout/AppShell';
import { useAppStore } from '@/store/useAppStore';
import { useState } from 'react';

const COLORS = ['#fef3c7', '#d1fae5', '#dbeafe', '#fce7f3', '#ede9fe', '#fee2e2'];

export default function NotlarPage() {
  const { notlar, addNot, deleteNot } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ icerik: '', renk: COLORS[0] });

  const handleSave = () => {
    if (!form.icerik) return alert('İçerik zorunludur!');
    addNot({ id: 'NOT-' + Date.now(), ...form });
    setShowModal(false);
    setForm({ icerik: '', renk: COLORS[0] });
  };

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1 className="page-title">Yapışkan Notlar</h1>
          <p className="page-subtitle">{notlar.length} not</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bx bx-plus" /> Yeni Not
        </button>
      </div>

      {notlar.length === 0 ? (
        <div className="glass-card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          <i className="bx bx-note" style={{ fontSize: 48, marginBottom: 12, display: 'block' }} />
          Henüz not yok. İlk notunuzu ekleyin!
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
          {notlar.map((n) => (
            <div
              key={n.id}
              style={{
                background: n.renk,
                color: '#1a1a2e',
                padding: '18px 18px 14px',
                borderRadius: 12,
                width: 220,
                minHeight: 120,
                position: 'relative',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotate(-1deg) scale(1.02)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
            >
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', fontFamily: 'Inter, sans-serif' }}>
                {n.icerik}
              </p>
              <button
                onClick={() => deleteNot(n.id)}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  background: 'rgba(0,0,0,0.12)', border: 'none',
                  borderRadius: '50%', width: 24, height: 24,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.9rem', color: '#333',
                }}
              >
                <i className="bx bx-x" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="glass-card modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Yeni Not</span>
              <button className="modal-close" onClick={() => setShowModal(false)}><i className="bx bx-x" /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">İçerik</label>
                <textarea
                  className="form-input"
                  rows={5}
                  value={form.icerik}
                  onChange={(e) => setForm({ ...form, icerik: e.target.value })}
                  placeholder="Not içeriğini yazın..."
                  style={{ resize: 'vertical' }}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Renk</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {COLORS.map((c) => (
                    <div
                      key={c}
                      onClick={() => setForm({ ...form, renk: c })}
                      style={{
                        width: 32, height: 32, borderRadius: '50%', background: c, cursor: 'pointer',
                        border: form.renk === c ? '3px solid var(--accent-primary)' : '3px solid transparent',
                        transition: 'transform 0.15s',
                        transform: form.renk === c ? 'scale(1.2)' : '',
                      }}
                    />
                  ))}
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
