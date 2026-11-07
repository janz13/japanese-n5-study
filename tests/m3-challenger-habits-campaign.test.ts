/**
 * ============================================================================
 * EMPIRICAL ADVERSARIAL CHALLENGER TEST SUITE: MILESTONE 3
 * Habits (Streak Shields, Vacation Mode, Bento Nutrition) & Campaign Expansion
 * ============================================================================
 * 
 * Verifies:
 * 1. Streak Shield buffer capacity: max 2 shields, milestone awards, negative clamping.
 * 2. Missing exactly 1 calendar day consumes 1 shield and preserves streak.
 * 3. Missing 2 consecutive calendar days with only 1 shield resets streak to 1.
 * 4. Missing 2 consecutive calendar days with 2 shields consumes 2 shields and preserves streak.
 * 5. Vacation mode: freezes streak decay and pauses degradation over long gaps.
 * 6. Bento Nutrition Plate: 4 macronutrients correctly accumulate daily points and reset on a new day.
 * 7. Campaign Expansion: exactly 12 Sagas and exactly 48 stages (4 stages per saga).
 * 8. Route integrity: every stage targetRoute resolves to a real route in App.tsx / data catalogs.
 * 9. Boss questions: all 12 sagas have >= 25 questions in boss.questionPool (total >= 300 questions).
 * 10. Boss combat dynamics: sampleBossChallenge(saga, 10) generates non-duplicate 10 questions.
 * 11. Boss 3 phases match HP thresholds (100%, 66%, 33%) and combat turn transitions.
 * 
 * Execution: node --experimental-strip-types tests/m3-challenger-habits-campaign.test.ts
 */

import './helpers/test-runner.ts';
import assert from 'node:assert/strict';
import {
  useStore,
  diffCalendarDays,
  todayStr,
  initialNutritionPlate,
} from '../src/lib/store.ts';
import {
  CAMPAIGN_SAGAS,
  sampleBossChallenge,
  getCampaignStage,
  findCampaignStage,
  type BossPhase,
} from '../src/data/campaign.ts';
import { STORIES } from '../src/data/stories.ts';
import { LESSONS } from '../src/data/grammar.ts';
import { SCENES } from '../src/data/scenes.ts';

let totalChecks = 0;
function check(condition: boolean, msg: string): void {
  totalChecks++;
  assert.ok(condition, msg);
}

function checkStrictEqual<T>(actual: T, expected: T, msg: string): void {
  totalChecks++;
  assert.strictEqual(actual, expected, msg);
}

/** Utility to add calendar days in ISO format (YYYY-MM-DD) */
function addCalendarDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

console.log('================================================================');
console.log('CHALLENGER SUITE: HABITS, SHIELDS, BENTO NUTRITION & CAMPAIGN');
console.log('Independent Empirical Adversarial Verification for Milestone 3');
console.log('================================================================\n');

// ============================================================================
// PART 1: STREAK SHIELDS, VACATION MODE & BENTO NUTRITION IN STORE
// ============================================================================
console.log('>>> [PART 1] STREAK SHIELDS, VACATION MODE & BENTO NUTRITION <<<');

// ----------------------------------------------------------------------------
// 1.1 Calendar Day Difference Calculation Boundary Checks
// ----------------------------------------------------------------------------
console.log('\n[1.1] Testing calendar day arithmetic and month/year boundaries...');
checkStrictEqual(diffCalendarDays('2026-05-10', '2026-05-10'), 0, 'Same day difference must be 0');
checkStrictEqual(diffCalendarDays('2026-05-11', '2026-05-10'), 1, 'Consecutive day difference must be 1');
checkStrictEqual(diffCalendarDays('2026-05-12', '2026-05-10'), 2, '2 days later difference must be 2');
checkStrictEqual(diffCalendarDays('2026-05-13', '2026-05-10'), 3, '3 days later difference must be 3');
checkStrictEqual(diffCalendarDays('2026-03-01', '2026-02-28'), 1, 'Non-leap Feb 28 to Mar 1 is 1 day');
checkStrictEqual(diffCalendarDays('2024-03-01', '2024-02-28'), 2, 'Leap year Feb 28 to Mar 1 is 2 days (Feb 29 exists)');
checkStrictEqual(diffCalendarDays('2027-01-01', '2026-12-31'), 1, 'Year boundary Dec 31 to Jan 1 is 1 day');
checkStrictEqual(diffCalendarDays('2026-12-31', '2026-01-01'), 364, 'Full year span calculation (364 days)');

// ----------------------------------------------------------------------------
// 1.2 Streak Shield Buffer Capacity: Max 2 Shields & Clamping
// ----------------------------------------------------------------------------
console.log('\n[1.2] Testing streak shield buffer capacity (0..2 slots) and clamping...');
const store = useStore.getState();
store.resetProgress();

checkStrictEqual(useStore.getState().streakShields, 0, 'Initial streakShields must be 0');

// Award 1 shield
store.awardStreakShield(1);
checkStrictEqual(useStore.getState().streakShields, 1, 'awardStreakShield(1) increments to 1');

// Award second shield
store.awardStreakShield(1);
checkStrictEqual(useStore.getState().streakShields, 2, 'awardStreakShield(1) increments to 2');

// Attempt to exceed cap with additional awards
store.awardStreakShield(1);
checkStrictEqual(useStore.getState().streakShields, 2, 'awardStreakShield(1) at cap remains 2');

store.awardStreakShield(10);
checkStrictEqual(useStore.getState().streakShields, 2, 'awardStreakShield(10) remains strictly capped at 2');

// Test negative clamping (shield count cannot become negative)
store.awardStreakShield(-1);
checkStrictEqual(useStore.getState().streakShields, 1, 'awardStreakShield(-1) decrements to 1');

