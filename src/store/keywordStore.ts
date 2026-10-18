import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type KeywordSource = 'rule' | 'ai' | 'manual';

export interface Keyword {
  text: string;
  source: KeywordSource;
}

type Status = 'idle' | 'reading' | 'done';

interface KeywordState {
  jobText: string;
  locked: boolean;
  status: Status;
  keywords: Keyword[];
  setJobText: (t: string) => void;
  lock: () => void;
  setStatus: (s: Status) => void;
  addKeywords: (k: Keyword[]) => void;
  removeKeyword: (text: string) => void;
  clear: () => void;
}

export const useKeywords = create<KeywordState>()(
  persist(
    (set) => ({
      jobText: '',
      locked: false,
      status: 'idle',
      keywords: [],
      setJobText: (jobText) => set({ jobText }),
      lock: () => set({ locked: true }),
      setStatus: (status) => set({ status }),
      addKeywords: (add) =>
        set((st) => {
          const seen = new Set(st.keywords.map((k) => k.text.toLowerCase()));
          const next = st.keywords.slice();
          for (const k of add) {
            const t = k.text.trim();
            if (t && !seen.has(t.toLowerCase())) {
              seen.add(t.toLowerCase());
              next.push({ ...k, text: t });
            }
          }
          return { keywords: next };
        }),
      removeKeyword: (text) => set((st) => ({ keywords: st.keywords.filter((k) => k.text !== text) })),
      clear: () => set({ jobText: '', locked: false, status: 'idle', keywords: [] }),
    }),
    {
      name: 'cvmaker.keywords',
      version: 1,
      // A run interrupted by a reload shouldn't come back stuck in "reading".
      merge: (persisted, current) => {
        const p = persisted as Partial<KeywordState>;
        return { ...current, ...p, status: p.status === 'reading' ? 'done' : (p.status ?? 'idle') };
      },
    },
  ),
);
