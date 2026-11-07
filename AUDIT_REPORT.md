# Comprehensive Quality, Pedagogical & Security Audit Report
## Japanese N5 Study Master Application & Live Deployment

**Auditor / Author**: Teamwork Audit Suite (`teamwork_worker_report_1`)  
**Evaluation Target**: Local Codebase (`c:\Users\test\Downloads\Japanese N5 Study`) & Live Deployment (`https://janz13.github.io/japanese-n5-study/`)  
**Git Commit Version**: `905c302` (`test: calibrate pre-expansion assertions for 48-stage campaign and store v10`)  
**Reference Blueprint**: `docs/EXERCISE_EXPANSION_PLAN.md` & `.agents/teamwork/ORIGINAL_REQUEST.md`  
**Date of Audit**: November 7, 2026  
**Audit Classification**: Publication-Grade Forensic System Audit  

---

## 1. Executive Summary

### 1.1 Audit Context & Objectives
An exhaustive, multi-agent forensic audit was conducted on the **Japanese N5 Study** application across both its local repository source tree and its production deployment on GitHub Pages. The audit evaluated system architecture, linguistic and pedagogical accuracy, procedural state management, anti-cheat progression integrity, audio-visual synthesis, and cross-session reliability against the master specification set forth in `docs/EXERCISE_EXPANSION_PLAN.md`.

The primary objective was to verify that the application has successfully evolved from a rudimentary flashcard tool into an authentic, multi-modal, adaptive mastery platform covering full JLPT N5 and N4 competencies across **13 core feature areas**, while uncovering all latent software defects, linguistic inaccuracies, state synchronization flaws, and progression exploits without modifying application code.

### 1.2 Summary of Findings & System Health Assessment
The application exhibits an impressive baseline of technical sophistication:
- **Framework & Tooling**: Built upon modern React 19 (`react@^19.3.1`), TypeScript 7 (`typescript@~7.0.2`), Vite 8 (`vite@^8.3.5`), Zustand 5 (`zustand@^5.0.16`), and `ts-fsrs@^6.0.0`.
- **Automated Test Suite**: 18 comprehensive test suites spanning 19 test files pass with a **100% success rate (18/18 suites passing)** under Node.js v24 native execution.
- **Build & Static Analysis**: `npm run build` completes in ~810ms yielding 32 optimized output chunks with **zero TypeScript compiler errors**. Static analysis via `oxlint` reports **0 errors** (12 non-fatal linter warnings).
- **Live Deployment Parity**: Cryptographic SHA256 hashing demonstrates a **100% byte-for-byte identity** between local build artifacts (`dist/`) and the live deployment at `https://janz13.github.io/japanese-n5-study/`. Automated Chrome CDP route probes revealed **zero runtime exceptions, zero HTTP 4xx/5xx network failures, and zero console errors**.
- **Audio Subsystem**: Procedural Web Audio API synthesis in `src/lib/sfx.ts` eliminates broken external audio URLs entirely.

Despite this robust foundation, adversarial probing and linguistic deconstruction uncovered **15 distinct issues** that compromise pedagogical efficacy, examination validity, or progression reliability:

| Severity Level | Finding Count | Primary Categories | High-Level Summary |
|---|:---:|---|---|
| **Critical** | 1 | Habit Tracking / State Math | Daily Bento streak shield calculation evaluates `effectiveStreak` to 1 upon an absorbed missed day, permanently depriving learners of 7/14/21/28-day milestone seals. |
| **High** | 4 | Pedagogical Interception / Exam Integrity / Lexical Data | 50% of Grammar near-miss clozes fail to trigger due to Wanakana kanji mismatches; JLPT exam OMR sheet permits unrestricted cross-section stage bypasses; exam countdown drifts under background tabs; Kanji Matrix `室` incorrectly maps `部屋` and omits compounds from example sentences. |
| **Medium** | 6 | Progression Exploits / Voice & Pitch Accuracy / Forecasting | Daily Bento Dish 3B early completion loophole; multi-click macro inflation; De-conjugation voice step bypass; Listening modulo target alternation and 0% campaign pass; pitch accent TTS vs. transcript sentence discrepancies (26/31 pairs); 30-day review workload forecast dead-code loop; multi-tab localStorage overwrite. |
| **Low** | 3 | Heuristic Styling / React 19 Compliance | Confuser first-attempt hardcoded 600ms reaction time; Particle role glow heuristic keyword collision on `まで` and `を`; React 19 ref access during render in stroke canvas. |
| **Total** | **15** | — | **1 Critical, 4 High, 6 Medium, 3 Low** |

---

## 2. Assessment Matrix Across All 13 Target Feature Areas

Every feature specified in `ORIGINAL_REQUEST.md` and `docs/EXERCISE_EXPANSION_PLAN.md` was audited against functional requirements, local codebase implementation, live site deployment behavior, pedagogical validity, and state persistence.

