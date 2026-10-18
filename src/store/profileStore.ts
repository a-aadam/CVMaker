import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Change, Entry, Personal, Profile, Section, SectionType } from '../types';
import { emptyPersonal, newEntry, newSection } from '../sections';

interface ProfileState extends Profile {
  setPersonal: (patch: Partial<Personal>) => void;
  addSection: (type: SectionType) => string;
  updateSection: (id: string, patch: Partial<Section>) => void;
  removeSection: (id: string) => void;
  reorderSections: (fromId: string, toId: string) => void;
  addEntry: (sectionId: string) => void;
  updateEntry: (sectionId: string, entryId: string, patch: Partial<Entry>) => void;
  removeEntry: (sectionId: string, entryId: string) => void;
  reorderEntries: (sectionId: string, fromId: string, toId: string) => void;
  replaceProfile: (p: Profile) => void;
  applyChanges: (changes: Change[]) => void;
  reset: () => void;
}

function move<T extends { id: string }>(list: T[], fromId: string, toId: string): T[] {
  const from = list.findIndex((x) => x.id === fromId);
  const to = list.findIndex((x) => x.id === toId);
  if (from < 0 || to < 0 || from === to) return list;
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function defaultProfile(): Profile {
  return {
    personal: emptyPersonal(),
    sections: [newSection('summary'), newSection('work'), newSection('education'), newSection('skills')],
  };
}

function mergeSkills(existing: string[], add: string[]): string[] {
  const seen = new Set(existing.map((s) => s.toLowerCase()));
  const out = existing.slice();
  for (const s of add) {
    if (!seen.has(s.toLowerCase())) {
      seen.add(s.toLowerCase());
      out.push(s);
    }
  }
  return out;
}

export const useProfile = create<ProfileState>()(
  persist(
    (set) => {
      const mapSection = (id: string, fn: (s: Section) => Section) =>
        set((st) => ({ sections: st.sections.map((s) => (s.id === id ? fn(s) : s)) }));

      return {
        ...defaultProfile(),
        setPersonal: (patch) => set((st) => ({ personal: { ...st.personal, ...patch } })),
        addSection: (type) => {
          const s = newSection(type);
          set((st) => ({ sections: [...st.sections, s] }));
          return s.id;
        },
        updateSection: (id, patch) => mapSection(id, (s) => ({ ...s, ...patch })),
        removeSection: (id) => set((st) => ({ sections: st.sections.filter((s) => s.id !== id) })),
        reorderSections: (fromId, toId) => set((st) => ({ sections: move(st.sections, fromId, toId) })),
        addEntry: (sectionId) => mapSection(sectionId, (s) => ({ ...s, entries: [...s.entries, newEntry()] })),
        updateEntry: (sectionId, entryId, patch) =>
          mapSection(sectionId, (s) => ({
            ...s,
            entries: s.entries.map((e) => (e.id === entryId ? { ...e, ...patch } : e)),
          })),
        removeEntry: (sectionId, entryId) =>
          mapSection(sectionId, (s) => ({ ...s, entries: s.entries.filter((e) => e.id !== entryId) })),
        reorderEntries: (sectionId, fromId, toId) =>
          mapSection(sectionId, (s) => ({ ...s, entries: move(s.entries, fromId, toId) })),
        replaceProfile: (p) => set({ personal: p.personal, sections: p.sections }),
        applyChanges: (changes) =>
          set((st) => {
            let sections = st.sections;
            for (const c of changes) {
              if (c.kind === 'addSkills') {
                const target = sections.find((s) => s.id === c.sectionId) ?? sections.find((s) => s.type === 'skills');
                if (target) {
                  sections = sections.map((s) =>
                    s.id === target.id ? { ...s, skills: mergeSkills(s.skills, c.skills) } : s,
                  );
                } else {
                  sections = [...sections, newSection('skills', { skills: c.skills })];
                }
              } else if (c.kind === 'summary') {
                sections = sections.map((s) => (s.id === c.sectionId ? { ...s, text: c.after } : s));
              } else {
                sections = sections.map((s) =>
                  s.id !== c.sectionId
                    ? s
                    : {
                        ...s,
                        entries: s.entries.map((e) =>
                          e.id !== c.entryId
                            ? e
                            : { ...e, bullets: e.bullets.map((b, i) => (i === c.index ? c.after : b)) },
                        ),
                      },
                );
              }
            }
            return { sections };
          }),
        reset: () => set(defaultProfile()),
      };
    },
    {
      name: 'cvmaker.profile',
      version: 1,
      partialize: (st) => ({ personal: st.personal, sections: st.sections }),
    },
  ),
);

export function isProfileEmpty(p: Profile): boolean {
  const personalEmpty = Object.values(p.personal).every((v) => !v.trim());
  const sectionsEmpty = p.sections.every(
    (s) =>
      !s.text.trim() &&
      s.skills.length === 0 &&
      s.entries.every((e) => !e.title.trim() && !e.organization.trim() && e.bullets.every((b) => !b.trim())),
  );
  return personalEmpty && sectionsEmpty;
}
