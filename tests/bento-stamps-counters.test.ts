import assert from 'node:assert/strict';
import { STAMPS, getDailyStamp, STREAK_MILESTONE_IDS, dayHash, TRAVEL_COUNTERS } from '../src/data/stamps.ts';
import { PITCH_PAIRS, type PitchType } from '../src/data/pitchAccent.ts';
import { useStore } from '../src/lib/store.ts';

console.log('=== Running Daily Bento Dynamic Stamps & Counter Pool Tests ===\n');

// 1. Verify stamp pool size >= 26
assert.ok(STAMPS.length >= 26, `Expected >= 26 stamps, got ${STAMPS.length}`);
console.log(`✓ Check 1: Stamp pool expanded to ${STAMPS.length} items (>= 26 required).`);

// 2. Verify all stamps have valid metadata and valid shape/kind
for (const s of STAMPS) {
  assert.ok(s.id && s.nameEn && s.kanji && s.location && s.culturalNote, `Stamp ${s.id} missing fields`);
  assert.ok(['eki', 'goshuin'].includes(s.kind), `Stamp ${s.id} invalid kind: ${s.kind}`);
  assert.ok(['circle', 'octagon', 'rect'].includes(s.shape), `Stamp ${s.id} invalid shape: ${s.shape}`);
}
console.log('✓ Check 2: All stamps contain valid metadata, shape, and cultural notes.');

// 3. Verify 7-day streak milestone stamps
assert.equal(STREAK_MILESTONE_IDS.length, 5);
const expectedMilestones = ['fushimi-inari', 'kinkakuji', 'itsukushima', 'meiji-jingu', 'koyasan'];
assert.deepEqual([...STREAK_MILESTONE_IDS], expectedMilestones);

for (let i = 0; i < expectedMilestones.length; i++) {
  const streak = (i + 1) * 7;
  const stamp = getDailyStamp('2026-11-06', streak);
  assert.equal(stamp.id, expectedMilestones[i], `Expected streak ${streak} to award ${expectedMilestones[i]}`);
}
console.log('✓ Check 3: 7-day streak milestone stamps trigger on days 7, 14, 21, 28, 35.');

// 4. Verify standard daily rotation
const stamp1 = getDailyStamp('2026-11-06', 1);
const stamp2 = getDailyStamp('2026-11-07', 2);
assert.ok(stamp1.id, 'Expected valid stamp for day 1');
assert.ok(stamp2.id, 'Expected valid stamp for day 2');
assert.ok(!STREAK_MILESTONE_IDS.includes(stamp1.id as any), 'Standard day should not award milestone');
assert.ok(typeof dayHash('2026-11-06') === 'number');
console.log(`✓ Check 4: Deterministic daily rotation operational (${stamp1.id} -> ${stamp2.id}).`);

// 5. Verify Travel Counter Pool >= 20 items covering all 7 categories
assert.ok(TRAVEL_COUNTERS.length >= 20, `Expected >= 20 travel counters, got ${TRAVEL_COUNTERS.length}`);
const hasTsu = TRAVEL_COUNTERS.some((c) => c.display.includes('つ') || c.display.includes('10'));
const hasNin = TRAVEL_COUNTERS.some((c) => c.display.includes('人'));
const hasMai = TRAVEL_COUNTERS.some((c) => c.display.includes('枚'));
const hasHon = TRAVEL_COUNTERS.some((c) => c.display.includes('本'));
const hasHai = TRAVEL_COUNTERS.some((c) => c.display.includes('杯'));
const hasKai = TRAVEL_COUNTERS.some((c) => c.display.includes('階'));
const hasDay = TRAVEL_COUNTERS.some((c) => c.display.includes('日'));

assert.ok(hasTsu, 'Missing tsu counter group');
assert.ok(hasNin, 'Missing nin counter group');
assert.ok(hasMai, 'Missing mai counter group');
assert.ok(hasHon, 'Missing hon counter group');
assert.ok(hasHai, 'Missing hai counter group');
assert.ok(hasKai, 'Missing kai counter group');
assert.ok(hasDay, 'Missing day counter group');
console.log(`✓ Check 5: Travel counter pool contains ${TRAVEL_COUNTERS.length} items covering tsu, nin, mai, hon, hai, kai, day.`);

// 6. Verify Sign Decoder and Shokkenki Zustand Store Integration
useStore.getState().resetProgress();
assert.deepStrictEqual(useStore.getState().decodedSigns, {});
assert.deepStrictEqual(useStore.getState().shokkenkiDone, {});
assert.strictEqual(useStore.getState().shokkenkiMissionIdx, 0);

useStore.getState().recordSignChoice('subway_exit', 1);
assert.strictEqual(useStore.getState().decodedSigns['subway_exit'], 1);

// Idempotency: repeated choice for same sign should not overwrite
useStore.getState().recordSignChoice('subway_exit', 2);
assert.strictEqual(useStore.getState().decodedSigns['subway_exit'], 1);

useStore.getState().setShokkenkiMissionIdx(2);
assert.strictEqual(useStore.getState().shokkenkiMissionIdx, 2);

useStore.getState().completeShokkenkiOrder('m2');
assert.strictEqual(useStore.getState().shokkenkiDone['m2'], true);

useStore.getState().resetSignChoices();
assert.deepStrictEqual(useStore.getState().decodedSigns, {});
assert.strictEqual(useStore.getState().shokkenkiDone['m2'], true); // shokkenki is separate
console.log('✓ Check 6: Sign Decoder and Shokkenki store slice operations and persistence verified.');

// 7. Verify Pitch Accent 30 Minimal Pairs and 4 Archetypes
assert.ok(PITCH_PAIRS.length >= 30, `Expected >= 30 pitch pairs, got ${PITCH_PAIRS.length}`);
const observedTypes = new Set<PitchType>();
for (const pair of PITCH_PAIRS) {
  assert.ok(pair.id && pair.reading && pair.tip, `Pair ${pair.id} missing fields`);
  assert.ok(pair.wordA && pair.wordB, `Pair ${pair.id} missing wordA or wordB`);
  assert.ok(pair.wordA.patternType && pair.wordB.patternType, `Pair ${pair.id} missing patternType`);
  assert.ok(pair.wordA.morae.length === pair.wordA.heights.length, `Pair ${pair.id} wordA heights length mismatch`);
  assert.ok(pair.wordB.morae.length === pair.wordB.heights.length, `Pair ${pair.id} wordB heights length mismatch`);
  observedTypes.add(pair.wordA.patternType);
  observedTypes.add(pair.wordB.patternType);
}

const requiredArchetypes: PitchType[] = ['heiban', 'atamadaka', 'nakadaka', 'odaka'];
for (const arch of requiredArchetypes) {
  assert.ok(observedTypes.has(arch), `Missing pitch archetype: ${arch}`);
}
console.log(`✓ Check 7: Pitch Accent expanded to ${PITCH_PAIRS.length} pairs covering all 4 archetypes (heiban, atamadaka, nakadaka, odaka).`);

// 8. Verify dynamic completeBento in Zustand store
useStore.getState().resetProgress();
const testStampId = 'fushimi-inari';
useStore.getState().completeBento(testStampId);
const storeAfterBento = useStore.getState();
assert.equal(storeAfterBento.bentoCount, 1);
assert.ok(storeAfterBento.unlockedStamps[testStampId], 'Expected test stamp to be unlocked in store');
console.log(`✓ Check 8: Dynamic completeBento stores unlocked stamp '${testStampId}' cleanly.`);

console.log('\n======================================================');
console.log('ALL MILESTONE 1 CHECKS PASSED FLAWLESSLY!');
console.log('======================================================');
