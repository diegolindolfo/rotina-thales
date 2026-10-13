/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  RoutineState,
  RoutineCard,
  DAY_NAMES,
  DAY_NAMES_SHORT,
  TimerConfig,
  RoutineBlockId,
  ROUTINE_BLOCKS,
  getCardBlockId,
} from './types/routine';
import {
  loadRoutineState,
  saveRoutineState,
  toMinutes,
  nowMinutes,
  getFormattedCurrentTime,
  getTodayDateString,
  uid,
} from './utils/storage';
import { playSound } from './utils/sound';
import { RoutineCardItem } from './components/RoutineCardItem';
import { RoutineBlocksBar } from './components/RoutineBlocksBar';
import { WeekOverview } from './components/WeekOverview';
import { VisualTimerModal } from './components/VisualTimerModal';
import { CardEditModal } from './components/CardEditModal';
import { ProfileModal } from './components/ProfileModal';
import { CopyDayModal } from './components/CopyDayModal';
import { PrintModal } from './components/PrintModal';
import { PrintContent } from './components/PrintContent';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  Calendar,
  Pencil,
  Clock,
  Printer,
  Copy,
  Plus,
  ArrowUpDown,
  RotateCcw,
  Volume2,
  VolumeX,
  User,
  Download,
  Upload,
} from 'lucide-react';

