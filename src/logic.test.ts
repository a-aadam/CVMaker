import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseCv } from './parse/heuristicParser';
import { extractKeywordsRules } from './keywords/ruleExtractor';
import { acceptableRewrite, missingKeywords, planPush } from './keywords/pushPlanner';
import { grounded, mostlyGrounded } from './ai/grounding';

const cv = readFileSync(new URL('../test-fixtures/sample-cv.txt', import.meta.url), 'utf8');
const job = readFileSync(new URL('../test-fixtures/sample-job.txt', import.meta.url), 'utf8');

describe('heuristic CV parser', () => {
  const p = parseCv(cv);

  it('reads contact details', () => {
    expect(p.personal.fullName).toBe('Jordan Rivera');
    expect(p.personal.headline).toBe('Data Analyst');
    expect(p.personal.email).toBe('jordan.rivera@example.com');
    expect(p.personal.phone).toContain('555-0142');
    expect(p.personal.address).toBe('Toronto, ON');
    expect(p.personal.linkedin).toBe('linkedin.com/in/jordanrivera');
    expect(p.personal.portfolio).toBe('github.com/jrivera');
  });

  it('finds every section in order', () => {
    expect(p.sections.map((s) => s.type)).toEqual([
      'summary', 'work', 'project', 'leadership', 'education', 'skills', 'certifications',
    ]);
  });

  it('splits work entries with dates, location and bullets', () => {
    const work = p.sections.find((s) => s.type === 'work')!;
    expect(work.entries).toHaveLength(2);
    const [a, b] = work.entries;
    expect(a).toMatchObject({ title: 'Data Analyst', organization: 'Northwind Logistics', location: 'Toronto, ON', startDate: 'Mar 2022', current: true });
    expect(a.bullets).toHaveLength(3);
    expect(b).toMatchObject({ title: 'Junior Analyst', organization: 'Maple Retail Group', startDate: 'Jun 2020', endDate: 'Feb 2022' });
  });

  it('keeps a comma inside a degree name', () => {
    const edu = p.sections.find((s) => s.type === 'education')!.entries[0];
    expect(edu).toMatchObject({ title: 'Bachelor of Commerce, Business Analytics', organization: 'University of Toronto', location: 'Toronto, ON' });
  });

  it('handles CVs without bullet markers or separators', () => {
    const messy = parseCv(
      'Sam Lee\nsam@example.com\nEXPERIENCE\nAcme Corp\nSoftware Engineer\nBerlin, Germany\n2019 - 2023\n' +
        'Built REST APIs in Go serving 2M requests a day.\nLed the migration of 40 services to Kubernetes.\n' +
        'Globex\nIntern\n2018\nWrote internal tools in Python for the support team.\n' +
        'EDUCATION\nTU Berlin\nBSc Computer Science\n2015 - 2019',
    );
    const [acme, globex] = messy.sections[0].entries;
    expect(acme).toMatchObject({ title: 'Software Engineer', organization: 'Acme Corp', location: 'Berlin, Germany', startDate: '2019', endDate: '2023' });
    expect(acme.bullets).toHaveLength(2);
    expect(globex).toMatchObject({ title: 'Intern', organization: 'Globex', endDate: '2018' });
    expect(messy.sections[1].entries[0]).toMatchObject({ title: 'BSc Computer Science', organization: 'TU Berlin' });
  });

  it('parses skills and single-date certifications', () => {
    expect(p.sections.find((s) => s.type === 'skills')!.skills).toEqual(['SQL', 'Python', 'R', 'Excel', 'Tableau', 'Git']);
    const cert = p.sections.find((s) => s.type === 'certifications')!.entries[0];
    expect(cert).toMatchObject({ title: 'Google Data Analytics Certificate', organization: 'Google', date: 'Aug 2021' });
  });
});

describe('rule keyword extractor', () => {
  const kws = extractKeywordsRules(job);
  it('finds the main hard skills', () => {
    for (const k of ['SQL', 'Python', 'Power BI', 'Tableau', 'Snowflake', 'dbt', 'ETL', 'A/B Testing', 'Agile']) {
      expect(kws).toContain(k);
    }
  });
  it('trims cue phrases at filler words', () => {
    expect(kws).not.toContain('Agile ways');
  });
  it('does not return filler words', () => {
    for (const k of kws) expect(['We', 'You', 'What', 'Strong']).not.toContain(k);
  });
});

describe('push planner', () => {
  const profile = parseCv(cv);

  it('lists only keywords the CV lacks', () => {
    expect(missingKeywords(profile, ['SQL', 'Snowflake', 'Tableau', 'Power BI'])).toEqual(['Snowflake', 'Power BI']);
  });

  it('without AI, proposes skills and a summary addition', async () => {
    const changes = await planPush(profile, ['SQL', 'Snowflake', 'Power BI'], null);
    expect(changes.map((c) => c.kind)).toEqual(['addSkills', 'summary']);
    const summary = changes[1];
    expect(summary.kind === 'summary' && summary.after).toContain('Snowflake and Power BI');
  });

  it('keeps good AI rewrites and drops invented numbers', async () => {
    const changes = await planPush(profile, ['Power BI', 'Snowflake'], {
      summarySentence: async () => 'Experienced with Power BI across 9 teams.',
      rewriteBullet: async (b, kw) =>
        kw === 'Power BI' ? `${b.replace('dashboards', 'Power BI dashboards')}` : `${b} saving 99 hours with ${kw}`,
    });
    const bullets = changes.filter((c) => c.kind === 'bullet');
    expect(bullets).toHaveLength(1);
    expect(bullets[0].kind === 'bullet' && bullets[0].after).toBe(
      'Built weekly delivery performance Power BI dashboards used by 40 regional managers',
    );
    // The invented "9 teams" sentence is rejected, so the safe fallback is used.
    const summary = changes.find((c) => c.kind === 'summary');
    expect(summary?.kind === 'summary' && summary.after).toContain('Key strengths include Power BI and Snowflake.');
  });

  it('rejects label-prefixed rewrites and keeps job titles out of skills', async () => {
    expect(acceptableRewrite('Built dashboards for managers', 'Senior Data Analyst: Built dashboards for managers in Power BI', ['Power BI'])).toBe(false);
    const changes = await planPush(profile, ['Senior Data Analyst', 'Snowflake'], null);
    expect(changes[0].kind === 'addSkills' && changes[0].skills).toEqual(['Snowflake']);
  });

  it('rejects rewrites that do not add a keyword', () => {
    expect(acceptableRewrite('Led a team', 'Led a great team', ['Python'])).toBe(false);
  });
});

describe('grounding', () => {
  it('matches text regardless of case and punctuation', () => {
    expect(grounded('northwind logistics', 'Data Analyst | Northwind Logistics |')).toBe(true);
    expect(grounded('Acme Corp', 'Northwind Logistics')).toBe(false);
    expect(mostlyGrounded('Built weekly dashboards used by managers', 'Built weekly delivery dashboards used by 40 regional managers')).toBe(true);
  });
});
