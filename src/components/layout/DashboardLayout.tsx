'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-4 z-30 rounded-lg bg-white p-2 shadow-sm
          lg:hidden cursor-pointer hover:bg-gray-50 transition-colors border border-border"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5 text-text-primary" />
      </button>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white/95 backdrop-blur-sm px-6 lg:px-8">
          <div className="flex-1" />
          <div className="text-sm text-text-muted">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
