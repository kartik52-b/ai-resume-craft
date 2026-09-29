import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  STORAGE_KEY,
  CURRENT_STORAGE_VERSION,
  loadStore,
  saveStore,
  clearStoredResume,
  sanitizeResume,
} from '@/lib/storage';
import { resolveSectionOrder } from '@/lib/sections';
import { createEmptyResume, type ResumeData } from '@/types/resume';

const storeOf = (resume: ResumeData) => ({ resumes: [resume], activeId: resume.id });
const firstResume = (result: ReturnType<typeof loadStore>) =>
  result.store.resumes[0] ?? createEmptyResume();

describe('storage: fresh install', () => {
  it('returns an empty store when no data was ever saved', () => {
    clearStoredResume();
    const result = loadStore();
    expect(result.status).toBe('fresh');
    expect(result.store.resumes).toEqual([]);
    expect(result.store.activeId).toBeNull();
  });
});

describe('storage: save and restore round-trip', () => {
  beforeEach(() => clearStoredResume());

  it('restores data exactly after save', () => {
    const resume = createEmptyResume();
    resume.personal.fullName = 'Ada Lovelace';
    resume.personal.summary = 'First programmer';
    resume.skills = ['Mathematics', 'Analytics Engine'];

    const saveResult = saveStore(storeOf(resume));
    expect(saveResult.ok).toBe(true);

    const load = loadStore();
    expect(load.status).toBe('restored');
    expect(load.store.resumes).toHaveLength(1);
    expect(load.store.activeId).toBe(resume.id);
    expect(load.store.resumes[0].personal.fullName).toBe('Ada Lovelace');
    expect(load.store.resumes[0].skills).toEqual(['Mathematics', 'Analytics Engine']);
    expect(load.store.resumes[0].id).toBe(resume.id);
  });

  it('keeps template choice across load', () => {
    const resume = createEmptyResume();
    resume.template = 'minimal';
    saveStore(storeOf(resume));
    expect(firstResume(loadStore()).template).toBe('minimal');
  });

  it('writes a versioned envelope with savedAt metadata', () => {
    const resume = createEmptyResume();
    saveStore(storeOf(resume));
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(parsed.version).toBe(CURRENT_STORAGE_VERSION);
    expect(typeof parsed.savedAt).toBe('string');
    expect(parsed.store.resumes[0].id).toBe(resume.id);
  });

  it('saves and restores multiple resumes with independent data', () => {
    const a = createEmptyResume();
    a.personal.fullName = 'First';
    const b = createEmptyResume();
    b.personal.fullName = 'Second';
    saveStore({ resumes: [a, b], activeId: b.id });

    const load = loadStore();
    expect(load.status).toBe('restored');
    expect(load.store.resumes.map((r) => r.personal.fullName)).toEqual(['First', 'Second']);
    expect(load.store.activeId).toBe(b.id);
  });

  it('repairs a dangling activeId to the first resume', () => {
    const a = createEmptyResume();
    saveStore({ resumes: [a], activeId: 'does-not-exist' });
    const load = loadStore();
    expect(load.store.activeId).toBe(a.id);
  });
});

describe('storage: corrupted data', () => {
  beforeEach(() => clearStoredResume());

  it.each([
    ['truncated JSON', '{"version":2,"store":{"resumes":['],
    ['non-JSON garbage', 'not-json-at-all'],
    ['JSON with wrong root type', '"just a string"'],
    ['missing version', JSON.stringify({ store: {} })],
    ['future version', JSON.stringify({ version: 99, store: {} })],
    ['missing store field', JSON.stringify({ version: 2 })],
    ['null store', JSON.stringify({ version: 2, store: null })],
    ['resumes not an array', JSON.stringify({ version: 2, store: { resumes: 'oops', activeId: null } })],
  ])('recovers from %s', (_label, stored) => {
    localStorage.setItem(STORAGE_KEY, stored);
    const result = loadStore();
    expect(result.status).toBe('corrupted');
    expect(result.store.resumes).toEqual([]);
  });

  it('salvages a store resume whose personal section is invalid (usable shell remains)', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 2, store: { resumes: [{ id: 'x', title: 't', template: 'modern', personal: 5, experience: [], education: [], skills: [], projects: [], certifications: [] }], activeId: 'x' } }),
    );
    const result = loadStore();
    expect(result.status).toBe('salvaged');
    expect(result.store.resumes[0].personal.fullName).toBe('');
    expect(result.store.resumes[0].id).toBe('x');
  });

  it('does not overwrite corrupted storage during load', () => {
    localStorage.setItem(STORAGE_KEY, 'garbage');
    loadStore();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('garbage');
  });
});

