import { RoutineCard, RoutineState } from '../types/routine';

export const STORAGE_KEY = 'rotina-thales-v1';

export const uid = () => Math.random().toString(36).slice(2, 9);

export const toMinutes = (timeStr: string) => {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const nowMinutes = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
};

export const getTodayDateString = () => new Date().toLocaleDateString('sv');

export const getFormattedCurrentTime = () =>
  new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const EXTRA_ROUTINES: [string, string, string, number][] = [
  ['13:00', '📱', 'Celular · 1 hora', 4],
  ['19:00', '🍪', 'Lanche', 2],
  ['20:00', '🍽️', 'Jantar', 2],
  ['20:45', '🪥', 'Escovar os dentes', 0],
  ['21:00', '😴', 'Dormir', 4],
];

const makeCards = (items: [string, string, string, number][]): RoutineCard[] =>
  items.map(([t, e, x, c]) => ({
    id: uid(),
    t,
    e,
    x,
    c,
  }));

function addExtraRoutines(list: RoutineCard[]): RoutineCard[] {
  if (!list.some((c) => c.x === 'Jantar')) {
    const extras = makeCards(EXTRA_ROUTINES);
    extras.forEach((card) => {
      const idx = list.findIndex((item) => item.t > card.t);
      if (idx < 0) {
        list.push(card);
      } else {
        list.splice(idx, 0, card);
      }
    });
  }
  return list;
}

export function getDefaultSchoolDays(): RoutineCard[][] {
  const schoolDay = () =>
    makeCards([
      ['07:00', '🏫', 'Entrada na Escola', 0],
      ['07:30', '🗣️', 'Acolhimento e Roda', 1],
      ['08:00', '✏️', 'Atividade em Sala / Lição', 4],
      ['09:00', '🍎', 'Intervalo e Lanche', 2],
      ['09:30', '🧸', 'Recreio e Pátio', 3],
      ['10:00', '📚', 'Atividades e Artes', 0],
      ['10:45', '🎒', 'Organizar Mochila', 1],
      ['11:00', '🏠', 'Saída / Voltar pra Casa', 2],
    ]);

  return [
    schoolDay(),
    schoolDay(),
    schoolDay(),
    schoolDay(),
    schoolDay(),
    [],
    [],
  ];
}

export function getDefaultRoutineState(): RoutineState {
  const weekday = () =>
    makeCards([
      ['06:30', '⏰', 'Acordar', 2],
      ['06:40', '🥣', 'Lanche', 2],
      ['06:50', '👕', 'Vestir uniforme', 0],
      ['07:00', '🏫', 'Escola', 0],
      ['09:00', '🍎', 'Intervalo e lanche', 2],
      ['09:30', '📚', 'Voltar pra sala', 0],
      ['11:00', '🏠', 'Voltar pra casa', 1],
      ['11:15', '👕', 'Tirar uniforme', 1],
      ['12:00', '🍽️', 'Almoço', 2],
      ['15:00', '🛁', 'Banho', 0],
      ['15:30', '✏️', 'Tarefas da escola', 4],
      ['16:00', '🧸', 'Lanche e brincar', 3],
      ['17:30', '🌳', 'Passeio', 1],
    ]);

  const weekend = () =>
    makeCards([
      ['08:00', '⏰', 'Acordar', 2],
      ['08:30', '🥣', 'Lanche', 2],
      ['10:00', '🧸', 'Brincar', 3],
      ['12:00', '🍽️', 'Almoço', 2],
      ['15:00', '🛁', 'Banho', 0],
      ['17:30', '🌳', 'Passeio', 1],
    ]);

  const days = [
    weekday(),
    weekday(),
    weekday(),
    weekday(),
    weekday(),
    weekend(),
    weekend(),
  ].map(addExtraRoutines);

  return {
    name: 'Thales',
    v: 2,
    days,
    schoolDays: getDefaultSchoolDays(),
    activeMode: 'full',
    done: {
      d: getTodayDateString(),
      ids: [],
    },
    fx: true,
    tm: {
      m: 5,
      th: 'cheese',
    },
  };
}

export function loadRoutineState(): RoutineState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as RoutineState;
      if (parsed && Array.isArray(parsed.days) && parsed.days.length === 7) {
        if (!parsed.v) {
          parsed.days = parsed.days.map(addExtraRoutines);
          parsed.v = 2;
        }
        if (!parsed.schoolDays || !Array.isArray(parsed.schoolDays) || parsed.schoolDays.length !== 7) {
          parsed.schoolDays = getDefaultSchoolDays();
        }
        if (!parsed.activeMode) {
          parsed.activeMode = 'full';
        }
        if (!parsed.done || parsed.done.d !== getTodayDateString()) {
          parsed.done = {
            d: getTodayDateString(),
            ids: [],
          };
        }
        if (parsed.fx === undefined) parsed.fx = true;
        if (!parsed.tm) parsed.tm = { m: 5, th: 'cheese' };
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load routine state from localStorage', e);
  }

  return getDefaultRoutineState();
}

export function saveRoutineState(state: RoutineState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error('Failed to save routine state', e);
    return false;
  }
}
