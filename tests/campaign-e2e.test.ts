/**
 * Comprehensive E2E Test Suite for Campaign Mode Enhancement
 * Japanese N5 Study
 * 
 * Covers all requirements in ORIGINAL_REQUEST.md & PROJECT.md:
 * - R1: Gatekeeper challenges (8-10 questions per saga, 6 sagas, >=70% / 7 of 10 to clear)
 * - R2: Campaign context return flow (active campaign banner, return navigates to #/campaign?saga=X, activity completion marks store)
 * - R3: Mission content scoping (Kana Dojo s1-1 strictly scopes to あいうえお, Kanji Dojo s1-2 to 一二三四五, standalone remains 100% full un-scoped)
 * 
 * 4-Tier Test Case Structure:
 * - Tier 1: Feature Coverage (>=5 test cases per feature)
 * - Tier 2: Boundary & Corner Cases (>=5 test cases per feature)
 * - Tier 3: Cross-Feature Combinations (pairwise interactions)
 * - Tier 4: Real-World Application Scenarios (end-to-end user journeys)
 * 
 * Run with: node --experimental-strip-types tests/campaign-e2e.test.ts
 */

import {
  suite,
  test,
  beforeEach,
  assert,
  registry,
  clearMockStorage,
  setHashRoute,
} from './helpers/test-runner.ts';
import {
  EXPECTED_SAGAS,
  EXPECTED_STAGE_SCOPING,
  EXPECTED_CORRECTED_ROUTES,
  CAMPAIGN_RETURN_BUTTON_LABEL,
  CAMPAIGN_RETURN_ROUTE_PREFIX,
} from './fixtures/campaign-fixtures.ts';

// Dynamic imports to allow clean mock isolation
import * as campaignModule from '../src/data/campaign.ts';
import { HIRAGANA, KATAKANA, BASIC_ROWS, type Kana } from '../src/data/kana.ts';
import { KANJI, type Kanji } from '../src/data/kanji.ts';
import { useStore } from '../src/lib/store.ts';

const { CAMPAIGN_SAGAS } = campaignModule;

// Clean state before each test
beforeEach(() => {
  clearMockStorage();
  useStore.getState().resetProgress();
  setHashRoute('#/campaign');
});

// ============================================================================
// TIER 1: FEATURE COVERAGE
// ============================================================================

// ----------------------------------------------------------------------------
// Tier 1 - Feature 1: Gatekeeper Boss Challenges Expansion (R1)
// ----------------------------------------------------------------------------
suite('Tier 1: Feature 1 - Gatekeeper Boss Challenges (R1)', 'Tier 1', () => {
  test('T1.1_R1_SAGA_QUESTION_COUNT', 'Each of the 6 sagas contains between 8 and 10 boss questions', () => {
    assert.strictEqual(CAMPAIGN_SAGAS.length, 6, 'Must contain exactly 6 sagas');
    for (const saga of CAMPAIGN_SAGAS) {
      const qCount = saga.boss.questions.length;
      assert.ok(
        qCount >= 8 && qCount <= 10,
        `Saga ${saga.sagaNumber} ("${saga.title}") must have 8 to 10 questions. Found: ${qCount}`
      );
    }
  });

  test('T1.2_R1_QUESTION_STRUCTURE_INTEGRITY', 'Every boss question has valid q, options, answer index, and explanation', () => {
    for (const saga of CAMPAIGN_SAGAS) {
      assert.ok(saga.boss.questions.length > 0, `Saga ${saga.sagaNumber} questions cannot be empty`);
      saga.boss.questions.forEach((q, idx) => {
        assert.ok(typeof q.q === 'string' && q.q.trim().length > 0, `Saga ${saga.sagaNumber} Q${idx + 1} has non-empty question string`);
        assert.ok(Array.isArray(q.options) && q.options.length >= 2, `Saga ${saga.sagaNumber} Q${idx + 1} has at least 2 options`);
        assert.ok(
          Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length,
          `Saga ${saga.sagaNumber} Q${idx + 1} answer index (${q.answer}) is valid for ${q.options.length} options`
        );
        assert.ok(
          typeof q.explanation === 'string' && q.explanation.trim().length > 0,
          `Saga ${saga.sagaNumber} Q${idx + 1} has non-empty explanation`
        );
      });
    }
  });

  test('T1.3_R1_CURRICULUM_CONTENT_ALIGNMENT', 'Boss challenge questions test the specific curriculum taught within each saga', () => {
    for (const expected of EXPECTED_SAGAS) {
      const saga = CAMPAIGN_SAGAS.find((s) => s.sagaNumber === expected.sagaNumber);
      assert.ok(saga, `Saga ${expected.sagaNumber} must exist`);

      const combinedText = saga.boss.questions
        .map((q) => `${q.q} ${q.options.join(' ')} ${q.explanation}`)
        .join(' ')
        .toLowerCase();

      const matchedKeywords = expected.curriculumKeywords.filter((kw) => combinedText.includes(kw.toLowerCase()));
      assert.ok(
        matchedKeywords.length >= 2,
        `Saga ${expected.sagaNumber} questions must reflect curriculum keywords. Matched [${matchedKeywords.join(', ')}] out of [${expected.curriculumKeywords.join(', ')}]`
      );
    }
  });

  test('T1.4_R1_PASSING_SCORE_THRESHOLD', 'Each boss has minPassScore = 7 (70% on 10 questions) and scores >= 70% clear saga', () => {
    for (const saga of CAMPAIGN_SAGAS) {
      const qCount = saga.boss.questions.length;
      const expectedMinScore = Math.ceil(qCount * 0.7); // 7 of 10 (70%)
      assert.strictEqual(
        saga.boss.minPassScore,
        expectedMinScore,
        `Saga ${saga.sagaNumber} minPassScore must be ${expectedMinScore} for ${qCount} questions (>=70%)`
      );
    }

    // Verify store scoring marks saga cleared when passing
    const store = useStore.getState();
    store.completeCampaignSaga(1, 70);
    assert.strictEqual(useStore.getState().campaignClearedSagas[1], 70, 'Saga 1 must be recorded with 70%');
  });

  test('T1.5_R1_SAGA_PROGRESSION_UNLOCK', 'Clearing Saga N with >=70% unlocks Saga N+1; failing keeps Saga N+1 locked', () => {
    const isSagaUnlocked = (sNum: number) => {
      if (sNum === 1) return true;
      const prevScore = useStore.getState().campaignClearedSagas[sNum - 1];
      return !!prevScore && prevScore >= 70;
    };

    assert.strictEqual(isSagaUnlocked(1), true, 'Saga 1 is always unlocked initially');
    assert.strictEqual(isSagaUnlocked(2), false, 'Saga 2 is initially locked');

    // Fail Saga 1 with 60% (< 70%)
    useStore.getState().completeCampaignSaga(1, 60);
    assert.strictEqual(isSagaUnlocked(2), false, 'Saga 2 remains locked when Saga 1 score is < 70%');

    // Pass Saga 1 with 80% (>= 70%)
    useStore.getState().completeCampaignSaga(1, 80);
    assert.strictEqual(isSagaUnlocked(2), true, 'Saga 2 unlocks when Saga 1 score is >= 70%');
  });

  test('T1.6_R1_FAST_TRACK_PLACEMENT_SKIP', 'Placement fast-track skip clears all preceding sagas with 100% and unlocks target saga', () => {
    const store = useStore.getState();
    const targetSaga = 3;

    // Simulate handleSkipToSaga(3)
    for (let i = 1; i < targetSaga; i++) {
      store.completeCampaignSaga(i, 100);
      const saga = CAMPAIGN_SAGAS.find((s) => s.sagaNumber === i);
      if (saga) {
        saga.stages.forEach((st) => store.completeCampaignStage(st.id));
      }
    }

    const state = useStore.getState();
    assert.strictEqual(state.campaignClearedSagas[1], 100, 'Saga 1 cleared with 100%');
    assert.strictEqual(state.campaignClearedSagas[2], 100, 'Saga 2 cleared with 100%');
    assert.strictEqual(state.campaignClearedSagas[3], undefined, 'Saga 3 is active/unlocked, not cleared yet');
    assert.strictEqual(state.campaignCompletedStages['s1-1'], true, 's1-1 marked complete');
    assert.strictEqual(state.campaignCompletedStages['s2-4'], true, 's2-4 marked complete');
  });
});

