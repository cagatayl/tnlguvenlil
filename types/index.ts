// TNL Muhasebe - TypeScript Tip Tanımları

export interface TicariUrun {
  id: string;
  kod: string;
  barkod: string;
  ad: string;
  model: string;
  anaKategori: string;
  altKategori: string;
  marka: string;
  alisFiyati: number;
  satisFiyati: number;
  doviz: 'USD' | 'EUR' | 'TRY';
  karMarji: number;
  toptanciStok: number;
  bayiStok: number;
  gorsel: string;
  aciklama: string;
  urunLinki?: string;   // hedefbayi.com ürün sayfası linki
}

export interface BizimMalzeme {
  id: string;
  kod: string;
  ad: string;
  kategori: string;
  birim: string;
  stok: number;
  kritikStok: number;
  maliyetBirim: number;
  kayipZayiatAdet: number;
  zayiatMaliyeti: number;
  doviz: string;
  gorsel: string;
  aciklama: string;
}

export interface Cari {
  id: string;
  kod: string;
  unvan: string;
  tip: 'Müşteri' | 'Tedarikçi' | 'Her İkisi';
  yetkili: string;
  telefon: string;
  email?: string;
  adres?: string;
  bakiyeUSD: number;
  bakiyeTRY: number;
}

export interface TeklifKalemi {
  urunId: string;
  gorsel: string;
  ad: string;
  model: string;
  marka: string;
  barkod?: string;
  anaKategori?: string;
  adet: number;
  birimFiyat: number;
  alisFiyati?: number;
  karMarji?: number;
  urunLinki?: string;
  doviz: string;
}

export interface Teklif {
  id: string;
  tarih: string;
  cariId: string;
  cariUnvan?: string;
  kalemler: TeklifKalemi[];
  doviz: string;
  tutarDoviz: number;
  tutarTRY: number;
  durum: 'Bekliyor' | 'Onaylandı' | 'Reddedildi' | 'İptal';
}

export interface Fatura {
  id: string;
  faturaNo: string;
  tarih: string;
  cari: string;
  tip: 'Satış' | 'Alış';
  tutar: number;
  doviz: string;
  durum: string;
}

export interface Cek {
  id: string;
  evrakNo: string;
  vade: string;
  cari: string;
  tutar: number;
  doviz: string;
  durum: 'Bekliyor' | 'Ödendi' | 'İade';
}

export interface Yapilacak {
  id: string;
  baslik: string;
  tarih: string;
  atanan: string;
  aciliyet: string;
  tamamlandi: boolean;
}

export interface Not {
  id: string;
  icerik: string;
  renk: string;
}

export interface HizliBorclu {
  id: string;
  ad: string;
  bakiye: number;       // Örneğin: 6000 veya -13155.03
  tip: 'B' | 'A' | '-'; // 'B': Borçlu (Artı), 'A': Alacaklı (Eksi), '-': Nötr (Sıfır)
  doviz: 'TRY' | 'USD' | 'EUR';
  not?: string;
  telefon?: string;
  sonIslemTarihi?: string;
}

export interface DBRates {
  USD: { alis: number; satis: number };
  EUR: { alis: number; satis: number };
  GBP: { alis: number; satis: number };
}

export interface AppSettings {
  companyName: string;
  owner: string;
  theme: string;
}

export interface AppData {
  settings: AppSettings;
  rates: DBRates;
  bizim_malzemeler: BizimMalzeme[];
  ticari_urunler: TicariUrun[];
  cariler: Cari[];
  teklifler: Teklif[];
  faturalar: Fatura[];
  cekler: Cek[];
  yapilacaklar: Yapilacak[];
  notlar: Not[];
  hizliBorclular?: HizliBorclu[];
}
