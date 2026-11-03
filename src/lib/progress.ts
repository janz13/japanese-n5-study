import { LESSONS } from '../data/grammar.ts';
import { STORIES } from '../data/stories.ts';
import { PASS } from './store.ts';

export type Progress = {
  grammarDone: Record<string, number>;
  completedStories: Record<string, number>;
  campaignClearedSagas?: Record<number, number>;
  campaignCompletedStages?: Record<string, boolean>;
};

/**
 * Lesson for chapter N is open once the chapter N-1 story is complete,
 * OR if the lesson was already passed,
 * OR if the user reached/cleared the corresponding saga in Campaign Mode.
 */
export function lessonUnlocked(chapter: number, p: Progress) {
  if (chapter <= 1) return true;

  // 1. If already passed, it is ALWAYS unlocked
  if ((p.grammarDone[`g${chapter}`] ?? 0) >= PASS) return true;

  // 2. Standard daisy chain: preceding story is complete
  const prevStory = STORIES.find((s) => s.chapter === chapter - 1);
  if (prevStory && prevStory.id in p.completedStories) return true;

  // 3. Campaign Mode progression support:
  // If user cleared preceding sagas in Campaign Mode:
  // Saga 1 clears -> unlocks through g2
  // Saga 2 clears -> unlocks through g3
  // Saga 3 clears -> unlocks through g4
  // Saga 4 clears -> unlocks through g7
  // Saga 5 clears -> unlocks through g9
  // Saga 6 clears -> unlocks through g11
  const cleared = p.campaignClearedSagas ?? {};
  if ((cleared[6] ?? 0) >= 70 && chapter <= 11) return true;
  if ((cleared[5] ?? 0) >= 70 && chapter <= 9) return true;
  if ((cleared[4] ?? 0) >= 70 && chapter <= 7) return true;
  if ((cleared[3] ?? 0) >= 70 && chapter <= 4) return true;
  if ((cleared[2] ?? 0) >= 70 && chapter <= 3) return true;
  if ((cleared[1] ?? 0) >= 70 && chapter <= 2) return true;

  // 4. Campaign stage completion check
  const stages = p.campaignCompletedStages ?? {};
  if (chapter === 2 && (stages['s2-4'] || stages['s3-1'])) return true;
  if (chapter === 8 && stages['s6-2']) return true;
  if (chapter === 9 && stages['s6-3']) return true;

  return !prevStory;
}

/**
 * Story for chapter N is open once that chapter's grammar lesson is passed,
 * OR if the story was already completed,
 * OR if the user reached/cleared the corresponding saga in Campaign Mode.
 */
export function storyUnlocked(chapter: number, p: Progress) {
  // 1. If already completed, it is ALWAYS unlocked
  const currentStory = STORIES.find((s) => s.chapter === chapter);
  if (currentStory && currentStory.id in p.completedStories) return true;

  // 2. Standard daisy chain: corresponding grammar lesson is passed
  const lesson = LESSONS.find((l) => l.chapter === chapter);
  if (lesson && (p.grammarDone[lesson.id] ?? 0) >= PASS) return true;

  // 3. Campaign Mode progression support:
  const cleared = p.campaignClearedSagas ?? {};
  if ((cleared[5] ?? 0) >= 70 && chapter <= 9) return true;
  if ((cleared[4] ?? 0) >= 70 && chapter <= 7) return true;
  if ((cleared[3] ?? 0) >= 70 && chapter <= 4) return true;
  if ((cleared[2] ?? 0) >= 70 && chapter <= 3) return true;
  if ((cleared[1] ?? 0) >= 70 && chapter <= 2) return true;

  // 4. Campaign stage completion check
  const stages = p.campaignCompletedStages ?? {};
  if (chapter === 2 && (stages['s2-4'] || stages['s3-1'])) return true;
  if (chapter === 4 && stages['s4-4']) return true;

  return !lesson;
}
