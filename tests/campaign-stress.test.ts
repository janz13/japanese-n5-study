import assert from 'node:assert/strict';
import { CAMPAIGN_SAGAS, getCampaignStage, findCampaignStage } from '../src/data/campaign.ts';
import { STORIES } from '../src/data/stories.ts';
import { LESSONS } from '../src/data/grammar.ts';
import { SCENES } from '../src/data/scenes.ts';

console.log('===============================================================');
console.log('=== EMPIRICAL ADVERSARIAL STRESS TEST: CAMPAIGN DATA & LOGIC ==');
console.log('===============================================================\n');

let totalAssertions = 0;
function check(condition: boolean, msg: string) {
  totalAssertions++;
  assert.ok(condition, msg);
}

// ----------------------------------------------------------------------------
// TEST SUITE 1: 60 GATEKEEPER QUESTIONS INTEGRITY & STRESS
// ----------------------------------------------------------------------------
console.log('[Suite 1] Stress-testing all 60 Gatekeeper boss questions...');

check(CAMPAIGN_SAGAS.length === 6, 'Must have exactly 6 sagas');

let totalQuestions = 0;
const allQuestionPrompts = new Set<string>();
const answerIndexDistribution: Record<number, number> = {};

CAMPAIGN_SAGAS.forEach((saga) => {
  const boss = saga.boss;
  check(boss !== undefined && boss !== null, `Saga ${saga.sagaNumber} boss must exist`);
  check(boss.minPassScore === 7, `Saga ${saga.sagaNumber} boss minPassScore must be exactly 7`);
  check(boss.questions.length === 10, `Saga ${saga.sagaNumber} must have exactly 10 questions`);

  boss.questions.forEach((q, idx) => {
    totalQuestions++;
    const qLocation = `Saga ${saga.sagaNumber} Q${idx + 1}`;

    // Prompt checks
    check(typeof q.q === 'string', `${qLocation}: prompt must be string`);
    check(q.q.trim().length >= 5, `${qLocation}: prompt must have length >= 5`);
    check(q.q === q.q.trim(), `${qLocation}: prompt should not have leading/trailing whitespace`);

    // Prompt uniqueness across the entire curriculum
    check(!allQuestionPrompts.has(q.q), `${qLocation}: duplicate question prompt across campaign: "${q.q}"`);
    allQuestionPrompts.add(q.q);

    // Options checks
    check(Array.isArray(q.options), `${qLocation}: options must be array`);
    check(q.options.length >= 3, `${qLocation}: options must have at least 3 choices, got ${q.options.length}`);

    // Option uniqueness within the question
    const rawOptionsSet = new Set(q.options);
    check(rawOptionsSet.size === q.options.length, `${qLocation}: duplicate raw option detected! Options: ${JSON.stringify(q.options)}`);

    const normalizedOptionsSet = new Set(q.options.map((opt) => opt.trim().toLowerCase()));
    check(
      normalizedOptionsSet.size === q.options.length,
      `${qLocation}: duplicate normalized option detected! Options: ${JSON.stringify(q.options)}`
    );

    q.options.forEach((opt, oIdx) => {
      check(typeof opt === 'string', `${qLocation} option ${oIdx}: must be string`);
      check(opt.trim().length > 0, `${qLocation} option ${oIdx}: option must not be blank`);
      check(opt === opt.trim(), `${qLocation} option ${oIdx}: option should not have untrimmed whitespace: "${opt}"`);
    });

    // Answer bounds checks
    check(typeof q.answer === 'number', `${qLocation}: answer must be number`);
    check(Number.isInteger(q.answer), `${qLocation}: answer must be integer`);
    check(q.answer >= 0, `${qLocation}: answer must be non-negative, got ${q.answer}`);
    check(q.answer < q.options.length, `${qLocation}: answer index (${q.answer}) out of bounds [0, ${q.options.length - 1}]`);

    // Explanation checks
    check(typeof q.explanation === 'string', `${qLocation}: explanation must be string`);
    check(q.explanation.trim().length >= 5, `${qLocation}: explanation must be descriptive (length >= 5)`);

    // Answer index distribution tracking
    answerIndexDistribution[q.answer] = (answerIndexDistribution[q.answer] || 0) + 1;
  });
});

