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
      <SortableList
        ids={sections.map((s) => s.id)}
        onMove={reorder}
        nameOf={(id) => sections.find((s) => s.id === id)?.title ?? 'section'}
      >
        <div className="section-list">
          {sections.map((s, i) => (
            <SortableItem key={s.id} id={s.id} handleLabel={`Reorder ${s.title} section`}>
              {(h) => (
                <SectionCard
                  section={s}
                  handle={h}
                  onUp={i > 0 ? () => reorder(s.id, sections[i - 1].id) : undefined}
                  onDown={i < sections.length - 1 ? () => reorder(s.id, sections[i + 1].id) : undefined}
                />
              )}
            </SortableItem>
          ))}
        </div>
      </SortableList>
      <button type="button" className="btn btn-file" onClick={() => setAdding(true)}>
        <PlusIcon /> Add another section
      </button>
      {adding && (
        <AddSectionModal
          existing={sections.map((s) => s.type)}
          onClose={() => setAdding(false)}
          onPick={(t) => {
            const id = addSection(t);
            setAdding(false);
            requestAnimationFrame(() => {
              const el = document.getElementById(`section-${id}`);
              el?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
              el?.querySelector<HTMLInputElement>('.card-title')?.focus({ preventScroll: true });
            });
          }}
        />
      )}
    </div>
  );
}
