'use client';

import AppShell from '@/components/layout/AppShell';
import { useAppStore } from '@/store/useAppStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { TeklifKalemi } from '@/types';


interface MusteriInfo {
  ad: string;
  soyad: string;
  sirket: string;
  telefon: string;
  email: string;
  adres: string;
}

export default function YeniTeklifPage() {
  const { ticari_urunler, addTeklif } = useAppStore();
  const { convert, format, rates } = useCurrencyStore();
  const { currentUser, can } = useAuthStore();
  const router = useRouter();
  
  const isTeknik = currentUser?.role === 'tekniker';
  const canViewPDF = can('canViewPDF');

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [doviz, setDoviz] = useState<'USD' | 'EUR' | 'TRY'>('USD');
  const [kalemler, setKalemler] = useState<TeklifKalemi[]>([]);
  const [iscilik, setIscilik] = useState<number>(0);
  const [iscilikDoviz, setIscilikDoviz] = useState<'USD' | 'EUR' | 'TRY'>('TRY');
  const [safMalzeme, setSafMalzeme] = useState<number>(0);
  const [safMalzemeDoviz, setSafMalzemeDoviz] = useState<'USD' | 'EUR' | 'TRY'>('TRY');
  const [gecerlilik, setGecerlilik] = useState<number>(30);
  const [musteri, setMusteri] = useState<MusteriInfo>({
    ad: '', soyad: '', sirket: '', telefon: '', email: '', adres: '',
  });
  const [showPdf, setShowPdf] = useState(false);
  const [kaydedildi, setKaydedildi] = useState(false);
  const [teklifNo] = useState('TKL-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 9000 + 1000));
  const today = new Date().toLocaleDateString('tr-TR');
  const expiry = new Date(Date.now() + gecerlilik * 86400000).toLocaleDateString('tr-TR');

  const categories = useMemo(() =>
    [...new Set(ticari_urunler.map(u => u.anaKategori))].filter(Boolean).sort(),
    [ticari_urunler]
  );

  const searchResults = useMemo(() => {
    let items = ticari_urunler;
    if (activeCategory !== 'all') items = items.filter(u => u.anaKategori === activeCategory);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(u =>
        u.ad?.toLowerCase().includes(q) ||
        u.barkod?.toLowerCase().includes(q) ||
        u.model?.toLowerCase().includes(q) ||
        u.marka?.toLowerCase().includes(q)
      );
    }
    return items.slice(0, 80);
  }, [ticari_urunler, search, activeCategory]);

  const addToCart = (id: string) => {
    const u = ticari_urunler.find(x => x.id === id);
    if (!u) return;
    setKalemler(prev => {
      const existing = prev.find(k => k.urunId === id);
      if (existing) return prev.map(k => k.urunId === id ? { ...k, adet: k.adet + 1 } : k);
      return [...prev, {
        urunId: u.id, gorsel: u.gorsel || '', ad: u.ad, model: u.model || u.ad,
        marka: u.marka || '', barkod: u.barkod || u.kod || '', adet: 1,
        alisFiyati: u.alisFiyati,
        birimFiyat: (u.alisFiyati || 0) * 1.45 * 1.20, // %45 Kar + %20 KDV
        urunLinki: u.urunLinki,
        doviz: u.doviz || 'USD',
        anaKategori: u.anaKategori || '',
      }];
    });
  };

  const removeFromCart = (id: string) => setKalemler(prev => prev.filter(k => k.urunId !== id));
  const updateAdet = (id: string, val: number) =>
    setKalemler(prev => prev.map(k => k.urunId === id ? { ...k, adet: Math.max(1, val) } : k));

  // Hesaplamalar — HEPSİ doviz cinsinden
  const urunToplamDoviz = kalemler.reduce(
    (acc, k) => acc + convert(k.birimFiyat, k.doviz, doviz) * k.adet, 0
  );
  
  const iscilikDovizVal = convert(iscilik || 0, iscilikDoviz, doviz);
  const safMalzemeDovizVal = convert(safMalzeme || 0, safMalzemeDoviz, doviz);
  
  const genelToplamDoviz = urunToplamDoviz + safMalzemeDovizVal + iscilikDovizVal;

  const handleSave = () => {
    if (kalemler.length === 0) return alert('Lütfen teklife ürün ekleyin.');
    if (!musteri.ad) return alert('Müşteri adı zorunludur.');
    const kayit = {
      id: teklifNo,
      tarih: new Date().toISOString().split('T')[0],
      cariId: '',
      cariUnvan: `${musteri.ad} ${musteri.soyad}`.trim() + (musteri.sirket ? ` / ${musteri.sirket}` : ''),
      kalemler,
      doviz,
      tutarDoviz: genelToplamDoviz,
      tutarTRY: convert(genelToplamDoviz, doviz, 'TRY'),
      durum: 'Bekliyor' as const,
      kategori: isTeknik ? 'Teknik Ekip Teklif Onayları' : 'Genel',
      musteriAd: `${musteri.ad} ${musteri.soyad}`.trim(),
      musteriSirket: musteri.sirket,
      musteriTelefon: musteri.telefon,
      musteriEmail: musteri.email,
      olusturanKullanici: currentUser?.displayName || 'Bilinmiyor',
    } as any;
    addTeklif(kayit);
    setKaydedildi(true);
    alert(isTeknik
      ? 'Teklifiniz "Teknik Ekip Teklif Onayları" listesine eklendi. Yönetici onayı bekleniyor.'
      : 'Teklif kaydedildi! Artık PDF oluşturabilirsiniz.'
    );
  };

  const handlePrint = () => {
    if (!kaydedildi) return alert('Önce teklifi kaydedin!');
    if (!musteri.ad) return alert('Müşteri adını girin!');
    if (kalemler.length === 0) return alert('Ürün ekleyin!');
    setShowPdf(true);
    setTimeout(() => window.print(), 600);
  };

  // Noktalı input formatları
  const formatNumber = (num: number) => num === 0 ? '' : new Intl.NumberFormat('tr-TR').format(num);
  const parseNumber = (val: string) => {
    const v = val.replace(/\./g, '').replace(',', '.');
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  return (
    <AppShell>
      {/* Screen view */}
      <div className="no-print">
        <div className="page-header">
          <div>
            <h1 className="page-title">Yeni Teklif Oluştur</h1>
            <p className="page-subtitle">Kategoriye göre ürün seçin, fiyatı belirleyin, PDF yazdırın</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={() => router.push('/teklifler')}>
              <i className="bx bx-arrow-back" /> Geri
            </button>
            {canViewPDF && (
              <button
                className={`btn btn-success ${!kaydedildi ? 'btn-disabled' : ''}`}
                onClick={handlePrint}
                disabled={!kaydedildi}
                title={kaydedildi ? 'PDF oluştur' : 'Önce teklifi kaydedin'}
              >
                <i className="bx bxs-file-pdf" /> PDF {!kaydedildi && '(Önce Kaydet)'}
              </button>
            )}
            {isTeknik && kaydedildi && (
              <div style={{ fontSize: '0.8rem', color: '#f59e0b', padding: '8px 14px', background: 'rgba(245,158,11,0.1)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)' }}>
                ⏳ Yönetici onayı bekleniyor
              </div>
            )}
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={kaydedildi}
              title={kaydedildi ? 'Teklif zaten kaydedildi' : 'Teklifi kaydet'}
            >
              <i className="bx bx-save" /> {kaydedildi ? '✓ Kaydedildi' : 'Kaydet'}
            </button>
          </div>
        </div>

        <div className="yeni-teklif-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: 20 }}>
          {/* SOL: Ürün Seçimi */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Kategori Filtresi */}
            <div className="glass-card" style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flexShrink: 0 }}>Kategori:</span>
                <button
                  className={`badge ${activeCategory === 'all' ? 'badge-blue' : 'badge-gray'}`}
                  style={{ cursor: 'pointer', border: 'none', padding: '4px 10px' }}
                  onClick={() => setActiveCategory('all')}
                >
                  Tümü ({ticari_urunler.length})
                </button>
                {categories.slice(0, 20).map(cat => (
                  <button
                    key={cat}
                    className={`badge ${activeCategory === cat ? 'badge-blue' : 'badge-gray'}`}
                    style={{ cursor: 'pointer', border: 'none', padding: '4px 10px', fontSize: '0.72rem' }}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat} ({ticari_urunler.filter(u => u.anaKategori === cat).length})
                  </button>
                ))}
              </div>
            </div>

            {/* Arama + Tablo */}
            <div className="glass-card table-card">
              <div className="table-toolbar">
                <div className="table-search">
                  <i className="bx bx-search table-search-icon" />
                  <input
                    type="text"
                    placeholder="Marka, model veya barkod..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {searchResults.length} ürün gösteriliyor
                </span>
              </div>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ width: 44 }}></th>
                      <th>Marka / Model</th>
                      <th>Kategori</th>
                      {can('canViewPrices') && <th>Satış Fiyatı (KDV Dahil)</th>}
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map(u => {
                      const fiyatDoviz = convert((u.alisFiyati || 0) * 1.45 * 1.20, u.doviz || 'USD', doviz);
                      const isInCart = kalemler.some(k => k.urunId === u.id);
                      return (
                        <tr key={u.id} style={{ opacity: isInCart ? 0.6 : 1 }}>
                          <td data-label="Görsel">
                            <a href={u.urunLinki || '#'} target={u.urunLinki ? '_blank' : undefined} rel="noopener noreferrer" style={{ display: 'flex', cursor: u.urunLinki ? 'pointer' : 'default' }} title={u.urunLinki ? 'Sitede Görüntüle' : ''}>
                              <img
                                src={u.gorsel || 'https://hedefbayi.com/wp-content/uploads/woocommerce-placeholder.webp'}
                                style={{ width: 38, height: 38, objectFit: 'contain', borderRadius: 6, background: '#fff' }}
                                alt=""
                                onError={e => { (e.target as HTMLImageElement).src = 'https://hedefbayi.com/wp-content/uploads/woocommerce-placeholder.webp'; }}
                              />
                            </a>
                          </td>
                          <td data-label="Marka / Model" style={{ fontSize: '0.82rem', maxWidth: '100%' }}>
                            <strong style={{ color: 'var(--accent-primary)', display: 'block' }}>{u.marka}</strong>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: 1.3, marginTop: 2 }}>
                              {u.model || u.ad}
                            </div>
                          </td>
                          <td data-label="Kategori"><span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>{u.anaKategori}</span></td>
                          {can('canViewPrices') && (
                            <td data-label="Satış Fiyatı" style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                              {format(fiyatDoviz, doviz)}
                            </td>
                          )}
                          <td data-label="İşlem">
                            <button
                              className={`btn btn-sm btn-icon ${isInCart ? 'btn-secondary' : 'btn-success'}`}
                              onClick={() => addToCart(u.id)}
                              title={isInCart ? 'Sepette' : 'Sepete Ekle'}
                            >
                              <i className={`bx ${isInCart ? 'bx-check' : 'bx-plus'}`} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          {/* SAĞ: Teklif Paneli */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0, width: '100%' }}>
            {/* Müşteri Bilgileri */}
            <div className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 14 }}>
                <i className="bx bx-user" style={{ color: 'var(--accent-primary)', marginRight: 6 }} />
                Müşteri Bilgileri
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input className="form-input" placeholder="Ad *" value={musteri.ad} onChange={e => setMusteri({ ...musteri, ad: e.target.value })} />
                <input className="form-input" placeholder="Soyad *" value={musteri.soyad} onChange={e => setMusteri({ ...musteri, soyad: e.target.value })} />
                <input className="form-input" placeholder="Şirket / Kurum" style={{ gridColumn: 'span 2' }} value={musteri.sirket} onChange={e => setMusteri({ ...musteri, sirket: e.target.value })} />
                <input className="form-input" placeholder="Telefon *" value={musteri.telefon} onChange={e => setMusteri({ ...musteri, telefon: e.target.value })} />
                <input className="form-input" placeholder="E-posta" value={musteri.email} onChange={e => setMusteri({ ...musteri, email: e.target.value })} />
                <input className="form-input" placeholder="Adres / Proje Yeri *" style={{ gridColumn: 'span 2' }} value={musteri.adres} onChange={e => setMusteri({ ...musteri, adres: e.target.value })} />
              </div>
            </div>

            {/* Para Birimi */}
            <div className="glass-card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <i className="bx bx-dollar-circle" style={{ marginRight: 6 }} /> Teklif Para Birimi:
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['USD', 'EUR', 'TRY'] as const).map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDoviz(d)}
                    className={`btn btn-sm ${doviz === d ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {d === 'USD' ? '$ Dolar' : d === 'EUR' ? '€ Euro' : '₺ TL'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sepet */}
            <div className="glass-card" style={{ padding: 18, flex: 1, minWidth: 0, width: '100%' }}>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 10 }}>
                <i className="bx bx-cart" style={{ color: 'var(--accent-success)', marginRight: 6 }} />
                Eklenen Ürünler ({kalemler.length})
              </h3>
              <div style={{ maxHeight: 240, overflowY: 'auto', marginBottom: 12, paddingRight: 4 }}>
                {kalemler.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: '0.83rem' }}>
                    Soldaki tablodan ürün ekleyin →
                  </div>
                ) : (
                  kalemler.map(k => {
                    const lineInDoviz = convert(k.birimFiyat, k.doviz, doviz);
                    return (
                      <div key={k.urunId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, padding: '8px 4px', borderBottom: '1px solid rgba(255,255,255,0.06)', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 180px', minWidth: 0 }}>
                          {/* Ürün Görseli Tıklanabilir */}
                          <a href={k.urunLinki || '#'} target={k.urunLinki ? '_blank' : undefined} rel="noopener noreferrer" style={{ display: 'flex', flexShrink: 0 }} title="Sitede görüntüle">
                            <img src={k.gorsel} style={{ width: 34, height: 34, objectFit: 'contain', borderRadius: 4, background: '#fff' }} alt="" onError={e => { (e.target as HTMLImageElement).src = 'https://hedefbayi.com/wp-content/uploads/woocommerce-placeholder.webp'; }} />
                          </a>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-word', lineHeight: 1.3 }}>
                              {k.marka} {k.model}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 'auto' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Adet</span>
                            <input type="number" min={1} value={k.adet.toString()} onChange={e => updateAdet(k.urunId, parseInt(e.target.value) || 1)}
                              style={{ width: 44, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px', color: 'var(--text-primary)', textAlign: 'center', fontSize: '0.82rem' }} />
                          </div>
                          {can('canViewPrices') && (
                            <span style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', minWidth: 68, textAlign: 'right', color: 'var(--accent-primary)' }}>
                              {format(lineInDoviz * k.adet, doviz)}
                            </span>
                          )}
                          <button className="btn btn-danger btn-sm btn-icon" style={{ width: 26, height: 26 }} onClick={() => removeFromCart(k.urunId)} title="Sil">
                            <i className="bx bx-x" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {!can('canViewPrices') ? (
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 10, padding: '14px', textAlign: 'center', marginTop: 12 }}>
                  <i className="bx bx-shield-quarter" style={{ fontSize: 24, color: '#3b82f6', marginBottom: 6, display: 'block' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#3b82f6' }}>Teknik Ekip Modu</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Fiyatlar ve maliyet hesaplamaları yetkiniz dahilinde gizlenmiştir.
                  </div>
                </div>
              ) : (
                <>
                  {/* İŞÇİLİK */}
                  <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 10 }}>
                    <label style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700, display: 'block', marginBottom: 8 }}>
                      <i className="bx bx-wrench" style={{ marginRight: 4 }} /> Montaj & İşçilik
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input type="text" className="form-input" placeholder="0" value={formatNumber(iscilik)}
                        onChange={e => setIscilik(parseNumber(e.target.value))} style={{ flex: 1, minWidth: 0 }} />
                      <select className="form-select" style={{ width: 72, flexShrink: 0 }} value={iscilikDoviz}
                        onChange={e => setIscilikDoviz(e.target.value as 'USD' | 'EUR' | 'TRY')}>
                        <option value="TRY">₺ TL</option>
                        <option value="USD">$ USD</option>
                        <option value="EUR">€ EUR</option>
                      </select>
                    </div>
                  </div>

                  {/* SAF MALZEME */}
                  <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 10 }}>
                    <label style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700, display: 'block', marginBottom: 8 }}>
                      <i className="bx bx-package" style={{ marginRight: 4 }} /> Saf Malzeme (Ekstra)
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input type="text" className="form-input" placeholder="0" value={formatNumber(safMalzeme)}
                        onChange={e => setSafMalzeme(parseNumber(e.target.value))} style={{ flex: 1, minWidth: 0 }} />
                      <select className="form-select" style={{ width: 72, flexShrink: 0 }} value={safMalzemeDoviz}
                        onChange={e => setSafMalzemeDoviz(e.target.value as 'USD' | 'EUR' | 'TRY')}>
                        <option value="TRY">₺ TL</option>
                        <option value="USD">$ USD</option>
                        <option value="EUR">€ EUR</option>
                      </select>
                    </div>
                  </div>

                  {/* ÖZET */}
                  <div style={{ fontSize: '0.84rem' }}>
                    {[
                      { label: 'Ürünler Toplamı', val: urunToplamDoviz, color: '' },
                      { label: 'Saf Malzeme', val: safMalzemeDovizVal, color: '#10b981', skip: safMalzeme === 0 },
                      { label: 'İşçilik', val: iscilikDovizVal, color: '#f59e0b', skip: iscilik === 0 },
                    ].filter((r: any) => !r.skip).map((row: any, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', padding: '4px 0',
                        color: row.color || 'var(--text-secondary)',
                      }}>
                        <span>{row.label}</span>
                        <span>{format(row.val, doviz)}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--accent-primary)',
                      marginTop: 6, paddingTop: 8, fontWeight: 800, fontSize: '1.05rem', color: 'var(--accent-primary)' }}>
                      <span>GENEL TOPLAM</span>
                      <span>{format(genelToplamDoviz, doviz)}</span>
                    </div>
                    {doviz !== 'TRY' && (
                      <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        ≈ {format(convert(genelToplamDoviz, doviz, 'TRY'), 'TRY')}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {showPdf && (
        <TeklifPDF
          musteri={musteri}
          kalemler={kalemler}
          urunToplamDoviz={urunToplamDoviz}
          safMalzemeDovizVal={safMalzemeDovizVal}
          iscilikDovizVal={iscilikDovizVal}
          genelToplamDoviz={genelToplamDoviz}
          doviz={doviz}
          today={today}
          expiry={expiry}
          teklifNo={teklifNo}
          gecerlilik={gecerlilik}
          convert={convert}
          format={format}
        />
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          #teklif-pdf { display: block !important; }
          body { background: #fff !important; }
          body::before { display: none !important; }
          @page { size: A4 portrait; margin: 0; }
          html, body {
            width: 210mm;
            height: 100%;
          }
          .pdf-page { 
            width: 210mm;
            height: 296mm !important; 
            max-height: 296mm !important; 
            overflow: hidden !important; 
            page-break-after: always; 
            page-break-inside: avoid;
            box-sizing: border-box;
          }
          .pdf-page:last-child {
            page-break-after: auto !important;
          }
        }
        #teklif-pdf { display: none; }
      `}</style>
    </AppShell>
  );
}

