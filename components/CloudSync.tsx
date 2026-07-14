'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';

export function CloudSync() {
  const store = useAppStore();
  const authStore = useAuthStore();
  const isInitialLoad = useRef(true);
  const lastSyncTime = useRef(Date.now());
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'error'>('syncing');

  // Buluttan veri çek
  useEffect(() => {
    if (!authStore.isAuthenticated) return;

    let isMounted = true;
    const fetchFromCloud = async () => {
      try {
        const res = await fetch('/api/db');
        if (!res.ok) {
          setSyncStatus('error');
          return;
        }
        const cloudData = await res.json();
        
        // Sadece geçerli veri varsa ve hata yoksa birleştir
        if (cloudData && typeof cloudData === 'object' && !cloudData.error) {
          
          // Konum verilerini ayırıp AuthStore'a at
          if (cloudData.userLocationsMap) {
            useAuthStore.getState().setUserLocationsMap(cloudData.userLocationsMap);
            delete cloudData.userLocationsMap; // AppStore'a gitmesin
          }

          // Cloud verilerini Zustand state'ine yaz
          if (isMounted) {
            useAppStore.setState((state) => ({
              ...state,
              ...cloudData,
            }));
            setSyncStatus('synced');
            console.log('Buluttan veriler başarıyla eşitlendi.');
          }
        } else {
          setSyncStatus('error');
        }
      } catch (err) {
        console.error('Bulut veri çekme hatası:', err);
        setSyncStatus('error');
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

    const dataToSave: any = {
      cariler, teklifler, faturalar, cekler,
      yapilacaklar, notlar, hizliBorclular, bizim_malzemeler
    };

    // Kullanıcının anlık konumunu da pakete ekle (Backend ayırıp HSET yapacak)
    if (authStore.currentUser && authStore.userLocation) {
      dataToSave._userId = authStore.currentUser.username;
      dataToSave._userLocation = authStore.userLocation;
    }

    const saveToCloud = async () => {
      // Throttle (saniyede 1 kereden fazla istek atma)
      if (Date.now() - lastSyncTime.current < 1000) return;
      lastSyncTime.current = Date.now();

      setSyncStatus('syncing');
      try {
        const res = await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave),
        });
        if (res.ok) {
          setSyncStatus('synced');
        } else {
          setSyncStatus('error');
        }
      } catch (err) {
        console.error('Buluta veri yazma hatası:', err);
        setSyncStatus('error');
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
            if (cloudData.userLocationsMap) {
              useAuthStore.getState().setUserLocationsMap(cloudData.userLocationsMap);
              delete cloudData.userLocationsMap;
            }
            useAppStore.setState((state) => ({ ...state, ...cloudData }));
          }
        }
      } catch {}
    }, 30000);

    return () => clearInterval(interval);
  }, [authStore.isAuthenticated]);

  if (!authStore.isAuthenticated) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: syncStatus === 'error' ? '#ef4444' : syncStatus === 'syncing' ? '#eab308' : '#10b981',
      color: '#fff',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 9999,
      transition: 'all 0.3s ease'
    }}>
      <i className={`bx ${syncStatus === 'error' ? 'bx-error-circle' : syncStatus === 'syncing' ? 'bx-loader-alt bx-spin' : 'bx-cloud-upload'}`} style={{ fontSize: '1.2rem' }} />
      {syncStatus === 'error' ? 'Veritabanı Hatası (KV Eksik)' : syncStatus === 'syncing' ? 'Buluta Kaydediliyor...' : 'Bulut ile Senkronize'}
    </div>
  );
}
