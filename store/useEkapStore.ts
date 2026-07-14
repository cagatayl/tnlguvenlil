import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Ihale {
  id: string;
  baslik: string;
  kurum: string;
  il: string;
  tarih: string; // İhale tarihi
  sonTarih: string; // Son başvuru
  link: string;
  durum: 'Açık' | 'Kapanmış' | 'İptal';
  kategori: string;
  eklenmeTarihi: string;
}

interface EkapState {
  ihaleler: Ihale[];
  lastUpdate: string | null;
  isLoading: boolean;
  setIhaleler: (ihaleler: Ihale[]) => void;
  setLoading: (val: boolean) => void;
  fetchIhaleler: () => Promise<void>;
}

export const useEkapStore = create<EkapState>()(
  persist(
    (set) => ({
      ihaleler: [],
      lastUpdate: null,
      isLoading: false,
      setIhaleler: (ihaleler) => set({ ihaleler, lastUpdate: new Date().toISOString() }),
      setLoading: (isLoading) => set({ isLoading }),
      fetchIhaleler: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/ekap');
          if (res.ok) {
            const data = await res.json();
            // Data could be an array directly or an object with {ihaleler: []} depending on the API route
            const ihalelerArray = Array.isArray(data) ? data : (data.ihaleler || []);
            set({ ihaleler: ihalelerArray, lastUpdate: new Date().toISOString() });
          } else {
            set({ ihaleler: [] }); // Fallback
          }
        } catch (error) {
          console.error('EKAP veri çekme hatası:', error);
          set({ ihaleler: [] }); // Fallback on error
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'tnl-ekap-storage',
    }
  )
);