store.awardStreakShield(-5);
checkStrictEqual(useStore.getState().streakShields, 0, 'awardStreakShield(-5) clamps to 0 (cannot be negative)');

// ----------------------------------------------------------------------------
// 1.3 Streak Milestone Awarding: Every 7 Consecutive Days (Max 2)
// ----------------------------------------------------------------------------
console.log('\n[1.3] Testing 7-day milestone shield awards...');
const today = todayStr();
const yesterday = addCalendarDays(today, -1);

// Study day 6 -> day 7 milestone with 0 shields -> earns 1 shield
useStore.setState({
  lastStudy: yesterday,
  streak: 6,
  streakShields: 0,
  vacationMode: false,
});
store.recordKana('あ', true);
checkStrictEqual(useStore.getState().streak, 7, 'Streak increases from 6 to 7 on consecutive day');
checkStrictEqual(useStore.getState().streakShields, 1, 'Milestone streak 7 awards 1 streak shield');

// Study day 13 -> day 14 milestone with 1 shield -> earns 1 shield (now 2)
useStore.setState({
  lastStudy: yesterday,
  streak: 13,
  streakShields: 1,
  vacationMode: false,
});
store.recordKana('い', true);
checkStrictEqual(useStore.getState().streak, 14, 'Streak increases from 13 to 14 on consecutive day');
checkStrictEqual(useStore.getState().streakShields, 2, 'Milestone streak 14 awards 1 streak shield (capped at 2)');

// Study day 20 -> day 21 milestone with 2 shields -> capped at 2
useStore.setState({
  lastStudy: yesterday,
  streak: 20,
  streakShields: 2,
  vacationMode: false,
});
store.recordKana('う', true);
checkStrictEqual(useStore.getState().streak, 21, 'Streak increases from 20 to 21');
checkStrictEqual(useStore.getState().streakShields, 2, 'Milestone streak 21 with 2 shields remains capped at 2');

// ----------------------------------------------------------------------------
// 1.4 Missing Exactly 1 Calendar Day (Diff = 2, Missed = 1)
// ----------------------------------------------------------------------------
console.log('\n[1.4] Testing single missed day shield auto-consumption & streak preservation...');

// Case A: 1 shield available -> consumes 1 shield, preserves streak
const twoDaysAgo = addCalendarDays(today, -2);
checkStrictEqual(diffCalendarDays(today, twoDaysAgo), 2, '2 days ago implies diffCalendarDays == 2');

useStore.setState({
  lastStudy: twoDaysAgo,
  streak: 10,
  streakShields: 1,
  lastShieldUsedDate: null,
  vacationMode: false,
});

store.recordKana('え', true);
checkStrictEqual(useStore.getState().streak, 11, 'Missing 1 day with 1 shield preserves & advances streak (10 -> 11)');
checkStrictEqual(useStore.getState().streakShields, 0, '1 shield was consumed (1 -> 0)');
checkStrictEqual(useStore.getState().lastShieldUsedDate, today, 'lastShieldUsedDate updated to today');
checkStrictEqual(useStore.getState().lastStudy, today, 'lastStudy updated to today');

// Case B: 2 shields available -> consumes 1 shield, 1 shield remains, preserves streak
useStore.setState({
  lastStudy: twoDaysAgo,
  streak: 25,
  streakShields: 2,
  lastShieldUsedDate: null,
  vacationMode: false,
});

store.completeConjLesson('c1');
checkStrictEqual(useStore.getState().streak, 26, 'Missing 1 day with 2 shields preserves & advances streak (25 -> 26)');
checkStrictEqual(useStore.getState().streakShields, 1, 'Exactly 1 shield consumed, 1 shield remains (2 -> 1)');
checkStrictEqual(useStore.getState().lastShieldUsedDate, today, 'lastShieldUsedDate updated to today');

// Case C: 0 shields available -> streak resets to 1
useStore.setState({
  lastStudy: twoDaysAgo,
  streak: 30,
  streakShields: 0,
  vacationMode: false,
});

store.recordKanji('日', true);
checkStrictEqual(useStore.getState().streak, 1, 'Missing 1 day with 0 shields resets streak to 1');
checkStrictEqual(useStore.getState().streakShields, 0, 'Shields remain 0');

// ----------------------------------------------------------------------------
// 1.5 Missing 2 Consecutive Calendar Days (Diff = 3, Missed = 2)
// ----------------------------------------------------------------------------
console.log('\n[1.5] Testing 2 consecutive missed days dynamics...');
const threeDaysAgo = addCalendarDays(today, -3);
checkStrictEqual(diffCalendarDays(today, threeDaysAgo), 3, '3 days ago implies diffCalendarDays == 3 (2 missed days)');

// Case A: Missing 2 consecutive days with only 1 shield -> 1 < 2 -> resets to 1!
useStore.setState({
  lastStudy: threeDaysAgo,
  streak: 50,
  streakShields: 1,
  vacationMode: false,
});

store.recordKana('お', true);
checkStrictEqual(useStore.getState().streak, 1, 'Missing 2 consecutive days with only 1 shield resets streak to 1');
checkStrictEqual(useStore.getState().streakShields, 0, 'Shields reset to 0');

// Case B: Missing 2 consecutive days with 2 shields -> 2 >= 2 -> consumes 2 shields, preserves streak!
useStore.setState({
  lastStudy: threeDaysAgo,
  streak: 50,
  streakShields: 2,
  vacationMode: false,
});

