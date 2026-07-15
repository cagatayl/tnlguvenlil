'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppData, TicariUrun, BizimMalzeme, Cari, Teklif,
  Fatura, Cek, Yapilacak, Not, DBRates, HizliBorclu,
} from '@/types';
import initialDataJson from '@/lib/initialData.json';

const INITIAL_DATA_RAW = initialDataJson as any;

const INITIAL_DATA: AppData = {
  ...INITIAL_DATA_RAW,
  teklifler: INITIAL_DATA_RAW.teklifler || [],
  cariler: INITIAL_DATA_RAW.cariler || [],
  faturalar: INITIAL_DATA_RAW.faturalar || [],
  cekler: INITIAL_DATA_RAW.cekler || [],
  yapilacaklar: INITIAL_DATA_RAW.yapilacaklar || [],
  notlar: INITIAL_DATA_RAW.notlar || [],
  bizim_malzemeler: INITIAL_DATA_RAW.bizim_malzemeler || [],
  ticari_urunler: INITIAL_DATA_RAW.ticari_urunler || [],
};
const DB_KEY = 'TNL_MUHASEBE_DB'; // Same key as old app — preserves existing data

export const INITIAL_HIZLI_BORCLULAR: HizliBorclu[] = [
  { id: 'HB-01', ad: 'ŞAHSİ CARİ', bakiye: -1085000.00, tip: 'A', doviz: 'TRY' },
  { id: 'HB-02', ad: 'HEDEF TOPTAN TEKNOLOJİ ELEKTRONİK SANAYİ TİCARET LİMİTED ŞİRKETİ', bakiye: -13155.03, tip: 'A', doviz: 'USD' },
  { id: 'HB-03', ad: 'DOĞU TEKNOLOJİ', bakiye: -4848.36, tip: 'A', doviz: 'USD' },
  { id: 'HB-04', ad: 'POZİTİF TEKNOLOJİ', bakiye: -1561.55, tip: 'A', doviz: 'USD' },
  { id: 'HB-05', ad: 'MBS ELEKTROMARKET', bakiye: -1.00, tip: 'A', doviz: 'USD' },

  { id: 'HB-06', ad: 'MAHİR KARABULUT', bakiye: 0.00, tip: '-', doviz: 'TRY' },
  { id: 'HB-07', ad: 'BEDİRHAN POLAT', bakiye: 0.00, tip: '-', doviz: 'TRY' },
  { id: 'HB-08', ad: 'MUSTAFA SAYI', bakiye: 0.00, tip: '-', doviz: 'TRY' },

  { id: 'HB-09', ad: 'DİLARA YURTEN', bakiye: 1000.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-10', ad: 'DOĞUKAN DOĞAN', bakiye: 1500.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-11', ad: 'MAKBULE GÜLŞEN', bakiye: 1500.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-12', ad: 'LİFE SİTE YÖNETİMİ', bakiye: 2400.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-13', ad: 'AKIN ÖZER ELANZA MOBİLYA', bakiye: 2500.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-14', ad: 'ZÜLFÜ CAN KILINÇTEPE', bakiye: 3000.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-15', ad: 'GÖKHAN ATA', bakiye: 3000.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-16', ad: 'BİLAL MAKROTEK', bakiye: 3000.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-17', ad: 'YUNUS ARSLAN', bakiye: 5000.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-18', ad: 'ÇEVRE EKMEK MALATYA', bakiye: 6000.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-19', ad: 'MEHMET ÇEÇEN', bakiye: 6500.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-20', ad: 'EMRAH BEYAZ', bakiye: 7000.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-21', ad: 'SMT GAYRİMENKUL', bakiye: 7500.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-22', ad: 'DİAMOND ÇİÇEKÇİ', bakiye: 8000.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-23', ad: 'BEKİR CANKARA', bakiye: 8000.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-24', ad: 'HAMİT HAMİTOĞLU', bakiye: 8500.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-25', ad: 'YUNUS EMRE LEKESİZ', bakiye: 9200.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-26', ad: 'GÖKHAN KARATAŞ', bakiye: 9500.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-27', ad: 'İSMAİL BAYRAKTAR', bakiye: 11000.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-28', ad: 'TANER ALAN', bakiye: 11500.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-29', ad: 'GUERA CAFE', bakiye: 12500.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-30', ad: 'ELEKTRİKÇİ ÖZKAN KAYATEK', bakiye: 16900.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-31', ad: 'HOZAT KAMERA', bakiye: 19500.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-32', ad: 'NECEMTTİN ÖZTEMEL', bakiye: 20000.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-33', ad: 'ERGÜL BEYAZ', bakiye: 24000.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-34', ad: 'AYTAÇ VAROL', bakiye: 25000.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-35', ad: 'MEHMET GÖKALP', bakiye: 25212.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-36', ad: 'MC PREFABRİK OSMAN', bakiye: 29000.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-37', ad: 'HALKMAR', bakiye: 54000.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-38', ad: 'GREEN PARK SİTELERİ', bakiye: 62000.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-39', ad: 'NURETTİN ÇAY', bakiye: 66000.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-40', ad: 'ALİ DAYI ÇİĞKÖFTECİ', bakiye: 70000.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-41', ad: 'HEDEF TOPTAN TEKNOLOJİ ELEKTRONİK SANAYİ TİCARET LİMİTED ŞİRKETİ (TL BORÇ)', bakiye: 520000.00, tip: 'B', doviz: 'TRY' },
  { id: 'HB-42', ad: 'POZİTİF TEKNOLOJİ (TL BORÇ)', bakiye: 565000.00, tip: 'B', doviz: 'TRY' },
];

