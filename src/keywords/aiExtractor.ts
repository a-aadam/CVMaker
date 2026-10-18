import { chatJSON } from '../ai/engine';
import { grounded } from '../ai/grounding';

const SCHEMA = {
  type: 'object',
  properties: { keywords: { type: 'array', items: { type: 'string' } } },
  required: ['keywords'],
};

/** Ask the model for ATS keywords. Only terms that literally appear in the job description are kept. */
export async function extractKeywordsAi(jd: string): Promise<string[]> {
  const text = jd.length > 6000 ? jd.slice(0, 6000) : jd;
  const res = await chatJSON<{ keywords: string[] }>({
    system:
      'You are an ATS (applicant tracking system) expert. From the job description, list the hard skills, tools, ' +
      'technologies, certifications, methodologies and key soft skills a recruiter would screen for. ' +
      'Each keyword is 1 to 4 words, copied exactly as written in the job description. No duplicates. JSON only.',
    user: `Job description:\n"""\n${text}\n"""\n\nReturn {"keywords": [...]} with up to 25 keywords.`,
    schema: SCHEMA,
    maxTokens: 400,
  });
  if (!res || !Array.isArray(res.keywords)) return [];
  return res.keywords
    .filter((k): k is string => typeof k === 'string')
    .map((k) => k.trim().replace(/\.$/, ''))
    .filter((k) => k.length > 1 && k.length <= 40 && k.split(/\s+/).length <= 4 && grounded(k, jd));
}