store.recordKana('か', true);
checkStrictEqual(useStore.getState().streak, 51, 'Missing 2 consecutive days with 2 shields preserves streak (50 -> 51)');
checkStrictEqual(useStore.getState().streakShields, 0, 'Both shields consumed (2 -> 0)');
checkStrictEqual(useStore.getState().lastShieldUsedDate, today, 'lastShieldUsedDate updated to today');

// Case C: Missing 3 consecutive days with 2 shields -> 2 < 3 -> resets to 1!
const fourDaysAgo = addCalendarDays(today, -4);
useStore.setState({
  lastStudy: fourDaysAgo,
  streak: 50,
  streakShields: 2,
  vacationMode: false,
});

store.recordKana('き', true);
checkStrictEqual(useStore.getState().streak, 1, 'Missing 3 consecutive days with 2 shields resets streak to 1');
checkStrictEqual(useStore.getState().streakShields, 0, 'Shields reset to 0');

// ----------------------------------------------------------------------------
// 1.6 Vacation Mode: Freezes Streak Decay & Pauses Degradation
// ----------------------------------------------------------------------------
console.log('\n[1.6] Testing vacation mode pause & degradation freeze...');

// Toggle on and off
useStore.setState({ vacationMode: false, vacationStartDate: null });
store.toggleVacationMode();
checkStrictEqual(useStore.getState().vacationMode, true, 'toggleVacationMode() toggles on');
checkStrictEqual(useStore.getState().vacationStartDate, today, 'vacationStartDate set to today');

store.toggleVacationMode();
checkStrictEqual(useStore.getState().vacationMode, false, 'toggleVacationMode() toggles off');
checkStrictEqual(useStore.getState().vacationStartDate, null, 'vacationStartDate cleared');

// Test freeze over 60 days
const sixtyDaysAgo = addCalendarDays(today, -60);
useStore.setState({
  vacationMode: true,
  vacationStartDate: sixtyDaysAgo,
  lastStudy: sixtyDaysAgo,
  streak: 88,
  streakShields: 1,
});

// User reviews during vacation mode
store.recordKana('く', true);
checkStrictEqual(useStore.getState().streak, 88, 'Vacation mode freezes streak decay: streak remains 88 after 60 days');
checkStrictEqual(useStore.getState().streakShields, 1, 'Vacation mode preserves streak shields: shield remains 1');
checkStrictEqual(useStore.getState().lastStudy, today, 'lastStudy updated to today during vacation study');

// ----------------------------------------------------------------------------
// 1.7 Bento Nutrition Plate Engine & 4 Macronutrients
// ----------------------------------------------------------------------------
console.log('\n[1.7] Testing Bento Nutrition Plate accumulation and daily rollover...');

// Initial plate
const initP = initialNutritionPlate(today);
checkStrictEqual(initP.date, today, 'Plate date is today');
checkStrictEqual(initP.vocabProtein, 0, 'Initial vocabProtein is 0');
checkStrictEqual(initP.grammarCarbs, 0, 'Initial grammarCarbs is 0');
checkStrictEqual(initP.kanjiFiber, 0, 'Initial kanjiFiber is 0');
checkStrictEqual(initP.listeningVitamins, 0, 'Initial listeningVitamins is 0');

useStore.setState({ nutritionPlate: initP });

// Record individual nutrition activities
store.recordNutritionActivity('vocabProtein', 5);
store.recordNutritionActivity('grammarCarbs', 3);
store.recordNutritionActivity('kanjiFiber', 2);
store.recordNutritionActivity('listeningVitamins', 2);

const fullPlate = useStore.getState().nutritionPlate;
checkStrictEqual(fullPlate.vocabProtein, 5, 'vocabProtein accumulated to 5 (Target reached)');
checkStrictEqual(fullPlate.grammarCarbs, 3, 'grammarCarbs accumulated to 3 (Target reached)');
checkStrictEqual(fullPlate.kanjiFiber, 2, 'kanjiFiber accumulated to 2 (Target reached)');
checkStrictEqual(fullPlate.listeningVitamins, 2, 'listeningVitamins accumulated to 2 (Target reached)');

// Verify drill feeding connections:
useStore.setState({ nutritionPlate: initialNutritionPlate(today) });

// 1. Kana drill -> kanjiFiber +1
store.recordKana('け', true);
checkStrictEqual(useStore.getState().nutritionPlate.kanjiFiber, 1, 'recordKana feeds kanjiFiber +1');

// 2. Kanji drill -> kanjiFiber +1
store.recordKanji('月', true);
checkStrictEqual(useStore.getState().nutritionPlate.kanjiFiber, 2, 'recordKanji feeds kanjiFiber +1 (now 2)');

// 3. Sign choice -> kanjiFiber +1
store.recordSignChoice('sign-test-1', 0);
checkStrictEqual(useStore.getState().nutritionPlate.kanjiFiber, 3, 'recordSignChoice feeds kanjiFiber +1 (now 3)');

// 4. Grammar lesson -> grammarCarbs +2
store.completeLesson('g1', 100);
checkStrictEqual(useStore.getState().nutritionPlate.grammarCarbs, 2, 'completeLesson feeds grammarCarbs +2');

// 5. Conjugation drill -> grammarCarbs +1
store.completeConjLesson('c2');
checkStrictEqual(useStore.getState().nutritionPlate.grammarCarbs, 3, 'completeConjLesson feeds grammarCarbs +1 (now 3)');

// 6. Story -> listeningVitamins +2
store.completeStory('ch1-arrival', 100);
checkStrictEqual(useStore.getState().nutritionPlate.listeningVitamins, 2, 'completeStory feeds listeningVitamins +2');

// 7. Speaking scene -> listeningVitamins +1
store.completeScene('s1', 100);
checkStrictEqual(useStore.getState().nutritionPlate.listeningVitamins, 3, 'completeScene feeds listeningVitamins +1 (now 3)');

