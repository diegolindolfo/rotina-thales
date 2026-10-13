import React, { useEffect, useState, useRef } from 'react';
import { TimerConfig } from '../types/routine';
import { playSound } from '../utils/sound';
import { X, Play, Pause, Square, Sparkles } from 'lucide-react';

interface VisualTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TimerConfig;
  onSaveConfig: (cfg: TimerConfig) => void;
  fxEnabled: boolean;
}

const TIMER_PRESETS = [1, 2, 3, 5, 10, 15, 20, 30];

const THEMES: Record<
  string,
  { name: string; icon: string; animal: string; food?: string; chaser?: string; target?: string }
> = {
  cheese: { name: 'Rato e queijos', icon: '🧀🐭', animal: '🐭', food: '🧀' },
  carrot: { name: 'Coelho e cenouras', icon: '🥕🐰', animal: '🐰', food: '🥕' },
  chase: { name: 'Fuga do gato', icon: '🐱🐭', animal: '🐭', chaser: '🐱', target: '🏠' },
};

export const VisualTimerModal: React.FC<VisualTimerModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  fxEnabled,
}) => {
  const [minutes, setMinutes] = useState(config.m || 5);
  const [theme, setTheme] = useState<'cheese' | 'carrot' | 'chase'>(config.th || 'cheese');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeftMs, setTimeLeftMs] = useState(minutes * 60 * 1000);
  const [totalTimeMs, setTotalTimeMs] = useState(minutes * 60 * 1000);

  const endTimeRef = useRef<number>(0);
  const pausedTimeLeftRef = useRef<number>(0);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Sync initial config
  useEffect(() => {
    if (isOpen) {
      setMinutes(config.m || 5);
      setTheme(config.th || 'cheese');
      setIsRunning(false);
      setIsPaused(false);
      setIsFinished(false);
      const ms = (config.m || 5) * 60 * 1000;
      setTimeLeftMs(ms);
      setTotalTimeMs(ms);
    }
  }, [isOpen, config]);

  // Request WakeLock when timer is running
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator && !wakeLockRef.current) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch {
      // Wake Lock might be disallowed
    }
  };

  const releaseWakeLock = () => {
    try {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    } catch {
      // ignore
    }
  };

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      releaseWakeLock();
    };
  }, []);

  const handleSelectTime = (m: number) => {
    if (isRunning) return;
    const clamped = Math.max(1, Math.min(120, m));
    setMinutes(clamped);
    setTimeLeftMs(clamped * 60 * 1000);
    setTotalTimeMs(clamped * 60 * 1000);
    onSaveConfig({ m: clamped, th: theme });
  };

  const handleSelectTheme = (th: 'cheese' | 'carrot' | 'chase') => {
    setTheme(th);
    onSaveConfig({ m: minutes, th });
  };

  const handleStart = () => {
    const ms = minutes * 60 * 1000;
    setTotalTimeMs(ms);
    setTimeLeftMs(ms);
    endTimeRef.current = Date.now() + ms;
    setIsRunning(true);
    setIsPaused(false);
    setIsFinished(false);

    playSound('start', fxEnabled);
    requestWakeLock();

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = window.setInterval(tick, 100);
  };

  const tick = () => {
    const now = Date.now();
    const remaining = Math.max(0, endTimeRef.current - now);
    setTimeLeftMs(remaining);

    if (remaining <= 0) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
      setIsRunning(false);
      setIsFinished(true);
      releaseWakeLock();
      playSound('end', fxEnabled);
    }
  };

  const handleTogglePause = () => {
    if (!isRunning) return;

    if (!isPaused) {
      // Pause
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      pausedTimeLeftRef.current = Math.max(0, endTimeRef.current - Date.now());
      setIsPaused(true);
      releaseWakeLock();
    } else {
      // Resume
      endTimeRef.current = Date.now() + pausedTimeLeftRef.current;
      setIsPaused(false);
      requestWakeLock();
      timerIntervalRef.current = window.setInterval(tick, 100);
    }
  };

  const handleStop = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = null;
    setIsRunning(false);
    setIsPaused(false);
    setIsFinished(false);
    releaseWakeLock();
    const ms = minutes * 60 * 1000;
    setTimeLeftMs(ms);
  };

  const handleClose = () => {
    handleStop();
    onClose();
  };

  if (!isOpen) return null;

  const progress = totalTimeMs > 0 ? 1 - timeLeftMs / totalTimeMs : 0;
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const secondsLeft = Math.ceil(timeLeftMs / 1000);
  const formattedMinutes = Math.floor(secondsLeft / 60);
  const formattedSeconds = secondsLeft % 60;
  const timeString = `${String(formattedMinutes).padStart(2, '0')}:${String(
    formattedSeconds
  ).padStart(2, '0')}`;

  const currentTheme = THEMES[theme];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#f6f3ec] p-4 sm:p-6 overflow-y-auto">
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⏱️</span>
          <h2 className="text-2xl font-bold text-[#2b2f36]">Timer Visual</h2>
        </div>
        <button
          onClick={handleClose}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white border border-[#e3ded3] text-[#2b2f36] shadow-sm hover:bg-stone-50 active:scale-95 transition"
          aria-label="Fechar timer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main interactive area */}
      <div className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center my-4 gap-6">
        {/* Animated Track */}
        {/* Animated Track */}
        <div className="w-full h-32 sm:h-36 rounded-3xl bg-white border-2 border-[#e3ded3] shadow-sm relative overflow-hidden flex items-center px-6">
          {/* Background track line */}
          <div className="absolute left-6 right-6 h-2 bg-stone-100 rounded-full" />

          {(() => {
            // Calculate dynamic count of items based on minutes
            const itemCount = minutes <= 20 ? minutes : Math.min(25, Math.ceil(minutes / 2));
            const animalPos = 8 + clampedProgress * 80;

            if (theme === 'chase') {
              // In chase theme, place checkpoints/fish/cheese along the escape path
              return (
                <>
                  {Array.from({ length: itemCount }).map((_, i) => {
                    const itemPercent =
                      itemCount === 1
                        ? 60
                        : 22 + (i / Math.max(1, itemCount - 1)) * 62;
                    const isCollected = animalPos >= itemPercent - 2;
                    return (
                      <span
                        key={i}
                        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300 select-none ${
                          itemCount <= 5 ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
                        } ${isCollected ? 'scale-0 opacity-0' : 'scale-100 opacity-80'}`}
                        style={{ left: `${itemPercent}%` }}
                      >
                        🧀
                      </span>
                    );
                  })}
                  {/* Cat position: 6% + progress * 68% */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-4xl sm:text-5xl transition-all duration-300 ease-out select-none"
                    style={{ left: `${6 + clampedProgress * 68}%` }}
                  >
                    🐱
                  </div>
                  {/* Mouse position: 20% + progress * 68% */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-4xl sm:text-5xl transition-all duration-300 ease-out select-none"
                    style={{ left: `${18 + clampedProgress * 68}%` }}
                  >
                    🐭
                  </div>
                  {/* Goal house at 92% */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-4xl sm:text-5xl select-none"
                    style={{ left: '92%' }}
                  >
                    🏠
                  </div>
                </>
              );
            }

            // Cheese or Carrot themes
            return (
              <>
                {Array.from({ length: itemCount }).map((_, i) => {
                  const itemPercent =
                    itemCount === 1
                      ? 76
                      : 14 + (i / Math.max(1, itemCount - 1)) * 72;
                  const isEaten = animalPos >= itemPercent - 2;
                  const itemSizeClass =
                    itemCount <= 3
                      ? 'text-4xl sm:text-5xl'
                      : itemCount <= 6
                      ? 'text-3xl sm:text-4xl'
                      : itemCount <= 12
                      ? 'text-2xl sm:text-3xl'
                      : 'text-xl sm:text-2xl';

                  return (
                    <span
                      key={i}
                      className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 ${itemSizeClass} transition-all duration-300 select-none ${
                        isEaten ? 'scale-0 opacity-0' : 'scale-100 opacity-95'
                      }`}
                      style={{ left: `${itemPercent}%` }}
                    >
                      {currentTheme.food}
                    </span>
                  );
                })}

                {/* Animal character moving along track */}
                <span
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-4xl sm:text-5xl transition-all duration-300 ease-linear select-none drop-shadow-xs"
                  style={{ left: `${animalPos}%` }}
                >
                  {currentTheme.animal}
                </span>
              </>
            );
          })()}
        </div>

        {/* Visual elements remaining indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-[#e3ded3] text-xs font-bold text-stone-700 shadow-2xs">
          {(() => {
            const itemCount = minutes <= 20 ? minutes : Math.min(25, Math.ceil(minutes / 2));
            const animalPos = 8 + clampedProgress * 80;
            const remaining = Array.from({ length: itemCount }).filter((_, i) => {
              const itemPercent =
                itemCount === 1
                  ? (theme === 'chase' ? 60 : 76)
                  : (theme === 'chase' ? 22 : 14) + (i / Math.max(1, itemCount - 1)) * (theme === 'chase' ? 62 : 72);
              return animalPos < itemPercent - 2;
            }).length;

            const unitText = minutes <= 20 ? '1 por minuto' : `${Math.round(minutes / itemCount)} min cada`;
            const foodName =
              theme === 'carrot'
                ? remaining === 1 ? 'cenoura restante' : 'cenouras restantes'
                : remaining === 1 ? 'queijo restante' : 'queijos restantes';

            return (
              <span>
                {theme === 'carrot' ? '🥕' : '🧀'} {remaining} de {itemCount} {foodName} · {unitText}
              </span>
            );
          })()}
        </div>

        {/* Digital Clock Display */}
        <div className="text-center">
          {isFinished ? (
            <div className="flex flex-col items-center gap-2 animate-bounce">
              <span className="text-5xl">🎉</span>
              <span className="text-4xl sm:text-5xl font-black text-[#3b8a4a]">Acabou!</span>
              <p className="text-base text-[#7a7f87] font-medium">Muito bem, hora da próxima atividade!</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-6xl sm:text-7xl font-extrabold text-[#2b2f36] tracking-tight font-mono">
                {timeString}
              </span>
              <span className="text-sm font-semibold text-[#7a7f87] mt-1">
                {isRunning ? (isPaused ? 'Pausado' : 'Contando o tempo...') : `${minutes} minutos`}
              </span>
            </div>
          )}
        </div>

        {/* Configuration Chips (when not running) */}
        {!isRunning && !isFinished && (
          <div className="w-full flex flex-col items-center gap-4">
            {/* Minute Presets */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg">
              {TIMER_PRESETS.map((m) => (
                <button
                  key={m}
                  onClick={() => handleSelectTime(m)}
                  className={`px-3.5 py-2.5 rounded-xl font-bold text-base border-2 transition ${
                    minutes === m
                      ? 'bg-[#e6f0f6] border-[#4a7c9d] text-[#4a7c9d] shadow-sm'
                      : 'bg-white border-[#e3ded3] text-[#2b2f36] hover:bg-stone-50'
                  }`}
                >
                  {m} min
                </button>
              ))}

              {/* Custom input */}
              <div className="flex items-center rounded-xl border-2 border-[#e3ded3] bg-white px-2 py-1">
                <input
                  type="number"
                  min="1"
                  max="120"
                  placeholder="outro"
                  defaultValue={TIMER_PRESETS.includes(minutes) ? '' : minutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) handleSelectTime(val);
                  }}
                  className="w-16 text-center text-sm font-bold outline-none"
                />
                <span className="text-xs text-[#7a7f87] font-bold pr-1">min</span>
              </div>
            </div>

            {/* Themes Selector */}
            <div className="flex items-center justify-center gap-2">
              {(Object.keys(THEMES) as Array<'cheese' | 'carrot' | 'chase'>).map((thKey) => {
                const th = THEMES[thKey];
                return (
                  <button
                    key={thKey}
                    onClick={() => handleSelectTheme(thKey)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border-2 transition ${
                      theme === thKey
                        ? 'bg-[#e6f0f6] border-[#4a7c9d] text-[#4a7c9d] shadow-sm'
                        : 'bg-white border-[#e3ded3] text-[#2b2f36] hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-xl">{th.icon}</span>
                    <span className="hidden sm:inline">{th.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="w-full max-w-md pb-4 flex justify-center gap-3">
        {!isRunning && !isFinished && (
          <button
            onClick={handleStart}
            className="w-full py-4 px-6 rounded-2xl bg-[#4a7c9d] text-white font-bold text-xl shadow-md hover:bg-[#3d6884] active:scale-98 transition flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6 fill-current" />
            Começar · {minutes} min
          </button>
        )}

        {isRunning && (
          <>
            <button
              onClick={handleTogglePause}
              className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg border-2 shadow-sm transition flex items-center justify-center gap-2 ${
                isPaused
                  ? 'bg-[#4a7c9d] text-white border-[#4a7c9d]'
                  : 'bg-white text-[#2b2f36] border-[#e3ded3] hover:bg-stone-50'
              }`}
            >
              {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5" />}
              {isPaused ? 'Continuar' : 'Pausar'}
            </button>
            <button
              onClick={handleStop}
              className="py-4 px-6 rounded-2xl font-bold text-lg bg-white text-[#b3392f] border-2 border-[#e3ded3] shadow-sm hover:bg-red-50 transition flex items-center justify-center gap-2"
            >
              <Square className="w-5 h-5" />
              Parar
            </button>
          </>
        )}

        {isFinished && (
          <div className="w-full flex gap-3">
            <button
              onClick={handleStart}
              className="flex-1 py-4 px-6 rounded-2xl bg-[#4a7c9d] text-white font-bold text-lg shadow-md hover:bg-[#3d6884] transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Repetir
            </button>
            <button
              onClick={handleClose}
              className="py-4 px-8 rounded-2xl bg-white text-[#2b2f36] font-bold text-lg border-2 border-[#e3ded3] shadow-sm hover:bg-stone-50 transition"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
