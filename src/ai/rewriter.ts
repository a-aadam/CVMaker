import type { Rewriter } from '../keywords/pushPlanner';
import { chatText } from './engine';

// A 0.5B model follows a worked example far better than abstract rules, so each task is small and shown once.
export const aiRewriter: Rewriter = {
  summarySentence: (summary, keywords) =>
    chatText({
      system:
        'You write one short sentence to add to the end of a CV summary. Mention the given keywords naturally. ' +
        'Do not add numbers, years, employers or claims that are not in the summary. Reply with the sentence only.',
      user:
        'Summary: Marketing coordinator who plans campaigns for consumer brands.\n' +
        'Keywords: SEO, Google Analytics\n' +
        'Sentence: Comfortable using SEO and Google Analytics to guide campaign decisions.\n\n' +
        `Summary: ${summary}\nKeywords: ${keywords.join(', ')}\nSentence:`,
      maxTokens: 80,
    }),
  rewriteBullet: (bullet, keyword) =>
    chatText({
      system:
        'You rewrite one CV bullet point to include a given keyword. Keep every fact and number from the original. ' +
        'Change as few words as possible. Reply with the rewritten bullet only.',
      user:
        'Keyword: Python\nOriginal: Automated weekly sales reports for the finance team\n' +
        'Rewritten: Automated weekly sales reports for the finance team using Python\n\n' +
        'Keyword: Jira\nOriginal: Coordinated a store relaunch across 12 locations\n' +
        'Rewritten: Coordinated a store relaunch across 12 locations, tracking tasks in Jira\n\n' +
        `Keyword: ${keyword}\nOriginal: ${bullet}\nRewritten:`,
      maxTokens: 120,
    }),
};
