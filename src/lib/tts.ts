import { useStore } from './store';

let jaVoice: SpeechSynthesisVoice | null = null;

function pickVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  jaVoice = speechSynthesis.getVoices().find((v) => v.lang.startsWith('ja')) ?? null;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

export const ttsSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export function speak(rawText: string, rate?: number, onEnd?: () => void) {
  // Never read parenthetical readings aloud, e.g. 七時半（しちじはん） → 七時半
  const text = rawText.replace(/[（(][^）)]*[）)]/g, '');
  const effectiveRate = rate ?? useStore.getState().ttsRate ?? 0.9;
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
  if (ttsSupported()) {
    try {
      speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}
