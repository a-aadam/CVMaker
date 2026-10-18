import { SKILL_TERMS, STOPWORDS } from './dictionary';

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Word boundaries that also work for terms like "C#", ".NET" and "C++".
function termRegex(term: string): RegExp {
  return new RegExp(`(?<![\\w.#+])${escape(term)}(?![\\w#+]|\\.\\w)`, 'gi');
}

const TERM_RES = SKILL_TERMS.map((t) => ({ term: t, re: termRegex(t) }));

// Single letters like "C" and "R" only count when written in capitals, to avoid false hits.
const CASE_SENSITIVE = new Set(['C', 'R', 'Go', 'AI', 'UI', 'UX', 'QA', 'SAS', 'S3']);

/** Rule-based ATS keyword extraction: known terms first, then repeated phrases. */
export function extractKeywordsRules(jd: string, limit = 30): string[] {
  const scores = new Map<string, number>();
  const add = (k: string, n: number) => scores.set(k, (scores.get(k) ?? 0) + n);

  for (const { term, re } of TERM_RES) {
    const matches = jd.match(re);
    if (!matches) continue;
    const hits = CASE_SENSITIVE.has(term) ? matches.filter((m) => m === term).length : matches.length;
    if (hits) add(term, 3 + hits);
  }

  // Phrases after cue words, e.g. "experience with Snowplow", "proficiency in Looker Studio".
  const cue = /(?:experience (?:with|in)|proficien(?:cy|t) (?:in|with)|knowledge of|familiarity with|expertise in|skilled in)\s+([^.;:\n]+)/gi;
  for (const m of jd.matchAll(cue)) {
    for (const piece of m[1].split(/,|\band\b|\bor\b|\//)) {
      const words = piece.trim().split(/\s+/).filter(Boolean);
      while (words.length && STOPWORDS.has(words[0].toLowerCase())) words.shift();
      // Stop at the first filler word: "Agile ways of working" -> "Agile".
      const stop = words.findIndex((w, i) => i > 0 && (STOPWORDS.has(w.toLowerCase()) || /^(ways?|tools?|practices|environments?)$/i.test(w)));
      if (stop > 0) words.length = stop;
      words.length = Math.min(words.length, 4);
      const phrase = words.join(' ').replace(/[()"]/g, '');
      if (phrase.length > 1 && phrase.length < 40 && /[a-z]/i.test(phrase)) add(phrase, 2);
    }
  }

  // Capitalised tool/product names and acronyms that repeat (e.g. "Snowflake", "SOC 2").
  const caps = jd.match(/\b(?:[A-Z][a-zA-Z0-9+#.]*[a-zA-Z0-9+#]|[A-Z]{2,}\d*)(?:\s+[A-Z][a-zA-Z0-9+#]+){0,2}\b/g) ?? [];
  const capCounts = new Map<string, number>();
  for (const c of caps) {
    const w = c.trim();
    if (STOPWORDS.has(w.toLowerCase()) || w.length < 2) continue;
    capCounts.set(w, (capCounts.get(w) ?? 0) + 1);
  }
  for (const [w, n] of capCounts) if (n >= 2 || /^[A-Z]{2,5}$/.test(w)) add(w, n);

  // Merge case-variants and drop phrases that only repeat a stronger term.
  const byLower = new Map<string, { k: string; s: number }>();
  for (const [k, s] of scores) {
    const lk = k.toLowerCase();
    const prev = byLower.get(lk);
    if (!prev || s > prev.s) byLower.set(lk, { k: prev && SKILL_TERMS.includes(prev.k) ? prev.k : k, s: s + (prev?.s ?? 0) });
  }
  const ranked = [...byLower.values()].sort((a, b) => b.s - a.s).map((x) => x.k);
  const firstWordStop = (k: string) => STOPWORDS.has(k.split(' ')[0].toLowerCase());
  return ranked.filter((k) => !firstWordStop(k)).slice(0, limit);
}
