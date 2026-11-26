import React from 'react';
import { RoutineState, DAY_NAMES, CARD_COLORS, getCardImageSrc } from '../types/routine';
import { Calendar, Check } from 'lucide-react';

interface WeekOverviewProps {
  state: RoutineState;
  todayIndex: number;
  onSelectDay: (dayIndex: number) => void;
}

export const WeekOverview: React.FC<WeekOverviewProps> = ({
  state,
  todayIndex,
  onSelectDay,
}) => {
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center justify-between px-1 mb-2">
        <h2 className="text-xl font-extrabold text-[#252a31] flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#3f7396]" />
          <span>Visão Semanal</span>
        </h2>
        <span className="text-xs font-bold text-[#6b717b]">
          Toque em um dia para abrir
        </span>
      </div>

      {state.days.map((cards, idx) => {
        const isToday = idx === todayIndex;
        const doneCount = isToday
          ? cards.filter((c) => state.done.ids.includes(c.id)).length
          : 0;

        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectDay(idx)}
            className={`w-full text-left p-4 rounded-3xl bg-white border-2 transition shadow-2xs hover:border-[#3f7396] cursor-pointer ${
              isToday ? 'border-[#3f7396] ring-3 ring-[#3f7396]/15' : 'border-[#e2dcd0]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-[#252a31]">
                  {DAY_NAMES[idx]}
                </span>
                {isToday && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#3f7396] text-white">
                    Hoje
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isToday && cards.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e1f3e5] text-[#2f8544] text-xs font-extrabold">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    {doneCount}/{cards.length}
                  </span>
                )}
                <span className="text-xs font-extrabold text-[#6b717b]">
                  {cards.length} {cards.length === 1 ? 'atividade' : 'atividades'}
                </span>
              </div>
            </div>

            {/* List of icons */}
            {cards.length === 0 ? (
              <span className="text-xs text-[#6b717b] italic">Nenhuma atividade cadastrada</span>
            ) : (
              <div className="flex flex-wrap gap-1.5 items-center">
                {cards.map((c) => {
                  const bg = CARD_COLORS[c.c % CARD_COLORS.length];
                  const imageSrc = getCardImageSrc(c);
                  return (
                    <span
                      key={c.id}
                      style={{ backgroundColor: bg }}
                      title={`${c.t} - ${c.x}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-black/6 text-sm font-bold shadow-2xs"
                    >
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt=""
                          className="w-5 h-5 rounded-md object-cover inline"
                        />
                      ) : (
                        <span className="text-base leading-none">{c.e}</span>
                      )}
                      <span className="text-[11px] font-bold font-mono tabular-nums text-[#252a31]">
                        {c.t}
                      </span>
                    </span>
                  );
                })}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

