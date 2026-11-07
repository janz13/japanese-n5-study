import assert from 'node:assert/strict';
import {
  STAMPS,
  STREAK_MILESTONE_IDS,
  dayHash,
  getDailyStamp,
  TRAVEL_COUNTERS,
  type TravelCounterItem,
} from '../src/data/stamps.ts';
import { useStore, todayStr } from '../src/lib/store.ts';

console.log('================================================================');
console.log('CHALLENGER EMPIRICAL VERIFICATION: Daily Bento & Stamps (M1)');
console.log('================================================================\n');

// =============================================================================
// TEST SUITE 1: Deterministic 365-Day Rotation & Hash Function Robustness
// =============================================================================
console.log('--- Test Suite 1: 365-Day Rotation & Hash Function Robustness ---');

// 1.1 Hash function boundary tests
assert.strictEqual(dayHash(''), 0, 'Empty string hash should equal 0');
const extremeDates = [
  '1970-01-01',
  '2000-02-29', // Leap century
  '2024-02-29', // Leap day
  '2026-11-06',
  '2099-12-31',
  '9999-12-31',
  'invalid-date-string-xyz-12345!@#$',
];

for (const d of extremeDates) {
  const h = dayHash(d);
  assert.ok(Number.isInteger(h), `Hash for '${d}' must be integer, got ${h}`);
  assert.ok(h >= 0, `Hash for '${d}' must be non-negative, got ${h}`);
  assert.ok(Number.isFinite(h), `Hash for '${d}' must be finite, got ${h}`);
}
console.log('✓ 1.1: dayHash returns non-negative finite integer across edge strings & leap centuries.');

// 1.2 Non-negative & no overflow over 1,000 synthetic days
for (let offset = 0; offset < 1000; offset++) {
  const date = new Date(Date.UTC(2024, 0, 1 + offset)).toISOString().slice(0, 10);
  const h = dayHash(date);
  assert.ok(h >= 0, `Hash must be >= 0 on date ${date}, got ${h}`);
}
console.log('✓ 1.2: 1,000 consecutive calendar dates produced 100% non-negative integers.');

// 1.3 365-Day Rotation across calendar year 2026
const standardStamps = STAMPS.filter(
  (s) => !STREAK_MILESTONE_IDS.includes(s.id as (typeof STREAK_MILESTONE_IDS)[number]),
);
assert.strictEqual(standardStamps.length, 23, `Expected exactly 23 standard stamps, got ${standardStamps.length}`);

const standardStampIds = new Set(standardStamps.map((s) => s.id));
const hitCounts = new Map<string, number>();
for (const s of standardStamps) {
  hitCounts.set(s.id, 0);
}

const year2026Days = 365;
for (let d = 0; d < year2026Days; d++) {
  const dateStr = new Date(Date.UTC(2026, 0, 1 + d)).toISOString().slice(0, 10);
  
  // Standard day rotation (streak = 1)
  const stamp = getDailyStamp(dateStr, 1);
  assert.ok(stamp && stamp.id, `Must return valid stamp for ${dateStr}`);
  assert.ok(standardStampIds.has(stamp.id), `Stamp ${stamp.id} must be in standard pool for streak=1`);
  assert.ok(
    !STREAK_MILESTONE_IDS.includes(stamp.id as any),
    `Standard day ${dateStr} must never award milestone stamp ${stamp.id}`,
  );

  // Determinism check: repeated call with identical inputs returns identical result
  const repeatStamp = getDailyStamp(dateStr, 1);
  assert.strictEqual(repeatStamp.id, stamp.id, `Determinism failure on ${dateStr}`);

  hitCounts.set(stamp.id, (hitCounts.get(stamp.id) ?? 0) + 1);
}

