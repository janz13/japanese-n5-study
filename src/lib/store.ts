import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createEmptyCard, fsrs, type Card, type Grade } from 'ts-fsrs';

const scheduler = fsrs();

interface KanaStat {
  correct: number;
  wrong: number;
}

export type CardKind = 'word' | 'kanji';

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

interface State {
  kanaStats: Record<string, KanaStat>;
  savedWords: Word[];
  srs: Record<string, SrsItem>;
  completedStories: Record<string, number>; // id -> best score %
  grammarDone: Record<string, number>; // lesson id -> best score %
  scenesDone: Record<string, number>;
  streak: number;
  lastStudy: string | null;
  showFurigana: boolean;
  recordKana: (kana: string, ok: boolean) => void;
  saveWord: (w: Word) => void;
  addCard: (item: Omit<SrsItem, 'card'>) => void;
  reviewCard: (id: string, grade: Grade) => void;
  completeStory: (id: string, score: number) => void;
  completeLesson: (id: string, score: number) => void;
  completeScene: (id: string, score: number) => void;
  toggleFurigana: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

function bumpStreak(s: State): Partial<State> {
  const t = today();
  if (s.lastStudy === t) return {};
  const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  return { lastStudy: t, streak: s.lastStudy === y ? s.streak + 1 : 1 };
}

/** Cards come back from localStorage with string dates; revive them. */
export function reviveCard(c: Card): Card {
  return { ...c, due: new Date(c.due), last_review: c.last_review ? new Date(c.last_review) : undefined };
}

export const isDue = (i: SrsItem, now = Date.now()) => new Date(i.card.due).getTime() <= now;

export const useStore = create<State>()(
  persist(
    (set) => ({
      kanaStats: {},
      savedWords: [],
      srs: {},
      completedStories: {},
      grammarDone: {},
      scenesDone: {},
      streak: 0,
      lastStudy: null,
      showFurigana: true,
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
      reviewCard: (id, grade) =>
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
      toggleFurigana: () => set((s) => ({ showFurigana: !s.showFurigana })),
    }),
    {
      name: 'n5-study',
      version: 2,
      // v1 had savedWords but no SRS cards: convert them
      migrate: (old: unknown) => {
        const s = old as State;
        const srs: Record<string, SrsItem> = s.srs ?? {};
        for (const w of s.savedWords ?? []) {
          const id = `w:${w.t}`;
          srs[id] ??= { id, kind: 'word', front: w.t, reading: w.r, back: w.en ?? '', card: createEmptyCard() };
        }
        return { ...s, srs, grammarDone: s.grammarDone ?? {}, scenesDone: s.scenesDone ?? {} } as State;
      },
    },
  ),
);

/** Progression: lesson N unlocks after story N-1; story N unlocks after lesson N (≥60%). */
export const PASS = 60;