export default function App() {
  const [state, setState] = useState<RoutineState>(() => loadRoutineState());

  // Current day of the week (0 = Monday, 6 = Sunday)
  const getTodayIndex = () => (new Date().getDay() + 6) % 7;
  const [todayIndex, setTodayIndex] = useState(getTodayIndex);
  const [activeDayIndex, setActiveDayIndex] = useState(getTodayIndex);

  // View modes
  const [isEditMode, setIsEditMode] = useState(false);
  const [isWeekView, setIsWeekView] = useState(false);

  // Active routine block filter ('all', 'manha', 'escola', 'volta', 'dormir')
  const [activeBlock, setActiveBlock] = useState<RoutineBlockId>('all');

  // Live time tracking
  const [currentMinutes, setCurrentMinutes] = useState(nowMinutes);

  // Modals
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCardIndex, setEditingCardIndex] = useState<number | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printMode, setPrintMode] = useState<'day' | 'week'>('day');

  const fileImportRef = useRef<HTMLInputElement>(null);

  // Keep time synced every 10s
  useEffect(() => {
    const timer = setInterval(() => {
      const newToday = getTodayIndex();
      setTodayIndex(newToday);
      setCurrentMinutes(nowMinutes());

      // Auto-reset daily checked items if day changed
      const todayStr = getTodayDateString();
      setState((prev) => {
        if (prev.done.d !== todayStr) {
          const updated = {
            ...prev,
            done: { d: todayStr, ids: [] },
          };
          saveRoutineState(updated);
          return updated;
        }
        return prev;
      });
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  // Update routine state helper
  const updateState = (updater: (prev: RoutineState) => RoutineState) => {
    setState((prev) => {
      const next = updater(prev);
      saveRoutineState(next);
      return next;
    });
  };

  // Day cards list
  const currentDayCards = state.days[activeDayIndex] || [];

  // Update active days array helper
  const updateCurrentDays = (newDays: RoutineCard[][]) => {
    updateState((prev) => ({
      ...prev,
      days: newDays,
    }));
  };

  // Count items per block for current day
  const blockCounts: Record<RoutineBlockId, number> = {
    all: currentDayCards.length,
    manha: currentDayCards.filter((c) => getCardBlockId(c.t) === 'manha').length,
    escola: currentDayCards.filter((c) => getCardBlockId(c.t) === 'escola').length,
    volta: currentDayCards.filter((c) => getCardBlockId(c.t) === 'volta').length,
    dormir: currentDayCards.filter((c) => getCardBlockId(c.t) === 'dormir').length,
  };

  // Filtered cards based on activeBlock
  const visibleCards =
    activeBlock === 'all'
      ? currentDayCards
      : currentDayCards.filter((c) => getCardBlockId(c.t) === activeBlock);

  // Toggle task done
  const handleToggleDone = (cardId: string) => {
    const doneIds = state.done.ids;
    const isDone = doneIds.includes(cardId);
    const newDoneIds = isDone
      ? doneIds.filter((id) => id !== cardId)
      : [...doneIds, cardId];

    updateState((prev) => ({
      ...prev,
      done: {
        ...prev.done,
        ids: newDoneIds,
      },
    }));

    playSound(isDone ? 'undo' : 'ok', state.fx ?? true);
  };

  // Reset done tasks for the day
  const handleResetDone = () => {
    if (state.done.ids.length === 0) return;
    if (confirm('Deseja desmarcar todas as atividades concluídas de hoje?')) {
      updateState((prev) => ({
        ...prev,
        done: {
          ...prev.done,
          ids: [],
        },
      }));
      playSound('undo', state.fx ?? true);
    }
  };

  // Toggle sound effects
  const handleToggleSound = () => {
    const newFx = !(state.fx ?? true);
    updateState((prev) => ({
      ...prev,
      fx: newFx,
    }));
    if (newFx) {
      playSound('ok', true);
    }
  };

  // Move card up or down
  const handleMoveCard = (index: number, direction: -1 | 1) => {
    const cards = [...(state.days[activeDayIndex] || [])];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= cards.length) return;

    const temp = cards[index];
    cards[index] = cards[targetIdx];
    cards[targetIdx] = temp;

    const newDays = [...state.days];
    newDays[activeDayIndex] = cards;
    updateCurrentDays(newDays);
  };

  // Sort cards chronologically
  const handleSortCards = () => {
    const newDays = [...state.days];
    newDays[activeDayIndex] = [...(state.days[activeDayIndex] || [])].sort((a, b) =>
      a.t.localeCompare(b.t)
    );
    updateCurrentDays(newDays);
    playSound('ok', state.fx ?? true);
  };

  // Open modal to add card
  const handleOpenAddCard = () => {
    setEditingCardIndex(null);
    setIsCardModalOpen(true);
  };

  // Open modal to edit card
  const handleOpenEditCard = (index: number) => {
    setEditingCardIndex(index);
    setIsCardModalOpen(true);
  };

  // Save card (new or edit)
  const handleSaveCard = (card: RoutineCard, index: number | null) => {
    const newDays = [...state.days];
    const dayCards = [...(newDays[activeDayIndex] || [])];

    if (index !== null && index >= 0) {
      dayCards[index] = card;
    } else {
      dayCards.push(card);
    }

    newDays[activeDayIndex] = dayCards;
    updateCurrentDays(newDays);
    playSound('ok', state.fx ?? true);
  };

  // Delete card
  const handleDeleteCard = (index: number) => {
    const newDays = [...state.days];
    const dayCards = [...(newDays[activeDayIndex] || [])];
    dayCards.splice(index, 1);
    newDays[activeDayIndex] = dayCards;
    updateCurrentDays(newDays);
  };

  // Copy current day to other days
  const handleCopyDayTo = (targetDays: number[]) => {
    const currentCards = state.days[activeDayIndex] || [];
    const newDays = [...state.days];
    targetDays.forEach((targetDay) => {
      newDays[targetDay] = currentCards.map((c) => ({
        ...c,
        id: uid(),
      }));
    });
    updateCurrentDays(newDays);
    playSound('ok', state.fx ?? true);
  };

  // Save profile info
  const handleSaveProfile = (name: string, photo?: string) => {
    updateState((prev) => ({
      ...prev,
      name,
      photo,
    }));
    playSound('ok', state.fx ?? true);
  };

  // Save timer config
  const handleSaveTimerConfig = (tmConfig: TimerConfig) => {
    updateState((prev) => ({
      ...prev,
      tm: tmConfig,
    }));
  };

  // Print handlers
  const handleTriggerPrint = (mode: 'day' | 'week') => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rotina-${state.name.toLowerCase()}-${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as RoutineState;
        if (parsed && Array.isArray(parsed.days) && parsed.days.length === 7) {
          setState(parsed);
          saveRoutineState(parsed);
          alert('Rotina restaurada com sucesso!');
        } else {
          alert('Arquivo de rotina inválido.');
        }
      } catch {
        alert('Não foi possível ler o arquivo.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const isViewingToday = !isEditMode && activeDayIndex === todayIndex;

  // Calculate next card index relative to now
  const nextCardIndex = isViewingToday
    ? currentDayCards.findIndex((c) => toMinutes(c.t) > currentMinutes)
    : -1;

  // Currently active card index (subtle highlight inside card)
  const activeCardIndex =
    isViewingToday && currentDayCards.length > 0
      ? (nextCardIndex < 0 ? currentDayCards.length : nextCardIndex) - 1
      : -1;

  // Determine default time for new card based on activeBlock
  const defaultNewCardTime =
    activeBlock === 'manha'
      ? '06:30'
      : activeBlock === 'escola'
      ? '08:00'
      : activeBlock === 'volta'
      ? '13:00'
      : activeBlock === 'dormir'
      ? '20:30'
      : '08:00';

  const activeBlockConfig = ROUTINE_BLOCKS.find((b) => b.id === activeBlock);

  return (
    <>
      {/* Offline Status Toast */}
      <OfflineIndicator />

      {/* Printable Content (visible only on @media print) */}
      <PrintContent
        state={state}
        activeDayIndex={activeDayIndex}
        mode={printMode}
      />

      {/* Main Web App UI (hidden during print) */}
      <div className="no-print min-h-screen bg-[#f6f3ec] text-[#2b2f36] pb-28 pt-safe">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#f6f3ec]/95 backdrop-blur-md border-b border-[#e3ded3] px-4 py-3 sm:py-3.5">
          <div className="max-w-2xl mx-auto space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              {/* Child Profile Widget */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-3 cursor-pointer group select-none min-w-0"
                title="Clique para editar o perfil"
              >
                <div className="relative">
                  {state.photo ? (
                    <img
                      src={state.photo}
                      alt={state.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shadow-xs border-2 border-white ring-2 ring-[#e3ded3] group-hover:ring-[#4a7c9d] transition"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border-2 border-[#e3ded3] flex items-center justify-center text-[#4a7c9d] shadow-xs group-hover:border-[#4a7c9d] transition">
                      <User className="w-7 h-7" />
                    </div>
                  )}
                  {isEditMode && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#4a7c9d] rounded-full flex items-center justify-center text-[10px] text-white">
                      ✎
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-black text-[#2b2f36] truncate flex items-center gap-1.5">
                    <span>Rotina do {state.name}</span>
                    {isEditMode && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#4a7c9d] text-white font-bold">
                        Edição
                      </span>
                    )}
                  </h1>
                  <div className="text-xs font-semibold text-[#7a7f87] flex items-center gap-2">
                    <span>{DAY_NAMES[activeDayIndex]}</span>
                    <span>•</span>
                    <span>{currentDayCards.length} tarefas</span>
                    {activeBlock !== 'all' && (
                      <>
                        <span>•</span>
                        <span className="font-extrabold text-[#4a7c9d]">
                          {activeBlockConfig?.label}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons in Header */}
              <div className="flex items-center gap-2 flex-none">
                {/* PWA Install Button */}
                <PWAInstallButton />

                {/* Week toggle */}
                <button
                  type="button"
                  onClick={() => setIsWeekView(!isWeekView)}
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition shadow-xs ${
                    isWeekView
                      ? 'bg-[#4a7c9d] text-white border-[#4a7c9d]'
                      : 'bg-white border-[#e3ded3] text-[#2b2f36] hover:bg-stone-50'
                  }`}
                  title="Visão Semanal"
                  aria-label="Visão Semanal"
                >
                  <Calendar className="w-5 h-5" />
                </button>

                {/* Edit mode toggle */}
                <button
                  type="button"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition shadow-xs ${
                    isEditMode
                      ? 'bg-[#4a7c9d] text-white border-[#4a7c9d]'
                      : 'bg-white border-[#e3ded3] text-[#2b2f36] hover:bg-stone-50'
                  }`}
                  title={isEditMode ? 'Sair da edição' : 'Modo edição'}
                  aria-label="Editar rotina"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Day Tabs */}
        <div className="max-w-2xl mx-auto px-4 pt-3 pb-1">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {DAY_NAMES_SHORT.map((shortName, idx) => {
              const isSelected = idx === activeDayIndex && !isWeekView;
              const isToday = idx === todayIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsWeekView(false);
                    setActiveDayIndex(idx);
                  }}
                  className={`flex-1 min-w-[44px] py-2.5 rounded-xl text-center text-sm font-extrabold border transition shadow-2xs ${
                    isSelected
                      ? 'bg-[#4a7c9d] text-white border-[#4a7c9d] shadow-sm'
                      : isToday
                      ? 'bg-white border-[#4a7c9d] text-[#4a7c9d]'
                      : 'bg-white border-[#e3ded3] text-[#7a7f87] hover:bg-stone-50'
                  }`}
                >
                  <div>{shortName}</div>
                  {isToday && (
                    <div
                      className={`w-1.5 h-1.5 rounded-full mx-auto mt-0.5 ${
                        isSelected ? 'bg-white' : 'bg-[#4a7c9d]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Routine Blocks Organization Bar (Manhã de escola, Na escola, Volta da escola, Hora de dormir) */}
          {!isWeekView && (
            <div className="pt-2">
              <RoutineBlocksBar
                activeBlock={activeBlock}
                onSelectBlock={setActiveBlock}
                counts={blockCounts}
              />
            </div>
          )}
        </div>

        {/* Content Area */}
        <main className="max-w-2xl mx-auto px-4 py-2">
          {isWeekView ? (
            /* Week Overview Screen */
            <WeekOverview
              state={state}
              todayIndex={todayIndex}
              onSelectDay={(dayIdx) => {
                setActiveDayIndex(dayIdx);
                setIsWeekView(false);
              }}
            />
          ) : (
            /* Day View */
            <div>
              {/* Day Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-2xl font-black text-[#2b2f36] flex items-center gap-2">
                  <span>{DAY_NAMES[activeDayIndex]}</span>
                  {activeDayIndex === todayIndex && (
                    <span className="text-sm font-bold text-[#4a7c9d]">
                      · hoje
                    </span>
                  )}
                </h2>

                {/* Progress / Tasks Summary */}
                {visibleCards.length > 0 && !isEditMode && (
                  <div className="text-xs font-bold text-[#7a7f87]">
                    {
                      visibleCards.filter((c) => state.done.ids.includes(c.id))
                        .length
                    }{' '}
                    / {visibleCards.length} concluídas
                  </div>
                )}
              </div>

              {/* Cards List */}
              {currentDayCards.length === 0 ? (
                <div className="rounded-3xl bg-white border-2 border-dashed border-[#e3ded3] p-8 text-center my-6">
                  <span className="text-4xl block mb-2">📋</span>
                  <h3 className="text-lg font-bold text-[#2b2f36]">
                    Nenhum cartão neste dia
                  </h3>
                  <p className="text-xs text-[#7a7f87] mt-1 mb-4">
                    Adicione atividades ou copie a rotina de outro dia.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddCard}
                    className="px-5 py-2.5 rounded-xl bg-[#4a7c9d] text-white font-bold text-sm shadow-sm hover:bg-[#3d6884] transition inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Primeira Atividade
                  </button>
                </div>
              ) : visibleCards.length === 0 ? (
                <div className="rounded-3xl bg-white border-2 border-dashed border-[#e3ded3] p-8 text-center my-6">
                  <span className="text-4xl block mb-2">{activeBlockConfig?.emoji || '📋'}</span>
                  <h3 className="text-lg font-bold text-[#2b2f36]">
                    Nenhuma atividade em {activeBlockConfig?.label}
                  </h3>
                  <p className="text-xs text-[#7a7f87] mt-1 mb-4">
                    {activeBlockConfig?.timeRange}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      type="button"
                      onClick={handleOpenAddCard}
                      className="px-5 py-2.5 rounded-xl bg-[#4a7c9d] text-white font-bold text-sm shadow-sm hover:bg-[#3d6884] transition inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar em {activeBlockConfig?.label}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveBlock('all')}
                      className="px-4 py-2.5 rounded-xl bg-white border border-[#e3ded3] text-[#2b2f36] font-bold text-sm hover:bg-stone-50 transition"
                    >
                      Ver Dia Todo
                    </button>
                  </div>
                </div>
              ) : activeBlock === 'all' ? (
                /* Grouped by 4 Routine Blocks (Manhã de escola, Na escola, Volta da escola, Hora de dormir) */
                <div className="space-y-6">
                  {ROUTINE_BLOCKS.map((block) => {
                    const blockCards = currentDayCards.filter(
                      (c) => getCardBlockId(c.t) === block.id
                    );
                    if (blockCards.length === 0) return null;

                    const isDormir = block.id === 'dormir';

                    return (
                      <section key={block.id} className="space-y-2.5">
                        {/* Section Header matching the pill motif */}
                        <div className="flex items-center justify-between px-1.5 pt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xl sm:text-2xl leading-none">
                              {block.emoji}
                            </span>
                            <h3
                              className={`text-base sm:text-lg font-black ${
                                isDormir ? 'text-[#363248]' : 'text-[#2b2f36]'
                              }`}
                            >
                              {block.label}
                            </h3>
                          </div>
                          <span className="text-[11px] font-bold text-[#7a7f87] bg-white/80 px-2.5 py-0.5 rounded-full border border-black/5 shadow-2xs">
                            {block.timeRange}
                          </span>
                        </div>

                        {/* Cards in this block */}
                        <div className="space-y-3">
                          {blockCards.map((card) => {
                            const originalIdx = currentDayCards.findIndex(
                              (c) => c.id === card.id
                            );
                            const isDone = state.done.ids.includes(card.id);
                            const isCurrentActive =
                              isViewingToday && originalIdx === activeCardIndex;

                            let progressPercent = 0;
                            if (isCurrentActive && currentDayCards[originalIdx + 1]) {
                              const start = toMinutes(card.t);
                              const end = toMinutes(currentDayCards[originalIdx + 1].t);
                              if (end > start) {
                                progressPercent =
                                  ((currentMinutes - start) / (end - start)) * 100;
                              }
                            }

                            return (
                              <RoutineCardItem
                                key={card.id}
                                card={card}
                                index={originalIdx}
                                isDone={isDone}
                                isEditMode={isEditMode}
                                isCurrentActive={isCurrentActive}
                                progressPercent={progressPercent}
                                onToggleDone={handleToggleDone}
                                onEditCard={handleOpenEditCard}
                                onMoveCard={handleMoveCard}
                              />
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}
                </div>
              ) : (
                /* Filtered View for single active block */
                <div className="space-y-3">
                  {visibleCards.map((card) => {
                    const originalIdx = currentDayCards.findIndex(
                      (c) => c.id === card.id
                    );
                    const isDone = state.done.ids.includes(card.id);
                    const isCurrentActive =
                      isViewingToday && originalIdx === activeCardIndex;

                    let progressPercent = 0;
                    if (isCurrentActive && currentDayCards[originalIdx + 1]) {
                      const start = toMinutes(card.t);
                      const end = toMinutes(currentDayCards[originalIdx + 1].t);
                      if (end > start) {
                        progressPercent =
                          ((currentMinutes - start) / (end - start)) * 100;
                      }
                    }

                    return (
                      <RoutineCardItem
                        key={card.id}
                        card={card}
                        index={originalIdx}
                        isDone={isDone}
                        isEditMode={isEditMode}
                        isCurrentActive={isCurrentActive}
                        progressPercent={progressPercent}
                        onToggleDone={handleToggleDone}
                        onEditCard={handleOpenEditCard}
                        onMoveCard={handleMoveCard}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Bottom Fixed Action Bar */}
        <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#f6f3ec]/95 backdrop-blur-md border-t border-[#e3ded3] px-4 py-2.5 sm:py-3 pb-safe">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
            {isEditMode && !isWeekView ? (
              /* Edit Mode Actions */
              <>
                <button
                  type="button"
                  onClick={handleOpenAddCard}
                  className="flex-1 py-3 px-3 rounded-2xl bg-[#4a7c9d] text-white font-bold text-sm shadow-sm hover:bg-[#3d6884] active:scale-95 transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cartão</span>
                </button>

                <button
                  type="button"
                  onClick={handleSortCards}
                  className="py-3 px-3 rounded-2xl bg-white border border-[#e3ded3] text-[#2b2f36] font-bold text-sm hover:bg-stone-50 active:scale-95 transition flex items-center justify-center gap-1.5"
                  title="Ordenar por horário"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span className="hidden sm:inline">Ordenar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCopyModalOpen(true)}
                  className="py-3 px-3 rounded-2xl bg-white border border-[#e3ded3] text-[#2b2f36] font-bold text-sm hover:bg-stone-50 active:scale-95 transition flex items-center justify-center gap-1.5"
                  title="Copiar dia"
                >
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copiar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsProfileOpen(true)}
                  className="py-3 px-3 rounded-2xl bg-white border border-[#e3ded3] text-[#2b2f36] font-bold text-sm hover:bg-stone-50 active:scale-95 transition flex items-center justify-center gap-1.5"
                  title="Perfil e foto"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Perfil</span>
                </button>
              </>
            ) : (
              /* Normal Viewing Mode Actions */
              <>
                {/* Visual Timer button (Primary action) */}
                <button
                  type="button"
                  onClick={() => setIsTimerOpen(true)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-[#4a7c9d] text-white font-bold text-base shadow-sm hover:bg-[#3d6884] active:scale-95 transition flex items-center justify-center gap-2"
                >
                  <Clock className="w-5 h-5" />
                  <span>Timer</span>
                </button>

                {/* Print button */}
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="py-3 px-3 sm:px-4 rounded-2xl bg-white border border-[#e3ded3] text-[#2b2f36] font-bold text-sm hover:bg-stone-50 active:scale-95 transition flex items-center justify-center gap-1.5"
                  title="Imprimir quadro"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Imprimir</span>
                </button>

                {/* Clear / Reset done tasks */}
                {!isWeekView && (
                  <button
                    type="button"
                    onClick={handleResetDone}
                    disabled={state.done.ids.length === 0}
                    className="py-3 px-3 sm:px-4 rounded-2xl bg-white border border-[#e3ded3] text-[#2b2f36] font-bold text-sm hover:bg-stone-50 disabled:opacity-40 active:scale-95 transition flex items-center justify-center gap-1.5"
                    title="Desmarcar tarefas concluídas"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Limpar</span>
                  </button>
                )}

                {/* Sound effect toggle */}
                <button
                  type="button"
                  onClick={handleToggleSound}
                  className="py-3 px-3 rounded-2xl bg-white border border-[#e3ded3] text-[#2b2f36] font-bold text-sm hover:bg-stone-50 active:scale-95 transition flex items-center justify-center"
                  title={state.fx ? 'Som ativado (clique para silenciar)' : 'Silenciado (clique para ativar som)'}
                  aria-label="Som"
                >
                  {state.fx ? (
                    <Volume2 className="w-4 h-4 text-[#4a7c9d]" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-[#7a7f87]" />
                  )}
                </button>

                {/* Backup / Export Menu */}
                <div className="flex items-center gap-1">
                  <input
                    ref={fileImportRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportBackup}
                  />
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="p-3 rounded-2xl bg-white border border-[#e3ded3] text-[#7a7f87] hover:text-[#2b2f36] hover:bg-stone-50 transition"
                    title="Baixar backup da rotina (JSON)"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileImportRef.current?.click()}
                    className="p-3 rounded-2xl bg-white border border-[#e3ded3] text-[#7a7f87] hover:text-[#2b2f36] hover:bg-stone-50 transition"
                    title="Restaurar backup da rotina"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </footer>
      </div>

      {/* Modals */}
      {/* 1. Visual Timer Modal */}
      <VisualTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        config={state.tm || { m: 5, th: 'cheese' }}
        onSaveConfig={handleSaveTimerConfig}
        fxEnabled={state.fx ?? true}
      />

      {/* 2. Card Edit / Add Modal */}
      <CardEditModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        cardIndex={editingCardIndex}
        initialCard={
          editingCardIndex !== null && editingCardIndex >= 0
            ? state.days[activeDayIndex]?.[editingCardIndex]
            : undefined
        }
        defaultTime={defaultNewCardTime}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
      />

      {/* 3. Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentName={state.name}
        currentPhoto={state.photo}
        onSave={handleSaveProfile}
      />

      {/* 4. Copy Day Modal */}
      <CopyDayModal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        sourceDayIndex={activeDayIndex}
        onCopy={handleCopyDayTo}
      />

      {/* 5. Print Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        dayIndex={activeDayIndex}
        onSelectPrintMode={handleTriggerPrint}
      />
    </>
  );
}
