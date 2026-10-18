import type { Entry, Profile, Section } from '../types';
import { chatJSON } from '../ai/engine';
import { grounded, mostlyGrounded } from '../ai/grounding';
import { newEntry, SECTION_META } from '../sections';
import { parseCv, splitSections, type Chunk } from './heuristicParser';

interface AiEntry {
  title: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

const ENTRY_SCHEMA = {
  type: 'object',
  properties: {
    entries: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          organization: { type: 'string' },
          location: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          current: { type: 'boolean' },
          bullets: { type: 'array', items: { type: 'string' } },
        },
        required: ['title', 'organization', 'location', 'startDate', 'endDate', 'current', 'bullets'],
      },
    },
  },
  required: ['entries'],
};

const SYSTEM =
  'You extract structured data from CV text. Copy text exactly as written. Never invent or reword anything. ' +
  'Use an empty string for anything that is missing. Respond with JSON only.';

function prompt(chunk: Chunk, text: string): string {
  const meta = SECTION_META[chunk.type];
  return (
    `Section: ${chunk.title}\n` +
    `For each item, "title" is the ${meta.titleLabel.toLowerCase()} and "organization" is the ${meta.orgLabel.toLowerCase()}. ` +
    `"current" is true when the end date is Present. "bullets" are the achievement lines.\n\n` +
    `CV text:\n"""\n${text}\n"""`
  );
}

// The model has a 4k-token window; keep each request well inside it.
const MAX_CHARS = 2400;

function slices(lines: string[]): string[] {
  const out: string[] = [];
  let cur = '';
  for (const l of lines) {
    if (cur && cur.length + l.length > MAX_CHARS) {
      out.push(cur);
      cur = '';
    }
    cur += `${l}\n`;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

function toEntry(a: AiEntry, source: string): Entry | null {
  const keep = (v: unknown) => (typeof v === 'string' && grounded(v, source) ? v.trim() : '');
  const end = keep(a.endDate);
  const endIsPresent = /^(present|current|now|ongoing)$/i.test(end);
  const e = newEntry({
    title: keep(a.title),
    organization: keep(a.organization),
    location: keep(a.location),
    startDate: keep(a.startDate),
    endDate: endIsPresent ? '' : end,
    current: endIsPresent || (a.current === true && !/\d{4}/.test(end) && /present|current|now|ongoing/i.test(source)),
    bullets: (Array.isArray(a.bullets) ? a.bullets : [])
      .filter((b): b is string => typeof b === 'string' && mostlyGrounded(b, source))
      .map((b) => b.replace(/^[•●▪*\-–]\s*/, '').trim()),
  });
  return e.title || e.organization ? e : null;
}

async function aiEntries(chunk: Chunk): Promise<Entry[] | null> {
  const out: Entry[] = [];
  for (const text of slices(chunk.lines)) {
    const res = await chatJSON<{ entries: AiEntry[] }>({
      system: SYSTEM,
      user: prompt(chunk, text),
      schema: ENTRY_SCHEMA,
      maxTokens: 1200,
    });
    if (!res?.entries) return null;
    for (const a of res.entries) {
      const e = toEntry(a, text);
      if (e) out.push(e);
    }
  }
  return out;
}

/**
 * Rules first, then the model re-reads entry sections the rules left messy (missing titles,
 * organizations or dates). The AI version is used only when it is grounded and at least as complete.
 */
export async function parseCvWithAi(text: string, onProgress: (msg: string) => void): Promise<Profile> {
  const base = parseCv(text);
  const { chunks } = splitSections(text);
  const sections: Section[] = [];
  for (let i = 0; i < base.sections.length; i++) {
    const section = base.sections[i];
    const chunk = chunks[i];
    // The rules are reliable on tidy CVs; only ask the model about sections they couldn't structure.
    const tidy = section.entries.every((e) => e.title && (e.organization || e.startDate || e.endDate || e.date));
    if (!chunk || SECTION_META[section.type].kind !== 'entries' || section.type === 'custom' || tidy) {
      sections.push(section);
      continue;
    }
    onProgress(`AI is reading “${section.title}”…`);
    try {
      const ai = await aiEntries(chunk);
      const count = (es: Entry[]) => es.reduce((n, e) => n + e.bullets.length + (e.title ? 1 : 0) + (e.organization ? 1 : 0), 0);
      if (ai && ai.length && count(ai) >= count(section.entries) * 0.9) {
        // Keep anything the rules found that the model left blank.
        const merged = ai.map((e, j) => {
          const r = section.entries[j];
          if (!r) return e;
          return {
            ...e,
            location: e.location || r.location,
            startDate: e.startDate || r.startDate,
            endDate: e.endDate || r.endDate,
            current: e.current || r.current,
            date: r.date,
            description: r.description,
            bullets: e.bullets.length ? e.bullets : r.bullets,
          };
        });
        sections.push({ ...section, entries: merged });
        continue;
      }
    } catch {
      /* fall back to the rule-based result for this section */
    }
    sections.push(section);
  }
  return { personal: base.personal, sections };
}