interface AppStore extends AppData {
  // Rates
  updateRates: (rates: DBRates) => void;

  // Ticari Ürünler
  addTicariUrun: (item: TicariUrun) => void;
  updateTicariUrun: (id: string, item: Partial<TicariUrun>) => void;
  deleteTicariUrun: (id: string) => void;
  bulkAddTicariUrunler: (items: TicariUrun[]) => void;

  // Bizim Malzemeler
  addBizimMalzeme: (item: BizimMalzeme) => void;
  updateBizimMalzemeStok: (id: string, miktar: number) => void;

  // Cariler
  addCari: (cari: Cari) => void;
  updateCari: (id: string, cari: Partial<Cari>) => void;
  deleteCari: (id: string) => void;

  // Teklifler
  addTeklif: (teklif: Teklif) => void;
  updateTeklifDurum: (id: string, durum: Teklif['durum']) => void;
  deleteTeklif: (id: string) => void;

  // Faturalar
  addFatura: (fatura: Fatura) => void;
  updateFaturaDurum: (id: string, durum: string) => void;
  deleteFatura: (id: string) => void;

  // Çekler
  addCek: (cek: Cek) => void;
  updateCekDurum: (id: string, durum: Cek['durum']) => void;

  // Yapılacaklar
  addYapilacak: (todo: Yapilacak) => void;
  updateYapilacak: (id: string, updates: Partial<Yapilacak>) => void;
  toggleYapilacak: (id: string) => void;
  deleteYapilacak: (id: string) => void;
  requestYapilacakOnay: (id: string, not: string) => void;
  approveYapilacakOnay: (id: string) => void;
  rejectYapilacakOnay: (id: string) => void;

  // Notlar
  addNot: (not: Not) => void;
  deleteNot: (id: string) => void;

  // Hızlı Borçlular & Alacaklılar (Cari açmadan takip)
  addHizliBorclu: (item: HizliBorclu) => void;
  updateHizliBorclu: (id: string, item: Partial<HizliBorclu>) => void;
  deleteHizliBorclu: (id: string) => void;

  // Utility
  resetDB: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...INITIAL_DATA,
      hizliBorclular: INITIAL_HIZLI_BORCLULAR,

      updateRates: (rates) => set({ rates }),

      addTicariUrun: (item) =>
        set((s) => ({ ticari_urunler: [...s.ticari_urunler, item] })),

      updateTicariUrun: (id, item) =>
        set((s) => ({
          ticari_urunler: s.ticari_urunler.map((u) =>
            u.id === id ? { ...u, ...item } : u
          ),
        })),

      deleteTicariUrun: (id) =>
        set((s) => ({
          ticari_urunler: s.ticari_urunler.filter((u) => u.id !== id),
        })),

      bulkAddTicariUrunler: (items) =>
        set((s) => ({ ticari_urunler: [...s.ticari_urunler, ...items] })),

      addBizimMalzeme: (item) =>
        set((s) => ({ bizim_malzemeler: [...s.bizim_malzemeler, item] })),

      updateBizimMalzemeStok: (id, miktar) =>
        set((s) => ({
          bizim_malzemeler: s.bizim_malzemeler.map((i) => {
            if (i.id !== id) return i;
            const newStok = Math.max(0, i.stok - miktar);
            const newKayip = i.kayipZayiatAdet + miktar;
            return {
              ...i,
              stok: newStok,
              kayipZayiatAdet: newKayip,
              zayiatMaliyeti: newKayip * i.maliyetBirim,
            };
          }),
        })),

      addCari: (cari) =>
        set((s) => ({ cariler: [...(s.cariler || []), cari] })),

      updateCari: (id, cari) =>
        set((s) => ({
          cariler: (s.cariler || []).map((c) => (c.id === id ? { ...c, ...cari } : c)),
        })),

      deleteCari: (id) =>
        set((s) => ({ cariler: (s.cariler || []).filter((c) => c.id !== id) })),

