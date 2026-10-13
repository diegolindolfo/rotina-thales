import React from 'react';
import { RoutineCard, CARD_COLORS } from '../types/routine';
import { Check, ChevronUp, ChevronDown } from 'lucide-react';

interface RoutineCardItemProps {
  card: RoutineCard;
  index: number;
  isDone: boolean;
  isEditMode: boolean;
  isCurrentActive: boolean;
  progressPercent?: number; // 0-100%
  onToggleDone: (id: string) => void;
  onEditCard: (index: number) => void;
  onMoveCard: (index: number, direction: -1 | 1) => void;
}

export const RoutineCardItem: React.FC<RoutineCardItemProps> = ({
  card,
  index,
  isDone,
  isEditMode,
  isCurrentActive,
  progressPercent = 0,
  onToggleDone,
  onEditCard,
  onMoveCard,
}) => {
  const bgHex = CARD_COLORS[card.c % 6];

  const handleClick = () => {
    if (isEditMode) {
      onEditCard(index);
    } else {
      onToggleDone(card.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      style={{ backgroundColor: bgHex }}
      className={`group relative flex items-center justify-between w-full min-h-[96px] sm:min-h-[110px] p-4 sm:p-5 rounded-3xl border-2 transition-all cursor-pointer select-none overflow-hidden ${
        isCurrentActive && !isDone
          ? 'border-[#4a7c9d] shadow-lg ring-4 ring-[#4a7c9d]/25'
          : 'border-transparent shadow-xs hover:border-black/10'
      } ${isDone ? 'opacity-40' : 'opacity-100'}`}
    >
      {/* Subtle elapsed progress bar (when active activity today) */}
      {isCurrentActive && !isDone && progressPercent > 0 && (
        <div
          className="absolute left-0 bottom-0 h-2 bg-[#4a7c9d] transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      )}

      {/* Main card content: Photo/Emoji with prominent size + Info */}
      <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0 pr-3">
        {/* Prominent Image / Emoji Container */}
        <div className="w-18 h-18 sm:w-22 sm:h-22 flex-none rounded-2xl bg-white/70 border border-black/5 shadow-sm flex items-center justify-center overflow-hidden transition-transform group-hover:scale-102">
          {card.p ? (
            <img
              src={card.p}
              alt=""
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <span className="text-5xl sm:text-6xl leading-none select-none drop-shadow-xs">
              {card.e}
            </span>
          )}
        </div>

        {/* Task Title & Time Info */}
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Time badge */}
            <span className="text-sm sm:text-base font-extrabold text-stone-700 font-mono bg-white/80 px-2.5 py-0.5 rounded-lg border border-black/5 shadow-2xs">
              {card.t}
            </span>

            {/* Subtle "Agora" badge inside the active card */}
            {isCurrentActive && !isDone && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4a7c9d] text-white text-[11px] font-black uppercase tracking-wider shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Agora
              </span>
            )}
          </div>

          {/* Task Title */}
          <span
            className={`text-xl sm:text-2xl font-black text-[#2b2f36] leading-tight truncate ${
              isDone ? 'line-through text-stone-500' : ''
            }`}
          >
            {card.x}
          </span>
        </div>
      </div>

      {/* Right side: Done checkmark OR Edit reorder buttons */}
      <div className="flex items-center gap-2 flex-none">
        {isEditMode ? (
          <div
            className="flex flex-col gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => onMoveCard(index, -1)}
              className="w-10 h-8 rounded-xl bg-white/90 hover:bg-white border border-[#e3ded3] flex items-center justify-center text-[#2b2f36] shadow-xs active:scale-95 transition"
              title="Mover para cima"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => onMoveCard(index, 1)}
              className="w-10 h-8 rounded-xl bg-white/90 hover:bg-white border border-[#e3ded3] flex items-center justify-center text-[#2b2f36] shadow-xs active:scale-95 transition"
              title="Mover para baixo"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        ) : isDone ? (
          <div className="w-11 h-11 rounded-full bg-[#3b8a4a] text-white flex items-center justify-center shadow-md flex-none animate-in zoom-in-75 duration-200">
            <Check className="w-7 h-7 stroke-[3]" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full border-2 border-black/20 bg-white/40 group-hover:border-[#4a7c9d] group-hover:bg-white/80 transition flex-none" />
        )}
      </div>
    </div>
  );
};
