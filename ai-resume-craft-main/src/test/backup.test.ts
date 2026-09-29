import { describe, it, expect } from 'vitest';
import { parseResumeBackup, CURRENT_STORAGE_VERSION } from '@/lib/storage';
import { createEmptyResume } from '@/types/resume';

/** Backup parsing backs Settings → "Restore from backup". */

describe('parseResumeBackup', () => {
  it('parses the v2 envelope written by Download backup', () => {
    const resume = createEmptyResume();
    resume.personal.fullName = 'Ada Lovelace';
    resume.skills = ['Analytical Engines'];

    const envelope = {
      version: CURRENT_STORAGE_VERSION,
      savedAt: new Date().toISOString(),
      store: { resumes: [resume], activeId: resume.id },
    };

    const result = parseResumeBackup(JSON.stringify(envelope));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.resumes).toHaveLength(1);
      expect(result.resumes[0].personal.fullName).toBe('Ada Lovelace');
      expect(result.resumes[0].skills).toEqual(['Analytical Engines']);
    }
  });

  it('accepts a bare array of resumes and a { resumes } object', () => {
    const resume = createEmptyResume();
    resume.personal.fullName = 'Grace Hopper';

    const asArray = parseResumeBackup(JSON.stringify([resume]));
    expect(asArray.ok).toBe(true);
    if (asArray.ok) expect(asArray.resumes[0].personal.fullName).toBe('Grace Hopper');

    const asObject = parseResumeBackup(JSON.stringify({ resumes: [resume] }));
    expect(asObject.ok).toBe(true);
    if (asObject.ok) expect(asObject.resumes).toHaveLength(1);
  });

  it('drops invalid entries instead of fabricating content', () => {
    const valid = createEmptyResume();
    const result = parseResumeBackup(JSON.stringify([valid, { nope: true }, 'string']));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.resumes).toHaveLength(1);
  });

  it('rejects non-JSON, future versions and foreign shapes without throwing', () => {
    expect(parseResumeBackup('definitely not json')).toEqual({ ok: false, error: 'not-json' });
    expect(
      parseResumeBackup(JSON.stringify({ version: CURRENT_STORAGE_VERSION + 1, store: { resumes: [] } })),
    ).toEqual({ ok: false, error: 'unsupported-version' });
    expect(parseResumeBackup(JSON.stringify({ hello: 'world' }))).toEqual({ ok: false, error: 'shape' });
    expect(parseResumeBackup(JSON.stringify([{}, 'x']))).toEqual({ ok: false, error: 'shape' });
    expect(parseResumeBackup('')).toEqual({ ok: false, error: 'not-json' });
  });
});
