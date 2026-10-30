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
        {STORIES.map((s) =>
          storyUnlocked(s.chapter, p) ? (
            <Link key={s.id} to={`/stories/${s.id}`} className="story-card">
              <span className="tag">{s.level} · Ch.{s.chapter}</span>
              <span className="story-title">{s.title}</span>
              <span className="muted">{s.titleEn}</span>
              {done[s.id] !== undefined && <span className="done">✓ {done[s.id]}%</span>}
            </Link>
          ) : (
            <Link key={s.id} to="/grammar" className="story-card locked">
              <span className="tag">{s.level} · Ch.{s.chapter}</span>
              <span className="story-title">🔒 {s.title}</span>
              <span className="muted">Pass grammar lesson {s.chapter} to unlock</span>
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
