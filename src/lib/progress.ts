import { LESSONS } from '../data/grammar';
import { STORIES } from '../data/stories';
import { PASS } from './store';

type Progress = { grammarDone: Record<string, number>; completedStories: Record<string, number> };

/** Lesson for chapter N is open once the chapter N-1 story is complete. */
export function lessonUnlocked(chapter: number, p: Progress) {
  if (chapter <= 1) return true;
  const prevStory = STORIES.find((s) => s.chapter === chapter - 1);
  return !prevStory || prevStory.id in p.completedStories;
}

/** Story for chapter N is open once that chapter's grammar lesson is passed. */
export function storyUnlocked(chapter: number, p: Progress) {
  const lesson = LESSONS.find((l) => l.chapter === chapter);
  return !lesson || (p.grammarDone[lesson.id] ?? 0) >= PASS;
}
