import { useState, type ReactNode } from 'react';
import { PlusIcon, XIcon } from './icons';

interface Props {
  items: string[];
  onAdd: (values: string[]) => void;
  onRemove: (value: string) => void;
  placeholder: string;
  addLabel: string;
  renderChip?: (value: string) => ReactNode;
  chipClass?: (value: string) => string;
}

/** Chips with remove buttons plus an input that accepts one or many comma-separated values. */
export function ChipInput({ items, onAdd, onRemove, placeholder, addLabel, renderChip, chipClass }: Props) {
  const [draft, setDraft] = useState('');
  const commit = () => {
    const values = draft.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
    if (values.length) onAdd(values);
    setDraft('');
  };
  return (
    <div className="chips-wrap">
      <ul className="chips">
        {items.map((v) => (
          <li key={v} className={`chip ${chipClass?.(v) ?? ''}`}>
            {renderChip ? renderChip(v) : <span>{v}</span>}
            <button type="button" className="chip-x" onClick={() => onRemove(v)} aria-label={`Remove ${v}`}>
              <XIcon width={12} height={12} />
            </button>
          </li>
        ))}
      </ul>
      <div className="chip-add">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              commit();
            }
          }}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        <button type="button" className="btn btn-ghost btn-sm" onClick={commit} disabled={!draft.trim()}>
          <PlusIcon /> {addLabel}
        </button>
      </div>
    </div>
  );
}
