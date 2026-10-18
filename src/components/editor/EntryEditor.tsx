import { useState, type ReactNode } from 'react';
import { useProfile } from '../../store/profileStore';
import { formatRange, SECTION_META } from '../../sections';
import type { Entry, Section } from '../../types';
import { ChevronIcon, PlusIcon, TrashIcon, XIcon } from '../icons';
import { MoveButtons } from './MoveButtons';

interface Props {
  section: Section;
  entry: Entry;
  handle: ReactNode;
  onUp?: () => void;
  onDown?: () => void;
}

export function EntryEditor({ section, entry, handle, onUp, onDown }: Props) {
  const [open, setOpen] = useState(true);
  const updateEntry = useProfile((s) => s.updateEntry);
  const removeEntry = useProfile((s) => s.removeEntry);
  const meta = SECTION_META[section.type];
  const set = (patch: Partial<Entry>) => updateEntry(section.id, entry.id, patch);
  const setBullet = (i: number, v: string) => set({ bullets: entry.bullets.map((b, j) => (j === i ? v : b)) });
  const name = [entry.title, entry.organization].filter((x) => x.trim()).join(' · ') || `New ${meta.titleLabel.toLowerCase()}`;
  // Fixed furniture: dates and location always sit in the same meta row.
  const metaRow = [formatRange(entry, section.dateMode), section.showLocation ? entry.location : ''].filter((x) => x.trim()).join('  ·  ');

  return (
    <div className="entry">
      <div className="entry-head">
        {handle}
        <div className="entry-sum">
          <span className="entry-label">{name}</span>
          <span className="entry-meta">{metaRow || ' '}</span>
        </div>
        <div className="card-actions entry-actions">
          <MoveButtons name={name} onUp={onUp} onDown={onDown} />
          <button
            type="button"
            className="icon-btn danger"
            onClick={() => removeEntry(section.id, entry.id)}
            aria-label={`Remove ${name}`}
            title="Remove this item"
          >
            <TrashIcon />
          </button>
          <button
            type="button"
            className="icon-btn chevron"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls={`entry-${entry.id}`}
            aria-label={`${open ? 'Collapse' : 'Expand'} ${name}`}
          >
            <ChevronIcon />
          </button>
        </div>
      </div>
      <div className="entry-body" id={`entry-${entry.id}`} hidden={!open}>
        <div className="grid-2">
          <label className="field">
            <span>{meta.titleLabel}</span>
            <input value={entry.title} onChange={(e) => set({ title: e.target.value })} />
          </label>
          <label className="field">
            <span>{meta.orgLabel}</span>
            <input value={entry.organization} onChange={(e) => set({ organization: e.target.value })} />
          </label>
          {section.dateMode === 'range' && (
            <fieldset className="field date-range" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="field-label" style={{ padding: 0, marginBottom: 5 }}>
                Dates
              </legend>
              <div className="date-row">
                <input
                  value={entry.startDate}
                  placeholder="Date started, e.g. Mar 2022"
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
            </fieldset>
          )}
          {section.dateMode === 'single' && (
            <label className="field">
              <span>Date</span>
              <input value={entry.date} placeholder="e.g. Jun 2024" onChange={(e) => set({ date: e.target.value })} />
            </label>
          )}
          {section.showLocation && (
            <label className="field">
              <span>Location</span>
              <input value={entry.location} placeholder="City, Country" onChange={(e) => set({ location: e.target.value })} />
            </label>
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
        <div className="bullets" role="group" aria-label="Bullet points">
          <span className="field-label">Bullet points</span>
          {entry.bullets.map((b, i) => (
            <div className="bullet-row" key={i}>
              <span className="bullet-dot" aria-hidden>
                •
              </span>
              <textarea rows={1} value={b} aria-label={`Bullet ${i + 1}`} onChange={(e) => setBullet(i, e.target.value)} />
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
          <button type="button" className="btn btn-quiet btn-sm" onClick={() => set({ bullets: [...entry.bullets, ''] })}>
            <PlusIcon /> Add bullet
          </button>
        </div>
      </div>
    </div>
  );
}
