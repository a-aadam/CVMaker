import { useEffect, useMemo, useState } from 'react';
import { aiAvailable } from '../ai/engine';
import { containsTerm } from '../ai/grounding';
import { ChipInput } from '../components/ChipInput';
import { CheckIcon, LockIcon, SparkIcon } from '../components/icons';
import { ReviewChangesModal } from '../components/ReviewChangesModal';
import { extractKeywordsRules } from '../keywords/ruleExtractor';
import { planPush } from '../keywords/pushPlanner';
import { useKeywords } from '../store/keywordStore';
import { useProfile } from '../store/profileStore';
import { profileText } from '../sections';
import type { Change } from '../types';

const READ_DELAY_MS = 2000;
// Bumped on every new read or reset so a slow AI reply for an old job description is ignored.
let currentRun = 0;

export function KeywordTab({ onDone }: { onDone: () => void }) {
  const { jobText, locked, status, keywords, setJobText, lock, setStatus, addKeywords, removeKeyword, clear } = useKeywords();
  const personal = useProfile((s) => s.personal);
  const sections = useProfile((s) => s.sections);
  const applyChanges = useProfile((s) => s.applyChanges);
  const [aiNote, setAiNote] = useState('');
  const [planning, setPlanning] = useState('');
  const [review, setReview] = useState<Change[] | null>(null);

  // Two seconds after the last edit, lock the text and start reading it.
  useEffect(() => {
    if (locked || jobText.trim().length < 30) return;
    const t = setTimeout(async () => {
      const run = ++currentRun;
      const stale = () => run !== currentRun;
      lock();
      setStatus('reading');
      addKeywords(extractKeywordsRules(jobText).map((text) => ({ text, source: 'rule' as const })));
      if (await aiAvailable()) {
        setAiNote('The AI is reading the job description…');
        try {
          const { extractKeywordsAi } = await import('../keywords/aiExtractor');
          const ai = await extractKeywordsAi(jobText);
          if (stale()) return;
          addKeywords(ai.map((text) => ({ text, source: 'ai' as const })));
          setAiNote('');
        } catch {
          setAiNote("The AI couldn't run here, so these keywords come from the built-in rules.");
        }
      }
      if (!stale()) setStatus('done');
    }, READ_DELAY_MS);
    return () => clearTimeout(t);
  }, [jobText, locked, lock, setStatus, addKeywords]);

  const startOver = () => {
    currentRun++;
    setAiNote('');
    setReview(null);
    clear();
  };

  const cvText = useMemo(() => profileText(sections, personal), [sections, personal]);
  const inCv = (k: string) => containsTerm(cvText, k);
  const missingCount = keywords.filter((k) => !inCv(k.text)).length;

  const onPush = async () => {
    setPlanning('Comparing keywords with your profile…');
    try {
      const useAi = await aiAvailable();
      const rewriter = useAi ? (await import('../ai/rewriter')).aiRewriter : null;
      const changes = await planPush(
        { personal, sections },
        keywords.map((k) => k.text),
        rewriter,
        setPlanning,
      );
      setReview(changes);
    } finally {
      setPlanning('');
    }
  };

  return (
    <div className="page">
      <div className="kw-layout">
        <section className="card kw-input" aria-labelledby="jd-h">
          <div className="card-head">
            <h2 id="jd-h" className="card-title-static">Paste job description here</h2>
            {locked && (
              <span className="pill">
                <LockIcon /> Locked
              </span>
            )}
          </div>
          <textarea
            className="jd"
            value={jobText}
            readOnly={locked}
            aria-readonly={locked}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Paste the full job posting. Reading starts 2 seconds after you stop typing, and the text locks once reading begins."
          />
          <div className="row-between">
            <span className="muted small">
              {locked
                ? status === 'reading'
                  ? 'Reading…'
                  : 'Finished reading. Start over to paste a different job.'
                : jobText.trim().length >= 30
                  ? 'Reading starts in a moment…'
                  : 'Waiting for a job description'}
            </span>
            {(locked || jobText) && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={startOver}>
                New job description
              </button>
            )}
          </div>
        </section>

        <section className="card kw-output" aria-labelledby="kw-h" aria-busy={status === 'reading'}>
          <div className="card-head">
            <h2 id="kw-h" className="card-title-static">Extracted ATS keywords</h2>
            {keywords.length > 0 && (
              <span className="muted small">
                {keywords.length - missingCount} of {keywords.length} already in your CV
              </span>
            )}
          </div>
          {status === 'reading' && <p className="notice info">{aiNote || 'Finding keywords…'}</p>}
          {status === 'done' && aiNote && <p className="notice info">{aiNote}</p>}
          {!keywords.length && status !== 'reading' && (
            <p className="muted">Keywords from the job description will appear here. You can also add your own.</p>
          )}
          <ChipInput
            items={keywords.map((k) => k.text)}
            placeholder="Add keyword"
            addLabel="Add keyword"
            onAdd={(vals) => addKeywords(vals.map((text) => ({ text, source: 'manual' as const })))}
            onRemove={removeKeyword}
            chipClass={(v) => (inCv(v) ? 'chip-ok' : 'chip-missing')}
            renderChip={(v) => (
              <span title={inCv(v) ? 'Already in your CV' : 'Not in your CV yet'}>
                {inCv(v) && <CheckIcon width={12} height={12} />} {v}
              </span>
            )}
          />
          <div className="legend small muted">
            <span><i className="dot ok" /> In your CV</span>
            <span><i className="dot missing" /> Missing</span>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={!keywords.length || !!planning || status === 'reading'}
            onClick={onPush}
          >
            <SparkIcon /> {planning || 'Push keywords to my CV'}
          </button>
          {review && review.length === 0 && (
            <p className="notice ok">Every keyword is already in your CV. Nothing to change.</p>
          )}
        </section>
      </div>

      {review && review.length > 0 && (
        <ReviewChangesModal
          changes={review}
          profile={{ personal, sections }}
          onClose={() => setReview(null)}
          onApply={(accepted) => {
            applyChanges(accepted);
            setReview(null);
            onDone();
          }}
        />
      )}
    </div>
  );
}