// Verify distribution coverage: all 23 standard stamps should be visited over 365 days
let zeroHits = 0;
for (const [id, count] of hitCounts.entries()) {
  if (count === 0) zeroHits++;
  assert.ok(count > 0, `Standard stamp '${id}' was never awarded in 365 days of 2026`);
}
assert.strictEqual(zeroHits, 0, 'Every standard stamp must appear at least once in 365 days');
const minHits = Math.min(...hitCounts.values());
const maxHits = Math.max(...hitCounts.values());
console.log(
  `✓ 1.3: 365-day rotation visits all ${standardStamps.length} standard stamps (min=${minHits}, max=${maxHits}, expected avg=${(year2026Days / standardStamps.length).toFixed(1)}).`,
);

// 1.4 Leap year February 29 handling
const leapDays = ['2020-02-29', '2024-02-29', '2028-02-29', '2032-02-29'];
for (const ld of leapDays) {
  assert.doesNotThrow(() => {
    const s = getDailyStamp(ld, 1);
    assert.ok(s && s.id && s.kanji);
  }, `Leap day ${ld} threw an exception`);
}
console.log('✓ 1.4: Leap year Feb 29 dates execute smoothly without errors.');

// =============================================================================
// TEST SUITE 2: 7-Day Streak Milestone Round-Robin & Isolation
// =============================================================================
console.log('\n--- Test Suite 2: 7-Day Streak Milestone Round-Robin & Isolation ---');

const expectedMilestoneOrder = [
  'fushimi-inari', // index 0 (Day 7)
  'kinkakuji',     // index 1 (Day 14)
  'itsukushima',   // index 2 (Day 21)
  'meiji-jingu',   // index 3 (Day 28)
  'koyasan',       // index 4 (Day 35)
];

assert.deepStrictEqual([...STREAK_MILESTONE_IDS], expectedMilestoneOrder);

// 2.1 Multiples of 7 award milestone seals in round-robin order
const testStreaks = [7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84, 91, 98, 105, 140, 210, 350, 700];
for (const streak of testStreaks) {
  const expectedIdx = Math.floor(streak / 7 - 1) % expectedMilestoneOrder.length;
  const expectedId = expectedMilestoneOrder[expectedIdx];

  const stamp = getDailyStamp('2026-11-06', streak);
  assert.strictEqual(
    stamp.id,
    expectedId,
    `Streak ${streak} expected milestone '${expectedId}', got '${stamp.id}'`,
  );
  assert.strictEqual(stamp.kind, 'goshuin', `Milestone stamp ${stamp.id} must be a goshuin seal`);
}
console.log(`✓ 2.1: Multiples of 7 verified on streaks [${testStreaks.join(', ')}] with flawless round-robin.`);

// 2.2 Non-multiples of 7 NEVER award milestone stamps
const nonMultiples = [
  0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 15, 16, 20, 22, 27, 29, 34, 36, 41, 43, 69, 71, 76, 78, 100,
];
for (const streak of nonMultiples) {
  const stamp = getDailyStamp('2026-11-06', streak);
  assert.ok(
    !STREAK_MILESTONE_IDS.includes(stamp.id as any),
    `Non-multiple streak ${streak} illegally awarded milestone stamp '${stamp.id}'`,
  );
  assert.ok(standardStampIds.has(stamp.id), `Non-multiple streak ${streak} must award standard stamp`);
}
console.log(`✓ 2.2: Non-multiples of 7 strictly isolated from milestone awards.`);

// 2.3 Negative, zero, and boundary streaks
const edgeStreaks = [-14, -7, -1, 0];
for (const streak of edgeStreaks) {
  const stamp = getDailyStamp('2026-11-06', streak);
  assert.ok(
    !STREAK_MILESTONE_IDS.includes(stamp.id as any),
    `Edge streak ${streak} illegally awarded milestone stamp '${stamp.id}'`,
  );
}
console.log('✓ 2.3: Zero and negative streaks safely handled without awarding milestones.');

// =============================================================================
// TEST SUITE 3: Travel Counters Exhaustive Pool Validation
// =============================================================================
console.log('\n--- Test Suite 3: Travel Counters Exhaustive Pool Validation ---');

// 3.1 Length requirement: >= 20 items (currently 28)
assert.ok(TRAVEL_COUNTERS.length >= 20, `Expected >= 20 travel counters, got ${TRAVEL_COUNTERS.length}`);
console.log(`✓ 3.1: Pool size verified at ${TRAVEL_COUNTERS.length} items (>= 20 threshold satisfied).`);

