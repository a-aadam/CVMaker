import { Modal } from '../Modal';
import { SECTION_META, SECTION_ORDER } from '../../sections';
import type { SectionType } from '../../types';

interface Props {
  existing: SectionType[];
  onPick: (t: SectionType) => void;
  onClose: () => void;
}

export function AddSectionModal({ existing, onPick, onClose }: Props) {
  return (
    <Modal title="Add a section" onClose={onClose}>
      <ul className="section-choices">
        {SECTION_ORDER.map((t) => {
          const m = SECTION_META[t];
          const count = existing.filter((x) => x === t).length;
          return (
            <li key={t}>
              <button type="button" className="choice" onClick={() => onPick(t)}>
                <strong>{m.label}</strong>
                <span className="desc">
                  {m.description}
                  {count > 0 && ` · ${count} already in your CV`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