| # | Feature Area | Route & Primary Modules | Target Specification | Live & Local Implementation Metrics | Pedagogical Rigor & Audio/Visual Fidelity | State Persistence & Storage Keys | Audit Verdict |
|---|---|---|---|---|---|---|:---:|
| 1 | **Daily Bento** | `#/bento`<br>`DailyBento.tsx`<br>`stamps.ts` | 28 rotational stamps, date hashing, 7-day milestones, 28 travel counters across 7 categories. | • 28 stamps defined (`STAMPS.length === 28`).<br>• 5 milestone goshuin seals in `STREAK_MILESTONE_IDS`.<br>• 28 travel counters across 7 categories in `TRAVEL_COUNTERS`.<br>• Deterministic rolling hash via `dayHash(todayIso)`. | • Station stamps incorporate cultural notes & authentic kanji.<br>• Counters drill irregular pronunciations (`一日 = ついたち`, `四人 = よにん`).<br>• Pentatonic arpeggio fanfare plays on completion. | Persists to `unlockedStamps`, `bentoCount`, `lastBentoDate`, `travelCounters` in `localStorage['n5-study']`. | **Defect Identified**<br>*(Streak Shield Milestone Desync, Early Completion on Dish 3B)* |
| 2 | **Sign Decoder & Simulators** | `#/signs`<br>`SignDecoder.tsx`<br>`TransitKioskSimulator.tsx`<br>`ConbiniSimulator.tsx`<br>`IzakayaSimulator.tsx`<br>`shokkenki.ts`<br>`terminalKiosks.ts` | 3 public hardware terminal simulators + Ramen Shokkenki with Web Audio SFX and Zustand state persistence. | • 36 street signs across 7 categories.<br>• JR Ticket Vending Machine with Suica charge & receipt.<br>• Conbini POS Register with 20+ alcohol verification.<br>• Izakaya Tablet with 7 menu tabs & split-bill math.<br>• Ramen Shokkenki with 15 menu buttons. | • Authentic procedural SFX: `playSuicaPing`, `playTicketDispense`, `playCoinClink`, `playStaffChime`, `playVendingDrop`.<br>• Izakaya bill splitting correctly applies Japanese dining ceiling rounding (`Math.ceil(raw / 100) * 100`). | Full Zustand slice persistence in `decodedSigns`, `shokkenkiDone`, `shokkenkiMissionIdx`, `terminalDone`, `terminalMissionIndices`. | **Pass**<br>*(Minor UX: SignDecoder lacks in-page reset button)* |
| 3 | **Listening Dojo** | `#/listening`<br>`Listening.tsx`<br>`pitchAccent.ts` | SVG pitch accent contours for 4 archetypes (Heiban, Atamadaka, Nakadaka, Odaka) across 31 minimal pairs; TTS playback. | • Exactly 31 minimal pairs (`PITCH_PAIRS.length === 31`).<br>• 26 JLPT quick-response audio drills.<br>• Dynamic SVG contours with guide rails, mora nodes, kernel indicators, and drop/flat labels. | • 4 pitch archetypes mapped accurately.<br>• **Defect**: 26 pairs exhibit text discrepancy between `sentenceTts` and `sentenceJp`.<br>• **Defect**: Drill alternates target A/B deterministically using modulo 2. | Ephemeral component drill state; audio preferences (`sfx`) read from store. | **Defect Identified**<br>*(Modulo Alternation, TTS Mismatch, 0% Campaign Pass)* |
| 4 | **Grammar Dojo** | `#/grammar`<br>`Grammar.tsx`<br>`LayeredClozeInput.tsx`<br>`grammar.ts` | Bunpro-style Layered Nuance Clozes with 4-level progressive hints and near-miss error interceptor. | • 11 lessons (`g1` to `g11`), 62 grammar points.<br>• 13 Layered Cloze inputs across lessons.<br>• 4 hint tiers: Nuance, Pattern, Rule, Full Grammar.<br>• Real-time Wanakana IME conversion. | • Deep communicative nuances emphasized over rote rules.<br>• **Defect**: 8 of 16 near-miss definitions contain Kanji patterns that never match Hiragana user input, failing to intercept misconceptions. | Lesson completion tracked in `completedGrammarLessons`; inline SRS additions sync to `multiVectorItems`. | **Defect Identified**<br>*(Near-Miss Kanji Mismatch Bug)* |
| 5 | **Particle Dojo** | `#/particles`<br>`ParticleDojo.tsx`<br>`ParticleSlotGrid.tsx`<br>`particles.ts` | Interactive Particle Slot-In Grid with 5 semantic role color glows and keyboard hotkeys. | • 18 single-particle trap questions.<br>• 10 multi-slot matrix challenges (`PARTICLE_SLOT_CHALLENGES`).<br>• 5 semantic role glows (Amber, Teal, Indigo, Rose, Emerald).<br>• Hotkeys `1-8` for rapid slotting. | • Visual distinction between Topic (`は`), Subject (`が`), Target (`に`), Vehicle (`で`), Object (`を`).<br>• **Observation**: Keyword heuristic overlaps falsely glow `まで` and `を` Amber. | Score and completion status persisted to `store.ts` via `recordDojoActivity`. | **Pass with Observations**<br>*(Glow Heuristic Collisions)* |
| 6 | **Conjugation Dojo** | `#/conjugate`<br>`ConjugationDojo.tsx`<br>`conjugations.ts`<br>`conjugationLessons.ts` | 76-word word pool (71 verbs + 5 adjectives), 5 inflections, 20 reverse de-conjugation items with step-by-step breakdown. | • Full pool: 71 verbs (16 Ichidan, 50 Godan, 5 Irregular) + 5 adjectives (3 い, 2 な).<br>• 5 inflection drills per word.<br>• 20 reverse challenges in `DECONJUGATION_ITEMS`.<br>• 12 Transitive/Intransitive pairs. | • Rigorous Godan sound shifts across 5 vowel rows.<br>• Accurate Te-form euphonic changes (`onbin`).<br>• **Defect**: Step 2 (voice selection) can be completely skipped for 100% passing credit. | High scores and mastered verbs recorded in `conjugationScores` and `masteredVerbs`. | **Defect Identified**<br>*(Reverse De-conjugation Step 2 Bypass)* |
| 7 | **Confuser Speed Sorter** | `#/kana`<br>`#/kanji-dojo`<br>`ConfuserSpeedSorter.tsx`<br>`confusers.ts` | 19 look-alike character groups (9 kana + 10 kanji) with sub-750ms reaction timing. | • 19 groups covering 7 visual difference types.<br>• Sub-750ms `⚡ Lightning`, <1400ms `🔥 Fast`, `👍 Good` badges.<br>• Keyboard (`←/→`, `A/D`, `1/2`) and touch controls. | • Distinction cues highlight stroke direction (e.g. `シ` upward ↗ vs `ツ` downward ↙).<br>• Pause-on-error displays side-by-side analysis.<br>• **Defect**: First attempt hardcodes reaction time to 600ms due to uninitialized ref. | Best streak and accuracy saved in user settings slice. | **Pass with Observations**<br>*(Initial Mount Reaction Time Default)* |
| 8 | **Kanji Matrix** | `#/kanji`<br>`Kanji.tsx`<br>`Strokes.tsx`<br>`kanjiCompounds.ts`<br>`kanji.ts` | 150 Kanji with 580 multi-compound vocabulary words, contextual sentences, and KanjiVG stroke tracing. | • 150 Kanji (103 N5 + 47 N4).<br>• 580 multi-compound words in `KANJI_COMPOUNDS`.<br>• 580 contextual example sentences.<br>• 150 KanjiVG SVG stroke files in `public/strokes/`. | • Authentic On/Kun readings and radical categorization.<br>• Interactive canvas tracing.<br>• **Defect**: `KANJI_COMPOUNDS['室']` lists `部屋` (which does not contain `室`).<br>• **Defect**: 3 compound sentences omit their compound word. | Kanji favorites and stroke mastery stored in `favoriteKanji` and `kanjiMastery`. | **Defect Identified**<br>*(Lexical Mismatch `室` -> `部屋`, Missing Sentence Compounds)* |
| 9 | **Graded Stories** | `#/stories`<br>`StoryReader.tsx`<br>`stories.ts` | 32 graded immersion stories across 4 genres with Blind Audio-First mode and tri-state furigana engine. | • 32 stories (10 Daily Life, 8 Folklore, 8 Media, 6 Mystery).<br>• 15 N5 stories, 17 N4 stories.<br>• Blind Mode hides text until audio plays.<br>• Tri-state furigana (`'all'`, `'tap'`, `'none'`). | • High pedagogical immersion; syntactic structures constrained strictly to N5/N4.<br>• Ruby `<rt>` tags support interactive vocabulary tapping with dictionary card and SRS addition. | Story completion persisted in `completedStories`; furigana preference synced in `furiganaMode`. | **Pass** |
| 10 | **Habits & Nutrition** | `#/bento`<br>`store.ts`<br>`DailyBento.tsx` | 2-slot streak freeze shield protection, vacation pause mode, and Bento Nutrition Plate tracking 4 learning macros. | • 2 streak freeze shields (`streakShields: 0..2`).<br>• Automatic shield earning every 7-day milestone.<br>• Vacation pause mode freezes streak decay.<br>• 4 macros: Vocab Protein (5), Grammar Carbs (3), Kanji Fiber (2), Listening Vitamins (2). | • Clean nutritional gamification encourages balanced study across all modalities.<br>• Midnight date boundary auto-resets daily plate via `resetDailyPlateIfNewDay()` without wiping streak. | Store slices: `streak`, `streakShields`, `lastShieldUsedDate`, `vacationMode`, `nutritionPlate`. | **Defect Identified**<br>*(See Feature 1 for Shield Milestone Desync and Multi-Click Inflation)* |
| 11 | **Campaign Odyssey** | `#/campaign`<br>`Campaign.tsx`<br>`campaign.ts` | 12 Sagas (48 missions) covering full N5 and N4 with 3-phase procedural boss combat and placement tests. | • Exactly 12 Sagas and 48 Stages.<br>• 305 total questions across boss pools.<br>• `sampleBossChallenge(saga, 10)` generates dynamic 10-question boss fights.<br>• 3-phase boss HP (100 -> 66 -> 33) & 3 player hearts. | • Structured learning path with anti-skip verification.<br>• Boss phase transitions display dynamic battle dialogues.<br>• Placement test allows accelerated learners to jump ahead safely. | Persisted in `campaignClearedSagas: number[]`, `campaignCompletedStages: string[]`, `campaignUnlockedSaga: number`. | **Pass** |
| 12 | **Adaptive Review Center** | `#/review`<br>`Review.tsx`<br>`store.ts` | Decoupled Multi-Vector FSRS, isolated 3-stage Ghost Review Queue (4h -> 12h -> 24h, 3-win evaporation), 24h/30d workload forecast. | • 4 independent FSRS vectors (`meaning`, `reading`, `production`, `audio`).<br>• Lapses >= 2 or difficulty >= 6.5 triggers ghost queue.<br>• Ghost schedule: 4h -> 12h -> 24h.<br>• Evaporation upon 3 consecutive successes. | • Decoupled memory models prevent reading success from masking audio recognition weakness.<br>• Lapse stability protection prevents stability collapse.<br>• **Defect**: 30-day forecast projection contains dead-code loop that never projects recurring cards. | Full FSRS card parameters stored in `multiVectorItems: Record<string, MultiVectorSRSItem>` and `ghosts: Record<string, GhostCard>`. | **Defect Identified**<br>*(30-Day Workload Forecast Dead-Code Loop)* |
| 13 | **Official JLPT Mock Exam** | `#/exam`<br>`Exam.tsx`<br>`OmrBubbleSheet.tsx`<br>`HexagonRadarChart.tsx`<br>`jlptGenerator.ts` | Timed 3-section exam simulation with 2B pencil OMR bubble sheet emulation and 6-axis diagnostic radar chart. | • 3 authentic sections: Vocab (20m/7m), Intermission (5m), Grammar/Reading (40m/12m), Intermission (5m), Listening (30m/10m).<br>• 67 questions generated procedurally.<br>• Interactive OMR mark sheet with bubble fill and flag toggles.<br>• 6-axis diagnostic radar chart on certificate. | • Authentic scaled scoring: Language/Reading (120 pts, 38 min), Listening (60 pts, 19 min), Total (180 pts, 80 min for N5 / 90 for N4).<br>• **Defect**: OMR bubble clicks allow jumping between sections, bypassing sequential section locks.<br>• **Defect**: Timer uses interval tick counting, freezing when tab is backgrounded. | Completed certificates saved to `examHistory: ExamResult[]`; missed questions can be batched to SRS. | **Defect Identified**<br>*(OMR Stage Bypass, Background Tab Timer Drift)* |

