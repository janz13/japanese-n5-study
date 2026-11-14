import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { HashRouter, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import StampBook from './pages/StampBook';
import CommandPalette from './components/CommandPalette';
import { isDue, useStore } from './lib/store';
import { stopSpeaking } from './lib/tts';

// Lazy-load secondary routes with auto-retry on chunk failure (prevents blank screen after new deployments)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lazyWithRetry<T extends React.ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  return lazy(() =>
    factory().catch((err) => {
      const reloaded = sessionStorage.getItem('chunk_reload');
      if (!reloaded) {
        sessionStorage.setItem('chunk_reload', 'true');
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }
      sessionStorage.removeItem('chunk_reload');
      throw err;
    }),
  );
}

const Campaign = lazyWithRetry(() => import('./pages/Campaign'));
const KanjiDojo = lazyWithRetry(() => import('./pages/KanjiDojo'));
const DailyBento = lazyWithRetry(() => import('./pages/DailyBento'));
const SignDecoder = lazyWithRetry(() => import('./pages/SignDecoder'));
const Listening = lazyWithRetry(() => import('./pages/Listening'));
const DriveMode = lazyWithRetry(() => import('./pages/DriveMode'));
const KanaDojo = lazyWithRetry(() => import('./pages/KanaDojo'));
const ConjugationDojo = lazyWithRetry(() => import('./pages/ConjugationDojo'));
const CounterDojo = lazyWithRetry(() => import('./pages/CounterDojo'));
const ParticleDojo = lazyWithRetry(() => import('./pages/ParticleDojo'));
const Stories = lazyWithRetry(() => import('./pages/Stories'));
const StoryReader = lazyWithRetry(() => import('./pages/StoryReader'));
const Review = lazyWithRetry(() => import('./pages/Review'));
const Exam = lazyWithRetry(() => import('./pages/Exam'));
const KanjiList = lazyWithRetry(() => import('./pages/Kanji').then((m) => ({ default: m.KanjiList })));
const KanjiDetail = lazyWithRetry(() => import('./pages/Kanji').then((m) => ({ default: m.KanjiDetail })));
const GrammarList = lazyWithRetry(() => import('./pages/Grammar').then((m) => ({ default: m.GrammarList })));
const GrammarLesson = lazyWithRetry(() => import('./pages/Grammar').then((m) => ({ default: m.GrammarLesson })));
const SceneList = lazyWithRetry(() => import('./pages/Speaking').then((m) => ({ default: m.SceneList })));
const ScenePlayer = lazyWithRetry(() => import('./pages/Speaking').then((m) => ({ default: m.ScenePlayer })));

interface NavItem {
  to: string;
  icon: string;
  label: string;
  shortLabel?: string;
  end?: boolean;
}

const MOBILE_TABS: NavItem[] = [
  { to: '/', icon: '🏠', label: 'Home', end: true },
  { to: '/campaign', icon: '🗺️', label: 'Campaign' },
  { to: '/bento', icon: '🍱', label: 'Bento' },
  { to: '/review', icon: '🗂️', label: 'Review' },
  { to: '/kana', icon: '✍️', label: 'Practice' },
];

const NAV_GROUPS: { id: string; label: string; icon: string; items: NavItem[] }[] = [
  {
    id: 'daily',
    label: 'Daily',
    icon: '🍱',
    items: [
      { to: '/bento', icon: '🍱', label: 'Daily Bento (5m)', shortLabel: 'Bento' },
      { to: '/review', icon: '🗂️', label: 'SRS Review', shortLabel: 'Review' },
      { to: '/stamps', icon: '🔖', label: 'Stamp Book', shortLabel: 'Stamps' },
    ],
  },
  {
    id: 'drills',
    label: 'Practice',
    icon: '⚡',
    items: [
      { to: '/kana', icon: '✍️', label: 'Kana Dojo', shortLabel: 'Kana' },
      { to: '/kanji-dojo', icon: '⚡', label: 'Kanji Typing Dojo', shortLabel: 'Kanji Dojo' },
      { to: '/kanji', icon: '🀄', label: 'Kanji Reference & Stroke', shortLabel: 'Kanji' },
      { to: '/conjugate', icon: '🔄', label: 'Verbs & Conjugation', shortLabel: 'Verbs' },
      { to: '/particles', icon: '🎯', label: 'Particles & Onomatopoeia', shortLabel: 'Particles' },
      { to: '/counters', icon: '🔢', label: 'Counters & Numbers', shortLabel: 'Counters' },
    ],
  },
  {
    id: 'immersion',
    label: 'Immersion',
    icon: '🏮',
    items: [
      { to: '/grammar', icon: '📐', label: 'Grammar Lessons', shortLabel: 'Grammar' },
      { to: '/stories', icon: '📖', label: 'Graded Stories', shortLabel: 'Stories' },
      { to: '/speaking', icon: '🎤', label: 'Speaking Role-Play', shortLabel: 'Speak' },
      { to: '/listening', icon: '🎧', label: 'Listening & Pitch', shortLabel: 'Listen' },
      { to: '/signs', icon: '🍜', label: 'Signs & Ticket Machines', shortLabel: 'Signs' },
      { to: '/drive', icon: '📻', label: 'Hands-Free Drive Audio', shortLabel: 'Drive' },
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
    sessionStorage.removeItem('chunk_reload');
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
        <NavLink
          to="/campaign"
          className={({ isActive }) => `nav-group-btn ${isActive ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
          title="Guided Step-by-Step Odyssey: Zero to N4"
        >
          🗺️ Campaign
        </NavLink>

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
          to="/exam"
          className={({ isActive }) => `nav-group-btn ${isActive ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          🎓 Exam
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
            <span className="jp">🏠</span>
            <span>Dashboard Home</span>
          </NavLink>
          <NavLink to="/campaign" className="drawer-link">
            <span className="jp">🗺️</span>
            <span>Campaign Mode</span>
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
          <div className="drawer-section-title">🎓 Official Exam</div>
          <NavLink to="/exam" className="drawer-link">
            <span className="jp">🎓</span>
            <span>JLPT Mock Exam</span>
          </NavLink>
        </nav>
      )}

      <main>
        <Suspense fallback={<div className="page muted center" style={{ paddingTop: '3rem' }}>読み込み中… Loading…</div>}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/campaign" element={<Campaign />} />
            <Route path="/kanji-dojo" element={<KanjiDojo />} />
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
            <Route path="/settings" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="tabbar">
        {MOBILE_TABS.map((l) => (
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
