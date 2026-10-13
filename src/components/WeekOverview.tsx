import React from 'react';
import { RoutineState, DAY_NAMES, CARD_COLORS } from '../types/routine';
import { Calendar } from 'lucide-react';

interface WeekOverviewProps {
  state: RoutineState;
  todayIndex: number;
  onSelectDay: (dayIndex: number) => void;
  isSchoolMode?: boolean;
}

export const WeekOverview: React.FC<WeekOverviewProps> = ({
  state,
  todayIndex,
  onSelectDay,
  isSchoolMode = false,
}) => {
  const targetDays = isSchoolMode ? (state.schoolDays || []) : state.days;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1 mb-2">
        <h2 className="text-xl font-bold text-[#2b2f36] flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#4a7c9d]" />
          <span>{isSchoolMode ? 'Visão Semanal Escolar (7h às 11h)' : 'Visão Semanal'}</span>
        </h2>
        <span className="text-xs font-semibold text-[#7a7f87]">
          Toque em um dia para abrir
        </span>
      </div>

      {targetDays.map((cards, idx) => {
        const isToday = idx === todayIndex;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectDay(idx)}
            className={`w-full text-left p-4 rounded-2xl bg-white border-2 transition shadow-xs hover:border-[#4a7c9d] ${
              isToday ? 'border-[#4a7c9d] ring-2 ring-[#4a7c9d]/20' : 'border-[#e3ded3]'
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-[#2b2f36]">
                  {DAY_NAMES[idx]}
                </span>
                {isToday && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#4a7c9d] text-white">
                    Hoje
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-[#7a7f87]">
                {cards.length} {cards.length === 1 ? 'atividade' : 'atividades'}
              </span>
            </div>

            {/* List of icons */}
            {cards.length === 0 ? (
              <span className="text-xs text-stone-400 italic">Nenhuma atividade cadastrada</span>
            ) : (
              <div className="flex flex-wrap gap-1.5 items-center">
                {cards.map((c) => {
                  const bg = CARD_COLORS[c.c % 6];
                  return (
                    <span
                      key={c.id}
                      style={{ backgroundColor: bg }}
                      title={`${c.t} - ${c.x}`}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-black/5 text-sm font-medium shadow-2xs"
                    >
                      {c.p ? (
                        <img
                          src={c.p}
                          alt=""
                          className="w-4 h-4 rounded-full object-cover inline"
                        />
                      ) : (
                        <span className="text-base leading-none">{c.e}</span>
                      )}
                      <span className="text-[11px] font-bold text-stone-700">{c.t}</span>
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
