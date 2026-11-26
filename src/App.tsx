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
  getBlocksForDay,
  resolveCardBlock,
  getCurrentBlockId,
} from './types/routine';
import {
  loadRoutineState,
  saveRoutineState,
  normalizeRoutineState,
  toMinutes,
  nowMinutes,
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
import { FocusModeView } from './components/FocusModeView';
import {
  Calendar,
  Pencil,
  Clock,
  Printer,
  Copy,
  Plus,
  RotateCcw,
  Volume2,
  VolumeX,
  User,
  Download,
  Upload,
  Sparkles,
  Check,
  Focus,
} from 'lucide-react';

export default function App() {
  const [state, setState] = useState<RoutineState>(() => loadRoutineState());

  // Current day of the week (0 = Monday, 6 = Sunday)
  const getTodayIndex = () => (new Date().getDay() + 6) % 7;
  const [todayIndex, setTodayIndex] = useState(getTodayIndex);
  const [activeDayIndex, setActiveDayIndex] = useState(getTodayIndex);

  const todayIndexRef = useRef(todayIndex);
  const activeDayIndexRef = useRef(activeDayIndex);
  activeDayIndexRef.current = activeDayIndex;

  // View modes
  const [isEditMode, setIsEditMode] = useState(false);
  const [isWeekView, setIsWeekView] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Weekend flags
  const isWeekendActiveDay = activeDayIndex === 5 || activeDayIndex === 6;
  const isWeekendToday = todayIndex === 5 || todayIndex === 6;

  // Active routine block
  const [activeBlock, setActiveBlock] = useState<RoutineBlockId>(() =>
    getCurrentBlockId(isWeekendToday)
  );
  const userSelectedBlockRef = useRef(false);

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

  // Persistence: save whenever state changes and surface failures (e.g. storage full)
  const [saveFailed, setSaveFailed] = useState(false);
  useEffect(() => {
    setSaveFailed(!saveRoutineState(state));
  }, [state]);

  // Keep time synced every 10s, handle midnight rollover, and auto-advance routine block
  useEffect(() => {
    const timer = setInterval(() => {
      const newToday = getTodayIndex();
      const prevToday = todayIndexRef.current;
      const wasViewingToday = activeDayIndexRef.current === prevToday;

      if (newToday !== prevToday) {
        todayIndexRef.current = newToday;
        setTodayIndex(newToday);
        if (wasViewingToday) {
          activeDayIndexRef.current = newToday;
          setActiveDayIndex(newToday);
          userSelectedBlockRef.current = false;
          setActiveBlock(getCurrentBlockId(newToday >= 5));
        }
      }

      setCurrentMinutes(nowMinutes());

      // Auto-reset daily checked items if date string changed
      const todayStr = getTodayDateString();
      setState((prev) => {
        if (prev.done.d !== todayStr) {
          userSelectedBlockRef.current = false;
          return { ...prev, done: { d: todayStr, ids: [] } };
        }
        return prev;
      });

      // Auto-advance active block to match time of day when viewing today without manual lock
      if (
        !userSelectedBlockRef.current &&
        (activeDayIndexRef.current === newToday || wasViewingToday)
      ) {
        const autoBlock = getCurrentBlockId(newToday >= 5);
        setActiveBlock((prev) => (prev !== autoBlock ? autoBlock : prev));
      }
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  // Update routine state helper (persistence handled by the effect above)
  const updateState = (updater: (prev: RoutineState) => RoutineState) => {
    setState(updater);
  };

  // Day cards list
  const currentDayCards = state.days[activeDayIndex] || [];
  const todayCards = state.days[todayIndex] || [];
  const todayDoneCount = todayCards.filter((c) => state.done.ids.includes(c.id)).length;

  // Update active days array helper
  const updateCurrentDays = (newDays: RoutineCard[][]) => {
    updateState((prev) => ({
      ...prev,
      days: newDays,
    }));
  };

  const activeDayBlocks = getBlocksForDay(isWeekendActiveDay);
  const activeBlockConfig = activeDayBlocks.find((b) => b.id === activeBlock);

  // Compute task counts per block for the active day
  const blockCounts: Partial<Record<RoutineBlockId, { total: number; done: number }>> = {};
  for (const b of activeDayBlocks) {
    const cardsInBlock = currentDayCards.filter(
      (c) => resolveCardBlock(c, isWeekendActiveDay) === b.id
    );
    const doneInBlock =
      activeDayIndex === todayIndex
        ? cardsInBlock.filter((c) => state.done.ids.includes(c.id)).length
        : 0;
    blockCounts[b.id] = { total: cardsInBlock.length, done: doneInBlock };
  }

  // Filter cards strictly by active block (respecting explicit card.b or smart inference)
  const visibleCards = currentDayCards.filter(
    (c) => resolveCardBlock(c, isWeekendActiveDay) === activeBlock
  );

  const handleSelectDay = (idx: number) => {
    setIsWeekView(false);
    setIsFocusMode(false);
    setActiveDayIndex(idx);
    const targetIsWeekend = idx === 5 || idx === 6;
    const allowed = getBlocksForDay(targetIsWeekend);

    if (idx === todayIndex) {
      // Returned to today: resume auto-tracking time of day
      userSelectedBlockRef.current = false;
      setActiveBlock(getCurrentBlockId(targetIsWeekend));
    } else if (!allowed.some((b) => b.id === activeBlock)) {
      // Switched between weekday/weekend and current block is not available
      setActiveBlock(allowed[0].id);
    }
  };

  const handleSelectBlock = (blockId: RoutineBlockId) => {
    userSelectedBlockRef.current = true;
    setActiveBlock(blockId);
  };

  const handleToggleFocusMode = () => {
    if (isFocusMode) {
      setIsFocusMode(false);
      return;
    }
    setIsFocusMode(true);
    setIsWeekView(false);
    setIsEditMode(false);
    setActiveDayIndex(todayIndex);
  };

  // Toggle task done
  const handleToggleDone = (cardId: string) => {
    const isDone = state.done.ids.includes(cardId);

    updateState((prev) => {
      const ids = prev.done.ids;
      return {
        ...prev,
        done: {
          ...prev.done,
          ids: ids.includes(cardId)
            ? ids.filter((id) => id !== cardId)
            : [...ids, cardId],
        },
      };
    });

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

  // Save card (new or edit): automatically organizes chronologically by time!
  const handleSaveCard = (card: RoutineCard, index: number | null) => {
    const newDays = [...state.days];
    const dayCards = [...(newDays[activeDayIndex] || [])];

    if (index !== null && index >= 0) {
      dayCards[index] = card;
    } else {
      dayCards.push(card);
    }

    // Automatically organize chronologically according to time!
    dayCards.sort((a, b) => a.t.localeCompare(b.t));

    newDays[activeDayIndex] = dayCards;
    updateCurrentDays(newDays);

    // Switch view automatically to the block corresponding to this card
    const targetBlock = resolveCardBlock(card, isWeekendActiveDay);
    setActiveBlock(targetBlock);

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
    const safeName =
      state.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'rotina';
    const a = document.createElement('a');
    a.href = url;
    a.download = `rotina-${safeName}-${getTodayDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Revoking immediately can cancel the download in some browsers
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Import JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      let normalized: RoutineState | null = null;
      try {
        normalized = normalizeRoutineState(JSON.parse(String(event.target?.result ?? '')));
      } catch {
        alert('Não foi possível ler o arquivo.');
        return;
      }
      if (!normalized) {
        alert('Arquivo de rotina inválido.');
        return;
      }
      const total = normalized.days.reduce((n, d) => n + d.length, 0);
      if (
        !confirm(
          `Restaurar a rotina de "${normalized.name}" (${total} atividades)?\nA rotina atual será substituída.`
        )
      ) {
        return;
      }
      setState(normalized);
      alert('Rotina restaurada com sucesso!');
    };
    reader.onerror = () => alert('Não foi possível ler o arquivo.');
    reader.readAsText(file);
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

  const isCurrentBlockAllDone =
    isViewingToday &&
    visibleCards.length > 0 &&
    visibleCards.every((c) => state.done.ids.includes(c.id));

  // Determine default time for new card based on activeBlock
  const defaultNewCardTime =
    activeBlock === 'manha'
      ? isWeekendActiveDay
        ? '08:00'
        : '06:30'
      : activeBlock === 'escola'
      ? '08:00'
      : activeBlock === 'tarde'
      ? '14:00'
      : activeBlock === 'volta'
      ? '13:00'
      : '20:30';

  return (
    <>
      {/* Offline Status Toast */}
      <OfflineIndicator />

      {/* Save failure warning (e.g. storage full because of photos) */}
      {saveFailed && (
        <div
          role="alert"
          className="no-print fixed left-1/2 -translate-x-1/2 bottom-24 z-50 w-[calc(100%-2rem)] max-w-md rounded-2xl bg-[#c03a2b] text-white px-4 py-3 shadow-lg flex items-start gap-3"
        >
          <span className="text-xl leading-none">⚠️</span>
          <div className="flex-1 text-sm">
            <p className="font-extrabold">Não foi possível salvar as alterações.</p>
            <p className="text-white/90 text-xs font-semibold mt-0.5">
              O armazenamento do navegador pode estar cheio. Remova algumas fotos e
              baixe um backup para não perder nada.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex-none self-center px-3 py-2 rounded-xl bg-white text-[#c03a2b] text-xs font-extrabold cursor-pointer"
          >
            Backup
          </button>
        </div>
      )}

      {/* Printable Content (visible only on @media print) */}
      <PrintContent
        state={state}
        activeDayIndex={activeDayIndex}
        mode={printMode}
      />

      {/* Main Web App UI (hidden during print) */}
      <div className="no-print min-h-screen bg-[#f6f3ec] text-[#252a31] pb-28">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#f6f3ec]/95 backdrop-blur-md border-b border-[#e2dcd0] px-4 py-3 pt-safe">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            {/* Child Profile Button */}
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-3 cursor-pointer group select-none min-w-0 text-left rounded-2xl p-1 -ml-1 hover:bg-[#efeae0]/60 transition"
              title="Editar perfil da criança"
            >
              <div className="relative flex-none">
                {state.photo ? (
                  <img
                    src={state.photo}
                    alt={state.name}
                    className="w-12 h-12 sm:w-13 sm:h-13 rounded-full object-cover shadow-2xs border-2 border-white ring-2 ring-[#e2dcd0] group-hover:ring-[#3f7396] transition"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-white border-2 border-[#e2dcd0] flex items-center justify-center text-[#3f7396] shadow-2xs group-hover:border-[#3f7396] transition">
                    <User className="w-6 h-6" />
                  </div>
                )}
                {isEditMode && (
                  <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#3f7396] rounded-full flex items-center justify-center text-[10px] text-white shadow-2xs">
                    ✎
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-[#252a31] truncate leading-tight">
                    Rotina do {state.name}
                  </h1>
                  {isEditMode && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#3f7396] text-white font-extrabold flex-none">
                      Edição
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-[#6b717b] truncate mt-0.5">
                  {isFocusMode
                    ? todayCards.length > 0
                      ? `Modo Foco · ${todayDoneCount} de ${todayCards.length} concluídas`
                      : `Modo Foco · ${DAY_NAMES[todayIndex]}`
                    : isWeekView
                    ? 'Visão semanal completa'
                    : activeDayIndex === todayIndex
                    ? todayCards.length > 0
                      ? `Hoje (${DAY_NAMES[todayIndex]}) · ${todayDoneCount} de ${todayCards.length} concluídas`
                      : `Hoje (${DAY_NAMES[todayIndex]})`
                    : `Visualizando ${DAY_NAMES[activeDayIndex]}`}
                </p>
              </div>
            </button>

            {/* Action Buttons in Header */}
            <div className="flex items-center gap-2 flex-none">
              {/* PWA Install Button */}
              <PWAInstallButton />

              {/* Focus mode toggle (Agora e Depois) */}
              <button
                type="button"
                onClick={handleToggleFocusMode}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition shadow-2xs cursor-pointer ${
                  isFocusMode
                    ? 'bg-[#3f7396] text-white border-[#3f7396]'
                    : 'bg-white border-[#e2dcd0] text-[#252a31] hover:bg-[#efeae0]/60'
                }`}
                title="Modo Foco (Agora e Depois)"
                aria-label="Modo Foco (Agora e Depois)"
                aria-pressed={isFocusMode}
              >
                <Focus className="w-5 h-5" />
              </button>

              {/* Week toggle */}
              <button
                type="button"
                onClick={() => {
                  setIsFocusMode(false);
                  setIsWeekView(!isWeekView);
                }}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition shadow-2xs cursor-pointer ${
                  isWeekView
                    ? 'bg-[#3f7396] text-white border-[#3f7396]'
                    : 'bg-white border-[#e2dcd0] text-[#252a31] hover:bg-[#efeae0]/60'
                }`}
                title="Visão Semanal"
                aria-label="Visão Semanal"
                aria-pressed={isWeekView}
              >
                <Calendar className="w-5 h-5" />
              </button>

              {/* Edit mode toggle */}
              <button
                type="button"
                onClick={() => {
                  setIsFocusMode(false);
                  setIsEditMode(!isEditMode);
                }}
                className={`flex h-11 items-center justify-center gap-1.5 px-3 rounded-2xl border font-extrabold text-xs transition shadow-2xs cursor-pointer ${
                  isEditMode
                    ? 'bg-[#3f7396] text-white border-[#3f7396]'
                    : 'bg-white border-[#e2dcd0] text-[#252a31] hover:bg-[#efeae0]/60'
                }`}
                title={isEditMode ? 'Concluir edição' : 'Editar rotina'}
                aria-label={isEditMode ? 'Concluir edição' : 'Editar rotina'}
                aria-pressed={isEditMode}
              >
                {isEditMode ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span className="hidden sm:inline">Pronto</span>
                  </>
                ) : (
                  <Pencil className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Day Tabs & Routine Blocks (hidden in Focus Mode for calm UX) */}
        {!isFocusMode && (
          <div className="max-w-2xl mx-auto px-4 pt-3 pb-1">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1" role="tablist" aria-label="Dias da semana">
              {DAY_NAMES_SHORT.map((shortName, idx) => {
                const isSelected = idx === activeDayIndex && !isWeekView;
                const isToday = idx === todayIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => handleSelectDay(idx)}
                    className={`flex-1 min-w-[46px] py-2.5 rounded-2xl text-center text-sm font-extrabold border transition shadow-2xs cursor-pointer active:scale-97 ${
                      isSelected
                        ? 'bg-[#3f7396] text-white border-[#3f7396] shadow-xs'
                        : isToday
                        ? 'bg-white border-[#3f7396] text-[#3f7396]'
                        : 'bg-white border-[#e2dcd0] text-[#6b717b] hover:bg-[#efeae0]/60 hover:text-[#252a31]'
                    }`}
                  >
                    <div>{shortName}</div>
                    {isToday && (
                      <div
                        className={`w-1.5 h-1.5 rounded-full mx-auto mt-0.5 ${
                          isSelected ? 'bg-white' : 'bg-[#3f7396]'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Routine Blocks (dynamic: weekdays vs weekends) */}
            {!isWeekView && (
              <div className="pt-2">
                <RoutineBlocksBar
                  blocks={activeDayBlocks}
                  activeBlock={activeBlock}
                  onSelectBlock={handleSelectBlock}
                  blockCounts={blockCounts}
                  showDoneProgress={activeDayIndex === todayIndex && !isEditMode}
                />
              </div>
            )}
          </div>
        )}

        {/* Content Area */}
        <main className="max-w-2xl mx-auto px-4 py-2">
          {isFocusMode ? (
            /* Focus Mode ("Agora e Depois") */
            <FocusModeView
              cards={todayCards}
              doneIds={state.done.ids}
              currentMinutes={currentMinutes}
              dayName={DAY_NAMES[todayIndex]}
              onToggleDone={handleToggleDone}
              onOpenTimer={() => setIsTimerOpen(true)}
              onExitFocus={() => setIsFocusMode(false)}
            />
          ) : isWeekView ? (
            /* Week Overview Screen */
            <WeekOverview
              state={state}
              todayIndex={todayIndex}
              onSelectDay={handleSelectDay}
            />
          ) : (
            /* Day View */
            <div>
              {currentDayCards.length === 0 ? (
                <div className="rounded-3xl bg-white border-2 border-dashed border-[#e2dcd0] p-8 text-center my-6">
                  <span className="text-4xl block mb-2">📋</span>
                  <h3 className="text-lg font-extrabold text-[#252a31]">
                    Nenhuma atividade cadastrada neste dia
                  </h3>
                  <p className="text-xs font-semibold text-[#6b717b] mt-1">
                    Adicione a primeira atividade para montar o quadro visual.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddCard}
                    className="mt-4 px-5 py-2.5 rounded-2xl bg-[#3f7396] text-white font-extrabold text-sm shadow-xs hover:bg-[#335f7d] transition inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Atividade
                  </button>
                </div>
              ) : visibleCards.length === 0 ? (
                <div className="rounded-3xl bg-white border-2 border-dashed border-[#e2dcd0] p-8 text-center my-6">
                  <span className="text-4xl block mb-2">{activeBlockConfig?.emoji || '📋'}</span>
                  <h3 className="text-lg font-extrabold text-[#252a31]">
                    Nenhuma atividade em {activeBlockConfig?.label}
                  </h3>
                  <p className="text-xs font-semibold text-[#6b717b] mt-1">
                    Você pode adicionar uma nova atividade neste período.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddCard}
                    className="mt-4 px-5 py-2.5 rounded-2xl bg-[#3f7396] text-white font-extrabold text-sm shadow-xs hover:bg-[#335f7d] transition inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar em {activeBlockConfig?.label}
                  </button>
                </div>
              ) : (
                /* Cards list with soothing active state */
                <div className="space-y-3">
                  {/* Gentle celebration banner when all tasks in the current block are done today */}
                  {isCurrentBlockAllDone && (
                    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#e1f3e5] border border-[#2f8544]/25 text-[#2f8544] animate-fade-in">
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-5 h-5 flex-none" />
                        <span className="text-sm font-extrabold">
                          Parabéns! Todas as atividades de {activeBlockConfig?.label} foram concluídas!
                        </span>
                      </div>
                      <span className="text-xl leading-none">🌟</span>
                    </div>
                  )}

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
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Bottom Fixed Action Bar */}
        <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#f6f3ec]/95 backdrop-blur-md border-t border-[#e2dcd0] px-4 py-2.5 sm:py-3 pb-safe">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
            <input
              ref={fileImportRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportBackup}
            />

            {isEditMode && !isWeekView ? (
              /* Edit Mode Actions (Caregiver tools) */
              <>
                <button
                  type="button"
                  onClick={handleOpenAddCard}
                  className="flex-1 py-3 px-3.5 rounded-2xl bg-[#3f7396] text-white font-extrabold text-sm shadow-xs hover:bg-[#335f7d] active:scale-97 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Nova Atividade</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCopyModalOpen(true)}
                  className="py-3 px-3.5 rounded-2xl bg-white border border-[#e2dcd0] text-[#252a31] font-extrabold text-sm hover:bg-[#efeae0]/60 active:scale-97 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Copiar dia para outros dias"
                >
                  <Copy className="w-4 h-4 text-[#3f7396]" />
                  <span className="hidden sm:inline">Copiar dia</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsProfileOpen(true)}
                  className="py-3 px-3.5 rounded-2xl bg-white border border-[#e2dcd0] text-[#252a31] font-extrabold text-sm hover:bg-[#efeae0]/60 active:scale-97 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Perfil e foto da criança"
                >
                  <User className="w-4 h-4 text-[#3f7396]" />
                  <span className="hidden sm:inline">Perfil</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="p-3 rounded-2xl bg-white border border-[#e2dcd0] text-[#6b717b] hover:text-[#252a31] hover:bg-[#efeae0]/60 active:scale-97 transition cursor-pointer"
                  title="Baixar backup da rotina (JSON)"
                  aria-label="Baixar backup da rotina"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => fileImportRef.current?.click()}
                  className="p-3 rounded-2xl bg-white border border-[#e2dcd0] text-[#6b717b] hover:text-[#252a31] hover:bg-[#efeae0]/60 active:scale-97 transition cursor-pointer"
                  title="Restaurar backup da rotina (JSON)"
                  aria-label="Restaurar backup da rotina"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </>
            ) : (
              /* Normal Viewing Mode Actions (Child-friendly & clean) */
              <>
                {/* Visual Timer button (Primary action) */}
                <button
                  type="button"
                  onClick={() => setIsTimerOpen(true)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-[#3f7396] text-white font-extrabold text-base shadow-xs hover:bg-[#335f7d] active:scale-97 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Clock className="w-5 h-5" />
                  <span>Timer Visual</span>
                </button>

                {/* Print button */}
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="py-3 px-3.5 sm:px-4 rounded-2xl bg-white border border-[#e2dcd0] text-[#252a31] font-extrabold text-sm hover:bg-[#efeae0]/60 active:scale-97 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Imprimir quadro visual"
                >
                  <Printer className="w-4 h-4 text-[#3f7396]" />
                  <span className="hidden sm:inline">Imprimir</span>
                </button>

                {/* Clear / Reset done tasks */}
                {!isWeekView && (
                  <button
                    type="button"
                    onClick={handleResetDone}
                    disabled={state.done.ids.length === 0}
                    className="py-3 px-3.5 sm:px-4 rounded-2xl bg-white border border-[#e2dcd0] text-[#252a31] font-extrabold text-sm hover:bg-[#efeae0]/60 disabled:opacity-40 active:scale-97 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Desmarcar atividades concluídas de hoje"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Recomeçar</span>
                  </button>
                )}

                {/* Sound effect toggle */}
                <button
                  type="button"
                  onClick={handleToggleSound}
                  className="p-3 rounded-2xl bg-white border border-[#e2dcd0] text-[#252a31] font-extrabold text-sm hover:bg-[#efeae0]/60 active:scale-97 transition flex items-center justify-center cursor-pointer"
                  title={
                    state.fx
                      ? 'Som ativado (toque para silenciar)'
                      : 'Silenciado (toque para ativar som)'
                  }
                  aria-label="Alternar efeitos sonoros"
                  aria-pressed={state.fx}
                >
                  {state.fx ? (
                    <Volume2 className="w-5 h-5 text-[#3f7396]" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-[#6b717b]" />
                  )}
                </button>
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
        isWeekend={isWeekendActiveDay}
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

