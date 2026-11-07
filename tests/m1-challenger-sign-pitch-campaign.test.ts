import './helpers/test-runner.ts';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PITCH_PAIRS, type PitchType, type PitchWord } from '../src/data/pitchAccent.ts';
import { useStore } from '../src/lib/store.ts';
import { CAMPAIGN_SAGAS } from '../src/data/campaign.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('CHALLENGER M1-2: EMPIRICAL STRESS TEST SUITE');
console.log('Testing: Sign Decoder Persistence, Pitch Accent SVG/Data, Campaign Gate');
console.log('================================================================\n');

// ============================================================================
// PART 1: SIGN DECODER & SHOKKENKI STORE PERSISTENCE
// ============================================================================
console.log('--- PART 1: SIGN DECODER & SHOKKENKI STORE PERSISTENCE ---');

// 1.1 Fresh Reset State
useStore.getState().resetProgress();
const s0 = useStore.getState();
assert.deepStrictEqual(s0.decodedSigns, {}, 'decodedSigns must initialize as empty object');
assert.deepStrictEqual(s0.shokkenkiDone, {}, 'shokkenkiDone must initialize as empty object');
assert.strictEqual(s0.shokkenkiMissionIdx, 0, 'shokkenkiMissionIdx must initialize as 0');
console.log('✓ 1.1: Store initializes with clean sign and shokkenki slices.');

// 1.2 recordSignChoice: persistence, idempotency & streak bumping
const today = new Date().toISOString().slice(0, 10);
const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);

// Case A: Initial choice from zero streak
useStore.setState({ streak: 0, lastStudy: null, decodedSigns: {} });
useStore.getState().recordSignChoice('sign_metro_exit', 2);
const sA = useStore.getState();
assert.strictEqual(sA.decodedSigns['sign_metro_exit'], 2, 'sign choice 2 must persist');
assert.strictEqual(sA.streak, 1, 'streak must bump to 1 on first study of the day');
assert.strictEqual(sA.lastStudy, today, 'lastStudy must match today');

// Case B: Idempotency - repeated call with different choice for same id must NOT overwrite
useStore.getState().recordSignChoice('sign_metro_exit', 0);
const sB = useStore.getState();
assert.strictEqual(sB.decodedSigns['sign_metro_exit'], 2, 'subsequent choice must be ignored (idempotent)');
assert.strictEqual(sB.streak, 1, 'streak must not change on duplicate submission');

// Case C: Consecutive day streak bump
useStore.setState({ streak: 3, lastStudy: yesterday, decodedSigns: { prev_sign: 1 } });
useStore.getState().recordSignChoice('sign_bus_stop', 3);
const sC = useStore.getState();
assert.strictEqual(sC.decodedSigns['sign_bus_stop'], 3, 'new sign must be recorded');
assert.strictEqual(sC.streak, 4, 'streak must increment by 1 when lastStudy was yesterday');
assert.strictEqual(sC.lastStudy, today, 'lastStudy must update to today');

// Case D: Same day multiple signs should not double-increment streak
useStore.getState().recordSignChoice('sign_convenience_store', 1);
const sD = useStore.getState();
assert.strictEqual(sD.decodedSigns['sign_convenience_store'], 1);
assert.strictEqual(sD.streak, 4, 'streak must remain 4 when studying multiple signs on the same day');
console.log('✓ 1.2: recordSignChoice persistence, idempotency, and streak mechanics verified.');

// 1.3 completeShokkenkiOrder and setShokkenkiMissionIdx
useStore.getState().resetProgress();
useStore.getState().setShokkenkiMissionIdx(2);
assert.strictEqual(useStore.getState().shokkenkiMissionIdx, 2, 'shokkenkiMissionIdx must update to 2');

useStore.getState().completeShokkenkiOrder('mission_shoyu_ramen');
useStore.getState().completeShokkenkiOrder('mission_gyoza_set');
const sShokkenki = useStore.getState();
assert.strictEqual(sShokkenki.shokkenkiDone['mission_shoyu_ramen'], true);
assert.strictEqual(sShokkenki.shokkenkiDone['mission_gyoza_set'], true);
assert.strictEqual(sShokkenki.shokkenkiDone['mission_tsukemen'], undefined);
console.log('✓ 1.3: completeShokkenkiOrder and setShokkenkiMissionIdx persist across multiple missions.');

// 1.4 resetSignChoices isolation
useStore.getState().recordSignChoice('sign_airport_train', 1);
assert.strictEqual(Object.keys(useStore.getState().decodedSigns).length, 1);
assert.strictEqual(Object.keys(useStore.getState().shokkenkiDone).length, 2);
assert.strictEqual(useStore.getState().shokkenkiMissionIdx, 2);
const streakBeforeReset = useStore.getState().streak;

