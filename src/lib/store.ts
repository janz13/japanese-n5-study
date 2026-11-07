import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createEmptyCard, fsrs, Rating, type Card, type Grade } from 'ts-fsrs';
import { getDailyStamp } from '../data/stamps.ts';

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
  suspended?: boolean;
}

interface Word {
  t: string;
  r?: string;
  en?: string;
}

export type ThemeMode = 'dark' | 'light';
export type FuriganaMode = 'all' | 'tap' | 'none';

export type MemoryVectorType = 'meaning' | 'reading' | 'production' | 'audio';
export const MEMORY_VECTORS: MemoryVectorType[] = ['meaning', 'reading', 'production', 'audio'];

export interface MultiVectorSRSItem {
  id: string;
  kind: CardKind;
  front: string;
  reading?: string;
  meaning: string;
  audio?: string;
  vectors: Record<MemoryVectorType, Card>;
  lastReviewed?: string;
  tags?: string[];
  suspended?: boolean;
  consecutiveAgainCounts?: Partial<Record<MemoryVectorType, number>>;
}

export interface GhostCard {
  id: string; // "ghost:{parentItemId}:{vector}"
  parentItemId: string;
  vector: MemoryVectorType;
  prompt: string;
  expectedAnswer: string;
  stage: 1 | 2 | 3;
  consecutiveSuccesses: number; // 0, 1, 2 (evaporates at 3)
  nextReviewAt: string; // ISO timestamp
  createdAt: string;
}

export interface BentoNutritionPlate {
  date: string; // YYYY-MM-DD
  vocabProtein: number; // Target: 5
  grammarCarbs: number; // Target: 3
  kanjiFiber: number; // Target: 2
  listeningVitamins: number; // Target: 2
}

export type NutritionCategory = 'vocabProtein' | 'grammarCarbs' | 'kanjiFiber' | 'listeningVitamins';

export interface ExamCertificate {
  id: string;
  date: string;
  level: 'N5' | 'N4';
  mode: 'full' | 'mini';
  totalPts: number;
  langReadingPts: number;
  listenPts: number;
  passed: boolean;
  vocabGrade: 'A' | 'B' | 'C';
  grammarGrade: 'A' | 'B' | 'C';
  weakMondai: string[];
}

export interface State {
  kanaStats: Record<string, KanaStat>;
  kanjiStats: Record<string, KanaStat>;
  conjLessonsDone: Record<string, boolean>;
  campaignClearedSagas: Record<number, number>;
  campaignCompletedStages: Record<string, boolean>;
  savedWords: Word[];
  srs: Record<string, SrsItem>;
  completedStories: Record<string, number>; // id -> best score %
  grammarDone: Record<string, number>; // lesson id -> best score %
  scenesDone: Record<string, number>;
  examBest: number | null;
  examHistory: ExamCertificate[];
  bentoCount: number;
  lastBentoDate: string | null;
  unlockedStamps: Record<string, string>; // stampId -> YYYY-MM-DD
  streak: number;
  lastStudy: string | null;

  // Streak Shields & Vacation Mode
  streakShields: number; // 0..2
  lastShieldUsedDate: string | null;
  vacationMode: boolean;
  vacationStartDate: string | null;
  toggleVacationMode: () => void;
  awardStreakShield: (count?: number) => void;

  // Bento Nutrition Engine
  nutritionPlate: BentoNutritionPlate;
  recordNutritionActivity: (category: NutritionCategory, count?: number) => void;
  resetDailyPlateIfNewDay: () => void;

  // Furigana Controls
  showFurigana: boolean;
  furiganaMode: FuriganaMode;
  setFuriganaMode: (mode: FuriganaMode) => void;
  cycleFuriganaMode: () => void;
  toggleFurigana: () => void;

  theme: ThemeMode;
  ttsRate: number;
  sfxEnabled: boolean;
  recordKana: (kana: string, ok: boolean) => void;
  recordKanji: (kanji: string, ok: boolean) => void;
  completeConjLesson: (id: string) => void;
  completeCampaignStage: (stageId: string) => void;
  completeCampaignSaga: (sagaNum: number, score: number) => void;
  saveWord: (w: Word) => void;
  addCard: (item: Omit<SrsItem, 'card'>) => void;
  removeCard: (id: string) => void;
  reviewCard: (id: string, grade: Grade) => void;
  completeStory: (id: string, score: number) => void;
  completeLesson: (id: string, score: number) => void;
  completeScene: (id: string, score: number) => void;
  completeExam: (score: number) => void;
  recordExamCertificate: (cert: ExamCertificate) => void;
  completeBento: (stampId?: string) => void;
  unlockStamp: (id: string) => void;

