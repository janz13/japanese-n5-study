import { useEffect, useState } from 'react';
import { HashRouter, NavLink, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import KanaDojo from './pages/KanaDojo';
import ConjugationDojo from './pages/ConjugationDojo';
import Stories from './pages/Stories';
import StoryReader from './pages/StoryReader';
import Review from './pages/Review';
import Exam from './pages/Exam';
import { KanjiDetail, KanjiList } from './pages/Kanji';
import { GrammarLesson, GrammarList } from './pages/Grammar';
import { SceneList, ScenePlayer } from './pages/Speaking';
import { isDue, useStore } from './lib/store';

const LINKS = [
  { to: '/', icon: '家', label: 'Home', end: true },
  { to: '/kana', icon: 'あ', label: 'Kana' },
  { to: '/kanji', icon: '漢', label: 'Kanji' },
  { to: '/conjugate', icon: '活', label: 'Verbs' },
  { to: '/review', icon: '復', label: 'Review' },
  { to: '/grammar', icon: '文', label: 'Grammar' },
  { to: '/stories', icon: '物', label: 'Stories' },
  { to: '/speaking', icon: '話', label: 'Speak' },
  { to: '/exam', icon: '試', label: 'Exam' },
];

export default function App() {
  const due = useStore((s) => Object.values(s.srs).filter((i) => isDue(i)).length);
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <HashRouter>
      <header className="nav">
        <NavLink to="/" className="logo" onClick={() => setDrawerOpen(false)}>
          日本語<span>N5</span>
        </NavLink>
        <nav className="top-links">
          {LINKS.slice(1).map((l) => (
            <NavLink key={l.to} to={l.to}>
              {l.label}
              {l.to === '/review' && due > 0 && <i className="badge">{due}</i>}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          <button
            className="chip theme-btn"
            aria-label="Toggle light/dark theme"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme'}
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button
            className="menu-btn"
            aria-label="Toggle navigation menu"
            onClick={() => setDrawerOpen((o) => !o)}
          >
            {drawerOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {drawerOpen && (
        <nav className="mobile-drawer" onClick={() => setDrawerOpen(false)}>
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="drawer-link">
              <span className="jp">{l.icon}</span>
              <span>{l.label}</span>
              {l.to === '/review' && due > 0 && <i className="badge">{due}</i>}
            </NavLink>
          ))}
        </nav>
      )}

      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kana" element={<KanaDojo />} />
          <Route path="/kanji" element={<KanjiList />} />
          <Route path="/kanji/:k" element={<KanjiDetail />} />
          <Route path="/conjugate" element={<ConjugationDojo />} />
          <Route path="/review" element={<Review />} />
          <Route path="/grammar" element={<GrammarList />} />
          <Route path="/grammar/:id" element={<GrammarLesson />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/stories/:id" element={<StoryReader />} />
          <Route path="/speaking" element={<SceneList />} />
          <Route path="/speaking/:id" element={<ScenePlayer />} />
          <Route path="/exam" element={<Exam />} />
        </Routes>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="tabbar">
        {LINKS.slice(0, 7).map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end}>
            <span className="tab-icon">
              {l.icon}
              {l.to === '/review' && due > 0 && <i className="badge">{due}</i>}
            </span>
            <span className="tab-label">{l.label}</span>
          </NavLink>
        ))}
      </nav>
    </HashRouter>
  );
}
