import assert from 'node:assert/strict';
import { CAMPAIGN_SAGAS, getCampaignStage, findCampaignStage } from '../src/data/campaign.ts';
import { STORIES } from '../src/data/stories.ts';

console.log('=== Running Campaign Data & Gatekeeper Verification Tests ===\n');

// 1. Saga Count and Structure
assert.ok(CAMPAIGN_SAGAS.length >= 6, 'CAMPAIGN_SAGAS must contain at least 6 sagas (expanded to 12)');
CAMPAIGN_SAGAS.forEach((saga, idx) => {
  assert.equal(saga.sagaNumber, idx + 1, `Saga ${saga.id} must have sagaNumber ${idx + 1}`);
  assert.ok(saga.title, `Saga ${saga.id} must have a title`);
  assert.ok(saga.boss, `Saga ${saga.id} must have a boss object`);
});
console.log('✓ Check 1: Sagas verified with valid sagaNumber and metadata.');

// 2. Stage Count & Uniqueness
let totalStages = 0;
const stageIds = new Set<string>();
for (const saga of CAMPAIGN_SAGAS) {
  assert.equal(saga.stages.length, 4, `Saga ${saga.id} must contain exactly 4 stages`);
  totalStages += saga.stages.length;
  for (const stage of saga.stages) {
    assert.ok(!stageIds.has(stage.id), `Stage ID ${stage.id} must be unique`);
    stageIds.add(stage.id);
    assert.ok(stage.title, `Stage ${stage.id} must have title`);
    assert.ok(stage.targetRoute, `Stage ${stage.id} must have targetRoute`);
  }
}
assert.ok(totalStages >= 24, 'Campaign must have at least 24 stages');
console.log(`✓ Check 2: ${totalStages} unique stages verified across ${CAMPAIGN_SAGAS.length} sagas (4 per saga).`);

// 3. getCampaignStage Lookup Helper
for (const saga of CAMPAIGN_SAGAS) {
  for (const stage of saga.stages) {
    const lookup = getCampaignStage(stage.id);
    assert.ok(lookup !== null, `getCampaignStage('${stage.id}') must not return null`);
    assert.equal(lookup!.stage.id, stage.id, `Stage ID must match looked up stage`);
    assert.equal(lookup!.saga.sagaNumber, saga.sagaNumber, `Saga number must match looked up saga`);

    const aliasLookup = findCampaignStage(stage.id);
    assert.ok(aliasLookup !== null, `findCampaignStage('${stage.id}') alias must match`);
    assert.equal(aliasLookup!.stage.id, stage.id);
  }
}
assert.equal(getCampaignStage('non-existent-stage-id'), null, 'Looking up invalid stage must return null');
console.log('✓ Check 3: getCampaignStage and findCampaignStage correctly look up all 24 stages.');

// 4. Content Scoping Metadata
const s1_1 = getCampaignStage('s1-1')!.stage;
assert.deepEqual(s1_1.targetItems, ['あ', 'い', 'う', 'え', 'お'], 's1-1 targetItems must match vowels');
assert.equal(s1_1.targetScript, 'hiragana', 's1-1 targetScript must be hiragana');

const s1_2 = getCampaignStage('s1-2')!.stage;
assert.deepEqual(s1_2.targetItems, ['一', '二', '三', '四', '五'], 's1-2 targetItems must match numbers 1-5');

const s2_1 = getCampaignStage('s2-1')!.stage;
assert.deepEqual(s2_1.targetItems, ['ア', 'イ', 'ウ', 'エ', 'オ'], 's2-1 targetItems must match katakana vowels');
assert.equal(s2_1.targetScript, 'katakana', 's2-1 targetScript must be katakana');

const s3_2 = getCampaignStage('s3-2')!.stage;
assert.deepEqual(
  s3_2.targetItems,
  ['日', '月', '火', '水', '木', '金', '土', '年', '時', '分'],
  's3-2 targetItems must match calendar/nature kanji'
);

const s3_1 = getCampaignStage('s3-1')!.stage;
assert.deepEqual(s3_1.targetItems, ['は', 'を', 'に', 'で'], 's3-1 targetItems must match core particles');
assert.equal(s3_1.targetCategory, 'ni-de-e', 's3-1 targetCategory must be ni-de-e');

console.log('✓ Check 4: Content scoping metadata (targetItems, targetScript, targetCategory) verified on stages.');

// 5. Story Route Discrepancies
const s2_4 = getCampaignStage('s2-4')!.stage;
assert.equal(s2_4.targetRoute, '/stories/ch2-cafe', 's2-4 targetRoute must be /stories/ch2-cafe');
const ch2Exists = STORIES.some((s) => s.id === 'ch2-cafe');
assert.ok(ch2Exists, 'Story ch2-cafe must exist in STORIES dataset');

const s4_4 = getCampaignStage('s4-4')!.stage;
assert.equal(s4_4.targetRoute, '/stories/ch4-weekend', 's4-4 targetRoute must be /stories/ch4-weekend');
const ch4Exists = STORIES.some((s) => s.id === 'ch4-weekend');
assert.ok(ch4Exists, 'Story ch4-weekend must exist in STORIES dataset');

console.log('✓ Check 5: Story route discrepancies fixed and validated against stories dataset (ch2-cafe, ch4-weekend).');

// 6. Gatekeeper Challenges Expansion
let totalBossQuestions = 0;
CAMPAIGN_SAGAS.forEach((saga) => {
  const boss = saga.boss;
  assert.equal(boss.minPassScore, 7, `Saga ${saga.sagaNumber} boss minPassScore must be exactly 7`);
  assert.equal(boss.questions.length, 10, `Saga ${saga.sagaNumber} boss must have exactly 10 questions`);
  totalBossQuestions += boss.questions.length;

  boss.questions.forEach((q, qIdx) => {
    assert.ok(typeof q.q === 'string' && q.q.length > 0, `Saga ${saga.sagaNumber} Q${qIdx + 1}: Question text must be non-empty`);
    assert.ok(Array.isArray(q.options) && q.options.length >= 3, `Saga ${saga.sagaNumber} Q${qIdx + 1}: Options must have >= 3 choices`);
    assert.ok(
      Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length,
      `Saga ${saga.sagaNumber} Q${qIdx + 1}: Answer index (${q.answer}) out of bounds [0, ${q.options.length - 1}]`
    );
    assert.ok(typeof q.explanation === 'string' && q.explanation.length > 0, `Saga ${saga.sagaNumber} Q${qIdx + 1}: Explanation must be non-empty`);

    // Verify uniqueness of options
    const optSet = new Set(q.options);
    assert.equal(optSet.size, q.options.length, `Saga ${saga.sagaNumber} Q${qIdx + 1}: Options must not contain duplicates`);
  });
});

assert.ok(totalBossQuestions >= 60, 'Total Gatekeeper questions across sagas must be at least 60');
console.log(`✓ Check 6: All Gatekeeper challenges verified with questions and minPassScore 7.`);

console.log('\n======================================================');
console.log('ALL MILESTONE 2 VERIFICATION CHECKS PASSED FLAWLESSLY!');
console.log('======================================================');
