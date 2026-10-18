import { lazy, Suspense, useEffect, useState, type KeyboardEvent } from 'react';
import { ModelStatus } from './components/ModelStatus';
import { BrandMark, ShieldIcon } from './components/icons';
import { KeywordTab } from './tabs/KeywordTab';
import { MyProfileTab } from './tabs/MyProfileTab';
import { useAi } from './ai/engine';

// The PDF renderer is large, so it loads only when the CV Generator tab is opened.
const GeneratorTab = lazy(() => import('./tabs/GeneratorTab').then((m) => ({ default: m.GeneratorTab })));

const TABS = [
  { id: 'profile', label: 'My Profile' },
  { id: 'keywords', label: 'Keyword Extractor' },
  { id: 'generator', label: 'CV Generator' },
] as const;
type TabId = (typeof TABS)[number]['id'];

const fromHash = (): TabId => {
  const h = location.hash.replace('#', '');
  return TABS.some((t) => t.id === h) ? (h as TabId) : 'profile';
};

export default function App() {
  const [tab, setTab] = useState<TabId>(fromHash);
  const aiStatus = useAi((s) => s.status);
  const aiMessage = useAi((s) => s.message);

  useEffect(() => {
    const onHash = () => setTab(fromHash());
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);

  const go = (id: TabId) => {
    if (location.hash !== `#${id}`) location.hash = id;
    setTab(id);
    scrollTo({ top: 0 });
  };

  // Arrow, Home and End keys move between tabs, as the ARIA tabs pattern expects.
  const onTabKey = (e: KeyboardEvent, i: number) => {
    const moves: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: TABS.length - 1 };
    if (!(e.key in moves)) return;
    e.preventDefault();
    const t = TABS[(moves[e.key] + TABS.length) % TABS.length];
    go(t.id);
    document.getElementById(`tab-${t.id}`)?.focus();
  };

  return (
    <>
      <a className="skip-link" href="#panel">
        Skip to content
      </a>
      <header className="app-header">
        <div className="brand">
          <BrandMark className="brand-mark" />
          <h1>CVMaker</h1>
        </div>
        <nav className="tabs" role="tablist" aria-label="Workspace">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls="panel"
              tabIndex={tab === t.id ? 0 : -1}
              className="tab"
              onClick={() => go(t.id)}
              onKeyDown={(e) => onTabKey(e, i)}
            >
              <span className="tab-step" aria-hidden>
                {i + 1}
              </span>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="header-end">
          <ModelStatus />
        </div>
      </header>
      {aiStatus === 'unsupported' && (
        <div className="banner" role="note">
          {aiMessage} For AI features, use a recent Chrome or Edge on a computer with a GPU.
        </div>
      )}
      <main id="panel" role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={-1}>
        <div key={tab} className="panel-enter">
          {tab === 'profile' && <MyProfileTab />}
          {tab === 'keywords' && <KeywordTab onDone={() => go('generator')} />}
          {tab === 'generator' && (
            <Suspense fallback={<p className="muted page">Loading the CV generator…</p>}>
              <GeneratorTab />
            </Suspense>
          )}
        </div>
      </main>
      <footer className="app-footer">
        <ShieldIcon />
        <span>Everything runs in this browser. Your CV and job descriptions never leave this device.</span>
      </footer>
    </>
  );
}
