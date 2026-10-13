import React from 'react';
import { RoutineBlockId, ROUTINE_BLOCKS } from '../types/routine';

interface RoutineBlocksBarProps {
  activeBlock: RoutineBlockId;
  onSelectBlock: (blockId: RoutineBlockId) => void;
}

export const RoutineBlocksBar: React.FC<RoutineBlocksBarProps> = ({
  activeBlock,
  onSelectBlock,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-2 sm:gap-3 min-w-max px-0.5">
        {ROUTINE_BLOCKS.map((block) => {
          const isDormir = block.id === 'dormir';
          const isSelected = activeBlock === block.id;

          return (
            <button
              key={block.id}
              type="button"
              onClick={() => onSelectBlock(block.id)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-extrabold transition-all cursor-pointer select-none active:scale-97 ${
                isDormir
                  ? isSelected
                    ? 'bg-[#322e43] text-white shadow-md ring-2 ring-[#e3ded3] border border-white/20'
                    : 'bg-[#3a354c] text-white/95 shadow-xs border border-transparent hover:bg-[#322e43]'
                  : isSelected
                  ? 'bg-white text-[#3e3a50] shadow-md ring-2 ring-[#4a7c9d] border-2 border-[#4a7c9d]'
                  : 'bg-white text-[#48435c] border border-[#e3ded3] hover:bg-stone-50 shadow-2xs'
              }`}
            >
              <span className="text-base sm:text-lg leading-none">{block.emoji}</span>
              <span>{block.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
