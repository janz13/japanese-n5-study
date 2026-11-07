import { useState } from 'react';
import { Link } from 'react-router-dom';
import { STORIES, type StoryCategory } from '../data/stories';
import { useStore } from '../lib/store';
import { storyUnlocked } from '../lib/progress';

const CATEGORIES: { id: StoryCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All Stories', icon: '📚' },
  { id: 'daily_life', label: 'Daily Life', icon: '🍵' },
  { id: 'folklore', label: 'Folklore & Legends', icon: '🏮' },
  { id: 'functional_media', label: 'Real-World Media', icon: '📰' },
  { id: 'mini_mystery', label: 'Mini-Mysteries', icon: '🔍' },
];

export default function Stories() {
  const p = useStore();
  const done = p.completedStories;
  const [selectedCat, setSelectedCat] = useState<StoryCategory | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'N5' | 'N4'>('all');

  const filteredStories = STORIES.filter((s) => {
    if (selectedCat !== 'all' && s.category !== selectedCat) return false;
    if (selectedLevel !== 'all' && s.level !== selectedLevel) return false;
    return true;
  });

  return (
    <div className="page">
      <h1>物語 <span className="muted">Graded Story Reader</span></h1>
      <p className="muted">
        32 graded stories across daily life, authentic folklore, real-world signage & manuals, and detective mini-mysteries.
      </p>

      {/* Category Pills */}
      <div className="controls" style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.4rem' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={selectedCat === cat.id ? 'chip on' : 'chip'}
            onClick={() => setSelectedCat(cat.id)}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Level Filter */}
      <div className="controls" style={{ marginBottom: '1.25rem', gap: '0.4rem' }}>
        {(['all', 'N5', 'N4'] as const).map((lvl) => (
          <button
            key={lvl}
            type="button"
            className={selectedLevel === lvl ? 'chip on' : 'chip'}
            onClick={() => setSelectedLevel(lvl)}
          >
            {lvl === 'all' ? 'All Levels' : lvl}
          </button>
        ))}
      </div>

      <div className="story-list">
        {filteredStories.map((s) => {
          const isDone = done[s.id] !== undefined;
          const isUnlocked = isDone || storyUnlocked(s.chapter, p);
          return (
            <Link
              key={s.id}
              to={`/stories/${s.id}`}
              className={isUnlocked ? 'story-card' : 'story-card locked'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="tag">{s.level} · Ch.{s.chapter}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {s.category === 'daily_life' && '🍵 Daily Life'}
                  {s.category === 'folklore' && '🏮 Folklore'}
                  {s.category === 'functional_media' && '📰 Media'}
                  {s.category === 'mini_mystery' && '🔍 Mystery'}
                </span>
              </div>
              <span className="story-title">{isUnlocked ? s.title : `🔒 ${s.title}`}</span>
              <span className="muted">
                {isUnlocked ? s.titleEn : `Pass grammar lesson ${s.chapter} to unlock (tap to read anyway)`}
              </span>
              {s.synopsis && isUnlocked && (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {s.synopsis}
                </span>
              )}
              {isDone && <span className="done">✓ {done[s.id]}%</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