---

## 3. Discovered Issues & Loophole Inventory by Severity

Every finding documented below includes its exact file and line locations, root cause analysis, step-by-step reproduction instructions, pedagogical and technical impact, and concrete code remediation.

```
BUG CLASSIFICATION SUMMARY:
├── CRITICAL (1)
│   └── BUG-01: Daily Bento Streak Shield Milestone Calculation Desync
├── HIGH (4)
│   ├── BUG-02: Grammar Dojo Near-Miss Error Interceptor Kanji Mismatch
│   ├── BUG-03: JLPT Mock Exam OMR Bubble Sheet & Pill Out-of-Order Section Bypass
│   ├── BUG-04: JLPT Mock Exam Countdown Timer Drift on Background Tab / System Sleep
│   └── BUG-05: Kanji Matrix Lexical Mismatch (室 -> 部屋) & Missing Compound Sentences
├── MEDIUM (6)
│   ├── BUG-06: Daily Bento Early Completion Loophole on Dish 3B
│   ├── BUG-07: Daily Bento Multi-Click Macro Inflation Loophole
│   ├── BUG-08: Reverse De-Conjugation Voice Step 2 Bypass Exploit
│   ├── BUG-09: Listening Dojo Deterministic Modulo Alternation & 0% Campaign Pass
│   ├── BUG-10: Listening Dojo TTS Spoken Sentence vs Displayed Transcript Discrepancy
│   ├── BUG-11: Adaptive Review Center 30-Day Workload Forecast Dead-Code Loop
│   └── BUG-12: Multi-Tab LocalStorage Desynchronization / Silent Overwrite
└── LOW (3)
    ├── BUG-13: Confuser Speed Sorter First Attempt Hardcoded 600ms Reaction Time
    ├── BUG-14: Particle Dojo Semantic Role Glow Heuristic Keyword Collisions
    └── BUG-15: React 19 Ref Access During Render in Stroke Tracing Canvas
```

---

### 3.1 Critical Severity Issues

#### [BUG-01] Daily Bento Streak Shield Milestone Calculation Desync
- **Subsystem**: Habit Engine & Gamification (`#/bento`)
- **Affected File(s)**: `src/pages/DailyBento.tsx:529-533`, `src/lib/store.ts:833-849`
- **Severity**: **CRITICAL**
- **Category**: State Integrity & Gamification Loss

##### Description & Root Cause Analysis
In `src/pages/DailyBento.tsx`, the component computes `effectiveStreak` to predict what the user's streak will become upon completing today's Bento, and uses this value to select the daily stamp via `getDailyStamp(todayIso, effectiveStreak)`. The calculation is:
```tsx
const effectiveStreak = useMemo(() => {
  const todayMs = new Date(todayIso).getTime();
  const y = new Date(todayMs - 864e5).toISOString().slice(0, 10);
  return lastStudy === todayIso ? streak : lastStudy === y ? streak + 1 : 1;
}, [lastStudy, streak, todayIso]);
```
When a learner misses a day with streak shields available (`streakShields > 0`), `lastStudy` is 2 calendar days in the past (`diffDays === 2`). Because `lastStudy !== todayIso` and `lastStudy !== y` (yesterday), the ternary expression falls through to the default value **1**!

Consequently:
1. `dailyStamp` is evaluated as `getDailyStamp(todayIso, 1)`, which selects a standard station stamp (e.g., `narita`) instead of the legitimate milestone seal (e.g. `kinkakuji` for Day 14).
2. When the user completes the Bento, `finishBento()` executes `completeBento(dailyStamp.id)`, explicitly passing the string `'narita'`.
3. In `src/lib/store.ts:833-849`, `completeBento` calls `bumpStreak(s)`. `bumpStreak` correctly detects active shields, absorbs the missed day, decrements shields from 2 to 1, and increments `streak` to 14. However, `completeBento` records the awarded stamp using `stampId || defaultStampId`, which evaluates to the passed `'narita'`!
4. The user's store records `unlockedStamps['narita'] = timestamp`, and the Day 14 milestone seal `kinkakuji` is **permanently missed and unawardable**.
5. Furthermore, Dish 4 displays the milestone fanfare only if `effectiveStreak > 0 && effectiveStreak % 7 === 0`. Because `effectiveStreak === 1`, `1 % 7 === 0` evaluates to `false`, completely suppressing the milestone UI.

##### Step-by-Step Reproduction Procedure
1. Initialize `localStorage['n5-study']` with a 13-day streak and 2 streak shields:
   ```json
   {
     "streak": 13,
     "streakShields": 2,
     "lastStudy": "2026-11-05",
     "vacationMode": false
   }
   ```
2. Set system date (or simulate date) to `2026-11-07` (skipping `2026-11-06`).
3. Navigate to `#/bento`.
4. Observe Dish 4: The displayed stamp is `成田空港 (narita)` instead of the Day 14 milestone goshuin `金閣寺 (kinkakuji)`. The celebratory milestone banner is completely absent.
5. Click through Dishes 1 to 4 and complete the Bento.
6. Inspect `localStorage.getItem('n5-study')`: `streak` is correctly `14` and `streakShields` is `1`, but `unlockedStamps` contains `'narita'` while `'kinkakuji'` is absent.

##### Pedagogical / Technical Impact
The streak shield system is advertised as protecting learner streaks and progression. Instead, learners who rely on streak shields to preserve hard-earned 14-day, 21-day, 28-day, or 35-day milestones are silently penalized by losing their rare milestone goshuin stamps forever.

##### Concrete Code Remediation
Update `effectiveStreak` in `src/pages/DailyBento.tsx` to account for active streak shields and vacation mode:
```tsx
// In src/pages/DailyBento.tsx:529-535
const effectiveStreak = useMemo(() => {
  const todayMs = new Date(todayIso).getTime();
  const y = new Date(todayMs - 864e5).toISOString().slice(0, 10);
  if (lastStudy === todayIso) return streak;
  if (lastStudy === y) return streak + 1;
  // Account for streak shields and vacation mode
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
```
Additionally, harden `completeBento` in `src/lib/store.ts:837-845` so that milestone evaluation always takes precedence over caller-provided stamp IDs:
```ts
// In src/lib/store.ts:837
const todayIso = todayStr();
const updatedStreak = streakResult.streak;
// Re-evaluate milestone based on the post-bumped streak
const isMilestone = updatedStreak > 0 && updatedStreak % 7 === 0;
const awardedStampId = isMilestone
  ? getDailyStamp(todayIso, updatedStreak).id
  : (stampId || getDailyStamp(todayIso, updatedStreak).id);
```

---

### 3.2 High Severity Issues

#### [BUG-02] Grammar Dojo Near-Miss Error Interceptor Kanji Mismatch Bug
- **Subsystem**: Grammar Dojo (`#/grammar`)
- **Affected File(s)**: `src/components/LayeredClozeInput.tsx:23-49`, `src/data/grammar.ts`
- **Severity**: **HIGH**
- **Category**: Pedagogical Logic & Input Interception