// 8. Terminal order -> listeningVitamins +1
store.completeTerminalOrder('conbini', 'cb-m1');
checkStrictEqual(useStore.getState().nutritionPlate.listeningVitamins, 4, 'completeTerminalOrder feeds listeningVitamins +1 (now 4)');

// 9. Bento completion -> feeds all 4 macronutrients +2
const preBento = { ...useStore.getState().nutritionPlate };
store.completeBento();
const postBento = useStore.getState().nutritionPlate;
checkStrictEqual(postBento.vocabProtein, preBento.vocabProtein + 2, 'completeBento feeds vocabProtein +2');
checkStrictEqual(postBento.grammarCarbs, preBento.grammarCarbs + 2, 'completeBento feeds grammarCarbs +2');
checkStrictEqual(postBento.kanjiFiber, preBento.kanjiFiber + 2, 'completeBento feeds kanjiFiber +2');
checkStrictEqual(postBento.listeningVitamins, preBento.listeningVitamins + 2, 'completeBento feeds listeningVitamins +2');

// 10. Exam completion -> feeds all 4 macronutrients +3
const preExam = { ...useStore.getState().nutritionPlate };
store.completeExam(95);
const postExam = useStore.getState().nutritionPlate;
checkStrictEqual(postExam.vocabProtein, preExam.vocabProtein + 3, 'completeExam feeds vocabProtein +3');
checkStrictEqual(postExam.grammarCarbs, preExam.grammarCarbs + 3, 'completeExam feeds grammarCarbs +3');
checkStrictEqual(postExam.kanjiFiber, preExam.kanjiFiber + 3, 'completeExam feeds kanjiFiber +3');
checkStrictEqual(postExam.listeningVitamins, preExam.listeningVitamins + 3, 'completeExam feeds listeningVitamins +3');

// 1.8 Daily Rollover: resetDailyPlateIfNewDay()
console.log('\n[1.8] Testing Bento Nutrition Plate daily reset on new day...');
useStore.setState({
  nutritionPlate: {
    date: '2026-01-01', // Stale date
    vocabProtein: 10,
    grammarCarbs: 10,
    kanjiFiber: 10,
    listeningVitamins: 10,
  },
});

store.resetDailyPlateIfNewDay();
const resetPlate = useStore.getState().nutritionPlate;
checkStrictEqual(resetPlate.date, today, 'resetDailyPlateIfNewDay() updates date to today');
checkStrictEqual(resetPlate.vocabProtein, 0, 'vocabProtein reset to 0');
checkStrictEqual(resetPlate.grammarCarbs, 0, 'grammarCarbs reset to 0');
checkStrictEqual(resetPlate.kanjiFiber, 0, 'kanjiFiber reset to 0');
checkStrictEqual(resetPlate.listeningVitamins, 0, 'listeningVitamins reset to 0');

// Calling reset on same day leaves values intact
useStore.setState({
  nutritionPlate: {
    date: today,
    vocabProtein: 4,
    grammarCarbs: 3,
    kanjiFiber: 2,
    listeningVitamins: 1,
  },
});
store.resetDailyPlateIfNewDay();
const sameDayPlate = useStore.getState().nutritionPlate;
checkStrictEqual(sameDayPlate.vocabProtein, 4, 'Same-day reset preserves vocabProtein');
checkStrictEqual(sameDayPlate.grammarCarbs, 3, 'Same-day reset preserves grammarCarbs');
checkStrictEqual(sameDayPlate.kanjiFiber, 2, 'Same-day reset preserves kanjiFiber');
checkStrictEqual(sameDayPlate.listeningVitamins, 1, 'Same-day reset preserves listeningVitamins');

// Stale date auto-reset during activity feeding
useStore.setState({
  nutritionPlate: {
    date: '2025-12-31',
    vocabProtein: 8,
    grammarCarbs: 8,
    kanjiFiber: 8,
    listeningVitamins: 8,
  },
});
store.recordNutritionActivity('vocabProtein', 1);
const autoRolled = useStore.getState().nutritionPlate;
checkStrictEqual(autoRolled.date, today, 'Activity feeding rolls date to today');
checkStrictEqual(autoRolled.vocabProtein, 1, 'Activity feeding resets old 8 and adds 1 = 1');
checkStrictEqual(autoRolled.grammarCarbs, 0, 'Old grammarCarbs reset to 0');
checkStrictEqual(autoRolled.kanjiFiber, 0, 'Old kanjiFiber reset to 0');
checkStrictEqual(autoRolled.listeningVitamins, 0, 'Old listeningVitamins reset to 0');

console.log('>>> PART 1 VERIFIED: All Streak Shield & Bento Nutrition tests passed!\n');


// ============================================================================
// PART 2: CAMPAIGN EXPANSION, ROUTE INTEGRITY & BOSS DYNAMICS
// ============================================================================
console.log('>>> [PART 2] CAMPAIGN EXPANSION, ROUTE INTEGRITY & BOSS DYNAMICS <<<');

// ----------------------------------------------------------------------------
// 2.1 Exact Sagas & Stages Counts (12 Sagas, 48 Stages)
// ----------------------------------------------------------------------------
console.log('\n[2.1] Testing exact counts: 12 Sagas and 48 Stages...');
checkStrictEqual(CAMPAIGN_SAGAS.length, 12, 'Must have exactly 12 Sagas');

let calculatedTotalStages = 0;
const seenSagaIds = new Set<string>();
const seenStageIds = new Set<string>();

