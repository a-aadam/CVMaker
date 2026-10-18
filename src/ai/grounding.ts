// A 0.5B model can make things up. These checks keep only output that is backed by the source text.

export const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#.]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const words = (s: string) => norm(s).split(' ').filter((w) => w.length > 1);

/** The value appears (after normalisation) in the source. */
export function grounded(value: string, source: string): boolean {
  const v = norm(value);
  return !!v && norm(source).includes(v);
}

/** Most of the value's words appear in the source. Used for bullets the model may re-wrap. */
export function mostlyGrounded(value: string, source: string, ratio = 0.8): boolean {
  const w = words(value);
  if (!w.length) return false;
  const src = new Set(words(source));
  return w.filter((x) => src.has(x)).length / w.length >= ratio;
}

/** Numbers in the rewrite that weren't in the original are probably invented metrics. */
export function inventsNumbers(rewrite: string, original: string): boolean {
  const orig = new Set(original.match(/\d+(?:[.,]\d+)?/g) ?? []);
  return (rewrite.match(/\d+(?:[.,]\d+)?/g) ?? []).some((n) => !orig.has(n));
}

export function containsTerm(text: string, term: string): boolean {
  const t = norm(term);
  if (!t) return false;
  return ` ${norm(text)} `.includes(` ${t} `);
}
