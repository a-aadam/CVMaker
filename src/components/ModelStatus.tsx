import { loadEngine, useAi } from '../ai/engine';
import { ShieldIcon } from './icons';

export function ModelStatus() {
  const { status, enabled, progress, message, setEnabled } = useAi();

  let label: string;
  let short: string;
  let tone = '';
  if (!enabled) [label, short] = ['AI off · rules only', 'AI off'];
  else if (status === 'checking') [label, short] = ['Checking device…', 'AI…'];
  else if (status === 'unsupported') {
    [label, short] = ['AI unavailable · rules only', 'No AI'];
    tone = 'warn';
  } else if (status === 'idle') [label, short] = ['AI not loaded', 'AI idle'];
  else if (status === 'loading') {
    [label, short] = [`Loading AI ${Math.round(progress * 100)}%`, `AI ${Math.round(progress * 100)}%`];
    tone = 'loading';
  } else if (status === 'ready') {
    [label, short] = ['On-device AI ready', 'AI ready'];
    tone = 'ok';
  } else {
    [label, short] = ['AI failed · rules only', 'AI failed'];
    tone = 'warn';
  }

  return (
    <div className={`model-status${enabled ? '' : ' ai-off'}`}>
      <span className="privacy" title="Your CV, job descriptions and the AI model stay in this browser">
        <ShieldIcon />
        <span className="privacy-long">On-device · nothing leaves this browser</span>
        <span className="privacy-short">Private · on-device</span>
        <span className="privacy-tiny">Private</span>
      </span>
      <span className="divider" aria-hidden />
      <span className="status-text" title={message || undefined} role="status">
        <span className={`status-dot ${tone}`} aria-hidden />
        <span className="status-label">{label}</span>
        <span className="status-short" aria-hidden>
          {short}
        </span>
      </span>
      {status === 'loading' && (
        <progress className="model-progress" value={progress} max={1} aria-label="AI model download progress" />
      )}
      {enabled && (status === 'idle' || status === 'error') && (
        <button
          type="button"
          className="shell-btn"
          onClick={() => loadEngine().catch(() => {})}
          title="About 280 MB, downloaded once and cached in this browser"
        >
          Load AI
        </button>
      )}
      {status !== 'unsupported' && (
        <label className="switch" title="Turn the on-device AI on or off">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          <span className="switch-label" aria-hidden>
            Use AI
          </span>
          <span className="sr-only">Use on-device AI</span>
        </label>
      )}
    </div>
  );
}