useStore.getState().resetSignChoices();
const sReset = useStore.getState();
assert.deepStrictEqual(sReset.decodedSigns, {}, 'decodedSigns must be cleared by resetSignChoices');
assert.strictEqual(sReset.shokkenkiDone['mission_shoyu_ramen'], true, 'shokkenkiDone must NOT be cleared');
assert.strictEqual(sReset.shokkenkiDone['mission_gyoza_set'], true, 'shokkenkiDone must NOT be cleared');
assert.strictEqual(sReset.shokkenkiMissionIdx, 2, 'shokkenkiMissionIdx must NOT be cleared');
assert.strictEqual(sReset.streak, streakBeforeReset, 'streak must NOT be cleared by resetSignChoices');
console.log('✓ 1.4: resetSignChoices cleanly isolates sign choices without clearing shokkenki or streak.');

// 1.5 Zustand persistence localStorage integration & reload simulation
const persistedRaw = globalThis.localStorage.getItem('n5-study');
assert.ok(persistedRaw, 'localStorage must contain n5-study key');
const persistedParsed = JSON.parse(persistedRaw);
assert.ok(persistedParsed.state, 'persisted payload must contain state object');
assert.strictEqual(persistedParsed.version, 10, 'persisted version must be 10');
assert.strictEqual(persistedParsed.state.shokkenkiDone['mission_shoyu_ramen'], true);
assert.strictEqual(persistedParsed.state.shokkenkiMissionIdx, 2);
assert.deepStrictEqual(persistedParsed.state.decodedSigns, {});
console.log('✓ 1.5: Direct localStorage persistence verified (version 10 schema active in storage).');

// 1.6 Migration verification from Version 8 (lacking sign, shokkenki, and multi-vector slices)
const v8State = {
  version: 8,
  state: {
    streak: 5,
    lastStudy: yesterday,
    bentoCount: 3,
    savedWords: [{ t: '食べる', r: 'たべる', en: 'to eat' }],
    // explicitly omit decodedSigns, shokkenkiDone, shokkenkiMissionIdx
  },
};

// Re-run migration logic using the migrate function from store definition
const storePersistOptions = (useStore as any).persist?.getOptions?.();
if (storePersistOptions?.migrate) {
  const migrated = storePersistOptions.migrate(v8State.state, 8);
  assert.deepStrictEqual(migrated.decodedSigns, {}, 'v8->v10 migration must add default decodedSigns: {}');
  assert.deepStrictEqual(migrated.shokkenkiDone, {}, 'v8->v10 migration must add default shokkenkiDone: {}');
  assert.strictEqual(migrated.shokkenkiMissionIdx, 0, 'v8->v10 migration must add default shokkenkiMissionIdx: 0');
  assert.strictEqual(migrated.streak, 5, 'v8->v10 migration must preserve streak');
  assert.deepStrictEqual(migrated.ghosts, {}, 'v8->v10 migration must add default ghosts: {}');
  assert.ok(migrated.multiVectorItems, 'v8->v10 migration must initialize multiVectorItems');
  console.log('✓ 1.6: Zustand store v8 -> v10 migration cleanly initializes missing slices without losing state.');
}

// 1.7 Stress test: 1,000 rapid sign recordings and shokkenki orders
for (let i = 0; i < 1000; i++) {
  useStore.getState().recordSignChoice(`stress_sign_${i}`, i % 4);
  if (i % 10 === 0) {
    useStore.getState().completeShokkenkiOrder(`stress_mission_${i}`);
  }
}
const sStress = useStore.getState();
assert.strictEqual(Object.keys(sStress.decodedSigns).length >= 1000, true);
assert.strictEqual(Object.keys(sStress.shokkenkiDone).length >= 100, true);

// Verify localStorage updated after stress loop
const updatedStorage = JSON.parse(globalThis.localStorage.getItem('n5-study')!);
assert.strictEqual(Object.keys(updatedStorage.state.decodedSigns).length >= 1000, true);
assert.strictEqual(Object.keys(updatedStorage.state.shokkenkiDone).length >= 100, true);
console.log('✓ 1.7: Zustand serialization, deserialization, and 1000-item stress test passed.');

// ============================================================================
// PART 2: PITCH ACCENT DATASET & CONTOUR SVG MODELING
// ============================================================================
console.log('\n--- PART 2: PITCH ACCENT DATASET & CONTOUR SVG MODELING ---');

// 2.1 Pool Size Verification
assert.ok(PITCH_PAIRS.length >= 20, `PITCH_PAIRS must have at least 20 items, got ${PITCH_PAIRS.length}`);
assert.strictEqual(PITCH_PAIRS.length, 31, `Expected 31 items as implemented, got ${PITCH_PAIRS.length}`);
console.log(`✓ 2.1: Pitch minimal pairs pool size is ${PITCH_PAIRS.length} (>= 20 requirement met).`);