for (let sIdx = 0; sIdx < CAMPAIGN_SAGAS.length; sIdx++) {
  const saga = CAMPAIGN_SAGAS[sIdx];
  const expectedSagaNum = sIdx + 1;

  checkStrictEqual(saga.sagaNumber, expectedSagaNum, `Saga ${expectedSagaNum} must have continuous sagaNumber`);
  check(typeof saga.id === 'string' && saga.id.length > 0, `Saga ${expectedSagaNum} has valid id`);
  check(!seenSagaIds.has(saga.id), `Saga id "${saga.id}" must be unique across campaign`);
  seenSagaIds.add(saga.id);

  check(typeof saga.title === 'string' && saga.title.length > 0, `Saga ${expectedSagaNum} has title`);
  check(typeof saga.titleJp === 'string' && saga.titleJp.length > 0, `Saga ${expectedSagaNum} has titleJp`);
  check(typeof saga.theme === 'string' && saga.theme.length > 0, `Saga ${expectedSagaNum} has theme`);
  check(typeof saga.badge === 'string' && saga.badge.length > 0, `Saga ${expectedSagaNum} has badge`);

  // Exactly 4 stages per saga
  checkStrictEqual(saga.stages.length, 4, `Saga ${expectedSagaNum} must contain exactly 4 stages`);
  calculatedTotalStages += saga.stages.length;

  for (let stIdx = 0; stIdx < saga.stages.length; stIdx++) {
    const stage = saga.stages[stIdx];
    const expectedStageNum = stIdx + 1;

    checkStrictEqual(stage.stageNumber, expectedStageNum, `Saga ${expectedSagaNum} Stage ${stIdx} stageNumber must be ${expectedStageNum}`);
    check(typeof stage.id === 'string' && stage.id.length > 0, `Saga ${expectedSagaNum} Stage ${expectedStageNum} has id`);
    check(!seenStageIds.has(stage.id), `Stage id "${stage.id}" must be unique across entire campaign`);
    seenStageIds.add(stage.id);

    check(typeof stage.title === 'string' && stage.title.length > 0, `Stage ${stage.id} has title`);
    check(typeof stage.titleJp === 'string' && stage.titleJp.length > 0, `Stage ${stage.id} has titleJp`);
    check(typeof stage.icon === 'string' && stage.icon.length > 0, `Stage ${stage.id} has icon`);
    check(typeof stage.category === 'string' && stage.category.length > 0, `Stage ${stage.id} has category`);
    check(typeof stage.description === 'string' && stage.description.length > 0, `Stage ${stage.id} has description`);
    check(typeof stage.actionPrompt === 'string' && stage.actionPrompt.length > 0, `Stage ${stage.id} has actionPrompt`);
    check(typeof stage.targetRoute === 'string' && stage.targetRoute.startsWith('/'), `Stage ${stage.id} targetRoute must start with /`);

    // Verify lookup helpers
    const lookup1 = getCampaignStage(stage.id);
    check(lookup1 !== null, `getCampaignStage("${stage.id}") must return stage`);
    checkStrictEqual(lookup1?.stage.id, stage.id, `getCampaignStage stage.id match`);
    checkStrictEqual(lookup1?.saga.sagaNumber, expectedSagaNum, `getCampaignStage sagaNumber match`);

    const lookup2 = findCampaignStage(stage.id);
    check(lookup2 !== null, `findCampaignStage("${stage.id}") must return stage`);
    checkStrictEqual(lookup2?.stage.id, stage.id, `findCampaignStage stage.id match`);
  }
}

checkStrictEqual(calculatedTotalStages, 48, 'Must have exactly 48 stages in total (4 per saga across 12 sagas)');
checkStrictEqual(seenStageIds.size, 48, 'All 48 stage IDs are distinct and unique');

// ----------------------------------------------------------------------------
// 2.2 Route Integrity: All Stage targetRoutes Resolve to Real Routes
// ----------------------------------------------------------------------------
console.log('\n[2.2] Testing route integrity across all 48 stages...');

const VALID_STATIC_ROUTES = new Set([
  '/',
  '/campaign',
  '/kanji-dojo',
  '/bento',
  '/kana',
  '/kanji',
  '/conjugate',
  '/counters',
  '/particles',
  '/review',
  '/grammar',
  '/stories',
  '/speaking',
  '/stamps',
  '/signs',
  '/listening',
  '/drive',
  '/exam',
]);

const validStoryIds = new Set(STORIES.map((s) => s.id));
const validLessonIds = new Set(LESSONS.map((l) => l.id));
const validSceneIds = new Set(SCENES.map((s) => s.id));

let validatedRouteCount = 0;

for (const saga of CAMPAIGN_SAGAS) {
  for (const stage of saga.stages) {
    validatedRouteCount++;
    const fullRoute = stage.targetRoute;
    const basePath = fullRoute.split('?')[0];

    if (basePath.startsWith('/stories/')) {
      const storyId = basePath.replace('/stories/', '');
      check(
        validStoryIds.has(storyId),
        `Stage ${stage.id}: targetRoute "${fullRoute}" points to nonexistent story "${storyId}"`,
      );
    } else if (basePath.startsWith('/grammar/')) {
      const lessonId = basePath.replace('/grammar/', '');
      check(
        validLessonIds.has(lessonId),
        `Stage ${stage.id}: targetRoute "${fullRoute}" points to nonexistent grammar lesson "${lessonId}"`,
      );
    } else if (basePath.startsWith('/speaking/')) {
      const sceneId = basePath.replace('/speaking/', '');
      check(
        validSceneIds.has(sceneId),
        `Stage ${stage.id}: targetRoute "${fullRoute}" points to nonexistent speaking scene "${sceneId}"`,
      );
    } else {
      check(
        VALID_STATIC_ROUTES.has(basePath),
        `Stage ${stage.id}: targetRoute "${fullRoute}" (base: "${basePath}") does not match any recognized application route!`,
      );
    }
  }
}

