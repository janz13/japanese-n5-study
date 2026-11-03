/**
 * Adversarial Empirical Verification Suite: Dojo Scoping & Prompt Pools
 * Milestone 3 Challenger 1
 * 
 * Verifies with 1,000-sample empirical stress tests:
 * 1. For s1-1: 1,000 sampled prompts in campaign mode. Exactly 100% in あいうえお. 0% outside.
 * 2. For s1-2: 1,000 sampled prompts in campaign mode. Exactly 100% target 一二三四五. 0% outside.
 * 3. Standalone mode: 1,000 sampled prompts span all rows and levels.
 * 4. Boundary cases: malformed mission IDs (?mission=nonexistent, ?mission=undefined, ?mission=null, ?stage=s1-1).
 */

import assert from 'node:assert/strict';
import { getCampaignStage, type CampaignStage, type CampaignSaga } from '../src/data/campaign.ts';
import { HIRAGANA, KATAKANA, ROWS, BASIC_ROWS, type Kana } from '../src/data/kana.ts';
import { KANJI, type Kanji } from '../src/data/kanji.ts';
import { toHiragana } from 'wanakana';

console.log('========================================================================');
console.log('🧪 ADVERSARIAL STRESS TEST: DOJO SCOPING & PROMPT POOLS (M3 CHALLENGER 1)');
console.log('========================================================================\n');

// ----------------------------------------------------------------------------
// HELPER: Emulate useCampaignMission resolution logic exactly as in src/lib/useCampaignMission.ts
// ----------------------------------------------------------------------------
interface ResolvedMissionContext {
  isCampaignMode: boolean;
  stageId: string | null;
  stage: CampaignStage | null;
  saga: CampaignSaga | null;
  targetItems: string[] | null;
  targetScript?: 'hiragana' | 'katakana' | 'both';
  targetCategory?: string;
  targetTab?: string;
}

function resolveCampaignMissionParams(queryString: string): ResolvedMissionContext {
  const searchParams = new URLSearchParams(queryString.startsWith('?') ? queryString : `?${queryString}`);
  const stageId = searchParams.get('mission') || searchParams.get('stage') || null;

  const stageInfo = stageId ? getCampaignStage(stageId) : null;
  const isCampaignMode = Boolean(stageInfo);
  const stage = stageInfo?.stage ?? null;
  const saga = stageInfo?.saga ?? null;
  const targetItems = stage?.targetItems ?? null;
  const targetScript = stage?.targetScript;
  const targetCategory = stage?.targetCategory;
  const targetTab = stage?.targetTab;

  return {
    isCampaignMode,
    stageId,
    stage,
    saga,
    targetItems,
    targetScript,
    targetCategory,
    targetTab,
  };
}

// ----------------------------------------------------------------------------
// HELPER: Emulate Kana Dojo pool generation and pick() exactly as in src/pages/KanaDojo.tsx
// ----------------------------------------------------------------------------
function buildKanaPool(
  ctx: ResolvedMissionContext,
  userScript: 'hiragana' | 'katakana' | 'both' = 'hiragana',
  userRows: string[] = ROWS
): Kana[] {
  const { isCampaignMode, targetItems, targetScript } = ctx;
  if (isCampaignMode && targetItems && targetItems.length > 0) {
    const cleanTargets = targetItems.map((t) => t.trim());
    const effectiveScript = targetScript ?? userScript;
    const src = effectiveScript === 'katakana' ? KATAKANA : effectiveScript === 'hiragana' ? HIRAGANA : [...HIRAGANA, ...KATAKANA];
    return src.filter((k) => cleanTargets.includes(k.kana));
  }
  const src = userScript === 'hiragana' ? HIRAGANA : userScript === 'katakana' ? KATAKANA : [...HIRAGANA, ...KATAKANA];
  return src.filter((k) => userRows.includes(k.row));
}

function pickKana(
  pool: Kana[],
  stats: Record<string, { correct: number; wrong: number }>,
  last?: Kana | null
): Kana {
  if (pool.length === 0) throw new Error('Cannot pick from empty Kana pool');
  const weights = pool.map((k) => {
    const s = stats[k.kana] ?? { correct: 0, wrong: 0 };
    return k === last && pool.length > 1 ? 0 : 1 + (s.wrong * 2) / (1 + s.correct * 0.5);
  });
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) if ((r -= weights[i]) <= 0) return pool[i];
  return pool[0];
}