// 3.2 Category grouping: all 7 groups must have >= 2 items
const categoryMatchers: Record<string, (item: TravelCounterItem) => boolean> = {
  tsu: (item) => item.display.includes('つ') || item.display.includes('10'),
  nin: (item) => item.display.includes('人'),
  mai: (item) => item.display.includes('枚'),
  hon: (item) => item.display.includes('本'),
  hai: (item) => item.display.includes('杯'),
  kai: (item) => item.display.includes('階'),
  day: (item) => item.display.includes('日'),
};

const categoryCounts: Record<string, number> = {};
for (const [cat, matcher] of Object.entries(categoryMatchers)) {
  const matched = TRAVEL_COUNTERS.filter(matcher);
  categoryCounts[cat] = matched.length;
  assert.ok(
    matched.length >= 2,
    `Category '${cat}' has ${matched.length} items, which is fewer than required minimum 2!`,
  );
}
console.log(
  `✓ 3.2: All 7 categories verified with >= 2 items each: ${JSON.stringify(categoryCounts)}.`,
);

// 3.3 Pedagogical & structural validation for every item
const kanaAudioRegex = /^[\u3040-\u309F\u30A0-\u30FFー]+$/;
const seenDisplays = new Set<string>();

for (let i = 0; i < TRAVEL_COUNTERS.length; i++) {
  const item = TRAVEL_COUNTERS[i];
  
  // Non-empty display and uniqueness
  assert.ok(item.display && item.display.trim().length > 0, `Item ${i} has empty display`);
  assert.ok(!seenDisplays.has(item.display), `Duplicate display found in item ${i}: ${item.display}`);
  seenDisplays.add(item.display);

  // Kana audio validation
  assert.ok(item.audio && item.audio.trim().length > 0, `Item ${i} ('${item.display}') has empty audio`);
  assert.ok(
    kanaAudioRegex.test(item.audio),
    `Item ${i} ('${item.display}') audio '${item.audio}' contains non-kana characters`,
  );

  // Options validation: array of at least 3 distinct strings
  assert.ok(Array.isArray(item.options) && item.options.length >= 3, `Item ${i} options must have >= 3 elements`);
  const uniqueOptions = new Set(item.options);
  assert.strictEqual(
    uniqueOptions.size,
    item.options.length,
    `Item ${i} ('${item.display}') contains duplicate options: ${JSON.stringify(item.options)}`,
  );

  // Answers validation: array of at least 1 string
  assert.ok(Array.isArray(item.answers) && item.answers.length >= 1, `Item ${i} answers must have >= 1 element`);
  for (const ans of item.answers) {
    assert.ok(ans && ans.trim().length > 0, `Item ${i} ('${item.display}') has empty answer string`);
  }

  // CRITICAL: At least one correct answer MUST be present in options for multiple-choice viability!
  const hasCorrectOption = item.options.some((opt) => item.answers.includes(opt));
  assert.ok(
    hasCorrectOption,
    `Item ${i} ('${item.display}') DOES NOT CONTAIN ANY CORRECT ANSWER in options! Options: ${JSON.stringify(item.options)}, Answers: ${JSON.stringify(item.answers)}`,
  );
}
console.log('✓ 3.3: All 28 items contain valid kana audio, unique multiple-choice options, and verified correct answers.');

// =============================================================================
// TEST SUITE 4: Zustand Store completeBento State Transitions
// =============================================================================
console.log('\n--- Test Suite 4: Zustand Store completeBento State Transitions ---');

// 4.1 Reset and call completeBento with explicit stampId
useStore.getState().resetProgress();
let s = useStore.getState();
assert.strictEqual(s.bentoCount, 0);
assert.deepStrictEqual(s.unlockedStamps, {});

useStore.getState().completeBento('kinkakuji');
s = useStore.getState();
assert.strictEqual(s.bentoCount, 1);
assert.strictEqual(s.lastBentoDate, todayStr());
assert.strictEqual(s.unlockedStamps['kinkakuji'], todayStr());
console.log('✓ 4.1a: completeBento(stampId) records passed stampId in unlockedStamps.');