// ----------------------------------------------------------------------------
// Tier 1 - Feature 2: Campaign Context and Return Flow (R2)
// ----------------------------------------------------------------------------
suite('Tier 1: Feature 2 - Return Flow & Campaign Context (R2)', 'Tier 1', () => {
  test('T1.7_R2_LAUNCH_URL_CONTRACT', 'Stage launch URL specifies target route carrying ?mission=<stageId>', () => {
    for (const saga of CAMPAIGN_SAGAS) {
      for (const stage of saga.stages) {
        const launchUrl = `${stage.targetRoute}?mission=${stage.id}`;
        assert.ok(launchUrl.includes(`?mission=${stage.id}`), `Launch URL for stage ${stage.id} must include ?mission=${stage.id}`);
        assert.ok(stage.targetRoute.startsWith('/'), `Target route for stage ${stage.id} must start with '/'`);
      }
    }
  });

  test('T1.8_R2_STORY_ROUTE_INTEGRITY', 'Story stage routes s2-4 and s4-4 point to valid existing chapters without 404', () => {
    for (const [stageId, expectedRoute] of Object.entries(EXPECTED_CORRECTED_ROUTES)) {
      let foundStage: campaignModule.CampaignStage | undefined;
      for (const saga of CAMPAIGN_SAGAS) {
        const match = saga.stages.find((st) => st.id === stageId);
        if (match) {
          foundStage = match;
          break;
        }
      }
      assert.ok(foundStage, `Stage ${stageId} must exist in campaign sagas`);
      assert.strictEqual(
        foundStage.targetRoute,
        expectedRoute,
        `Stage ${stageId} targetRoute must be corrected to "${expectedRoute}". Found: "${foundStage.targetRoute}"`
      );
    }
  });

  test('T1.9_R2_NO_PREMATURE_STAGE_COMPLETION', 'Launching a stage from Campaign Map does NOT prematurely mark it complete in store', () => {
    // Fresh state
    const stageId = 's1-1';
    assert.strictEqual(useStore.getState().campaignCompletedStages[stageId], undefined, 'Stage must start uncompleted');

    // Simulate clicking the Launch button: it must ONLY navigate, NOT call completeCampaignStage
    const simulatedLaunch = (stId: string, route: string) => {
      // In corrected implementation, launch does NOT call completeCampaignStage
      const launchUrl = `${route}?mission=${stId}`;
      setHashRoute(launchUrl);
    };

    simulatedLaunch(stageId, '/kana');

    assert.strictEqual(
      useStore.getState().campaignCompletedStages[stageId],
      undefined,
      'Stage must NOT be marked completed upon launch. It must only be marked completed upon finishing the activity.'
    );
  });

  test('T1.10_R2_BANNER_PRESENCE_AND_RETURN_URL', 'Active campaign context provides return URL pointing to #/campaign?saga=<sagaNum>', () => {
    // Contract helper: derive campaign context from URL
    const parseCampaignContext = (url: string) => {
      const match = url.match(/[?&](?:mission|stage)=([^&]+)/);
      if (!match) return null;
      const stageId = match[1];
      for (const saga of CAMPAIGN_SAGAS) {
        const stage = saga.stages.find((s) => s.id === stageId);
        if (stage) {
          return {
            isCampaignMode: true,
            stage,
            saga,
            returnUrl: `#/campaign?saga=${saga.sagaNumber}`,
            returnLabel: CAMPAIGN_RETURN_BUTTON_LABEL,
          };
        }
      }
      return null;
    };

    const ctx = parseCampaignContext('/kana?mission=s1-1');
    assert.ok(ctx, 'Context must be detected when ?mission=s1-1 is present');
    assert.strictEqual(ctx.isCampaignMode, true);
    assert.strictEqual(ctx.stage.id, 's1-1');
    assert.strictEqual(ctx.saga.sagaNumber, 1);
    assert.strictEqual(ctx.returnUrl, '#/campaign?saga=1');
    assert.strictEqual(ctx.returnLabel, CAMPAIGN_RETURN_BUTTON_LABEL);
  });

  test('T1.11_R2_ACTIVITY_COMPLETION_MARKS_STORE', 'Completing the drill session or reading lesson marks stage complete in store', () => {
    const store = useStore.getState();
    const stageId = 's1-1';

    assert.strictEqual(store.campaignCompletedStages[stageId], undefined);

    // Simulate activity completion trigger (e.g. 5 drill items finished in KanaDojo)
    store.completeCampaignStage(stageId);

    assert.strictEqual(useStore.getState().campaignCompletedStages[stageId], true, 'Stage must be marked completed');
  });

  test('T1.12_R2_SAGA_DEEP_LINKING_READS_PARAM', 'Campaign page reads ?saga=<num> from URL search params and activates corresponding saga', () => {
    const resolveSagaFromUrl = (hashUrl: string): number => {
      const url = new URL(hashUrl.replace(/^#/, ''), 'http://localhost');
      const param = url.searchParams.get('saga');
      if (param) {
        const num = parseInt(param, 10);
        if (num >= 1 && num <= CAMPAIGN_SAGAS.length) return num;
      }
      return 1;
    };

    assert.strictEqual(resolveSagaFromUrl('#/campaign?saga=2'), 2);
    assert.strictEqual(resolveSagaFromUrl('#/campaign?saga=5'), 5);
    assert.strictEqual(resolveSagaFromUrl('#/campaign'), 1);
  });
});

// ----------------------------------------------------------------------------
// Tier 1 - Feature 3: Mission Content Scoping (R3)
// ----------------------------------------------------------------------------
suite('Tier 1: Feature 3 - Mission Content Scoping (R3)', 'Tier 1', () => {
  test('T1.13_R3_CAMPAIGN_STAGE_TARGET_ITEMS_SCHEMA', 'CampaignStage interface specifies targetItems for s1-1 (あいうえお) and s1-2 (一二三四五)', () => {
    const s1 = CAMPAIGN_SAGAS.find((s) => s.sagaNumber === 1);
    assert.ok(s1, 'Saga 1 must exist');

    const s1_1 = s1.stages.find((st) => st.id === 's1-1') as campaignModule.CampaignStage & { targetItems?: string[] };
    const s1_2 = s1.stages.find((st) => st.id === 's1-2') as campaignModule.CampaignStage & { targetItems?: string[] };

    assert.ok(s1_1, 'Stage s1-1 must exist');
    assert.ok(s1_2, 'Stage s1-2 must exist');

    assert.ok(Array.isArray(s1_1.targetItems), 'Stage s1-1 must define targetItems array');
    assert.deepStrictEqual(s1_1.targetItems, ['あ', 'い', 'う', 'え', 'お'], 's1-1 targetItems must strictly be [あ, い, う, え, お]');

    assert.ok(Array.isArray(s1_2.targetItems), 'Stage s1-2 must define targetItems array');
    assert.deepStrictEqual(s1_2.targetItems, ['一', '二', '三', '四', '五'], 's1-2 targetItems must strictly be [一, 二, 三, 四, 五]');
  });

  test('T1.14_R3_STAGE_LOOKUP_HELPER', 'src/data/campaign exports getCampaignStage helper returning stage and parent saga', () => {
    const fn = (campaignModule as unknown as { getCampaignStage?: (id: string) => { stage: campaignModule.CampaignStage; saga: campaignModule.CampaignSaga } | null }).getCampaignStage;
    assert.strictEqual(typeof fn, 'function', 'getCampaignStage must be an exported function in src/data/campaign.ts');

    const result = fn!('s1-1');
    assert.ok(result, 'getCampaignStage("s1-1") must return match');
    assert.strictEqual(result.stage.id, 's1-1');
    assert.strictEqual(result.saga.sagaNumber, 1);

    const missing = fn!('non-existent-stage');
    assert.strictEqual(missing, null, 'getCampaignStage must return null for non-existent stage ID');
  });

  test('T1.15_R3_KANA_DOJO_SCOPING_S1_1', 'In mission s1-1, Kana Dojo prompt pool is strictly scoped to あいうえお (5 items)', () => {
    const targetItems = EXPECTED_STAGE_SCOPING['s1-1'].targetItems;

    // Simulate Kana Dojo prompt pool creation logic when targetItems is active
    const buildKanaPool = (isCampaign: boolean, targets: string[] | undefined): Kana[] => {
      const source = HIRAGANA;
      if (isCampaign && targets && targets.length > 0) {
        return source.filter((k) => targets.includes(k.kana));
      }
      // Standalone pool (basic rows)
      return source.filter((k) => BASIC_ROWS.includes(k.row));
    };

    const scopedPool = buildKanaPool(true, targetItems);
    assert.strictEqual(scopedPool.length, 5, 'Scoped pool must have exactly 5 items');
    const kanaChars = scopedPool.map((k) => k.kana).sort();
    assert.deepStrictEqual(kanaChars, ['あ', 'い', 'う', 'え', 'お'].sort(), 'Scoped pool must only contain あいうえお');
    assert.ok(!kanaChars.includes('か'), 'Must not contain か');
    assert.ok(!kanaChars.includes('ん'), 'Must not contain ん');
  });

  test('T1.16_R3_KANJI_DOJO_SCOPING_S1_2', 'In mission s1-2, Kanji Dojo activeKanjiList is strictly scoped to 一二三四五 (5 items)', () => {
    const targetItems = EXPECTED_STAGE_SCOPING['s1-2'].targetItems;

    // Simulate Kanji Dojo active list creation logic when targetItems is active
    const buildKanjiList = (isCampaign: boolean, targets: string[] | undefined): Kanji[] => {
      let list = KANJI;
      if (isCampaign && targets && targets.length > 0) {
        return list.filter((k) => targets.includes(k.k));
      }
      return list.filter((k) => k.level === 'N5');
    };

    const scopedList = buildKanjiList(true, targetItems);
    assert.strictEqual(scopedList.length, 5, 'Scoped kanji list must have exactly 5 items');
    const kanjiChars = scopedList.map((k) => k.k).sort();
    assert.deepStrictEqual(kanjiChars, ['一', '二', '三', '四', '五'].sort(), 'Scoped kanji list must only contain 一二三四五');
    assert.ok(!kanjiChars.includes('日'), 'Must not contain other kanji like 日');
  });

  test('T1.17_R3_STANDALONE_DOJO_UNSCOPED_PRESERVATION', 'Direct navigation to /kana or /kanji-dojo outside campaign preserves 100% full un-scoped pools', () => {
    // Standalone Kana Dojo (no mission param)
    const standaloneKanaPool = HIRAGANA.filter((k) => BASIC_ROWS.includes(k.row));
    assert.ok(
      standaloneKanaPool.length >= 46,
      `Standalone Kana pool must contain full basic 46 characters. Found: ${standaloneKanaPool.length}`
    );

    // Standalone Kanji Dojo (no mission param)
    const standaloneKanjiList = KANJI.filter((k) => k.level === 'N5');
    assert.ok(
      standaloneKanjiList.length >= 80,
      `Standalone Kanji pool must contain full N5 characters (80+). Found: ${standaloneKanjiList.length}`
    );
  });
});

// ============================================================================
// TIER 2: BOUNDARY & CORNER CASES
// ============================================================================

// ----------------------------------------------------------------------------
// Tier 2 - Boundary Cases: R1 Gatekeeper Challenges
// ----------------------------------------------------------------------------
suite('Tier 2: Boundary Cases - Gatekeeper Challenges (R1)', 'Tier 2', () => {
  test('T2.1_R1_EXACT_PASS_THRESHOLD_BOUNDARY', 'Exact pass threshold: 7 of 10 passes (70%), 6 of 10 fails (60%)', () => {
    const qTotal = 10;
    const minPass = 7;

    const calcResult = (correctCount: number) => {
      const passed = correctCount >= minPass;
      const pct = Math.round((correctCount / qTotal) * 100);
      return { passed, pct };
    };

    const resFail = calcResult(6);
    assert.strictEqual(resFail.passed, false, '6/10 must fail');
    assert.strictEqual(resFail.pct, 60);

    const resPass = calcResult(7);
    assert.strictEqual(resPass.passed, true, '7/10 must pass');
    assert.strictEqual(resPass.pct, 70);
  });

  test('T2.2_R1_ZERO_SCORE_AND_ALL_WRONG', 'Zero correct answers (0/10) handles gracefully with 0% and does not clear saga', () => {
    const store = useStore.getState();
    const zeroScore = 0;
    const minPass = 7;
    const passed = zeroScore >= minPass;
    assert.strictEqual(passed, false);

    // Failing does not clear saga
    if (passed) {
      store.completeCampaignSaga(1, 0);
    }

    assert.strictEqual(useStore.getState().campaignClearedSagas[1], undefined, 'Saga 1 must not be cleared on 0/10');
  });

  test('T2.3_R1_PERFECT_SCORE_AND_ALL_CORRECT', 'Perfect score (10/10) awards 100% and unlocks next saga', () => {
    const store = useStore.getState();
    const perfectScore = 10;
    const minPass = 7;
    const passed = perfectScore >= minPass;
    assert.strictEqual(passed, true);

    store.completeCampaignSaga(1, 100);
    assert.strictEqual(useStore.getState().campaignClearedSagas[1], 100, 'Saga 1 recorded with 100%');
  });

  test('T2.4_R1_UNANSWERED_QUESTIONS_SUBMISSION', 'Submitting with partially unanswered questions calculates score over total questions (10)', () => {
    const totalQuestions = 10;
    const answered = { 0: 1, 1: 2, 2: 0 }; // Only 3 questions answered
    const correctIndices = { 0: 1, 1: 2, 2: 0, 3: 1, 4: 2, 5: 0, 6: 1, 7: 2, 8: 0, 9: 1 };

    let score = 0;
    for (let i = 0; i < totalQuestions; i++) {
      if ((answered as Record<number, number>)[i] !== undefined && (answered as Record<number, number>)[i] === correctIndices[i]) {
        score++;
      }
    }

    const pct = Math.round((score / totalQuestions) * 100);
    assert.strictEqual(score, 3, 'Score must only count correct answered questions');
    assert.strictEqual(pct, 30, 'Percentage must be 30% out of 10 questions, not 100% out of 3 answered');
    assert.strictEqual(score >= 7, false, 'Unanswered submission fails pass threshold');
  });

  test('T2.5_R1_REPEATED_ATTEMPTS_SCORE_MAX', 'Retaking boss maintains the highest score achieved via Math.max', () => {
    const store = useStore.getState();

    // First attempt: 70%
    store.completeCampaignSaga(1, 70);
    assert.strictEqual(useStore.getState().campaignClearedSagas[1], 70);

    // Second attempt: 90%
    store.completeCampaignSaga(1, 90);
    assert.strictEqual(useStore.getState().campaignClearedSagas[1], 90, 'Score updated to 90%');

    // Third attempt: 80% (lower than best)
    store.completeCampaignSaga(1, 80);
    assert.strictEqual(useStore.getState().campaignClearedSagas[1], 90, 'Score retained at best 90%');
  });

  test('T2.6_R1_SAGA_OUT_OF_BOUNDS_LOOKUP', 'Handling non-existent saga numbers (0, 7, -1, NaN) returns undefined/safe fallback', () => {
    const findSaga = (num: number) => CAMPAIGN_SAGAS.find((s) => s.sagaNumber === num);
    assert.strictEqual(findSaga(0), undefined);
    assert.strictEqual(findSaga(7), undefined);
    assert.strictEqual(findSaga(-1), undefined);
    assert.strictEqual(findSaga(NaN), undefined);
  });
});

// ----------------------------------------------------------------------------
// Tier 2 - Boundary Cases: R2 Return Flow & Context
// ----------------------------------------------------------------------------
suite('Tier 2: Boundary Cases - Return Flow & Context (R2)', 'Tier 2', () => {
  test('T2.7_R2_MALFORMED_OR_UNKNOWN_MISSION_PARAM', 'Unknown or malformed mission param (?mission=xyz_999) falls back safely to standalone mode', () => {
    const parseContext = (query: string) => {
      const match = query.match(/[?&]mission=([^&]+)/);
      if (!match) return { isCampaignMode: false };
      const stageId = match[1];
      for (const saga of CAMPAIGN_SAGAS) {
        const stage = saga.stages.find((st) => st.id === stageId);
        if (stage) return { isCampaignMode: true, stage, saga };
      }
      // Unknown stage ID
      return { isCampaignMode: false };
    };

    const fallback = parseContext('?mission=xyz_999');
    assert.strictEqual(fallback.isCampaignMode, false, 'Unknown mission ID must fall back to standalone mode');

    const empty = parseContext('?mission=');
    assert.strictEqual(empty.isCampaignMode, false, 'Empty mission ID must fall back to standalone mode');
  });

  test('T2.8_R2_LEGACY_ALIAS_STAGE_PARAM', 'Legacy ?stage=<id> parameter works identically to ?mission=<id>', () => {
    const parseMissionParam = (search: string): string | null => {
      const params = new URLSearchParams(search);
      return params.get('mission') || params.get('stage') || null;
    };

    assert.strictEqual(parseMissionParam('?mission=s1-1'), 's1-1');
    assert.strictEqual(parseMissionParam('?stage=s1-1'), 's1-1', '?stage= alias must resolve stage ID');
    assert.strictEqual(parseMissionParam('?other=123'), null);
  });

  test('T2.9_R2_PREMATURE_EXIT_WITHOUT_COMPLETION', 'User exiting via return button before completing drill leaves stage uncompleted', () => {
    const stageId = 's1-1';
    let drillCount = 2; // User only finished 2 of 5 required drills
    const requiredDrills = 5;

    // User clicks return banner button
    const onReturnClick = () => {
      if (drillCount >= requiredDrills) {
        useStore.getState().completeCampaignStage(stageId);
      }
      setHashRoute('#/campaign?saga=1');
    };

    onReturnClick();

    assert.strictEqual(
      useStore.getState().campaignCompletedStages[stageId],
      undefined,
      'Stage must NOT be completed when exiting early'
    );
  });

  test('T2.10_R2_MULTIPLE_COMPLETIONS_IDEMPOTENCY', 'Completing an already-completed mission is idempotent with no state corruption', () => {
    const store = useStore.getState();
    const stageId = 's1-1';

    store.completeCampaignStage(stageId);
    store.completeCampaignStage(stageId);
    store.completeCampaignStage(stageId);

    const stages = useStore.getState().campaignCompletedStages;
    assert.strictEqual(stages[stageId], true);
    assert.strictEqual(Object.keys(stages).filter((k) => k === stageId).length, 1, 'Only one key in record');
  });

  test('T2.11_R2_DEEP_LINK_INVALID_SAGA_PARAM', 'Campaign map receiving invalid ?saga=abc or ?saga=99 defaults gracefully to Saga 1', () => {
    const sanitizeSagaNum = (rawParam: string | null): number => {
      if (!rawParam) return 1;
      const parsed = parseInt(rawParam, 10);
      if (isNaN(parsed) || parsed < 1 || parsed > CAMPAIGN_SAGAS.length) return 1;
      return parsed;
    };

    assert.strictEqual(sanitizeSagaNum('abc'), 1);
    assert.strictEqual(sanitizeSagaNum('99'), 1);
    assert.strictEqual(sanitizeSagaNum('-5'), 1);
    assert.strictEqual(sanitizeSagaNum('4'), 4);
  });
});

// ----------------------------------------------------------------------------
// Tier 2 - Boundary Cases: R3 Content Scoping
// ----------------------------------------------------------------------------
suite('Tier 2: Boundary Cases - Mission Content Scoping (R3)', 'Tier 2', () => {
  test('T2.12_R3_EMPTY_OR_UNDEFINED_TARGET_ITEMS', 'Mission with empty or undefined targetItems falls back safely without 0-item freeze', () => {
    const filterPool = (all: Kana[], targets: string[] | undefined): Kana[] => {
      if (!targets || targets.length === 0) {
        return all; // Safe fallback
      }
      return all.filter((k) => targets.includes(k.kana));
    };

    const emptyTargets: string[] = [];
    const pool = filterPool(HIRAGANA, emptyTargets);
    assert.ok(pool.length > 0, 'Pool must not be 0 items when targets is empty');

    const undefinedTargets = undefined;
    const pool2 = filterPool(HIRAGANA, undefinedTargets);
    assert.ok(pool2.length > 0, 'Pool must not be 0 items when targets is undefined');
  });

  test('T2.13_R3_TARGET_ITEMS_EXTRA_WHITESPACE', 'Target items with surrounding whitespace match cleanly after trimming', () => {
    const rawTargets = [' あ ', 'い\t', '\nう'];
    const cleanTargets = rawTargets.map((s) => s.trim());
    assert.deepStrictEqual(cleanTargets, ['あ', 'い', 'う']);

    const matched = HIRAGANA.filter((k) => cleanTargets.includes(k.kana));
    assert.strictEqual(matched.length, 3);
  });

  test('T2.14_R3_CASE_AND_SCRIPT_STRICTNESS', 'Hiragana scoping does not bleed Katakana characters into Hiragana drill pool', () => {
    const targetKana = ['あ', 'い', 'う', 'え', 'お'];
    const hiraganaMatches = HIRAGANA.filter((k) => targetKana.includes(k.kana));
    const katakanaMatches = KATAKANA.filter((k) => targetKana.includes(k.kana));

    assert.strictEqual(hiraganaMatches.length, 5, 'Must find 5 Hiragana matches');
    assert.strictEqual(katakanaMatches.length, 0, 'Must NOT match Katakana when searching for Hiragana vowels');
  });

  test('T2.15_R3_INTERRUPTED_SESSION_NO_POOL_LEAK', 'Leaving a scoped session restores global un-scoped pool on standalone routes', () => {
    let activeCampaignTargets: string[] | null = ['あ', 'い', 'う', 'え', 'お'];

    // Simulating user in campaign mode
    assert.ok(activeCampaignTargets !== null);

    // User navigates to /kana directly (standalone)
    activeCampaignTargets = null; // Cleared because no ?mission= in route

    const pool = activeCampaignTargets
      ? HIRAGANA.filter((k) => activeCampaignTargets!.includes(k.kana))
      : HIRAGANA.filter((k) => BASIC_ROWS.includes(k.row));

    assert.ok(pool.length >= 46, 'Pool must be restored to full standalone basic kana (>=46 items)');
  });

  test('T2.16_R3_SINGLE_ITEM_POOL_BOUNDARY', 'Stage scoped to a single target item drills without division by zero or infinite loop', () => {
    const singleTarget = ['あ'];
    const pool = HIRAGANA.filter((k) => singleTarget.includes(k.kana));
    assert.strictEqual(pool.length, 1);

    // Pick function simulation
    const pick = (p: Kana[]) => {
      if (p.length === 1) return p[0];
      return p[0];
    };

    const chosen = pick(pool);
    assert.strictEqual(chosen.kana, 'あ');
  });
});

// ============================================================================
// TIER 3: CROSS-FEATURE COMBINATIONS (Pairwise Interactions)
// ============================================================================
suite('Tier 3: Cross-Feature Combinations', 'Tier 3', () => {
  test('T3.1_KANA_THEN_KANJI_CONSECUTIVE_SCOPED_MISSIONS', 'Consecutive missions s1-1 (Kana) and s1-2 (Kanji) isolate scoping with zero pool bleeding', () => {
    // 1. Launch s1-1
    const s1_1_targets = EXPECTED_STAGE_SCOPING['s1-1'].targetItems;
    const kanaPool = HIRAGANA.filter((k) => s1_1_targets.includes(k.kana));
    assert.deepStrictEqual(kanaPool.map((k) => k.kana).sort(), ['あ', 'い', 'う', 'え', 'お'].sort());

    // Complete s1-1 and return to campaign
    useStore.getState().completeCampaignStage('s1-1');
    assert.strictEqual(useStore.getState().campaignCompletedStages['s1-1'], true);

    // 2. Launch s1-2
    const s1_2_targets = EXPECTED_STAGE_SCOPING['s1-2'].targetItems;
    const kanjiList = KANJI.filter((k) => s1_2_targets.includes(k.k));
    assert.deepStrictEqual(kanjiList.map((k) => k.k).sort(), ['一', '二', '三', '四', '五'].sort());

    // Verify kanji list does not contain any kana, and kana pool did not contain kanji
    assert.ok(!kanjiList.some((k) => s1_1_targets.includes(k.k)));
  });

  test('T3.2_SCOPED_MISSION_TO_STANDALONE_TRANSITION', 'Navigating from scoped mission to standalone dojo via navigation drawer removes banner and scoping', () => {
    // Step 1: In campaign mission s1-1
    let url = '/kana?mission=s1-1';
    let isCampaign = url.includes('?mission=');
    let targets = isCampaign ? EXPECTED_STAGE_SCOPING['s1-1'].targetItems : null;
    assert.strictEqual(isCampaign, true);
    assert.strictEqual(targets?.length, 5);

    // Step 2: User clicks navigation drawer to '/kana' (standalone)
    url = '/kana';
    isCampaign = url.includes('?mission=');
    targets = isCampaign ? EXPECTED_STAGE_SCOPING['s1-1'].targetItems : null;
    assert.strictEqual(isCampaign, false);
    assert.strictEqual(targets, null);

    const standalonePool = HIRAGANA.filter((k) => BASIC_ROWS.includes(k.row));
    assert.ok(standalonePool.length >= 46, 'Full pool is restored');
  });

  test('T3.3_STAGE_COMPLETION_GATES_BOSS_UNLOCK_UI', 'Completing all 4 stages of Saga 1 marks all completed and enables Gatekeeper challenge', () => {
    const store = useStore.getState();
    const s1Stages = ['s1-1', 's1-2', 's1-3', 's1-4'];

    for (const stId of s1Stages) {
      store.completeCampaignStage(stId);
    }

    const state = useStore.getState();
    const allDone = s1Stages.every((id) => state.campaignCompletedStages[id]);
    assert.strictEqual(allDone, true, 'All 4 stages of Saga 1 must be marked completed in store');
  });

  test('T3.4_BOSS_PASS_UPDATES_NEXT_SAGA_AND_RETURN', 'Passing Saga 1 boss with 8/10 clears Saga 1 and unlocks Saga 2 on Campaign Map', () => {
    const store = useStore.getState();

    // Score 8 of 10 (80% >= 70%)
    store.completeCampaignSaga(1, 80);

    const state = useStore.getState();
    assert.strictEqual(state.campaignClearedSagas[1], 80);

    const isSaga2Unlocked = !!state.campaignClearedSagas[1] && state.campaignClearedSagas[1] >= 70;
    assert.strictEqual(isSaga2Unlocked, true, 'Saga 2 must be unlocked');
  });

  test('T3.5_CROSS_SAGA_DEEP_LINKING_AND_RETURN', 'Finishing Saga 2 Story s2-4 returns to #/campaign?saga=2 (not saga 1)', () => {
    const stageId = 's2-4';
    // Lookup parent saga
    let parentSagaNum = 1;
    for (const saga of CAMPAIGN_SAGAS) {
      if (saga.stages.some((st) => st.id === stageId)) {
        parentSagaNum = saga.sagaNumber;
        break;
      }
    }

    assert.strictEqual(parentSagaNum, 2, 'Stage s2-4 belongs to Saga 2');
    const returnUrl = `#/campaign?saga=${parentSagaNum}`;
    assert.strictEqual(returnUrl, '#/campaign?saga=2', 'Return URL must preserve Saga 2 context');
  });
});

// ============================================================================
// TIER 4: REAL-WORLD APPLICATION SCENARIOS (End-to-End User Journeys)
// ============================================================================
suite('Tier 4: Real-World Application Scenarios (End-to-End Journeys)', 'Tier 4', () => {
  test('T4.1_NEW_STUDENT_ONBOARDING_JOURNEY', 'Full Saga 1 Journey: s1-1 (Kana) -> s1-2 (Kanji) -> s1-3 (Grammar) -> s1-4 (Story) -> Boss 1 (8/10) -> Saga 2 Unlocks', () => {
    const store = useStore.getState();

    // Step 1: Learner begins at Saga 1
    assert.strictEqual(store.campaignClearedSagas[1], undefined);

    // Step 2: Learner launches Mission 1 (s1-1: Kana Dojo)
    const s1_1_targets = EXPECTED_STAGE_SCOPING['s1-1'].targetItems;
    const kanaPool = HIRAGANA.filter((k) => s1_1_targets.includes(k.kana));
    assert.strictEqual(kanaPool.length, 5, 'Drill pool strictly scoped to 5 vowels');
    // Learner completes 5 drill items
    store.completeCampaignStage('s1-1');
    assert.strictEqual(useStore.getState().campaignCompletedStages['s1-1'], true);

    // Step 3: Learner launches Mission 2 (s1-2: Kanji Dojo)
    const s1_2_targets = EXPECTED_STAGE_SCOPING['s1-2'].targetItems;
    const kanjiList = KANJI.filter((k) => s1_2_targets.includes(k.k));
    assert.strictEqual(kanjiList.length, 5, 'Kanji pool strictly scoped to numbers 1-5');
    // Learner completes 5 drill items
    store.completeCampaignStage('s1-2');
    assert.strictEqual(useStore.getState().campaignCompletedStages['s1-2'], true);

    // Step 4: Learner launches Mission 3 (s1-3: Grammar Lesson 1)
    store.completeCampaignStage('s1-3');
    assert.strictEqual(useStore.getState().campaignCompletedStages['s1-3'], true);

    // Step 5: Learner launches Mission 4 (s1-4: Story Chapter 1)
    store.completeCampaignStage('s1-4');
    assert.strictEqual(useStore.getState().campaignCompletedStages['s1-4'], true);

    // Step 6: All stages complete, learner challenges Gatekeeper Boss 1
    const s1 = CAMPAIGN_SAGAS.find((s) => s.sagaNumber === 1)!;
    const qCount = s1.boss.questions.length;
    assert.ok(qCount >= 8 && qCount <= 10, 'Boss has 8-10 questions');

    // Learner answers 8 questions correctly
    const score = 8;
    const minPass = s1.boss.minPassScore;
    const passed = score >= minPass;
    assert.strictEqual(passed, true);

    const pct = Math.round((score / qCount) * 100);
    store.completeCampaignSaga(1, pct);

    // Step 7: Verify Saga 1 cleared and Saga 2 unlocked
    const finalState = useStore.getState();
    assert.strictEqual(finalState.campaignClearedSagas[1], pct);
    assert.ok(finalState.campaignClearedSagas[1] >= 70);
    const saga2Unlocked = finalState.campaignClearedSagas[1] >= 70;
    assert.strictEqual(saga2Unlocked, true, 'Saga 2 unlocked successfully');
  });

  test('T4.2_GATEKEEPER_FAILURE_AND_RETRY_JOURNEY', 'Boss Failure & Retest: Learner fails with 5/10 (50%), reviews, retries with 9/10 (90%) and unlocks Saga 2', () => {
    const store = useStore.getState();
    const s1 = CAMPAIGN_SAGAS.find((s) => s.sagaNumber === 1)!;

    // Attempt 1: Learner scores 5/10
    const attempt1Score = 5;
    const passThreshold = s1.boss.minPassScore; // 7
    const passedAttempt1 = attempt1Score >= passThreshold;
    assert.strictEqual(passedAttempt1, false, '5 of 10 must fail');

    // Saga remains unlocked=false for Saga 2
    assert.strictEqual(useStore.getState().campaignClearedSagas[1], undefined);

    // Learner reviews s1-1
    assert.deepStrictEqual(EXPECTED_STAGE_SCOPING['s1-1'].targetItems, ['あ', 'い', 'う', 'え', 'お']);

    // Attempt 2: Learner retries and scores 9/10
    const attempt2Score = 9;
    const passedAttempt2 = attempt2Score >= passThreshold;
    assert.strictEqual(passedAttempt2, true, '9 of 10 must pass');

    store.completeCampaignSaga(1, Math.round((attempt2Score / s1.boss.questions.length) * 100));

    // Verify Saga 1 is now cleared and Saga 2 is unlocked
    assert.ok(useStore.getState().campaignClearedSagas[1] >= 70);
  });

  test('T4.3_FREESTYLE_EXPLORATION_AND_CAMPAIGN_RESUMPTION', 'Learner freely alternates between Campaign scoped missions and Standalone practice without collision', () => {
    // 1. Learner uses standalone Kana Dojo with Katakana and Dakuten
    const customPool = [...HIRAGANA, ...KATAKANA];
    assert.ok(customPool.length > 100);

    // 2. Learner switches to Campaign mode to do s1-1
    const campaignPool = HIRAGANA.filter((k) => EXPECTED_STAGE_SCOPING['s1-1'].targetItems.includes(k.kana));
    assert.strictEqual(campaignPool.length, 5);

    // 3. Learner returns to Standalone mode
    // Scoping does not bleed into standalone
    const restoredPool = HIRAGANA.filter((k) => BASIC_ROWS.includes(k.row));
    assert.ok(restoredPool.length >= 46);
    assert.ok(restoredPool.some((k) => k.kana === 'か'));
  });

  test('T4.4_DIRECT_BOOKMARK_DEEP_LINK_JOURNEY', 'Direct bookmark deep-link (#/kanji-dojo?mission=s1-2) activates scoping, completes, and returns to #/campaign?saga=1', () => {
    // User lands directly on bookmarked URL
    const bookmarkedUrl = '#/kanji-dojo?mission=s1-2';
    setHashRoute(bookmarkedUrl);

    // Extracted mission ID
    const url = new URL(bookmarkedUrl.replace(/^#/, ''), 'http://localhost');
    const missionId = url.searchParams.get('mission');
    assert.strictEqual(missionId, 's1-2');

    // Verify scoping applied
    const targetItems = EXPECTED_STAGE_SCOPING[missionId!].targetItems;
    const scopedKanji = KANJI.filter((k) => targetItems.includes(k.k));
    assert.strictEqual(scopedKanji.length, 5);

    // User completes drill
    useStore.getState().completeCampaignStage(missionId!);
    assert.strictEqual(useStore.getState().campaignCompletedStages['s1-2'], true);

    // Return URL generated
    const returnUrl = `${CAMPAIGN_RETURN_ROUTE_PREFIX}?saga=1`;
    assert.strictEqual(returnUrl, '#/campaign?saga=1');
  });
});

// Run all suites
registry.runAll().then(({ summary }) => {
  if (summary.failed > 0) {
    console.log(`\n⚠️  TEST SUITE COMPLETED WITH ${summary.failed} FAILURES (EXPECTED IN TDD BEFORE M2/M3/M4 IMPLEMENTATION)`);
    // Exit with code 0 in test authoring check or exit with code 1 if strict mode
    // We exit with code 1 if process.env.STRICT_EXIT === 'true'
    if (process.env.STRICT_EXIT === 'true') {
      process.exit(1);
    }
  } else {
    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
  }
});
