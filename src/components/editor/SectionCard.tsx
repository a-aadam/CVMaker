import { useState, type ReactNode } from 'react';
import { useProfile } from '../../store/profileStore';
import { SECTION_META } from '../../sections';
import type { DateMode, Section } from '../../types';
import { ChipInput } from '../ChipInput';
import { ChevronIcon, EyeIcon, EyeOffIcon, PlusIcon, TrashIcon } from '../icons';
import { EntryEditor } from './EntryEditor';
import { SortableItem, SortableList } from './Sortable';

interface Props {
  section: Section;
  handle: ReactNode;
}

export function SectionCard({ section, handle }: Props) {
  const [open, setOpen] = useState(true);
  const update = useProfile((s) => s.updateSection);
  const remove = useProfile((s) => s.removeSection);
  const addEntry = useProfile((s) => s.addEntry);
  const reorderEntries = useProfile((s) => s.reorderEntries);
  const meta = SECTION_META[section.type];
  const bodyId = `body-${section.id}`;

  const onDelete = () => {
    if (confirm(`Delete the “${section.title}” section? This can't be undone.`)) remove(section.id);
  };

  return (
    <section className={`card section-card${section.visible ? '' : ' is-hidden'}`} data-section-id={section.id}>
      <div className="card-head">
        {handle}
        <input
          className="card-title"
          value={section.title}
          onChange={(e) => update(section.id, { title: e.target.value })}
          aria-label="Section title"
        />
        <span className="badge">{meta.label}</span>
        <div className="card-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={() => update(section.id, { visible: !section.visible })}
            aria-pressed={!section.visible}
            aria-label={section.visible ? 'Hide from CV' : 'Show on CV'}
            title={section.visible ? 'Shown on CV, click to hide' : 'Hidden from CV, click to show'}
          >
            {section.visible ? <EyeIcon /> : <EyeOffIcon />}
          </button>
          <button type="button" className="icon-btn danger" onClick={onDelete} aria-label="Delete section" title="Delete section">
            <TrashIcon />
          </button>
          <button
            type="button"
            className={`icon-btn chevron${open ? ' open' : ''}`}
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls={bodyId}
            aria-label={open ? 'Collapse section' : 'Expand section'}
          >
            <ChevronIcon />
          </button>
        </div>
      </div>

      {open && (
        <div id={bodyId} className="card-body">
          {section.type === 'custom' && (
            <div className="custom-opts">
              <label className="field inline">
                <span>Dates</span>
                <select value={section.dateMode} onChange={(e) => update(section.id, { dateMode: e.target.value as DateMode })}>
                  <option value="none">No dates</option>
                  <option value="single">Single date</option>
                  <option value="range">Start and end date</option>
                </select>
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={section.showLocation}
                  onChange={(e) => update(section.id, { showLocation: e.target.checked })}
                />
                Show location
              </label>
            </div>
          )}

          {meta.kind === 'text' && (
            <textarea
              className="summary-text"
              rows={4}
              value={section.text}
              placeholder="Two or three sentences on who you are, what you do best and what you're looking for."
              onChange={(e) => update(section.id, { text: e.target.value })}
              aria-label={section.title}
            />
          )}

          {meta.kind === 'skills' && (
            <ChipInput
              items={section.skills}
              placeholder="Add skills, separated by commas"
              addLabel="Add"
              onAdd={(vals) => {
                const have = new Set(section.skills.map((s) => s.toLowerCase()));
                update(section.id, { skills: [...section.skills, ...vals.filter((v) => !have.has(v.toLowerCase()))] });
              }}
              onRemove={(v) => update(section.id, { skills: section.skills.filter((s) => s !== v) })}
            />
          )}

          {meta.kind === 'entries' && (
            <>
              <SortableList ids={section.entries.map((e) => e.id)} onMove={(a, b) => reorderEntries(section.id, a, b)}>
                <div className="entries">
                  {section.entries.map((entry) => (
                    <SortableItem key={entry.id} id={entry.id} handleLabel={`Reorder ${entry.title || 'item'}`}>
                      {(h) => <EntryEditor section={section} entry={entry} handle={h} />}
                    </SortableItem>
                  ))}
                </div>
              </SortableList>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => addEntry(section.id)}>
                <PlusIcon /> Add {meta.titleLabel.toLowerCase()}
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