  // --- Sign Decoder & Interactive Kiosk State Slice ---
  decodedSigns: Record<string, number>;
  shokkenkiDone: Record<string, boolean>;
  shokkenkiMissionIdx: number;
  terminalDone: Record<string, boolean>;
  terminalMissionIndices: Record<string, number>;
  recordSignChoice: (id: string, choiceIdx: number) => void;
  resetSignChoices: () => void;
  completeShokkenkiOrder: (missionId: string) => void;
  setShokkenkiMissionIdx: (idx: number) => void;
  completeTerminalOrder: (terminalType: string, missionId: string) => void;
  setTerminalMissionIdx: (terminalType: string, idx: number) => void;

  // --- Decoupled Multi-Vector FSRS Slice ---
  multiVectorItems: Record<string, MultiVectorSRSItem>;
  recordVectorReview: (itemId: string, vector: MemoryVectorType, grade: Grade) => void;
  getDueVectorQueue: (vectorFilter?: MemoryVectorType, cap?: number) => { itemId: string; vector: MemoryVectorType }[];
  getVectorRetentionMetrics: () => Record<MemoryVectorType, { dueCount: number; averageStability: number; retrievabilityPct: number }>;
  addMultiVectorCard: (item: Omit<MultiVectorSRSItem, 'vectors'> & { vectors?: Partial<Record<MemoryVectorType, Card>> }) => void;

  // --- Isolated Ghost Review Queue Slice ---
  ghosts: Record<string, GhostCard>;
  spawnGhost: (parentItemId: string, vector: MemoryVectorType, prompt: string, expectedAnswer: string) => void;
  reviewGhost: (ghostId: string, ok: boolean) => void;
  evaporateGhost: (ghostId: string) => void;
  getDueGhosts: (now?: number) => GhostCard[];

  toggleTheme: () => void;
  toggleSfx: () => void;
  setTtsRate: (rate: number) => void;
  dailyNewCardsCap: number;
  suspendCard: (id: string) => void;
  unsuspendCard: (id: string) => void;
  setDailyNewCardsCap: (cap: number) => void;
  importData: (data: Partial<State>) => void;
  resetProgress: () => void;
}

export const todayStr = () => new Date().toISOString().slice(0, 10);

export function diffCalendarDays(dateStrA: string, dateStrB: string): number {
  const [yA, mA, dA] = dateStrA.split('-').map(Number);
  const [yB, mB, dB] = dateStrB.split('-').map(Number);
  const utcA = Date.UTC(yA, mA - 1, dA);
  const utcB = Date.UTC(yB, mB - 1, dB);
  return Math.round((utcA - utcB) / 86400000);
}

export function initialNutritionPlate(date = todayStr()): BentoNutritionPlate {
  return {
    date,
    vocabProtein: 0,
    grammarCarbs: 0,
    kanjiFiber: 0,
    listeningVitamins: 0,
  };
}

function feedNutrition(plate: BentoNutritionPlate | undefined, category: NutritionCategory, count = 1): BentoNutritionPlate {
  const t = todayStr();
  const base = plate && plate.date === t ? plate : initialNutritionPlate(t);
  return {
    ...base,
    [category]: (base[category] ?? 0) + count,
  };
}

function feedAllNutrition(plate: BentoNutritionPlate | undefined, count = 2): BentoNutritionPlate {
  const t = todayStr();
  const base = plate && plate.date === t ? plate : initialNutritionPlate(t);
  return {
    ...base,
    vocabProtein: (base.vocabProtein ?? 0) + count,
    grammarCarbs: (base.grammarCarbs ?? 0) + count,
    kanjiFiber: (base.kanjiFiber ?? 0) + count,
    listeningVitamins: (base.listeningVitamins ?? 0) + count,
  };
}

function bumpStreak(s: State): Partial<State> {
  const t = todayStr();
  if (s.lastStudy === t) return {};

  // 1. Vacation Mode freezes streak decay
  if (s.vacationMode) {
    return { lastStudy: t };
  }

  // 2. First study ever
  if (!s.lastStudy) {
    return { lastStudy: t, streak: 1, streakShields: s.streakShields ?? 0 };
  }

  const diffDays = diffCalendarDays(t, s.lastStudy);

  // 3. Consecutive Day Study
  if (diffDays === 1) {
    const nextStreak = s.streak + 1;
    // Award 1 shield on every 7-day milestone (max 2 shields)
    const earnedShield = nextStreak > 0 && nextStreak % 7 === 0 && (s.streakShields ?? 0) < 2 ? 1 : 0;
    return {
      lastStudy: t,
      streak: nextStreak,
      streakShields: Math.min(2, (s.streakShields ?? 0) + earnedShield),
    };
  }

  // 4. Missed Days with Streak Shield Protection
  const missedDays = diffDays - 1;
  const currentShields = s.streakShields ?? 0;

  if (missedDays > 0 && currentShields >= missedDays) {
    // Shield auto-consumption preserves streak!
    return {
      lastStudy: t,
      streak: s.streak + 1,
      streakShields: currentShields - missedDays,
      lastShieldUsedDate: t,
    };
  }

  // 5. Streak broken (unshielded gap)
  return {
    lastStudy: t,
    streak: 1,
    streakShields: 0,
  };
}

