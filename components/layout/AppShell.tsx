'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { AuthGuard } from '@/components/AuthGuard';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { CloudSync } from '@/components/CloudSync';
import { SleepMode } from '@/components/SleepMode';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Sidebar />
      <div className="layout-content">
        <Topbar />
        <CloudSync />
        <SleepMode />
        <main className="main-content fade-up">{children}</main>
      </div>
    </AuthGuard>
  );
}