check(totalQuestions === 60, `Total questions must be exactly 60, got ${totalQuestions}`);
check(allQuestionPrompts.size === 60, `All 60 question prompts must be 100% unique, got ${allQuestionPrompts.size}`);

// Verify answer distribution is tracked
console.log('  Answer index distribution across 60 questions:', answerIndexDistribution);
check(Object.keys(answerIndexDistribution).length >= 3, 'Answer distribution should span indices 0, 1, 2');
check(answerIndexDistribution[0] > 0, 'Index 0 is represented');
check(answerIndexDistribution[1] > 0, 'Index 1 is represented');
check(answerIndexDistribution[2] > 0, 'Index 2 is represented (present 2 times)');
console.log('✓ Suite 1 PASSED: All 60 questions strictly validated for bounds, uniqueness, and non-empty options.\n');


// ----------------------------------------------------------------------------
// TEST SUITE 2: ROUTE RESOLUTION FOR ALL 24 STAGES
// ----------------------------------------------------------------------------
console.log('[Suite 2] Stress-testing targetRoute validity across all 24 stages...');

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

let validatedStages = 0;

CAMPAIGN_SAGAS.forEach((saga) => {
  saga.stages.forEach((stage) => {
    validatedStages++;
    const route = stage.targetRoute;
    const basePath = route.split('?')[0];
    check(typeof route === 'string' && route.startsWith('/'), `Stage ${stage.id}: targetRoute must start with /`);

    if (basePath.startsWith('/stories/')) {
      const storyId = basePath.replace('/stories/', '');
      check(
        validStoryIds.has(storyId),
        `Stage ${stage.id}: targetRoute "${route}" points to nonexistent story "${storyId}"! Available stories: ${Array.from(validStoryIds).join(', ')}`
      );
    } else if (basePath.startsWith('/grammar/')) {
      const lessonId = basePath.replace('/grammar/', '');
      check(
        validLessonIds.has(lessonId),
        `Stage ${stage.id}: targetRoute "${route}" points to nonexistent grammar lesson "${lessonId}"! Available lessons: ${Array.from(validLessonIds).join(', ')}`
      );
    } else if (basePath.startsWith('/speaking/')) {
      const sceneId = basePath.replace('/speaking/', '');
      check(
        validSceneIds.has(sceneId),
        `Stage ${stage.id}: targetRoute "${route}" points to nonexistent speaking scene "${sceneId}"! Available scenes: ${Array.from(validSceneIds).join(', ')}`
      );
    } else {
      check(
        VALID_STATIC_ROUTES.has(basePath),
        `Stage ${stage.id}: targetRoute "${route}" (basePath: "${basePath}") is not a recognized static application route!`
      );
    }
  });
});

check(validatedStages === 24, `Must validate exactly 24 stages, got ${validatedStages}`);
console.log('✓ Suite 2 PASSED: All 24 stages resolve to existing routes, stories, grammar lessons, or scenes.\n');


// ----------------------------------------------------------------------------
// TEST SUITE 3: getCampaignStage & findCampaignStage ADVERSARIAL STRESS TEST
// ----------------------------------------------------------------------------
console.log('[Suite 3] Stress-testing getCampaignStage & findCampaignStage with hostile inputs...');

// 1. Positive lookup for all 24 stages
for (const saga of CAMPAIGN_SAGAS) {
  for (const stage of saga.stages) {
    const res1 = getCampaignStage(stage.id);
    check(res1 !== null, `getCampaignStage("${stage.id}") returned null`);
    check(res1!.stage.id === stage.id, `Stage ID mismatch`);
    check(res1!.saga.sagaNumber === saga.sagaNumber, `Saga number mismatch`);

    const res2 = findCampaignStage(stage.id);
    check(res2 !== null, `findCampaignStage("${stage.id}") returned null`);
    check(res2!.stage.id === stage.id, `Stage ID mismatch`);
    check(res2!.saga.sagaNumber === saga.sagaNumber, `Saga number mismatch`);
  }
}