/** Cards come back from localStorage with string dates; revive them. */
export function reviveCard(c: Card): Card {
  return { ...c, due: new Date(c.due), last_review: c.last_review ? new Date(c.last_review) : undefined };
}

export function createDefaultVectors(): Record<MemoryVectorType, Card> {
  return {
    meaning: createEmptyCard(),
    reading: createEmptyCard(),
    production: createEmptyCard(),
    audio: createEmptyCard(),
  };
}

export function reviveMultiVectorItem(item: MultiVectorSRSItem): MultiVectorSRSItem {
  return {
    ...item,
    vectors: {
      meaning: reviveCard(item.vectors.meaning),
      reading: reviveCard(item.vectors.reading),
      production: reviveCard(item.vectors.production),
      audio: reviveCard(item.vectors.audio),
    },
  };
}

export function calculateRetrievability(card: Card, now = Date.now()): number {
  const stability = card.stability ?? 0;
  if (stability <= 0) return 1.0;
  const lastReviewTime = card.last_review ? new Date(card.last_review).getTime() : new Date(card.due).getTime();
  const elapsedDays = Math.max(0, (now - lastReviewTime) / 86400000);
  return Math.max(0, Math.min(1.0, Math.exp((Math.log(0.9) * elapsedDays) / stability)));
}

export const isDue = (i: SrsItem, now = Date.now()) => !i.suspended && new Date(i.card.due).getTime() <= now;
export const isVectorDue = (card: Card, now = Date.now()): boolean => new Date(card.due).getTime() <= now;

