import { loadEngine, useAi } from '../ai/engine';
import { SparkIcon } from './icons';

export function ModelStatus() {
  const { status, enabled, progress, message, setEnabled } = useAi();

  let label: string;
  let tone = '';
  if (!enabled) label = 'AI off, using rules';
  else if (status === 'checking') label = 'Checking device…';
  else if (status === 'unsupported') {
    label = 'AI unavailable, using rules';
    tone = 'warn';
  } else if (status === 'idle') label = 'AI not loaded';
  else if (status === 'loading') label = `Loading AI ${Math.round(progress * 100)}%`;
  else if (status === 'ready') {
    label = 'AI ready';
    tone = 'ok';
  } else {
    label = 'AI failed, using rules';
    tone = 'warn';
  }

  return (
    <div className="model-status">
      <span className={`pill ${tone}`} title={message || undefined}>
        <SparkIcon />
        {label}
      </span>
      {status === 'loading' && (
        <progress className="model-progress" value={progress} max={1} aria-label="AI model download progress" />
      )}
      {enabled && (status === 'idle' || status === 'error') && (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => loadEngine().catch(() => {})}
          title="About 300 MB, downloaded once and cached in your browser"
        >
          Load now
        </button>
      )}
      {status !== 'unsupported' && (
        <label className="check small" title="Turn the on-device AI on or off">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Use AI
        </label>
      )}
    </div>
  );
}
