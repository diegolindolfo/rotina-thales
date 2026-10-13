import React, { useState } from 'react';
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

  if (!isOpen) return null;

  const toggleDay = (idx: number) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]
    );
  };

  const handleSelectAllWeekdays = () => {
    setSelected([0, 1, 2, 3, 4].filter((d) => d !== sourceDayIndex));
  };

  const handleCopy = () => {
    if (selected.length === 0) return;
    onCopy(selected);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-3xl bg-[#f6f3ec] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#e3ded3]">
          <h3 className="text-xl font-bold text-[#2b2f36] flex items-center gap-2">
            <Copy className="w-5 h-5 text-[#4a7c9d]" />
            <span>Copiar {DAY_NAMES[sourceDayIndex]} para...</span>
          </h3>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#e3ded3] text-[#7a7f87] hover:text-[#2b2f36]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#7a7f87] mt-3 mb-4 leading-relaxed font-medium">
          Selecione para quais dias você deseja aplicar a rotina de{' '}
          <strong>{DAY_NAMES[sourceDayIndex]}</strong>. Os cartões existentes nesses dias serão substituídos.
        </p>

        {sourceDayIndex >= 0 && sourceDayIndex <= 4 && (
          <button
            type="button"
            onClick={handleSelectAllWeekdays}
            className="mb-3 text-xs font-bold text-[#4a7c9d] hover:underline flex items-center gap-1"
          >
            + Selecionar todos os dias de semana (Seg a Sex)
          </button>
        )}

        <div className="space-y-2 mb-6">
          {DAY_NAMES.map((name, idx) => {
            if (idx === sourceDayIndex) return null;
            const isChecked = selected.includes(idx);
            return (
              <label
                key={idx}
                className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer select-none ${
                  isChecked
                    ? 'bg-[#dcebf5] border-[#4a7c9d] text-[#2b2f36]'
                    : 'bg-white border-[#e3ded3] text-[#2b2f36] hover:bg-stone-50'
                }`}
              >
                <span className="font-bold text-sm">{name}</span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleDay(idx)}
                  className="w-5 h-5 accent-[#4a7c9d] rounded"
                />
              </label>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-white border border-[#e3ded3] text-[#2b2f36] font-bold text-sm hover:bg-stone-50 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={handleCopy}
            className="flex-1 py-3 px-4 rounded-xl bg-[#4a7c9d] text-white font-bold text-sm shadow-sm hover:bg-[#3d6884] disabled:opacity-50 transition"
          >
            Copiar para {selected.length} dia{selected.length === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    </div>
  );
};