// =====================================================================
// TNL FİYAT TEKLİFİ PDF — V3 Şablona Uyumlu
// =====================================================================

const PDF_NAVY   = '#1B2A4D';
const PDF_GOLD   = '#C9922A';
const PDF_LIGHT  = '#F2F4F8';
const PDF_CARD   = '#FFFFFF';
const PDF_BORDER = '#E0E4EE';
const PDF_TEXT   = '#1B2A4D';
const PDF_MUTED  = '#6B7280';

function TnlLogoSvg({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <rect width="52" height="52" rx="10" fill={PDF_NAVY} />
      <rect x="8" y="17" width="26" height="18" rx="3.5" fill="#fff" fillOpacity="0.12" />
      <circle cx="21" cy="26" r="6.5" fill="#fff" fillOpacity="0.18" />
      <circle cx="21" cy="26" r="4.5" fill={PDF_GOLD} fillOpacity="0.9" />
      <circle cx="21" cy="26" r="2" fill={PDF_NAVY} />
      <rect x="34" y="15" width="9" height="5" rx="2" fill={PDF_GOLD} />
    </svg>
  );
}

function PdfHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ padding: '16px 28px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${PDF_GOLD}`, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <TnlLogoSvg size={46} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: PDF_NAVY, letterSpacing: 1, lineHeight: 1 }}>TNL</div>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: PDF_NAVY }}>GÜVENLİK</div>
          <div style={{ fontSize: 7, color: PDF_GOLD, letterSpacing: 1.5, fontWeight: 600 }}>SİSTEMLERİ</div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: PDF_NAVY, letterSpacing: 2, lineHeight: 1 }}>{title}</div>
        <div style={{ fontSize: 8.5, color: PDF_GOLD, marginTop: 3, fontWeight: 600 }}>{sub}</div>
      </div>
    </div>
  );
}