// ----------------------------------------------------------------------------
// HELPER: Emulate Kanji Dojo active list, pool generation, and pickNext() exactly as in src/pages/KanjiDojo.tsx
// ----------------------------------------------------------------------------
type PromptKind = 'meaning' | 'reading' | 'vocab';
type ModeFilter = 'all' | 'meaning' | 'reading' | 'vocab';
type LevelFilter = 'N5' | 'N4' | 'all';

interface DrillItem {
  id: string;
  kanjiObj: Kanji;
  kind: PromptKind;
  promptDisplay: string;
  subLabel: string;
  expectedInputType: 'en' | 'kana';
  acceptableAnswers: string[];
  displayAnswer: string;
  ttsAudio: string;
}

function buildKanjiActiveList(
  ctx: ResolvedMissionContext,
  level: LevelFilter = 'N5',
  batchRange: number = 20
): Kanji[] {
  const { isCampaignMode, targetItems } = ctx;
  if (isCampaignMode && targetItems && targetItems.length > 0) {
    const cleanTargets = targetItems.map((t) => t.trim());
    return KANJI.filter((k) => cleanTargets.includes(k.k));
  }
  let list = KANJI;
  if (level !== 'all') list = list.filter((k) => k.level === level);
  if (batchRange < list.length) list = list.slice(0, batchRange);
  return list;
}

function buildKanjiDrillPool(activeKanjiList: Kanji[], modeFilter: ModeFilter = 'all'): DrillItem[] {
  const items: DrillItem[] = [];
  for (const kj of activeKanjiList) {
    // 1. Meaning
    if (modeFilter === 'all' || modeFilter === 'meaning') {
      const meanings = kj.meaning.split(',').map((s) => s.trim().toLowerCase());
      items.push({
        id: `m:${kj.k}`,
        kanjiObj: kj,
        kind: 'meaning',
        promptDisplay: kj.k,
        subLabel: 'Kanji Meaning (English)',
        expectedInputType: 'en',
        acceptableAnswers: meanings,
        displayAnswer: kj.meaning,
        ttsAudio: kj.sound,
      });
    }

    // 2. Reading
    if (modeFilter === 'all' || modeFilter === 'reading') {
      const onParts = kj.on.split('、').map((s) => toHiragana(s.trim()));
      const kunClean = kj.kun.replace(/[()（）-]/g, '').split('、').map((s) => toHiragana(s.trim()));
      items.push({
        id: `r:${kj.k}`,
        kanjiObj: kj,
        kind: 'reading',
        promptDisplay: kj.k,
        subLabel: `Reading · 音: ${kj.on} · 訓: ${kj.kun}`,
        expectedInputType: 'kana',
        acceptableAnswers: [...onParts, ...kunClean],
        displayAnswer: `${kj.on} / ${kj.kun}`,
        ttsAudio: kj.sound,
      });
    }

    // 3. Vocab
    if (modeFilter === 'all' || modeFilter === 'vocab') {
      items.push({
        id: `v:${kj.k}`,
        kanjiObj: kj,
        kind: 'vocab',
        promptDisplay: kj.ex.w,
        subLabel: `Vocabulary Reading for ${kj.k} (${kj.ex.en})`,
        expectedInputType: 'kana',
        acceptableAnswers: [toHiragana(kj.ex.r)],
        displayAnswer: `${kj.ex.w}【${kj.ex.r}】= ${kj.ex.en}`,
        ttsAudio: kj.ex.r,
      });
    }
  }
  return items;
}

