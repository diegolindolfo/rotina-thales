import React from 'react';
import { RoutineBlockId, ROUTINE_BLOCKS } from '../types/routine';

interface RoutineBlocksBarProps {
  activeBlock: RoutineBlockId;
  onSelectBlock: (blockId: RoutineBlockId) => void;
  counts?: Record<RoutineBlockId, number>;
}

export const RoutineBlocksBar: React.FC<RoutineBlocksBarProps> = ({
  activeBlock,
  onSelectBlock,
  counts,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-max px-0.5">
        {/* "Dia todo" button for viewing the complete day */}
        <button
          type="button"
          onClick={() => onSelectBlock('all')}
          className={`flex items-center gap-1.5 px-3.5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer select-none ${
            activeBlock === 'all'
              ? 'bg-[#4a7c9d] text-white shadow-sm ring-2 ring-[#4a7c9d]/30'
              : 'bg-white text-[#48435c] border border-[#e3ded3] hover:bg-stone-50 shadow-2xs'
          }`}
        >
          <span>📋</span>
          <span>Dia todo</span>
          {counts && counts.all > 0 && (
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                activeBlock === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-stone-100 text-[#7a7f87]'
              }`}
            >
              {counts.all}
            </span>
          )}
        </button>

        {ROUTINE_BLOCKS.map((block) => {
          const isDormir = block.id === 'dormir';
          const isSelected = activeBlock === block.id;
          const count = counts ? counts[block.id] : undefined;

          return (
            <button
              key={block.id}
              type="button"
              onClick={() => onSelectBlock(isSelected ? 'all' : block.id)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer select-none active:scale-97 ${
                isDormir
                  ? isSelected
                    ? 'bg-[#2b273b] text-white shadow-md ring-3 ring-[#4a7c9d] border border-white/20'
                    : 'bg-[#38334a] text-white shadow-xs border border-transparent hover:bg-[#2e2a3e]'
                  : isSelected
                  ? 'bg-white text-[#48435c] shadow-md ring-3 ring-[#4a7c9d] border-2 border-[#4a7c9d]'
                  : 'bg-white text-[#48435c] border border-[#e3ded3] hover:bg-stone-50 shadow-2xs'
              }`}
            >
              <span className="text-base sm:text-lg leading-none">{block.emoji}</span>
              <span>{block.label}</span>
              {count !== undefined && count > 0 && (
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                    isDormir
                      ? 'bg-white/20 text-white'
                      : isSelected
                      ? 'bg-[#4a7c9d]/10 text-[#4a7c9d]'
                      : 'bg-stone-100 text-[#7a7f87]'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
