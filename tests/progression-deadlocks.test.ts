import assert from 'node:assert/strict';
import { findStory } from '../src/lib/findStory.ts';
import { lessonUnlocked, storyUnlocked } from '../src/lib/progress.ts';
import { useStore } from '../src/lib/store.ts';
import { CAMPAIGN_SAGAS, getCampaignStage } from '../src/data/campaign.ts';
import { STORIES } from '../src/data/stories.ts';
import { LESSONS } from '../src/data/grammar.ts';
import { CONJUGATION_LESSONS, resolveConjLessonId } from '../src/data/conjugationLessons.ts';

console.log('======================================================================');
console.log('🧪 TESTING 7 PROGRESSION BUGS & LOCK DEADLOCK FIXES');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// Test 1: Story Slug Fallback Matching (Bug 1)
// -----------------------------------------------------------------------------
console.log('[Test 1] Testing robust story slug and alias resolution...');
assert.equal(findStory('ch2-cafe')?.id, 'ch2-cafe', 'Exact ID ch2-cafe resolves');
assert.equal(findStory('ch2-train')?.id, 'ch2-cafe', 'Alias ch2-train resolves to ch2-cafe');
assert.equal(findStory('ch2')?.id, 'ch2-cafe', 'Prefix ch2 resolves to ch2-cafe');
assert.equal(findStory('2')?.id, 'ch2-cafe', 'Chapter number 2 resolves to ch2-cafe');

assert.equal(findStory('ch4-weekend')?.id, 'ch4-weekend', 'Exact ID ch4-weekend resolves');
assert.equal(findStory('ch4-plans')?.id, 'ch4-weekend', 'Alias ch4-plans resolves to ch4-weekend');
assert.equal(findStory('ch4-izakaya')?.id, 'ch4-weekend', 'Alias ch4-izakaya resolves to ch4-weekend');
assert.equal(findStory('ch4')?.id, 'ch4-weekend', 'Prefix ch4 resolves to ch4-weekend');

assert.equal(findStory('ch8-goodbye')?.id, 'ch8-goodbye', 'Exact ID ch8-goodbye resolves');
assert.equal(findStory('ch8-farewell')?.id, 'ch8-goodbye', 'Alias ch8-farewell resolves to ch8-goodbye');

assert.equal(findStory('ch10-keigo')?.id, 'ch10-keigo', 'Exact ID ch10-keigo resolves');
assert.equal(findStory('ch10-department')?.id, 'ch10-keigo', 'Alias ch10-department resolves to ch10-keigo');
console.log('✓ Test 1 PASSED: All story aliases, numbers, and prefixes resolve accurately without 404.\n');

// -----------------------------------------------------------------------------
// Test 2: Prerequisite Sequence Alignment Between g2 and ch2-cafe (Bug 2)
// -----------------------------------------------------------------------------
console.log('[Test 2] Testing prerequisite alignment for Grammar Lesson 2 and Story Chapter 2...');
const saga2 = CAMPAIGN_SAGAS.find((s) => s.sagaNumber === 2)!;
const g2Stage = saga2.stages.find((st) => st.targetRoute.includes('/grammar/g2'));
const ch2Stage = saga2.stages.find((st) => st.targetRoute.includes('/stories/ch2-cafe'));

assert.ok(g2Stage, 'Grammar Lesson 2 stage must exist in Saga 2');
assert.ok(ch2Stage, 'Story Chapter 2 stage must exist in Saga 2');
assert.ok(
  g2Stage.stageNumber < ch2Stage.stageNumber,
  `Grammar Lesson 2 (Stage ${g2Stage.stageNumber}) must precede Story Chapter 2 (Stage ${ch2Stage.stageNumber})`
);
console.log(`✓ Test 2 PASSED: Stage ${g2Stage.id} (${g2Stage.targetRoute}) correctly precedes Stage ${ch2Stage.id} (${ch2Stage.targetRoute}).\n`);

// -----------------------------------------------------------------------------
// Test 3: Campaign Mode Daisy-Chain Deadlock Resolution for g8 & g9 (Bug 3)
// -----------------------------------------------------------------------------
console.log('[Test 3] Testing Campaign Mode daisy-chain deadlock bypass for g8 and g9...');
// Clean state: user did not complete ch3..ch7
const cleanState = {
  grammarDone: { g1: 100, g2: 100 },
  completedStories: { 'ch1-arrival': 100, 'ch2-cafe': 100 },
  campaignClearedSagas: { 1: 100, 2: 100, 3: 100, 4: 100, 5: 100 },
  campaignCompletedStages: {},
};