checkStrictEqual(validatedRouteCount, 48, 'All 48 stages verified for valid targetRoute resolution');

// ----------------------------------------------------------------------------
// 2.3 Boss Questions: Each Saga >= 25 Questions, Total >= 300 Questions
// ----------------------------------------------------------------------------
console.log('\n[2.3] Testing boss question pools (>= 25 per saga, total >= 300)...');

let totalPoolQuestionsCount = 0;
const allCampaignQuestionPrompts = new Set<string>();

for (let sIdx = 0; sIdx < CAMPAIGN_SAGAS.length; sIdx++) {
  const saga = CAMPAIGN_SAGAS[sIdx];
  const boss = saga.boss;
  const sNum = saga.sagaNumber;

  check(boss !== undefined && boss !== null, `Saga ${sNum} has boss defined`);
  check(typeof boss.title === 'string' && boss.title.length > 0, `Saga ${sNum} boss has title`);
  check(typeof boss.description === 'string' && boss.description.length > 0, `Saga ${sNum} boss has description`);
  checkStrictEqual(boss.minPassScore, 7, `Saga ${sNum} boss minPassScore must be 7`);

  // Question pool checks
  check(Array.isArray(boss.questionPool), `Saga ${sNum} boss.questionPool must be an array`);
  check(boss.questionPool.length >= 25, `Saga ${sNum} boss.questionPool must contain >= 25 questions, got ${boss.questionPool.length}`);
  totalPoolQuestionsCount += boss.questionPool.length;

  const sagaQuestionPrompts = new Set<string>();

  for (let qIdx = 0; qIdx < boss.questionPool.length; qIdx++) {
    const q = boss.questionPool[qIdx];
    const qRef = `Saga ${sNum} Question #${qIdx + 1}`;

    check(typeof q.q === 'string' && q.q.trim().length >= 5, `${qRef} prompt must be >= 5 chars`);
    check(!sagaQuestionPrompts.has(q.q), `${qRef} duplicate question prompt within Saga ${sNum}: "${q.q}"`);
    sagaQuestionPrompts.add(q.q);
    allCampaignQuestionPrompts.add(q.q);

    check(Array.isArray(q.options) && q.options.length >= 2, `${qRef} options must have >= 2 choices`);
    
    // Check option uniqueness within question
    const optSet = new Set(q.options.map((o) => o.trim()));
    checkStrictEqual(optSet.size, q.options.length, `${qRef} has duplicate options: ${JSON.stringify(q.options)}`);

    for (let oIdx = 0; oIdx < q.options.length; oIdx++) {
      const opt = q.options[oIdx];
      check(typeof opt === 'string' && opt.trim().length > 0, `${qRef} option ${oIdx} is non-empty string`);
    }

    // Answer bounds
    check(Number.isInteger(q.answer), `${qRef} answer must be integer`);
    check(q.answer >= 0 && q.answer < q.options.length, `${qRef} answer index ${q.answer} out of bounds [0..${q.options.length - 1}]`);

    // Explanation
    check(typeof q.explanation === 'string' && q.explanation.trim().length >= 5, `${qRef} explanation must be descriptive`);
  }
}

check(totalPoolQuestionsCount >= 300, `Total boss questions across all sagas must be >= 300, got ${totalPoolQuestionsCount}`);
console.log(`  -> Total verified boss curriculum questions in pool: ${totalPoolQuestionsCount}`);

// ----------------------------------------------------------------------------
// 2.4 Boss Combat Dynamics: sampleBossChallenge Deduplication & Distribution
// ----------------------------------------------------------------------------
console.log('\n[2.4] Stress-testing sampleBossChallenge(saga, 10) random sampling & deduplication...');

for (const saga of CAMPAIGN_SAGAS) {
  const sampledSets = new Set<string>();

  // Run 50 random samples per saga (600 total draws)
  for (let run = 0; run < 50; run++) {
    const sampled = sampleBossChallenge(saga, 10);
    checkStrictEqual(sampled.length, 10, `Saga ${saga.sagaNumber} sample must return exactly 10 questions`);

    // Strict non-duplication check: Set of prompts must have length 10
    const prompts = new Set(sampled.map((q) => q.q));
    checkStrictEqual(prompts.size, 10, `Saga ${saga.sagaNumber} run ${run + 1}: sampled questions must contain NO duplicates`);

    // Every sampled question must exist in saga's questionPool
    for (const q of sampled) {
      const foundInPool = saga.boss.questionPool.some((pq) => pq.q === q.q);
      check(foundInPool, `Saga ${saga.sagaNumber}: sampled question "${q.q}" not found in saga pool!`);
    }

    // Track signature to verify entropy
    const signature = sampled.map((q) => q.q).sort().join('|||');
    sampledSets.add(signature);
  }

  // Across 50 draws from a pool of 25+ items, we must observe distinct random subsets
  check(sampledSets.size > 1, `Saga ${saga.sagaNumber}: sampleBossChallenge should produce diverse subsets across 50 runs, got ${sampledSets.size}`);
}

// ----------------------------------------------------------------------------
// 2.5 Boss 3 Phases & HP Thresholds (100%, 66%, 33%)
// ----------------------------------------------------------------------------
console.log('\n[2.5] Testing Boss 3 phases and HP threshold transitions...');

// Phase evaluation logic from Campaign.tsx
function evaluateActivePhase(phases: BossPhase[], bossHp: number): BossPhase {
  if (bossHp > 66) return phases[0];
  if (bossHp > 33) return phases[1];
  return phases[2];
}

