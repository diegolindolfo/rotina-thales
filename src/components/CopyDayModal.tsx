import React, { useState, useEffect } from 'react';
import { DAY_NAMES } from '../types/routine';
import { X, Copy } from 'lucide-react';

interface CopyDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceDayIndex: number;
  onCopy: (selectedDays: number[]) => void;
}

export const CopyDayModal: React.FC<CopyDayModalProps> = ({
  isOpen,
  onClose,
  sourceDayIndex,
  onCopy,
}) => {
  const [selected, setSelected] = useState<number[]>([]);

  // Start with a clean selection every time the modal opens
  useEffect(() => {
    if (isOpen) setSelected([]);
  }, [isOpen, sourceDayIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleDay = (idx: number) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]
    );
  };

  const handleSelectAllWeekdays = () => {
    setSelected([0, 1, 2, 3, 4].filter((d) => d !== sourceDayIndex));
  };

  const handleSelectWeekend = () => {
    setSelected([5, 6].filter((d) => d !== sourceDayIndex));
  };

  const handleCopy = () => {
    if (selected.length === 0) return;
    onCopy(selected);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="copy-day-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#f6f3ec] border border-[#e2dcd0] p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto animate-modal-in">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#e2dcd0]">
          <h3
            id="copy-day-modal-title"
            className="text-xl font-extrabold text-[#252a31] flex items-center gap-2"
          >
            <Copy className="w-5 h-5 text-[#3f7396]" />
            <span>Copiar {DAY_NAMES[sourceDayIndex]} para...</span>
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

        <p className="text-xs text-[#6b717b] mt-3 mb-3.5 leading-relaxed font-semibold">
          Selecione para quais dias você deseja copiar a rotina de{' '}
          <strong className="text-[#252a31]">{DAY_NAMES[sourceDayIndex]}</strong>. As atividades existentes nesses dias serão substituídas.
        </p>

        <div className="flex flex-wrap gap-2 mb-3.5">
          {sourceDayIndex >= 0 && sourceDayIndex <= 4 && (
            <button
              type="button"
              onClick={handleSelectAllWeekdays}
              className="px-3 py-1.5 rounded-xl bg-[#dfeef8] text-[#3f7396] text-xs font-extrabold hover:bg-[#d0e5f4] transition cursor-pointer"
            >
              + Dias úteis (Seg a Sex)
            </button>
          )}
          {sourceDayIndex >= 5 && (
            <button
              type="button"
              onClick={handleSelectWeekend}
              className="px-3 py-1.5 rounded-xl bg-[#dfeef8] text-[#3f7396] text-xs font-extrabold hover:bg-[#d0e5f4] transition cursor-pointer"
            >
              + Fim de semana
            </button>
          )}
        </div>

        <div className="space-y-2 mb-5">
          {DAY_NAMES.map((name, idx) => {
            if (idx === sourceDayIndex) return null;
            const isChecked = selected.includes(idx);
            return (
              <label
                key={idx}
                className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition cursor-pointer select-none ${
                  isChecked
                    ? 'bg-[#dfeef8] border-[#3f7396] text-[#252a31]'
                    : 'bg-white border-[#e2dcd0] text-[#252a31] hover:bg-[#efeae0]/50'
                }`}
              >
                <span className="font-extrabold text-sm">{name}</span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleDay(idx)}
                  className="w-5 h-5 accent-[#3f7396] rounded cursor-pointer"
                />
              </label>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-white border border-[#e2dcd0] text-[#252a31] font-extrabold text-sm hover:bg-[#efeae0]/60 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={handleCopy}
            className="flex-1 py-3 px-4 rounded-xl bg-[#3f7396] text-white font-extrabold text-sm shadow-xs hover:bg-[#335f7d] disabled:opacity-50 transition cursor-pointer"
          >
            Copiar ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
};

