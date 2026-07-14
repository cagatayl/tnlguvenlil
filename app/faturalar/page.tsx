'use client';

import AppShell from '@/components/layout/AppShell';
import RoleGuard from '@/components/RoleGuard';
import { useAppStore } from '@/store/useAppStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useState } from 'react';
import type { Fatura, Cek } from '@/types';


type Tab = 'faturalar' | 'cekler';

const emptyFatura = {
  faturaNo: '',
  tarih: new Date().toISOString().split('T')[0],
  cari: '',
  tip: 'Satış' as 'Satış' | 'Alış',
  tutar: 0,
  doviz: 'TRY',
  durum: 'Ödenmedi',
};

const emptyCek = {
  evrakNo: '',
  vade: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  cari: '',
  tutar: 0,
  doviz: 'TRY',
  durum: 'Bekliyor' as Cek['durum'],
};

function FaturalarPage() {
  const { faturalar, cariler, addFatura, updateFaturaDurum, deleteFatura, cekler, addCek, updateCekDurum } = useAppStore();
  const { format, convert } = useCurrencyStore();

  const [tab, setTab] = useState<Tab>('faturalar');
  const [showFModal, setShowFModal] = useState(false);
  const [showCModal, setShowCModal] = useState(false);
  const [fForm, setFForm] = useState(emptyFatura);
  const [cForm, setCForm] = useState(emptyCek);
  const [search, setSearch] = useState('');

  const autoFaturaNo = () => `FTR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const autoCekNo = () => `CEK-${Date.now().toString().slice(-6)}`;

  const openFaturaModal = () => {
    setFForm({ ...emptyFatura, faturaNo: autoFaturaNo() });
    setShowFModal(true);
  };

  const openCekModal = () => {
    setCForm({ ...emptyCek, evrakNo: autoCekNo() });
    setShowCModal(true);
  };

  const saveFatura = () => {
    if (!fForm.faturaNo || !fForm.cari) return alert('Fatura No ve Cari zorunludur!');
    addFatura({ id: 'FAT-' + Date.now(), ...fForm });
    setShowFModal(false);
  };

  const saveCek = () => {
    if (!cForm.evrakNo || !cForm.cari) return alert('Evrak No ve Cari zorunludur!');
    addCek({ id: 'CEK-' + Date.now(), ...cForm });
    setShowCModal(false);
  };

  // Filtrele
  const filteredFaturalar = faturalar.filter(f =>
    !search || f.faturaNo?.toLowerCase().includes(search.toLowerCase()) ||
    f.cari?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredCekler = cekler.filter(c =>
    !search || c.evrakNo?.toLowerCase().includes(search.toLowerCase()) ||
    c.cari?.toLowerCase().includes(search.toLowerCase())
  );

  // Özet hesapla
  const toplamSatisTRY = faturalar.filter(f => f.tip === 'Satış').reduce((a, f) => a + convert(f.tutar, f.doviz, 'TRY'), 0);
  const toplamAlisTRY = faturalar.filter(f => f.tip === 'Alış').reduce((a, f) => a + convert(f.tutar, f.doviz, 'TRY'), 0);
  const odenmeyen = faturalar.filter(f => f.durum === 'Ödenmedi').reduce((a, f) => a + convert(f.tutar, f.doviz, 'TRY'), 0);
  const bekleyenCek = cekler.filter(c => c.durum === 'Bekliyor').reduce((a, c) => a + convert(c.tutar, c.doviz, 'TRY'), 0);

  const durumBadge = (d: string) => {
    if (d === 'Ödendi') return 'badge-green';
    if (d === 'Ödenmedi') return 'badge-red';
    if (d === 'Bekliyor') return 'badge-yellow';
    return 'badge-gray';
  };

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1 className="page-title">Faturalar & Çek/Senet Portföyü</h1>
          <p className="page-subtitle">
            {faturalar.length} fatura · {cekler.length} çek/senet
          </p>
        </div>
        <div className="header-actions">
          <div className="cur-toggle">
            <button className={`cur-btn ${tab === 'faturalar' ? 'active' : ''}`} onClick={() => setTab('faturalar')}>
              <i className="bx bx-receipt" /> Faturalar
            </button>
            <button className={`cur-btn ${tab === 'cekler' ? 'active' : ''}`} onClick={() => setTab('cekler')}>
              <i className="bx bx-credit-card" /> Çek & Senet
            </button>
          </div>
          {tab === 'faturalar' ? (
            <button className="btn btn-primary" onClick={openFaturaModal}>
              <i className="bx bx-plus" /> Yeni Fatura
            </button>
          ) : (
            <button className="btn btn-primary" onClick={openCekModal}>
              <i className="bx bx-plus" /> Yeni Çek/Senet
            </button>
          )}
        </div>
      </div>

      {/* Özet Kartlar */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 20 }}>
        <div className="glass-card stat-card">
          <div className="stat-icon green"><i className="bx bx-trending-up" /></div>
          <div>
            <div className="stat-label">Toplam Satış</div>
            <div className="stat-value-primary" style={{ fontSize: '1.1rem' }}>{format(toplamSatisTRY, 'TRY')}</div>
            <div className="stat-value-secondary">{faturalar.filter(f => f.tip === 'Satış').length} fatura</div>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon red"><i className="bx bx-trending-down" /></div>
          <div>
            <div className="stat-label">Toplam Alış</div>
            <div className="stat-value-primary" style={{ fontSize: '1.1rem' }}>{format(toplamAlisTRY, 'TRY')}</div>
            <div className="stat-value-secondary">{faturalar.filter(f => f.tip === 'Alış').length} fatura</div>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon amber"><i className="bx bx-time-five" /></div>
          <div>
            <div className="stat-label">Ödenmemiş</div>
            <div className="stat-value-primary" style={{ fontSize: '1.1rem' }}>{format(odenmeyen, 'TRY')}</div>
            <div className="stat-value-secondary">{faturalar.filter(f => f.durum === 'Ödenmedi').length} bekliyor</div>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon blue"><i className="bx bx-credit-card" /></div>
          <div>
            <div className="stat-label">Bekleyen Çek</div>
            <div className="stat-value-primary" style={{ fontSize: '1.1rem' }}>{format(bekleyenCek, 'TRY')}</div>
            <div className="stat-value-secondary">{cekler.filter(c => c.durum === 'Bekliyor').length} adet</div>
          </div>
        </div>
      </div>

      {/* Arama */}
      <div className="glass-card table-card">
        <div className="table-toolbar">
          <div className="table-search">
            <i className="bx bx-search table-search-icon" />
            <input
              type="text"
              placeholder={tab === 'faturalar' ? 'Fatura no veya cari ara...' : 'Evrak no veya cari ara...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {tab === 'faturalar' ? filteredFaturalar.length : filteredCekler.length} kayıt
          </span>
        </div>

        <div className="table-responsive">
          {tab === 'faturalar' ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fatura No</th>
                  <th>Tarih</th>
                  <th>Cari / Firma</th>
                  <th>Tip</th>
                  <th>Tutar</th>
                  <th>Tutar (TRY)</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaturalar.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 48 }}>
                      <i className="bx bx-receipt" style={{ fontSize: 40, display: 'block', marginBottom: 8 }} />
                      Fatura kaydı yok. Yeni Fatura ekleyin.
                    </td>
                  </tr>
                ) : (
                  filteredFaturalar.map(f => (
                    <tr key={f.id}>
                      <td><span className="mono-tag">{f.faturaNo}</span></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{f.tarih}</td>
                      <td><strong>{f.cari}</strong></td>
                      <td>
                        <span className={`badge ${f.tip === 'Satış' ? 'badge-green' : 'badge-yellow'}`}>
                          {f.tip === 'Satış' ? '↗ Satış' : '↙ Alış'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{format(f.tutar, f.doviz)}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {f.doviz !== 'TRY' ? format(convert(f.tutar, f.doviz, 'TRY'), 'TRY') : '—'}
                      </td>
                      <td>
                        <select
                          className={`badge ${durumBadge(f.durum)}`}
                          value={f.durum}
                          onChange={e => updateFaturaDurum(f.id, e.target.value)}
                          style={{ cursor: 'pointer', border: 'none', fontWeight: 600, background: 'transparent' }}
                        >
                          <option value="Ödenmedi">Ödenmedi</option>
                          <option value="Kısmi">Kısmi Ödeme</option>
                          <option value="Ödendi">Ödendi</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button className="btn btn-secondary btn-sm btn-icon" title="Yazdır" onClick={() => window.print()}>
                            <i className="bx bxs-file-pdf" />
                          </button>
                          <button className="btn btn-danger btn-sm btn-icon" title="Sil" onClick={() => { if (confirm('Faturayı sil?')) deleteFatura(f.id); }}>
                            <i className="bx bx-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Evrak No</th>
                  <th>Cari</th>
                  <th>Vade Tarihi</th>
                  <th>Tutar</th>
                  <th>Tutar (TRY)</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredCekler.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 48 }}>
                      <i className="bx bx-credit-card" style={{ fontSize: 40, display: 'block', marginBottom: 8 }} />
                      Çek/Senet kaydı yok.
                    </td>
                  </tr>
                ) : (
                  filteredCekler.map(c => (
                    <tr key={c.id}>
                      <td><span className="mono-tag">{c.evrakNo}</span></td>
                      <td><strong>{c.cari}</strong></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{c.vade}</td>
                      <td style={{ fontWeight: 600 }}>{format(c.tutar, c.doviz)}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {c.doviz !== 'TRY' ? format(convert(c.tutar, c.doviz, 'TRY'), 'TRY') : '—'}
                      </td>
                      <td>
                        <select
                          className={`badge ${durumBadge(c.durum)}`}
                          value={c.durum}
                          onChange={e => updateCekDurum(c.id, e.target.value as Cek['durum'])}
                          style={{ cursor: 'pointer', border: 'none', fontWeight: 600, background: 'transparent' }}
                        >
                          <option value="Bekliyor">Bekliyor</option>
                          <option value="Ödendi">Ödendi</option>
                          <option value="İade">İade</option>
                        </select>
                      </td>
                      <td>
                        <button className="btn btn-danger btn-sm btn-icon" title="Sil">
                          <i className="bx bx-trash" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Fatura Modal */}
      {showFModal && (
        <div className="modal-overlay" onClick={() => setShowFModal(false)}>
          <div className="glass-card modal" style={{ width: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Yeni Fatura Ekle</span>
              <button className="modal-close" onClick={() => setShowFModal(false)}><i className="bx bx-x" /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Fatura No *</label>
                  <input className="form-input" value={fForm.faturaNo} onChange={e => setFForm({ ...fForm, faturaNo: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tarih</label>
                  <input type="date" className="form-input" value={fForm.tarih} onChange={e => setFForm({ ...fForm, tarih: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Cari / Firma Adı *</label>
                <input className="form-input" value={fForm.cari} onChange={e => setFForm({ ...fForm, cari: e.target.value })}
                  placeholder="Firma veya kişi adı" list="cari-list-f" />
                <datalist id="cari-list-f">
                  {cariler.map(c => <option key={c.id} value={c.unvan} />)}
                </datalist>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Tip</label>
                  <select className="form-select" value={fForm.tip} onChange={e => setFForm({ ...fForm, tip: e.target.value as 'Satış' | 'Alış' })}>
                    <option value="Satış">Satış Faturası</option>
                    <option value="Alış">Alış Faturası</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tutar</label>
                  <input type="number" className="form-input" value={fForm.tutar || ''} onChange={e => setFForm({ ...fForm, tutar: +e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Para Birimi</label>
                  <select className="form-select" value={fForm.doviz} onChange={e => setFForm({ ...fForm, doviz: e.target.value })}>
                    <option value="TRY">₺ TRY</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Ödeme Durumu</label>
                <select className="form-select" value={fForm.durum} onChange={e => setFForm({ ...fForm, durum: e.target.value })}>
                  <option value="Ödenmedi">Ödenmedi</option>
                  <option value="Kısmi">Kısmi Ödeme</option>
                  <option value="Ödendi">Ödendi</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowFModal(false)}>İptal</button>
              <button className="btn btn-primary" onClick={saveFatura}><i className="bx bx-check" /> Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* Çek Modal */}
      {showCModal && (
        <div className="modal-overlay" onClick={() => setShowCModal(false)}>
          <div className="glass-card modal" style={{ width: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Yeni Çek / Senet</span>
              <button className="modal-close" onClick={() => setShowCModal(false)}><i className="bx bx-x" /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Evrak No *</label>
                  <input className="form-input" value={cForm.evrakNo} onChange={e => setCForm({ ...cForm, evrakNo: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Vade Tarihi</label>
                  <input type="date" className="form-input" value={cForm.vade} onChange={e => setCForm({ ...cForm, vade: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Cari / Firma *</label>
                <input className="form-input" value={cForm.cari} onChange={e => setCForm({ ...cForm, cari: e.target.value })}
                  placeholder="Çeki veren firma/kişi" list="cari-list-c" />
                <datalist id="cari-list-c">
                  {cariler.map(c => <option key={c.id} value={c.unvan} />)}
                </datalist>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Tutar</label>
                  <input type="number" className="form-input" value={cForm.tutar || ''} onChange={e => setCForm({ ...cForm, tutar: +e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Para Birimi</label>
                  <select className="form-select" value={cForm.doviz} onChange={e => setCForm({ ...cForm, doviz: e.target.value })}>
                    <option value="TRY">₺ TRY</option>
                    <option value="USD">$ USD</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Durum</label>
                  <select className="form-select" value={cForm.durum} onChange={e => setCForm({ ...cForm, durum: e.target.value as Cek['durum'] })}>
                    <option value="Bekliyor">Bekliyor</option>
                    <option value="Ödendi">Ödendi</option>
                    <option value="İade">İade</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCModal(false)}>İptal</button>
              <button className="btn btn-primary" onClick={saveCek}><i className="bx bx-check" /> Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function FaturalarPageWithGuard() {
  return (
    <RoleGuard permission="canViewFaturalar">
      <FaturalarPage />
    </RoleGuard>
  );
}
