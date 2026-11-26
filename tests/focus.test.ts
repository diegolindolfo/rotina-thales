import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { RoutineCard } from '../src/types/routine.ts';
import { resolveFocusWindow } from '../src/utils/focus.ts';

const sampleCards: RoutineCard[] = [
  { id: 'c1', t: '06:30', e: '⏰', x: 'Acordar', c: 2 },
  { id: 'c2', t: '07:00', e: '🏫', x: 'Escola', c: 0 },
  { id: 'c3', t: '12:00', e: '🍽️', x: 'Almoço', c: 2 },
  { id: 'c4', t: '15:00', e: '🛁', x: 'Banho', c: 0 },
  { id: 'c5', t: '21:00', e: '😴', x: 'Dormir', c: 4 },
];

describe('resolveFocusWindow', () => {
  it('1. returns empty state for a day without activities', () => {
    const res = resolveFocusWindow([], [], 10 * 60);
    assert.equal(res.current, null);
    assert.equal(res.next, null);
    assert.equal(res.pending.length, 0);
    assert.equal(res.currentIndex, -1);
    assert.equal(res.totalCount, 0);
    assert.equal(res.doneCount, 0);
    assert.equal(res.allDone, false);
  });

  it('2. returns allDone when every card is completed', () => {
    const res = resolveFocusWindow(
      sampleCards,
      sampleCards.map((c) => c.id),
      15 * 60
    );
    assert.equal(res.current, null);
    assert.equal(res.next, null);
    assert.equal(res.totalCount, 5);
    assert.equal(res.doneCount, 5);
    assert.equal(res.allDone, true);
  });

  it('3. selects the first activity before the earliest scheduled time', () => {
    const res = resolveFocusWindow(sampleCards, [], 5 * 60 + 30);
    assert.equal(res.current?.id, 'c1');
    assert.equal(res.next?.id, 'c2');
    assert.equal(res.currentIndex, 0);
  });

  it('4. skips unchecked earlier morning items when opened mid-day', () => {
    // 12:15 -> active slot is Almoço (c3), even though Acordar/Escola are unchecked
    const res = resolveFocusWindow(sampleCards, [], 12 * 60 + 15);
    assert.equal(res.current?.id, 'c3');
    assert.equal(res.next?.id, 'c4');
    assert.equal(res.currentIndex, 2);
  });

  it('5. advances automatically when the current activity is marked done', () => {
    const res = resolveFocusWindow(sampleCards, ['c3'], 12 * 60 + 15);
    assert.equal(res.current?.id, 'c4');
    assert.equal(res.next?.id, 'c5');
    assert.equal(res.doneCount, 1);
  });

  it('6. falls back to earlier unchecked items when late-day items are already done', () => {
    // 21:30 -> active slot is Dormir (c5), already done, while Banho (c4) is still pending
    const res = resolveFocusWindow(sampleCards, ['c1', 'c2', 'c3', 'c5'], 21 * 60 + 30);
    assert.equal(res.current?.id, 'c4');
    assert.equal(res.next, null);
    assert.equal(res.currentIndex, 0);
  });

  it('7. supports manualOffset navigation and clamps to pending boundaries', () => {
    // Base at 12:15 is c3 (index 2 of 5 pending)
    const prev = resolveFocusWindow(sampleCards, [], 12 * 60 + 15, -1);
    assert.equal(prev.current?.id, 'c2');
    assert.equal(prev.next?.id, 'c3');
    assert.equal(prev.currentIndex, 1);

    const clampLow = resolveFocusWindow(sampleCards, [], 12 * 60 + 15, -99);
    assert.equal(clampLow.current?.id, 'c1');
    assert.equal(clampLow.currentIndex, 0);

    const clampHigh = resolveFocusWindow(sampleCards, [], 12 * 60 + 15, 99);
    assert.equal(clampHigh.current?.id, 'c5');
    assert.equal(clampHigh.next, null);
    assert.equal(clampHigh.currentIndex, 4);
  });

  it('8. returns next as null on the last pending item', () => {
    const res = resolveFocusWindow(
      sampleCards,
      ['c1', 'c2', 'c3', 'c4'],
      21 * 60 + 5
    );
    assert.equal(res.current?.id, 'c5');
    assert.equal(res.next, null);
    assert.equal(res.pending.length, 1);
    assert.equal(res.allDone, false);
  });
});
