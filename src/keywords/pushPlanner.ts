import type { Change, Profile } from '../types';
import { containsTerm, inventsNumbers, norm } from '../ai/grounding';
import { profileText, uid } from '../sections';
import { ROLE_RE } from '../parse/heuristicParser';

export interface Rewriter {
  /** One sentence to append to the summary that mentions some of the keywords. */
  summarySentence: (summary: string, keywords: string[]) => Promise<string>;
  /** The bullet rewritten to include one keyword. */
  rewriteBullet: (bullet: string, keyword: string) => Promise<string>;
}

export function missingKeywords(profile: Profile, keywords: string[]): string[] {
  const text = profileText(profile.sections, profile.personal);
  return keywords.filter((k) => !containsTerm(text, k));
}

const clean = (s: string) =>
  s
    .trim()
    .split('\n')[0]
    .replace(/^(rewritten|sentence|bullet)\s*:\s*/i, '')
    .replace(/^[•\-*"“]\s*|["”]$/g, '')
    .trim();

/** Reject rewrites that drop the original, balloon, invent numbers or don't actually add a keyword. */
export function acceptableRewrite(before: string, after: string, keywords: string[]): boolean {
  const a = after.trim();
  if (!a || norm(a) === norm(before)) return false;
  // Small models sometimes prefix a label such as "Senior Data Analyst: …".
  if (/^[^:]{1,40}:\s/.test(a) && !/^[^:]{1,40}:\s/.test(before)) return false;
  if (a.length > before.length * 1.8 + 60 || a.length < before.length * 0.8) return false;
  if (inventsNumbers(a, before)) return false;
  // Every number in the original must survive.
  if ((before.match(/\d+(?:[.,]\d+)?/g) ?? []).some((n) => !a.includes(n))) return false;
  return keywords.some((k) => containsTerm(a, k) && !containsTerm(before, k));
}

function acceptableSentence(sentence: string, summary: string, keywords: string[]): boolean {
  const s = sentence.trim();
  return s.length > 15 && s.length < 260 && !inventsNumbers(s, summary) && keywords.some((k) => containsTerm(s, k));
}

const BULLET_SECTIONS = new Set(['work', 'project', 'leadership']);
const MAX_BULLET_REWRITES = 6;

/** Build the list of proposed edits for "Push keywords to my CV". Nothing is applied here. */
export async function planPush(
  profile: Profile,
  keywords: string[],
  rewriter: Rewriter | null,
  onProgress: (msg: string) => void = () => {},
): Promise<Change[]> {
  const missing = missingKeywords(profile, keywords);
  const changes: Change[] = [];
  if (!missing.length) return changes;

  const skills = profile.sections.find((s) => s.type === 'skills');
  // Job titles like "Senior Data Analyst" are keywords but not skills.
  const skillLike = missing.filter((k) => !(k.split(' ').length > 1 && ROLE_RE.test(k.split(' ').pop()!)));
  if (skillLike.length) changes.push({ id: uid(), kind: 'addSkills', sectionId: skills?.id ?? null, skills: skillLike });

  const summary = profile.sections.find((s) => s.type === 'summary' && s.text.trim());
  if (summary) {
    const top = missing.slice(0, 4);
    let sentence = '';
    if (rewriter) {
      onProgress('Tailoring your summary…');
      try {
        sentence = clean(await rewriter.summarySentence(summary.text, top));
      } catch {
        sentence = '';
      }
      if (!acceptableSentence(sentence, summary.text, top)) sentence = '';
    }
    const base = summary.text.trim();
    const after = `${base}${/[.!?]$/.test(base) ? '' : '.'} ${sentence || strengthsSentence(top)}`;
    changes.push({ id: uid(), kind: 'summary', sectionId: summary.id, before: summary.text, after });
  }

  if (rewriter) {
    // Pair bullets with the missing keyword they share the most words with; each keyword is used once.
    const bullets = profile.sections
      .filter((s) => BULLET_SECTIONS.has(s.type) && s.visible)
      .flatMap((s) => s.entries.flatMap((e) => e.bullets.map((b, index) => ({ s, e, b, index }))))
      .filter((c) => c.b.trim().length > 20);
    const unused = new Set(missing);
    const pairs: { c: (typeof bullets)[number]; kw: string; score: number }[] = [];
    const usedBullets = new Set<string>();
    while (pairs.length < MAX_BULLET_REWRITES && unused.size && bullets.length > usedBullets.size) {
      let best: (typeof pairs)[number] | null = null;
      for (const c of bullets) {
        const key = `${c.e.id}:${c.index}`;
        if (usedBullets.has(key)) continue;
        const words = new Set(norm(`${c.b} ${c.e.title}`).split(' '));
        for (const kw of unused) {
          const score = norm(kw).split(' ').filter((w) => words.has(w)).length;
          if (!best || score > best.score) best = { c, kw, score };
        }
      }
      if (!best) break;
      pairs.push(best);
      unused.delete(best.kw);
      usedBullets.add(`${best.c.e.id}:${best.c.index}`);
    }

    let n = 0;
    for (const { c, kw } of pairs) {
      onProgress(`Tailoring bullet points (${++n}/${pairs.length})…`);
      let after = '';
      try {
        after = clean(await rewriter.rewriteBullet(c.b, kw));
      } catch {
        continue;
      }
      if (acceptableRewrite(c.b, after, [kw])) {
        changes.push({ id: uid(), kind: 'bullet', sectionId: c.s.id, entryId: c.e.id, index: c.index, before: c.b, after });
      }
    }
  }
  return changes;
}

function strengthsSentence(keywords: string[]): string {
  const list =
    keywords.length > 1 ? `${keywords.slice(0, -1).join(', ')} and ${keywords[keywords.length - 1]}` : keywords[0];
  return `Key strengths include ${list}.`;
}
