import assert from 'node:assert/strict';
import {
  useStore,
  MEMORY_VECTORS,
} from '../src/lib/store.ts';
import {
  SECTION_STAGE_META,
  getStageDurationSec,
  calculateRadarMetrics,
  type ExamStage,
} from '../src/lib/examStage.ts';
import type { GeneratedExamQuestion } from '../src/lib/jlptGenerator.ts';

console.log('======================================================================');
console.log('🧪 TESTING PHASE 4: ADAPTIVE SYSTEMS & EXAM SIMULATION');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// Test 1: Decoupled Multi-Vector FSRS Data Model
// -----------------------------------------------------------------------------
console.log('[Test 1] Testing Decoupled Multi-Vector FSRS data model...');
assert.equal(MEMORY_VECTORS.length, 4, 'Must have exactly 4 memory vectors');
assert.deepEqual(
  MEMORY_VECTORS,
  ['meaning', 'reading', 'production', 'audio'],
  'Vectors must match meaning, reading, production, audio'
);

const store = useStore.getState();
assert.ok(typeof store.recordVectorReview === 'function', 'store has recordVectorReview');
assert.ok(typeof store.addMultiVectorCard === 'function', 'store has addMultiVectorCard');
assert.ok(typeof store.getDueVectorQueue === 'function', 'store has getDueVectorQueue');
assert.ok(typeof store.getVectorRetentionMetrics === 'function', 'store has getVectorRetentionMetrics');

// Test adding a multi-vector card
store.addMultiVectorCard({
  id: 'mv:mizu',
  kind: 'word',
  front: '水',
  reading: 'みず',
  meaning: 'water',
});

const mizu = useStore.getState().multiVectorItems['mv:mizu'];
assert.ok(mizu, 'Multi-vector item added to store');
assert.ok(mizu.vectors.meaning, 'meaning vector initialized');
assert.ok(mizu.vectors.reading, 'reading vector initialized');
assert.ok(mizu.vectors.production, 'production vector initialized');
assert.ok(mizu.vectors.audio, 'audio vector initialized');

// Test reviewing meaning vector
store.recordVectorReview('mv:mizu', 'meaning', 3);
const mizuAfterReview = useStore.getState().multiVectorItems['mv:mizu'];
assert.ok(mizuAfterReview.vectors.meaning.reps >= 1, 'reps incremented on meaning vector');
assert.equal(mizuAfterReview.vectors.reading.reps, 0, 'reading vector unchanged');
console.log('✓ Test 1 PASSED: Multi-Vector FSRS data models and methods verified.\n');

// -----------------------------------------------------------------------------
// Test 2: Isolated Ghost Review Queue (4h -> 12h -> 24h & 3-Win Evaporation)
// -----------------------------------------------------------------------------
console.log('[Test 2] Testing Isolated Ghost Review Queue lifecycle...');
const _initialGhostCount = Object.keys(useStore.getState().ghosts).length;

// Spawn ghost
useStore.getState().spawnGhost('w:taberu', 'meaning', '食べる', 'to eat');
const spawnedGhost = useStore.getState().ghosts['ghost:w:taberu:meaning'];
assert.ok(spawnedGhost, 'Ghost card successfully spawned');
assert.equal(spawnedGhost.stage, 1, 'Initial ghost stage is 1 (4h)');
assert.equal(spawnedGhost.consecutiveSuccesses, 0, 'Initial consecutive successes is 0');

// Win 1: stage 1 -> stage 2 (12h)
useStore.getState().reviewGhost('ghost:w:taberu:meaning', true);
const ghostAfterWin1 = useStore.getState().ghosts['ghost:w:taberu:meaning'];
assert.ok(ghostAfterWin1, 'Ghost persists after win 1');
assert.equal(ghostAfterWin1.stage, 2, 'Stage advanced to 2');
assert.equal(ghostAfterWin1.consecutiveSuccesses, 1, 'Consecutive successes is 1');

// Win 2: stage 2 -> stage 3 (24h)
useStore.getState().reviewGhost('ghost:w:taberu:meaning', true);
const ghostAfterWin2 = useStore.getState().ghosts['ghost:w:taberu:meaning'];
assert.ok(ghostAfterWin2, 'Ghost persists after win 2');
assert.equal(ghostAfterWin2.stage, 3, 'Stage advanced to 3');
assert.equal(ghostAfterWin2.consecutiveSuccesses, 2, 'Consecutive successes is 2');

// Win 3: Evaporation!
useStore.getState().reviewGhost('ghost:w:taberu:meaning', true);
const ghostAfterWin3 = useStore.getState().ghosts['ghost:w:taberu:meaning'];
assert.equal(ghostAfterWin3, undefined, 'Ghost successfully evaporated after 3 consecutive wins!');

// Failure reset test
useStore.getState().spawnGhost('w:nomu', 'reading', '飲む', 'のむ');
useStore.getState().reviewGhost('ghost:w:nomu:reading', true); // Win 1 (stage 2)
useStore.getState().reviewGhost('ghost:w:nomu:reading', false); // Miss! -> Reset to stage 1 and 0 successes
const ghostAfterMiss = useStore.getState().ghosts['ghost:w:nomu:reading'];
assert.equal(ghostAfterMiss.stage, 1, 'Stage reset to 1 after miss');
assert.equal(ghostAfterMiss.consecutiveSuccesses, 0, 'Consecutive successes reset to 0');
useStore.getState().evaporateGhost('ghost:w:nomu:reading');
assert.equal(useStore.getState().ghosts['ghost:w:nomu:reading'], undefined, 'Manual evaporate clean');

