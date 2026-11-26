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
  'cheese' | 'carrot' | 'chase',
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
  const [customInput, setCustomInput] = useState<string>(
    TIMER_PRESETS.includes(config.m || 5) ? '' : String(config.m || 5)
  );
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
  const prevOpenRef = useRef(false);

  // Sync initial config ONLY when modal opens (not on every parent re-render)
  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      const m = config.m || 5;
      setMinutes(m);
      setCustomInput(TIMER_PRESETS.includes(m) ? '' : String(m));
      setTheme(config.th || 'cheese');
      setIsRunning(false);
      setIsPaused(false);
      setIsFinished(false);
      const ms = m * 60 * 1000;
      setTimeLeftMs(ms);
      setTotalTimeMs(ms);
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, config.m, config.th]);

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

  // Re-acquire WakeLock if tab becomes visible again while timer is running
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning && !isPaused) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      releaseWakeLock();
    };
  }, []);

  const handleSelectTime = (m: number, fromCustomInput = false) => {
    if (isRunning) return;
    const clamped = Math.max(1, Math.min(120, m));
    setMinutes(clamped);
    if (!fromCustomInput) {
      setCustomInput(TIMER_PRESETS.includes(clamped) ? '' : String(clamped));
    }
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

  useEffect(() => {
    if (!isOpen || isRunning) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

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
  const itemCount = minutes <= 20 ? minutes : Math.min(25, Math.ceil(minutes / 2));
  const mousePos = 18 + clampedProgress * 68;
  const animalPos = 8 + clampedProgress * 80;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="visual-timer-title"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#f6f3ec] p-4 sm:p-6 pt-safe pb-safe overflow-y-auto animate-fade-in"
    >
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">⏱️</span>
          <h2 id="visual-timer-title" className="text-2xl font-extrabold text-[#252a31]">
            Timer Visual
          </h2>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white border border-[#e2dcd0] text-[#252a31] shadow-2xs hover:bg-[#efeae0]/60 active:scale-95 transition cursor-pointer"
          aria-label="Fechar timer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main interactive area */}
      <div className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center my-4 gap-6">
        {/* Animated Track */}
        <div className="w-full h-32 sm:h-36 rounded-3xl bg-white border-2 border-[#e2dcd0] shadow-xs relative overflow-hidden flex items-center px-6">
          {/* Background track line */}
          <div className="absolute left-6 right-6 h-2.5 bg-[#f6f3ec] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#dfeef8] transition-all duration-300 ease-linear rounded-full"
              style={{ width: `${clampedProgress * 100}%` }}
            />
          </div>

          {theme === 'chase' ? (
            <>
              {Array.from({ length: itemCount }).map((_, i) => {
                const itemPercent =
                  itemCount === 1
                    ? 60
                    : 22 + (i / Math.max(1, itemCount - 1)) * 62;
                const isCollected = mousePos >= itemPercent - 2;
                return (
                  <span
                    key={i}
                    className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300 select-none ${
                      itemCount <= 5 ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
                    } ${isCollected ? 'scale-0 opacity-0' : 'scale-100 opacity-85'}`}
                    style={{ left: `${itemPercent}%` }}
                  >
                    🧀
                  </span>
                );
              })}
              {/* Cat position */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-4xl sm:text-5xl transition-all duration-300 ease-out select-none"
                style={{ left: `${6 + clampedProgress * 68}%` }}
              >
                🐱
              </div>
              {/* Mouse position */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-4xl sm:text-5xl transition-all duration-300 ease-out select-none"
                style={{ left: `${mousePos}%` }}
              >
                🐭
              </div>
              {/* Goal house */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-4xl sm:text-5xl select-none"
                style={{ left: '92%' }}
              >
                🏠
              </div>
            </>
          ) : (
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
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-4xl sm:text-5xl transition-all duration-300 ease-linear select-none"
                style={{ left: `${animalPos}%` }}
              >
                {currentTheme.animal}
              </span>
            </>
          )}
        </div>

        {/* Visual elements remaining indicator */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e2dcd0] text-xs font-extrabold text-[#252a31] shadow-2xs">
          {(() => {
            const currentActorPos = theme === 'chase' ? mousePos : animalPos;
            const remaining = Array.from({ length: itemCount }).filter((_, i) => {
              const itemPercent =
                itemCount === 1
                  ? theme === 'chase'
                    ? 60
                    : 76
                  : (theme === 'chase' ? 22 : 14) +
                    (i / Math.max(1, itemCount - 1)) * (theme === 'chase' ? 62 : 72);
              return currentActorPos < itemPercent - 2;
            }).length;

            const unitText =
              minutes <= 20 ? '1 por minuto' : `${Math.round(minutes / itemCount)} min cada`;
            const foodName =
              theme === 'carrot'
                ? remaining === 1
                  ? 'cenoura restante'
                  : 'cenouras restantes'
                : remaining === 1
                ? 'queijo restante'
                : 'queijos restantes';

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
            <div className="flex flex-col items-center gap-2 animate-check-pop">
              <span className="text-5xl">🎉</span>
              <span className="text-4xl sm:text-5xl font-black text-[#2f8544]">Tempo concluído!</span>
              <p className="text-base text-[#6b717b] font-bold">
                Muito bem, hora da próxima atividade!
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-6xl sm:text-7xl font-extrabold text-[#252a31] tracking-tight font-mono tabular-nums">
                {timeString}
              </span>
              <span className="text-sm font-bold text-[#6b717b] mt-1">
                {isRunning
                  ? isPaused
                    ? 'Pausado'
                    : 'Contando o tempo...'
                  : `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`}
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
                  type="button"
                  key={m}
                  onClick={() => handleSelectTime(m, false)}
                  className={`px-3.5 py-2.5 rounded-2xl font-extrabold text-sm sm:text-base border-2 transition cursor-pointer ${
                    minutes === m && customInput === ''
                      ? 'bg-[#dfeef8] border-[#3f7396] text-[#3f7396] shadow-2xs'
                      : 'bg-white border-[#e2dcd0] text-[#252a31] hover:bg-[#efeae0]/60'
                  }`}
                >
                  {m} min
                </button>
              ))}

              {/* Controlled custom input */}
              <div
                className={`flex items-center rounded-2xl border-2 bg-white px-2.5 py-1.5 transition ${
                  customInput !== '' ? 'border-[#3f7396] bg-[#dfeef8]/40' : 'border-[#e2dcd0]'
                }`}
              >
                <input
                  type="number"
                  min="1"
                  max="120"
                  placeholder="Outro"
                  value={customInput}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setCustomInput(raw);
                    const val = parseInt(raw, 10);
                    if (!isNaN(val) && val > 0) {
                      handleSelectTime(val, true);
                    }
                  }}
                  aria-label="Minutos personalizados"
                  className="w-16 text-center text-sm font-extrabold text-[#252a31] bg-transparent outline-none"
                />
                <span className="text-xs text-[#6b717b] font-extrabold pr-1">min</span>
              </div>
            </div>

            {/* Themes Selector */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {(Object.keys(THEMES) as Array<'cheese' | 'carrot' | 'chase'>).map((thKey) => {
                const th = THEMES[thKey];
                return (
                  <button
                    type="button"
                    key={thKey}
                    onClick={() => handleSelectTheme(thKey)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-extrabold text-sm border-2 transition cursor-pointer ${
                      theme === thKey
                        ? 'bg-[#dfeef8] border-[#3f7396] text-[#3f7396] shadow-2xs'
                        : 'bg-white border-[#e2dcd0] text-[#252a31] hover:bg-[#efeae0]/60'
                    }`}
                  >
                    <span className="text-xl">{th.icon}</span>
                    <span>{th.name}</span>
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
            type="button"
            onClick={handleStart}
            className="w-full py-4 px-6 rounded-2xl bg-[#3f7396] text-white font-extrabold text-xl shadow-md hover:bg-[#335f7d] active:scale-98 transition flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-current" />
            Começar · {minutes} min
          </button>
        )}

        {isRunning && (
          <>
            <button
              type="button"
              onClick={handleTogglePause}
              className={`flex-1 py-4 px-6 rounded-2xl font-extrabold text-lg border-2 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                isPaused
                  ? 'bg-[#3f7396] text-white border-[#3f7396]'
                  : 'bg-white text-[#252a31] border-[#e2dcd0] hover:bg-[#efeae0]/60'
              }`}
            >
              {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5" />}
              {isPaused ? 'Continuar' : 'Pausar'}
            </button>
            <button
              type="button"
              onClick={handleStop}
              className="py-4 px-6 rounded-2xl font-extrabold text-lg bg-white text-[#c03a2b] border-2 border-[#e2dcd0] shadow-xs hover:bg-[#fdeceb] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Square className="w-5 h-5" />
              Parar
            </button>
          </>
        )}

        {isFinished && (
          <div className="w-full flex gap-3">
            <button
              type="button"
              onClick={handleStart}
              className="flex-1 py-4 px-6 rounded-2xl bg-[#3f7396] text-white font-extrabold text-lg shadow-md hover:bg-[#335f7d] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              Repetir
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="py-4 px-8 rounded-2xl bg-white text-[#252a31] font-extrabold text-lg border-2 border-[#e2dcd0] shadow-xs hover:bg-[#efeae0]/60 transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

