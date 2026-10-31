import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createEmptyCard, fsrs, type Card, type Grade } from 'ts-fsrs';

const scheduler = fsrs();

interface KanaStat {
  correct: number;
  wrong: number;
}

export type CardKind = 'word' | 'kanji' | 'grammar';

export interface SrsItem {
  id: string;
  kind: CardKind;
  front: string;
  reading?: string;
  back: string;
  card: Card;
}

interface Word {
  t: string;
  r?: string;
  en?: string;
}

export type ThemeMode = 'dark' | 'light';

interface State {
  kanaStats: Record<string, KanaStat>;
  savedWords: Word[];
  srs: Record<string, SrsItem>;
  completedStories: Record<string, number>; // id -> best score %
  grammarDone: Record<string, number>; // lesson id -> best score %
  scenesDone: Record<string, number>;
  examBest: number | null;
  bentoCount: number;
  lastBentoDate: string | null;
  unlockedStamps: Record<string, string>; // stampId -> YYYY-MM-DD
  streak: number;
  lastStudy: string | null;
  showFurigana: boolean;
  theme: ThemeMode;
  ttsRate: number;
  sfxEnabled: boolean;
  recordKana: (kana: string, ok: boolean) => void;
  saveWord: (w: Word) => void;
  addCard: (item: Omit<SrsItem, 'card'>) => void;
  reviewCard: (id: string, grade: Grade) => void;
  completeStory: (id: string, score: number) => void;
  completeLesson: (id: string, score: number) => void;
  completeScene: (id: string, score: number) => void;
  completeExam: (score: number) => void;
  completeBento: () => void;
  unlockStamp: (id: string) => void;
  toggleFurigana: () => void;
  toggleTheme: () => void;
  toggleSfx: () => void;
  setTtsRate: (rate: number) => void;
  importData: (data: Partial<State>) => void;
  resetProgress: () => void;
}

export const todayStr = () => new Date().toISOString().slice(0, 10);

function bumpStreak(s: State): Partial<State> {
  const t = todayStr();
  if (s.lastStudy === t) return {};
  const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  return { lastStudy: t, streak: s.lastStudy === y ? s.streak + 1 : 1 };
}

/** Cards come back from localStorage with string dates; revive them. */
export function reviveCard(c: Card): Card {
  return { ...c, due: new Date(c.due), last_review: c.last_review ? new Date(c.last_review) : undefined };
}

export const isDue = (i: SrsItem, now = Date.now()) => new Date(i.card.due).getTime() <= now;