function pickNextKanji(pool: DrillItem[], last?: DrillItem | null): DrillItem {
  if (pool.length === 0) throw new Error('Cannot pick from empty Kanji pool');
  const candidates = pool.length > 1 && last ? pool.filter((x) => x.id !== last.id) : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ----------------------------------------------------------------------------
// SUITE 1: BOUNDARY & QUERY PARAMETER RESOLUTION
// ----------------------------------------------------------------------------
console.log('[Suite 1] Testing Query Parameter & Boundary Resolution...');

// 1.1 Standard ?mission=s1-1
{
  const ctx = resolveCampaignMissionParams('?mission=s1-1');
  assert.strictEqual(ctx.isCampaignMode, true, 's1-1 must activate campaign mode');
  assert.strictEqual(ctx.stageId, 's1-1');
  assert.deepStrictEqual(ctx.targetItems, ['あ', 'い', 'う', 'え', 'お']);
  assert.strictEqual(ctx.targetScript, 'hiragana');
  console.log('  ✓ 1.1 ?mission=s1-1 correctly resolved');
}

// 1.2 Query param alias: ?stage=s1-1
{
  const ctx = resolveCampaignMissionParams('?stage=s1-1');
  assert.strictEqual(ctx.isCampaignMode, true, '?stage=s1-1 must activate campaign mode');
  assert.strictEqual(ctx.stageId, 's1-1');
  assert.deepStrictEqual(ctx.targetItems, ['あ', 'い', 'う', 'え', 'お']);
  console.log('  ✓ 1.2 Query param alias ?stage=s1-1 correctly resolved');
}

// 1.3 Query param alias: ?stage=s1-2
{
  const ctx = resolveCampaignMissionParams('?stage=s1-2');
  assert.strictEqual(ctx.isCampaignMode, true, '?stage=s1-2 must activate campaign mode');
  assert.strictEqual(ctx.stageId, 's1-2');
  assert.deepStrictEqual(ctx.targetItems, ['一', '二', '三', '四', '五']);
  console.log('  ✓ 1.3 Query param alias ?stage=s1-2 correctly resolved');
}

// 1.4 Precedence: ?mission=s1-1&stage=s1-2 (mission must win)
{
  const ctx = resolveCampaignMissionParams('?mission=s1-1&stage=s1-2');
  assert.strictEqual(ctx.stageId, 's1-1', 'mission param must take precedence over stage');
  assert.deepStrictEqual(ctx.targetItems, ['あ', 'い', 'う', 'え', 'お']);
  console.log('  ✓ 1.4 ?mission takes precedence over ?stage');
}

// 1.5 Malformed: ?mission=nonexistent
{
  const ctx = resolveCampaignMissionParams('?mission=nonexistent');
  assert.strictEqual(ctx.isCampaignMode, false, 'Nonexistent mission must NOT be in campaign mode');
  assert.strictEqual(ctx.stage, null);
  assert.strictEqual(ctx.targetItems, null);
  console.log('  ✓ 1.5 Malformed ?mission=nonexistent falls back to standalone');
}

// 1.6 Malformed: ?mission=undefined
{
  const ctx = resolveCampaignMissionParams('?mission=undefined');
  assert.strictEqual(ctx.isCampaignMode, false, 'Literal undefined mission must NOT be in campaign mode');
  assert.strictEqual(ctx.stage, null);
  assert.strictEqual(ctx.targetItems, null);
  console.log('  ✓ 1.6 Malformed ?mission=undefined falls back to standalone');
}

// 1.7 Malformed: ?mission=null
{
  const ctx = resolveCampaignMissionParams('?mission=null');
  assert.strictEqual(ctx.isCampaignMode, false, 'Literal null mission must NOT be in campaign mode');
  assert.strictEqual(ctx.stage, null);
  assert.strictEqual(ctx.targetItems, null);
  console.log('  ✓ 1.7 Malformed ?mission=null falls back to standalone');
}

// 1.8 Malformed: ?mission= (empty)
{
  const ctx = resolveCampaignMissionParams('?mission=');
  assert.strictEqual(ctx.isCampaignMode, false, 'Empty mission must NOT be in campaign mode');
  assert.strictEqual(ctx.stage, null);
  assert.strictEqual(ctx.targetItems, null);
  console.log('  ✓ 1.8 Empty ?mission= falls back to standalone');
}

// 1.9 Malformed alias: ?stage=nonexistent, ?stage=undefined, ?stage=null
{
  for (const bad of ['nonexistent', 'undefined', 'null', '']) {
    const ctx = resolveCampaignMissionParams(`?stage=${bad}`);
    assert.strictEqual(ctx.isCampaignMode, false, `Bad stage ${bad} must fall back`);
  }
  console.log('  ✓ 1.9 Malformed ?stage= aliases all fall back safely to standalone');
}

// 1.10 No query params
{
  const ctx = resolveCampaignMissionParams('');
  assert.strictEqual(ctx.isCampaignMode, false, 'No search params must be standalone');
  assert.strictEqual(ctx.stageId, null);
  assert.strictEqual(ctx.targetItems, null);
  console.log('  ✓ 1.10 Bare route correctly defaults to standalone mode');
}

console.log('✓ Suite 1 PASSED: All boundary & query parameter tests succeeded.\n');

// ----------------------------------------------------------------------------
// SUITE 2: KANA DOJO CAMPAIGN SCOPING (s1-1) — 1,000 PROMPTS STRESS TEST
// ----------------------------------------------------------------------------
console.log('[Suite 2] Stress-Testing Kana Dojo s1-1 (1,000 Prompts Sample)...');

const ALLOWED_KANA_S1_1 = new Set(['あ', 'い', 'う', 'え', 'お']);
const SAMPLE_COUNT = 1000;

// 2.1 Verify Pool Size and Content
const ctx_s1_1 = resolveCampaignMissionParams('?mission=s1-1');
const pool_s1_1 = buildKanaPool(ctx_s1_1);
assert.strictEqual(pool_s1_1.length, 5, `s1-1 pool must have exactly 5 items, got ${pool_s1_1.length}`);
for (const k of pool_s1_1) {
  assert.ok(ALLOWED_KANA_S1_1.has(k.kana), `Pool item "${k.kana}" must be in [あ, い, う, え, お]`);
}
console.log(`  ✓ 2.1 Pool strictly created with 5 items: ${pool_s1_1.map((k) => k.kana).join(', ')}`);

// 2.2 1,000 Samples with Uniform Stats (Fresh User)
{
  const counts: Record<string, number> = { 'あ': 0, 'い': 0, 'う': 0, 'え': 0, 'お': 0 };
  let foreignCharacters = 0;
  let consecutiveDuplicates = 0;
  let lastPicked: Kana | null = null;
  const emptyStats: Record<string, { correct: number; wrong: number }> = {};

  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const picked = pickKana(pool_s1_1, emptyStats, lastPicked);

    // Assert: must be in あいうえお
    if (!ALLOWED_KANA_S1_1.has(picked.kana)) {
      foreignCharacters++;
    } else {
      counts[picked.kana]++;
    }

    // Check consecutive duplicate prevention
    if (lastPicked && picked.kana === lastPicked.kana) {
      consecutiveDuplicates++;
    }

    lastPicked = picked;
  }

  console.log('  Prompt distribution across 1,000 samples (uniform stats):', counts);
  assert.strictEqual(foreignCharacters, 0, `CRITICAL VIOLATION: Found ${foreignCharacters} characters outside あいうえお!`);
  assert.strictEqual(consecutiveDuplicates, 0, `Pick algorithm must avoid repeating previous character when pool > 1`);

  // Verify all 5 characters were picked healthy number of times (expected ~200 each, range [100, 300])
  for (const ch of ['あ', 'い', 'う', 'え', 'お']) {
    assert.ok(counts[ch] >= 100, `Character ${ch} was starved! Only appeared ${counts[ch]} times in 1,000 picks`);
    assert.ok(counts[ch] <= 300, `Character ${ch} over-represented (${counts[ch]} times)`);
  }
  console.log('  ✓ 2.2 100% of 1,000 prompts strictly within あいうえお (0 foreign, balanced distribution)');
}

