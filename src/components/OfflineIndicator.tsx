import React from 'react';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-500/95 px-4 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-xs no-print animate-pulse">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Modo Offline — Seus dados e rotina continuam salvos</span>
    </div>
  );
};
