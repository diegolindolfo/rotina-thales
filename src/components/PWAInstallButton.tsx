import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (!showIOSGuide) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowIOSGuide(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showIOSGuide]);

  // If already running standalone, do not show install CTA
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="flex items-center gap-1.5 rounded-2xl bg-[#3f7396] text-white px-3.5 py-2.5 text-xs font-extrabold shadow-xs hover:bg-[#335f7d] active:scale-97 transition cursor-pointer"
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
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-2xl bg-white border border-[#e2dcd0] text-[#3f7396] px-3.5 py-2.5 text-xs font-extrabold shadow-2xs hover:bg-[#efeae0]/60 active:scale-97 transition cursor-pointer"
          title="Instalar no iPhone / iPad"
        >
          <Download className="w-4 h-4" />
          <span>Instalar App</span>
        </button>

        {showIOSGuide &&
          createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="ios-install-modal-title"
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowIOSGuide(false);
              }}
            >
              <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-[#f6f3ec] p-5 sm:p-6 shadow-2xl border border-[#e2dcd0] animate-modal-in">
                <div className="flex items-center justify-between pb-3.5 border-b border-[#e2dcd0]">
                  <h3
                    id="ios-install-modal-title"
                    className="text-lg font-extrabold text-[#252a31] flex items-center gap-2"
                  >
                    <Download className="w-5 h-5 text-[#3f7396]" />
                    Instalar no iPhone / iPad
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowIOSGuide(false)}
                    aria-label="Fechar"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#e2dcd0] text-[#6b717b] hover:text-[#252a31] hover:bg-[#efeae0]/60 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="py-4 space-y-3 text-sm text-[#252a31]">
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#e2dcd0]">
                    <Share2 className="w-5 h-5 text-[#3f7396] mt-0.5 flex-none" />
                    <div>
                      <span className="font-extrabold">1. Toque em Compartilhar</span>
                      <p className="text-xs font-semibold text-[#6b717b] mt-0.5">
                        No botão da barra inferior do Safari.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#e2dcd0]">
                    <PlusSquare className="w-5 h-5 text-[#3f7396] mt-0.5 flex-none" />
                    <div>
                      <span className="font-extrabold">2. Adicionar à Tela de Início</span>
                      <p className="text-xs font-semibold text-[#6b717b] mt-0.5">
                        Role um pouco para baixo e toque em "Adicionar à Tela de Início".
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full py-3 rounded-xl bg-[#3f7396] text-white font-extrabold text-sm shadow-xs hover:bg-[#335f7d] transition cursor-pointer"
                >
                  Entendi
                </button>
              </div>
            </div>,
            document.body
          )}
      </>
    );
  }

  return null;
};

