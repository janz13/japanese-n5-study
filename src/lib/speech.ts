import { toHiragana } from 'wanakana';

/* Minimal typing for the Web Speech recognition API (not in TS lib). */
interface RecResult { 0: { transcript: string } }
interface RecEvent { results: ArrayLike<RecResult> }
interface Recognizer {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: RecEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

const Ctor = (window as unknown as { SpeechRecognition?: new () => Recognizer; webkitSpeechRecognition?: new () => Recognizer })
  .SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: new () => Recognizer }).webkitSpeechRecognition;

export const sttSupported = () => !!Ctor;

export function listen(onText: (t: string) => void, onDone: (err?: string) => void): () => void {
  if (!Ctor) {
    onDone('unsupported');
    return () => {};
  }
  const r = new Ctor();
  r.lang = 'ja-JP';
  r.interimResults = false;
  r.maxAlternatives = 1;
  let err: string | undefined;
  r.onresult = (e) => onText(e.results[0][0].transcript);
  r.onerror = (e) => (err = e.error);
  r.onend = () => onDone(err);
  r.start();
  return () => r.stop();
}

const normalize = (s: string) => toHiragana(s.replace(/[\s。、！？!?.,「」：ー]/g, ''));

function lcs(a: string, b: string) {
  const dp = Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    let prev = 0;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev + 1 : Math.max(dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[b.length];
}

/**
 * Similarity 0–100 between what was heard and the target.
 * Recognizers return a mix of kanji/kana, so compare against both the
 * written form and the kana reading and keep the better score.
 */
export function similarity(heard: string, targets: string[]) {
  const h = normalize(heard);
  let best = 0;
  for (const t of targets) {
    const n = normalize(t);
    if (!n) continue;
    best = Math.max(best, (2 * lcs(h, n)) / (h.length + n.length));
  }
  return Math.round(best * 100);
}