##### Description & Root Cause Analysis
In `src/components/LayeredClozeInput.tsx`, user keyboard input is intercepted and converted to Hiragana in real-time using Wanakana:
```ts
const handleInputChange = (raw: string) => {
  const converted = toHiragana(raw, { IMEMode: true });
  setInput(converted);
};
```
When the user submits an answer, `checkAnswer` tests whether the input matches any known misconceptions defined in `ex.nearMisses`:
```ts
const nearMiss = ex.nearMisses?.find((nm) => {
  const nmClean = nm.input.trim().replace(/\s+/g, '');
  return (
    nmClean.toLowerCase() === clean.toLowerCase() ||
    toHiragana(nmClean).toLowerCase() === toHiragana(clean).toLowerCase()
  );
});
```
`toHiragana` only converts Romaji to Hiragana (e.g. `'tsukimasu'` -> `'つきます'`). It does **not** convert Kanji to Hiragana: `toHiragana('着きます')` returns `'着きます'`.

In `src/data/grammar.ts`, **8 out of 16 near-miss definitions** specify their pattern string with Kanji:
1. `cloze-g1-2`: `着きます`, `着いた`
2. `cloze-g2-1`: `お願いします`
3. `cloze-g4-1`: `行く`
4. `cloze-g5-1`: `撮る`
5. `cloze-g7-1`: `登る`
6. `cloze-g9-1`: `着くと`
7. `cloze-g11-1`: `褒めさせ`

When an English/global learner types the phonetic near-miss in Romaji or Kana (e.g. typing `tsukimasu` yielding `つきます`), `clean` is purely Hiragana (`'つきます'`). `nmClean` is `'着きます'`. `toHiragana('着きます')` remains `'着きます'`. Because `'着きます' !== 'つきます'`, the comparison evaluates to `false`. The near-miss interceptor fails to fire, and the user is immediately penalized with a red failure box and loss of streak, completely breaking the intended pedagogical safety net.

##### Step-by-Step Reproduction Procedure
1. Navigate to `#/grammar/g1`.
2. Locate the Layered Cloze exercise `cloze-g1-2` ("Expressing arrival at destination").
3. Type `tsukimasu` into the input field (Wanakana displays `つきます`).
4. Click "Check" or press Enter.
5. **Observed Result**: The amber warning (*"Close! You used the polite -masu form, but this requires the plain form..."*) is NOT triggered. Instead, the interface marks the question failed in red: `✗ Expected: 着く`.

##### Pedagogical / Technical Impact
Near-miss interceptors are designed to detect intermediate developmental stages (such as using polite endings in subordinate clauses or using dictionary forms before stems) without penalizing learners. Because half the patterns are dead code due to Kanji mismatch, learners receive harsh negative reinforcement for making the exact predictable developmental errors the system was built to gently guide them through.

##### Concrete Code Remediation
In `src/data/grammar.ts`, provide pure Hiragana equivalents (or arrays of acceptable representations) for all near-miss inputs:
```ts
// Example correction in src/data/grammar.ts
// cloze-g1-2:
nearMisses: [
  { input: 'つきます', warning: 'Close! You used the polite -masu form, but this subordinate clause requires the plain dictionary form (着く).' },
  { input: 'ついた', warning: 'Close! You used the past form, but the action is in the future.' }
]
// cloze-g4-1:
nearMisses: [
  { input: 'いく', warning: 'Close! Drop the dictionary ending -u and use the -i stem before に行く (買いに行きます).' }
]
```
Additionally, update `LayeredClozeInput.tsx:35` to normalize Kanji where possible or strip whitespace/kanji variations.

---

#### [BUG-03] JLPT Mock Exam OMR Bubble Sheet & Pill Out-of-Order Section Bypass
- **Subsystem**: JLPT Mock Exam (`#/exam`)
- **Affected File(s)**: `src/pages/Exam.tsx:681-684, 721-724`
- **Severity**: **HIGH**
- **Category**: Examination Protocol & Integrity Exploit

##### Description & Root Cause Analysis
The official JLPT test format strictly isolates sections: Section 1 (Language Knowledge) must be completed and locked before Intermission 1; Section 2 (Grammar/Reading) follows and is locked before Intermission 2; Section 3 (Listening) is executed last.

In `src/pages/Exam.tsx`, the OMR Bubble Sheet component (`OmrBubbleSheet.tsx`) and the top question pill bar allow selecting any question across the entire exam:
```tsx
// src/pages/Exam.tsx:681-684
onSelectQuestion={(qIdx) => {
  setActiveQuestionIdx(qIdx);
  const targetSec = questions[qIdx]?.section;
  if (submitted) {
    setActiveSec('all');
  } else if (targetSec) {
    if (targetSec === 'vocab') setCurrentStage('section_1');
    else if (targetSec === 'grammar') setCurrentStage('section_2');
    else if (targetSec === 'listening') setCurrentStage('section_3');
  }
}}
```
When a test-taker is actively in Section 1 (e.g. question 5), they can click on Question 45 (Section 2) or Question 60 (Section 3) in the OMR bubble panel. The callback directly invokes `setCurrentStage('section_2')` or `setCurrentStage('section_3')`. 

Crucially, **`stageSecondsLeft` is NOT re-initialized** to the target section duration when `currentStage` is mutated via question selection. The remaining seconds from Section 1 (e.g. 15 minutes) are carried directly into Section 3 (which normally permits 30 minutes), or vice-versa. Moreover, questions in Section 1 can be modified during Section 3 by simply tapping an earlier question bubble.

##### Step-by-Step Reproduction Procedure
1. Navigate to `#/exam` and click "Start Full Exam".
2. You are in Section 1 (Vocabulary/Kanji) with a 20:00 timer.
3. Open the right-hand OMR Bubble Sheet drawer.
4. Scroll to question 55 (Listening section) and tap the bubble for choice ②.
5. **Observed Result**:
   - The view immediately switches to Section 3.
   - The timer does NOT reset to 30:00; it continues counting down from Section 1's remaining time.
   - Tap question 2 in the OMR drawer: the view jumps back to Section 1, allowing retroactive answers.

##### Pedagogical / Technical Impact
Completely invalidates the diagnostic validity of the mock exam. Students can game sectional time limits, preview listening comprehension questions in advance, and edit past sections, destroying correlation with real-world JLPT scoring conditions.

##### Concrete Code Remediation
In `src/pages/Exam.tsx`, restrict OMR bubble sheet and question pill navigation strictly to questions within the current active stage:
```tsx
// In src/pages/Exam.tsx:681-695
onSelectQuestion={(qIdx) => {
  if (submitted) {
    setActiveQuestionIdx(qIdx);
    setActiveSec('all');
    return;
  }
  const targetSec = questions[qIdx]?.section;
  const currentExpectedSec = currentStage === 'section_1' ? 'vocab' 
    : currentStage === 'section_2' ? 'grammar' 
    : currentStage === 'section_3' ? 'listening' : null;
  
  if (targetSec !== currentExpectedSec) {
    // Prevent cross-section navigation while exam is active
    return;
  }
  setActiveQuestionIdx(qIdx);
}}
```
Filter the OMR sheet items rendered in `OmrBubbleSheet.tsx` to only display questions belonging to `currentStage`.

---

#### [BUG-04] JLPT Mock Exam Countdown Timer Drift on Background Tab / System Sleep
- **Subsystem**: JLPT Mock Exam (`#/exam`)
- **Affected File(s)**: `src/pages/Exam.tsx:117-128`
- **Severity**: **HIGH**
- **Category**: Examination Protocol & Timer Vulnerability

##### Description & Root Cause Analysis
In `src/pages/Exam.tsx`, the sectional countdown timer relies entirely on counting interval ticks:
```tsx
useEffect(() => {
  if (submitted) return;
  const t = setInterval(() => {
    setStageSecondsLeft((s) => {
      if (s <= 1) {
        setTimeout(() => advanceStage(), 0);
        return 0;
      }
      return s - 1;
    });
  }, 1000);
  return () => clearInterval(t);
}, [submitted, currentStage, level, mode]);
```
Modern web browsers (Chrome, Edge, Safari, Firefox) aggressively throttle `setInterval` callbacks on inactive background tabs to 1 execution per minute (or suspend execution entirely). Furthermore, when a laptop lid is closed or a mobile device enters lock screen, execution halts completely.

A student taking the mock exam can switch tabs to look up answers or close their laptop. The timer pauses or decelerates sixty-fold, allowing hours of contemplation on a strictly timed 20-minute test.