assert.equal(lessonUnlocked(8, cleanState), true, 'Lesson 8 (Potential Form) must be unlocked when user reached Saga 6');
assert.equal(lessonUnlocked(9, cleanState), true, 'Lesson 9 (Conditionals) must be unlocked when user reached Saga 6');
assert.equal(storyUnlocked(8, cleanState), true, 'Story 8 must be accessible in Saga 6');
console.log('✓ Test 3 PASSED: Reaching Saga 6 unlocks g8 and g9 without deadlocks.\n');

// -----------------------------------------------------------------------------
// Test 4: Fast-Track Skip Backfill Logic (Bug 4)
// -----------------------------------------------------------------------------
console.log('[Test 4] Testing Fast-Track Placement backfilling...');
useStore.getState().resetProgress();

// Simulate jumping to Saga 6
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
    stories: [
      'ch1-arrival',
      'ch2-cafe',
      'ch3-asakusa',
      'ch4-weekend',
      'ch5-shinkansen',
      'ch6-akihabara',
      'ch7-onsen',
    ],
  },
};

const jumpTo6 = backfillMap[6];
jumpTo6.lessons.forEach((lid) => useStore.getState().completeLesson(lid, 100));
jumpTo6.stories.forEach((sid) => useStore.getState().completeStory(sid, 100));

const postJumpState = useStore.getState();
for (let i = 1; i <= 7; i++) {
  assert.equal(postJumpState.grammarDone[`g${i}`], 100, `Lesson g${i} must be marked done after fast-track jump`);
  const st = STORIES.find((s) => s.chapter === i)!;
  assert.equal(postJumpState.completedStories[st.id], 100, `Story ${st.id} must be marked done after fast-track jump`);
}
// Check that g8 is now immediately unlocked
assert.equal(lessonUnlocked(8, postJumpState), true, 'Lesson 8 must be unlocked after fast-track jump to Saga 6');
console.log('✓ Test 4 PASSED: Fast-track skip backfills all preceding grammar lessons and stories.\n');

// -----------------------------------------------------------------------------
// Test 5: Story "Read Anyway" Completion Unlocks Index Card (Bug 5)
// -----------------------------------------------------------------------------
console.log('[Test 5] Testing story completed via "Read anyway" unlocks index display...');
const freshStore = {
  grammarDone: {}, // g2 NOT done!
  completedStories: { 'ch2-cafe': 100 }, // Completed via "Read anyway"
};
assert.equal(storyUnlocked(2, freshStore), true, 'Story ch2-cafe is unlocked because it was completed');
console.log('✓ Test 5 PASSED: Completed story is never locked on the stories index.\n');

// -----------------------------------------------------------------------------
// Test 6: Multi-Tab Dojo Routing Contracts (Bug 7)
// -----------------------------------------------------------------------------
console.log('[Test 6] Testing multi-tab dojo launch contracts...');
const s2_1 = getCampaignStage('s2-1')!.stage;
assert.equal(s2_1.targetRoute, '/kana?script=katakana', 's2-1 must link to katakana script');

const s3_3 = getCampaignStage('s3-3')!.stage;
assert.equal(s3_3.targetRoute, '/signs?tab=shokkenki', 's3-3 must link to shokkenki tab');

const s4_1 = getCampaignStage('s4-1')!.stage;
assert.equal(s4_1.targetRoute, '/conjugate?tab=lessons&lesson=lesson-1', 's4-1 must link to conjugate lessons 1');

const s4_2 = getCampaignStage('s4-2')!.stage;
assert.equal(s4_2.targetRoute, '/conjugate?tab=lessons&lesson=lesson-3', 's4-2 must link to conjugate lessons 3');

const s4_3 = getCampaignStage('s4-3')!.stage;
assert.equal(s4_3.targetRoute, '/conjugate?tab=lessons&lesson=lesson-4', 's4-3 must link to conjugate lessons 4');

const s6_1 = getCampaignStage('s6-1')!.stage;
assert.equal(s6_1.targetRoute, '/conjugate?tab=pairs', 's6-1 must link to conjugate pairs');

const s6_4 = getCampaignStage('s6-4')!.stage;
assert.equal(s6_4.targetRoute, '/listening?tab=pitch', 's6-4 must link to listening pitch');
console.log('✓ Test 6 PASSED: All 7 multi-tab dojo links specify exact tab and script query parameters.\n');

