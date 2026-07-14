'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';

// ─── Auth Guard ────────────────────────────────────────────────────────────────
// Zustand persist store'u istemci tarafında hydrate olmadan önce
// isAuthenticated=false dönebiliyor. useState ile hydration bekliyoruz.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const store = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'checking' | 'granted' | 'denied' | 'thankyou'>('checking');
  const watchIdRef = useRef<number | null>(null);

  // Zustand persist hydration — sadece client'ta
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  const handlePositionSuccess = (pos: GeolocationPosition, fromPrompt = false) => {
    useAuthStore.getState().setLocation({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      timestamp: new Date().toISOString(),
    });

    if (fromPrompt || locationStatus === 'denied') {
      setLocationStatus('thankyou');
      setTimeout(() => {
        setLocationStatus('granted');
      }, 1600);
    } else {
      setLocationStatus('granted');
    }
  };

  const requestLocationPermission = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert('Cihazınızda veya tarayıcınızda konum servisi desteklenmiyor.');
      setLocationStatus('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => handlePositionSuccess(pos, true),
      () => {
        setLocationStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    if (!hydrated) return;

    // Konum izni iptal edildi, herkes girebilir
    /*
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      const checkAndLock = async () => {
        if (navigator.permissions && navigator.permissions.query) {
          try {
            const result = await navigator.permissions.query({ name: 'geolocation' });
            
            // Durum değişikliğini (adres çubuğundan vs) anlık izle
            result.onchange = () => {
              if (result.state === 'granted') {
                navigator.geolocation.getCurrentPosition(
                  (pos) => handlePositionSuccess(pos, true),
                  () => setLocationStatus('denied'),
                  { enableHighAccuracy: true, timeout: 5000 }
                );
              } else {
                setLocationStatus('denied');
                if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
              }
            };

            if (result.state === 'granted') {
              // Zaten izin verilmiş -> hemen konumu alıp giriş yaptır
              navigator.geolocation.getCurrentPosition(
                (pos) => handlePositionSuccess(pos, false),
                () => setLocationStatus('denied'),
                { enableHighAccuracy: true, timeout: 5000 }
              );
            } else {
              // İzin verilmemiş ('prompt') veya reddedilmiş ('denied') -> ANINDA kilit ekranını göster!
              setLocationStatus('denied');
            }
          } catch {
            // permissions.query desteklenmeyen tarayıcılarda direkt sorgula
            navigator.geolocation.getCurrentPosition(
              (pos) => handlePositionSuccess(pos, false),
              () => setLocationStatus('denied'),
              { enableHighAccuracy: true, timeout: 4000 }
            );
          }
        } else {
          navigator.geolocation.getCurrentPosition(
            (pos) => handlePositionSuccess(pos, false),
            () => setLocationStatus('denied'),
            { enableHighAccuracy: true, timeout: 4000 }
          );
        }
      };

      checkAndLock();

      // Sadece izin verildiyse sürekli arka plan takibini başlat
      const updatePos = (pos: GeolocationPosition) => {
        useAuthStore.getState().setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: new Date().toISOString(),
        });
      };

      const locInterval = setInterval(() => {
        if (locationStatus === 'granted' || locationStatus === 'thankyou') {
          navigator.geolocation.getCurrentPosition(updatePos, () => {}, {
            enableHighAccuracy: true,
            timeout: 5000,
          });
        }
      }, 30_000);

      const onVisibilityChange = () => {
        if (document.visibilityState === 'visible' && (locationStatus === 'granted' || locationStatus === 'thankyou')) {
          navigator.geolocation.getCurrentPosition(updatePos, () => {}, { enableHighAccuracy: true });
        }
      };
      document.addEventListener('visibilitychange', onVisibilityChange);

      return () => {
        if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        clearInterval(locInterval);
        document.removeEventListener('visibilitychange', onVisibilityChange);
      };
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocationStatus('denied');
    }

    if (pathname.startsWith('/admin') && !store.can('canViewAdmin')) {
      router.replace('/dashboard');
      return;
    }

    store.logActivity(`${pathname} sayfasını ziyaret etti`, pathname);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, store.isAuthenticated, pathname]);

  // İzin verildikten sonra (veya teşekkürler aşamasında) watchPosition başlat
  useEffect(() => {
    if (locationStatus === 'granted' || locationStatus === 'thankyou') {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        const updatePos = (pos: GeolocationPosition) => {
          useAuthStore.getState().setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: new Date().toISOString(),
          });
        };
        if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = navigator.geolocation.watchPosition(updatePos, () => {}, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      }
    } else {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    }
  }, [locationStatus]);

  return <>{children}</>;
}

// ─── Kilitli Sayfa ─────────────────────────────────────────────────────────────
export function LockedPage({ message = 'Bu sayfaya erişim yetkiniz yok.' }: { message?: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '60vh', gap: 16,
      textAlign: 'center', padding: 32,
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'rgba(239,68,68,0.08)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        border: '2px solid rgba(239,68,68,0.2)',
      }}>
        <i className="bx bx-lock" style={{ fontSize: 36, color: '#ef4444' }} />
      </div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
        🔒 Yapımcı Tarafından Kilitlenmiştir
      </h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: 380, margin: 0 }}>{message}</p>
      <div style={{
        fontSize: '0.8rem', color: '#ef4444',
        background: 'rgba(239,68,68,0.06)',
        padding: '8px 18px', borderRadius: 8,
        border: '1px solid rgba(239,68,68,0.15)',
      }}>
        Erişim için sistem yöneticisi ile iletişime geçin.
      </div>
    </div>
  );
}

export function useAuth() {
  return useAuthStore();
}