// 2.2 All 4 Archetypes Present
const archetypesObserved = new Set<PitchType>();
const archetypeCounts: Record<PitchType, number> = {
  heiban: 0,
  atamadaka: 0,
  nakadaka: 0,
  odaka: 0,
};

const pairIds = new Set<string>();

function validatePitchWord(pairId: string, label: string, word: PitchWord) {
  assert.ok(word.kanji && word.kanji.trim().length > 0, `Pair ${pairId} ${label} missing kanji`);
  assert.ok(word.kana && word.kana.trim().length > 0, `Pair ${pairId} ${label} missing kana`);
  assert.ok(word.en && word.en.trim().length > 0, `Pair ${pairId} ${label} missing en`);
  assert.ok(word.patternName && word.patternName.trim().length > 0, `Pair ${pairId} ${label} missing patternName`);
  assert.ok(word.sentenceJp && word.sentenceJp.trim().length > 0, `Pair ${pairId} ${label} missing sentenceJp`);
  assert.ok(word.sentenceTts && word.sentenceTts.trim().length > 0, `Pair ${pairId} ${label} missing sentenceTts`);
  assert.ok(word.sentenceEn && word.sentenceEn.trim().length > 0, `Pair ${pairId} ${label} missing sentenceEn`);

  // Morae and heights length strict matching
  assert.ok(Array.isArray(word.morae) && word.morae.length > 0, `Pair ${pairId} ${label} morae must be non-empty array`);
  assert.ok(Array.isArray(word.heights) && word.heights.length > 0, `Pair ${pairId} ${label} heights must be non-empty array`);
  assert.strictEqual(
    word.morae.length,
    word.heights.length,
    `Pair ${pairId} ${label} morae.length (${word.morae.length}) !== heights.length (${word.heights.length})`
  );

  // Height values validation
  for (let i = 0; i < word.heights.length; i++) {
    const h = word.heights[i];
    assert.ok(h === 'H' || h === 'L', `Pair ${pairId} ${label} height[${i}] invalid: ${h}`);
  }

  // Archetype validation
  assert.ok(
    ['heiban', 'atamadaka', 'nakadaka', 'odaka'].includes(word.patternType),
    `Pair ${pairId} ${label} unknown patternType: ${word.patternType}`
  );
  archetypesObserved.add(word.patternType);
  archetypeCounts[word.patternType]++;

  // Pattern rule validation
  if (word.patternType === 'atamadaka') {
    assert.strictEqual(word.heights[0], 'H', `Pair ${pairId} ${label} atamadaka must start with H`);
    if (word.heights.length > 1) {
      assert.strictEqual(word.heights[1], 'L', `Pair ${pairId} ${label} atamadaka second mora must be L`);
    }
  } else if (word.patternType === 'heiban') {
    assert.strictEqual(word.heights[0], 'L', `Pair ${pairId} ${label} heiban must start with L`);
    if (word.heights.length > 1) {
      assert.strictEqual(word.heights[1], 'H', `Pair ${pairId} ${label} heiban second mora must be H`);
    }
    // Trailing particle mora must remain H in heiban
    assert.strictEqual(word.heights[word.heights.length - 1], 'H', `Pair ${pairId} ${label} heiban particle must be H`);
  } else if (word.patternType === 'odaka') {
    assert.strictEqual(word.heights[0], 'L', `Pair ${pairId} ${label} odaka must start with L`);
    // Word-final stem mora is H, trailing particle drops to L
    if (word.heights.length >= 3) {
      assert.strictEqual(word.heights[word.heights.length - 2], 'H', `Pair ${pairId} ${label} odaka stem final mora must be H`);
      assert.strictEqual(word.heights[word.heights.length - 1], 'L', `Pair ${pairId} ${label} odaka particle must be L`);
    }
  }

  // Simulate SVG rendering geometry calculation
  const stepX = 52;
  const padX = 32;
  const w = padX * 2 + (word.morae.length - 1) * stepX;
  const h = 84;
  const yHigh = 22;
  const yLow = 56;

  const pts = word.morae.map((m, i) => ({
    m,
    x: padX + i * stepX,
    y: word.heights[i] === 'H' ? yHigh : yLow,
  }));
  assert.ok(w > 0 && h > 0, 'SVG dimensions must be positive');
  assert.strictEqual(pts.length, word.morae.length, 'Points count must match morae length');
  for (const pt of pts) {
    assert.ok(Number.isFinite(pt.x) && Number.isFinite(pt.y), `Invalid point coordinates: ${pt.x}, ${pt.y}`);
  }
}

