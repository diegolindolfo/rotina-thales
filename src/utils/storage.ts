import { CARD_COLORS, RoutineCard, RoutineState, TimerConfig, getIllustrationById } from '../types/routine';

export const STORAGE_KEY = 'rotina-thales-v1';

export const uid = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 9);

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
  const copy = [...list];
  if (!copy.some((c) => c.x === 'Jantar')) {
    const extras = makeCards(EXTRA_ROUTINES);
    extras.forEach((card) => {
      const idx = copy.findIndex((item) => item.t > card.t);
      if (idx < 0) {
        copy.push(card);
      } else {
        copy.splice(idx, 0, card);
      }
    });
  }
  return copy.sort((a, b) => a.t.localeCompare(b.t));
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

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const TIMER_THEMES: TimerConfig['th'][] = ['cheese', 'carrot', 'chase'];

const isImageDataUrl = (v: unknown): v is string =>
  typeof v === 'string' && v.startsWith('data:image/');

function normalizeCard(raw: unknown): RoutineCard | null {
  if (!isObject(raw)) return null;
  if (typeof raw.t !== 'string' || !TIME_RE.test(raw.t)) return null;

  const card: RoutineCard = {
    id: typeof raw.id === 'string' && raw.id ? raw.id : uid(),
    t: raw.t,
    e: typeof raw.e === 'string' && raw.e.trim() ? raw.e : '⭐',
    x: typeof raw.x === 'string' && raw.x.trim() ? raw.x : 'Atividade',
    c:
      typeof raw.c === 'number' && Number.isFinite(raw.c)
        ? Math.abs(Math.trunc(raw.c)) % CARD_COLORS.length
        : 0,
  };
  const validBlocks = ['manha', 'escola', 'volta', 'tarde', 'dormir'];
  if (typeof raw.b === 'string' && validBlocks.includes(raw.b)) {
    card.b = raw.b as RoutineCard['b'];
  }
  if (typeof raw.i === 'string' && (raw.i === 'none' || getIllustrationById(raw.i))) {
    card.i = raw.i;
  }
  if (isImageDataUrl(raw.p)) card.p = raw.p;
  return card;
}

function normalizeDays(raw: unknown): RoutineCard[][] | null {
  if (!Array.isArray(raw) || raw.length !== 7) return null;
  return raw.map((day) =>
    Array.isArray(day)
      ? day
          .map(normalizeCard)
          .filter((c): c is RoutineCard => c !== null)
          .sort((a, b) => a.t.localeCompare(b.t))
      : []
  );
}

/**
 * Validates and migrates any unknown value (from localStorage or an imported
 * backup file) into a well-formed RoutineState. Invalid cards are dropped
 * instead of crashing the app. Returns null if the structure is unusable.
 */
export function normalizeRoutineState(raw: unknown): RoutineState | null {
  if (!isObject(raw)) return null;
  const days = normalizeDays(raw.days);
  if (!days) return null;

  const today = getTodayDateString();
  const doneIds =
    isObject(raw.done) && raw.done.d === today && Array.isArray(raw.done.ids)
      ? raw.done.ids.filter((id): id is string => typeof id === 'string')
      : [];

  const tm: TimerConfig =
    isObject(raw.tm) &&
    typeof raw.tm.m === 'number' &&
    raw.tm.m >= 1 &&
    raw.tm.m <= 120 &&
    TIMER_THEMES.includes(raw.tm.th as TimerConfig['th'])
      ? { m: Math.round(raw.tm.m), th: raw.tm.th as TimerConfig['th'] }
      : { m: 5, th: 'cheese' };

  return {
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : 'Thales',
    photo: isImageDataUrl(raw.photo) ? raw.photo : undefined,
    v: 2,
    // Legacy (v1) data: add the extra default routines once
    days: raw.v ? days : days.map(addExtraRoutines),
    done: { d: today, ids: doneIds },
    fx: typeof raw.fx === 'boolean' ? raw.fx : true,
    tm,
  };
}

export function loadRoutineState(): RoutineState {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const normalized = normalizeRoutineState(JSON.parse(raw));
      if (normalized) return normalized;
    }
  } catch (e) {
    console.warn('Failed to load routine state from localStorage', e);
  }

  // Stored data exists but is unreadable: keep a copy before defaults overwrite it
  if (raw) {
    try {
      localStorage.setItem(`${STORAGE_KEY}-corrupted`, raw);
    } catch {
      // ignore (storage may be full)
    }
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
