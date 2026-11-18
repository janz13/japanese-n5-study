import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Rating, type Grade } from 'ts-fsrs';
import { toHiragana } from 'wanakana';
import { HIRAGANA, KATAKANA } from '../data/kana';
import { CONJUGATIONS, FORM_LABELS } from '../data/conjugations';
import { KANJI } from '../data/kanji';
import { getDailyStamp, TRAVEL_COUNTERS } from '../data/stamps';
import {
  BEGINNER_BENTO_POOL,
  BEGINNER_TRACE_KANJI,
  TRAVEL_BENTO_POOL,
} from '../data/bentoStarterPool';
import { TraceCanvas } from '../components/Strokes';
import { StampSvg } from './StampBook';
import { isDue, useStore, todayStr, type SrsItem, type BentoNutritionPlate } from '../lib/store';
import { speak } from '../lib/tts';
import { playDing, playFanfare } from '../lib/sfx';
import { SIGNS } from '../data/signs';
import { PARTICLE_SLOT_CHALLENGES, type ParticleSlotChallenge } from '../data/particles';
import { ParticleSlotGrid } from '../components/ParticleSlotGrid';
import { useCampaignMission } from '../lib/useCampaignMission';
import CampaignBanner from '../components/CampaignBanner';
import {
  bumpRoundSeq,
  commitSeenIds,
  pickUnseenBatch,
  readRoundSeq,
  readSeenIds,
  seededShuffle,
  writeSeenIds,
} from '../lib/deckSampler';

