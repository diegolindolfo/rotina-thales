export type RoutineBlockId = 'manha' | 'escola' | 'volta' | 'tarde' | 'dormir';

export interface RoutineCard {
  id: string;
  t: string; // HH:MM
  e: string; // emoji or symbol
  x: string; // task title
  c: number; // color palette index (0-5)
  p?: string; // optional base64 photo
  i?: string; // optional built-in illustration id or 'none'
  b?: RoutineBlockId; // optional explicit routine block
}

export interface DoneState {
  d: string; // YYYY-MM-DD
  ids: string[];
}

export interface TimerConfig {
  m: number; // minutes
  th: 'cheese' | 'carrot' | 'chase';
}

export interface RoutineState {
  name: string;
  photo?: string;
  v: number;
  days: RoutineCard[][];
  done: DoneState;
  fx?: boolean;
  tm?: TimerConfig;
}

export const DAY_NAMES = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
] as const;

export const DAY_NAMES_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const;

export const CARD_COLORS = [
  '#dcebf5', // 0: Sky blue
  '#e3f1dc', // 1: Sage green
  '#fbeed3', // 2: Warm peach / cream
  '#f6dfe6', // 3: Soft pink
  '#e8e1f3', // 4: Soft lavender
  '#f3e6d9', // 5: Warm sand
] as const;

export const CARD_COLOR_NAMES = [
  'Azul Céu',
  'Verde Sálvia',
  'Pêssego',
  'Rosa Suave',
  'Lavanda',
  'Areia',
] as const;

export const ROUTINE_EMOJIS = [
  '⏰', '🥣', '🥛', '🍎', '🍽️', '👕', '🎒', '🏫', '📚', '✏️',
  '🏠', '🛁', '🪥', '🚽', '🧼', '🧦', '👟', '🚌', '🚗', '🧸',
  '🎮', '🎨', '🧩', '🎵', '📺', '🌳', '🚶', '🚲', '😴', '💊',
  '🗣️', '👩‍⚕️', '❤️', '⭐', '🙂', '🤗', '⚽', '🐕', '☀️', '🌙',
  '📱', '🍪', '🥋', '🏊‍♂️', '📖', '🥪', '🧃', '🎉'
];

export interface RoutineIllustration {
  id: string;
  label: string;
  src: string;
}

export const ROUTINE_ILLUSTRATIONS: RoutineIllustration[] = [
  { id: 'acordar', label: 'Acordar', src: '/illustrations/acordar.jpg' },
  { id: 'cafe-da-manha', label: 'Café da manhã', src: '/illustrations/cafe-da-manha.jpg' },
  { id: 'vestir-uniforme', label: 'Vestir uniforme', src: '/illustrations/vestir-uniforme.jpg' },
  { id: 'escola', label: 'Escola', src: '/illustrations/escola.jpg' },
  { id: 'intervalo-lanche', label: 'Intervalo e lanche', src: '/illustrations/intervalo-lanche.jpg' },
  { id: 'sala-de-aula', label: 'Sala de aula', src: '/illustrations/sala-de-aula.jpg' },
  { id: 'voltar-casa', label: 'Voltar pra casa', src: '/illustrations/voltar-casa.jpg' },
  { id: 'tirar-uniforme', label: 'Tirar uniforme', src: '/illustrations/tirar-uniforme.jpg' },
  { id: 'almoco', label: 'Almoço', src: '/illustrations/almoco.jpg' },
  { id: 'celular', label: 'Celular', src: '/illustrations/celular.jpg' },
  { id: 'banho', label: 'Banho', src: '/illustrations/banho.jpg' },
  { id: 'tarefas', label: 'Tarefas da escola', src: '/illustrations/tarefas.jpg' },
  { id: 'brincar', label: 'Brincar', src: '/illustrations/brincar.jpg' },
  { id: 'passeio', label: 'Passeio', src: '/illustrations/passeio.jpg' },
  { id: 'lanche-tarde', label: 'Lanche da tarde', src: '/illustrations/lanche-tarde.jpg' },
  { id: 'jantar', label: 'Jantar', src: '/illustrations/jantar.jpg' },
  { id: 'escovar-dentes', label: 'Escovar os dentes', src: '/illustrations/escovar-dentes.jpg' },
  { id: 'dormir', label: 'Dormir', src: '/illustrations/dormir.jpg' },
];