// 2.3 1,000 Samples with Biased Stats (User Struggling on 'あ' and mastering 'い')
{
  const biasedStats: Record<string, { correct: number; wrong: number }> = {
    'あ': { correct: 0, wrong: 25 }, // very high error rate -> weight ~ 51
    'い': { correct: 40, wrong: 0 }, // high mastery -> weight ~ 1 / 21 = 0.047
    'う': { correct: 5, wrong: 2 },
    'え': { correct: 5, wrong: 2 },
    'お': { correct: 5, wrong: 2 },
  };

  const biasedCounts: Record<string, number> = { 'あ': 0, 'い': 0, 'う': 0, 'え': 0, 'お': 0 };
  let foreignCharacters = 0;
  let lastPicked: Kana | null = null;

  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const picked = pickKana(pool_s1_1, biasedStats, lastPicked);
    if (!ALLOWED_KANA_S1_1.has(picked.kana)) {
      foreignCharacters++;
    } else {
      biasedCounts[picked.kana]++;
    }
    lastPicked = picked;
  }

  console.log('  Prompt distribution across 1,000 samples (biased stats):', biasedCounts);
  assert.strictEqual(foreignCharacters, 0, `CRITICAL VIOLATION: Foreign characters under biased stats!`);
  assert.ok(biasedCounts['あ'] > biasedCounts['い'], `Struggled character "あ" (${biasedCounts['あ']}) must appear far more often than mastered "い" (${biasedCounts['い']})`);
  console.log('  ✓ 2.3 Biased stats preserve 100% scoping while correctly weighting missed characters');
}