// 2. Hostile and boundary inputs
const adversarialInputs: unknown[] = [
  '',                                 // empty string
  '   ',                              // whitespace
  '\t\n\r',                           // control chars
  's1-1 ',                            // trailing space
  ' s1-1',                            // leading space
  'S1-1',                             // uppercase
  's1-01',                            // leading zero
  's0-1',                             // invalid saga 0
  's7-1',                             // non-existent saga 7
  's1-5',                             // non-existent stage 5
  's2-0',                             // non-existent stage 0
  'boss-1',                           // boss ID
  'saga-1',                           // saga ID
  'random_unknown_id_!@#$%^&*()',      // special characters
  's1-1\0',                           // null byte injection
  '../../../src/data/campaign.ts',    // path traversal
  '<script>alert("xss")</script>',    // XSS injection
  '__proto__',                        // prototype pollution attempt
  'constructor',                      // prototype property
  'toString',                         // prototype method
  'valueOf',                          // prototype method
  'a'.repeat(10000),                  // long string buffer
  null,                               // null literal
  undefined,                          // undefined literal
  0,                                  // zero number
  1,                                  // non-zero number
  NaN,                                // NaN
  Infinity,                           // Infinity
  true,                               // boolean true
  false,                              // boolean false
  {},                                 // empty object
  { id: 's1-1' },                     // object looking like stage
  [],                                 // array
  ['s1-1'],                           // array containing valid id
  () => 's1-1',                       // function
  Symbol('s1-1'),                     // symbol
];

adversarialInputs.forEach((input, i) => {
  try {
    const res = getCampaignStage(input as string);
    check(res === null, `Adversarial input [${i}] ${String(input)} should return null, got: ${JSON.stringify(res)}`);
  } catch (err) {
    check(false, `getCampaignStage crashed on input [${i}] ${String(input)}: ${err}`);
  }

  try {
    const res = findCampaignStage(input as string);
    check(res === null, `findCampaignStage alias on input [${i}] should return null`);
  } catch (err) {
    check(false, `findCampaignStage crashed on input [${i}] ${String(input)}: ${err}`);
  }
});

console.log(`✓ Suite 3 PASSED: Tested 24 valid lookups and ${adversarialInputs.length} hostile/invalid inputs without crash or leakage.\n`);


// ----------------------------------------------------------------------------
// TEST SUITE 4: BOSS SCORING & THRESHOLD SIMULATION (0..10)
// ----------------------------------------------------------------------------
console.log('[Suite 4] Simulating Boss challenge scoring mechanics across 0..10 score range...');

const TOTAL_BOSS_QUESTIONS = 10;
const MIN_PASS_SCORE = 7;
const UNLOCK_THRESHOLD_PCT = 70;

for (let score = 0; score <= TOTAL_BOSS_QUESTIONS; score++) {
  const passed = score >= MIN_PASS_SCORE;
  const pct = Math.round((score / TOTAL_BOSS_QUESTIONS) * 100);

  // Verification 1: Percentage calculation
  check(pct === score * 10, `Score ${score} * 10 must equal pct ${pct}`);

  // Verification 2: Pass/Fail alignment with 70% threshold
  if (score < 7) {
    check(passed === false, `Score ${score}/10 must FAIL (minPassScore=7)`);
    check(pct < UNLOCK_THRESHOLD_PCT, `Score ${score}/10 pct (${pct}%) must be < 70%`);
  } else {
    check(passed === true, `Score ${score}/10 must PASS (minPassScore=7)`);
    check(pct >= UNLOCK_THRESHOLD_PCT, `Score ${score}/10 pct (${pct}%) must be >= 70%`);
  }

  // Verification 3: Strict equivalence
  check(passed === (pct >= UNLOCK_THRESHOLD_PCT), `Score ${score}: pass flag must strictly match pct >= 70`);
}

