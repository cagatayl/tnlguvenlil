'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { AuthGuard } from '@/components/AuthGuard';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { CloudSync } from '@/components/CloudSync';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Sidebar />
      <div className="main-layout">
        <Topbar />
        <CloudSync />
        <main className="page-content fade-up">{children}</main>
      </div>
    </AuthGuard>
  );
}