// 2.4 Verify with query alias ?stage=s1-1
{
  const ctx_alias = resolveCampaignMissionParams('?stage=s1-1');
  const pool_alias = buildKanaPool(ctx_alias);
  assert.strictEqual(pool_alias.length, 5);
  for (let i = 0; i < 200; i++) {
    const picked = pickKana(pool_alias, {});
    assert.ok(ALLOWED_KANA_S1_1.has(picked.kana), `Alias ?stage=s1-1 produced unallowed character ${picked.kana}`);
  }
  console.log('  ✓ 2.4 Query param alias ?stage=s1-1 maintains 100% strict scoping');
}

// 2.5 Resilient Whitespace Handling in targetItems
{
  const dirtyCtx: ResolvedMissionContext = {
    ...ctx_s1_1,
    targetItems: [' あ ', 'い\t', '\nう', 'え ', ' お '],
  };
  const dirtyPool = buildKanaPool(dirtyCtx);
  assert.strictEqual(dirtyPool.length, 5);
  const chars = dirtyPool.map((k) => k.kana).sort();
  assert.deepStrictEqual(chars, ['あ', 'い', 'う', 'え', 'お']);
  console.log('  ✓ 2.5 Surrounding whitespace trimmed cleanly without dropping items');
}

console.log('✓ Suite 2 PASSED: Kana Dojo s1-1 strictly verified across 1,000+ empirical samples.\n');

// ----------------------------------------------------------------------------
// SUITE 3: KANJI DOJO CAMPAIGN SCOPING (s1-2) — 1,000 PROMPTS STRESS TEST
// ----------------------------------------------------------------------------
console.log('[Suite 3] Stress-Testing Kanji Dojo s1-2 (1,000 Prompts Sample)...');

const ALLOWED_KANJI_S1_2 = new Set(['一', '二', '三', '四', '五']);
const ctx_s1_2 = resolveCampaignMissionParams('?mission=s1-2');

// 3.1 Verify Active Kanji List
const activeList_s1_2 = buildKanjiActiveList(ctx_s1_2);
assert.strictEqual(activeList_s1_2.length, 5, `s1-2 activeKanjiList must have exactly 5 items, got ${activeList_s1_2.length}`);
for (const k of activeList_s1_2) {
  assert.ok(ALLOWED_KANJI_S1_2.has(k.k), `Active kanji "${k.k}" must be in [一, 二, 三, 四, 五]`);
}
console.log(`  ✓ 3.1 Active Kanji list strictly created with 5 numbers: ${activeList_s1_2.map((k) => k.k).join(', ')}`);

// 3.2 Verify Drill Pool Generation in 'all' Mode
const drillPool_s1_2_all = buildKanjiDrillPool(activeList_s1_2, 'all');
assert.strictEqual(drillPool_s1_2_all.length, 15, `Expected 15 drill items (3 modes * 5 kanji), got ${drillPool_s1_2_all.length}`);
for (const item of drillPool_s1_2_all) {
  assert.ok(ALLOWED_KANJI_S1_2.has(item.kanjiObj.k), `Drill item ${item.id} target kanji must be in 一二三四五`);
}
console.log('  ✓ 3.2 Drill pool generated 15 items covering meaning, reading, and vocab for 一二三四五');

// 3.3 1,000 Samples with modeFilter: 'all'
{
  const kanjiTargetCounts: Record<string, number> = { '一': 0, '二': 0, '三': 0, '四': 0, '五': 0 };
  const kindCounts: Record<PromptKind, number> = { meaning: 0, reading: 0, vocab: 0 };
  let foreignKanji = 0;
  let consecutiveDuplicates = 0;
  let lastPicked: DrillItem | null = null;

  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const picked = pickNextKanji(drillPool_s1_2_all, lastPicked);

    const targetChar = picked.kanjiObj.k;
    if (!ALLOWED_KANJI_S1_2.has(targetChar)) {
      foreignKanji++;
    } else {
      kanjiTargetCounts[targetChar]++;
    }

    kindCounts[picked.kind]++;

    if (lastPicked && picked.id === lastPicked.id) {
      consecutiveDuplicates++;
    }

    lastPicked = picked;
  }

  console.log('  Kanji target distribution across 1,000 samples (mode="all"):', kanjiTargetCounts);
  console.log('  Drill kind distribution across 1,000 samples:', kindCounts);

  assert.strictEqual(foreignKanji, 0, `CRITICAL VIOLATION: Found ${foreignKanji} prompts targeting outside 一二三四五!`);
  assert.strictEqual(consecutiveDuplicates, 0, `Kanji pickNext must not repeat identical item consecutively`);

  for (const ch of ['一', '二', '三', '四', '五']) {
    assert.ok(kanjiTargetCounts[ch] >= 100, `Kanji ${ch} was starved! Only appeared ${kanjiTargetCounts[ch]} times in 1,000 picks`);
    assert.ok(kanjiTargetCounts[ch] <= 300, `Kanji ${ch} over-represented (${kanjiTargetCounts[ch]} times)`);
  }

  assert.ok(kindCounts.meaning > 200, `Meaning prompts represented`);
  assert.ok(kindCounts.reading > 200, `Reading prompts represented`);
  assert.ok(kindCounts.vocab > 200, `Vocab prompts represented`);

  console.log('  ✓ 3.3 100% of 1,000 Kanji prompts strictly target 一二三四五 across all prompt kinds');
}