// Calling again with another stamp preserves prior unlocks while maintaining daily bentoCount idempotency
useStore.getState().completeBento('fushimi-inari');
s = useStore.getState();
assert.strictEqual(s.bentoCount, 1, 'Same-day completion preserves bentoCount without inflation');
assert.strictEqual(s.unlockedStamps['kinkakuji'], todayStr());
assert.strictEqual(s.unlockedStamps['fushimi-inari'], todayStr());
console.log('✓ 4.1b: Sequential completeBento calls preserve previously unlocked stamps.');

// Calling with already unlocked stamp preserves original unlock date
useStore.setState({
  unlockedStamps: { 'kinkakuji': '2026-01-01' },
});
useStore.getState().completeBento('kinkakuji');
s = useStore.getState();
assert.strictEqual(
  s.unlockedStamps['kinkakuji'],
  '2026-01-01',
  'Original unlock date must be preserved upon repeated award',
);
console.log('✓ 4.1c: Re-unlocking an existing stamp preserves the original unlock timestamp.');

// 4.2 Calling completeBento() WITHOUT stampId computes today\'s stamp
useStore.getState().resetProgress();
const t = todayStr();
const expectedFirstStampId = getDailyStamp(t, 1).id;

useStore.getState().completeBento();
s = useStore.getState();
assert.strictEqual(s.bentoCount, 1);
assert.strictEqual(s.streak, 1);
assert.strictEqual(s.lastStudy, t);
assert.ok(
  s.unlockedStamps[expectedFirstStampId],
  `Expected today's rotating stamp '${expectedFirstStampId}' to be unlocked, got: ${JSON.stringify(s.unlockedStamps)}`,
);
console.log(`✓ 4.2: completeBento() without arguments computed today's stamp '${expectedFirstStampId}'.`);

// 4.3 7-day milestone award via store: streak 6 -> 7
useStore.getState().resetProgress();
const yesterdayIso = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
useStore.setState({
  streak: 6,
  lastStudy: yesterdayIso,
});

useStore.getState().completeBento();
s = useStore.getState();
assert.strictEqual(s.streak, 7, 'Streak should bump from 6 to 7');
assert.strictEqual(s.lastStudy, t);
assert.ok(
  s.unlockedStamps['fushimi-inari'],
  `Streak 7 must award 'fushimi-inari', unlockedStamps: ${JSON.stringify(s.unlockedStamps)}`,
);
console.log('✓ 4.3: completeBento() on day 7 successfully awards 7-day milestone seal (fushimi-inari).');

// 4.4 14-day milestone award via store: streak 13 -> 14
useStore.getState().resetProgress();
useStore.setState({
  streak: 13,
  lastStudy: yesterdayIso,
});

useStore.getState().completeBento();
s = useStore.getState();
assert.strictEqual(s.streak, 14, 'Streak should bump from 13 to 14');
assert.ok(
  s.unlockedStamps['kinkakuji'],
  `Streak 14 must award 'kinkakuji', unlockedStamps: ${JSON.stringify(s.unlockedStamps)}`,
);
console.log('✓ 4.4: completeBento() on day 14 successfully awards 14-day milestone seal (kinkakuji).');

// 4.5 Store idempotency on same day: streak does not bump twice, and bentoCount does not inflate
const currentStreak = s.streak;
const currentBentoCount = s.bentoCount;
useStore.getState().completeBento();
s = useStore.getState();
assert.strictEqual(s.streak, currentStreak, 'Streak must not bump twice on same day');
assert.strictEqual(s.bentoCount, currentBentoCount, 'bentoCount must not inflate on repeat completions on same day');
console.log('✓ 4.5: Same-day repeated completeBento preserves streak and bentoCount idempotency.');

console.log('\n================================================================');
console.log('ALL CHALLENGER EMPIRICAL STRESS TESTS PASSED WITH 100% SUCCESS!');
console.log('================================================================');
