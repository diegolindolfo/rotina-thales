import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running standalone, do not show install CTA
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-xl bg-[#4a7c9d] text-white px-3 py-2 text-xs font-bold shadow-sm hover:bg-[#3d6884] active:scale-95 transition"
        title="Instalar aplicativo"
      >
        <Download className="w-4 h-4" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl bg-white border border-[#e3ded3] text-[#4a7c9d] px-3 py-2 text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 transition"
          title="Instalar no iPhone / iPad"
        >
          <Download className="w-4 h-4" />
          <span>Instalar App</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowIOSGuide(false);
            }}
          >
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-[#e3ded3]">
              <div className="flex items-center justify-between pb-3 border-b border-[#e3ded3]">
                <h3 className="text-lg font-bold text-[#2b2f36] flex items-center gap-2">
                  <Download className="w-5 h-5 text-[#4a7c9d]" />
                  Instalar no iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-xl p-1 text-[#7a7f87] hover:text-[#2b2f36]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-3 text-sm text-[#2b2f36]">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                  <Share2 className="w-5 h-5 text-[#4a7c9d] mt-0.5 flex-none" />
                  <div>
                    <span className="font-bold">1. Toque em Compartilhar</span>
                    <p className="text-xs text-[#7a7f87]">No botão da barra inferior do Safari.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                  <PlusSquare className="w-5 h-5 text-[#4a7c9d] mt-0.5 flex-none" />
                  <div>
                    <span className="font-bold">2. Adicionar à Tela de Início</span>
                    <p className="text-xs text-[#7a7f87]">
                      Role um pouco para baixo e toque em "Adicionar à Tela de Início".
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-3 rounded-xl bg-[#4a7c9d] text-white font-bold text-sm shadow-sm hover:bg-[#3d6884] transition"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
