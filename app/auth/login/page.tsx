'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, isAuthenticated, loginError, clearError } = useAuthStore();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydration bekliyoruz
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Zaten giriş yapılmışsa yönlendir
  useEffect(() => {
    if (hydrated && isAuthenticated) {
      const user = useAuthStore.getState().currentUser;
      if (user?.role === 'tekniker') {
        router.replace('/teklifler');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [hydrated, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    clearError();
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const success = login(username.trim(), password);
    setLoading(false);
    if (success) {
      const user = useAuthStore.getState().currentUser;
      if (user?.role === 'tekniker') {
        router.replace('/teklifler');
      } else {
        router.replace('/dashboard');
      }
    } else {
      setShakeError(true);
      setTimeout(() => setShakeError(false), 600);
    }
  };

  if (!hydrated) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#060b18',
      }}>
        <div style={{
          width: 36, height: 36, border: '3px solid rgba(59,130,246,0.2)',
          borderTopColor: '#3b82f6', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <div className="login-page">
      {/* Arka plan parçacıkları */}
      <div className="login-bg">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
        <div className="login-grid" />
      </div>

      <div className="login-container">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg width="46" height="46" viewBox="0 0 48 48" fill="none">
              <path d="M24 4L8 12V24C8 33.5 15.2 42.4 24 44C32.8 42.4 40 33.5 40 24V12L24 4Z"
                fill="url(#loginShieldGrad)" stroke="rgba(59,130,246,0.3)" strokeWidth="0.8" />
              <line x1="16" y1="20" x2="22" y2="20" stroke="rgba(255,255,255,0.65)" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="22" y1="20" x2="22" y2="24" stroke="rgba(255,255,255,0.65)" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="22" y1="24" x2="32" y2="24" stroke="rgba(255,255,255,0.65)" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="24" y1="28" x2="24" y2="32" stroke="rgba(255,255,255,0.65)" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="20" y1="28" x2="28" y2="28" stroke="rgba(255,255,255,0.65)" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="22" cy="20" r="2.2" fill="#3b82f6"/>
              <circle cx="22" cy="24" r="2.2" fill="#f59e0b"/>
              <circle cx="24" cy="28" r="2.2" fill="#3b82f6"/>
              <defs>
                <linearGradient id="loginShieldGrad" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1e40af"/>
                  <stop offset="100%" stopColor="#0c1a3a"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <div className="login-logo-text">TNL <span>GÜVENLİK</span></div>
            <div className="login-logo-sub">Muhasebe &amp; Stok Yönetimi</div>
          </div>
        </div>

        {/* Kart */}
        <div className={`login-card ${shakeError ? 'shake' : ''}`}>
          <h2 className="login-title">Sisteme Giriş</h2>
          <p className="login-desc">Devam etmek için giriş yapın</p>

          <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
            <div className="login-field">
              <label className="login-label">Kullanıcı Adı</label>
              <div className="login-input-wrap">
                <i className="bx bx-user login-input-icon" />
                <input
                  id="login-username"
                  type="text"
                  className="login-input"
                  placeholder="Kullanıcı adınızı girin"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-label">Şifre</label>
              <div className="login-input-wrap">
                <i className="bx bx-lock-alt login-input-icon" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="login-input"
                  placeholder="Şifrenizi girin"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPass(v => !v)}
                  tabIndex={-1}
                >
                  <i className={`bx ${showPass ? 'bx-hide' : 'bx-show'}`} />
                </button>
              </div>
            </div>

            {loginError && (
              <div className="login-error">
                <i className="bx bx-error-circle" /> {loginError}
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading || !username.trim() || !password}
            >
              {loading
                ? <><span className="spin" style={{ width: 14, height: 14, borderWidth: 2, display: 'inline-block', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} /> Giriş yapılıyor...</>
                : <><i className="bx bx-log-in" /> Giriş Yap</>
              }
            </button>
          </form>


          <div className="login-footer" style={{ marginTop: 16 }}>
            <i className="bx bx-shield-check" /> Güvenli bağlantı
          </div>
        </div>

        <div className="login-version">v2.0 · TNL Güvenlik © 2025</div>
      </div>
    </div>
  );
}
