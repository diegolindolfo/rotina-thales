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

export type RoutineBlockId = 'all' | 'manha' | 'escola' | 'volta' | 'dormir';

export interface RoutineBlockConfig {
  id: RoutineBlockId;
  label: string;
  emoji: string;
  timeRange: string;
}

export const ROUTINE_BLOCKS: RoutineBlockConfig[] = [
  { id: 'manha', label: 'Manhã de escola', emoji: '🌅', timeRange: 'Até 06:59' },
  { id: 'escola', label: 'Na escola', emoji: '🏫', timeRange: '07:00 às 11:00' },
  { id: 'volta', label: 'Volta da escola', emoji: '🏠', timeRange: '11:01 às 19:59' },
  { id: 'dormir', label: 'Hora de dormir', emoji: '🌙', timeRange: 'A partir das 20:00' },
];

export function getCardBlockId(timeStr: string): 'manha' | 'escola' | 'volta' | 'dormir' {
  if (timeStr < '07:00') return 'manha';
  if (timeStr <= '11:00') return 'escola';
  if (timeStr < '20:00') return 'volta';
  return 'dormir';
}