##### Step-by-Step Reproduction Procedure
1. Navigate to `#/exam` and start the exam.
2. Note the displayed countdown time (e.g., `19:50`).
3. Switch to another browser tab or minimize the browser window for 3 minutes.
4. Return to the exam tab.
5. **Observed Result**: The timer has only decremented by ~3 seconds (displaying `19:47`) instead of the true 180 seconds elapsed.

##### Pedagogical / Technical Impact
Mock exam pacing is fundamental to JLPT preparation. Japanese language standardized exams require strict time allocation (under 50 seconds per vocabulary question). Background interval drift destroys the time-pressure simulation.

##### Concrete Code Remediation
Calculate remaining duration against a monotonic wall-clock target timestamp (`Date.now() + durationMs`):
```tsx
// In src/pages/Exam.tsx
const stageEndRef = useRef<number>(0);

useEffect(() => {
  if (submitted) return;
  const durationSec = STAGE_DURATIONS[currentStage][level][mode];
  stageEndRef.current = Date.now() + durationSec * 1000;
  setStageSecondsLeft(durationSec);

  const t = setInterval(() => {
    const remaining = Math.max(0, Math.ceil((stageEndRef.current - Date.now()) / 1000));
    setStageSecondsLeft(remaining);
    if (remaining <= 0) {
      clearInterval(t);
      advanceStage();
    }
  }, 250); // Check frequently against absolute time

  return () => clearInterval(t);
}, [submitted, currentStage, level, mode]);
```

---

#### [BUG-05] Kanji Matrix Lexical Mismatch (`室` -> `部屋`) & Missing Compound Sentences
- **Subsystem**: Kanji Matrix (`#/kanji`)
- **Affected File(s)**: `src/data/kanjiCompounds.ts:1-897`
- **Severity**: **HIGH**
- **Category**: Pedagogical Data Defect

##### Description & Root Cause Analysis
1. **Critical Lexical Mismatch**:
   In `src/data/kanjiCompounds.ts`, under the Kanji entry for `室` (shitsu, room):
   ```ts
   {
     w: '部屋',
     r: 'へや',
     en: 'room',
     type: 'on',
     sentenceJp: '自分の部屋を片付けました。',
     sentenceEn: 'I tidied up my room.'
   }
   ```
   `部屋` is composed of U+90E8 (`部`) and U+5C4B (`屋`). **It contains zero instances of the kanji `室`!** Out of all 580 compound words in the database across 150 kanji, this is the only entry where a compound does not contain its parent kanji.
2. **Compounds Missing from Example Sentences**:
   Three compound entries provide example sentences that omit the compound completely:
   - `出` / `出口` (`でぐち`, Exit): `sentenceJp` is `"非常口はこちらです。"` (Emergency exit is here). Uses `非常口` (contains `口`), omitting `出口`.
   - `仕` / `仕方` (`しかた`, Method/Way): `sentenceJp` is `"機械の使い方が分かりません。"`. Uses `使い方` (Way of using), omitting `仕方`.
   - `使` / `使い方` (`つかいかた`, How to use): `sentenceJp` is `"切符の買い方を教えてください。"`. Uses `買い方` (How to buy), omitting `使い方`.

##### Step-by-Step Reproduction Procedure
1. Navigate to `#/kanji/室`.
2. Inspect the compound cards: The first compound is listed as `部屋` (`へや`, room). The character `室` appears nowhere in `部屋`.
3. Navigate to `#/kanji/出` and locate `出口`. Read the example sentence: it says `"非常口はこちらです。"`.

##### Pedagogical / Technical Impact
Teaching beginners that `部屋` is a compound of `室` causes fundamental confusion regarding kanji composition. Furthermore, presenting example sentences that do not contain the target vocabulary word deprives learners of seeing contextual usage in context.

##### Concrete Code Remediation
In `src/data/kanjiCompounds.ts`:
1. Replace `部屋` under `室` with authentic compounds containing `室`:
   ```ts
   // In KANJI_COMPOUNDS['室']
   {
     w: '教室',
     r: 'きょうしつ',
     en: 'classroom',
     type: 'on',
     sentenceJp: '生徒たちが教室に入りました。',
     sentenceEn: 'The students entered the classroom.'
   },
   {
     w: '研究室',
     r: 'けんきゅうしつ',
     en: 'laboratory / professor office',
     type: 'on',
     sentenceJp: '先生の研究室に行きます。',
     sentenceEn: 'I am going to the professor\'s office.'
   }
   ```
