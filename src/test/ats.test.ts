import { describe, it, expect } from 'vitest';
import { analyzeResume, BANDS } from '@/lib/ats';
import { createEmptyResume } from '@/types/resume';

const base = () => {
  const r = createEmptyResume();
  r.personal = {
    ...r.personal,
    fullName: 'Aarav Singh',
    email: 'jane@example.com',
    location: 'Berlin, DE',
    summary: 'Software engineer with a track record of shipping reliable web products and leading small teams to deliver on time.',
  };
  r.experience = [
    {
      id: 'e1',
      position: 'Software Engineer',
      company: 'Acme',
      location: 'Berlin',
      startDate: '2021',
      endDate: '2023',
      current: false,
      bullets: [
        'Reduced API latency by 40% (230ms to 140ms)',
        'Led migration of 12 services to TypeScript, cutting type-related bugs by 25%',
        'Mentored 3 junior engineers',
      ],
    },
  ];
  r.education = [{ id: 'ed1', school: 'TU Berlin', degree: 'BSc', field: 'Computer Science', startDate: '2015', endDate: '2019', gpa: '' }];
  r.skills = ['TypeScript', 'React', 'Node.js', 'SQL', 'Docker', 'Git'];
  return r;
};

describe('ATS analyzer', () => {
  it('scores a complete resume in the strong band', () => {
    const result = analyzeResume(base());
    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.band).toBe('strong');
    expect(result.checks.every((c) => c.earned >= 0 && c.earned <= c.weight)).toBe(true);
  });

  it('scores an empty resume 0 with actionable findings', () => {
    const result = analyzeResume(createEmptyResume());
    expect(result.score).toBe(0);
    expect(result.band).toBe('weak');
    expect(result.sectionIssues.length).toBeGreaterThan(0);
  });

  it('rewards quantified achievements and detects their absence', () => {
    const r = base();
    r.experience[0].bullets = ['Did work', 'Did more work', 'Helped team'];
    const result = analyzeResume(r);
    const exp = result.checks.find((c) => c.id === 'experience')!;
    expect(exp.earned).toBeLessThan(30);
    expect(exp.status).not.toBe('pass');
  });

  it('penalizes very long bullets under formatting risks', () => {
    const r = base();
    r.experience[0].bullets = ['x'.repeat(300)];
    const result = analyzeResume(r);
    const fmt = result.checks.find((c) => c.id === 'formatting')!;
    expect(fmt.earned).toBeLessThan(10);
  });

  it('respects section visibility for completeness', () => {
    const r = base();
    r.hiddenSections = [...(r.hiddenSections ?? []), 'projects', 'certifications'];
    const result = analyzeResume(r);
    const completeness = result.checks.find((c) => c.id === 'completeness')!;
    expect(completeness.status).toBe('pass');
  });

  it('caps score at 100', () => {
    const result = analyzeResume(base());
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('exposes bands sorted descending', () => {
    for (let i = 1; i < BANDS.length; i++) {
      expect(BANDS[i - 1].min).toBeGreaterThan(BANDS[i].min);
    }
  });
});