// 3.4 1,000 Samples with modeFilter: 'meaning'
{
  const drillPool_meaning = buildKanjiDrillPool(activeList_s1_2, 'meaning');
  assert.strictEqual(drillPool_meaning.length, 5);
  let foreign = 0;
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const picked = pickNextKanji(drillPool_meaning);
    if (!ALLOWED_KANJI_S1_2.has(picked.kanjiObj.k) || !ALLOWED_KANJI_S1_2.has(picked.promptDisplay)) {
      foreign++;
    }
  }
  assert.strictEqual(foreign, 0, '100% of meaning prompts must display 一二三四五');
  console.log('  ✓ 3.4 Meaning mode: 100% of 1,000 prompts display 一二三四五');
}

// 3.5 1,000 Samples with modeFilter: 'reading'
{
  const drillPool_reading = buildKanjiDrillPool(activeList_s1_2, 'reading');
  assert.strictEqual(drillPool_reading.length, 5);
  let foreign = 0;
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const picked = pickNextKanji(drillPool_reading);
    if (!ALLOWED_KANJI_S1_2.has(picked.kanjiObj.k) || !ALLOWED_KANJI_S1_2.has(picked.promptDisplay)) {
      foreign++;
    }
  }
  assert.strictEqual(foreign, 0, '100% of reading prompts must display 一二三四五');
  console.log('  ✓ 3.5 Reading mode: 100% of 1,000 prompts display 一二三四五');
}

// 3.6 1,000 Samples with modeFilter: 'vocab'
{
  const drillPool_vocab = buildKanjiDrillPool(activeList_s1_2, 'vocab');
  assert.strictEqual(drillPool_vocab.length, 5);
  let foreign = 0;
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const picked = pickNextKanji(drillPool_vocab);
    if (!ALLOWED_KANJI_S1_2.has(picked.kanjiObj.k)) {
      foreign++;
    }
  }
  assert.strictEqual(foreign, 0, '100% of vocab prompts must target 一二三四五');
  console.log('  ✓ 3.6 Vocab mode: 100% of 1,000 prompts target 一二三四五');
}

console.log('✓ Suite 3 PASSED: Kanji Dojo s1-2 strictly verified across 1,000+ empirical samples.\n');

// ----------------------------------------------------------------------------
// SUITE 4: STANDALONE MODE DIVERSITY & LEVEL COVERAGE (1,000 PROMPTS)
// ----------------------------------------------------------------------------
console.log('[Suite 4] Stress-Testing Standalone Mode Pool Range & Distribution...');

// 4.1 Standalone Kana Dojo (1,000 Samples)
{
  const standaloneCtx = resolveCampaignMissionParams(''); // No mission
  const standaloneKanaPool = buildKanaPool(standaloneCtx, 'hiragana', ROWS);

  // Standalone basic hiragana has 46 characters across 10 basic rows + dakuten/yoon rows
  console.log(`  Standalone Kana Pool Size with full ROWS: ${standaloneKanaPool.length} characters`);
  assert.ok(standaloneKanaPool.length >= 46, `Standalone pool must contain at least 46 characters, got ${standaloneKanaPool.length}`);

  const uniqueSampled = new Set<string>();
  const rowCounts: Record<string, number> = {};
  for (const r of ROWS) rowCounts[r] = 0;

  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const picked = pickKana(standaloneKanaPool, {});
    uniqueSampled.add(picked.kana);
    rowCounts[picked.row] = (rowCounts[picked.row] || 0) + 1;
  }

  console.log(`  Sampled ${uniqueSampled.size} unique Kana characters across 1,000 picks in standalone mode`);
  // Must sample almost all characters in pool (at least 40 unique characters)
  assert.ok(uniqueSampled.size >= 40, `Standalone Kana should sample widely across pool, got ${uniqueSampled.size}`);

  // Verify prompts span ALL basic rows
  for (const basicRow of BASIC_ROWS) {
    assert.ok(rowCounts[basicRow] > 0, `Row "${basicRow}" was starved in standalone Kana Dojo! Count: ${rowCounts[basicRow]}`);
  }
  console.log('  ✓ 4.1 Standalone Kana Dojo spans all basic rows and does NOT artificially restrict to 5 characters');
}

