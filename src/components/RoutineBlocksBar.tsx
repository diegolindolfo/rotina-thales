import React from 'react';
import { RoutineBlockConfig, RoutineBlockId } from '../types/routine';
import { Check } from 'lucide-react';

interface RoutineBlocksBarProps {
  blocks: RoutineBlockConfig[];
  activeBlock: RoutineBlockId;
  onSelectBlock: (blockId: RoutineBlockId) => void;
  blockCounts?: Partial<Record<RoutineBlockId, { total: number; done: number }>>;
  showDoneProgress?: boolean;
}

export const RoutineBlocksBar: React.FC<RoutineBlocksBarProps> = ({
  blocks,
  activeBlock,
  onSelectBlock,
  blockCounts,
  showDoneProgress = false,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1" role="tablist" aria-label="Períodos do dia">
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-max px-0.5">
        {blocks.map((block) => {
          const isDormir = block.id === 'dormir';
          const isSelected = activeBlock === block.id;
          const counts = blockCounts?.[block.id];
          const total = counts?.total ?? 0;
          const done = counts?.done ?? 0;
          const isAllDone = showDoneProgress && total > 0 && done === total;

          return (
            <button
              key={block.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectBlock(block.id)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-sm sm:text-base font-extrabold transition-all cursor-pointer select-none active:scale-97 border ${
                isSelected
                  ? isDormir
                    ? 'bg-[#2f2b41] text-white border-[#2f2b41] shadow-md ring-2 ring-[#2f2b41]/20'
                    : 'bg-[#3f7396] text-white border-[#3f7396] shadow-md ring-2 ring-[#3f7396]/20'
                  : 'bg-white text-[#252a31] border-[#e2dcd0] hover:bg-[#efeae0]/70 hover:border-[#d2cabd] shadow-2xs'
              }`}
            >
              <span className="text-base sm:text-lg leading-none">{block.emoji}</span>
              <span>{block.label}</span>
              {total > 0 && (
                <span
                  className={`inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-extrabold leading-none transition-colors ${
                    isAllDone
                      ? isSelected
                        ? 'bg-white text-[#2f8544]'
                        : 'bg-[#e1f3e5] text-[#2f8544]'
                      : isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-[#f6f3ec] text-[#6b717b]'
                  }`}
                >
                  {isAllDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : showDoneProgress && done > 0 ? `${done}/${total}` : total}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

