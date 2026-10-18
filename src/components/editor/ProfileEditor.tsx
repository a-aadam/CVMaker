import { useState } from 'react';
import { useProfile } from '../../store/profileStore';
import { PlusIcon } from '../icons';
import { AddSectionModal } from './AddSectionModal';
import { PersonalInfoForm } from './PersonalInfoForm';
import { SectionCard } from './SectionCard';
import { SortableItem, SortableList } from './Sortable';

/** The full profile editor. Used by both My Profile and CV Generator, which share one store. */
export function ProfileEditor() {
  const sections = useProfile((s) => s.sections);
  const reorder = useProfile((s) => s.reorderSections);
  const addSection = useProfile((s) => s.addSection);
  const [adding, setAdding] = useState(false);

  return (
    <div className="editor">
      <PersonalInfoForm />
      <SortableList ids={sections.map((s) => s.id)} onMove={reorder}>
        <div className="section-list">
          {sections.map((s) => (
            <SortableItem key={s.id} id={s.id} handleLabel={`Reorder ${s.title} section`}>
              {(h) => <SectionCard section={s} handle={h} />}
            </SortableItem>
          ))}
        </div>
      </SortableList>
      <button type="button" className="btn btn-dashed" onClick={() => setAdding(true)}>
        <PlusIcon /> Add another section
      </button>
      {adding && (
        <AddSectionModal
          existing={sections.map((s) => s.type)}
          onClose={() => setAdding(false)}
          onPick={(t) => {
            const id = addSection(t);
            setAdding(false);
            requestAnimationFrame(() =>
              document.querySelector(`[data-section-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
            );
          }}
        />
      )}
    </div>
  );
}
