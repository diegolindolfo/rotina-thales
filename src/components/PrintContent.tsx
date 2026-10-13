import React from 'react';
import { RoutineState, DAY_NAMES, DAY_NAMES_SHORT, CARD_COLORS } from '../types/routine';

interface PrintContentProps {
  state: RoutineState;
  activeDayIndex: number;
  mode: 'day' | 'week';
  isSchoolMode?: boolean;
}

export const PrintContent: React.FC<PrintContentProps> = ({
  state,
  activeDayIndex,
  mode,
  isSchoolMode = false,
}) => {
  const currentCards = isSchoolMode
    ? (state.schoolDays?.[activeDayIndex] || [])
    : (state.days[activeDayIndex] || []);

  const allDays = isSchoolMode
    ? (state.schoolDays || [])
    : state.days;

  return (
    <div className="print-only p-4 max-w-4xl mx-auto">
      {/* Print Header */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-stone-300 mb-6">
        <div className="flex items-center gap-3">
          {state.photo ? (
            <img
              src={state.photo}
              alt={state.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-stone-400"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-stone-200 border-2 border-stone-400 flex items-center justify-center text-3xl font-bold">
              {state.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-black text-black">
              {isSchoolMode ? `Rotina Escolar - ${state.name} (7h às 11h)` : `Rotina do ${state.name}`}
            </h1>
            <p className="text-sm font-bold text-stone-600">
              {mode === 'day' ? `Quadro Diário: ${DAY_NAMES[activeDayIndex]}` : 'Quadro Semanal'}
            </p>
          </div>
        </div>

        <div className="text-right text-xs font-semibold text-stone-500">
          <div>{isSchoolMode ? 'Quadro de Apoio Escolar' : 'Rotina Visual & Apoio'}</div>
          <div>Data: ____/____/________</div>
        </div>
      </div>

      {/* Mode Day */}
      {mode === 'day' && (
        <div className="space-y-3.5">
          {currentCards.map((card) => {
            const bg = CARD_COLORS[card.c % 6];
            return (
              <div
                key={card.id}
                style={{ backgroundColor: bg }}
                className="flex items-center justify-between p-4 rounded-3xl border-2 border-stone-400 break-inside-avoid shadow-xs"
              >
                <div className="flex items-center gap-5">
                  {/* Time */}
                  <span className="text-2xl font-black text-stone-900 w-20 tracking-tight font-mono">
                    {card.t}
                  </span>

                  {/* Icon or Photo */}
                  <div className="w-16 h-16 flex items-center justify-center flex-none rounded-2xl bg-white/80 border border-stone-300">
                    {card.p ? (
                      <img
                        src={card.p}
                        alt=""
                        className="w-16 h-16 object-cover rounded-2xl"
                      />
                    ) : (
                      <span className="text-4xl leading-none">{card.e}</span>
                    )}
                  </div>

                  {/* Task Name */}
                  <span className="text-2xl font-black text-stone-900">{card.x}</span>
                </div>

                {/* Big checkbox for child to mark */}
                <div className="w-10 h-10 rounded-xl border-2 border-stone-700 flex-none bg-white" />
              </div>
            );
          })}
        </div>
      )}

      {/* Mode Week */}
      {mode === 'week' && (
        <div className="w-full overflow-hidden border-2 border-stone-400 rounded-xl">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-stone-100 border-b-2 border-stone-400">
                {DAY_NAMES_SHORT.map((name, i) => (
                  <th
                    key={i}
                    className="p-2 border-r border-stone-300 last:border-r-0 text-center font-black text-xs text-stone-800"
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {allDays.map((dayCards, dayIdx) => (
                  <td
                    key={dayIdx}
                    className="p-1.5 border-r border-stone-300 last:border-r-0 align-top space-y-1.5"
                    style={{ width: '14.28%' }}
                  >
                    {dayCards.length === 0 ? (
                      <span className="text-[10px] text-stone-400 italic">Sem tarefas</span>
                    ) : (
                      dayCards.map((card) => {
                        const bg = CARD_COLORS[card.c % 6];
                        return (
                          <div
                            key={card.id}
                            style={{ backgroundColor: bg }}
                            className="p-1 rounded-lg border border-stone-300 text-[11px] leading-tight flex items-start gap-1"
                          >
                            <span className="font-bold whitespace-nowrap text-stone-900">
                              {card.t}
                            </span>
                            <span className="flex-none">
                              {card.p ? '📷' : card.e}
                            </span>
                            <span className="font-medium text-stone-800 line-clamp-2">
                              {card.x}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
