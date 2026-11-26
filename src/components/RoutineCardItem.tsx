import React from 'react';
import { RoutineCard, CARD_COLORS, getCardImageSrc } from '../types/routine';
import { Check, Pencil } from 'lucide-react';

interface RoutineCardItemProps {
  card: RoutineCard;
  index: number;
  isDone: boolean;
  isEditMode: boolean;
  isCurrentActive: boolean;
  progressPercent?: number; // 0-100%
  onToggleDone: (id: string) => void;
  onEditCard: (index: number) => void;
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
}) => {
  const bgHex = CARD_COLORS[card.c % CARD_COLORS.length];
  const imageSrc = getCardImageSrc(card);

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
      aria-pressed={!isEditMode ? isDone : undefined}
      aria-label={
        isEditMode
          ? `Editar atividade ${card.x} às ${card.t}`
          : `${card.x} às ${card.t} - ${isDone ? 'Concluída' : 'Marcar como concluída'}`
      }
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      style={{ backgroundColor: bgHex }}
      className={`group relative flex items-center justify-between w-full min-h-[100px] sm:min-h-[112px] p-4 sm:p-5 rounded-3xl border-2 transition-all cursor-pointer select-none overflow-hidden active:scale-[0.99] ${
        isCurrentActive && !isDone
          ? 'border-[#3f7396] ring-4 ring-[#3f7396]/15 shadow-md'
          : isDone
          ? 'border-black/5 shadow-none'
          : 'border-black/6 shadow-xs hover:border-black/15 hover:shadow-sm'
      }`}
    >
      {/* Subtle elapsed progress bar (when active activity today) */}
      {isCurrentActive && !isDone && progressPercent > 0 && (
        <div
          className="absolute left-0 bottom-0 h-1.5 bg-[#3f7396]/45 transition-all duration-1000 ease-linear rounded-r-full"
          style={{ width: `${Math.min(100, Math.max(4, progressPercent))}%` }}
        />
      )}

      {/* Main card content: Photo/Emoji with prominent size + Info */}
      <div
        className={`flex items-center gap-4 sm:gap-5 flex-1 min-w-0 pr-3 transition-opacity ${
          isDone ? 'opacity-55' : 'opacity-100'
        }`}
      >
        {/* Prominent Image / Emoji Container */}
        <div className="w-18 h-18 sm:w-21 sm:h-21 flex-none rounded-2xl bg-white/80 border border-black/6 shadow-2xs flex items-center justify-center overflow-hidden transition-transform group-hover:scale-103">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt=""
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <span className="text-5xl sm:text-[56px] leading-none select-none">
              {card.e}
            </span>
          )}
        </div>

        {/* Task Title & Time Info */}
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Time badge */}
            <span className="text-sm sm:text-base font-bold text-[#252a31] font-mono tabular-nums bg-white/85 px-2.5 py-0.5 rounded-lg border border-black/6 shadow-2xs">
              {card.t}
            </span>

            {/* Calm "Agora" badge inside the active card */}
            {isCurrentActive && !isDone && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3f7396] text-white text-xs font-extrabold tracking-wide shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Agora
              </span>
            )}
          </div>

          {/* Task Title */}
          <span
            className={`text-xl sm:text-2xl font-extrabold text-[#252a31] leading-snug break-words ${
              isDone ? 'line-through decoration-2 text-[#6b717b]' : ''
            }`}
          >
            {card.x}
          </span>
        </div>
      </div>

      {/* Right side: Done check circle OR Edit indicator */}
      <div className="flex items-center gap-2 flex-none pl-1">
        {isEditMode ? (
          <div
            className="w-11 h-11 rounded-2xl bg-white/90 border border-[#e2dcd0] flex items-center justify-center text-[#3f7396] shadow-2xs group-hover:bg-[#3f7396] group-hover:text-white group-hover:border-[#3f7396] transition-colors"
            title="Editar cartão"
          >
            <Pencil className="w-5 h-5" />
          </div>
        ) : isDone ? (
          <div
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#2f8544] text-white flex items-center justify-center shadow-md flex-none animate-check-pop ring-4 ring-white/60"
            title="Concluído!"
          >
            <Check className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3.2]" />
          </div>
        ) : (
          <div
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/75 border-2 border-[#252a31]/20 group-hover:border-[#3f7396] group-hover:bg-white flex items-center justify-center shadow-2xs transition-all flex-none"
            title="Toque para concluir"
          >
            <Check className="w-5 h-5 text-transparent group-hover:text-[#3f7396]/40 stroke-[2.5] transition-colors" />
          </div>
        )}
      </div>
    </div>
  );
};

