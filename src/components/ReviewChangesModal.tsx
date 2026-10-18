import { useMemo, useState } from 'react';
import { Modal } from './Modal';
import type { Change, Profile } from '../types';

interface Props {
  changes: Change[];
  profile: Profile;
  onApply: (accepted: Change[]) => void;
  onClose: () => void;
}

function where(c: Change, p: Profile): string {
  const s = p.sections.find((x) => x.id === c.sectionId);
  if (c.kind === 'addSkills') return s ? `Add to “${s.title}”` : 'Add a new Skills section';
  if (c.kind === 'summary') return s?.title ?? 'Summary';
  const e = s?.entries.find((x) => x.id === c.entryId);
  return [s?.title, e?.title, e?.organization].filter(Boolean).join(' · ');
}

/** Shows every proposed edit side by side; nothing changes until the user applies. */
export function ReviewChangesModal({ changes, profile, onApply, onClose }: Props) {
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
      title="Review keyword changes"
      onClose={onClose}
      wide
      footer={
        <>
          <span className="muted">{accepted.length} of {changes.length} changes selected</span>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" disabled={!accepted.length} onClick={() => onApply(accepted)}>
            Apply selected
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
              <strong>{c.kind === 'addSkills' ? 'Skills' : c.kind === 'summary' ? 'Summary rewrite' : 'Bullet rewrite'}</strong>
              <span className="muted">{where(c, profile)}</span>
            </label>
            {c.kind === 'addSkills' ? (
              <ul className="chips">
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
                  <span className="diff-label">Before</span>
                  <p className="diff-before">{c.before}</p>
                </div>
                <div>
                  <span className="diff-label">After</span>
                  <p className="diff-after">{c.after}</p>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Modal>
  );
}