// 4.2 Standalone Kanji Dojo (1,000 Samples)
{
  const standaloneCtx = resolveCampaignMissionParams(''); // No mission

  // Test level = 'N5', batchRange = 20
  const n5List = buildKanjiActiveList(standaloneCtx, 'N5', 20);
  assert.strictEqual(n5List.length, 20, 'Default N5 batch should contain 20 kanji');
  const n5Pool = buildKanjiDrillPool(n5List, 'all');

  const uniqueN5Kanji = new Set<string>();
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const picked = pickNextKanji(n5Pool);
    uniqueN5Kanji.add(picked.kanjiObj.k);
  }
  assert.strictEqual(uniqueN5Kanji.size, 20, 'All 20 kanji in batch should be sampled');
  console.log('  ✓ 4.2 Standalone Kanji Dojo (batch=20) sampled all 20 unique kanji');

  // Test level = 'all', batchRange = 999 (spans both N5 and N4)
  const allLevelsList = buildKanjiActiveList(standaloneCtx, 'all', 999);
  assert.ok(allLevelsList.length > 100, `Full kanji list should have >100 kanji, got ${allLevelsList.length}`);
  const allLevelsPool = buildKanjiDrillPool(allLevelsList, 'meaning');

  const sampledLevels = new Set<string>();
  const uniqueAllKanji = new Set<string>();
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const picked = pickNextKanji(allLevelsPool);
    sampledLevels.add(picked.kanjiObj.level);
    uniqueAllKanji.add(picked.kanjiObj.k);
  }

  assert.ok(sampledLevels.has('N5'), 'Standalone all-levels must include N5');
  assert.ok(sampledLevels.has('N4'), 'Standalone all-levels must include N4');
  assert.ok(uniqueAllKanji.size > 80, `Expected >80 unique kanji sampled across 1,000 picks, got ${uniqueAllKanji.size}`);
  console.log(`  ✓ 4.3 Standalone Kanji Dojo (level='all') spans N5 and N4 (${uniqueAllKanji.size} unique kanji sampled)`);
}

console.log('✓ Suite 4 PASSED: Standalone Dojo mode verified for wide range and zero scoping leakage.\n');

// ----------------------------------------------------------------------------
// SUITE 5: MALFORMED / BOUNDARY STRESS TEST ON DOJO POOLS
// ----------------------------------------------------------------------------
console.log('[Suite 5] Stress-Testing Malformed Query Parameters Fallback in Dojos...');

const MALFORMED_QUERIES = [
  '?mission=nonexistent',
  '?mission=undefined',
  '?mission=null',
  '?mission=',
  '?stage=nonexistent',
  '?stage=undefined',
  '?stage=null',
  '?stage=',
  '?foo=bar',
];

for (const query of MALFORMED_QUERIES) {
  const ctx = resolveCampaignMissionParams(query);
  assert.strictEqual(ctx.isCampaignMode, false, `Query "${query}" must NOT trigger campaign mode`);

  // Kana Dojo must fallback to standalone rows
  const kanaPool = buildKanaPool(ctx, 'hiragana', BASIC_ROWS);
  assert.ok(
    kanaPool.length >= 46,
    `Query "${query}" should fall back to basic rows (>=46), got ${kanaPool.length}`
  );

  // Kanji Dojo must fallback to standalone N5 list
  const kanjiList = buildKanjiActiveList(ctx, 'N5', 20);
  assert.strictEqual(
    kanjiList.length,
    20,
    `Query "${query}" should fall back to standard batch (20), got ${kanjiList.length}`
  );
}

console.log(`  ✓ 5.1 All ${MALFORMED_QUERIES.length} malformed query variations safely fall back to un-scoped standalone pools without crashing or freezing`);

