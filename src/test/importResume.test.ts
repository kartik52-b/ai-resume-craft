import { describe, it, expect } from 'vitest';
import { parseImportedText, isSupportedImportFile, importErrorMessage } from '@/lib/importResume';

const SAMPLE = [
  'Jane Doe',
  'jane@example.com | +49 30 555 0100 | Berlin, Germany',
  '',
  'SUMMARY',
  'Software engineer with eight years of experience building web platforms.',
  '',
  'EXPERIENCE',
  'Senior Software Engineer',
  'Acme Corp | 2020 - Present',
  '- Led migration of 12 services to TypeScript',
  '- Reduced API latency by 40%',
  'Software Engineer',
  'Globex | 2016 - 2020',
  '- Built customer dashboards used by 50k users',
  '',
  'EDUCATION',
  'TU Berlin',
  'BSc, Computer Science',
  '2012 - 2016',
  '',
  'SKILLS',
  'TypeScript, React, Node.js, SQL, Docker',
  '',
  'CERTIFICATIONS',
  'AWS Solutions Architect | Amazon | 2022',
].join('\n');

describe('parseImportedText — TXT resume', () => {
  const result = parseImportedText(SAMPLE);

  it('extracts the name from the first line', () => {
    expect(result.draft.personal.fullName).toBe('Jane Doe');
  });

  it('extracts email and phone', () => {
    expect(result.draft.personal.email).toBe('jane@example.com');
    expect(result.draft.personal.phone).toContain('+49');
  });

  it('extracts the summary', () => {
    expect(result.draft.personal.summary).toContain('eight years of experience');
  });

  it('parses two experience roles with bullets', () => {
    expect(result.draft.experience.length).toBe(2);
    expect(result.draft.experience[0].position).toContain('Senior Software Engineer');
    expect(result.draft.experience[0].bullets.length).toBe(2);
    expect(result.draft.experience[0].current).toBe(true);
  });

  it('parses education with school, degree and field', () => {
    expect(result.draft.education.length).toBe(1);
    expect(result.draft.education[0].school).toBe('TU Berlin');
    expect(result.draft.education[0].degree).toBe('BSc');
    expect(result.draft.education[0].field).toContain('Computer Science');
  });

  it('parses skills by separator', () => {
    expect(result.draft.skills).toContain('TypeScript');
    expect(result.draft.skills).toContain('Docker');
  });

  it('parses certifications with issuer and date', () => {
    expect(result.draft.certifications.length).toBe(1);
    expect(result.draft.certifications[0].name).toContain('AWS');
    expect(result.draft.certifications[0].issuer).toBe('Amazon');
  });

  it('produces a valid resume ready for review (not auto-applied)', () => {
    expect(result.draft.template).toBe('modern');
    expect(result.draft.id).toBeTruthy();
  });
});

describe('parseImportedText — malformed and empty input', () => {
  it('never throws on garbage input', () => {
    expect(() => parseImportedText(',,, === <<< >>>')).not.toThrow();
  });

  it('returns an empty draft with a warning for unreadable text', () => {
    const result = parseImportedText('\n\n   \n');
    expect(result.warnings.some((w) => w.includes('No readable text'))).toBe(true);
  });

  it('preserves unrecognized lines for review', () => {
    const result = parseImportedText('Jane Doe\nSOMETHING UNUSUAL BUT IMPORTANT\nEXPERIENCE\nDev at X\n- did things');
    expect(result.unparsedLines.some((l) => l.includes('SOMETHING UNUSUAL'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('could not be mapped'))).toBe(true);
  });

  it('warns when no experience section is detected', () => {
    const result = parseImportedText('Jane Doe\nSKILLS\nReact');
    expect(result.warnings.some((w) => w.includes('No experience section'))).toBe(true);
  });

  it('respects the requested template', () => {
    const result = parseImportedText(SAMPLE, 'professional');
    expect(result.draft.template).toBe('professional');
  });
});

describe('file validation helpers', () => {
  it('accepts txt, md and docx', () => {
    expect(isSupportedImportFile('resume.txt')).toBe(true);
    expect(isSupportedImportFile('resume.md')).toBe(true);
    expect(isSupportedImportFile('resume.docx')).toBe(true);
    expect(isSupportedImportFile('resume.pdf')).toBe(false);
    expect(isSupportedImportFile('resume.exe')).toBe(false);
  });

  it('maps every error code to a user-facing message', () => {
    for (const code of ['empty', 'too_large', 'unsupported_type', 'parse_failed'] as const) {
      expect(importErrorMessage(code).length).toBeGreaterThan(5);
    }
  });
});
