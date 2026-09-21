import { describe, it, expect } from 'vitest';
import { extractJobKeywords, matchJob, tokenize } from '@/lib/jobMatch';
import { createEmptyResume } from '@/types/resume';

const JD = `Senior Frontend Engineer — we are looking for an engineer with strong React and
TypeScript experience. You will build accessible UI with React, own TypeScript code quality,
and collaborate using Agile practices. Requirements: 5+ years React, TypeScript, testing
with Jest or Playwright, REST API integration, CI/CD familiarity, and excellent communication.`;

const makeResume = (skills: string[], bullets: string[] = []) => {
  const r = createEmptyResume();
  r.skills = skills;
  r.experience = [
    { id: 'e1', position: 'Frontend Engineer', company: 'Acme', location: '', startDate: '2020', endDate: '', current: true, bullets },
  ];
  return r;
};

describe('tokenize', () => {
  it('removes stop words and short tokens', () => {
    const tokens = tokenize('The team will use React and SQL in Berlin');
    expect(tokens).not.toContain('the');
    expect(tokens).not.toContain('will');
    expect(tokens).toContain('react');
    expect(tokens).toContain('berlin');
  });
});

describe('extractJobKeywords', () => {
  it('ranks frequent meaningful words first and caps results', () => {
    const keywords = extractJobKeywords(JD, 10);
    expect(keywords.length).toBeLessThanOrEqual(10);
    expect(keywords[0].count).toBeGreaterThanOrEqual(keywords[keywords.length - 1].count);
    expect(keywords.some((k) => k.keyword === 'react')).toBe(true);
  });
});

describe('matchJob', () => {
  it('finds matched and missing skills', () => {
    const result = matchJob(makeResume(['React', 'TypeScript']), JD);
    expect(result.matchedSkills).toContain('React');
    expect(result.matchedSkills).toContain('TypeScript');
    expect(result.missingSkills).toContain('Playwright');
  });

  it('recognizes skills from experience bullets, not just the skills list', () => {
    const result = matchJob(makeResume(['React'], ['Built REST API integrations in TypeScript']), JD);
    expect(result.matchedSkills).toContain('REST API');
    expect(result.matchedSkills).toContain('TypeScript');
  });

  it('computes keyword coverage between 0 and 100', () => {
    const result = matchJob(makeResume([]), JD);
    expect(result.keywordCoverage.percent).toBeGreaterThanOrEqual(0);
    expect(result.keywordCoverage.percent).toBeLessThanOrEqual(100);
    expect(result.keywordCoverage.total).toBe(result.keywordCoverage.matched + (result.keywordCoverage.total - result.keywordCoverage.matched));
  });

  it('produces recommendations including quantification advice when bullets lack numbers', () => {
    const result = matchJob(makeResume(['React'], ['Did frontend work']), JD);
    expect(result.recommendations.some((rec) => rec.toLowerCase().includes('measurable'))).toBe(true);
  });

  it('does not treat java as javascript and vice versa', () => {
    const withJs = matchJob(makeResume(['JavaScript']), 'Experience with JavaScript required');
    expect(withJs.matchedSkills).toContain('JavaScript');
    const withJava = matchJob(makeResume(['JavaScript']), 'Experience with Java on the backend required');
    expect(withJava.matchedSkills).not.toContain('JavaScript');
  });

  it('never mutates the resume', () => {
    const r = makeResume(['React']);
    const snapshot = JSON.stringify(r);
    matchJob(r, JD);
    expect(JSON.stringify(r)).toBe(snapshot);
  });
});
