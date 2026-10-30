import { HashRouter, NavLink, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import KanaDojo from './pages/KanaDojo';
import Stories from './pages/Stories';
import StoryReader from './pages/StoryReader';
import Review from './pages/Review';
import { KanjiDetail, KanjiList } from './pages/Kanji';
import { GrammarLesson, GrammarList } from './pages/Grammar';
import { SceneList, ScenePlayer } from './pages/Speaking';
import { isDue, useStore } from './lib/store';

const LINKS = [
  { to: '/', icon: '家', label: 'Home', end: true },
  { to: '/kana', icon: 'あ', label: 'Kana' },
  { to: '/kanji', icon: '漢', label: 'Kanji' },
  { to: '/review', icon: '復', label: 'Review' },
  { to: '/grammar', icon: '文', label: 'Grammar' },
  { to: '/stories', icon: '物', label: 'Stories' },
  { to: '/speaking', icon: '話', label: 'Speak' },
];

export default function App() {
  const due = useStore((s) => Object.values(s.srs).filter((i) => isDue(i)).length);
  return (
    <HashRouter>
      <header className="nav">
        <NavLink to="/" className="logo">日本語<span>N5</span></NavLink>
        <nav className="top-links">
          {LINKS.slice(1).map((l) => (
            <NavLink key={l.to} to={l.to}>{l.label}{l.to === '/review' && due > 0 && <i className="badge">{due}</i>}</NavLink>
          ))}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kana" element={<KanaDojo />} />
          <Route path="/kanji" element={<KanjiList />} />
          <Route path="/kanji/:k" element={<KanjiDetail />} />
          <Route path="/review" element={<Review />} />
          <Route path="/grammar" element={<GrammarList />} />
          <Route path="/grammar/:id" element={<GrammarLesson />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/stories/:id" element={<StoryReader />} />
          <Route path="/speaking" element={<SceneList />} />
          <Route path="/speaking/:id" element={<ScenePlayer />} />
        </Routes>
      </main>
      {/* Mobile bottom tab bar */}
      <nav className="tabbar">
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end}>
            <span className="tab-icon">{l.icon}{l.to === '/review' && due > 0 && <i className="badge">{due}</i>}</span>
            <span className="tab-label">{l.label}</span>
          </NavLink>
        ))}
      </nav>
    </HashRouter>
  );
}
