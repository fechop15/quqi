'use client';

import { useEffect, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { useConfiguracion } from '@/hooks/useConfiguracion';
import { Toaster } from 'sonner';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const { config } = useConfiguracion();

  useEffect(() => {
    if (config?.colorPrimario) {
      document.documentElement.style.setProperty('--color-primary', config.colorPrimario);
    }
  }, [config?.colorPrimario]);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <div
            className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#e2e8f0]"
            style={{ borderTopColor: config?.colorPrimario || '#6366f1' }}
          ></div>
          <p className="mt-4 text-sm text-[#64748b]">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      {children}
      <Toaster position="top-center" />
    </AuthProvider>
  );
}
