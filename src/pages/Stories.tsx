import { Link } from 'react-router-dom';
import { STORIES } from '../data/stories';
import { useStore } from '../lib/store';
import { storyUnlocked } from '../lib/progress';

export default function Stories() {
  const p = useStore();
  const done = p.completedStories;
  return (
    <div className="page">
      <h1>物語 <span className="muted">Stories</span></h1>
      <p className="muted">Follow Ana's first weeks in Japan. Each chapter unlocks after its grammar lesson.</p>
      <div className="story-list">
        {STORIES.map((s) => {
          const isDone = done[s.id] !== undefined;
          const isUnlocked = isDone || storyUnlocked(s.chapter, p);
          return (
            <Link
              key={s.id}
              to={`/stories/${s.id}`}
              className={isUnlocked ? 'story-card' : 'story-card locked'}
            >
              <span className="tag">{s.level} · Ch.{s.chapter}</span>
              <span className="story-title">{isUnlocked ? s.title : `🔒 ${s.title}`}</span>
              <span className="muted">
                {isUnlocked ? s.titleEn : `Pass grammar lesson ${s.chapter} to unlock (tap to read anyway)`}
              </span>
              {isDone && <span className="done">✓ {done[s.id]}%</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
