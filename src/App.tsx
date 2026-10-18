import { lazy, Suspense, useEffect, useState } from 'react';
import { ModelStatus } from './components/ModelStatus';
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

  return (
    <>
      <header className="app-header">
        <div className="brand">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={28} height={28} />
          <h1>CVMaker</h1>
        </div>
        <nav className="tabs" role="tablist" aria-label="Sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls="panel"
              className={`tab${tab === t.id ? ' active' : ''}`}
              onClick={() => go(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <ModelStatus />
      </header>
      {aiStatus === 'unsupported' && (
        <div className="banner" role="note">
          {aiMessage} For the AI features, use a recent Chrome or Edge on a computer with a GPU.
        </div>
      )}
      <main id="panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === 'profile' && <MyProfileTab />}
        {tab === 'keywords' && <KeywordTab onDone={() => go('generator')} />}
        {tab === 'generator' && (
          <Suspense fallback={<p className="muted">Loading the CV generator…</p>}>
            <GeneratorTab />
          </Suspense>
        )}
      </main>
      <footer className="app-footer small muted">
        Everything runs in your browser. Your CV and job descriptions never leave this device.
      </footer>
    </>
  );
}
