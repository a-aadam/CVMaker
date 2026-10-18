import { Fragment, useMemo, useState, type ReactNode } from 'react';
import { Modal } from './Modal';
import { containsTerm } from '../ai/grounding';
import type { Change, Profile } from '../types';

interface Props {
  changes: Change[];
  keywords: string[];
  profile: Profile;
  onApply: (accepted: Change[]) => void;
  onClose: () => void;
}

function where(c: Change, p: Profile): string {
  const s = p.sections.find((x) => x.id === c.sectionId);
  if (c.kind === 'addSkills') return s ? `Added to “${s.title}”` : 'Adds a new Skills section';
  if (c.kind === 'summary') return s?.title ?? 'Summary';
  const e = s?.entries.find((x) => x.id === c.entryId);
  return [s?.title, [e?.title, e?.organization].filter(Boolean).join(' · ')].filter(Boolean).join(' / ');
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Underline the keywords this edit adds, so the reviewer sees exactly what changed. */
function highlight(after: string, before: string, keywords: string[]): ReactNode {
  const added = keywords.filter((k) => containsTerm(after, k) && !containsTerm(before, k));
  if (!added.length) return after;
  const re = new RegExp(`(${added.map(escape).sort((a, b) => b.length - a.length).join('|')})`, 'gi');
  return after.split(re).map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : <Fragment key={i}>{part}</Fragment>));
}

/** Shows every proposed edit side by side; nothing changes until the user applies. */
export function ReviewChangesModal({ changes, keywords, profile, onApply, onClose }: Props) {
  const [on, setOn] = useState<Record<string, boolean>>(() => Object.fromEntries(changes.map((c) => [c.id, true])));
  const skillsChange = changes.find((c) => c.kind === 'addSkills');
  const [skills, setSkills] = useState<Record<string, boolean>>(() =>
    Object.fromEntries((skillsChange?.kind === 'addSkills' ? skillsChange.skills : []).map((s) => [s, true])),
  );

  const accepted = useMemo(
    () =>
      changes
        .filter((c) => on[c.id])
        .map((c) => (c.kind === 'addSkills' ? { ...c, skills: c.skills.filter((s) => skills[s]) } : c))
        .filter((c) => c.kind !== 'addSkills' || c.skills.length),
    [changes, on, skills],
  );

  return (
    <Modal
      title="Review changes before they're filed"
      onClose={onClose}
      wide
      footer={
        <>
          <span className="muted" aria-live="polite">
            {accepted.length} of {changes.length} changes selected
          </span>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" disabled={!accepted.length} onClick={() => onApply(accepted)}>
            Apply {accepted.length} change{accepted.length === 1 ? '' : 's'}
          </button>
        </>
      }
    >
      <p className="muted">
        These edits only reword what's already in your CV. Read each one and untick anything that isn't true for you.
      </p>
      <ul className="changes">
        {changes.map((c) => (
          <li key={c.id} className={`change${on[c.id] ? '' : ' off'}`}>
            <label className="change-head check">
              <input type="checkbox" checked={!!on[c.id]} onChange={(e) => setOn({ ...on, [c.id]: e.target.checked })} />
              <strong>{c.kind === 'addSkills' ? 'Add skills' : c.kind === 'summary' ? 'Summary' : 'Bullet point'}</strong>
              <span className="muted">{where(c, profile)}</span>
            </label>
            {c.kind === 'addSkills' ? (
              <ul className="chips" aria-label="Skills to add">
                {c.skills.map((s) => (
                  <li key={s}>
                    <label className={`chip chip-toggle${skills[s] ? ' on' : ''}`}>
                      <input
                        type="checkbox"
                        checked={!!skills[s]}
                        disabled={!on[c.id]}
                        onChange={(e) => setSkills({ ...skills, [s]: e.target.checked })}
                      />
                      {s}
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="diff">
                <div>
                  <span className="diff-label">Now</span>
                  <p className="diff-before">{c.before}</p>
                </div>
                <div>
                  <span className="diff-label">Proposed</span>
                  <p className="diff-after">{highlight(c.after, c.before, keywords)}</p>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Modal>
  );
}
