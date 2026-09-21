import { describe, it, expect, beforeEach } from 'vitest';
import { STORAGE_KEY, loadStore, clearStoredResume } from '@/lib/storage';

/**
 * Migration tests write legacy-version envelopes exactly like real stored
 * data from previous app releases, then verify lossless upgrades.
 *
 * Future schema changes: bump CURRENT_STORAGE_VERSION in src/lib/storage.ts,
 * extend the legacy/store migration path and add cases here.
 */
describe('storage: legacy migration', () => {
  beforeEach(() => clearStoredResume());

  it('migrates complete v1 single-resume data into the v2 store', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        savedAt: '2025-01-01T00:00:00.000Z',
        data: {
          id: 'legacy-1',
          title: 'My Old Resume',
          template: 'professional',
          personal: {
            fullName: 'Legacy User',
            email: 'legacy@example.com',
            phone: '',
            location: '',
            website: '',
            linkedin: '',
            github: '',
            summary: '',
          },
          experience: [],
          education: [],
          skills: ['Legacy Skill'],
          projects: [],
          certifications: [],
        },
      }),
    );

    const load = loadStore();
    expect(load.status).toBe('restored');
    expect(load.store.resumes).toHaveLength(1);
    expect(load.store.activeId).toBe('legacy-1');
    expect(load.store.resumes[0].personal.fullName).toBe('Legacy User');
    expect(load.store.resumes[0].personal.email).toBe('legacy@example.com');
    expect(load.store.resumes[0].template).toBe('professional');
    expect(load.store.resumes[0].skills).toEqual(['Legacy Skill']);
    expect(load.store.resumes[0].title).toBe('My Old Resume');
  });

  it('migrates partial v1 data as salvaged with defaults filled', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        savedAt: 'x',
        data: { id: 'legacy-2', title: 'Partial', personal: { fullName: 'Partial User' } },
      }),
    );
    const load = loadStore();
    expect(load.status).toBe('salvaged');
    expect(load.store.resumes[0].personal.fullName).toBe('Partial User');
    expect(load.store.resumes[0].personal.email).toBe('');
  });

  it('migrates v0 partial data as salvaged with defaults filled', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 0, savedAt: 'x', data: { personal: { fullName: 'Ancient User' } } }),
    );
    const load = loadStore();
    expect(load.status).toBe('salvaged');
    expect(load.store.resumes[0].personal.fullName).toBe('Ancient User');
    expect(load.store.resumes[0].template).toBe('modern');
    expect(load.store.resumes[0].experience).toEqual([]);
  });

  it('keeps updatedAt timestamps through migration', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        savedAt: 'x',
        data: { id: 'u1', title: 'T', personal: {}, updatedAt: '2025-06-01T00:00:00.000Z' },
      }),
    );
    const load = loadStore();
    expect(load.store.resumes[0].updatedAt).toBe('2025-06-01T00:00:00.000Z');
  });

  it('reports corrupted for legacy envelopes without data', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1 }));
    expect(loadStore().status).toBe('corrupted');
  });
});
