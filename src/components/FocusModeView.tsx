import React, { useState } from 'react';
import { RoutineCard, CARD_COLORS, getCardImageSrc } from '../types/routine';
import { resolveFocusWindow } from '../utils/focus';
import {
  ArrowDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  List,
  Sparkles,
  Undo2,
} from 'lucide-react';

interface FocusModeViewProps {
  cards: RoutineCard[];
  doneIds: string[];
  currentMinutes: number;
  dayName: string;
  onToggleDone: (cardId: string) => void;
  onOpenTimer: () => void;
  onExitFocus: () => void;
}

export const FocusModeView: React.FC<FocusModeViewProps> = ({
  cards,
  doneIds,
  currentMinutes,
  dayName,
  onToggleDone,
  onOpenTimer,
  onExitFocus,
}) => {
  const [manualOffset, setManualOffset] = useState(0);
  const [lastCompleted, setLastCompleted] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const baseWindow = resolveFocusWindow(cards, doneIds, currentMinutes, 0);
  const focus = resolveFocusWindow(cards, doneIds, currentMinutes, manualOffset);

  const progressPercent =
    focus.totalCount > 0 ? Math.round((focus.doneCount / focus.totalCount) * 100) : 0;

  const showUndoBanner =
    lastCompleted !== null && doneIds.includes(lastCompleted.id);

  const handleCompleteCurrent = () => {
    if (!focus.current) return;
    setLastCompleted({ id: focus.current.id, title: focus.current.x });
    setManualOffset(0);
    onToggleDone(focus.current.id);
  };

  const handleUndoLast = () => {
    if (!lastCompleted) return;
    onToggleDone(lastCompleted.id);
    setLastCompleted(null);
    setManualOffset(0);
  };

  const handleStep = (delta: -1 | 1) => {
    if (focus.currentIndex < 0 || baseWindow.currentIndex < 0) return;
    const targetIdx = Math.max(
      0,
      Math.min(focus.pending.length - 1, focus.currentIndex + delta)
    );
    setManualOffset(targetIdx - baseWindow.currentIndex);
  };

  const canStepPrev = focus.currentIndex > 0;
  const canStepNext =
    focus.currentIndex >= 0 && focus.currentIndex < focus.pending.length - 1;

  return (
    <div className="space-y-4 pt-1 pb-4 animate-fade-in">
      {/* Calm day progress bar & exit control */}
      <div className="rounded-3xl bg-white border border-[#e2dcd0] p-4 shadow-2xs">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#6b717b]">
              Modo Foco · {dayName}
            </p>
            <p className="text-sm font-extrabold text-[#252a31] mt-0.5 tabular-nums">
              {focus.doneCount} de {focus.totalCount} concluídas
            </p>
          </div>
          <button
            type="button"
            onClick={onExitFocus}
            className="flex-none inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#efeae0]/80 hover:bg-[#efeae0] text-[#252a31] text-xs font-extrabold transition cursor-pointer"
          >
            <List className="w-4 h-4 text-[#3f7396]" />
            <span>Ver lista</span>
          </button>
        </div>

        <div
          className="mt-3 h-2.5 w-full rounded-full bg-[#efeae0] overflow-hidden"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso das atividades de hoje"
        >
          <div
            className="h-full rounded-full bg-[#2f8544] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Gentle 1-tap Undo banner after completing a card */}
      {showUndoBanner && lastCompleted && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#e1f3e5] border border-[#2f8544]/25 text-[#252a31] animate-fade-in"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Check className="w-4 h-4 text-[#2f8544] flex-none stroke-[2.8]" />
            <span className="text-xs sm:text-sm font-extrabold truncate">
              Concluído: {lastCompleted.title}
            </span>
          </div>
          <button
            type="button"
            onClick={handleUndoLast}
            className="flex-none inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-[#2f8544]/25 text-[#2f8544] text-xs font-extrabold hover:bg-[#efeae0]/40 transition cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Desfazer</span>
          </button>
        </div>
      )}

      {focus.totalCount === 0 ? (
        <div className="rounded-3xl bg-white border-2 border-dashed border-[#e2dcd0] p-8 text-center">
          <span className="text-4xl block mb-2">📋</span>
          <h2 className="text-lg font-extrabold text-[#252a31]">
            Nenhuma atividade cadastrada hoje
          </h2>
          <p className="text-xs font-semibold text-[#6b717b] mt-1">
            Volte para a lista para adicionar atividades no quadro de hoje.
          </p>
          <button
            type="button"
            onClick={onExitFocus}
            className="mt-4 px-5 py-2.5 rounded-2xl bg-[#3f7396] text-white font-extrabold text-sm shadow-xs hover:bg-[#335f7d] transition inline-flex items-center gap-2 cursor-pointer"
          >
            <List className="w-4 h-4" />
            <span>Ver lista</span>
          </button>
        </div>
      ) : focus.allDone ? (
        <div className="rounded-3xl bg-[#e1f3e5] border-2 border-[#2f8544]/25 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-white text-[#2f8544] mx-auto flex items-center justify-center shadow-xs mb-3 animate-check-pop">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#252a31]">
            Todas as atividades de hoje foram concluídas!
          </h2>
          <p className="text-sm font-bold text-[#2f8544] mt-1.5">
            Parabéns, ótima rotina hoje 🌟
          </p>
          <button
            type="button"
            onClick={onExitFocus}
            className="mt-5 px-5 py-3 rounded-2xl bg-[#3f7396] text-white font-extrabold text-sm shadow-xs hover:bg-[#335f7d] transition inline-flex items-center gap-2 cursor-pointer"
          >
            <List className="w-4 h-4" />
            <span>Ver rotina completa</span>
          </button>
        </div>
      ) : (
        focus.current && (
          <>
            {/* AGORA (Now) Card */}
            <section
              aria-live="polite"
              aria-label="Atividade atual no Modo Foco"
              style={{
                backgroundColor:
                  CARD_COLORS[focus.current.c % CARD_COLORS.length],
              }}
              className="rounded-3xl border-2 border-[#3f7396] ring-4 ring-[#3f7396]/15 p-5 sm:p-6 shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3f7396] text-white text-xs font-extrabold tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Agora
                  </span>
                  <span className="text-sm sm:text-base font-bold text-[#252a31] font-mono tabular-nums bg-white/85 px-3 py-0.5 rounded-xl border border-black/6">
                    {focus.current.t}
                  </span>
                </div>

                {focus.pending.length > 1 && (
                  <div className="flex items-center gap-1 flex-none">
                    <button
                      type="button"
                      onClick={() => handleStep(-1)}
                      disabled={!canStepPrev}
                      aria-label="Atividade pendente anterior"
                      title="Atividade pendente anterior"
                      className="w-9 h-9 rounded-xl bg-white/85 border border-black/8 flex items-center justify-center text-[#252a31] disabled:opacity-35 hover:bg-white transition cursor-pointer disabled:cursor-default"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-extrabold font-mono tabular-nums text-[#6b717b] px-1">
                      {focus.currentIndex + 1}/{focus.pending.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStep(1)}
                      disabled={!canStepNext}
                      aria-label="Próxima atividade pendente"
                      title="Próxima atividade pendente"
                      className="w-9 h-9 rounded-xl bg-white/85 border border-black/8 flex items-center justify-center text-[#252a31] disabled:opacity-35 hover:bg-white transition cursor-pointer disabled:cursor-default"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-col items-center text-center">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white/90 border border-black/8 shadow-xs flex items-center justify-center overflow-hidden">
                  {(() => {
                    const imageSrc = getCardImageSrc(focus.current);
                    return imageSrc ? (
                      <img
                        src={imageSrc}
                        alt=""
                        className="w-full h-full object-cover rounded-3xl"
                      />
                    ) : (
                      <span className="text-6xl sm:text-7xl leading-none select-none">
                        {focus.current.e}
                      </span>
                    );
                  })()}
                </div>

                <h2 className="mt-4 text-2xl sm:text-3xl font-black text-[#252a31] leading-tight break-words max-w-md">
                  {focus.current.x}
                </h2>
              </div>

              <div className="mt-6 flex items-stretch gap-3">
                <button
                  type="button"
                  onClick={handleCompleteCurrent}
                  className="flex-1 min-h-[52px] px-5 py-3 rounded-2xl bg-[#2f8544] hover:bg-[#266e38] active:scale-[0.98] text-white font-extrabold text-base shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>Concluir</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenTimer}
                  className="min-h-[52px] px-4 sm:px-5 py-3 rounded-2xl bg-white/90 hover:bg-white border border-[#3f7396]/25 text-[#3f7396] font-extrabold text-sm sm:text-base shadow-2xs active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
                  title="Abrir Timer Visual"
                >
                  <Clock className="w-5 h-5" />
                  <span>Timer</span>
                </button>
              </div>
            </section>

            {/* Calm First-Then Connector */}
            <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#6b717b]">
              <ArrowDown className="w-4 h-4 text-[#3f7396]" />
              <span>Depois</span>
            </div>

            {/* DEPOIS (Then) Preview Card */}
            {focus.next ? (
              <section
                aria-label="Próxima atividade depois"
                style={{
                  backgroundColor:
                    CARD_COLORS[focus.next.c % CARD_COLORS.length],
                }}
                className="rounded-3xl border border-black/8 p-4 flex items-center gap-4 shadow-2xs"
              >
                <div className="w-16 h-16 flex-none rounded-2xl bg-white/85 border border-black/6 flex items-center justify-center overflow-hidden">
                  {(() => {
                    const nextImg = getCardImageSrc(focus.next);
                    return nextImg ? (
                      <img
                        src={nextImg}
                        alt=""
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <span className="text-4xl leading-none select-none">
                        {focus.next.e}
                      </span>
                    );
                  })()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/85 text-[#6b717b] text-[11px] font-extrabold uppercase tracking-wide border border-black/6">
                      Depois
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#252a31] font-mono tabular-nums bg-white/85 px-2 py-0.5 rounded-lg border border-black/6">
                      {focus.next.t}
                    </span>
                  </div>
                  <p className="mt-1 text-lg sm:text-xl font-extrabold text-[#252a31] leading-snug truncate">
                    {focus.next.x}
                  </p>
                </div>
              </section>
            ) : (
              <section
                aria-label="Última atividade de hoje"
                className="rounded-3xl bg-white border border-[#e2dcd0] p-4 text-center shadow-2xs"
              >
                <p className="text-sm font-extrabold text-[#252a31]">
                  Última atividade de hoje 🌟
                </p>
                <p className="text-xs font-semibold text-[#6b717b] mt-0.5">
                  Ao concluir, toda a rotina de hoje estará completa.
                </p>
              </section>
            )}
          </>
        )
      )}
    </div>
  );
};
