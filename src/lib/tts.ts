import { useStore } from './store';

let jaVoice: SpeechSynthesisVoice | null = null;
let jaVoices: SpeechSynthesisVoice[] = [];
/** Incremented on every new speak/stop so stale dialogue chains abort. */
let generation = 0;

function pickVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  jaVoices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith('ja'));
  jaVoice = jaVoices[0] ?? null;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

export const ttsSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

/** Turn 0 = narrator, then alternating Speaker A / Speaker B. */
const TURN_PITCH = [1.0, 1.18, 0.85];
const TURN_GAP_MS = 450;

/**
 * Speak a multi-turn dialogue (turns separated by ……) as separate utterances
 * with real silence between turns and a distinct pitch (and voice, if the
 * device has more than one Japanese voice) per speaker.
 */
function speakDialogue(turns: string[], rate: number, onEnd?: () => void) {
  const myGen = ++generation;
  let i = 0;
  const next = () => {
    if (myGen !== generation) return;
    if (i >= turns.length) return onEnd?.();
    const idx = i++;
    const role = idx === 0 ? 0 : ((idx - 1) % 2) + 1;
    let advanced = false;
    const advance = () => {
      if (advanced) return;
      advanced = true;
      clearTimeout(fallback);
      setTimeout(next, TURN_GAP_MS);
    };
    const fallback = setTimeout(advance, Math.min(12000, Math.max(1500, (turns[idx].length * 260) / rate)));
    if (!ttsSupported()) return;
    try {
      const u = new SpeechSynthesisUtterance(turns[idx]);
      u.lang = 'ja-JP';
      u.rate = rate;
      u.pitch = TURN_PITCH[role];
      const voice = role === 2 && jaVoices.length > 1 ? jaVoices[1] : jaVoice;
      if (voice) u.voice = voice;
      u.onend = advance;
      u.onerror = advance;
      speechSynthesis.speak(u);
    } catch {
      advance();
    }
  };
  if (ttsSupported()) {
    try {
      speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
  next();
}

export function speak(rawText: string, rate?: number, onEnd?: () => void) {
  // Never read parenthetical readings aloud, e.g. 七時半（しちじはん） → 七時半
  const text = rawText.replace(/[（(][^）)]*[）)]/g, '');
  const effectiveRate = rate ?? useStore.getState().ttsRate ?? 0.9;

  const turns = text.split('……').map((s) => s.trim()).filter(Boolean);
  if (turns.length > 1) return speakDialogue(turns, effectiveRate, onEnd);
  generation++;
  let called = false;
  const finish = () => {
    if (called) return;
    called = true;
    clearTimeout(fallbackTimer);
    onEnd?.();
  };

  // Fallback timer guarantees `onEnd` always fires even if browser TTS is muted,
  // blocked by autoplay policy, or lacks a local Japanese voice.
  const estMs = Math.min(8000, Math.max(1200, (text.length * 260) / effectiveRate));
  const fallbackTimer = setTimeout(finish, estMs);

  if (!ttsSupported()) return;

  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.rate = effectiveRate;
    if (jaVoice) u.voice = jaVoice;
    u.onend = finish;
    u.onerror = finish;
    speechSynthesis.speak(u);
  } catch {
    finish();
  }
}

export function stopSpeaking() {
  generation++;
  if (ttsSupported()) {
    try {
      speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}
