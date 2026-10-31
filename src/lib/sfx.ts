import { useStore } from './store';

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctor) ctx = new Ctor();
  }
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

/** Soft chime on correct answer */
export function playDing() {
  if (!useStore.getState().sfxEnabled) return;
  try {
    const c = getCtx();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.09); // A5
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.23);
  } catch {
    // ignore audio context restrictions
  }
}

/** Soft low wooden thud on wrong answer */
export function playMiss() {
  if (!useStore.getState().sfxEnabled) return;
  try {
    const c = getCtx();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.14);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  } catch {
    // ignore
  }
}

/** Celebratory Japanese pentatonic arpeggio on Bento / Stamp completion */
export function playFanfare() {
  if (!useStore.getState().sfxEnabled) return;
  try {
    const c = getCtx();
    if (!c) return;
    const notes = [523.25, 587.33, 659.25, 783.99, 1046.5]; // C5 D5 E5 G5 C6
    notes.forEach((freq, i) => {
      const start = c.currentTime + i * 0.08;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(start);
      osc.stop(start + 0.36);
    });
  } catch {
    // ignore
  }
}