      addTeklif: (teklif) =>
        set((state) => ({ teklifler: [teklif, ...(state.teklifler || [])] })),

      updateTeklifDurum: (id, durum) =>
        set((state) => ({
          teklifler: (state.teklifler || []).map((t) => (t.id === id ? { ...t, durum } : t)),
        })),

      deleteTeklif: (id) =>
        set((state) => ({
          teklifler: (state.teklifler || []).filter((t) => t.id !== id),
        })),

      addFatura: (fatura) =>
        set((s) => ({ faturalar: [fatura, ...(s.faturalar || [])] })),

      updateFaturaDurum: (id, durum) =>
        set((s) => ({
          faturalar: (s.faturalar || []).map((f) => f.id === id ? { ...f, durum } : f),
        })),

      deleteFatura: (id) =>
        set((s) => ({ faturalar: (s.faturalar || []).filter((f) => f.id !== id) })),

      addCek: (cek) =>
        set((s) => ({ cekler: [cek, ...(s.cekler || [])] })),

      updateCekDurum: (id, durum) =>
        set((s) => ({
          cekler: (s.cekler || []).map((c) => c.id === id ? { ...c, durum } : c),
        })),

      addYapilacak: (todo) =>
        set((s) => ({ yapilacaklar: [...(s.yapilacaklar || []), todo] })),

      updateYapilacak: (id, updates) =>
        set((s) => ({
          yapilacaklar: s.yapilacaklar.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      toggleYapilacak: (id) =>
        set((s) => ({
          yapilacaklar: s.yapilacaklar.map((t) =>
            t.id === id ? { ...t, tamamlandi: !t.tamamlandi } : t
          ),
        })),

      deleteYapilacak: (id) =>
        set((s) => ({
          yapilacaklar: s.yapilacaklar.filter((t) => t.id !== id),
        })),

      requestYapilacakOnay: (id, not) =>
        set((s) => ({
          yapilacaklar: s.yapilacaklar.map((t) =>
            t.id === id ? { ...t, onayBekliyor: true, teknikNot: not, teknikTarih: new Date().toISOString() } : t
          ),
        })),

      approveYapilacakOnay: (id) =>
        set((s) => ({
          yapilacaklar: s.yapilacaklar.map((t) =>
            t.id === id ? { ...t, onayBekliyor: false, tamamlandi: true } : t
          ),
        })),

      rejectYapilacakOnay: (id) =>
        set((s) => ({
          yapilacaklar: (s.yapilacaklar || []).map((t) =>
            t.id === id ? { ...t, onayBekliyor: false } : t
          ),
        })),

      addNot: (not) =>
        set((s) => ({ notlar: [...(s.notlar || []), not] })),

      deleteNot: (id) =>
        set((s) => ({ notlar: (s.notlar || []).filter((n) => n.id !== id) })),

      addHizliBorclu: (item) =>
        set((s) => ({ hizliBorclular: [item, ...(s.hizliBorclular || [])] })),

      updateHizliBorclu: (id, item) =>
        set((s) => ({
          hizliBorclular: (s.hizliBorclular || []).map((b) =>
            b.id === id ? { ...b, ...item } : b
          ),
        })),

      deleteHizliBorclu: (id) =>
        set((s) => ({
          hizliBorclular: (s.hizliBorclular || []).filter((b) => b.id !== id),
        })),

      resetDB: () => set({ ...INITIAL_DATA, hizliBorclular: INITIAL_HIZLI_BORCLULAR }),
    }),
    {
      name: DB_KEY,
      // Always use fresh categorized products from initialData.json
      // but preserve user-created data (teklifler, cariler, faturalar, notlar, yapilacaklar)
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<AppData>) || {};
        return {
          ...currentState,
          ...persisted,
          teklifler: persisted.teklifler || currentState.teklifler || [],
          cariler: persisted.cariler || currentState.cariler || [],
          faturalar: persisted.faturalar || currentState.faturalar || [],
          cekler: persisted.cekler || currentState.cekler || [],
          yapilacaklar: persisted.yapilacaklar || currentState.yapilacaklar || [],
          notlar: persisted.notlar || currentState.notlar || [],
          // Always reload products with fresh categories from file
          ticari_urunler: INITIAL_DATA.ticari_urunler,
          // Preserve initial bizim_malzemeler only if user has none
          bizim_malzemeler: (persisted?.bizim_malzemeler?.length ?? 0) > 0
            ? persisted!.bizim_malzemeler!
            : INITIAL_DATA.bizim_malzemeler,
          hizliBorclular: (persisted?.hizliBorclular?.length ?? 0) > 0
            ? persisted!.hizliBorclular!
            : INITIAL_HIZLI_BORCLULAR,
        };
      },
    }
  )
);