const initialData = {
  kanaStats: {} as Record<string, KanaStat>,
  kanjiStats: {} as Record<string, KanaStat>,
  conjLessonsDone: {} as Record<string, boolean>,
  campaignClearedSagas: {} as Record<number, number>,
  campaignCompletedStages: {} as Record<string, boolean>,
  savedWords: [] as Word[],
  srs: {} as Record<string, SrsItem>,
  multiVectorItems: {} as Record<string, MultiVectorSRSItem>,
  ghosts: {} as Record<string, GhostCard>,
  completedStories: {} as Record<string, number>,
  grammarDone: {} as Record<string, number>,
  scenesDone: {} as Record<string, number>,
  examBest: null as number | null,
  examHistory: [] as ExamCertificate[],
  bentoCount: 0,
  lastBentoDate: null as string | null,
  unlockedStamps: {} as Record<string, string>,
  decodedSigns: {} as Record<string, number>,
  shokkenkiDone: {} as Record<string, boolean>,
  shokkenkiMissionIdx: 0,
  terminalDone: {} as Record<string, boolean>,
  terminalMissionIndices: { conbini: 0, izakaya: 0, kiosk: 0, shokkenki: 0 } as Record<string, number>,
  streak: 0,
  lastStudy: null as string | null,
  streakShields: 0,
  lastShieldUsedDate: null as string | null,
  vacationMode: false,
  vacationStartDate: null as string | null,
  nutritionPlate: initialNutritionPlate(),
  showFurigana: true,
  furiganaMode: 'all' as FuriganaMode,
  theme: 'dark' as ThemeMode,
  ttsRate: 0.9,
  sfxEnabled: true,
  dailyNewCardsCap: 20,
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initialData,
      toggleVacationMode: () =>
        set((s) => ({
          vacationMode: !s.vacationMode,
          vacationStartDate: !s.vacationMode ? todayStr() : null,
        })),
      awardStreakShield: (count = 1) =>
        set((s) => ({
          streakShields: Math.min(2, Math.max(0, (s.streakShields ?? 0) + count)),
        })),
      recordNutritionActivity: (category, count = 1) =>
        set((s) => ({
          nutritionPlate: feedNutrition(s.nutritionPlate, category, count),
        })),
      resetDailyPlateIfNewDay: () =>
        set((s) => {
          const t = todayStr();
          if (s.nutritionPlate?.date === t) return s;
          return { nutritionPlate: initialNutritionPlate(t) };
        }),
      setFuriganaMode: (furiganaMode) =>
        set({
          furiganaMode,
          showFurigana: furiganaMode !== 'none',
        }),
      cycleFuriganaMode: () =>
        set((s) => {
          const next: FuriganaMode =
            s.furiganaMode === 'all' ? 'tap' : s.furiganaMode === 'tap' ? 'none' : 'all';
          return {
            furiganaMode: next,
            showFurigana: next !== 'none',
          };
        }),
      toggleFurigana: () =>
        set((s) => {
          const nextMode: FuriganaMode = s.furiganaMode === 'none' ? 'all' : 'none';
          return {
            furiganaMode: nextMode,
            showFurigana: nextMode !== 'none',
          };
        }),
      recordKana: (kana, ok) =>
        set((s) => {
          const prev = s.kanaStats[kana] ?? { correct: 0, wrong: 0 };
          return {
            ...bumpStreak(s),
            kanaStats: {
              ...s.kanaStats,
              [kana]: ok ? { ...prev, correct: prev.correct + 1 } : { ...prev, wrong: prev.wrong + 1 },
            },
            nutritionPlate: feedNutrition(s.nutritionPlate, 'kanjiFiber', 1),
          };
        }),
      recordKanji: (kanji, ok) =>
        set((s) => {
          const prev = s.kanjiStats[kanji] ?? { correct: 0, wrong: 0 };
          return {
            ...bumpStreak(s),
            kanjiStats: {
              ...s.kanjiStats,
              [kanji]: ok ? { ...prev, correct: prev.correct + 1 } : { ...prev, wrong: prev.wrong + 1 },
            },
            nutritionPlate: feedNutrition(s.nutritionPlate, 'kanjiFiber', 1),
          };
        }),
      completeConjLesson: (id) =>
        set((s) => ({
          ...bumpStreak(s),
          conjLessonsDone: { ...s.conjLessonsDone, [id]: true },
          nutritionPlate: feedNutrition(s.nutritionPlate, 'grammarCarbs', 1),
        })),
      completeCampaignStage: (stageId) =>
        set((s) => ({
          ...bumpStreak(s),
          campaignCompletedStages: { ...s.campaignCompletedStages, [stageId]: true },
        })),
      completeCampaignSaga: (sagaNum, score) =>
        set((s) => ({
          ...bumpStreak(s),
          campaignClearedSagas: {
            ...s.campaignClearedSagas,
            [sagaNum]: Math.max(score, s.campaignClearedSagas[sagaNum] ?? 0),
          },
          nutritionPlate: feedAllNutrition(s.nutritionPlate, 1),
        })),
      saveWord: (w) =>
        set((s) => {
          const id = `w:${w.t}`;
          const nextSaved = s.savedWords.some((x) => x.t === w.t) ? s.savedWords : [...s.savedWords, w];
          const nextSrs = s.srs[id]
            ? s.srs
            : { ...s.srs, [id]: { id, kind: 'word' as CardKind, front: w.t, reading: w.r, back: w.en ?? '', card: createEmptyCard() } };
          const nextMulti = s.multiVectorItems[id]
            ? s.multiVectorItems
            : {
                ...s.multiVectorItems,
                [id]: {
                  id,
                  kind: 'word' as CardKind,
                  front: w.t,
                  reading: w.r,
                  meaning: w.en ?? '',
                  vectors: createDefaultVectors(),
                  tags: ['word'],
                  consecutiveAgainCounts: {},
                },
              };
          return {
            savedWords: nextSaved,
            srs: nextSrs,
            multiVectorItems: nextMulti,
          };
        }),
      addCard: (item) =>
        set((s) => {
          const nextSrs = s.srs[item.id] ? s.srs : { ...s.srs, [item.id]: { ...item, card: createEmptyCard() } };
          const nextMulti = s.multiVectorItems[item.id]
            ? s.multiVectorItems
            : {
                ...s.multiVectorItems,
                [item.id]: {
                  id: item.id,
                  kind: item.kind,
                  front: item.front,
                  reading: item.reading,
                  meaning: item.back,
                  vectors: createDefaultVectors(),
                  tags: [item.kind],
                  consecutiveAgainCounts: {},
                },
              };
          return { srs: nextSrs, multiVectorItems: nextMulti };
        }),
      removeCard: (id) =>
        set((s) => {
          const next = { ...s.srs };
          delete next[id];
          const nextMulti = { ...s.multiVectorItems };
          delete nextMulti[id];
          return { srs: next, multiVectorItems: nextMulti };
        }),
      reviewCard: (id: string, grade) =>
        set((s) => {
          const item = s.srs[id];
          if (!item) return s;
          const { card } = scheduler.next(reviveCard(item.card), new Date(), grade);
          let nutritionPlate = s.nutritionPlate;
          if (item.kind === 'word') nutritionPlate = feedNutrition(nutritionPlate, 'vocabProtein', 1);
          else if (item.kind === 'kanji') nutritionPlate = feedNutrition(nutritionPlate, 'kanjiFiber', 1);
          else if (item.kind === 'grammar') nutritionPlate = feedNutrition(nutritionPlate, 'grammarCarbs', 1);

          // Sync with multiVectorItems meaning vector if present
          const nextMulti = { ...s.multiVectorItems };
          if (nextMulti[id]) {
            nextMulti[id] = {
              ...nextMulti[id],
              vectors: {
                ...nextMulti[id].vectors,
                meaning: card,
              },
            };
          }

          return { ...bumpStreak(s), srs: { ...s.srs, [id]: { ...item, card } }, multiVectorItems: nextMulti, nutritionPlate };
        }),
      suspendCard: (id: string) =>
        set((s) => {
          const item = s.srs[id];
          const multi = s.multiVectorItems[id];
          return {
            srs: item ? { ...s.srs, [id]: { ...item, suspended: true } } : s.srs,
            multiVectorItems: multi ? { ...s.multiVectorItems, [id]: { ...multi, suspended: true } } : s.multiVectorItems,
          };
        }),
      unsuspendCard: (id: string) =>
        set((s) => {
          const item = s.srs[id];
          const multi = s.multiVectorItems[id];
          return {
            srs: item ? { ...s.srs, [id]: { ...item, suspended: false } } : s.srs,
            multiVectorItems: multi ? { ...s.multiVectorItems, [id]: { ...multi, suspended: false } } : s.multiVectorItems,
          };
        }),

      // --- Decoupled Multi-Vector FSRS Slice Implementation ---
      recordVectorReview: (itemId: string, vector: MemoryVectorType, grade: Grade) =>
        set((s) => {
          let item = s.multiVectorItems[itemId];
          if (!item) {
            const legacy = s.srs[itemId];
            item = {
              id: itemId,
              kind: legacy ? legacy.kind : 'word',
              front: legacy ? legacy.front : itemId,
              reading: legacy?.reading,
              meaning: legacy ? legacy.back : '',
              vectors: createDefaultVectors(),
              tags: [],
              consecutiveAgainCounts: {},
            };
            if (legacy) {
              item.vectors.meaning = legacy.card;
            }
          }

          const currentVectorCard = reviveCard(item.vectors[vector]);
          const oldStability = currentVectorCard.stability ?? 0;
          const { card: nextCard } = scheduler.next(currentVectorCard, new Date(), grade);

          const prevAgainCount = item.consecutiveAgainCounts?.[vector] ?? 0;
          const isAgain = grade === Rating.Again;
          const newAgainCount = isAgain ? prevAgainCount + 1 : 0;

          const nextGhosts = { ...s.ghosts };
          const ghostId = `ghost:${itemId}:${vector}`;

          // Stability protection & Ghost triggering
          let finalCard = nextCard;
          if (isAgain) {
            // Protect stability: decrement by at most 1 step rather than resetting to near 0
            if (oldStability > 1) {
              finalCard = { ...nextCard, stability: Math.max(0.1, oldStability - 1) };
            }

            // Check ghost trigger condition:
            // Grade 1 twice consecutively OR lapses >= 2 && difficulty >= 6.5
            if (newAgainCount >= 2 || ((nextCard.lapses ?? 0) >= 2 && (nextCard.difficulty ?? 0) >= 6.5)) {
              if (!nextGhosts[ghostId]) {
                const prompt = vector === 'production'
                  ? item.meaning || item.front
                  : item.front;
                const expectedAnswer = vector === 'reading'
                  ? item.reading || item.front
                  : vector === 'production'
                    ? item.reading || item.front
                    : item.meaning || item.reading || item.front;

                nextGhosts[ghostId] = {
                  id: ghostId,
                  parentItemId: itemId,
                  vector,
                  prompt,
                  expectedAnswer,
                  stage: 1,
                  consecutiveSuccesses: 0,
                  nextReviewAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
                  createdAt: new Date().toISOString(),
                };
              }
            }
          }

          const updatedItem: MultiVectorSRSItem = {
            ...item,
            lastReviewed: new Date().toISOString(),
            consecutiveAgainCounts: {
              ...(item.consecutiveAgainCounts ?? {}),
              [vector]: newAgainCount,
            },
            vectors: {
              ...item.vectors,
              [vector]: finalCard,
            },
          };

          let nutritionPlate = s.nutritionPlate;
          if (updatedItem.kind === 'word') nutritionPlate = feedNutrition(nutritionPlate, 'vocabProtein', 1);
          else if (updatedItem.kind === 'kanji') nutritionPlate = feedNutrition(nutritionPlate, 'kanjiFiber', 1);
          else if (updatedItem.kind === 'grammar') nutritionPlate = feedNutrition(nutritionPlate, 'grammarCarbs', 1);
          if (vector === 'audio') nutritionPlate = feedNutrition(nutritionPlate, 'listeningVitamins', 1);

          // Keep legacy srs in sync if this item was in srs and vector is meaning/reading
          const nextSrs = { ...s.srs };
          if (nextSrs[itemId] && (vector === 'meaning' || vector === 'reading')) {
            nextSrs[itemId] = { ...nextSrs[itemId], card: finalCard };
          }

          return {
            ...bumpStreak(s),
            multiVectorItems: {
              ...s.multiVectorItems,
              [itemId]: updatedItem,
            },
            ghosts: nextGhosts,
            srs: nextSrs,
            nutritionPlate,
          };
        }),

      getDueVectorQueue: (vectorFilter?: MemoryVectorType, cap?: number) => {
        const s = get();
        const now = Date.now();
        const queue: { itemId: string; vector: MemoryVectorType }[] = [];
        const items = Object.values(s.multiVectorItems);
        const vectorsToCheck: MemoryVectorType[] = vectorFilter ? [vectorFilter] : MEMORY_VECTORS;

        for (const item of items) {
          if (item.suspended) continue;
          for (const v of vectorsToCheck) {
            const card = item.vectors?.[v];
            if (card && isVectorDue(card, now)) {
              queue.push({ itemId: item.id, vector: v });
            }
          }
        }
        return typeof cap === 'number' && cap > 0 ? queue.slice(0, cap) : queue;
      },

      getVectorRetentionMetrics: () => {
        const s = get();
        const now = Date.now();
        const result: Record<MemoryVectorType, { dueCount: number; averageStability: number; retrievabilityPct: number }> = {
          meaning: { dueCount: 0, averageStability: 0, retrievabilityPct: 100 },
          reading: { dueCount: 0, averageStability: 0, retrievabilityPct: 100 },
          production: { dueCount: 0, averageStability: 0, retrievabilityPct: 100 },
          audio: { dueCount: 0, averageStability: 0, retrievabilityPct: 100 },
        };

        const items = Object.values(s.multiVectorItems).filter((i) => !i.suspended);
        for (const vec of MEMORY_VECTORS) {
          let dueCount = 0;
          let totalStability = 0;
          let stabilityCount = 0;
          let totalR = 0;
          let rCount = 0;

          for (const item of items) {
            const card = item.vectors?.[vec];
            if (!card) continue;
            if (isVectorDue(card, now)) {
              dueCount++;
            }
            if ((card.stability ?? 0) > 0) {
              totalStability += card.stability;
              stabilityCount++;
            }
            const r = calculateRetrievability(card, now);
            totalR += r;
            rCount++;
          }

          result[vec] = {
            dueCount,
            averageStability: stabilityCount > 0 ? Number((totalStability / stabilityCount).toFixed(2)) : 0,
            retrievabilityPct: rCount > 0 ? Number(((totalR / rCount) * 100).toFixed(1)) : 100,
          };
        }
        return result;
      },

      addMultiVectorCard: (item) =>
        set((s) => {
          if (s.multiVectorItems[item.id]) return s;
          const defaultVectors = createDefaultVectors();
          const vectors = {
            ...defaultVectors,
            ...(item.vectors ?? {}),
          };
          return {
            multiVectorItems: {
              ...s.multiVectorItems,
              [item.id]: {
                ...item,
                vectors,
                consecutiveAgainCounts: {},
              },
            },
          };
        }),

      // --- Isolated Ghost Review Queue Slice Implementation ---
      spawnGhost: (parentItemId: string, vector: MemoryVectorType, prompt: string, expectedAnswer: string) =>
        set((s) => {
          const id = `ghost:${parentItemId}:${vector}`;
          return {
            ghosts: {
              ...s.ghosts,
              [id]: {
                id,
                parentItemId,
                vector,
                prompt,
                expectedAnswer,
                stage: 1,
                consecutiveSuccesses: 0,
                nextReviewAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
                createdAt: new Date().toISOString(),
              },
            },
          };
        }),

      reviewGhost: (ghostId: string, ok: boolean) =>
        set((s) => {
          const ghost = s.ghosts[ghostId];
          if (!ghost) return s;

          if (ok) {
            const nextSuccesses = ghost.consecutiveSuccesses + 1;
            if (nextSuccesses >= 3) {
              // Evaporate permanently
              const nextGhosts = { ...s.ghosts };
              delete nextGhosts[ghostId];
              return { ...bumpStreak(s), ghosts: nextGhosts };
            }

            // Advance stage: 1 -> 2 (12h), 2 -> 3 (24h)
            const nextStage = (ghost.stage === 1 ? 2 : 3) as 1 | 2 | 3;
            const hours = nextStage === 2 ? 12 : 24;
            return {
              ...bumpStreak(s),
              ghosts: {
                ...s.ghosts,
                [ghostId]: {
                  ...ghost,
                  stage: nextStage,
                  consecutiveSuccesses: nextSuccesses,
                  nextReviewAt: new Date(Date.now() + hours * 3600 * 1000).toISOString(),
                },
              },
            };
          } else {
            // Mistake resets consecutive successes to 0, stage to 1, and reschedules for 4h
            return {
              ...bumpStreak(s),
              ghosts: {
                ...s.ghosts,
                [ghostId]: {
                  ...ghost,
                  stage: 1,
                  consecutiveSuccesses: 0,
                  nextReviewAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
                },
              },
            };
          }
        }),

      evaporateGhost: (ghostId: string) =>
        set((s) => {
          const nextGhosts = { ...s.ghosts };
          delete nextGhosts[ghostId];
          return { ghosts: nextGhosts };
        }),

      getDueGhosts: (now = Date.now()): GhostCard[] => {
        const ghosts = Object.values(get().ghosts ?? {});
        return ghosts.filter((g) => new Date(g.nextReviewAt).getTime() <= now);
      },
      setDailyNewCardsCap: (dailyNewCardsCap: number) => set({ dailyNewCardsCap }),
      completeStory: (id, score) =>
        set((s) => ({
          ...bumpStreak(s),
          completedStories: { ...s.completedStories, [id]: Math.max(score, s.completedStories[id] ?? 0) },
          nutritionPlate: feedNutrition(s.nutritionPlate, 'listeningVitamins', 2),
        })),
      completeLesson: (id, score) =>
        set((s) => ({
          ...bumpStreak(s),
          grammarDone: { ...s.grammarDone, [id]: Math.max(score, s.grammarDone[id] ?? 0) },
          nutritionPlate: feedNutrition(s.nutritionPlate, 'grammarCarbs', 2),
        })),
      completeScene: (id, score) =>
        set((s) => ({
          ...bumpStreak(s),
          scenesDone: { ...s.scenesDone, [id]: Math.max(score, s.scenesDone[id] ?? 0) },
          nutritionPlate: feedNutrition(s.nutritionPlate, 'listeningVitamins', 1),
        })),
      completeExam: (score) =>
        set((s) => ({
          ...bumpStreak(s),
          examBest: Math.max(score, s.examBest ?? 0),
          nutritionPlate: feedAllNutrition(s.nutritionPlate, 3),
        })),
      recordExamCertificate: (cert) =>
        set((s) => ({
          ...bumpStreak(s),
          examHistory: [cert, ...(s.examHistory ?? [])].slice(0, 20),
        })),
      completeBento: (stampId?: string) =>
        set((s) => {
          const t = todayStr();
          const bumped = bumpStreak(s);
          const effectiveStreak = bumped.streak ?? s.streak;
          const awardedStampId = stampId || getDailyStamp(t, effectiveStreak).id;
          return {
            ...bumped,
            bentoCount: s.bentoCount + 1,
            lastBentoDate: t,
            unlockedStamps: {
              ...s.unlockedStamps,
              [awardedStampId]: s.unlockedStamps[awardedStampId] ?? t,
            },
            nutritionPlate: feedAllNutrition(s.nutritionPlate, 2),
          };
        }),
      unlockStamp: (id) =>
        set((s) => ({
          unlockedStamps: { ...s.unlockedStamps, [id]: s.unlockedStamps[id] ?? todayStr() },
        })),
      recordSignChoice: (id, choiceIdx) =>
        set((s) => {
          if (id in s.decodedSigns) return s;
          return {
            ...bumpStreak(s),
            decodedSigns: { ...s.decodedSigns, [id]: choiceIdx },
            nutritionPlate: feedNutrition(s.nutritionPlate, 'kanjiFiber', 1),
          };
        }),
      resetSignChoices: () => set({ decodedSigns: {} }),
      completeShokkenkiOrder: (missionId) =>
        set((s) => ({
          ...bumpStreak(s),
          shokkenkiDone: { ...s.shokkenkiDone, [missionId]: true },
          terminalDone: { ...(s.terminalDone ?? {}), [missionId]: true },
          nutritionPlate: feedNutrition(s.nutritionPlate, 'listeningVitamins', 1),
        })),
      setShokkenkiMissionIdx: (idx) =>
        set((s) => ({
          shokkenkiMissionIdx: idx,
          terminalMissionIndices: { ...(s.terminalMissionIndices ?? {}), shokkenki: idx },
        })),
      completeTerminalOrder: (terminalType, missionId) =>
        set((s) => ({
          ...bumpStreak(s),
          terminalDone: { ...(s.terminalDone ?? {}), [missionId]: true },
          ...(terminalType === 'shokkenki' ? { shokkenkiDone: { ...s.shokkenkiDone, [missionId]: true } } : {}),
          nutritionPlate: feedNutrition(s.nutritionPlate, 'listeningVitamins', 1),
        })),
      setTerminalMissionIdx: (terminalType, idx) =>
        set((s) => ({
          terminalMissionIndices: { ...(s.terminalMissionIndices ?? {}), [terminalType]: idx },
          ...(terminalType === 'shokkenki' ? { shokkenkiMissionIdx: idx } : {}),
        })),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      toggleSfx: () => set((s) => ({ sfxEnabled: !s.sfxEnabled })),
      setTtsRate: (ttsRate) => set({ ttsRate }),
      importData: (data) =>
        set((s) => ({
          ...s,
          kanaStats: data.kanaStats ?? s.kanaStats,
          kanjiStats: data.kanjiStats ?? s.kanjiStats,
          conjLessonsDone: data.conjLessonsDone ?? s.conjLessonsDone,
          campaignClearedSagas: data.campaignClearedSagas ?? s.campaignClearedSagas,
          campaignCompletedStages: data.campaignCompletedStages ?? s.campaignCompletedStages,
          savedWords: data.savedWords ?? s.savedWords,
          srs: data.srs ?? s.srs,
          completedStories: data.completedStories ?? s.completedStories,
          grammarDone: data.grammarDone ?? s.grammarDone,
          scenesDone: data.scenesDone ?? s.scenesDone,
          examBest: data.examBest ?? s.examBest,
          bentoCount: data.bentoCount ?? s.bentoCount,
          lastBentoDate: data.lastBentoDate ?? s.lastBentoDate,
          unlockedStamps: data.unlockedStamps ?? s.unlockedStamps,
          decodedSigns: data.decodedSigns ?? s.decodedSigns,
          shokkenkiDone: data.shokkenkiDone ?? s.shokkenkiDone,
          shokkenkiMissionIdx: data.shokkenkiMissionIdx ?? s.shokkenkiMissionIdx,
          terminalDone: data.terminalDone ?? s.terminalDone,
          terminalMissionIndices: data.terminalMissionIndices ?? s.terminalMissionIndices,
          multiVectorItems: data.multiVectorItems ?? s.multiVectorItems,
          ghosts: data.ghosts ?? s.ghosts,
          streak: data.streak ?? s.streak,
          lastStudy: data.lastStudy ?? s.lastStudy,
          streakShields: data.streakShields ?? s.streakShields,
          vacationMode: data.vacationMode ?? s.vacationMode,
          nutritionPlate: data.nutritionPlate ?? s.nutritionPlate,
          furiganaMode: data.furiganaMode ?? s.furiganaMode,
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
      version: 10,
      migrate: (old: unknown) => {
        const s = (old ?? {}) as Partial<State>;
        const srs: Record<string, SrsItem> = s.srs ?? {};
        const multiVectorItems: Record<string, MultiVectorSRSItem> = s.multiVectorItems ?? {};
        for (const [id, item] of Object.entries(srs)) {
          if (!multiVectorItems[id]) {
            multiVectorItems[id] = {
              id: item.id,
              kind: item.kind,
              front: item.front,
              reading: item.reading,
              meaning: item.back,
              vectors: {
                meaning: item.card,
                reading: createEmptyCard(),
                production: createEmptyCard(),
                audio: createEmptyCard(),
              },
              tags: [item.kind],
              consecutiveAgainCounts: {},
            };
          }
        }
        for (const w of s.savedWords ?? []) {
          const id = `w:${w.t}`;
          srs[id] ??= { id, kind: 'word', front: w.t, reading: w.r, back: w.en ?? '', card: createEmptyCard() };
          multiVectorItems[id] ??= {
            id,
            kind: 'word',
            front: w.t,
            reading: w.r,
            meaning: w.en ?? '',
            vectors: createDefaultVectors(),
            tags: ['word'],
            consecutiveAgainCounts: {},
          };
        }
        return {
          ...initialData,
          ...s,
          srs,
          multiVectorItems,
          ghosts: s.ghosts ?? {},
          kanjiStats: s.kanjiStats ?? {},
          conjLessonsDone: s.conjLessonsDone ?? {},
          campaignClearedSagas: s.campaignClearedSagas ?? {},
          campaignCompletedStages: s.campaignCompletedStages ?? {},
          grammarDone: s.grammarDone ?? {},
          scenesDone: s.scenesDone ?? {},
          examBest: s.examBest ?? null,
          bentoCount: s.bentoCount ?? 0,
          lastBentoDate: s.lastBentoDate ?? null,
          unlockedStamps: s.unlockedStamps ?? {},
          decodedSigns: s.decodedSigns ?? {},
          shokkenkiDone: s.shokkenkiDone ?? {},
          shokkenkiMissionIdx: s.shokkenkiMissionIdx ?? 0,
          terminalDone: s.terminalDone ?? {},
          terminalMissionIndices: s.terminalMissionIndices ?? { conbini: 0, izakaya: 0, kiosk: 0, shokkenki: 0 },
          streakShields: s.streakShields ?? 0,
          lastShieldUsedDate: s.lastShieldUsedDate ?? null,
          vacationMode: s.vacationMode ?? false,
          vacationStartDate: s.vacationStartDate ?? null,
          nutritionPlate: s.nutritionPlate && s.nutritionPlate.date === todayStr()
            ? s.nutritionPlate
            : initialNutritionPlate(),
          furiganaMode: s.furiganaMode ?? (s.showFurigana === false ? 'none' : 'all'),
          theme: s.theme ?? 'dark',
          ttsRate: s.ttsRate ?? 0.9,
          sfxEnabled: s.sfxEnabled ?? true,
          dailyNewCardsCap: s.dailyNewCardsCap ?? 20,
        } as State;
      },
    },
  ),
);

/** Progression: lesson N unlocks after story N-1; story N unlocks after lesson N (≥60%). */
export const PASS = 60;
