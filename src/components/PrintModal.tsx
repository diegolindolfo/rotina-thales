import React from 'react';
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
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-3xl bg-[#f6f3ec] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#e3ded3]">
          <h3 className="text-xl font-bold text-[#2b2f36] flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#4a7c9d]" />
            <span>Imprimir Rotina</span>
          </h3>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#e3ded3] text-[#7a7f87] hover:text-[#2b2f36]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#7a7f87] mt-3 mb-5 font-medium">
          Escolha como deseja imprimir o quadro de apoio visual:
        </p>

        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={() => {
              onSelectPrintMode('day');
              onClose();
            }}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white border-2 border-[#e3ded3] hover:border-[#4a7c9d] hover:bg-[#dcebf5]/30 text-left transition"
          >
            <div className="w-10 h-10 rounded-xl bg-[#dcebf5] text-[#4a7c9d] flex items-center justify-center flex-none">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#2b2f36]">{DAY_NAMES[dayIndex]}</div>
              <div className="text-xs text-[#7a7f87]">
                Cartões grandes com checkbox para quadro diário
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectPrintMode('week');
              onClose();
            }}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white border-2 border-[#e3ded3] hover:border-[#4a7c9d] hover:bg-[#dcebf5]/30 text-left transition"
          >
            <div className="w-10 h-10 rounded-xl bg-[#e3f1dc] text-[#3b8a4a] flex items-center justify-center flex-none">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#2b2f36]">Semana inteira</div>
              <div className="text-xs text-[#7a7f87]">
                Tabela compacta com todos os 7 dias (Seg a Dom)
              </div>
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-white border border-[#e3ded3] text-[#2b2f36] font-bold text-sm hover:bg-stone-50 transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};
