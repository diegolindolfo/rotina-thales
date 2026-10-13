let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playTone(freq: number, startDelay: number, duration: number, volume = 0.08) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = ctx.currentTime + startDelay;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  } catch (e) {
    console.warn('Audio tone failed', e);
  }
}

export function triggerVibration(pattern: number | number[]) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch {
    // ignore
  }
}

export type SoundEffectType = 'ok' | 'undo' | 'start' | 'end';

export function playSound(type: SoundEffectType, fxEnabled = true) {
  if (fxEnabled === false) return;

  try {
    if (type === 'ok') {
      playTone(660, 0, 0.14, 0.09);
      playTone(880, 0.1, 0.22, 0.09);
      triggerVibration(25);
    } else if (type === 'undo') {
      playTone(440, 0, 0.16, 0.07);
      triggerVibration(12);
    } else if (type === 'start') {
      playTone(523, 0, 0.18, 0.08);
      triggerVibration(15);
    } else if (type === 'end') {
      // celebratory fanfare chords
      const freqs = [523, 659, 784, 1047];
      freqs.forEach((freq, idx) => {
        playTone(freq, idx * 0.18, 0.45, 0.1);
      });
      triggerVibration([200, 100, 200, 100, 300]);
    }
  } catch (e) {
    console.warn('playSound error', e);
  }
}
