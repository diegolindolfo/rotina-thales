import React from 'react';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-[#252a31]/95 px-4 py-1.5 text-xs font-extrabold text-white shadow-md backdrop-blur-xs no-print"
    >
      <WifiOff className="w-3.5 h-3.5 text-amber-300" />
      <span>Modo Offline — Rotina salva no aparelho</span>
    </div>
  );
};

