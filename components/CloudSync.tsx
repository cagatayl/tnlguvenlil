'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';

export function CloudSync() {
  const store = useAppStore();
  const authStore = useAuthStore();
  const isInitialLoad = useRef(true);
  const lastSyncTime = useRef(Date.now());

  // Buluttan veri çek
  useEffect(() => {
    if (!authStore.isAuthenticated) return;

    let isMounted = true;
    const fetchFromCloud = async () => {
      try {
        const res = await fetch('/api/db');
        if (!res.ok) return;
        const cloudData = await res.json();
        
        // Sadece geçerli veri varsa ve hata yoksa birleştir
        if (cloudData && typeof cloudData === 'object' && !cloudData.error) {
          // Cloud verilerini Zustand state'ine yaz
          if (isMounted) {
            useAppStore.setState((state) => ({
              ...state,
              ...cloudData,
              // Ürünler genelde JSON'dan gelir, onları ezmemeye dikkat edebiliriz
              // Fakat kullanıcı eklediyse onları cloud'dan alalım.
            }));
            console.log('Buluttan veriler başarıyla eşitlendi.');
          }
        }
      } catch (err) {
        console.error('Bulut veri çekme hatası:', err);
      } finally {
        if (isMounted) {
          isInitialLoad.current = false;
        }
      }
    };

    fetchFromCloud();

    // Temizleme
    return () => { isMounted = false; };
  }, [authStore.isAuthenticated]);

  // Buluta veri yaz (Her state değiştiğinde)
  useEffect(() => {
    if (isInitialLoad.current || !authStore.isAuthenticated) return;

    // Sadece önemli verileri buluta gönder (Tüm state yerine sadece kullanıcı verileri)
    const { 
      cariler, teklifler, faturalar, cekler, 
      yapilacaklar, notlar, hizliBorclular, bizim_malzemeler
    } = store;

    const dataToSave = {
      cariler, teklifler, faturalar, cekler,
      yapilacaklar, notlar, hizliBorclular, bizim_malzemeler
    };

    const saveToCloud = async () => {
      // Throttle (saniyede 1 kereden fazla istek atma)
      if (Date.now() - lastSyncTime.current < 1000) return;
      lastSyncTime.current = Date.now();

      try {
        await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave),
        });
      } catch (err) {
        console.error('Buluta veri yazma hatası:', err);
      }
    };

    const timeoutId = setTimeout(saveToCloud, 500); // 500ms debounce
    return () => clearTimeout(timeoutId);
  }, [
    store.cariler, store.teklifler, store.faturalar, store.cekler,
    store.yapilacaklar, store.notlar, store.hizliBorclular, store.bizim_malzemeler,
    authStore.isAuthenticated
  ]);

  // Her 30 saniyede bir arka planda yenile
  useEffect(() => {
    if (!authStore.isAuthenticated) return;

    const interval = setInterval(async () => {
      if (isInitialLoad.current) return;
      try {
        const res = await fetch('/api/db');
        if (res.ok) {
          const cloudData = await res.json();
          if (cloudData && typeof cloudData === 'object' && !cloudData.error) {
            useAppStore.setState((state) => ({ ...state, ...cloudData }));
          }
        }
      } catch {}
    }, 30000);

    return () => clearInterval(interval);
  }, [authStore.isAuthenticated]);

  return null; // Arayüzde hiçbir şey göstermez, gizli çalışır
}