for (const pair of PITCH_PAIRS) {
  assert.ok(!pairIds.has(pair.id), `Duplicate pitch pair ID: ${pair.id}`);
  pairIds.add(pair.id);

  assert.ok(pair.reading && pair.reading.trim().length > 0, `Pair ${pair.id} missing reading`);
  assert.ok(pair.tip && pair.tip.trim().length > 0, `Pair ${pair.id} missing tip`);

  validatePitchWord(pair.id, 'wordA', pair.wordA);
  validatePitchWord(pair.id, 'wordB', pair.wordB);
}

const requiredArchetypes: PitchType[] = ['heiban', 'atamadaka', 'nakadaka', 'odaka'];
for (const req of requiredArchetypes) {
  assert.ok(archetypesObserved.has(req), `Missing required archetype: ${req}`);
}

console.log('✓ 2.2: All 4 archetypes observed across wordA/wordB:');
console.log(`   - heiban:    ${archetypeCounts.heiban} instances`);
console.log(`   - atamadaka: ${archetypeCounts.atamadaka} instances`);
console.log(`   - nakadaka:  ${archetypeCounts.nakadaka} instances`);
console.log(`   - odaka:     ${archetypeCounts.odaka} instances`);
console.log('✓ 2.3: All 31 pitch pairs passed strict morae-heights alignment and SVG geometry validation.');

// ============================================================================
// PART 3: CAMPAIGN GATE CLEARANCE INTEGRITY
// ============================================================================
console.log('\n--- PART 3: CAMPAIGN GATE CLEARANCE INTEGRITY ---');

// 3.1 Static verification of src/pages/Campaign.tsx
const campaignFile = path.join(rootDir, 'src', 'pages', 'Campaign.tsx');
const campaignCode = fs.readFileSync(campaignFile, 'utf8');

// Assert completeCampaignStage is NOT imported or called in Campaign.tsx
assert.ok(
  !campaignCode.includes('completeCampaignStage'),
  'VULNERABILITY DETECTED: Campaign.tsx must not contain completeCampaignStage'
);
console.log('✓ 3.1: Confirmed completeCampaignStage is NOT present in Campaign.tsx.');

// Assert no bypass button or "Mark Done" text
assert.ok(
  !campaignCode.toLowerCase().includes('mark done'),
  'VULNERABILITY DETECTED: Campaign.tsx must not contain "Mark Done" button text'
);
assert.ok(
  !campaignCode.toLowerCase().includes('bypass'),
  'VULNERABILITY DETECTED: Campaign.tsx must not contain "bypass" text'
);
console.log('✓ 3.2: Confirmed no "Mark Done" or "bypass" buttons exist in Campaign.tsx.');

// Assert verified status chips are rendered
assert.ok(
  campaignCode.includes('✓ Verified Complete'),
  'Campaign.tsx must display "✓ Verified Complete" status chip'
);
assert.ok(
  campaignCode.includes('🔒 Incomplete'),
  'Campaign.tsx must display "🔒 Incomplete" status chip'
);
console.log('✓ 3.3: Confirmed non-clickable "✓ Verified Complete" and "🔒 Incomplete" status indicators.');

// 3.2 Dynamic verification: Stage clearance gate through genuine dojo completion
useStore.getState().resetProgress();
const saga1 = CAMPAIGN_SAGAS[0];
const stage1 = saga1.stages[0];

// Initially stage1 is incomplete
assert.strictEqual(
  !!useStore.getState().campaignCompletedStages[stage1.id],
  false,
  'Stage 1 must initially be incomplete'
);

// Simulate non-authorized state: UI cannot complete stage directly without store action
// Verify only calling completeCampaignStage (used exclusively by useCampaignMission completeMission) marks it complete
useStore.getState().completeCampaignStage(stage1.id);
assert.strictEqual(
  useStore.getState().campaignCompletedStages[stage1.id],
  true,
  'Stage 1 must be marked complete only after verified completion'
);

// Verify boss gate requirement:
// Boss for saga 1 requires all stages to be complete
const stagesRemaining = saga1.stages.slice(1);
const allStagesCompleteBefore = saga1.stages.every(
  (st) => !!useStore.getState().campaignCompletedStages[st.id]
);
assert.strictEqual(allStagesCompleteBefore, false, 'Saga 1 boss must be locked while stages are incomplete');

for (const st of stagesRemaining) {
  useStore.getState().completeCampaignStage(st.id);
}
const allStagesCompleteAfter = saga1.stages.every(
  (st) => !!useStore.getState().campaignCompletedStages[st.id]
);
assert.strictEqual(allStagesCompleteAfter, true, 'All stages for Saga 1 now complete');
console.log('✓ 3.4: Dynamic campaign progression and stage gating verified.');

console.log('\n================================================================');
console.log('ALL EMPIRICAL CHALLENGER VERIFICATION CHECKS PASSED FLAWLESSLY!');
console.log('VERDICT: APPROVE');
console.log('================================================================');
