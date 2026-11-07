import { useStore } from './store.ts';

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

/** Suica / IC Card contactless payment double-beep: 1760Hz (A6) -> 2093Hz (C7) */
export function playSuicaPing() {
  if (!useStore.getState().sfxEnabled) return;
  try {
    const c = getCtx();
    if (!c) return;
    const now = c.currentTime;
    // Tone 1
    const osc1 = c.createOscillator();
    const gain1 = c.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1760, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc1.connect(gain1);
    gain1.connect(c.destination);
    osc1.start(now);
    osc1.stop(now + 0.07);

    // Tone 2 (higher octave)
    const start2 = now + 0.075;
    const osc2 = c.createOscillator();
    const gain2 = c.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2093, start2);
    gain2.gain.setValueAtTime(0.14, start2);
    gain2.gain.exponentialRampToValueAtTime(0.001, start2 + 0.09);
    osc2.connect(gain2);
    gain2.connect(c.destination);
    osc2.start(start2);
    osc2.stop(start2 + 0.1);
  } catch {
    // ignore
  }
}

/** Crisp touch feedback click for touchscreen terminal buttons */
export function playKioskBeep() {
  if (!useStore.getState().sfxEnabled) return;
  try {
    const c = getCtx();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.04);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } catch {
    // ignore
  }
}

/** Metallic coin drop / return chime */
export function playCoinClink() {
  if (!useStore.getState().sfxEnabled) return;
  try {
    const c = getCtx();
    if (!c) return;
    const now = c.currentTime;
    [3200, 4800].forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.03);
      gain.gain.setValueAtTime(0.09, now + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.03 + 0.08);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(now + i * 0.03);
      osc.stop(now + i * 0.03 + 0.09);
    });
  } catch {
    // ignore
  }
}

/** Heavy mechanical can drop thud (ガコン！) into the retrieval chute */
export function playVendingDrop() {
  if (!useStore.getState().sfxEnabled) return;
  try {
    const c = getCtx();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.16);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.23);
  } catch {
    // ignore
  }
}

/** Izakaya table server call chime (ピンポン): G5 -> E5 */
export function playStaffChime() {
  if (!useStore.getState().sfxEnabled) return;
  try {
    const c = getCtx();
    if (!c) return;
    const now = c.currentTime;
    // Bell 1: 784 Hz (G5)
    const osc1 = c.createOscillator();
    const gain1 = c.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(783.99, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(c.destination);
    osc1.start(now);
    osc1.stop(now + 0.36);

    // Bell 2: 659 Hz (E5)
    const t2 = now + 0.22;
    const osc2 = c.createOscillator();
    const gain2 = c.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, t2);
    gain2.gain.setValueAtTime(0.15, t2);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.55);
    osc2.connect(gain2);
    gain2.connect(c.destination);
    osc2.start(t2);
    osc2.stop(t2 + 0.56);
  } catch {
    // ignore
  }
}

/** High optical scanner chirping burst (barcode scan) */
export function playBarcodeScanner() {
  if (!useStore.getState().sfxEnabled) return;
  try {
    const c = getCtx();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2480, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  } catch {
    // ignore
  }
}
