import type { ReactNode } from 'react';
import { useProfile } from '../../store/profileStore';
import { SECTION_META } from '../../sections';
import type { Entry, Section } from '../../types';
import { PlusIcon, TrashIcon, XIcon } from '../icons';

interface Props {
  section: Section;
  entry: Entry;
  handle: ReactNode;
}

export function EntryEditor({ section, entry, handle }: Props) {
  const updateEntry = useProfile((s) => s.updateEntry);
  const removeEntry = useProfile((s) => s.removeEntry);
  const meta = SECTION_META[section.type];
  const set = (patch: Partial<Entry>) => updateEntry(section.id, entry.id, patch);
  const setBullet = (i: number, v: string) => set({ bullets: entry.bullets.map((b, j) => (j === i ? v : b)) });

  return (
    <div className="entry">
      <div className="entry-head">
        {handle}
        <span className="entry-label">{entry.title || entry.organization || `New ${meta.titleLabel.toLowerCase()}`}</span>
        <button
          type="button"
          className="icon-btn danger"
          onClick={() => removeEntry(section.id, entry.id)}
          aria-label="Remove this item"
          title="Remove this item"
        >
          <TrashIcon />
        </button>
      </div>
      <div className="grid-2">
        <label className="field">
          <span>{meta.titleLabel}</span>
          <input value={entry.title} onChange={(e) => set({ title: e.target.value })} />
        </label>
        <label className="field">
          <span>{meta.orgLabel}</span>
          <input value={entry.organization} onChange={(e) => set({ organization: e.target.value })} />
        </label>
        {section.showLocation && (
          <label className="field">
            <span>Location</span>
            <input value={entry.location} placeholder="City, Country" onChange={(e) => set({ location: e.target.value })} />
          </label>
        )}
        {section.dateMode === 'single' && (
          <label className="field">
            <span>Date</span>
            <input value={entry.date} placeholder="e.g. Jun 2024" onChange={(e) => set({ date: e.target.value })} />
          </label>
        )}
        {section.dateMode === 'range' && (
          <div className="field date-range span-2-sm">
            <span>Dates</span>
            <div className="date-row">
              <input
                value={entry.startDate}
                placeholder="Date started"
                aria-label="Date started"
                onChange={(e) => set({ startDate: e.target.value })}
              />
              <span aria-hidden>–</span>
              <input
                value={entry.current ? 'Present' : entry.endDate}
                placeholder="End date"
                aria-label="End date"
                disabled={entry.current}
                onChange={(e) => set({ endDate: e.target.value })}
              />
              <label className="check">
                <input type="checkbox" checked={entry.current} onChange={(e) => set({ current: e.target.checked })} />
                Present
              </label>
            </div>
          </div>
        )}
      </div>
      {(section.type === 'custom' || section.type === 'education' || section.type === 'certifications' || entry.description) && (
        <label className="field">
          <span>Description</span>
          <textarea
            rows={2}
            value={entry.description}
            placeholder={section.type === 'education' ? 'GPA, honours, relevant coursework…' : 'Optional details'}
            onChange={(e) => set({ description: e.target.value })}
          />
        </label>
      )}
      <div className="bullets">
        <span className="field-label">Bullet points</span>
        {entry.bullets.map((b, i) => (
          <div className="bullet-row" key={i}>
            <span className="bullet-dot" aria-hidden>•</span>
            <textarea
              rows={1}
              value={b}
              aria-label={`Bullet ${i + 1}`}
              onChange={(e) => setBullet(i, e.target.value)}
            />
            <button
              type="button"
              className="icon-btn"
              onClick={() => set({ bullets: entry.bullets.filter((_, j) => j !== i) })}
              aria-label={`Remove bullet ${i + 1}`}
            >
              <XIcon />
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => set({ bullets: [...entry.bullets, ''] })}>
          <PlusIcon /> Add bullet
        </button>
      </div>
    </div>
  );
}