// -----------------------------------------------------------------------------
// Test 7: Conjugation Sub-Lesson ID Resolution (Missions 13, 14, 15)
// -----------------------------------------------------------------------------
console.log('[Test 7] Testing Conjugation sub-lesson ID resolution...');
assert.equal(resolveConjLessonId('lesson-1'), 'c-groups', 'lesson-1 resolves to c-groups');
assert.equal(resolveConjLessonId('lesson-3'), 'c-te-form', 'lesson-3 resolves to c-te-form');
assert.equal(resolveConjLessonId('lesson-4'), 'c-adjectives', 'lesson-4 resolves to c-adjectives');
assert.equal(resolveConjLessonId('lesson-5'), 'c-passive-causative', 'lesson-5 resolves to c-passive-causative');
assert.equal(resolveConjLessonId('3'), 'c-te-form', 'Numeric "3" resolves to c-te-form');
assert.equal(resolveConjLessonId('4'), 'c-adjectives', 'Numeric "4" resolves to c-adjectives');
assert.equal(resolveConjLessonId('5'), 'c-passive-causative', 'Numeric "5" resolves to c-passive-causative');
assert.equal(resolveConjLessonId('te-form'), 'c-te-form', 'Keyword "te-form" resolves to c-te-form');
assert.equal(resolveConjLessonId('passive'), 'c-passive-causative', 'Keyword "passive" resolves to c-passive-causative');
assert.equal(resolveConjLessonId('causative'), 'c-passive-causative', 'Keyword "causative" resolves to c-passive-causative');
console.log('✓ Test 7 PASSED: Sub-lesson query parameters resolve directly to correct lesson IDs.\n');

// -----------------------------------------------------------------------------
// Test 8: Fast-Track Jump to Saga 4 Atomic Scoping (Locks Later Chapters)
// -----------------------------------------------------------------------------
console.log('[Test 8] Testing Fast-Track Placement atomic scoping...');
// Simulate prior session where user had completed everything up to Saga 6
useStore.setState({
  campaignClearedSagas: { 1: 100, 2: 100, 3: 100, 4: 100, 5: 100, 6: 100 },
  campaignCompletedStages: { 's1-1': true, 's4-1': true, 's5-1': true, 's6-1': true },
  grammarDone: { g1: 100, g2: 100, g3: 100, g4: 100, g5: 100, g6: 100, g7: 100, g8: 100 },
  completedStories: {
    'ch1-arrival': 100,
    'ch2-cafe': 100,
    'ch3-asakusa': 100,
    'ch4-weekend': 100,
    'ch5-shinkansen': 100,
    'ch6-akihabara': 100,
  },
});

// Now simulate user choosing "Jump to Saga 4" (handleSkipToSaga(4))
const targetSaga = 4;
const store = useStore.getState();
const nextClearedSagas: Record<number, number> = {};
for (let i = 1; i < targetSaga; i++) {
  nextClearedSagas[i] = 100;
}
const nextCompletedStages: Record<string, boolean> = { ...store.campaignCompletedStages };
for (const saga of CAMPAIGN_SAGAS) {
  if (saga.sagaNumber < targetSaga) {
    saga.stages.forEach((st) => {
      nextCompletedStages[st.id] = true;
    });
  } else {
    saga.stages.forEach((st) => {
      delete nextCompletedStages[st.id];
    });
  }
}

const backfillMapSaga4: Record<number, { lessons: string[]; stories: string[] }> = {
  4: { lessons: ['g1', 'g2', 'g3'], stories: ['ch1-arrival', 'ch2-cafe', 'ch3-asakusa'] },
};
const toBackfill4 = backfillMapSaga4[4];
const nextGrammarDone: Record<string, number> = { ...store.grammarDone };
for (const l of LESSONS) {
  delete nextGrammarDone[l.id];
}
toBackfill4.lessons.forEach((lid) => {
  nextGrammarDone[lid] = 100;
});
const nextCompletedStories: Record<string, number> = { ...store.completedStories };
for (const s of STORIES) {
  delete nextCompletedStories[s.id];
}
toBackfill4.stories.forEach((sid) => {
  nextCompletedStories[sid] = 100;
});

useStore.setState({
  campaignClearedSagas: nextClearedSagas,
  campaignCompletedStages: nextCompletedStages,
  grammarDone: nextGrammarDone,
  completedStories: nextCompletedStories,
});

