import type { Entry, Personal, Profile, Section, SectionType } from '../types';
import { emptyPersonal, newEntry, newSection, SECTION_META } from '../sections';

const HEADINGS: [RegExp, SectionType][] = [
  [/^(professional |work |employment |relevant |career )?(experience|history|employment)( history)?$/, 'work'],
  [/^(academic |personal |key |selected |technical )?projects?( experience)?$/, 'project'],
  [
    /^(leadership|volunteer(ing)?|extra-?curricular|activities|community)( experience| activities| & activities| and activities| involvement)?$/,
    'leadership',
  ],
  [/^(education|academic background|academics|education (and|&) training|qualifications)$/, 'education'],
  [/^(technical |core |key )?(skills|competencies|expertise|technologies|tools)( (and|&) (tools|technologies|abilities|interests))?$/, 'skills'],
  [/^(professional |career )?(summary|profile|objective|about( me)?)$/, 'summary'],
  [/^(certifications?|licen[sc]es?( (and|&) certifications?)?|certificates?|courses?)$/, 'certifications'],
  [/^(awards?|honou?rs?( (and|&) awards)?|achievements|publications|languages|interests|hobbies|references|volunteer work)$/, 'custom'],
];

const MONTH =
  '(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
const DATE = `(?:${MONTH}\\.?,?\\s+\\d{4}|\\d{1,2}/\\d{4}|\\d{4})`;
const RANGE_RE = new RegExp(`(${DATE})\\s*(?:-|–|—|to|until)\\s*(${DATE}|present|current|now|ongoing)`, 'i');
const SINGLE_RE = new RegExp(`(${DATE})`, 'i');
const BULLET_RE = /^\s*(?:[•●▪◦‣∙·*–\-—]|o\s|\d+[.)]\s)\s*/;
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;
const URL_RE = /((?:https?:\/\/)?(?:www\.)?[\w-]+(?:\.[\w-]+)+(?:\/[^\s|,]*)?)/gi;
const LOCATION_RE = /\b([A-Z][a-zA-Z.'-]+),\s*([A-Z]{2}|[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s*$/;
// First words of two-word city names, so "Maple Retail Group New York, NY" keeps "New York".
const CITY_PREFIX = /^(new|san|santa|los|las|st\.?|saint|fort|port|north|south|east|west|grand|salt|el|la|le|rio|hong|kuala|abu|buenos|cape|ho|tel|mexico|sao|são|kansas|oklahoma|jersey|palo|mountain|redwood|niagara|thunder|saskatoon)$/i;

export const ROLE_RE =
  /\b(engineer|developer|analyst|manager|intern|designer|coordinator|director|specialist|assistant|consultant|lead|officer|associate|scientist|administrator|representative|technician|teacher|nurse|accountant|architect|president|chair|captain|founder|head|volunteer|tutor|mentor|researcher|programmer|executive|supervisor|advisor|agent|clerk|editor|writer|owner)s?\b/i;
const DEGREE_RE = /\b(b\.?sc|b\.?a|b\.?eng|bachelor|m\.?sc|m\.?a|master|mba|ph\.?d|doctor|diploma|degree|associate|certificate|high school|a-levels|gcse)\b/i;

/** A trailing "City, Region" in a line, or null. */
export function findLocation(text: string): { location: string; index: number } | null {
  const m = text.match(LOCATION_RE);
  if (!m || m.index === undefined) return null;
  let index = m.index;
  const before = text.slice(0, index).trimEnd();
  const prev = before.match(/([A-Z][a-zA-Z.]*)$/);
  if (prev && CITY_PREFIX.test(prev[1])) index = before.length - prev[1].length;
  return { location: text.slice(index).trim(), index };
}

export function headingType(line: string): { type: SectionType; title: string } | null {
  const clean = line.replace(/[:|_•]+$/g, '').replace(/\s+/g, ' ').trim();
  if (!clean || clean.length > 45) return null;
  // Real headings are capitalised ("EDUCATION", "Work Experience") or end with a colon;
  // this keeps a subtitle like "Personal project" from starting a new section.
  const looksLikeHeading =
    clean === clean.toUpperCase() ||
    /:\s*$/.test(line) ||
    clean.split(' ').every((w) => /^(and|of|&|the)$/i.test(w) || /^[\p{Lu}\d&]/u.test(w));
  if (!looksLikeHeading) return null;
  const lower = clean.toLowerCase();
  for (const [re, type] of HEADINGS) if (re.test(lower)) return { type, title: titleCase(clean) };
  return null;
}

function titleCase(s: string): string {
  if (s !== s.toUpperCase()) return s;
  return s
    .toLowerCase()
    .replace(/(^|[\s(/-])(\p{L})/gu, (_m, pre: string, c: string) => pre + c.toUpperCase())
    .replace(/\b(And|Of)\b/g, (m) => m.toLowerCase());
}

export interface Chunk {
  type: SectionType;
  title: string;
  lines: string[];
}

/** Split CV text into a header (contact block) and titled chunks. */
export function splitSections(text: string): { header: string[]; chunks: Chunk[] } {
  const lines = text
    .replace(/\r/g, '')
    .split('\n')
    .map((l) => l.replace(/\t/g, ' ').replace(/\s+$/, ''))
    .filter((l) => l.trim());
  const header: string[] = [];
  const chunks: Chunk[] = [];
  let current: Chunk | null = null;
  for (const line of lines) {
    const h = headingType(line.trim());
    if (h) {
      current = { type: h.type, title: h.title, lines: [] };
      chunks.push(current);
    } else if (current) current.lines.push(line);
    else header.push(line);
  }
  return { header, chunks };
}

const isContact = (l: string) => EMAIL_RE.test(l) || PHONE_RE.test(l) || /https?:|www\.|linkedin|github/i.test(l);

export function parsePersonal(header: string[], fullText: string): Personal {
  const p = emptyPersonal();
  const text = header.join('\n') || fullText.slice(0, 600);
  p.email = text.match(EMAIL_RE)?.[0] ?? fullText.match(EMAIL_RE)?.[0] ?? '';
  const phone = text.match(PHONE_RE)?.[1];
  if (phone && phone.replace(/\D/g, '').length >= 8) p.phone = phone.trim();
  const urls = (text.match(URL_RE) ?? []).filter((u) => !EMAIL_RE.test(u) && /[a-z]/i.test(u) && !/^\d/.test(u));
  for (const u of urls) {
    if (p.email.includes(u)) continue;
    if (/linkedin\./i.test(u)) p.linkedin ||= u;
    else if (/github\.|gitlab\.|behance\.|dribbble\.|portfolio/i.test(u)) p.portfolio ||= u;
    else if (/\.(com|net|org|io|dev|me|co|app|ca|uk|site|xyz)\b/i.test(u)) p.website ||= u;
  }
  const candidates = header.map((l) => l.trim()).filter((l) => l && !isContact(l));
  const name = candidates.find((l) => /^[\p{L}'’.-]+(\s+[\p{L}'’.-]+){0,4}$/u.test(l) && l.length <= 50);
  if (name) {
    p.fullName = titleCase(name);
    const after = candidates[candidates.indexOf(name) + 1];
    if (after && after.length <= 80 && !/^[A-Z][\w .'-]+,\s*[A-Z][\w .'-]+$/.test(after)) p.headline = after;
  }
  // Address: a "City, Region" piece of a contact line, split on separators.
  for (const l of header) {
    for (const piece of l.split(/\s*[|•·]\s*/)) {
      const t = piece.trim();
      if (
        !p.address &&
        !isContact(t) &&
        t !== p.fullName &&
        t !== p.headline &&
        /^[A-Z][\w .'-]+,\s*[A-Z][\w .'-]+(,\s*[A-Z][\w .'-]+)?$/.test(t)
      ) {
        p.address = t;
      }
    }
  }
  return p;
}

interface Dates {
  rest: string;
  start: string;
  end: string;
  current: boolean;
  single: string;
}

function stripDates(line: string): Dates {
  const r = line.match(RANGE_RE);
  if (r) {
    const current = /present|current|now|ongoing/i.test(r[2]);
    return { rest: line.replace(r[0], ' ').trim(), start: r[1], end: current ? '' : r[2], current, single: '' };
  }
  const s = line.match(SINGLE_RE);
  if (s) return { rest: line.replace(s[0], ' ').trim(), start: '', end: '', current: false, single: s[1] };
  return { rest: line, start: '', end: '', current: false, single: '' };
}

const tidy = (s: string) => s.replace(/^[\s,|–—()-]+|[\s,|–—()-]+$/g, '').replace(/\s{2,}/g, ' ');

export function parseEntries(lines: string[], type: SectionType): Entry[] {
  const meta = SECTION_META[type];
  const entries: Entry[] = [];
  let cur: Entry | null = null;
  let headerLines = 0;

  for (const raw of lines) {
    const line = raw.trim();
    if (BULLET_RE.test(line)) {
      if (!cur) entries.push((cur = newEntry()));
      cur.bullets.push(line.replace(BULLET_RE, '').trim());
      continue;
    }
    // Unmarked achievement lines ("Built REST APIs in Go serving 2M requests a day.") are bullets too.
    const wordCount = line.split(/\s+/).length;
    if (
      cur &&
      cur.title &&
      wordCount >= 6 &&
      !RANGE_RE.test(line) &&
      (/[.;]$/.test(line) || /^[A-Z][a-z]+(ed|ing)\b/.test(line))
    ) {
      cur.bullets.push(line);
      continue;
    }
    // Continuation of a wrapped bullet: starts lowercase right after a bullet.
    if (cur && cur.bullets.length && /^[a-z(]/.test(line)) {
      cur.bullets[cur.bullets.length - 1] += ` ${line}`;
      continue;
    }
    const d = stripDates(line);
    // A line holding only dates belongs to the entry above, however many header lines it has.
    const dateOnly = !tidy(d.rest) && (d.start || d.single);
    const hasDates = !!(cur && (cur.startDate || cur.endDate || cur.date));
    if (!cur || cur.bullets.length > 0 || (headerLines >= 3 && !(dateOnly && !hasDates))) {
      cur = newEntry();
      entries.push(cur);
      headerLines = 0;
    }
    const e = cur;
    if (d.start) {
      e.startDate ||= d.start;
      e.endDate ||= d.end;
      e.current ||= d.current;
    } else if (d.single) {
      if (meta.dateMode === 'range' && !e.startDate) e.endDate ||= d.single;
      else e.date ||= d.single;
    }
    let rest = d.rest;
    // Long unbulleted lines after the title block are prose, not more header fields.
    if (headerLines >= 1 && rest.length > 90) {
      e.description = e.description ? `${e.description} ${rest}` : rest;
      headerLines++;
      continue;
    }
    const loc = findLocation(rest);
    // On the first line, only trust a location set off by a separator ("… | Toronto, ON"),
    // otherwise "Bachelor of Commerce, Business Analytics" would look like a place.
    const separated = /[|•·–—-]\s*$/.test(rest.slice(0, loc?.index ?? 0));
    if (loc && meta.showLocation && !e.location && (headerLines > 0 || separated)) {
      e.location = loc.location;
      rest = rest.slice(0, loc.index);
    }
    // Prefer the strongest separator present, so "Bachelor of Commerce, Business Analytics | U of T" stays whole.
    // Commas only separate fields on lines without any other delimiter (pipes or a date column).
    const delimited = /[|•·]/.test(line) || !!d.start || !!d.single;
    let parts: string[] = [];
    for (const sep of [/\s+[|•·]\s+/, /\s+[–—-]\s+|\s+at\s+/, ...(delimited ? [] : [/,\s+(?=[A-Z])/])]) {
      parts = rest.split(sep).map(tidy).filter(Boolean);
      if (parts.length > 1) break;
    }
    for (const part of parts) {
      if (!e.title) e.title = part;
      else if (!e.organization) e.organization = part;
      else if (!e.location && meta.showLocation) e.location = part;
      else e.description = e.description ? `${e.description} ${part}` : part;
    }
    headerLines++;
  }
  for (const e of entries) {
    if (meta.dateMode === 'single' && !e.date) e.date = e.endDate || e.startDate;
    // CVs list "Company / Role" as often as "Role / Company"; put the role (or degree) in the title.
    const titleRe = type === 'education' ? DEGREE_RE : type === 'work' || type === 'leadership' ? ROLE_RE : null;
    if (titleRe && e.organization && titleRe.test(e.organization) && !titleRe.test(e.title)) {
      [e.title, e.organization] = [e.organization, e.title];
    }
  }
  return entries.filter((e) => e.title || e.organization || e.bullets.length || e.description);
}

export function parseSkills(lines: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of lines) {
    const line = raw.replace(BULLET_RE, '').replace(/^[^:,]{2,30}:\s*/, '');
    for (const piece of line.split(/\s*[,;|•·]\s*|\s{3,}/)) {
      const s = piece.trim().replace(/\.$/, '');
      if (s && s.length <= 40 && !seen.has(s.toLowerCase())) {
        seen.add(s.toLowerCase());
        out.push(s);
      }
    }
  }
  return out;
}

export function chunkToSection(chunk: Chunk): Section {
  const meta = SECTION_META[chunk.type];
  const title = chunk.title;
  if (meta.kind === 'text') return newSection(chunk.type, { title, text: chunk.lines.map((l) => l.trim()).join(' ') });
  if (meta.kind === 'skills') return newSection(chunk.type, { title, skills: parseSkills(chunk.lines) });
  const entries = parseEntries(chunk.lines, chunk.type);
  const section = newSection(chunk.type, { title, entries: entries.length ? entries : [newEntry()] });
  if (chunk.type === 'custom' && entries.some((e) => e.date)) section.dateMode = 'single';
  return section;
}

/** Rule-based CV parse. Works everywhere; the AI pass refines it when available. */
export function parseCv(text: string): Profile {
  const { header, chunks } = splitSections(text);
  const sections = chunks.map(chunkToSection);
  if (!chunks.length && header.length > 3) {
    sections.push(newSection('summary', { text: header.slice(3).join(' ') }));
  }
  return { personal: parsePersonal(header, text), sections };
}
