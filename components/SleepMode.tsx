'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function SleepMode() {
  const { isAuthenticated, currentUser } = useAuthStore();
  const [isSleeping, setIsSleeping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const SLEEP_TIMEOUT = 20000; // 20 saniye

  const resetTimer = () => {
    if (isSleeping) {
      setIsSleeping(false);
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isAuthenticated) {
      timeoutRef.current = setTimeout(() => {
        setIsSleeping(true);
      }, SLEEP_TIMEOUT);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    // Etkileşim olaylarını dinle
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // İlk zamanlayıcıyı başlat
    resetTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isSleeping]);

  if (!isSleeping || !isAuthenticated) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#060b18',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        overflow: 'hidden'
      }}
      onClick={resetTimer}
    >
      {/* Yıldız ve Zzz Animasyonları (CSS ile) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-50px); opacity: 0; }
        }
        @keyframes pulseMoon {
          0% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.1); }
          50% { box-shadow: 0 0 50px rgba(255, 255, 255, 0.3); }
          100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.1); }
        }
        .zzz {
          position: absolute;
          font-weight: bold;
          color: rgba(255,255,255,0.4);
          animation: float 3s ease-in-out infinite;
        }
      `}} />
      
      {/* Arka plan partikülleri */}
      <div className="zzz" style={{ top: '30%', left: '40%', fontSize: '2rem', animationDelay: '0s' }}>Z</div>
      <div className="zzz" style={{ top: '25%', left: '45%', fontSize: '1.5rem', animationDelay: '1s' }}>z</div>
      <div className="zzz" style={{ top: '20%', left: '50%', fontSize: '1rem', animationDelay: '2s' }}>z</div>

      {/* Ay / Avatar İkonu */}
      <div style={{
        width: 100, height: 100, 
        borderRadius: '50%', 
        background: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
        border: '2px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '3rem',
        animation: 'pulseMoon 4s infinite',
        marginBottom: 30
      }}>
        {currentUser?.avatar || '🌙'}
      </div>

      <h1 style={{
        color: '#e2e8f0', 
        fontSize: '2rem',
        fontWeight: 300,
        letterSpacing: '2px',
        margin: 0,
        textAlign: 'center',
        padding: '0 20px'
      }}>
        <strong style={{ fontWeight: 600, color: '#3b82f6' }}>{currentUser?.displayName?.split(' ')[0]}</strong> İyi Uykular Diler
      </h1>
      
      <p style={{
        color: 'rgba(255,255,255,0.4)',
        marginTop: 20,
        fontSize: '1rem',
        animation: 'pulse 2s infinite'
      }}>
        <i className="bx bx-mouse" style={{ marginRight: 6, verticalAlign: 'middle' }} />
        Uyanmak için tıkla
      </p>
    </div>
  );
}