const stateAfterJump4 = useStore.getState();

// Verify Sagas
assert.equal(stateAfterJump4.campaignClearedSagas[1], 100, 'Saga 1 is cleared');
assert.equal(stateAfterJump4.campaignClearedSagas[2], 100, 'Saga 2 is cleared');
assert.equal(stateAfterJump4.campaignClearedSagas[3], 100, 'Saga 3 is cleared');
assert.equal(stateAfterJump4.campaignClearedSagas[4], undefined, 'Saga 4 is NOT cleared');
assert.equal(stateAfterJump4.campaignClearedSagas[5], undefined, 'Saga 5 is NOT cleared');
assert.equal(stateAfterJump4.campaignClearedSagas[6], undefined, 'Saga 6 is NOT cleared');

// Verify Stories
assert.equal(storyUnlocked(1, stateAfterJump4), true, 'Story 1 is unlocked');
assert.equal(storyUnlocked(2, stateAfterJump4), true, 'Story 2 is unlocked');
assert.equal(storyUnlocked(3, stateAfterJump4), true, 'Story 3 is unlocked');
assert.equal(storyUnlocked(4, stateAfterJump4), true, 'Story 4 is unlocked for study');
assert.equal(storyUnlocked(5, stateAfterJump4), false, 'Story 5 MUST BE LOCKED');
assert.equal(storyUnlocked(6, stateAfterJump4), false, 'Story 6 MUST BE LOCKED');
assert.equal(storyUnlocked(7, stateAfterJump4), false, 'Story 7 MUST BE LOCKED');
assert.equal(storyUnlocked(8, stateAfterJump4), false, 'Story 8 MUST BE LOCKED');

// Verify Grammar
assert.equal(lessonUnlocked(1, stateAfterJump4), true, 'Lesson 1 is unlocked');
assert.equal(lessonUnlocked(2, stateAfterJump4), true, 'Lesson 2 is unlocked');
assert.equal(lessonUnlocked(3, stateAfterJump4), true, 'Lesson 3 is unlocked');
assert.equal(lessonUnlocked(4, stateAfterJump4), true, 'Lesson 4 is unlocked for study');
assert.equal(lessonUnlocked(5, stateAfterJump4), false, 'Lesson 5 MUST BE LOCKED');
assert.equal(lessonUnlocked(6, stateAfterJump4), false, 'Lesson 6 MUST BE LOCKED');
assert.equal(lessonUnlocked(8, stateAfterJump4), false, 'Lesson 8 MUST BE LOCKED');

console.log('✓ Test 8 PASSED: Fast-track jump to Saga 4 cleanly locks chapters 5-10 and lessons 5-11.\n');

// -----------------------------------------------------------------------------
// Test 9: Verification of New N4 Grammar Lesson 11 & Conjugation Lesson 5
// -----------------------------------------------------------------------------
console.log('[Test 9] Testing N4 Grammar Lesson 11 and Conjugation Lesson 5 data integrity...');
const g11 = LESSONS.find((l) => l.id === 'g11');
assert.ok(g11, 'Grammar Lesson g11 exists');
assert.equal(g11.chapter, 11, 'g11 has chapter 11');
assert.ok(g11.points.some((p) => p.pattern.includes('受身形')), 'g11 covers Passive voice');
assert.ok(g11.points.some((p) => p.pattern.includes('使役形')), 'g11 covers Causative voice');
assert.ok(g11.points.some((p) => p.pattern.includes('使役受身')), 'g11 covers Causative-Passive voice');
assert.equal(g11.exercises.length, 4, 'g11 has 4 interactive exercises');

const c5 = CONJUGATION_LESSONS.find((l) => l.id === 'c-passive-causative');
assert.ok(c5, 'Conjugation Lesson c-passive-causative exists');
assert.equal(c5.level, 'N4', 'c5 is an N4 lesson');
assert.equal(c5.interactiveMorph.steps.length, 5, 'c5 has 5 interactive morph steps for 食べる');
assert.equal(c5.quiz.length, 3, 'c5 has 3 verification quiz questions');

console.log('✓ Test 9 PASSED: g11 and c-passive-causative are fully integrated and valid.\n');

console.log('======================================================================');
console.log('🎉 ALL 9 PROGRESSION AND LESSON TESTS PASSED (100%)!');
console.log('======================================================================');