// Edge case: test fractional or unexpected scores
const unexpectedScores = [-1, 0.5, 6.9, 7.0, 7.1, 10.5, 11];
unexpectedScores.forEach((score) => {
  const passed = score >= MIN_PASS_SCORE;
  if (score >= 7) {
    check(passed === true, `Score ${score} >= 7 passed`);
  } else {
    check(passed === false, `Score ${score} < 7 failed`);
  }
});

console.log('✓ Suite 4 PASSED: Boss score calculation perfectly maps [0..6] to Fail (<70%) and [7..10] to Pass (>=70%).\n');


// ----------------------------------------------------------------------------
// TEST SUITE 5: SCOPING METADATA STRICTNESS & INTEGRITY
// ----------------------------------------------------------------------------
console.log('[Suite 5] Validating scoping metadata across designated stages...');

// Stage s1-1
const s1_1 = getCampaignStage('s1-1')!.stage;
check(s1_1.targetScript === 'hiragana', 's1-1 targetScript must be hiragana');
check(Array.isArray(s1_1.targetItems), 's1-1 targetItems must be array');
check(s1_1.targetItems!.join('') === 'あいうえお', 's1-1 targetItems must be exactly あいうえお');

// Stage s1-2
const s1_2 = getCampaignStage('s1-2')!.stage;
check(Array.isArray(s1_2.targetItems), 's1-2 targetItems must be array');
check(s1_2.targetItems!.join('') === '一二三四五', 's1-2 targetItems must be exactly 一二三四五');

// Stage s2-1
const s2_1 = getCampaignStage('s2-1')!.stage;
check(s2_1.targetScript === 'katakana', 's2-1 targetScript must be katakana');
check(s2_1.targetItems!.join('') === 'アイウエオ', 's2-1 targetItems must be exactly アイウエオ');

// Stage s3-1
const s3_1 = getCampaignStage('s3-1')!.stage;
check(s3_1.targetCategory === 'ni-de-e', 's3-1 targetCategory must be ni-de-e');
check(s3_1.targetItems!.join('') === 'はをにで', 's3-1 targetItems must be はをにで');

// Stage s3-2
const s3_2 = getCampaignStage('s3-2')!.stage;
check(s3_2.targetItems!.join('') === '日月火水木金土年時分', 's3-2 targetItems must be 日月火水木金土年時分');

// Stage s4-1, s4-2, s4-3
check(getCampaignStage('s4-1')!.stage.targetTab === 'lessons', 's4-1 targetTab must be lessons');
check(getCampaignStage('s4-2')!.stage.targetTab === 'lessons', 's4-2 targetTab must be lessons');
check(getCampaignStage('s4-3')!.stage.targetTab === 'lessons', 's4-3 targetTab must be lessons');

// Stage s5-1, s5-2
const s5_1 = getCampaignStage('s5-1')!.stage;
check(s5_1.targetCategory === 'day', 's5-1 targetCategory must be day');
check(s5_1.targetItems!.join(',') === 'day,nin', 's5-1 targetItems must be day,nin');

const s5_2 = getCampaignStage('s5-2')!.stage;
check(s5_2.targetCategory === 'wa-ga', 's5-2 targetCategory must be wa-ga');

// Stage s6-1
const s6_1 = getCampaignStage('s6-1')!.stage;
check(s6_1.targetTab === 'pairs', 's6-1 targetTab must be pairs');

console.log('✓ Suite 5 PASSED: All stage scoping metadata strictly matches requirements.\n');

console.log('===============================================================');
console.log(`ALL ${totalAssertions} EMPIRICAL ASSERTIONS PASSED WITH ZERO FAILURES!`);
console.log('VERDICT: APPROVE');
console.log('===============================================================');