describe('storage: partial salvage', () => {
  beforeEach(() => clearStoredResume());

  it('salvages a store where one resume is invalid but others are fine', () => {
    const good = createEmptyResume();
    good.personal.fullName = 'Good Resume';
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 2,
        savedAt: 'x',
        store: { resumes: [good, { broken: true }], activeId: good.id },
      }),
    );
    const load = loadStore();
    expect(load.status).toBe('salvaged');
    expect(load.store.resumes).toHaveLength(2);
    expect(load.store.resumes[0].personal.fullName).toBe('Good Resume');
    expect(load.store.resumes[1].personal.fullName).toBe('');
  });

  it('drops wrongly-typed fields to defaults instead of crashing', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 2,
        savedAt: 'x',
        store: {
          resumes: [{ personal: { fullName: 123 }, skills: ['a', 42, 'b'], experience: 'oops' }],
          activeId: null,
        },
      }),
    );
    const load = loadStore();
    expect(load.status).toBe('salvaged');
    expect(firstResume(load).personal.fullName).toBe('');
    expect(firstResume(load).skills).toEqual(['a', 'b']);
    expect(firstResume(load).experience).toEqual([]);
  });

  it('sanitizeResume never throws on hostile input', () => {
    expect(() => sanitizeResume(undefined)).not.toThrow();
    expect(() => sanitizeResume(42)).not.toThrow();
    expect(() => sanitizeResume({ personal: { fullName: { nested: true } } })).not.toThrow();
  });

  it('sanitizes a corrupt sectionOrder into the default order instead of crashing later', () => {
    // Regression: a stored sectionOrder of non-strings used to pass through
    // sanitizeResume and then throw inside resolveSectionOrder (white screen).
    const resume = sanitizeResume({
      id: 'r1',
      title: 'Broken order',
      template: 'modern',
      sectionOrder: [42, null, 'skills', 'made-up-section'],
      personal: { fullName: 'A' },
    });
    expect(() => resolveSectionOrder(resume)).not.toThrow();
    expect(resume.sectionOrder).toEqual(['skills']);
    // Unknown ids fall back to the default order via resolveSectionOrder.
    expect(resolveSectionOrder(resume)).toContain('personal');
  });

  it('salvages a store resume with a corrupt sectionOrder (usable shell remains)', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 2,
        store: {
          resumes: [{ id: 'x', title: 't', template: 'modern', sectionOrder: [1, 2], personal: { fullName: 'A' }, experience: [], education: [], skills: [], projects: [], certifications: [] }],
          activeId: 'x',
        },
      }),
    );
    const result = loadStore();
    expect(result.status).toBe('salvaged');
    expect(() => resolveSectionOrder(result.store.resumes[0])).not.toThrow();
    expect(result.store.resumes[0].sectionOrder).toEqual([]);
  });
});

describe('storage: save failures', () => {
  it('reports a named error when storage rejects writes (quota)', () => {
    const resume = createEmptyResume();
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });
    const result = saveStore(storeOf(resume));
    expect(result.ok).toBe(false);
    expect(result.error).toBe('QuotaExceededError');
    spy.mockRestore();
  });

  it('load never throws when localStorage access itself throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    expect(() => loadStore()).not.toThrow();
    expect(loadStore().status).toBe('fresh');
    spy.mockRestore();
  });
});
