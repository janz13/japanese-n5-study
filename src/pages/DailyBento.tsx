import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Rating, type Grade } from 'ts-fsrs';
import { toHiragana } from 'wanakana';
import { HIRAGANA } from '../data/kana';
import { CONJUGATIONS } from '../data/conjugations';
import { KANJI } from '../data/kanji';
import { getDailyStamp, TRAVEL_COUNTERS } from '../data/stamps';
import { TraceCanvas } from '../components/Strokes';
import { StampSvg } from './StampBook';
import { isDue, useStore, todayStr, type SrsItem, type BentoNutritionPlate } from '../lib/store';
import { speak } from '../lib/tts';
import { playDing, playFanfare } from '../lib/sfx';
import { SIGNS } from '../data/signs';
import { FORM_LABELS } from '../data/conjugations';
import { PARTICLE_SLOT_CHALLENGES, type ParticleSlotChallenge } from '../data/particles';
import { ParticleSlotGrid } from '../components/ParticleSlotGrid';

/** Simple date-seeded PRNG so every Bento dish is different each calendar day
 *  but deterministic within the same day (reload-safe). */
function dayHash(dateStr: string): number {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = ((h << 5) - h + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Seeded LCG — returns next state and a value in [0, max). */
function seededRandom(seed: number, max: number): [number, number] {
  const next = ((seed * 1664525 + 1013904223) & 0x7fffffff);
  return [next, next % max];
}

/** Seeded Fisher–Yates shuffle — returns a new array, never mutates the input. */
function seededShuffle<T>(arr: readonly T[], seed: number): T[] {
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    let j: number;
    [s, j] = seededRandom(s, i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface WarmupPrompt {
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
    {
      id: 'vocab',
      name: 'Vocab Protein',
      icon: '🥩',
      cur: plate.vocabProtein,
      target: 5,
      color: '#ef4444',
    },
    {
      id: 'grammar',
      name: 'Grammar Carbs',
      icon: '🍚',
      cur: plate.grammarCarbs,
      target: 3,
      color: '#3b82f6',
    },
    {
      id: 'kanji',
      name: 'Kanji Fiber',
      icon: '🥗',
      cur: plate.kanjiFiber,
      target: 2,
      color: '#10b981',
    },
    {
      id: 'listening',
      name: 'Listening Vitamins',
      icon: '🍊',
      cur: plate.listeningVitamins,
      target: 2,
      color: '#f59e0b',
    },
  ];

  return (
    <div
      className="gp"
      style={{
        margin: '0.8rem 0 1rem',
        padding: '0.9rem 1.1rem',
        background: 'var(--surface, #1e293b)',
        borderRadius: '10px',
        border: isFull ? '2px solid #10b981' : '1px solid var(--border, #334155)',
      }}
    >
      <div className="row-between" style={{ flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.7rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <b style={{ fontSize: '0.95rem' }}>🍱 Bento Nutrition Engine (栄養バランス)</b>
          {isFull ? (
            <span
              className="chip ok"
              style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', fontWeight: 700 }}
            >
              ✨ 栄養満点！ (Fully Balanced)
            </span>
          ) : (
            <span className="muted small">Daily Target Balancing</span>
          )}
        </div>

        {/* Streak Shield & Vacation status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span
            className="chip"
            style={{
              fontSize: '0.78rem',
              borderColor: shields > 0 ? '#38bdf8' : 'var(--border)',
              color: shields > 0 ? '#38bdf8' : 'inherit',
            }}
            title="Shields automatically absorb missed calendar days"
          >
            🛡️ {shields}/2 Shields Active
          </span>
          <button
            type="button"
            className={vacation ? 'chip on' : 'chip'}
            style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem' }}
            onClick={onToggleVacation}
            title="Vacation pause freezes streak decay"
          >
            {vacation ? '🌴 Vacation Mode ON' : '🏖️ Vacation Pause'}
          </button>
        </div>
      </div>

      {/* 4 Nutritional Compartments Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.6rem',
        }}
      >
        {nutrients.map((n) => {
          const pct = Math.min(100, Math.round((n.cur / n.target) * 100));
          const met = n.cur >= n.target;
          return (
            <div
              key={n.id}
              style={{
                background: 'rgba(0,0,0,0.15)',
                padding: '0.5rem 0.6rem',
                borderRadius: '6px',
                border: met ? `1px solid ${n.color}` : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="row-between" style={{ fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                <span>
                  {n.icon} {n.name}
                </span>
                <span style={{ fontWeight: 700, color: met ? '#10b981' : 'inherit' }}>
                  {n.cur}/{n.target}
                </span>
              </div>
              <div
                style={{
                  height: '6px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
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

export default function DailyBento() {
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
    streakShields,
    vacationMode,
    toggleVacationMode,
    nutritionPlate,
    recordNutritionActivity,
    resetDailyPlateIfNewDay,
  } = useStore();
  const [dish, setDish] = useState<1 | 2 | 3 | 4>(1);

  useEffect(() => {
    resetDailyPlateIfNewDay();
  }, [resetDailyPlateIfNewDay]);

  // Read active study track (with instant fallback and local persistence)
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

  // 5-minute informational pace timer (purely helpful, never cuts user off)
  const [secondsLeft, setSecondsLeft] = useState(300);
  useEffect(() => {
    if (dish >= 4) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [dish]);

  const todayIso = todayStr();

  // Seed = date hash + bentoCount so each session within the same day is different
  const todaySeed = useMemo(() => {
    return dayHash(todayIso) + bentoCount * 7919; // large prime offset per session
  }, [bentoCount, todayIso]);

  // Dish 1: 5 Warm-up prompts tailored to the active study track!
  const warmups = useMemo<WarmupPrompt[]>(() => {
    // Check for struggling kana (wrong >= 1 and wrong >= correct)
    const weakKana = HIRAGANA.filter((k) => {
      const s = kanaStats[k.kana];
      return s && s.wrong > 0 && s.wrong >= s.correct;
    });

    if (studyTrack === 'beginner') {
      // 🌱 Complete Beginner: 5 Pure Kana prompts (prioritizing weak kana) - ZERO verb conjugations!
      const chosenWeak = weakKana.slice(0, 2);
      const nonWeak = HIRAGANA.filter((k) => !chosenWeak.some((w) => w.kana === k.kana));
      const fillerKana = seededShuffle(nonWeak, todaySeed).slice(0, 5 - chosenWeak.length);
      const kPool = [...chosenWeak, ...fillerKana];

      return kPool.map((k, ki) => {
        const isWeak = chosenWeak.some((w) => w.kana === k.kana);
        const distractors = seededShuffle(
          HIRAGANA.filter((x) => x.romaji !== k.romaji),
          todaySeed + 100 + ki,
        )
          .slice(0, 2)
          .map((x) => x.romaji);
        return {
          label: isWeak ? '🌱 Beginner Kana · 🎯 Focus Spot' : '🌱 Beginner Kana Warm-up',
          display: k.kana,
          sub: 'Type or tap romaji',
          answers: [k.romaji, ...(k.alts ?? [])],
          audio: k.kana,
          options: seededShuffle([k.romaji, ...distractors], todaySeed + 200 + ki),
        };
      });
    }

    if (studyTrack === 'travel') {
      // 🧳 Travel: 3 Kana + 2 Essential Travel Counters
      const chosenWeak = weakKana.slice(0, 1);
      const nonWeak = HIRAGANA.filter((k) => !chosenWeak.some((w) => w.kana === k.kana));
      const fillerKana = seededShuffle(nonWeak, todaySeed).slice(0, 3 - chosenWeak.length);
      const kPool = [...chosenWeak, ...fillerKana];

      const kPrompts: WarmupPrompt[] = kPool.map((k, ki) => {
        const distractors = seededShuffle(
          HIRAGANA.filter((x) => x.romaji !== k.romaji),
          todaySeed + 100 + ki,
        ).slice(0, 2).map((x) => x.romaji);
        return {
          label: '🧳 Travel Kana Warm-up',
          display: k.kana,
          sub: 'Type or tap romaji',
          answers: [k.romaji, ...(k.alts ?? [])],
          audio: k.kana,
          options: seededShuffle([k.romaji, ...distractors], todaySeed + 200 + ki),
        };
      });

      const pickedCounters = seededShuffle(TRAVEL_COUNTERS, todaySeed + 10).slice(0, 2);
      const counterPrompts: WarmupPrompt[] = pickedCounters.map((tc) => ({
        label: '🧳 Essential Travel Counter',
        display: tc.display,
        sub: 'Reading in Kana or Romaji',
        answers: tc.answers,
        audio: tc.audio,
        options: tc.options,
      }));

      return [...kPrompts, ...counterPrompts];
    }

    // Default N5 or N4: 2 Kana / Weak Kana + 2 Verb Conjugations + 1 Particle Slot Challenge
    const chosenWeak = weakKana.slice(0, 2);
    const nonWeak = HIRAGANA.filter((k) => !chosenWeak.some((w) => w.kana === k.kana));
    const fillerKana = seededShuffle(nonWeak, todaySeed).slice(0, 2 - chosenWeak.length);
    const kPool = [...chosenWeak, ...fillerKana];

    const cPool = seededShuffle(CONJUGATIONS, todaySeed + 1).slice(0, 2);

    const kPrompts: WarmupPrompt[] = kPool.map((k, ki) => {
      const isWeak = chosenWeak.some((w) => w.kana === k.kana);
      const distractors = seededShuffle(
        HIRAGANA.filter((x) => x.romaji !== k.romaji),
        todaySeed + 100 + ki,
      )
        .slice(0, 2)
        .map((x) => x.romaji);
      return {
        label: isWeak ? 'Kana Warm-up · 🎯 Weak Spot Focus' : 'Kana Warm-up',
        display: k.kana,
        sub: 'Type or tap romaji',
        answers: [k.romaji, ...(k.alts ?? [])],
        audio: k.kana,
        options: seededShuffle([k.romaji, ...distractors], todaySeed + 200 + ki),
      };
    });

    const cPrompts: WarmupPrompt[] = cPool.map((w, wi) => {
      const formKey = studyTrack === 'n4' && wi === 1 ? 'negative' : 'te';
      const t = w.forms[formKey];
      return {
        label: `Verb Warm-up → ${FORM_LABELS[formKey].jp.split(' ')[1]}`,
        display: w.dict,
        sub: `${w.reading} (${w.en})`,
        answers: [t.romaji, t.kana, t.kanji],
        audio: t.kana,
        options: seededShuffle([t.kanji, w.forms.polite.kanji, w.forms.negative.kanji], todaySeed + 300 + wi),
      };
    });

    const dailySlotChallenge =
      PARTICLE_SLOT_CHALLENGES[todaySeed % PARTICLE_SLOT_CHALLENGES.length];
    const slotPrompt: WarmupPrompt = {
      label: `Particle Slot · ${dailySlotChallenge.title}`,
      display: dailySlotChallenge.en,
      sub: 'Slot particles into blanks',
      answers: dailySlotChallenge.correctParticles,
      audio: dailySlotChallenge.audioText,
      options: dailySlotChallenge.particleBank,
      slotChallenge: dailySlotChallenge,
    };

    return [...kPrompts, ...cPrompts, slotPrompt];
  }, [todaySeed, kanaStats, studyTrack]);

  const [wIdx, setWIdx] = useState(0);
  const [wInput, setWInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Dish 2: Up to 5 due SRS cards — or track-adaptive fallback
  const memoryCards = useMemo(() => {
    const dueList = Object.values(srs).filter((i) => isDue(i));
    if (dueList.length >= 3) {
      // Balanced interleaving across card kinds (kanji, word, grammar)
      const byKind: Record<string, SrsItem[]> = {};
      dueList.forEach((c) => {
        byKind[c.kind] = byKind[c.kind] ?? [];
        byKind[c.kind].push(c);
      });
      const kinds = Object.keys(byKind);
      if (kinds.length > 1) {
        const mixed: SrsItem[] = [];
        let p = 0;
        while (mixed.length < 5 && mixed.length < dueList.length) {
          for (const k of kinds) {
            if (byKind[k][p] && mixed.length < 5) {
              mixed.push(byKind[k][p]);
            }
          }
          p++;
        }
        return mixed;
      }
      return dueList.slice(0, 5);
    }

    // Fallback: Tailored to active Study Track!
    if (studyTrack === 'beginner') {
      const beginnerSurvival = [
        { id: 'w:わたし', kind: 'word' as const, front: 'わたし', reading: 'わたし', back: 'I / Me' },
        { id: 'w:これ', kind: 'word' as const, front: 'これ', reading: 'これ', back: 'This (near speaker)' },
        { id: 'w:はい', kind: 'word' as const, front: 'はい', reading: 'はい', back: 'Yes' },
        { id: 'w:ありがとう', kind: 'word' as const, front: 'ありがとう', reading: 'ありがとう', back: 'Thank you' },
        { id: 'k:日', kind: 'kanji' as const, front: '日', reading: 'ニチ / ひ', back: 'Sun, Day' },
        { id: 'k:本', kind: 'kanji' as const, front: '本', reading: 'ホン / もと', back: 'Book, Origin' },
        { id: 'k:一', kind: 'kanji' as const, front: '一', reading: 'イチ / ひと', back: 'One' },
        { id: 'k:二', kind: 'kanji' as const, front: '二', reading: 'ニ / ふた', back: 'Two' },
        { id: 'k:三', kind: 'kanji' as const, front: '三', reading: 'サン / み', back: 'Three' },
        { id: 'k:人', kind: 'kanji' as const, front: '人', reading: 'ジン, ニン / ひと', back: 'Person' },
      ];
      return seededShuffle(beginnerSurvival, todaySeed + 500).slice(0, 5);
    }

    if (studyTrack === 'travel') {
      const travelSurvival = [
        { id: 'w:えき', kind: 'word' as const, front: '駅 (えき)', reading: 'えき', back: 'Train Station' },
        { id: 'w:きっぷ', kind: 'word' as const, front: '切符 (きっぷ)', reading: 'きっぷ', back: 'Ticket' },
        { id: 'w:みず', kind: 'word' as const, front: 'お水 (おみず)', reading: 'おみず', back: 'Water' },
        { id: 'w:といれ', kind: 'word' as const, front: 'トイレ', reading: 'といれ', back: 'Restroom / Toilet' },
        { id: 'w:いくら', kind: 'word' as const, front: 'いくら', reading: 'いくら', back: 'How much (price)' },
        { id: 'w:おすすめ', kind: 'word' as const, front: 'おすすめ', reading: 'おすすめ', back: 'Recommendation' },
        { id: 'k:円', kind: 'kanji' as const, front: '円', reading: 'エン / まる', back: 'Yen, Circle' },
        { id: 'k:口', kind: 'kanji' as const, front: '口', reading: 'コウ / くち', back: 'Mouth, Entrance/Exit' },
      ];
      return seededShuffle(travelSurvival, todaySeed + 500).slice(0, 5);
    }

    const targetLevel = studyTrack === 'n4' ? 'N4' : 'N5';
    const levelKanji = KANJI.filter((k) => k.level === targetLevel);
    const shuffled = seededShuffle(levelKanji.length ? levelKanji : KANJI, todaySeed + 500);
    return shuffled.slice(0, 5).map((k) => ({
      id: `k:${k.k}`,
      kind: 'kanji' as const,
      front: k.k,
      reading: `${k.on} / ${k.kun}`,
      back: k.meaning,
    }));
  }, [srs, todaySeed, studyTrack]);

  const [mIdx, setMIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Dish 3: Featured Kanji (rotates through track-relevant kanji) + Street Sign
  const featuredKanji = useMemo(() => {
    if (studyTrack === 'beginner') {
      const beginnerList = KANJI.filter((k) => ['一', '二', '三', '四', '五', '日', '本', '人', '大', '小', '月', '水', '木'].includes(k.k));
      return beginnerList[todaySeed % beginnerList.length] || KANJI[0];
    }
    const pool = studyTrack === 'n4' ? KANJI.filter((k) => k.level === 'N4') : KANJI.filter((k) => k.level === 'N5');
    const list = pool.length ? pool : KANJI;
    return list[todaySeed % list.length];
  }, [todaySeed, studyTrack]);

  const streetSign = useMemo(() => {
    const idx = (todaySeed + 77) % SIGNS.length;
    return SIGNS[idx];
  }, [todaySeed]);
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

  const finishBento = () => {
    if (submittingBento) return;
    setSubmittingBento(true);
    completeBento(dailyStamp.id);
    playFanfare();
    setDish(4);
  };

  const timerMin = Math.floor(secondsLeft / 60);
  const timerSec = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="page">
      <div className="row-between">
        <div>
          <h1>今日の弁当 <span className="muted">Today's 5-Minute Bento</span></h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
            {dish < 4 && (
              <span
                className="chip"
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: secondsLeft === 0 ? 'var(--bad)' : secondsLeft <= 60 ? '#f39c12' : 'inherit',
                  borderColor: secondsLeft === 0 ? 'var(--bad)' : secondsLeft <= 60 ? '#f39c12' : undefined,
                  display: 'inline-block',
                }}
              >
                ⏱ {secondsLeft > 0 ? `${timerMin}:${timerSec} Pace` : '0:00 (Take your time!)'}
              </span>
            )}
            <span className="muted small" style={{ marginLeft: '0.4rem' }}>Difficulty Track:</span>
            {(['beginner', 'travel', 'n5', 'n4'] as const).map((t) => (
              <button
                key={t}
                className={studyTrack === t ? 'chip on' : 'chip'}
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.78rem' }}
                onClick={() => selectTrack(t)}
                title={`Switch Bento difficulty to ${t}`}
              >
                {t === 'beginner' && '🌱 Beginner'}
                {t === 'travel' && '🧳 Travel'}
                {t === 'n5' && '⚡ N5 Core'}
                {t === 'n4' && '🚀 N4 Bridge'}
              </button>
            ))}
          </div>
        </div>
        <Link to="/" className="muted small">← Dashboard</Link>
      </div>

      {/* Bento Nutrition Engine & Streak Status */}
      <BentoNutritionPlateCard
        plate={nutritionPlate}
        shields={streakShields}
        vacation={vacationMode}
        onToggleVacation={toggleVacationMode}
      />

      {/* Course progress bar */}
      <div className="bento-steps">
        <div className={`bento-step ${dish === 1 ? 'active' : dish > 1 ? 'done-step' : ''}`}>
          🍙 1. Warm-up ({Math.min(wIdx + 1, warmups.length)}/{warmups.length})
        </div>
        <div className={`bento-step ${dish === 2 ? 'active' : dish > 2 ? 'done-step' : ''}`}>
          🍱 2. Memory ({Math.min(mIdx + 1, memoryCards.length)}/{memoryCards.length})
        </div>
        <div className={`bento-step ${dish === 3 ? 'active' : dish > 3 ? 'done-step' : ''}`}>
          🍵 3. Discovery
        </div>
        <div className={`bento-step ${dish === 4 ? 'active' : ''}`}>
          🔖 Stamp
        </div>
      </div>

      {dish === 1 && curWarmup && (
        curWarmup.slotChallenge ? (
          <div>
            <div className="row-between" style={{ marginBottom: '0.5rem' }}>
              <span className="tag">🍙 Dish 1 of 3 · {curWarmup.label} (Prompt {wIdx + 1}/{warmups.length})</span>
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
            <span className="tag">🍙 Dish 1 of 3 · {curWarmup.label}</span>
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
            <span className="tag">🍱 Dish 2 of 3 · Memory ({mIdx + 1}/{memoryCards.length})</span>
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

      {dish === 3 && (
        <div className="two-col" style={{ marginTop: '1rem' }}>
          <div className="gp">
            <span className="tag">🍵 Dish 3A · Kanji Brush Trace</span>
            <h2 className="nomargin">
              <span className="jp">{featuredKanji.k}</span> — {featuredKanji.meaning} ({featuredKanji.strokes}画)
            </h2>
            <p className="muted small">
              音: {featuredKanji.on} · 訓: {featuredKanji.kun} · Example: {featuredKanji.ex.w} ({featuredKanji.ex.r})
            </p>
            <TraceCanvas kanji={featuredKanji.k} />
          </div>

          <div className="gp">
            <span className="tag">🏮 Dish 3B · Street Sign Decoder</span>
            <h2 className="nomargin">{streetSign.place}</h2>
            <div
              className="sign-board jp"
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
            <div className="controls" style={{ marginTop: '1.2rem' }}>
              <button
                className="chip on"
                disabled={signChoice === null || submittingBento}
                onClick={finishBento}
                style={{
                  opacity: signChoice === null || submittingBento ? 0.5 : 1,
                  cursor: signChoice === null || submittingBento ? 'not-allowed' : 'pointer',
                }}
              >
                🔖 Complete Today's Bento →
              </button>
            </div>
          </div>
        </div>
      )}

      {dish === 4 && (
        <div className="card-box center" style={{ padding: '2.5rem 1.5rem' }}>
          <span className="tag">ごちそうさまでした！ · Bento Complete</span>
          <h2 className="nomargin" style={{ fontSize: '1.6rem' }}>
            Daily Bento Finished! 🎉
          </h2>
          <p className="muted">
            You warmed up your recall, reviewed your SRS deck, traced kanji, and decoded a real Tokyo sign.
          </p>
          <div style={{ width: '140px', margin: '0.6rem auto' }}>
            <StampSvg stamp={dailyStamp} unlocked={true} />
          </div>
          {effectiveStreak > 0 && effectiveStreak % 7 === 0 && (
            <div className="chip ok" style={{ margin: '0.5rem auto', display: 'inline-block' }}>
              ⭐ {effectiveStreak}-Day Streak Milestone Seal Unlocked!
            </div>
          )}
          <p className="ok-text small">
            🔖 Stamped: <b>{dailyStamp.nameEn}</b> in your Goshuincho!
          </p>
          <div className="controls center">
            <Link className="chip on" to="/stamps">📖 Open Stamp Book (御朱印帳) →</Link>
            <Link className="chip" to="/">← Back to Dashboard</Link>
          </div>
        </div>
      )}
    </div>
  );
}