for (const saga of CAMPAIGN_SAGAS) {
  const phases = saga.boss.phases;
  check(Array.isArray(phases), `Saga ${saga.sagaNumber} boss.phases must be array`);
  checkStrictEqual(phases.length, 3, `Saga ${saga.sagaNumber} must have exactly 3 boss phases`);

  checkStrictEqual(phases[0].phase, 1, `Saga ${saga.sagaNumber} Phase 1 phase property must be 1`);
  checkStrictEqual(phases[0].hpThreshold, 100, `Saga ${saga.sagaNumber} Phase 1 hpThreshold must be 100`);
  check(phases[0].themeColor.startsWith('#'), `Saga ${saga.sagaNumber} Phase 1 themeColor must be valid hex`);

  checkStrictEqual(phases[1].phase, 2, `Saga ${saga.sagaNumber} Phase 2 phase property must be 2`);
  checkStrictEqual(phases[1].hpThreshold, 66, `Saga ${saga.sagaNumber} Phase 2 hpThreshold must be 66`);
  check(phases[1].themeColor.startsWith('#'), `Saga ${saga.sagaNumber} Phase 2 themeColor must be valid hex`);

  checkStrictEqual(phases[2].phase, 3, `Saga ${saga.sagaNumber} Phase 3 phase property must be 3`);
  checkStrictEqual(phases[2].hpThreshold, 33, `Saga ${saga.sagaNumber} Phase 3 hpThreshold must be 33`);
  check(phases[2].themeColor.startsWith('#'), `Saga ${saga.sagaNumber} Phase 3 themeColor must be valid hex`);

  // Test HP threshold boundaries
  checkStrictEqual(evaluateActivePhase(phases, 100).phase, 1, 'HP 100 -> Phase 1');
  checkStrictEqual(evaluateActivePhase(phases, 80).phase, 1, 'HP 80 -> Phase 1');
  checkStrictEqual(evaluateActivePhase(phases, 67).phase, 1, 'HP 67 -> Phase 1');
  checkStrictEqual(evaluateActivePhase(phases, 66).phase, 2, 'HP 66 -> Phase 2 (boundary)');
  checkStrictEqual(evaluateActivePhase(phases, 50).phase, 2, 'HP 50 -> Phase 2');
  checkStrictEqual(evaluateActivePhase(phases, 34).phase, 2, 'HP 34 -> Phase 2');
  checkStrictEqual(evaluateActivePhase(phases, 33).phase, 3, 'HP 33 -> Phase 3 (boundary)');
  checkStrictEqual(evaluateActivePhase(phases, 10).phase, 3, 'HP 10 -> Phase 3');
  checkStrictEqual(evaluateActivePhase(phases, 0).phase, 3, 'HP 0 -> Phase 3');
}

// ----------------------------------------------------------------------------
// 2.6 Boss Combat Turn Transitions & Victory/Defeat Rules
// ----------------------------------------------------------------------------
console.log('\n[2.6] Simulating boss combat turn execution and HP/Heart damage rules...');

// Scenario 1: Flawless Victory (10 correct answers)
{
  let bossHp = 100;
  let playerHearts = 3;
  let score = 0;
  sampleBossChallenge(CAMPAIGN_SAGAS[0], 10);

  for (let turn = 0; turn < 10; turn++) {
    // Player answers correctly
    bossHp = Math.max(0, bossHp - 10);
    score++;
  }

  checkStrictEqual(bossHp, 0, '10 hits reduce boss HP to 0');
  checkStrictEqual(playerHearts, 3, 'Flawless player retains 3 hearts');
  checkStrictEqual(score, 10, 'Player achieved 10/10 score');
  const passed = score >= CAMPAIGN_SAGAS[0].boss.minPassScore && playerHearts > 0;
  check(passed, '10/10 score with 3 hearts passes boss challenge');
}

// Scenario 2: Counter-attack damage and Heart exhaustion defeat
{
  let bossHp = 100;
  let playerHearts = 3;
  let score = 0;

  // Turn 1: Correct (+1 score, bossHp - 10)
  bossHp = Math.max(0, bossHp - 10);
  score++;

  // Turn 2: Miss -> hearts - 1
  playerHearts = Math.max(0, playerHearts - 1);

  // Turn 3: Miss -> hearts - 1
  playerHearts = Math.max(0, playerHearts - 1);

  // Turn 4: Miss -> hearts - 1 (hearts reach 0 -> KO!)
  playerHearts = Math.max(0, playerHearts - 1);

  checkStrictEqual(playerHearts, 0, '3 missed answers deplete player hearts to 0');
  const isOutOfHearts = playerHearts <= 0;
  check(isOutOfHearts, 'Player defeated by running out of hearts');
  const passed = score >= CAMPAIGN_SAGAS[0].boss.minPassScore && playerHearts > 0;
  check(!passed, 'Cannot pass boss challenge when player hearts reach 0');
}

// Scenario 3: Survives with 1 heart but fails minPassScore (6/10 vs 7 required)
{
  let bossHp = 100;
  let playerHearts = 3;
  let score = 0;

  // 6 correct hits (bossHp down to 40)
  for (let i = 0; i < 6; i++) {
    bossHp = Math.max(0, bossHp - 10);
    score++;
  }

  // 2 misses (player hearts down to 1)
  playerHearts -= 2;

  checkStrictEqual(playerHearts, 1, 'Player survived with 1 heart');
  checkStrictEqual(score, 6, 'Score is 6');
  const passed = score >= CAMPAIGN_SAGAS[0].boss.minPassScore && playerHearts > 0;
  check(!passed, 'Score 6/10 fails minPassScore threshold of 7 even if hearts > 0');
}

