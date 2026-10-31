import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { HashRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import StampBook from './pages/StampBook';
import CommandPalette from './components/CommandPalette';
import { isDue, useStore } from './lib/store';
import { stopSpeaking } from './lib/tts';

// Lazy-load secondary routes so initial bundle load is ultra-fast
const DailyBento = lazy(() => import('./pages/DailyBento'));
const SignDecoder = lazy(() => import('./pages/SignDecoder'));
const Listening = lazy(() => import('./pages/Listening'));
const DriveMode = lazy(() => import('./pages/DriveMode'));
const KanaDojo = lazy(() => import('./pages/KanaDojo'));
const ConjugationDojo = lazy(() => import('./pages/ConjugationDojo'));
const CounterDojo = lazy(() => import('./pages/CounterDojo'));
const ParticleDojo = lazy(() => import('./pages/ParticleDojo'));
const Stories = lazy(() => import('./pages/Stories'));
const StoryReader = lazy(() => import('./pages/StoryReader'));
const Review = lazy(() => import('./pages/Review'));
const Exam = lazy(() => import('./pages/Exam'));
const KanjiList = lazy(() => import('./pages/Kanji').then((m) => ({ default: m.KanjiList })));
const KanjiDetail = lazy(() => import('./pages/Kanji').then((m) => ({ default: m.KanjiDetail })));
const GrammarList = lazy(() => import('./pages/Grammar').then((m) => ({ default: m.GrammarList })));
const GrammarLesson = lazy(() => import('./pages/Grammar').then((m) => ({ default: m.GrammarLesson })));
const SceneList = lazy(() => import('./pages/Speaking').then((m) => ({ default: m.SceneList })));
const ScenePlayer = lazy(() => import('./pages/Speaking').then((m) => ({ default: m.ScenePlayer })));

interface NavItem {
  to: string;
  icon: string;
  label: string;
  shortLabel?: string;
  end?: boolean;
}

const LINKS: NavItem[] = [
  { to: '/', icon: '家', label: 'Home', end: true },
  { to: '/bento', icon: '弁', label: 'Bento' },
  { to: '/kana', icon: 'あ', label: 'Kana' },
  { to: '/kanji', icon: '漢', label: 'Kanji' },
  { to: '/conjugate', icon: '活', label: 'Verbs' },
  { to: '/counters', icon: '数', label: 'Counters' },
  { to: '/particles', icon: '助', label: 'Particles' },
  { to: '/review', icon: '復', label: 'Review' },
  { to: '/grammar', icon: '文', label: 'Grammar' },
  { to: '/stories', icon: '物', label: 'Stories' },
  { to: '/speaking', icon: '話', label: 'Speak' },
  { to: '/listening', icon: '聴', label: 'Listen' },
  { to: '/drive', icon: '音', label: 'Drive' },
  { to: '/signs', icon: '看', label: 'Signs' },
  { to: '/stamps', icon: '印', label: 'Stamps' },
  { to: '/exam', icon: '試', label: 'Exam' },
];

const NAV_GROUPS: { id: string; label: string; icon: string; items: NavItem[] }[] = [
  {
    id: 'daily',
    label: 'Daily',
    icon: '🍱',
    items: [
      { to: '/bento', icon: '弁', label: 'Daily Bento', shortLabel: 'Bento' },
      { to: '/review', icon: '復', label: 'FSRS Review', shortLabel: 'Review' },
      { to: '/stamps', icon: '印', label: 'Stamp Book', shortLabel: 'Stamps' },
    ],
  },
  {
    id: 'drills',
    label: 'Drills',
    icon: '🥋',
    items: [
      { to: '/kana', icon: 'あ', label: 'Kana Dojo', shortLabel: 'Kana' },
      { to: '/kanji', icon: '漢', label: 'Kanji Studio', shortLabel: 'Kanji' },
      { to: '/conjugate', icon: '活', label: 'Verb & Pair Dojo', shortLabel: 'Verbs' },
      { to: '/counters', icon: '数', label: 'Counter Dojo', shortLabel: 'Counters' },
      { to: '/particles', icon: '助', label: 'Particle Dojo', shortLabel: 'Particles' },
    ],
  },
  {
    id: 'immersion',
    label: 'Immersion',
    icon: '🏮',
    items: [
      { to: '/drive', icon: '音', label: 'Hands-Free Drive Podcast', shortLabel: 'Drive' },
      { to: '/grammar', icon: '文', label: 'Grammar', shortLabel: 'Grammar' },
      { to: '/stories', icon: '物', label: 'Graded Stories', shortLabel: 'Stories' },
      { to: '/speaking', icon: '話', label: 'Speaking', shortLabel: 'Speak' },
      { to: '/listening', icon: '聴', label: 'Listening', shortLabel: 'Listen' },
      { to: '/signs', icon: '看', label: 'Sign Decoder', shortLabel: 'Signs' },
    ],
  },
];

function HeaderNav({
  due,
  theme,
  toggleTheme,
  drawerOpen,
  setDrawerOpen,
  onOpenSearch,
}: {
  due: number;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenSearch: () => void;
}) {
  const location = useLocation();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setOpenGroup(null);
    setDrawerOpen(false);
    stopSpeaking();
  }, [location.pathname, setDrawerOpen]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const isRouteInItem = (to: string) =>
    location.pathname === to || (to !== '/' && location.pathname.startsWith(to + '/'));

  return (
    <header className="nav" ref={navRef}>
      <NavLink to="/" className="logo" onClick={() => setDrawerOpen(false)}>
        日本語<span>N5/N4</span>
      </NavLink>

      <nav className="top-links" aria-label="Main navigation">
        {NAV_GROUPS.map((group) => {
          const activeItem = group.items.find((i) => isRouteInItem(i.to));
          const isOpen = openGroup === group.id;
          const showDueBadge = group.id === 'daily' && due > 0;
          return (
            <div
              key={group.id}
              className={`nav-group ${isOpen ? 'open' : ''}`}
              onMouseEnter={() => setOpenGroup(group.id)}
              onMouseLeave={() => setOpenGroup((cur) => (cur === group.id ? null : cur))}
            >
              <button
                type="button"
                className={`nav-group-btn ${activeItem ? 'active' : ''}`}
                aria-expanded={isOpen}
                onClick={() => setOpenGroup((cur) => (cur === group.id ? null : group.id))}
              >
                <span>
                  {group.icon} {group.label}
                  {activeItem ? ` · ${activeItem.shortLabel ?? activeItem.label}` : ''}
                </span>
                {showDueBadge && <i className="badge">{due}</i>}
                <span className="nav-caret">▾</span>
              </button>

              {isOpen && (
                <div className="nav-dropdown" role="menu">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) => `nav-dropdown-link ${isActive ? 'active' : ''}`}
                      onClick={() => setOpenGroup(null)}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem' }}>
                        <span className="nav-dropdown-icon">{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      {item.to === '/review' && due > 0 && <i className="badge">{due}</i>}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <NavLink
          to="/drive"
          className={({ isActive }) => `nav-group-btn ${isActive ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
          title="Hands-Free Driving & Commute Podcast Mode"
        >
          📻 Drive
        </NavLink>

        <NavLink
          to="/exam"
          className={({ isActive }) => `nav-group-btn ${isActive ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          💮 Exam
        </NavLink>
      </nav>

      <div className="nav-actions">
        <button
          type="button"
          className="chip theme-btn"
          aria-label="Open dictionary & quick search (Ctrl+K)"
          onClick={onOpenSearch}
          title="Instant Dictionary & Module Search (Ctrl+K / ⌘K)"
        >
          🔍 辞書 <span className="muted small">⌘K</span>
        </button>
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
  );
}

export default function App() {
  const due = useStore((s) => Object.values(s.srs).filter((i) => isDue(i)).length);
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <HashRouter>
      <HeaderNav
        due={due}
        theme={theme}
        toggleTheme={toggleTheme}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />

      {drawerOpen && (
        <nav className="mobile-drawer" onClick={() => setDrawerOpen(false)}>
          <NavLink to="/" end className="drawer-link">
            <span className="jp">家</span>
            <span>Dashboard Home</span>
          </NavLink>
          {NAV_GROUPS.map((group) => (
            <div key={group.id}>
              <div className="drawer-section-title">
                {group.icon} {group.label}
              </div>
              {group.items.map((l) => (
                <NavLink key={l.to} to={l.to} className="drawer-link">
                  <span className="jp">{l.icon}</span>
                  <span>{l.label}</span>
                  {l.to === '/review' && due > 0 && <i className="badge">{due}</i>}
                </NavLink>
              ))}
            </div>
          ))}
          <div className="drawer-section-title">💮 Official Exam</div>
          <NavLink to="/exam" className="drawer-link">
            <span className="jp">試</span>
            <span>JLPT Mock Exam</span>
          </NavLink>
        </nav>
      )}

      <main>
        <Suspense fallback={<div className="page muted center" style={{ paddingTop: '3rem' }}>読み込み中… Loading…</div>}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bento" element={<DailyBento />} />
            <Route path="/kana" element={<KanaDojo />} />
            <Route path="/kanji" element={<KanjiList />} />
            <Route path="/kanji/:k" element={<KanjiDetail />} />
            <Route path="/conjugate" element={<ConjugationDojo />} />
            <Route path="/counters" element={<CounterDojo />} />
            <Route path="/particles" element={<ParticleDojo />} />
            <Route path="/review" element={<Review />} />
            <Route path="/grammar" element={<GrammarList />} />
            <Route path="/grammar/:id" element={<GrammarLesson />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/stories/:id" element={<StoryReader />} />
            <Route path="/speaking" element={<SceneList />} />
            <Route path="/speaking/:id" element={<ScenePlayer />} />
            <Route path="/stamps" element={<StampBook />} />
            <Route path="/signs" element={<SignDecoder />} />
            <Route path="/listening" element={<Listening />} />
            <Route path="/drive" element={<DriveMode />} />
            <Route path="/exam" element={<Exam />} />
          </Routes>
        </Suspense>
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
