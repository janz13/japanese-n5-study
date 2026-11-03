import { STORIES, type Story } from '../data/stories.ts';

export function findStory(id?: string): Story | undefined {
  if (!id) return undefined;
  const cleanId = id.trim().toLowerCase();

  // 1. Exact match
  const exact = STORIES.find((s) => s.id.toLowerCase() === cleanId);
  if (exact) return exact;

  // 2. Prefix match (e.g. 'ch2' matches 'ch2-cafe', 'ch4' matches 'ch4-weekend')
  const prefix = cleanId.split('-')[0];
  const byPrefix = STORIES.find((s) => s.id.toLowerCase().startsWith(prefix + '-'));
  if (byPrefix) return byPrefix;

  // 3. Chapter number match (e.g. 'ch2', 'chapter-2', '2')
  const numMatch = cleanId.match(/\d+/);
  if (numMatch) {
    const chNum = parseInt(numMatch[0], 10);
    const byNum = STORIES.find((s) => s.chapter === chNum);
    if (byNum) return byNum;
  }

  // 4. Keyword alias match for historical slugs
  if (cleanId.includes('cafe') || cleanId.includes('train')) return STORIES.find((s) => s.id === 'ch2-cafe');
  if (cleanId.includes('weekend') || cleanId.includes('plans') || cleanId.includes('izakaya')) {
    return STORIES.find((s) => s.id === 'ch4-weekend');
  }
  if (cleanId.includes('goodbye') || cleanId.includes('farewell')) return STORIES.find((s) => s.id === 'ch8-goodbye');
  if (cleanId.includes('keigo') || cleanId.includes('department')) return STORIES.find((s) => s.id === 'ch10-keigo');

  return undefined;
}