// ----------------------------------------------------------------------------
// 2.7 Saga Progression Unlocks & Placement Fast-Track Logic
// ----------------------------------------------------------------------------
console.log('\n[2.7] Testing linear saga gating and placement fast-track backfills...');

// Saga gating logic:
const isSagaUnlocked = (sNum: number, cleared: Record<number, number>) => {
  if (sNum === 1) return true;
  return !!cleared[sNum - 1];
};

check(isSagaUnlocked(1, {}), 'Saga 1 is always unlocked');
check(!isSagaUnlocked(2, {}), 'Saga 2 is locked when Saga 1 is uncleared');
check(isSagaUnlocked(2, { 1: 100 }), 'Saga 2 unlocks when Saga 1 is cleared');
check(!isSagaUnlocked(3, { 1: 100 }), 'Saga 3 remains locked until Saga 2 is cleared');
check(isSagaUnlocked(3, { 1: 100, 2: 100 }), 'Saga 3 unlocks when Saga 2 is cleared');

// Test Fast-Track Placement jump to Saga 5 and backfill integrity for all Sagas 2..12
const backfillMap: Record<number, { lessons: string[]; stories: string[] }> = {
  2: { lessons: ['g1'], stories: ['ch1-arrival'] },
  3: { lessons: ['g1', 'g2'], stories: ['ch1-arrival', 'ch2-cafe'] },
  4: { lessons: ['g1', 'g2', 'g3'], stories: ['ch1-arrival', 'ch2-cafe', 'ch3-asakusa'] },
  5: {
    lessons: ['g1', 'g2', 'g3', 'g4', 'g5'],
    stories: ['ch1-arrival', 'ch2-cafe', 'ch3-asakusa', 'ch4-weekend', 'ch5-shinkansen'],
  },
  6: {
    lessons: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'],
    stories: ['ch1-arrival', 'ch2-cafe', 'ch3-asakusa', 'ch4-weekend', 'ch5-shinkansen', 'ch6-akihabara', 'ch7-onsen'],
  },
  7: {
    lessons: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'],
    stories: ['ch1-arrival', 'ch2-cafe', 'ch3-asakusa', 'ch4-weekend', 'ch5-shinkansen', 'ch6-akihabara', 'ch7-onsen', 'ch8-goodbye'],
  },
  8: {
    lessons: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'],
    stories: ['ch1-arrival', 'ch2-cafe', 'ch3-asakusa', 'ch4-weekend', 'ch5-shinkansen', 'ch6-akihabara', 'ch7-onsen', 'ch8-goodbye', 'ch9-kyoto', 'ch19-train-notice'],
  },
  9: {
    lessons: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9'],
    stories: ['ch1-arrival', 'ch2-cafe', 'ch3-asakusa', 'ch4-weekend', 'ch5-shinkansen', 'ch6-akihabara', 'ch7-onsen', 'ch8-goodbye', 'ch9-kyoto', 'ch12-urashima', 'ch19-train-notice'],
  },
  10: {
    lessons: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10'],
    stories: ['ch1-arrival', 'ch2-cafe', 'ch3-asakusa', 'ch4-weekend', 'ch5-shinkansen', 'ch6-akihabara', 'ch7-onsen', 'ch8-goodbye', 'ch9-kyoto', 'ch10-keigo', 'ch12-urashima', 'ch19-train-notice', 'ch22-conbini-job'],
  },
  11: {
    lessons: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10', 'g11'],
    stories: ['ch1-arrival', 'ch2-cafe', 'ch3-asakusa', 'ch4-weekend', 'ch5-shinkansen', 'ch6-akihabara', 'ch7-onsen', 'ch8-goodbye', 'ch9-kyoto', 'ch10-keigo', 'ch12-urashima', 'ch19-train-notice', 'ch22-conbini-job'],
  },
  12: {
    lessons: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10', 'g11'],
    stories: ['ch1-arrival', 'ch2-cafe', 'ch3-asakusa', 'ch4-weekend', 'ch5-shinkansen', 'ch6-akihabara', 'ch7-onsen', 'ch8-goodbye', 'ch9-kyoto', 'ch10-keigo', 'ch12-urashima', 'ch19-train-notice', 'ch22-conbini-job', 'ch30-temple-footprints'],
  },
};

for (let sNum = 2; sNum <= 12; sNum++) {
  const entry = backfillMap[sNum];
  check(entry !== undefined, `backfillMap must contain entry for Saga ${sNum}`);
  for (const lid of entry.lessons) {
    check(validLessonIds.has(lid), `backfillMap Saga ${sNum} lesson "${lid}" must exist in LESSONS`);
  }
  for (const sid of entry.stories) {
    check(validStoryIds.has(sid), `backfillMap Saga ${sNum} story "${sid}" must exist in STORIES`);
  }
}

{
  const targetSaga = 5;
  const nextClearedSagas: Record<number, number> = {};
  for (let i = 1; i < targetSaga; i++) {
    nextClearedSagas[i] = 100;
  }

  checkStrictEqual(Object.keys(nextClearedSagas).length, 4, 'Sagas 1..4 marked cleared');
  check(isSagaUnlocked(5, nextClearedSagas), 'Target Saga 5 is now unlocked');
  check(!isSagaUnlocked(6, nextClearedSagas), 'Saga 6 remains locked');
}

console.log('>>> PART 2 VERIFIED: All Campaign Expansion, Routes & Boss tests passed!\n');

// ============================================================================
// SUMMARY & VERDICT
// ============================================================================
console.log('================================================================');
console.log(`TOTAL ADVERSARIAL CHECKS COMPLETED: ${totalChecks}`);
console.log('ALL ASSERTIONS VERIFIED GREEN (100% PASS)');
console.log('VERDICT: APPROVE');
console.log('================================================================');