function dayHash(dateStr: string): number {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = ((h << 5) - h + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function migrateLegacyBentoSigns(): void {
  try {
    if (readSeenIds('bento_signs').length > 0) return;
    const raw = localStorage.getItem('n5_bento_seen_signs');
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const valid = parsed.filter((id): id is string => typeof id === 'string');
      if (valid.length > 0) writeSeenIds('bento_signs', valid);
    }
  } catch {
    // Ignore storage errors
  }
}

interface WarmupPrompt {
  id: string;
  sourceBucket: 'kana' | 'counter' | 'verb' | 'slot';
  label: string;
  display: string;
  sub: string;
  answers: string[];
  audio: string;
  options: string[];
  slotChallenge?: ParticleSlotChallenge;
}

export { TRAVEL_COUNTERS };

function BentoNutritionPlateCard({
  plate,
  shields,
  vacation,
  onToggleVacation,
}: {
  plate: BentoNutritionPlate;
  shields: number;
  vacation: boolean;
  onToggleVacation: () => void;
}) {
  const isFull =
    plate.vocabProtein >= 5 &&
    plate.grammarCarbs >= 3 &&
    plate.kanjiFiber >= 2 &&
    plate.listeningVitamins >= 2;

  const nutrients = [
    { id: 'vocab', name: 'Vocab Protein', icon: '🥩', cur: plate.vocabProtein, target: 5, color: '#ef4444' },
    { id: 'grammar', name: 'Grammar Carbs', icon: '🍚', cur: plate.grammarCarbs, target: 3, color: '#3b82f6' },
    { id: 'kanji', name: 'Kanji Fiber', icon: '🥗', cur: plate.kanjiFiber, target: 2, color: '#10b981' },
    { id: 'listening', name: 'Listening Vitamins', icon: '🍊', cur: plate.listeningVitamins, target: 2, color: '#f59e0b' },
  ];

  return (
    <div
      className="gp"
      style={{
        margin: '0.6rem 0 0.9rem',
        padding: '0.85rem 1rem',
        background: 'var(--surface, #1e293b)',
        borderRadius: '10px',
        border: isFull ? '2px solid #10b981' : '1px solid var(--border, #334155)',
      }}
    >
      <div className="row-between" style={{ flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <b style={{ fontSize: '0.92rem' }}>🍱 Daily Balance (栄養バランス)</b>
          {isFull && (
            <span className="chip ok" style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', fontWeight: 700 }}>
              ✨ 栄養満点！
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            className="chip"
            style={{
              fontSize: '0.76rem',
              borderColor: shields > 0 ? '#38bdf8' : 'var(--border)',
              color: shields > 0 ? '#38bdf8' : 'inherit',
            }}
            title="Shields automatically absorb missed calendar days"
          >
            🛡️ {shields}/2 Shields
          </span>
          <button
            type="button"
            className={vacation ? 'chip on' : 'chip'}
            style={{ fontSize: '0.76rem', padding: '0.2rem 0.55rem' }}
            onClick={onToggleVacation}
            title="Vacation pause freezes streak decay"
          >
            {vacation ? '🌴 Vacation ON' : '🏖️ Vacation Pause'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.55rem' }}>
        {nutrients.map((n) => {
          const pct = Math.min(100, Math.round((n.cur / n.target) * 100));
          const met = n.cur >= n.target;
          return (
            <div
              key={n.id}
              style={{
                background: 'rgba(0,0,0,0.15)',
                padding: '0.45rem 0.6rem',
                borderRadius: '6px',
                border: met ? `1px solid ${n.color}` : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="row-between" style={{ fontSize: '0.74rem', marginBottom: '0.28rem' }}>
                <span>{n.icon} {n.name}</span>
                <span style={{ fontWeight: 700, color: met ? '#10b981' : 'inherit' }}>
                  {n.cur}/{n.target}
                </span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: n.color,
                    borderRadius: '3px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const TRACK_LABELS: Record<'beginner' | 'travel' | 'n5' | 'n4', string> = {
  beginner: '🌱 Beginner',
  travel: '🧳 Travel',
  n5: '⚡ N5 Core',
  n4: '🚀 N4 Bridge',
};

export default function DailyBento() {
  const [searchParams] = useSearchParams();
  const forcePractice = searchParams.get('practice') === '1';

  const {
    srs,
    addCard,
    reviewCard,
    recordKana,
    completeBento,
    bentoCount,
    kanaStats,
    streak,
    lastStudy,
    lastBentoDate,
    streakShields,
    vacationMode,
    toggleVacationMode,
    nutritionPlate,
    recordNutritionActivity,
    resetDailyPlateIfNewDay,
  } = useStore();
  const { isCampaignMode, stage, saga, returnToCampaign, completeMission } = useCampaignMission();

  const todayIso = todayStr();
  const [dish, setDish] = useState<1 | 2 | 3 | 4 | 5>(() =>
    !isCampaignMode && !forcePractice && lastBentoDate === todayIso ? 5 : 1,
  );
  const [roundSeq, setRoundSeq] = useState(() => readRoundSeq('bento_round'));
  const [showBentoMeta, setShowBentoMeta] = useState(false);

  useEffect(() => {
    resetDailyPlateIfNewDay();
  }, [resetDailyPlateIfNewDay]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dish]);

  const [studyTrack, setStudyTrack] = useState<'beginner' | 'travel' | 'n5' | 'n4'>(() => {
    return (localStorage.getItem('n5_study_track') as 'beginner' | 'travel' | 'n5' | 'n4') || 'beginner';
  });

  const selectTrack = (t: 'beginner' | 'travel' | 'n5' | 'n4') => {
    setStudyTrack(t);
    try {
      localStorage.setItem('n5_study_track', t);
    } catch {
      // ignore
    }
  };

  // 5-minute informational pace timer
  const [secondsLeft, setSecondsLeft] = useState(300);
  useEffect(() => {
    if (dish >= 5) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [dish]);

  // Seed rotates across days, completions, and intra-day bonus rounds
  const sessionSeed = useMemo(() => {
    return dayHash(todayIso) + bentoCount * 7919 + roundSeq * 104729;
  }, [bentoCount, todayIso, roundSeq]);

  // Dish 1: 5 Warm-up prompts tailored to active track without repeating earlier sessions
  const warmups = useMemo<WarmupPrompt[]>(() => {
    const practicedCount = HIRAGANA.filter((k) => (kanaStats[k.kana]?.correct ?? 0) >= 1).length;
    const beginnerKanaPool =
      studyTrack === 'beginner' && practicedCount >= 15
        ? [...HIRAGANA, ...KATAKANA.slice(0, 15)]
        : HIRAGANA;

    const weakKana = seededShuffle(
      beginnerKanaPool.filter((k) => {
        const s = kanaStats[k.kana];
        return s && s.wrong > 0 && s.wrong >= s.correct;
      }),
      sessionSeed + 17,
    );

    if (studyTrack === 'beginner') {
      const chosenWeak = weakKana.slice(0, 1);
      const nonWeak = beginnerKanaPool.filter((k) => !chosenWeak.some((w) => w.kana === k.kana));
      const fillerKana = pickUnseenBatch(
        nonWeak,
        (k) => k.kana,
        5 - chosenWeak.length,
        'bento_kana_beginner',
        sessionSeed,
        false,
      );
      const kPool = [...chosenWeak, ...fillerKana];

      return kPool.map((k, ki) => {
        const isWeak = chosenWeak.some((w) => w.kana === k.kana);
        const distractors = seededShuffle(
          beginnerKanaPool.filter((x) => x.romaji !== k.romaji),
          sessionSeed + 100 + ki,
        )
          .slice(0, 2)
          .map((x) => x.romaji);
        return {
          id: k.kana,
          sourceBucket: 'kana',
          label: isWeak ? '🌱 Beginner Kana · 🎯 Focus' : '🌱 Beginner Kana Warm-up',
          display: k.kana,
          sub: 'Type or tap romaji',
          answers: [k.romaji, ...(k.alts ?? [])],
          audio: k.kana,
          options: seededShuffle([k.romaji, ...distractors], sessionSeed + 200 + ki),
        };
      });
    }

    if (studyTrack === 'travel') {
      const chosenWeak = weakKana.slice(0, 1);
      const nonWeak = HIRAGANA.filter((k) => !chosenWeak.some((w) => w.kana === k.kana));
      const fillerKana = pickUnseenBatch(
        nonWeak,
        (k) => k.kana,
        3 - chosenWeak.length,
        'bento_kana_travel',
        sessionSeed,
        false,
      );
      const kPool = [...chosenWeak, ...fillerKana];

      const kPrompts: WarmupPrompt[] = kPool.map((k, ki) => {
        const distractors = seededShuffle(
          HIRAGANA.filter((x) => x.romaji !== k.romaji),
          sessionSeed + 100 + ki,
        )
          .slice(0, 2)
          .map((x) => x.romaji);
        return {
          id: k.kana,
          sourceBucket: 'kana',
          label: '🧳 Travel Kana Warm-up',
          display: k.kana,
          sub: 'Type or tap romaji',
          answers: [k.romaji, ...(k.alts ?? [])],
          audio: k.kana,
          options: seededShuffle([k.romaji, ...distractors], sessionSeed + 200 + ki),
        };
      });

      const pickedCounters = pickUnseenBatch(
        TRAVEL_COUNTERS,
        (tc) => tc.display,
        2,
        'bento_counters',
        sessionSeed + 10,
        false,
      );
      const counterPrompts: WarmupPrompt[] = pickedCounters.map((tc) => ({
        id: tc.display,
        sourceBucket: 'counter',
        label: '🧳 Essential Travel Counter',
        display: tc.display,
        sub: 'Reading in Kana or Romaji',
        answers: tc.answers,
        audio: tc.audio,
        options: tc.options,
      }));

      return [...kPrompts, ...counterPrompts];
    }

    // Default N5 or N4: 2 Kana + 2 Verbs (varied forms) + 1 Particle Slot Challenge
    const chosenWeak = weakKana.slice(0, 1);
    const nonWeak = HIRAGANA.filter((k) => !chosenWeak.some((w) => w.kana === k.kana));
    const fillerKana = pickUnseenBatch(
      nonWeak,
      (k) => k.kana,
      2 - chosenWeak.length,
      `bento_kana_${studyTrack}`,
      sessionSeed,
      false,
    );
    const kPool = [...chosenWeak, ...fillerKana];

    const cPool = pickUnseenBatch(
      CONJUGATIONS,
      (w) => w.id,
      2,
      `bento_verbs_${studyTrack}`,
      sessionSeed + 1,
      false,
    );

    const kPrompts: WarmupPrompt[] = kPool.map((k, ki) => {
      const isWeak = chosenWeak.some((w) => w.kana === k.kana);
      const distractors = seededShuffle(
        HIRAGANA.filter((x) => x.romaji !== k.romaji),
        sessionSeed + 100 + ki,
      )
        .slice(0, 2)
        .map((x) => x.romaji);
      return {
        id: k.kana,
        sourceBucket: 'kana',
        label: isWeak ? 'Kana Warm-up · 🎯 Focus' : 'Kana Warm-up',
        display: k.kana,
        sub: 'Type or tap romaji',
        answers: [k.romaji, ...(k.alts ?? [])],
        audio: k.kana,
        options: seededShuffle([k.romaji, ...distractors], sessionSeed + 200 + ki),
      };
    });

    const conjForms = ['polite', 'te', 'negative', 'past'] as const;
    const cPrompts: WarmupPrompt[] = cPool.map((w, wi) => {
      const formKey = conjForms[(sessionSeed + wi) % conjForms.length];
      const t = w.forms[formKey];
      return {
        id: w.id,
        sourceBucket: 'verb',
        label: `Verb → ${FORM_LABELS[formKey].jp.split(' ')[1] || FORM_LABELS[formKey].en}`,
        display: w.dict,
        sub: `${w.reading} (${w.en})`,
        answers: [t.romaji, t.kana, t.kanji],
        audio: t.kana,
        options: seededShuffle(
          [...new Set([t.kanji, w.forms.polite.kanji, w.forms.negative.kanji, w.forms.past.kanji])].slice(0, 3),
          sessionSeed + 300 + wi,
        ),
      };
    });

    const dailySlotChallenge = pickUnseenBatch(
      PARTICLE_SLOT_CHALLENGES,
      (c) => c.id,
      1,
      'bento_slots',
      sessionSeed + 2,
      false,
    )[0];

    const slotPrompt: WarmupPrompt = {
      id: dailySlotChallenge.id,
      sourceBucket: 'slot',
      label: `Particle Slot · ${dailySlotChallenge.title}`,
      display: dailySlotChallenge.en,
      sub: 'Slot particles into blanks',
      answers: dailySlotChallenge.correctParticles,
      audio: dailySlotChallenge.audioText,
      options: dailySlotChallenge.particleBank,
      slotChallenge: dailySlotChallenge,
    };

    return [...kPrompts, ...cPrompts, slotPrompt];
  }, [sessionSeed, kanaStats, studyTrack]);

  const [wIdx, setWIdx] = useState(0);
  const [wInput, setWInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Dish 2: Cap due SRS items at 3 so EVERY Bento introduces at least 2 fresh unseen items
  const memoryCards = useMemo(() => {
    const shuffledDue = seededShuffle(
      Object.values(srs).filter((i) => isDue(i)),
      sessionSeed + 33,
    );

    const byKind: Record<string, SrsItem[]> = {};
    shuffledDue.forEach((c) => {
      byKind[c.kind] = byKind[c.kind] ?? [];
      byKind[c.kind].push(c);
    });
    const kinds = Object.keys(byKind);
    const duePick: SrsItem[] = [];
    if (kinds.length > 0) {
      let p = 0;
      while (duePick.length < 3 && duePick.length < shuffledDue.length) {
        let added = false;
        for (const k of kinds) {
          if (byKind[k][p] && duePick.length < 3) {
            duePick.push(byKind[k][p]);
            added = true;
          }
        }
        if (!added) break;
        p++;
      }
    }

    const pickedIds = new Set(duePick.map((c) => c.id));
    type MemCard = { id: string; kind: 'word' | 'kanji' | 'grammar'; front: string; reading?: string; back: string };

    let trackPool: MemCard[];
    if (studyTrack === 'beginner') {
      trackPool = BEGINNER_BENTO_POOL;
    } else if (studyTrack === 'travel') {
      trackPool = TRAVEL_BENTO_POOL;
    } else {
      const targetLevel = studyTrack === 'n4' ? 'N4' : 'N5';
      const levelKanji = KANJI.filter((k) => k.level === targetLevel);
      const src = levelKanji.length ? levelKanji : KANJI;
      const kanjiCards: MemCard[] = src.map((k) => ({
        id: `k:${k.k}`,
        kind: 'kanji',
        front: k.k,
        reading: `${k.on} / ${k.kun}`,
        back: k.meaning,
      }));
      const wordCards: MemCard[] = src.map((k) => ({
        id: `word:${k.ex.w}`,
        kind: 'word',
        front: k.ex.w,
        reading: k.ex.r,
        back: k.ex.en,
      }));
      trackPool = [...kanjiCards, ...wordCards];
    }

    const freshNeeded = Math.max(0, 5 - duePick.length);
    const notInDue = trackPool.filter((c) => !pickedIds.has(c.id));
    const unseenInSrs = notInDue.filter((c) => !(c.id in srs));
    const freshPool = unseenInSrs.length >= freshNeeded ? unseenInSrs : notInDue;

    const freshPick = pickUnseenBatch(
      freshPool,
      (c) => c.id,
      freshNeeded,
      `bento_mem_${studyTrack}`,
      sessionSeed + 500,
      false,
    );

    return [...duePick, ...freshPick].slice(0, 5);
  }, [srs, sessionSeed, studyTrack]);

  const [mIdx, setMIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Step 3: Featured Kanji for Brush Trace (unseen cycling across 30+ kanji)
  const featuredKanji = useMemo(() => {
    const pool =
      studyTrack === 'beginner'
        ? KANJI.filter((k) => BEGINNER_TRACE_KANJI.includes(k.k))
        : studyTrack === 'n4'
          ? KANJI.filter((k) => k.level === 'N4')
          : KANJI.filter((k) => k.level === 'N5');
    const list = pool.length ? pool : KANJI;
    return pickUnseenBatch(
      list,
      (k) => k.k,
      1,
      `bento_trace_${studyTrack}`,
      sessionSeed + 700,
      false,
    )[0];
  }, [sessionSeed, studyTrack]);

  const [traceDone, setTraceDone] = useState(false);

  // Step 4: Street Sign Decoder (migrated legacy history + unseen cycle)
  const streetSign = useMemo(() => {
    migrateLegacyBentoSigns();
    return pickUnseenBatch(
      SIGNS,
      (s) => s.id,
      1,
      'bento_signs',
      sessionSeed + 900,
      false,
    )[0];
  }, [sessionSeed]);
  const [signChoice, setSignChoice] = useState<number | null>(null);

  const curWarmup = warmups[wIdx];

  const advanceWarmup = () => {
    playDing();
    speak(curWarmup.audio);
    if (curWarmup.display.length === 1) {
      recordKana(curWarmup.display, true);
    }
    recordNutritionActivity('vocabProtein', 1);
    setWInput('');
    if (wIdx + 1 < warmups.length) {
      setWIdx((i) => i + 1);
    } else {
      setDish(2);
    }
  };

  const onWarmupInput = (v: string) => {
    setWInput(v);
    const clean = v.trim().toLowerCase();
    const hira = toHiragana(clean);
    if (curWarmup.answers.includes(clean) || curWarmup.answers.includes(hira)) {
      advanceWarmup();
    }
  };

  const gradeMemoryCard = (g: Grade) => {
    const c = memoryCards[mIdx];
    if (!srs[c.id]) addCard(c);
    reviewCard(c.id, g);
    playDing();
    setFlipped(false);
    if (mIdx + 1 < memoryCards.length) {
      setMIdx((i) => i + 1);
    } else {
      setTraceDone(false);
      setDish(3);
    }
  };

  const effectiveStreak = useMemo(() => {
    const todayMs = new Date(todayIso).getTime();
    const y = new Date(todayMs - 864e5).toISOString().slice(0, 10);
    if (lastStudy === todayIso) return streak;
    if (lastStudy === y) return streak + 1;
    if (vacationMode) return streak;
    if (lastStudy) {
      const diffDays = Math.round((todayMs - new Date(lastStudy).getTime()) / 864e5);
      const missedDays = diffDays - 1;
      if (missedDays > 0 && missedDays <= streakShields) {
        return streak + 1;
      }
    }
    return 1;
  }, [lastStudy, streak, todayIso, vacationMode, streakShields]);

  const dailyStamp = useMemo(() => {
    return getDailyStamp(todayIso, effectiveStreak);
  }, [todayIso, effectiveStreak]);

  const [submittingBento, setSubmittingBento] = useState(false);

  const commitSessionSeenHistory = () => {
    const kanaIds = warmups.filter((w) => w.sourceBucket === 'kana').map((w) => w.id);
    if (kanaIds.length) {
      commitSeenIds(`bento_kana_${studyTrack}`, kanaIds, HIRAGANA.map((k) => k.kana));
    }
    const counterIds = warmups.filter((w) => w.sourceBucket === 'counter').map((w) => w.id);
    if (counterIds.length) {
      commitSeenIds('bento_counters', counterIds, TRAVEL_COUNTERS.map((t) => t.display));
    }
    const verbIds = warmups.filter((w) => w.sourceBucket === 'verb').map((w) => w.id);
    if (verbIds.length) {
      commitSeenIds(`bento_verbs_${studyTrack}`, verbIds, CONJUGATIONS.map((w) => w.id));
    }
    const slotIds = warmups.filter((w) => w.sourceBucket === 'slot').map((w) => w.id);
    if (slotIds.length) {
      commitSeenIds('bento_slots', slotIds, PARTICLE_SLOT_CHALLENGES.map((c) => c.id));
    }

    const memIds = memoryCards.map((c) => c.id);
    const allMemPoolIds =
      studyTrack === 'beginner'
        ? BEGINNER_BENTO_POOL.map((c) => c.id)
        : studyTrack === 'travel'
          ? TRAVEL_BENTO_POOL.map((c) => c.id)
          : KANJI.map((k) => `k:${k.k}`);
    commitSeenIds(`bento_mem_${studyTrack}`, memIds, allMemPoolIds);

    const tracePoolIds =
      studyTrack === 'beginner'
        ? BEGINNER_TRACE_KANJI
        : KANJI.filter((k) => k.level === (studyTrack === 'n4' ? 'N4' : 'N5')).map((k) => k.k);
    commitSeenIds(`bento_trace_${studyTrack}`, [featuredKanji.k], tracePoolIds);
    commitSeenIds('bento_signs', [streetSign.id], SIGNS.map((s) => s.id));
  };

  const finishBento = () => {
    if (submittingBento) return;
    setSubmittingBento(true);
    commitSessionSeenHistory();
    bumpRoundSeq('bento_round');
    completeBento(dailyStamp.id);
    if (isCampaignMode) {
      completeMission();
    }
    playFanfare();
    setDish(5);
  };

  const startBonusRound = () => {
    const nextSeq = bumpRoundSeq('bento_round');
    setRoundSeq(nextSeq);
    setWIdx(0);
    setWInput('');
    setMIdx(0);
    setFlipped(false);
    setTraceDone(false);
    setSignChoice(null);
    setSubmittingBento(false);
    setSecondsLeft(300);
    setDish(1);
  };

  const timerMin = Math.floor(secondsLeft / 60);
  const timerSec = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="page">
      {isCampaignMode && stage && (
        <CampaignBanner stage={stage} saga={saga} onReturn={returnToCampaign} />
      )}

      <div className="row-between" style={{ gap: '0.5rem' }}>
        <div>
          <h1 className="nomargin">
            今日の弁当 <span className="muted">Daily Bento</span>
          </h1>
        </div>
        <div className="controls nomargin" style={{ alignItems: 'center', gap: '0.4rem' }}>
          {dish < 5 && (
            <>
              <span
                className="chip"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.65rem',
                  color: secondsLeft === 0 ? 'var(--bad)' : secondsLeft <= 60 ? '#f39c12' : 'inherit',
                  borderColor: secondsLeft === 0 ? 'var(--bad)' : secondsLeft <= 60 ? '#f39c12' : undefined,
                  cursor: 'default',
                }}
              >
                ⏱ {timerMin}:{timerSec}
              </span>
              <button
                type="button"
                className={showBentoMeta ? 'chip on' : 'chip'}
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}
                onClick={() => setShowBentoMeta((v) => !v)}
              >
                {TRACK_LABELS[studyTrack]} · Balance ▾
              </button>
            </>
          )}
          <Link to="/" className="muted small" style={{ marginLeft: '0.25rem' }}>
            ← Home
          </Link>
        </div>
      </div>

      {/* Collapsible Track & Nutrition drawer during active drills so the prompt stays above the fold */}
      {(showBentoMeta || dish === 5) && (
        <div style={{ marginTop: '0.6rem' }}>
          <div className="controls" style={{ marginBottom: '0.4rem' }}>
            <span className="muted small" style={{ alignSelf: 'center' }}>Track:</span>
            {(['beginner', 'travel', 'n5', 'n4'] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={studyTrack === t ? 'chip on' : 'chip'}
                style={{ padding: '0.22rem 0.62rem', fontSize: '0.8rem' }}
                onClick={() => {
                  selectTrack(t);
                  setWIdx(0);
                  setWInput('');
                  setMIdx(0);
                  setFlipped(false);
                }}
              >
                {TRACK_LABELS[t]}
              </button>
            ))}
          </div>
          <BentoNutritionPlateCard
            plate={nutritionPlate}
            shields={streakShields}
            vacation={vacationMode}
            onToggleVacation={toggleVacationMode}
          />
        </div>
      )}

      {/* 4-Step Single-Row Progress Bar */}
      <div className="bento-steps">
        <div className={`bento-step ${dish === 1 ? 'active' : dish > 1 ? 'done-step' : ''}`}>
          🍙 1. Warm-up ({Math.min(wIdx + 1, warmups.length)}/{warmups.length})
        </div>
        <div className={`bento-step ${dish === 2 ? 'active' : dish > 2 ? 'done-step' : ''}`}>
          🍱 2. Memory ({Math.min(mIdx + 1, memoryCards.length)}/{memoryCards.length})
        </div>
        <div className={`bento-step ${dish === 3 ? 'active' : dish > 3 ? 'done-step' : ''}`}>
          ✍️ 3. Trace
        </div>
        <div className={`bento-step ${dish === 4 ? 'active' : dish > 4 ? 'done-step' : ''}`}>
          🏮 4. Sign
        </div>
      </div>

      {/* Step 1: Warm-up */}
      {dish === 1 && curWarmup && (
        curWarmup.slotChallenge ? (
          <div>
            <div className="row-between" style={{ marginBottom: '0.5rem' }}>
              <span className="tag">
                🍙 Step 1 of 4 · {curWarmup.label} ({wIdx + 1}/{warmups.length})
              </span>
            </div>
            <ParticleSlotGrid
              key={curWarmup.slotChallenge.id}
              challenge={curWarmup.slotChallenge}
              standalone={false}
              onComplete={(ok) => {
                if (ok) advanceWarmup();
              }}
              onNext={advanceWarmup}
            />
          </div>
        ) : (
          <div className="drill" onClick={() => inputRef.current?.focus()}>
            <span className="tag">🍙 Step 1 of 4 · {curWarmup.label}</span>
            <div className="drill-char" style={{ fontSize: '4.2rem', margin: '0.4rem 0' }}>
              {curWarmup.display}
            </div>
            <div className="muted small" style={{ marginBottom: '0.8rem' }}>{curWarmup.sub}</div>
            <input
              ref={inputRef}
              autoFocus
              value={wInput}
              onChange={(e) => onWarmupInput(e.target.value)}
              placeholder="type answer or tap below…"
              className="drill-input"
              autoComplete="off"
              autoCapitalize="off"
            />
            <div className="controls center" style={{ marginTop: '1rem' }}>
              {curWarmup.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className="chip"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      curWarmup.answers.includes(opt.toLowerCase()) ||
                      curWarmup.answers.includes(opt)
                    ) {
                      advanceWarmup();
                    } else {
                      setWInput(curWarmup.answers[0]);
                    }
                  }}
                >
                  {opt}
                </button>
              ))}
              <button
                type="button"
                className="chip on"
                onClick={(e) => {
                  e.stopPropagation();
                  advanceWarmup();
                }}
              >
                Skip →
              </button>
            </div>
          </div>
        )
      )}

      {/* Step 2: Memory Cards */}
      {dish === 2 && memoryCards[mIdx] && (
        <div>
          <div
            className="card-box"
            onClick={() => {
              if (!flipped) {
                setFlipped(true);
                speak(memoryCards[mIdx].reading?.split(/[ /、]/)[0] || memoryCards[mIdx].front);
              }
            }}
          >
            <span className="tag">
              🍱 Step 2 of 4 · Memory ({mIdx + 1}/{memoryCards.length})
            </span>
            <div className="card-front">{memoryCards[mIdx].front}</div>
            {flipped ? (
              <div className="card-back">
                {memoryCards[mIdx].reading && <div className="muted">{memoryCards[mIdx].reading}</div>}
                <div className="card-meaning">{memoryCards[mIdx].back}</div>
              </div>
            ) : (
              <div className="muted">Tap card to reveal</div>
            )}
          </div>
          {flipped && (
            <div className="grade-row">
              <button className="grade again" onClick={() => gradeMemoryCard(Rating.Again)}>Again</button>
              <button className="grade hard" onClick={() => gradeMemoryCard(Rating.Hard)}>Hard</button>
              <button className="grade good" onClick={() => gradeMemoryCard(Rating.Good)}>Good</button>
              <button className="grade easy" onClick={() => gradeMemoryCard(Rating.Easy)}>Easy</button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Dedicated Single-Card Kanji Brush Trace (no hidden step below fold on mobile) */}
      {dish === 3 && featuredKanji && (
        <div className="gp" style={{ marginTop: '0.75rem', padding: '1rem 1.2rem' }}>
          <div className="row-between" style={{ marginBottom: '0.35rem' }}>
            <span className="tag">✍️ Step 3 of 4 · Kanji Brush Trace</span>
            <button
              type="button"
              className="chip"
              style={{ padding: '0.2rem 0.6rem', fontSize: '0.78rem' }}
              onClick={() => speak(featuredKanji.ex.r)}
            >
              🔊 {featuredKanji.ex.w}
            </button>
          </div>
          <h2 className="nomargin" style={{ fontSize: '1.25rem' }}>
            <span className="jp">{featuredKanji.k}</span> — {featuredKanji.meaning} ({featuredKanji.strokes}画)
          </h2>
          <p className="muted small" style={{ margin: '0.2rem 0 0.7rem' }}>
            Example: {featuredKanji.ex.w} ({featuredKanji.ex.r}) · {featuredKanji.ex.en}
          </p>

          <TraceCanvas
            key={`${featuredKanji.k}-${roundSeq}`}
            kanji={featuredKanji.k}
            compact
            onComplete={(allOk) => {
              if (!traceDone) {
                setTraceDone(true);
                playDing();
                recordNutritionActivity('kanjiFiber', 1);
              }
              if (allOk) {
                speak(featuredKanji.ex.r);
              }
            }}
          />

          <div className="controls center" style={{ marginTop: '0.9rem', marginBottom: 0 }}>
            {traceDone ? (
              <button
                type="button"
                className="chip ok"
                style={{ width: '100%', maxWidth: '320px', padding: '0.7rem 1.2rem', fontWeight: 700, fontSize: '0.98rem' }}
                onClick={() => setDish(4)}
              >
                ✨ Nice brushwork! Next: Street Sign →
              </button>
            ) : (
              <button
                type="button"
                className="chip on"
                style={{ padding: '0.55rem 1.15rem', fontWeight: 600 }}
                onClick={() => setDish(4)}
              >
                Next: Decode Street Sign →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Dedicated Single-Card Street Sign Decoder */}
      {dish === 4 && streetSign && (
        <div className="gp" style={{ marginTop: '0.75rem', padding: '1rem 1.2rem' }}>
          <div className="row-between" style={{ marginBottom: '0.35rem' }}>
            <span className="tag">🏮 Step 4 of 4 · Street Sign Decoder</span>
            <button
              type="button"
              className="chip"
              style={{ padding: '0.2rem 0.6rem', fontSize: '0.78rem' }}
              onClick={() => setDish(3)}
            >
              ← Back to Trace
            </button>
          </div>
          <h2 className="nomargin">{streetSign.place}</h2>
          <div
            className="sign-board jp"
            style={{ marginTop: '0.6rem', cursor: 'pointer' }}
            onClick={() => speak(streetSign.reading)}
            title="Tap to hear aloud"
          >
            🔊 {streetSign.sign}
          </div>
          <p className="muted small">{streetSign.reading}</p>
          <p>{streetSign.question}</p>
          <div className="controls">
            {streetSign.options.map((opt, idx) => {
              const cls =
                signChoice === null
                  ? 'chip'
                  : idx === streetSign.answer
                    ? 'chip ok'
                    : signChoice === idx
                      ? 'chip bad'
                      : 'chip';
              return (
                <button
                  key={idx}
                  type="button"
                  className={cls}
                  onClick={() => {
                    setSignChoice(idx);
                    if (idx === streetSign.answer) {
                      playDing();
                      recordNutritionActivity('kanjiFiber', 1);
                    }
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {signChoice !== null && (
            <p className="small ok-text" style={{ marginTop: '0.6rem' }}>
              💡 {streetSign.note}
            </p>
          )}
          <div className="controls" style={{ marginTop: '1.1rem', marginBottom: 0 }}>
            <button
              type="button"
              className="chip on"
              disabled={signChoice === null || submittingBento}
              onClick={finishBento}
              style={{
                width: '100%',
                maxWidth: '340px',
                padding: '0.7rem 1.2rem',
                fontWeight: 700,
                opacity: signChoice === null || submittingBento ? 0.5 : 1,
                cursor: signChoice === null || submittingBento ? 'not-allowed' : 'pointer',
              }}
            >
              🔖 Complete Bento &amp; Claim Stamp →
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Celebration & Play-Again Screen */}
      {dish === 5 && (
        <div className="card-box center" style={{ padding: '2rem 1.4rem', cursor: 'default' }}>
          <span className="tag">ごちそうさまでした！ · Bento Complete</span>
          <h2 className="nomargin" style={{ fontSize: '1.55rem' }}>
            Daily Bento Finished! 🎉
          </h2>
          <p className="muted" style={{ maxWidth: '520px' }}>
            You warmed up recall, mixed SRS with fresh cards, traced kanji brushwork, and decoded a real sign.
          </p>
          <div style={{ width: '132px', margin: '0.5rem auto' }}>
            <StampSvg stamp={dailyStamp} unlocked={true} />
          </div>
          {effectiveStreak > 0 && effectiveStreak % 7 === 0 && (
            <div className="chip ok" style={{ margin: '0.4rem auto', display: 'inline-block' }}>
              ⭐ {effectiveStreak}-Day Streak Milestone Seal Unlocked!
            </div>
          )}
          <p className="ok-text small nomargin">
            🔖 Stamped: <b>{dailyStamp.nameEn}</b> in your Goshuincho!
          </p>
          <div className="controls center" style={{ marginTop: '0.9rem' }}>
            <button
              type="button"
              className="chip on"
              style={{ fontWeight: 700, background: 'var(--accent)', color: '#000', padding: '0.55rem 1.15rem' }}
              onClick={startBonusRound}
            >
              ↻ Start Bonus Bento Round (All Fresh Items)
            </button>
            <Link className="chip on" to="/stamps">📖 Open Stamp Book →</Link>
            <Link className="chip" to="/">← Dashboard</Link>
          </div>
        </div>
      )}
    </div>
  );
}
