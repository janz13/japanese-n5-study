let jaVoice: SpeechSynthesisVoice | null = null;

function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  jaVoice = speechSynthesis.getVoices().find((v) => v.lang.startsWith('ja')) ?? null;
}

if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

export const ttsSupported = () => 'speechSynthesis' in window;

export function speak(text: string, rate = 0.9, onEnd?: () => void) {
  if (!ttsSupported()) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP';
  u.rate = rate;
  if (jaVoice) u.voice = jaVoice;
  if (onEnd) u.onend = onEnd;
  speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (ttsSupported()) speechSynthesis.cancel();
}
