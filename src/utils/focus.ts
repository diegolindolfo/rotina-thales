import type { RoutineCard } from '../types/routine.ts';

export interface FocusWindow {
  current: RoutineCard | null;
  next: RoutineCard | null;
  pending: RoutineCard[];
  currentIndex: number;
  totalCount: number;
  doneCount: number;
  allDone: boolean;
}

/**
 * Parses an "HH:MM" time string into total minutes from midnight.
 */
export function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Computes the First–Then ("Agora e Depois") focus window for a day's routine.
 * Prioritizes the pending task matching or following the current time of day,
 * falling back to earlier pending tasks if nothing remains ahead.
 */
export function resolveFocusWindow(
  dayCards: readonly RoutineCard[],
  doneIds: readonly string[],
  currentMinutes: number,
  manualOffset = 0
): FocusWindow {
  const totalCount = dayCards.length;
  const doneSet = new Set(doneIds);
  const pending = dayCards.filter((card) => !doneSet.has(card.id));
  const doneCount = totalCount - pending.length;

  if (totalCount === 0) {
    return {
      current: null,
      next: null,
      pending: [],
      currentIndex: -1,
      totalCount: 0,
      doneCount: 0,
      allDone: false,
    };
  }

  if (pending.length === 0) {
    return {
      current: null,
      next: null,
      pending: [],
      currentIndex: -1,
      totalCount,
      doneCount,
      allDone: true,
    };
  }

  const nextSlot = dayCards.findIndex(
    (card) => parseTimeToMinutes(card.t) > currentMinutes
  );
  const activeSlot = (nextSlot < 0 ? totalCount : nextSlot) - 1;
  const startSlot = Math.max(0, activeSlot);

  const slotById = new Map<string, number>();
  dayCards.forEach((card, idx) => slotById.set(card.id, idx));

  const forwardIdx = pending.findIndex(
    (card) => (slotById.get(card.id) ?? -1) >= startSlot
  );
  const basePendingIdx = forwardIdx >= 0 ? forwardIdx : 0;

  const currentIndex = Math.max(
    0,
    Math.min(pending.length - 1, basePendingIdx + manualOffset)
  );

  return {
    current: pending[currentIndex],
    next: pending[currentIndex + 1] ?? null,
    pending,
    currentIndex,
    totalCount,
    doneCount,
    allDone: false,
  };
}
