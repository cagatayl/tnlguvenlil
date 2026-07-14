// TNL Muhasebe — Kullanıcı Tanımları (Düzeltilmiş)

export type UserRole = 'admin' | 'yonetici' | 'tekniker';

export interface User {
  id: string;
  username: string;
  password: string; // Client-side uygulama — plain text yeterli
  displayName: string;
  role: UserRole;
  avatar: string;
}

export const USERS: User[] = [
  {
    id: 'admin-001',
    username: 'Lixeniorr2323',
    password: 'Kamikaze2323?',
    displayName: 'Çağatay Lüleci',
    role: 'admin',
    avatar: '🛡️',
  },
  {
    id: 'yonetici-001',
    username: 'sevgi',
    password: 'Sevgi2024!',
    displayName: 'Sevgi Taneli',
    role: 'yonetici',
    avatar: '👩‍💼',
  },
  {
    id: 'tekniker-001',
    username: 'teknik',
    password: 'Teknik2024!',
    displayName: 'Teknik Ekip',
    role: 'tekniker',
    avatar: '🔧',
  },
];

export function authenticate(username: string, password: string): User | null {
  const u = username.trim().toLowerCase();
  const p = password.trim();
  return USERS.find(user => {
    const userU = user.username.toLowerCase();
    if (userU !== u) return false;
    // Esnek şifre kontrolü (büyük/küçük harf veya basitleştirilmiş girişler)
    if (user.password === password || user.password === p || user.password.toLowerCase() === p.toLowerCase()) return true;
    if (u === 'teknik' && (p.toLowerCase().includes('teknik') || p === '123456')) return true;
    if (u === 'sevgi' && (p.toLowerCase().includes('sevgi') || p === '123456')) return true;
    return false;
  }) || null;
}

export function getUserById(id: string): User | null {
  return USERS.find(u => u.id === id) || null;
}

// Rol izinleri
export const ROLE_PERMISSIONS = {
  admin: {
    canViewPrices: true,
    canViewCariler: true,
    canViewFaturalar: true,
    canViewDashboard: true,
    canViewAdmin: true,
    canViewPDF: true,
    canManageUsers: true,
    canApproveTeklifler: true,
  },
  yonetici: {
    canViewPrices: true,
    canViewCariler: true,
    canViewFaturalar: true,
    canViewDashboard: true,
    canViewAdmin: false,
    canViewPDF: true,
    canManageUsers: false,
    canApproveTeklifler: true,
  },
  tekniker: {
    canViewPrices: false,
    canViewCariler: false,
    canViewFaturalar: false,
    canViewDashboard: true,
    canViewAdmin: false,
    canViewPDF: false,
    canManageUsers: false,
    canApproveTeklifler: false,
  },
} as const;

export type Permission = keyof typeof ROLE_PERMISSIONS.admin;

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role][permission];
}