// 5.2 Empty targetItems fallback
{
  const emptyTargetCtx: ResolvedMissionContext = {
    isCampaignMode: true,
    stageId: 'dummy-empty',
    stage: {
      id: 'dummy-empty',
      stageNumber: 99,
      title: 'Empty Stage',
      titleJp: '空',
      icon: '❓',
      category: 'Kana',
      description: 'Stage with empty targets',
      targetRoute: '/kana',
      actionPrompt: 'Go',
      targetItems: [],
    },
    saga: null,
    targetItems: [],
  };

  const pool = buildKanaPool(emptyTargetCtx, 'hiragana', BASIC_ROWS);
  assert.ok(pool.length >= 46, 'Empty targetItems must fall back to basic rows instead of 0-item freeze');

  const kanjiList = buildKanjiActiveList(emptyTargetCtx, 'N5', 20);
  assert.strictEqual(kanjiList.length, 20, 'Empty targetItems in Kanji must fall back to standard batch');
  console.log('  ✓ 5.2 Empty targetItems [] falls back safely without 0-item freeze');
}

console.log('✓ Suite 5 PASSED: Malformed query parameters and empty target fallbacks verified.\n');

// ----------------------------------------------------------------------------
// SUITE 6: OTHER DOJO STAGES SCOPING INTEGRITY
// ----------------------------------------------------------------------------
console.log('[Suite 6] Verifying Other Campaign Dojo Stages (s2-1, s3-2)...');

// 6.1 s2-1 Katakana Dojo Scoping
{
  const ctx_s2_1 = resolveCampaignMissionParams('?mission=s2-1');
  assert.strictEqual(ctx_s2_1.isCampaignMode, true);
  assert.deepStrictEqual(ctx_s2_1.targetItems, ['ア', 'イ', 'ウ', 'エ', 'オ']);
  assert.strictEqual(ctx_s2_1.targetScript, 'katakana');

  const pool_s2_1 = buildKanaPool(ctx_s2_1);
  assert.strictEqual(pool_s2_1.length, 5);
  const chars = pool_s2_1.map((k) => k.kana).sort();
  assert.deepStrictEqual(chars, ['ア', 'イ', 'ウ', 'エ', 'オ'].sort());

  // Sample 200 picks
  for (let i = 0; i < 200; i++) {
    const picked = pickKana(pool_s2_1, {});
    assert.ok(
      ['ア', 'イ', 'ウ', 'エ', 'オ'].includes(picked.kana),
      `s2-1 Katakana Dojo pick outside [アイウエオ]: ${picked.kana}`
    );
  }
  console.log('  ✓ 6.1 s2-1 correctly scoped to Katakana vowels [ア, イ, ウ, エ, オ]');
}

// 6.2 s3-2 Kanji Dojo Nature & Calendar Scoping
{
  const ctx_s3_2 = resolveCampaignMissionParams('?mission=s3-2');
  assert.strictEqual(ctx_s3_2.isCampaignMode, true);
  const expectedKanji_s3_2 = ['日', '月', '火', '水', '木', '金', '土', '年', '時', '分'];
  assert.deepStrictEqual(ctx_s3_2.targetItems, expectedKanji_s3_2);

  const active_s3_2 = buildKanjiActiveList(ctx_s3_2);
  assert.strictEqual(active_s3_2.length, 10);
  const activeChars = active_s3_2.map((k) => k.k).sort();
  assert.deepStrictEqual(activeChars, expectedKanji_s3_2.slice().sort());

  const drillPool_s3_2 = buildKanjiDrillPool(active_s3_2, 'all');
  assert.strictEqual(drillPool_s3_2.length, 30); // 3 modes * 10 kanji

  // Sample 500 picks
  const s3_2_set = new Set(expectedKanji_s3_2);
  for (let i = 0; i < 500; i++) {
    const picked = pickNextKanji(drillPool_s3_2);
    assert.ok(s3_2_set.has(picked.kanjiObj.k), `s3-2 pick outside target kanji: ${picked.kanjiObj.k}`);
  }
  console.log('  ✓ 6.2 s3-2 correctly scoped to 10 Nature/Calendar Kanji [日, 月, 火, 水, 木, 金, 土, 年, 時, 分]');
}

console.log('✓ Suite 6 PASSED: All dojo stages across curriculum strictly scoped.\n');

console.log('========================================================================');
console.log('🎉 ALL EMPIRICAL DOJO SCOPING & PROMPT POOL STRESS TESTS PASSED (100%)!');
console.log('========================================================================\n');
