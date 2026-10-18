import type { DateMode, Entry, Personal, Section, SectionType } from './types';

export interface SectionMeta {
  label: string;
  defaultTitle: string;
  description: string;
  kind: 'entries' | 'text' | 'skills';
  dateMode: DateMode;
  showLocation: boolean;
  titleLabel: string;
  orgLabel: string;
}

export const SECTION_META: Record<SectionType, SectionMeta> = {
  work: {
    label: 'Work Experience',
    defaultTitle: 'Work Experience',
    description: 'Jobs, internships and contracts',
    kind: 'entries',
    dateMode: 'range',
    showLocation: true,
    titleLabel: 'Job title',
    orgLabel: 'Company',
  },
  project: {
    label: 'Project Experience',
    defaultTitle: 'Projects',
    description: 'Personal, academic or open-source projects',
    kind: 'entries',
    dateMode: 'range',
    showLocation: true,
    titleLabel: 'Project name',
    orgLabel: 'Organization / context',
  },
  leadership: {
    label: 'Leadership Experience',
    defaultTitle: 'Leadership Experience',
    description: 'Clubs, volunteering, roles you led',
    kind: 'entries',
    dateMode: 'range',
    showLocation: true,
    titleLabel: 'Role',
    orgLabel: 'Organization',
  },
  education: {
    label: 'Education',
    defaultTitle: 'Education',
    description: 'Degrees, diplomas and schools',
    kind: 'entries',
    dateMode: 'range',
    showLocation: true,
    titleLabel: 'Degree / qualification',
    orgLabel: 'School',
  },
  skills: {
    label: 'Skills',
    defaultTitle: 'Skills',
    description: 'Tools, languages and abilities',
    kind: 'skills',
    dateMode: 'none',
    showLocation: false,
    titleLabel: '',
    orgLabel: '',
  },
  summary: {
    label: 'Summary',
    defaultTitle: 'Summary',
    description: 'A short professional profile',
    kind: 'text',
    dateMode: 'none',
    showLocation: false,
    titleLabel: '',
    orgLabel: '',
  },
  certifications: {
    label: 'Certifications',
    defaultTitle: 'Certifications',
    description: 'Licences and certificates',
    kind: 'entries',
    dateMode: 'single',
    showLocation: false,
    titleLabel: 'Certification',
    orgLabel: 'Issuer',
  },
  custom: {
    label: 'Custom',
    defaultTitle: 'Custom Section',
    description: 'Awards, publications, languages, anything else',
    kind: 'entries',
    dateMode: 'none',
    showLocation: false,
    titleLabel: 'Title',
    orgLabel: 'Subtitle',
  },
};

export const SECTION_ORDER: SectionType[] = [
  'work',
  'project',
  'leadership',
  'education',
  'skills',
  'summary',
  'certifications',
  'custom',
];

export const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36);

export function emptyPersonal(): Personal {
  return { fullName: '', headline: '', email: '', phone: '', address: '', linkedin: '', portfolio: '', website: '' };
}

export function newEntry(partial: Partial<Entry> = {}): Entry {
  return {
    id: uid(),
    title: '',
    organization: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    date: '',
    description: '',
    bullets: [],
    ...partial,
  };
}

export function newSection(type: SectionType, partial: Partial<Section> = {}): Section {
  const meta = SECTION_META[type];
  return {
    id: uid(),
    type,
    title: meta.defaultTitle,
    visible: true,
    entries: meta.kind === 'entries' ? [newEntry()] : [],
    text: '',
    skills: [],
    dateMode: meta.dateMode,
    showLocation: meta.showLocation,
    ...partial,
  };
}

export function formatRange(e: Entry, mode: DateMode): string {
  if (mode === 'single') return e.date;
  if (mode === 'range') {
    const end = e.current ? 'Present' : e.endDate;
    if (e.startDate && end) return `${e.startDate} – ${end}`;
    return e.startDate || end;
  }
  return '';
}

/** Everything in the profile as lowercase text, for "is this keyword already in my CV?" checks. */
export function profileText(sections: Section[], personal?: Personal): string {
  const parts: string[] = [];
  if (personal) parts.push(personal.headline);
  for (const s of sections) {
    parts.push(s.title, s.text, ...s.skills);
    for (const e of s.entries) parts.push(e.title, e.organization, e.description, ...e.bullets);
  }
  return parts.join(' \n ').toLowerCase();
}