console.log('✓ Test 2 PASSED: Ghost queue 4h -> 12h -> 24h stages and 3-win evaporation verified.\n');

// -----------------------------------------------------------------------------
// Test 3: JLPT Exam Stage Metadata and Section Timers
// -----------------------------------------------------------------------------
console.log('[Test 3] Testing JLPT Exam Stage Metadata and Timers...');
const stages: ExamStage[] = [
  'section_1',
  'intermission_1',
  'section_2',
  'intermission_2',
  'section_3',
];

for (const st of stages) {
  assert.ok(SECTION_STAGE_META[st], `Metadata exists for stage ${st}`);
  assert.ok(SECTION_STAGE_META[st].nameJp.length > 0, `Japanese title exists for ${st}`);
  assert.ok(SECTION_STAGE_META[st].nameEn.length > 0, `English title exists for ${st}`);
}

// Mini mode timings
assert.equal(getStageDurationSec('section_1', 'N5', 'mini'), 300, 'Mini section 1 is 5 minutes');
assert.equal(getStageDurationSec('section_2', 'N5', 'mini'), 360, 'Mini section 2 is 6 minutes');
assert.equal(getStageDurationSec('section_3', 'N5', 'mini'), 240, 'Mini section 3 is 4 minutes');

// Full N5 mode timings
assert.equal(getStageDurationSec('section_1', 'N5', 'full'), 20 * 60, 'Full N5 section 1 is 20 min');
assert.equal(getStageDurationSec('section_2', 'N5', 'full'), 40 * 60, 'Full N5 section 2 is 40 min');
assert.equal(getStageDurationSec('section_3', 'N5', 'full'), 30 * 60, 'Full N5 section 3 is 30 min');

// Full N4 mode timings
assert.equal(getStageDurationSec('section_1', 'N4', 'full'), 25 * 60, 'Full N4 section 1 is 25 min');
assert.equal(getStageDurationSec('section_2', 'N4', 'full'), 55 * 60, 'Full N4 section 2 is 55 min');
assert.equal(getStageDurationSec('section_3', 'N4', 'full'), 35 * 60, 'Full N4 section 3 is 35 min');

console.log('✓ Test 3 PASSED: Official JLPT Exam Stage sections and timers verified.\n');

// -----------------------------------------------------------------------------
// Test 4: 6-Axis Hexagonal Diagnostic Radar Calculation
// -----------------------------------------------------------------------------
console.log('[Test 4] Testing 6-Axis Diagnostic Radar Metrics calculation...');
const mockQuestions: GeneratedExamQuestion[] = [
  { id: 'q1', section: 'vocab', mondaiId: 'V1', mondaiTitle: '漢字読み', prompt: '【山】', options: ['やま', 'かわ', 'うみ'], answer: 0, explanation: '' },
  { id: 'q2', section: 'vocab', mondaiId: 'V3', mondaiTitle: '文脈規定', prompt: '朝ご飯を【食べた】', options: ['食べた', '飲んだ'], answer: 0, explanation: '' },
  { id: 'q3', section: 'grammar', mondaiId: 'G1', mondaiTitle: '文法形式', prompt: '学校【に】行く', options: ['に', 'を'], answer: 0, explanation: '' },
  { id: 'q4', section: 'grammar', mondaiId: 'R1', mondaiTitle: '内容理解（短文）', prompt: 'メモを読んで…', options: ['A', 'B'], answer: 0, explanation: '' },
  { id: 'q5', section: 'grammar', mondaiId: 'R3', mondaiTitle: '情報検索', prompt: 'チラシを見て…', options: ['A', 'B'], answer: 0, explanation: '' },
  { id: 'q6', section: 'listening', mondaiId: 'L1', mondaiTitle: '課題理解', prompt: '男の人と女の人が…', options: ['1', '2'], answer: 0, explanation: '' },
];

const mockAnswersAllCorrect: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
const metrics100 = calculateRadarMetrics(mockQuestions, mockAnswersAllCorrect);

assert.equal(metrics100.kanjiOrthography, 100, 'Kanji orthography is 100%');
assert.equal(metrics100.vocabContext, 100, 'Vocab context is 100%');
assert.equal(metrics100.grammarStructure, 100, 'Grammar structure is 100%');
assert.equal(metrics100.readingComprehension, 100, 'Reading comprehension is 100%');
assert.equal(metrics100.infoRetrieval, 100, 'Info retrieval is 100%');
assert.equal(metrics100.listeningResponse, 100, 'Listening response is 100%');

const mockAnswersHalf: Record<number, number> = { 0: 0, 1: 1 /* wrong */, 2: 0, 3: 1 /* wrong */, 4: 0, 5: 1 /* wrong */ };
const metricsMixed = calculateRadarMetrics(mockQuestions, mockAnswersHalf);
assert.equal(metricsMixed.kanjiOrthography, 100);
assert.equal(metricsMixed.vocabContext, 0);
assert.equal(metricsMixed.grammarStructure, 100);
assert.equal(metricsMixed.readingComprehension, 0);
assert.equal(metricsMixed.infoRetrieval, 100);
assert.equal(metricsMixed.listeningResponse, 0);

console.log('✓ Test 4 PASSED: 6-Axis diagnostic radar chart correctly partitions metrics.\n');

console.log('======================================================================');
console.log('🎉 ALL PHASE 4 ADAPTIVE & EXAM SIMULATOR TESTS PASSED (100%)!');
console.log('======================================================================');
