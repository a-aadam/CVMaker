import { useEffect, useMemo, useState } from 'react';
import { aiAvailable } from '../ai/engine';
import { containsTerm } from '../ai/grounding';
import { ChipInput } from '../components/ChipInput';
import { CheckIcon, InfoIcon, LockIcon, SparkIcon } from '../components/icons';
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

  const waiting = !locked && jobText.trim().length >= 30;
  const statusText = locked
    ? status === 'reading'
      ? aiNote || 'Reading the job description…'
      : 'Finished reading. Start over to paste a different job.'
    : waiting
      ? 'Reading starts 2 seconds after you stop typing…'
      : 'Paste a job description to begin.';

  return (
    <div className="page">
      <div className="kw-layout">
        <section className="card kw-pane" aria-labelledby="jd-h">
          <div className="card-head">
            <h2 id="jd-h" className="card-title-static">
              Job description
            </h2>
            {locked && (
              <span className="lock-tag">
                <LockIcon /> Locked
              </span>
            )}
          </div>
          <div className="card-body">
            <label htmlFor="jd" className="sr-only">
              Paste the job description
            </label>
            <textarea
              id="jd"
              className="jd"
              value={jobText}
              readOnly={locked}
              aria-describedby="jd-status"
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste the full job posting here. Reading starts 2 seconds after you stop typing, and the text locks while it's read."
            />
            {/* The 2-second wait, made visible: restarts on every keystroke. */}
            <div className="read-timer" aria-hidden>
              {waiting && <i key={`${jobText.length}:${jobText.slice(-12)}`} />}
            </div>
            <div className="status-row">
              <span id="jd-status" className="status-text" role="status">
                {status === 'reading' && <span className="spinner" aria-hidden />}
                {statusText}
              </span>
              {(locked || jobText) && (
                <button type="button" className="btn btn-sm" onClick={startOver}>
                  New job description
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="card kw-pane" aria-labelledby="kw-h" aria-busy={status === 'reading'}>
          <div className="card-head">
            <h2 id="kw-h" className="card-title-static">
              ATS keywords
            </h2>
            {keywords.length > 0 && (
              <span className="kw-count">
                {keywords.length - missingCount} of {keywords.length} in your CV
              </span>
            )}
          </div>
          <div className="card-body">
            {status === 'done' && aiNote && (
              <p className="notice info">
                <InfoIcon />
                <span>{aiNote}</span>
              </p>
            )}
            {!keywords.length && status !== 'reading' && (
              <p className="empty">Keywords from the job description are filed here. You can also add your own below.</p>
            )}
            <ChipInput
              items={keywords.map((k) => k.text)}
              label="Add a keyword"
              placeholder="Add a keyword"
              addLabel="Add keyword"
              onAdd={(vals) => addKeywords(vals.map((text) => ({ text, source: 'manual' as const })))}
              onRemove={removeKeyword}
              chipClass={(v) => (inCv(v) ? 'chip-ok' : 'chip-missing')}
              renderChip={(v) => (
                <span className="chip-text">
                  {inCv(v) && <CheckIcon width={13} height={13} />}
                  {v}
                  <span className="sr-only">{inCv(v) ? ', already in your CV' : ', missing from your CV'}</span>
                </span>
              )}
            />
            {keywords.length > 0 && (
              <div className="legend">
                <span>
                  <i className="swatch ok" aria-hidden /> In your CV
                </span>
                <span>
                  <i className="swatch missing" aria-hidden /> Missing, will be suggested
                </span>
              </div>
            )}
            <button
              type="button"
              className="btn btn-primary btn-lg btn-block"
              disabled={!keywords.length || !!planning || status === 'reading'}
              onClick={onPush}
            >
              {planning ? <span className="spinner" aria-hidden /> : <SparkIcon />}
              {planning || 'Push keywords to my CV'}
            </button>
            {review && review.length === 0 && (
              <p className="notice ok" role="status">
                <CheckIcon />
                <span>Every keyword is already in your CV. Nothing to change.</span>
              </p>
            )}
          </div>
        </section>
      </div>

      {review && review.length > 0 && (
        <ReviewChangesModal
          changes={review}
          keywords={keywords.map((k) => k.text)}
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