function PdfFooter() {
  return (
    <div style={{ borderTop: `1.5px solid ${PDF_GOLD}`, padding: '7px 28px', flexShrink: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 18, fontSize: 7.5, color: PDF_MUTED }}>
        <span>0850-850-23-44</span>
        <span>|</span>
        <span>info@tnlguvenlik.com</span>
        <span>|</span>
        <span>Çöşnük Mah. Eşref Bitlis Cad. No:31/7 Battalgazi / Malatya</span>
      </div>
    </div>
  );
}

function ICard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: PDF_CARD, border: `1px solid ${PDF_BORDER}`, borderRadius: 9, padding: '8px 12px' }}>
      <div style={{ fontSize: 7, color: PDF_MUTED, marginBottom: 2, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: PDF_TEXT }}>{value || '—'}</div>
    </div>
  );
}

function TeklifPDF({
  musteri, kalemler, genelToplamDoviz, doviz,
  today, expiry, teklifNo, gecerlilik, convert, format,
}: any) {
  const { can } = useAuthStore();
  const showPrices = can('canViewPrices');
  const musteriAd = [musteri.ad, musteri.soyad].filter(Boolean).join(' ') || '[Müşteri Adı]';

  const PAGE: React.CSSProperties = {
    width: '210mm',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    background: '#FAFBFD',
    fontFamily: "'Segoe UI', Arial, sans-serif",
    color: PDF_TEXT,
    position: 'relative',
  };

  return (
    <div id="teklif-pdf" style={{ background: '#FAFBFD', fontFamily: "'Segoe UI', Arial, sans-serif" }}>

      {/* ======= SAYFA 1: KAPAK ======= */}
      <div style={PAGE} className="pdf-page">
        <PdfHeader title={showPrices ? 'FİYAT TEKLİFİ' : 'TEKNİK MALZEME LİSTESİ'} sub="Düzenlenebilir kurumsal teklif şablonu" />
        <div style={{ flex: 1, padding: '12px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9 }}>
            <ICard label="Müşteri" value={musteriAd + (musteri.sirket ? ' / ' + musteri.sirket : '')} />
            <ICard label="Teklif No" value={teklifNo} />
            <ICard label="Tarih" value={today} />
            <ICard label="Konu" value="Güvenlik Sistemi Fiyat Teklifi" />
            <ICard label="Geçerlilik" value={gecerlilik + ' Gün'} />
            <ICard label="Yetkili" value="Çağatay LÜLECİ" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 9 }}>
            <div style={{ background: PDF_CARD, border: `1px solid ${PDF_BORDER}`, borderRadius: 9, padding: '11px 14px' }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: PDF_TEXT, marginBottom: 6 }}>Teklif Kapsamı</div>
              <div style={{ fontSize: 8.5, color: PDF_MUTED, lineHeight: 1.7 }}>
                Bu teklif; güvenlik kamera sistemi, alarm sistemi ve benzeri ürün/hizmet tekliflerinde kullanılmak üzere hazırlanmıştır. Montaj ve teknik destek dahildir.
              </div>
            </div>
            <div style={{ background: PDF_NAVY, borderRadius: 9, padding: '11px 14px' }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Öne Çıkan Alanlar</div>
              {['Ürün görsel ve fiyat kartları', 'Detaylı ürün bilgileri', 'Profesyonel şablon'].map((item, i) => (
                <div key={i} style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.82)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: PDF_GOLD, flexShrink: 0, display: 'inline-block' }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: PDF_CARD, border: `1px solid ${PDF_BORDER}`, borderRadius: 9, padding: '11px 14px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: PDF_TEXT, marginBottom: 8 }}>Nasıl Düzenlenir?</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              {[
                { n: '1', t: 'Müşteri ve teklif bilgilerini güncelleyin.' },
                { n: '2', t: 'Ürün kartlarındaki görsel ve fiyat alanlarını değiştirin.' },
                { n: '3', t: 'Özel fiyatlandırmalarınızı belirleyin.' },
                { n: '4', t: 'PDF olarak dışa aktarın veya doğrudan paylaşın.' },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: PDF_NAVY, color: '#fff', fontWeight: 900, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.n}</div>
                  <div style={{ fontSize: 8.5, color: PDF_MUTED, lineHeight: 1.6, paddingTop: 1 }}>{s.t}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: PDF_CARD, border: `1px solid ${PDF_BORDER}`, borderRadius: 9, padding: '11px 14px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: PDF_TEXT, marginBottom: 5 }}>Notlar</div>
            <div style={{ fontSize: 8.5, color: PDF_MUTED, lineHeight: 1.8 }}>
              • Fiyatlar ve detaylar taraflar arasında mutabık kalınan plana göre ilerler.<br />
              • Ödeme şekli, garanti süresi ve teknik kapsam TNL Güvenlik Sistemleri güvencesi altındadır.<br />
              • Bu sayfa teklif özeti; ürün detayları bir sonraki sayfada yer almaktadır.
            </div>
          </div>
          {showPrices && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
              <div style={{ background: PDF_NAVY, borderRadius: 9, padding: '14px 22px', minWidth: 260 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Genel Toplam</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: PDF_GOLD }}>{format(genelToplamDoviz, doviz)}</span>
                </div>
                {doviz !== 'TRY' && (
                  <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.5)', textAlign: 'right', marginTop: 4 }}>
                    TL: {format(convert(genelToplamDoviz, doviz, 'TRY'), 'TRY')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <PdfFooter />
      </div>

      {/* ======= SAYFA 2: ÜRÜNLER ======= */}
      <div style={PAGE} className="pdf-page">
        <PdfHeader title="ÜRÜNLER" sub="Ürün kartları ve fiyat özeti" />
        <div style={{ flex: 1, padding: '12px 28px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
          {kalemler.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 32, opacity: 0.3 }}>📦</div>
              <div style={{ fontSize: 12, color: PDF_MUTED }}>Bu teklife henüz ürün eklenmemiştir.</div>
            </div>
          ) : (
            <>
              {kalemler.slice(0, 7).map((k: any) => {
                const birim = convert(k.birimFiyat, k.doviz, doviz);
                const toplam = birim * k.adet;
                return (
                  <div key={k.urunId} style={{ background: PDF_CARD, border: `1px solid ${PDF_BORDER}`, borderRadius: 9, padding: '9px 13px', display: 'flex', gap: 11, alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 60, height: 60, background: PDF_LIGHT, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${PDF_BORDER}`, overflow: 'hidden' }}>
                      {k.gorsel ? (
                        k.urunLinki ? (
                          <a href={k.urunLinki} target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                            <img src={k.gorsel} style={{ width: 54, height: 54, objectFit: 'contain' }} alt="" />
                          </a>
                        ) : (
                          <img src={k.gorsel} style={{ width: 54, height: 54, objectFit: 'contain' }} alt="" />
                        )
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill={PDF_BORDER} /></svg>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: PDF_TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k.ad || k.model || 'Ürün'}</div>
                      <div style={{ fontSize: 9, color: PDF_GOLD, fontWeight: 700, marginTop: 1 }}>{k.marka}{k.model && k.model !== k.ad ? ' — ' + k.model : ''}</div>
                      <div style={{ fontSize: 7.5, color: PDF_MUTED, marginTop: 2 }}>2 yıl garanti{k.anaKategori ? ' • ' + k.anaKategori : ''}</div>
                    </div>
                    {showPrices ? (
                      <div style={{ background: PDF_LIGHT, border: `1px solid ${PDF_BORDER}`, borderRadius: 7, padding: '7px 11px', flexShrink: 0, minWidth: 100, textAlign: 'right' }}>
                        <div style={{ fontSize: 7.5, color: PDF_MUTED }}>Adet</div>
                        <div style={{ fontSize: 12, fontWeight: 900, color: PDF_TEXT, marginBottom: 4 }}>{k.adet}</div>
                        <div style={{ fontSize: 7, color: PDF_MUTED }}>Birim</div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: PDF_TEXT, marginBottom: 3 }}>{format(birim, doviz)}</div>
                        <div style={{ borderTop: `1px solid ${PDF_BORDER}`, paddingTop: 3 }}>
                          <div style={{ fontSize: 7, color: PDF_MUTED }}>Toplam</div>
                          <div style={{ fontSize: 11, fontWeight: 900, color: PDF_NAVY }}>{format(toplam, doviz)}</div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: PDF_LIGHT, border: `1px solid ${PDF_BORDER}`, borderRadius: 7, padding: '7px 11px', flexShrink: 0, minWidth: 64, textAlign: 'center' }}>
                        <div style={{ fontSize: 7.5, color: PDF_MUTED, marginBottom: 2 }}>Adet</div>
                        <div style={{ fontSize: 17, fontWeight: 900, color: PDF_TEXT }}>{k.adet}</div>
                      </div>
                    )}
                  </div>
                );
              })}
              {kalemler.length > 7 && (
                <div style={{ textAlign: 'center', fontSize: 8.5, color: PDF_MUTED, flexShrink: 0 }}>
                  + {kalemler.length - 7} ürün daha
                </div>
              )}
            </>
          )}
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexShrink: 0 }}>
            <div style={{ background: PDF_CARD, border: `1px solid ${PDF_BORDER}`, borderRadius: 9, padding: '9px 13px', flex: 1 }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, color: PDF_TEXT, marginBottom: 4 }}>Teklif Notu</div>
              <div style={{ fontSize: 8, color: PDF_MUTED, lineHeight: 1.8 }}>
                • Fiyatlar belirtilen süre boyunca geçerlidir.<br />
                • Montaj ve keşif detayları ayrıca belirtilecektir.<br />
                • Yeni ürün kartı ekleyerek listeyi uzatabilirsiniz.
              </div>
            </div>
            {showPrices && (
              <div style={{ background: PDF_CARD, border: `1px solid ${PDF_BORDER}`, borderRadius: 9, padding: '9px 13px', minWidth: 210 }}>
                <div style={{ background: PDF_NAVY, borderRadius: 6, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>Genel Toplam</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: PDF_GOLD }}>{format(genelToplamDoviz, doviz)}</span>
                </div>
                {doviz !== 'TRY' && (
                  <div style={{ textAlign: 'right', fontSize: 7.5, color: PDF_MUTED, marginTop: 4 }}>
                    TL: {format(convert(genelToplamDoviz, doviz, 'TRY'), 'TRY')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <PdfFooter />
      </div>

      {/* ======= SAYFA 3: REFERANSLAR & ÇÖZÜM ORTAKLARI ======= */}
      <div style={PAGE} className="pdf-page">
        <PdfHeader title="REFERANSLAR" sub="Çözüm ortaklarımız ve referans projelerimiz" />
        <div style={{ flex: 1, padding: '16px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div style={{ background: PDF_CARD, border: `1px solid ${PDF_BORDER}`, borderRadius: 9, padding: '16px' }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: PDF_NAVY, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>YETKİLİ ÇÖZÜM ORTAKLARI</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
              {['HIKVISION', 'DAHUA', 'SECOM', 'N2MOBİLE', 'NİNOVA'].map((brand, i) => (
                <div key={i} style={{ border: `1px solid ${PDF_BORDER}`, borderRadius: 8, padding: '14px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: '#F8F9FB', minHeight: 70 }}>
                  <span style={{ fontSize: 13, fontWeight: 900, color: '#374151', letterSpacing: 1 }}>{brand}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: PDF_CARD, border: `1px solid ${PDF_BORDER}`, borderRadius: 9, padding: '16px' }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: PDF_NAVY, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>YETKİLİ ÇÖZÜM ORTAKLARI & REFERANSLAR</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
              {['HIKVISION', 'DAHUA', 'SECOM', 'N2MOBİLE', 'NİNOVA'].map((brand, i) => (
                <div key={i} style={{ border: `1px solid ${PDF_BORDER}`, borderRadius: 8, padding: '14px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: '#F8F9FB', minHeight: 70 }}>
                  <span style={{ fontSize: 13, fontWeight: 900, color: '#374151', letterSpacing: 1 }}>{brand}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
        <PdfFooter />
      </div>

    </div>
  );
}