export function getIllustrationById(id?: string): RoutineIllustration | undefined {
  if (!id || id === 'none') return undefined;
  return ROUTINE_ILLUSTRATIONS.find((item) => item.id === id);
}

const TITLE_ILLUSTRATION_MAP: Record<string, string> = {
  'acordar': 'acordar',
  'café da manhã': 'cafe-da-manha',
  'cafe da manha': 'cafe-da-manha',
  'vestir uniforme': 'vestir-uniforme',
  'escola': 'escola',
  'intervalo e lanche': 'intervalo-lanche',
  'voltar pra sala': 'sala-de-aula',
  'voltar pra casa': 'voltar-casa',
  'tirar uniforme': 'tirar-uniforme',
  'almoço': 'almoco',
  'almoco': 'almoco',
  'banho': 'banho',
  'tarefas da escola': 'tarefas',
  'tarefas': 'tarefas',
  'brincar': 'brincar',
  'lanche e brincar': 'brincar',
  'passeio': 'passeio',
  'lanche': 'lanche-tarde',
  'lanche da tarde': 'lanche-tarde',
  'jantar': 'jantar',
  'escovar os dentes': 'escovar-dentes',
  'escovar dentes': 'escovar-dentes',
  'dormir': 'dormir',
};

export function resolveCardIllustrationId(
  card: Pick<RoutineCard, 'i' | 'x' | 'e'>
): string | undefined {
  if (card.i === 'none') return undefined;
  if (card.i) {
    return getIllustrationById(card.i)?.id;
  }

  const title = card.x.trim().toLowerCase();
  if (title === 'lanche' && card.e === '🥣') return 'cafe-da-manha';
  if (title.startsWith('celular')) return 'celular';
  return TITLE_ILLUSTRATION_MAP[title];
}

export function getCardImageSrc(
  card: Pick<RoutineCard, 'p' | 'i' | 'x' | 'e'>
): string | undefined {
  if (card.p) return card.p;
  const id = resolveCardIllustrationId(card);
  return getIllustrationById(id)?.src;
}

export interface RoutineBlockConfig {
  id: RoutineBlockId;
  label: string;
  emoji: string;
}

export const WEEKDAY_BLOCKS: RoutineBlockConfig[] = [
  { id: 'manha', label: 'Manhã', emoji: '🌅' },
  { id: 'escola', label: 'Escola', emoji: '🏫' },
  { id: 'volta', label: 'Volta da escola', emoji: '🏠' },
  { id: 'dormir', label: 'Dormir', emoji: '🌙' },
];

export const WEEKEND_BLOCKS: RoutineBlockConfig[] = [
  { id: 'manha', label: 'Manhã', emoji: '🌅' },
  { id: 'tarde', label: 'Tarde', emoji: '☀️' },
  { id: 'dormir', label: 'Noite / Dormir', emoji: '🌙' },
];

export const ROUTINE_BLOCKS = WEEKDAY_BLOCKS;

export function getBlocksForDay(isWeekend: boolean): RoutineBlockConfig[] {
  return isWeekend ? WEEKEND_BLOCKS : WEEKDAY_BLOCKS;
}

export function getCardBlockId(timeStr: string, isWeekend = false): RoutineBlockId {
  if (isWeekend) {
    if (timeStr < '12:00') return 'manha';
    if (timeStr < '19:00') return 'tarde';
    return 'dormir';
  }

  if (timeStr < '07:00') return 'manha';
  if (timeStr < '11:00') return 'escola';
  if (timeStr < '20:00') return 'volta';
  return 'dormir';
}

export function resolveCardBlock(card: RoutineCard, isWeekend = false): RoutineBlockId {
  const allowed = getBlocksForDay(isWeekend).map((b) => b.id);
  if (card.b && allowed.includes(card.b)) {
    return card.b;
  }
  return getCardBlockId(card.t, isWeekend);
}

export function getCurrentBlockId(isWeekend?: boolean): RoutineBlockId {
  const d = new Date();
  const weekend = isWeekend !== undefined ? isWeekend : (d.getDay() + 6) % 7 >= 5;
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return getCardBlockId(`${hh}:${mm}`, weekend);
}