2. Correct the three mismatched example sentences:
   - `出口`: `"駅の出口で待ち合わせましょう。"` (Let's meet at the station exit.)
   - `仕方`: `"それは仕方がありません。"` (That cannot be helped.)
   - `使い方`: `"スマートフォンの使い方を習いました。"` (I learned how to use a smartphone.)

---

### 3.3 Medium Severity Issues

#### [BUG-06] Daily Bento Early Completion Loophole on Dish 3B
- **Subsystem**: Daily Bento (`#/bento`)
- **Affected File(s)**: `src/pages/DailyBento.tsx:772-775`
- **Severity**: **MEDIUM**
- **Category**: Progression Exploit / Anti-Cheat

##### Description & Root Cause Analysis
In `src/pages/DailyBento.tsx`, Dish 3 presents an interactive Japanese street sign comprehension drill (`Dish 3A`) or kanji stroke tracing drill (`Dish 3B`). At the bottom of Dish 3B, line 772 renders:
```tsx
<div className="controls" style={{ marginTop: '1.2rem' }}>
  <button className="chip on" onClick={finishBento}>
    🔖 Complete Today's Bento →
  </button>
</div>
```
This button is rendered **unconditionally** without checking `signChoice !== null` or verifying that strokes were drawn on `TraceCanvas`. A learner can open `#/bento`, click "Next" through Dish 1 and Dish 2, and immediately click "Complete Today's Bento →" without reading or answering Dish 3. The system awards full daily completion, streak increment, and stamp unlocking in under 3 seconds.

##### Step-by-Step Reproduction Procedure
1. Navigate to `#/bento`.
2. Click "Next Dish →" on Dish 1 (Warmup).
3. Click "Next Dish →" on Dish 2 (Travel Counter).
4. On Dish 3, do not select any answer. Immediately click `🔖 Complete Today's Bento →`.
5. **Observed Result**: Bento completes, streak increments, and stamp is awarded with zero interaction on Dish 3.

##### Concrete Code Remediation
Gate the completion button behind question completion:
```tsx
<button 
  className="chip on" 
  disabled={signChoice === null} 
  onClick={finishBento}
  style={{ opacity: signChoice === null ? 0.5 : 1 }}
>
  🔖 Complete Today's Bento →
</button>
```

---

#### [BUG-07] Daily Bento Multi-Click Macro Inflation Loophole
- **Subsystem**: Daily Bento & Nutrition Plate (`#/bento`, `src/lib/store.ts`)
- **Affected File(s)**: `src/lib/store.ts:833-849`
- **Severity**: **MEDIUM**
- **Category**: State Integrity & Concurrency

##### Description & Root Cause Analysis
In `src/lib/store.ts`, `completeBento` executes:
```ts
completeBento: (stampId?: string) => {
  set((s) => {
    const t = todayStr();
    const streakResult = bumpStreak(s);
    return {
      ...streakResult,
      bentoCount: s.bentoCount + 1,
      lastBentoDate: t,
      nutritionPlate: feedAllNutrition(s.nutritionPlate, 2),
      // ...
    };
  });
}
```
`completeBento` does not check if `s.lastBentoDate === t`. If a user double-clicks the completion button rapidly, or triggers `completeBento()` repeatedly in the developer console, `bentoCount` increments indefinitely and `feedAllNutrition(s.nutritionPlate, 2)` repeatedly boosts all 4 nutrition macros by +2 on every call.

##### Step-by-Step Reproduction Procedure
1. Open developer tools on `#/bento`.
2. Execute `for (let i = 0; i < 5; i++) window.store.getState().completeBento();`.
3. Observe: `bentoCount` increases by 5, and all macronutrients gain +10 on the same calendar day.

##### Concrete Code Remediation
Add an idempotency guard in `src/lib/store.ts:835`:
```ts
completeBento: (stampId?: string) => {
  set((s) => {
    const t = todayStr();
    if (s.lastBentoDate === t) {
      // Already completed today; prevent duplicate macro and bentoCount inflation
      return s;
    }
    const streakResult = bumpStreak(s);
    // ... proceed with update
  });
}
```

---

#### [BUG-08] Reverse De-Conjugation Voice Step 2 Bypass Exploit
- **Subsystem**: Conjugation Dojo (`#/conjugate`)
- **Affected File(s)**: `src/pages/ConjugationDojo.tsx:111-113, 588`
- **Severity**: **MEDIUM**
- **Category**: Pedagogical Loophole

##### Description & Root Cause Analysis
In the Reverse De-Conjugation engine (`ConjugationDojo.tsx`), students are presented with an inflected word (e.g. `読ませられた`) and prompted to identify:
- **Step 1**: The dictionary base form (`飲む`, `読む`, `呼ぶ`).
- **Step 2**: The grammatical voice/inflection category (`causative-passive`).

The validation logic in line 112 reads:
```ts
const isRootOk = selectedRoot === currentDeconj.targetDictForm;
const isVoiceOk = selectedVoice ? selectedVoice === currentDeconj.formIdentified : true;
const isAllOk = isRootOk && isVoiceOk;
```
And line 588 controls the submission button:
```tsx
<button disabled={!selectedRoot} onClick={submitDeconjugation}>
  Check De-Conjugation ✓
</button>
```
`disabled={!selectedRoot}` enables submission as soon as Step 1 is chosen. If Step 2 is left untouched (`selectedVoice === null`), `isVoiceOk` defaults to `true`. 

A student who skips Step 2 completely is awarded 100% correct and advances their score. Conversely, a student who attempts Step 2 and makes an error (`selectedVoice !== formIdentified`) receives `false` and is marked wrong. The system rewards skipping the grammatical analysis.

##### Step-by-Step Reproduction Procedure
1. Navigate to `#/conjugate` and select "Reverse De-Conjugation".
2. On any challenge, select only the correct dictionary root button in Step 1.
3. Do not click any voice button in Step 2.
4. Click "Check De-Conjugation ✓".
5. **Observed Result**: The answer is graded 100% correct with fanfare and green banner.

##### Concrete Code Remediation
Require both `selectedRoot` and `selectedVoice` before submission, and strictly evaluate `selectedVoice`:
```tsx
// In src/pages/ConjugationDojo.tsx:112
const isVoiceOk = selectedVoice === currentDeconj.formIdentified;
// In line 588
<button disabled={!selectedRoot || !selectedVoice} onClick={submitDeconjugation}>
  Check De-Conjugation ✓
</button>
```

---

#### [BUG-09] Listening Dojo Deterministic Modulo Alternation & 0% Campaign Pass
- **Subsystem**: Listening Dojo (`#/listening`)
- **Affected File(s)**: `src/pages/Listening.tsx:270-287`
- **Severity**: **MEDIUM**
- **Category**: Anti-Cheat / Progression Exploit

##### Description & Root Cause Analysis
1. **Deterministic Alternation**:
   In `src/pages/Listening.tsx:287`:
   ```ts
   const nextPitchDrill = () => {
     setPitchPicked(null);
     const nextSide: 'A' | 'B' = (pitchIdx + 1) % 2 === 0 ? 'A' : 'B';
     setPitchTargetSide(nextSide);
     setPitchIdx((i) => i + 1);
   };
   ```
   The target alternates strictly: `A -> B -> A -> B -> A -> B`. An astute user can blindly alternate clicks and achieve 100% accuracy without listening to the audio.
2. **0% Accuracy Campaign Mission Clear**:
   In lines 276-282:
   ```ts
   if (isCampaignMode) {
     const nextCount = pitchDrillCount + 1;
     setPitchDrillCount(nextCount);
     if (nextCount >= 5) {
       completeMission();
     }
   }
   ```
   `completeMission()` is called after 5 attempts regardless of whether `ok` was true. Answering 5 times incorrectly clears the campaign stage.

##### Step-by-Step Reproduction Procedure
1. Navigate to `#/listening?campaign=true`.
2. Click the wrong side 5 consecutive times.
3. **Observed Result**: The campaign banner displays "Stage Complete!", unlocking the next campaign mission despite 0% accuracy.

##### Concrete Code Remediation
1. Randomize `nextSide`: `const nextSide: 'A' | 'B' = Math.random() < 0.5 ? 'A' : 'B';`
2. Track correct answers in campaign mode and require >= 4 out of 5 correct before calling `completeMission()`.

---

#### [BUG-10] Listening Dojo TTS Spoken Sentence vs Displayed Transcript Discrepancy
- **Subsystem**: Listening Dojo (`#/listening`, `pitchAccent.ts`)
- **Affected File(s)**: `src/data/pitchAccent.ts:1-1050`
- **Severity**: **MEDIUM**
- **Category**: Pedagogical Audio Discrepancy

##### Description & Root Cause Analysis
Across `src/data/pitchAccent.ts`, **26 out of 31 pitch minimal pairs** have mismatched strings between `sentenceTts` (the audio text read by the speech synthesizer) and `sentenceJp` (the Japanese transcript displayed to the student after answering).

Examples:
- `asa` (朝 vs 麻): `sentenceJp` is `"毎朝 七時に 起きます。"` (I wake up at 7:00 every morning; reading: `まいあさ`), while `sentenceTts` is `"朝 七時に 起きます。"` (I wake up at 7:00 in the morning; reading: `あさ`). The student hears `朝` (`あさ`), but the screen shows `毎朝` (`まいあさ`).
- `maki` (巻き vs 薪): `sentenceJp` displays `"のり巻きの ご飯を 作ります。"` while `sentenceTts` speaks `"海苔巻きを 作ります。"`.
- `kumo` (蜘蛛 vs 雲): `sentenceJp` displays `"庭の 木に 蜘蛛が 巣を作りました。"` while `sentenceTts` speaks `"木に 蜘蛛が います。"`.
- `yuki` (行き vs 雪): `sentenceJp` displays `"東京 行きの 新幹線に 乗ります。"` while `sentenceTts` speaks `"東京 行きの 新幹線です。"`.

##### Step-by-Step Reproduction Procedure
1. Navigate to `#/listening`.
2. Select pair `asa` (朝 vs 麻).
3. Answer the drill and listen to the audio feedback while reading the displayed sentence.
4. **Observed Result**: Audio speaks "朝 七時に起きます", while visual text displays "毎朝 七時に起きます".

##### Pedagogical / Technical Impact
Auditory-visual mismatch causes confusion for beginner learners who cannot yet distinguish subtle grammatical particles and prefixes.

##### Concrete Code Remediation
Synchronize `sentenceTts` and `sentenceJp` across all 26 pairs in `src/data/pitchAccent.ts` so that spoken phonemes exactly match displayed characters.

---

#### [BUG-11] Adaptive Review Center 30-Day Workload Forecast Dead-Code Loop
- **Subsystem**: Adaptive Review Center (`#/review`)
- **Affected File(s)**: `src/pages/Review.tsx:148-156`
- **Severity**: **MEDIUM**
- **Category**: Mathematical Modeling & UI Forecasting

##### Description & Root Cause Analysis
In `src/pages/Review.tsx`, the 30-day forecast projection attempts to simulate future review recurrences based on card stability:
```tsx
for (const item of allCards) {
  const dueTime = new Date(item.card.due).getTime();
  const diffDays = Math.floor((dueTime - now) / (86400 * 1000));
  if (diffDays <= 0) {
    days[0]++;
  } else if (diffDays < 30) {
    days[diffDays]++;
  } else {
    const s = item.card.stability || 1;
    let next = dueTime;
    while (next <= now + 30 * 86400 * 1000) {
      const d = Math.floor((next - now) / (86400 * 1000));
      if (d >= 0 && d < 30) days[d]++;
      next += Math.max(1, Math.round(s)) * 86400 * 1000;
    }
  }
}
```
The `else` branch is only entered when `diffDays >= 30`. That means `dueTime >= now + 30 * 86400 * 1000`.
In line 150, `next` is initialized to `dueTime`.
The `while` loop condition is `while (next <= now + 30 * 86400 * 1000)`.
Because `next` is already greater than or equal to `now + 30 days`, the loop condition evaluates to `false` immediately on every iteration! The `while` loop is completely unreachable dead code. Furthermore, cards due within the 30-day window (`diffDays < 30`) are never projected for their subsequent recurrences within that same 30-day window.

##### Step-by-Step Reproduction Procedure
1. Navigate to `#/review` and toggle "30-Day Forecast".
2. Observe the bar chart for days 10 through 30.
3. Compare against theoretical card recurrences: all cards due in days 1-10 with low stability (e.g. stability 3 days) never appear again on days 13, 16, 19, etc.

##### Concrete Code Remediation
Model recurrences starting from the card's initial due date forward:
```tsx
for (const item of allCards) {
  const dueTime = new Date(item.card.due).getTime();
  const s = Math.max(1, Math.round(item.card.stability || 1));
  let next = dueTime <= now ? now : dueTime;
  while (next <= now + 30 * 864e5) {
    const d = Math.floor((next - now) / 864e5);
    if (d >= 0 && d < 30) {
      days[d]++;
    }
    next += s * 864e5;
  }
}
```

---

#### [BUG-12] Multi-Tab LocalStorage Desynchronization / Silent Overwrite
- **Subsystem**: State Persistence (`src/lib/store.ts`)
- **Affected File(s)**: `src/lib/store.ts:930-1006`
- **Severity**: **MEDIUM**
- **Category**: Concurrency & Data Loss

##### Description & Root Cause Analysis
Zustand's `persist` middleware writes state snapshots to `localStorage['n5-study']` upon any state mutation. However, `src/lib/store.ts` does not register a `window.addEventListener('storage')` listener or a `BroadcastChannel`. 

If a user opens Tab A and Tab B simultaneously:
1. User studies 20 cards in Tab A. Tab A writes the new cards to `localStorage`.
2. Tab B still holds the initial in-memory snapshot in memory.
3. User navigates in Tab B (e.g. clicks vacation mode or views a story). Tab B triggers a state write, dumping its stale in-memory snapshot over `localStorage['n5-study']`.
4. The 20 reviewed cards from Tab A are completely erased.

##### Step-by-Step Reproduction Procedure
1. Open two browser tabs to `#/review`.
2. In Tab A, review 5 cards.
3. In Tab B, toggle "Vacation Mode" on and off.
4. Refresh Tab A.
5. **Observed Result**: The 5 card reviews performed in Tab A are lost.

##### Concrete Code Remediation
Attach a storage event listener in `src/lib/store.ts` to trigger Zustand rehydration across tabs:
```ts
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'n5-study' && event.newValue) {
      useAppStore.persist.rehydrate();
    }
  });
}
```

---

### 3.4 Low Severity Issues

#### [BUG-13] Confuser Speed Sorter First Attempt Hardcoded 600ms Reaction Time
- **Subsystem**: Confuser Speed Sorter (`#/kana`, `#/kanji-dojo`)
- **Affected File(s)**: `src/components/ConfuserSpeedSorter.tsx:33, 71`
- **Severity**: **LOW**
- **Category**: UI / Metric Initialization

##### Description & Root Cause Analysis
In `src/components/ConfuserSpeedSorter.tsx`:
```ts
const startTimeRef = useRef<number>(0);
// ...
const now = Date.now();
const elapsed = startTimeRef.current > 0 ? now - startTimeRef.current : 600;
setReactionTime(elapsed);
```
`startTimeRef.current` is initialized to 0 and is only updated in `pickNextChallenge()` or when switching groups. On the very first challenge presented upon mounting, `startTimeRef.current` is 0. If the user answers, `startTimeRef.current > 0` evaluates to `false`, and the reaction time is reported as exactly `600ms` (`⚡ Lightning`), regardless of whether the user took 200ms or 10 seconds.

##### Concrete Code Remediation
Initialize `startTimeRef.current = Date.now()` in a mount `useEffect`:
```tsx
useEffect(() => {
  startTimeRef.current = Date.now();
}, []);
```

---

#### [BUG-14] Particle Dojo Semantic Role Glow Heuristic Keyword Collisions
- **Subsystem**: Particle Dojo (`#/particles`)
- **Affected File(s)**: `src/components/ParticleSlotGrid.tsx:14-55`
- **Severity**: **LOW**
- **Category**: Visual Styling & Heuristic Precision

##### Description & Root Cause Analysis
`getSemanticRoleGlow` maps semantic role descriptions to glow colors using substring matching:
```ts
if (r.includes('time') || r.includes('point') || r.includes('amber')) {
  return { color: '#f59e0b', ... }; // Amber (Time Point)
}
```
In `src/data/particles.ts`:
- Challenge `psc-5` (`東京から大阪まで`): `まで` is given role `"Endpoint Boundary (until/to)"`. Because `"Endpoint"` contains `"point"`, `まで` glows Amber (Time Point) instead of Indigo (Destination/Boundary).
- Challenge `psc-7` (`毎朝 七時に家を出ます`): `を` is given role `"Point of Departure (from)"`. Because `"Point"` is present, `を` glows Amber instead of Emerald (Spatial Object).
- Challenge `psc-8` (`電車の ほうがバスより速いです`): `より` is assigned `"Comparison Benchmark (than)"`. Lacking matching keywords, it falls through to default Emerald.

##### Concrete Code Remediation
Refine keyword checks to match whole words or check specific role identifiers:
```ts
const r = role.toLowerCase();
if (/\b(time|temporal)\b/.test(r)) return GLOWS.amber;
if (/\b(boundary|destination|goal|direction)\b/.test(r)) return GLOWS.indigo;
if (/\b(departure|object|subject)\b/.test(r)) return GLOWS.emerald;
```

---

#### [BUG-15] React 19 Ref Access During Render in Stroke Tracing Canvas
- **Subsystem**: Kanji Matrix Stroke Tracing (`#/kanji`)
- **Affected File(s)**: `src/components/Strokes.tsx:126`
- **Severity**: **LOW**
- **Category**: React 19 Compatibility

##### Description & Root Cause Analysis
In `src/components/Strokes.tsx:126`:
```tsx
{drawing.current && <path d={toD(drawing.current)} className="stroke-user" />}
```
Oxlint flags `react(refs): Cannot access refs during render`. Under React 19 Concurrent Mode, reading mutable ref values during the render phase can cause visual tearing or rendering desynchronization during fast pointer-move gestures.

##### Concrete Code Remediation
Mirror the active stroke path into React component state (`activeStroke`) inside the pointer event handlers:
```tsx
const [activeStroke, setActiveStroke] = useState<Point[] | null>(null);
// In pointer events, update activeStroke alongside drawing.current
```

---

## 4. Pedagogical Integrity Analysis

### 4.1 Pitch Accent Contours & Minimal Pairs
The Japanese pitch accent system in the Tokyo dialect is governed by the location of the **accent kernel** (downstep), where pitch abruptly falls from High to Low. The 4 Tokyo archetypes are implemented in `src/data/pitchAccent.ts`:
1. **Heiban (平板, [0])**: Low on mora 1, High on mora 2 through end; trailing particles remain High (`飴が` [あ**めが**]).
2. **Atamadaka (頭高, [1])**: High on mora 1, dropping immediately to Low on mora 2; trailing particles remain Low (`雨が` [**あ**めが]).
3. **Nakadaka (中高, [2..N-1])**: Low on mora 1, High on intermediate morae, dropping before the end (`心` [こ**こ**ろ]).
4. **Odaka (尾高, [N])**: Low on mora 1, High through final mora, dropping on trailing particle (`男が` [お**とこ**▼が]).

The dynamic SVG rendering in `Listening.tsx` correctly illustrates the high/low guide rails, mora nodes, and downstep indicators. However, as noted in BUG-10, 26 pairs feature spoken sentences that do not match the transcript. Furthermore, pairs 30 (`心` vs `子供`) and 31 (`青い` vs `赤い`) are not minimal pairs or homophones, despite being placed in the "Homophone Studio".

### 4.2 Grammar Nuance Clozes & Bunpro-Style Hint Progression
The cloze system in `LayeredClozeInput.tsx` represents a significant pedagogical leap beyond multiple-choice quizzes:
- **Layer 1 (Nuance)** teaches communicative intent (e.g. *Why use 〜てはいけません instead of 〜ないでください?*).
- **Layer 2 (Pattern)** establishes syntactic frames (e.g. *[Verb Te-form] + は + いけません*).
- **Layer 3 (Rule)** provides morphological conjugation steps.
- **Layer 4 (Full Grammar)** provides deep grammatical explanations.

This progression respects cognitive load theory by scaffolding hints before revealing answers. However, fixing BUG-02 (the near-miss Kanji mismatch) is essential to preserve the non-punitive guidance loop.

### 4.3 Conjugation Engine & Reverse De-Conjugation
Japanese inflection is agglutinative. The 76 words in `src/data/conjugations.ts` correctly represent:
- **Godan Verbs (五段動詞)**: Across all 9 consonant stems (`-k`, `-g`, `-s`, `-t`, `-n`, `-b`, `-m`, `-r`, `-w`), with sound shifts across the 5 vowel rows (a/i/u/e/o) and euphonic Te-form sound changes (`書く -> 書いて` [i-onbin], `泳ぐ -> 泳いで` [i-onbin + voicing], `待つ/死ぬ/呼ぶ` [sokuonbin / hatsuonbin]).
- **Ichidan Verbs (一段動詞)**: Clean stem preservation (`食べる -> 食べて / 食べない`).
- **Irregular Verbs (不規則動詞)**: `する` and `来る` (including `連れてくる`, `勉強する`, `散歩する`).
- **Adjectives**: Both い-adjectives (`寒い -> 寒くない / 寒かった`) and な-adjectives (`静か -> 静かではない / 静かだった`).

The reverse de-conjugation challenges in `DECONJUGATION_ITEMS` enforce deep morphological decomposition (e.g. deconstructing `読ませられた` through passive -> causative -> dictionary root). Enforcing Step 2 (BUG-08) is necessary to ensure learners actually engage with this morphology.

### 4.4 Kanji Compound Matrix & Radical Categorization
The Kanji Matrix provides 580 compound words for 150 kanji. The compounds represent authentic high-frequency vocabulary across On-yomi, Kun-yomi, and irregular readings. Addressing BUG-05 (replacing `部屋` under `室` and supplying missing compounds in example sentences) will bring this dataset to 100% linguistic accuracy.

---

## 5. Architectural & State Persistence Evaluation

### 5.1 Zustand Store Architecture & Version Migration
The application state is centralized in `src/lib/store.ts` under Zustand 5 with `persist` middleware (`name: 'n5-study'`, version `10`):
- **Store Slices**:
  - `srs`: Legacy card storage.
  - `multiVectorItems`: Decoupled 4-vector FSRS items (`meaning`, `reading`, `production`, `audio`).
  - `ghosts`: Isolated 3-stage ghost review cards.
  - `campaign*`: Sagas, stages, and boss records.
  - `decodedSigns`, `shokkenki*`, `terminal*`: Kiosk simulator state.
  - `streakShields`, `vacationMode`, `nutritionPlate`: Habit and gamification engine.
- **Hydration & Migration (`migrate` function)**:
  - Dates stored as ISO strings are revived to native `Date` objects via `reviveCard` and `reviveMultiVectorItem`.
  - Schema migrations safely backfill missing properties from earlier versions (v1 to v9).
- **Storage Quota Analysis**:
  At 1,000 multi-vector items and full campaign history, the serialized JSON payload is ~450KB, well within browser `localStorage` limits (5MB - 10MB).

### 5.2 Procedural Web Audio API Engine
All 9 sound effects in `src/lib/sfx.ts` are 100% procedurally generated using Web Audio oscillators and gain envelopes:
- Eliminates external `.mp3`/`.wav` network assets and HTTP 404 risks.
- Handles browser autoplay policy via `ctx.resume()` in `getCtx()`.
- Degrades gracefully in headless or non-audio test environments.

### 5.3 Service Worker & PWA Caching Strategy
- `sw.js` runs under cache name `n5-study-v4`.
- **Navigation requests**: Network-First (ensures immediate updates upon redeployment).
- **Assets (`/assets/*`, `/strokes/*`)**: Cache-First with network fallback.
- **Dynamic Chunk Protection**: `lazyWithRetry` in `src/App.tsx:11-23` automatically catches chunk load failures on redeployment and triggers a seamless reload.

---

## 6. Live vs Local Parity Analysis

A forensic cryptographic and runtime comparison was executed between the local codebase (`commit 905c302`) and the live GitHub Pages deployment at `https://janz13.github.io/japanese-n5-study/`.

### 6.1 Cryptographic Hash Verification
Direct SHA256 checksums of local build artifacts vs live HTTP responses confirmed **exact binary identity**:

| Artifact Path | Local Build SHA256 Hash | Live Remote SHA256 Hash | Parity Verdict |
|---|---|---|:---:|
| `index.html` | `E08B79E2FAA03915346A7283D03B8E0C9EED8F46F878E8EAA4C70B06DFE63A8E` | `E08B79E2FAA03915346A7283D03B8E0C9EED8F46F878E8EAA4C70B06DFE63A8E` | **MATCH (100%)** |
| `assets/index-BjaBi93e.js` | `0DEB29A40AF1D698FF13FB9F0C6BF74F24F36E014E74FED74AC623D502EED473` | `0DEB29A40AF1D698FF13FB9F0C6BF74F24F36E014E74FED74AC623D502EED473` | **MATCH (100%)** |
| `assets/campaign-DpN-yUqJ.js` | `814BEC80024A496A7113EEFB3FDD723F2F17D8B937940BA6DA7EE282DE3100E3` | `814BEC80024A496A7113EEFB3FDD723F2F17D8B937940BA6DA7EE282DE3100E3` | **MATCH (100%)** |

All 31 bundled asset chunks and static assets (`manifest.webmanifest`, `sw.js`, `strokes/*.svg`) returned `HTTP 200 OK` with identical Content-Length headers.

### 6.2 Live Headless Chrome CDP Route Exploration
Using Headless Chrome via the Chrome DevTools Protocol, all 13 core feature routes and 4 secondary routes were explored:
- **Exceptions**: 0 uncaught JavaScript exceptions.
- **Console Errors**: 0 console errors.
- **Network Failures**: 0 HTTP 4xx/5xx errors out of 102 monitored requests.

**Conclusion**: The live deployment is an exact mirror of the local repository build, with zero deployment divergence or build-step regressions.

---

## 7. Actionable Remediation Roadmap

To resolve all identified issues and harden the platform for long-term production use, the following phased engineering plan is recommended:

```
REMEDIATION ROADMAP:
├── Phase 1: Critical & High Priority Hotfixes (Sprint 1)
│   ├── [Fix BUG-01] Daily Bento effectiveStreak calculation & store milestone seal preservation
│   ├── [Fix BUG-02] Grammar Dojo near-miss pattern Hiragana conversion
│   ├── [Fix BUG-03] JLPT Mock Exam OMR sectional navigation boundary locks
│   ├── [Fix BUG-04] JLPT Mock Exam wall-clock countdown timer migration
│   └── [Fix BUG-05] Kanji Matrix lexical correction (replace 部屋 with 教室/研究室 & fix sentences)
├── Phase 2: Medium Priority Logic & Anti-Cheat Hardening (Sprint 2)
│   ├── [Fix BUG-06] Gate Daily Bento completion button on Dish 3 question attempt
│   ├── [Fix BUG-07] Add same-day idempotency check in store.completeBento()
│   ├── [Fix BUG-08] Require Step 2 voice selection in Reverse De-Conjugation submission
│   ├── [Fix BUG-09] Randomize pitch drill target side and gate campaign mission on accuracy
│   ├── [Fix BUG-10] Synchronize sentenceTts and sentenceJp across 26 pitch minimal pairs
│   ├── [Fix BUG-11] Fix 30-day forecast projection loop in Review.tsx
│   └── [Fix BUG-12] Implement window 'storage' listener for multi-tab synchronization
└── Phase 3: Low Priority Refinements & Quality Polish (Sprint 3)
    ├── [Fix BUG-13] Initialize startTimeRef.current on ConfuserSpeedSorter mount
    ├── [Fix BUG-14] Refine ParticleSlotGrid semantic role regex matching
    ├── [Fix BUG-15] Migrate drawing.current in Strokes.tsx to component state
    └── [Polish] Add reset buttons for Decoded Signs and Terminal Kiosks
```

---

## 8. Master Audit Verification Attestation

This audit was conducted under strict forensic standards:
1. **Zero Source Modification**: No files in `src/` were altered during the audit.
2. **Empirical Evidence**: All findings were independently reproduced through automated test suites, headless Node scratch scripts, and headless Chrome browser automation.
3. **Traceability**: All 15 findings are mapped to verbatim file paths, line numbers, and concrete code remediations.

**Master Audit Status**: **COMPLETE & VERIFIED**
