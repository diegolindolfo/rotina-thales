export interface RoutineCard {
  id: string;
  t: string; // HH:MM
  e: string; // emoji or symbol
  x: string; // task title
  c: number; // color palette index (0-5)
  p?: string; // optional base64 photo
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
  schoolDays?: RoutineCard[][];
  activeMode?: 'full' | 'school';
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
];

export const ROUTINE_EMOJIS = [
  '⏰', '🥣', '🥛', '🍎', '🍽️', '👕', '🎒', '🏫', '📚', '✏️',
  '🏠', '🛁', '🪥', '🚽', '🧼', '🧦', '👟', '🚌', '🚗', '🧸',
  '🎮', '🎨', '🧩', '🎵', '📺', '🌳', '🚶', '🚲', '😴', '💊',
  '🗣️', '👩‍⚕️', '❤️', '⭐', '🙂', '🤗', '⚽', '🐕', '☀️', '🌙',
  '📱', '🍪', '🥋', '🏊‍♂️', '📖', '🥪', '🧃', '🎉'
];

export type RoutineBlockId = 'manha' | 'escola' | 'volta' | 'dormir';

export interface RoutineBlockConfig {
  id: RoutineBlockId;
  label: string;
  emoji: string;
}

export const ROUTINE_BLOCKS: RoutineBlockConfig[] = [
  { id: 'manha', label: 'Manhã', emoji: '🌅' },
  { id: 'escola', label: 'Escola', emoji: '🏫' },
  { id: 'volta', label: 'Volta da escola', emoji: '🏠' },
  { id: 'dormir', label: 'Dormir', emoji: '🌙' },
];

export function getCardBlockId(timeStr: string): RoutineBlockId {
  if (timeStr < '07:00') return 'manha';
  if (timeStr <= '11:00') return 'escola';
  if (timeStr < '20:00') return 'volta';
  return 'dormir';
}

export function getCurrentBlockId(): RoutineBlockId {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return getCardBlockId(`${hh}:${mm}`);
}
