export interface Personal {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  portfolio: string;
  website: string;
}

export type SectionType =
  | 'work'
  | 'project'
  | 'leadership'
  | 'education'
  | 'skills'
  | 'summary'
  | 'certifications'
  | 'custom';

export type DateMode = 'none' | 'single' | 'range';

export interface Entry {
  id: string;
  title: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  date: string;
  description: string;
  bullets: string[];
}

export interface Section {
  id: string;
  type: SectionType;
  title: string;
  visible: boolean;
  entries: Entry[];
  text: string;
  skills: string[];
  dateMode: DateMode;
  showLocation: boolean;
}

export interface Profile {
  personal: Personal;
  sections: Section[];
}

/** A single proposed edit produced by "Push keywords", reviewed by the user before applying. */
export type Change =
  | { id: string; kind: 'addSkills'; sectionId: string | null; skills: string[] }
  | { id: string; kind: 'summary'; sectionId: string; before: string; after: string }
  | {
      id: string;
      kind: 'bullet';
      sectionId: string;
      entryId: string;
      index: number;
      before: string;
      after: string;
    };
