import React, { useEffect } from 'react';
import { DAY_NAMES } from '../types/routine';
import { X, Printer, Calendar, CalendarDays } from 'lucide-react';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayIndex: number;
  onSelectPrintMode: (mode: 'day' | 'week') => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  dayIndex,
  onSelectPrintMode,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-[#f6f3ec] border border-[#e2dcd0] p-5 sm:p-6 shadow-2xl animate-modal-in">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#e2dcd0]">
          <h3
            id="print-modal-title"
            className="text-xl font-extrabold text-[#252a31] flex items-center gap-2"
          >
            <Printer className="w-5 h-5 text-[#3f7396]" />
            <span>Imprimir Rotina</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#e2dcd0] text-[#6b717b] hover:text-[#252a31] hover:bg-[#efeae0]/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#6b717b] mt-3 mb-4 font-semibold">
          Escolha o formato do quadro de apoio visual para impressão:
        </p>

        <div className="space-y-3 mb-5">
          <button
            type="button"
            onClick={() => {
              onSelectPrintMode('day');
              onClose();
            }}
            className="w-full flex items-center gap-3.5 p-4 rounded-2xl bg-white border-2 border-[#e2dcd0] hover:border-[#3f7396] hover:bg-[#dfeef8]/30 text-left transition cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-[#dfeef8] text-[#3f7396] flex items-center justify-center flex-none">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-[#252a31]">{DAY_NAMES[dayIndex]}</div>
              <div className="text-xs font-semibold text-[#6b717b]">
                Cartões grandes com espaço para marcar
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectPrintMode('week');
              onClose();
            }}
            className="w-full flex items-center gap-3.5 p-4 rounded-2xl bg-white border-2 border-[#e2dcd0] hover:border-[#2f8544] hover:bg-[#e1f3e5]/30 text-left transition cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-[#e1f3e5] text-[#2f8544] flex items-center justify-center flex-none">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-[#252a31]">Semana inteira</div>
              <div className="text-xs font-semibold text-[#6b717b]">
                Tabela compacta com todos os 7 dias (Seg a Dom)
              </div>
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-white border border-[#e2dcd0] text-[#252a31] font-extrabold text-sm hover:bg-[#efeae0]/60 transition cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

