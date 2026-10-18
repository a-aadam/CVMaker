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
          const has = existing.includes(t);
          return (
            <li key={t}>
              <button type="button" className="choice" onClick={() => onPick(t)}>
                <strong>{m.label}</strong>
                <span>{m.description}</span>
                {has && <em className="choice-note">Already added. This adds another.</em>}
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
