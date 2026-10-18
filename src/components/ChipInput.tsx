import { useId, useState, type ReactNode } from 'react';
import { PlusIcon, XIcon } from './icons';

interface Props {
  items: string[];
  onAdd: (values: string[]) => void;
  onRemove: (value: string) => void;
  label: string;
  placeholder: string;
  addLabel: string;
  empty?: string;
  renderChip?: (value: string) => ReactNode;
  chipClass?: (value: string) => string;
}

/** Chips with remove buttons plus an input that accepts one or many comma-separated values. */
export function ChipInput({ items, onAdd, onRemove, label, placeholder, addLabel, empty, renderChip, chipClass }: Props) {
  const [draft, setDraft] = useState('');
  const inputId = useId();
  const commit = () => {
    const values = draft.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
    if (values.length) onAdd(values);
    setDraft('');
  };
  return (
    <div className="chips-wrap">
      {items.length > 0 ? (
        <ul className="chips">
          {items.map((v) => (
            <li key={v} className={`chip ${chipClass?.(v) ?? ''}`}>
              {renderChip ? renderChip(v) : <span className="chip-text">{v}</span>}
              <button type="button" className="chip-x" onClick={() => onRemove(v)} aria-label={`Remove ${v}`}>
                <XIcon width={13} height={13} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        empty && <p className="muted small">{empty}</p>
      )}
      <div className="chip-add">
        <label htmlFor={inputId} className="sr-only">
          {label}
        </label>
        <input
          id={inputId}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              commit();
            }
          }}
          placeholder={placeholder}
        />
        <button type="button" className="btn btn-sm" onClick={commit} disabled={!draft.trim()}>
          <PlusIcon /> {addLabel}
        </button>
      </div>
    </div>
  );
}