const initialData = {
  kanaStats: {} as Record<string, KanaStat>,
  savedWords: [] as Word[],
  srs: {} as Record<string, SrsItem>,
  completedStories: {} as Record<string, number>,
  grammarDone: {} as Record<string, number>,
  scenesDone: {} as Record<string, number>,
  examBest: null as number | null,
  bentoCount: 0,
  lastBentoDate: null as string | null,
  unlockedStamps: {} as Record<string, string>,
  streak: 0,
  lastStudy: null as string | null,
  showFurigana: true,
  theme: 'dark' as ThemeMode,
  ttsRate: 0.9,
  sfxEnabled: true,
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      ...initialData,
      recordKana: (kana, ok) =>
        set((s) => {
          const prev = s.kanaStats[kana] ?? { correct: 0, wrong: 0 };
          return {
            ...bumpStreak(s),
            kanaStats: {
              ...s.kanaStats,
              [kana]: ok ? { ...prev, correct: prev.correct + 1 } : { ...prev, wrong: prev.wrong + 1 },
            },
          };
        }),
      saveWord: (w) =>
        set((s) => {
          const id = `w:${w.t}`;
          return {
            savedWords: s.savedWords.some((x) => x.t === w.t) ? s.savedWords : [...s.savedWords, w],
            srs: s.srs[id]
              ? s.srs
              : { ...s.srs, [id]: { id, kind: 'word', front: w.t, reading: w.r, back: w.en ?? '', card: createEmptyCard() } },
          };
        }),
      addCard: (item) =>
        set((s) => (s.srs[item.id] ? s : { srs: { ...s.srs, [item.id]: { ...item, card: createEmptyCard() } } })),
      reviewCard: (id: string, grade) =>
        set((s) => {
          const item = s.srs[id];
          if (!item) return s;
          const { card } = scheduler.next(reviveCard(item.card), new Date(), grade);
          return { ...bumpStreak(s), srs: { ...s.srs, [id]: { ...item, card } } };
        }),
      completeStory: (id, score) =>
        set((s) => ({
          ...bumpStreak(s),
          completedStories: { ...s.completedStories, [id]: Math.max(score, s.completedStories[id] ?? 0) },
        })),
      completeLesson: (id, score) =>
        set((s) => ({ ...bumpStreak(s), grammarDone: { ...s.grammarDone, [id]: Math.max(score, s.grammarDone[id] ?? 0) } })),
      completeScene: (id, score) =>
        set((s) => ({ ...bumpStreak(s), scenesDone: { ...s.scenesDone, [id]: Math.max(score, s.scenesDone[id] ?? 0) } })),
      completeExam: (score) =>
        set((s) => ({ ...bumpStreak(s), examBest: Math.max(score, s.examBest ?? 0) })),
      completeBento: () =>
        set((s) => {
          const t = todayStr();
          return {
            ...bumpStreak(s),
            bentoCount: s.bentoCount + 1,
            lastBentoDate: t,
            unlockedStamps: {
              ...s.unlockedStamps,
              ueno: s.unlockedStamps.ueno ?? t,
            },
          };
        }),
      unlockStamp: (id) =>
        set((s) => ({
          unlockedStamps: { ...s.unlockedStamps, [id]: s.unlockedStamps[id] ?? todayStr() },
        })),
      toggleFurigana: () => set((s) => ({ showFurigana: !s.showFurigana })),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      toggleSfx: () => set((s) => ({ sfxEnabled: !s.sfxEnabled })),
      setTtsRate: (ttsRate) => set({ ttsRate }),
      importData: (data) =>
        set((s) => ({
          ...s,
          kanaStats: data.kanaStats ?? s.kanaStats,
          savedWords: data.savedWords ?? s.savedWords,
          srs: data.srs ?? s.srs,
          completedStories: data.completedStories ?? s.completedStories,
          grammarDone: data.grammarDone ?? s.grammarDone,
          scenesDone: data.scenesDone ?? s.scenesDone,
          examBest: data.examBest ?? s.examBest,
          bentoCount: data.bentoCount ?? s.bentoCount,
          lastBentoDate: data.lastBentoDate ?? s.lastBentoDate,
          unlockedStamps: data.unlockedStamps ?? s.unlockedStamps,
          streak: data.streak ?? s.streak,
          lastStudy: data.lastStudy ?? s.lastStudy,
        })),
      resetProgress: () =>
        set((s) => ({
          ...initialData,
          theme: s.theme,
          ttsRate: s.ttsRate,
          sfxEnabled: s.sfxEnabled,
        })),
    }),
    {
      name: 'n5-study',
      version: 6,
      migrate: (old: unknown) => {
        const s = (old ?? {}) as Partial<State>;
        const srs: Record<string, SrsItem> = s.srs ?? {};
        for (const w of s.savedWords ?? []) {
          const id = `w:${w.t}`;
          srs[id] ??= { id, kind: 'word', front: w.t, reading: w.r, back: w.en ?? '', card: createEmptyCard() };
        }
        return {
          ...initialData,
          ...s,
          srs,
          grammarDone: s.grammarDone ?? {},
          scenesDone: s.scenesDone ?? {},
          examBest: s.examBest ?? null,
          bentoCount: s.bentoCount ?? 0,
          lastBentoDate: s.lastBentoDate ?? null,
          unlockedStamps: s.unlockedStamps ?? {},
          theme: s.theme ?? 'dark',
          ttsRate: s.ttsRate ?? 0.9,
          sfxEnabled: s.sfxEnabled ?? true,
        } as State;
      },
    },
  ),
);

/** Progression: lesson N unlocks after story N-1; story N unlocks after lesson N (≥60%). */
export const PASS = 60;
