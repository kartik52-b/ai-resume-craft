import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadOnboardingDraft,
  saveOnboardingDraft,
  syncOnboardingDraft,
  clearOnboardingDraft,
  createEmptyDraft,
  isOnboardingDraftEmpty,
  type OnboardingDraft,
} from '@/lib/onboardingDraft';
import { createEmptyEducationDraft, type BackgroundDetails } from '@/lib/onboarding';

const DRAFT_KEY = 'ai-resume-craft:onboarding-draft';

const draftWith = (overrides: Partial<OnboardingDraft> = {}): OnboardingDraft => ({
  ...createEmptyDraft('draft-a'),
  ...overrides,
});

describe('onboardingDraft: save and restore round-trip', () => {
  beforeEach(() => clearOnboardingDraft());

  it('restores details, background and template for the same draft id', () => {
    const education = [
      { ...createEmptyEducationDraft(), school: 'State University', degree: 'B.S.', field: 'CS', startDate: '2018', endDate: '2022', description: 'Honors' },
    ];
    const background: BackgroundDetails = {
      education,
      experience: [{ company: 'Acme', position: 'Engineer', startDate: '2022', endDate: '', description: 'Shipped things' }],
      skills: ['TypeScript'],
      projects: [],
      certifications: [],
    };
    saveOnboardingDraft(draftWith({ step: 3, details: { ...createEmptyDraft('draft-a').details, fullName: 'Jane Smith', email: 'jane@example.com', phone: '+1 555 1234567' }, background, template: 'developer' }));

    const { draft, restored } = loadOnboardingDraft('draft-a');
    expect(restored).toBe(true);
    expect(draft.details.fullName).toBe('Jane Smith');
    expect(draft.step).toBe(3);
    expect(draft.template).toBe('developer');
    expect(draft.background.education).toHaveLength(1);
    expect(draft.background.education[0].school).toBe('State University');
    expect(draft.background.education[0].description).toBe('Honors');
    expect(draft.background.skills).toEqual(['TypeScript']);
  });

  it('never adopts a draft cached under a different id', () => {
    saveOnboardingDraft(draftWith({ details: { ...createEmptyDraft('draft-a').details, fullName: 'Jane' } }));
    const { draft, restored } = loadOnboardingDraft('draft-b');
    expect(restored).toBe(false);
    expect(draft.details.fullName).toBe('');
    expect(draft.background.education).toEqual([]);
  });

  it('treats malformed, foreign-version and stale payloads as fresh', () => {
    localStorage.setItem(DRAFT_KEY, 'not-json');
    expect(loadOnboardingDraft('draft-a').restored).toBe(false);

    localStorage.setItem(DRAFT_KEY, JSON.stringify({ version: 99, activeDraftId: 'draft-a', savedAt: Date.now() }));
    expect(loadOnboardingDraft('draft-a').restored).toBe(false);

    const stale = draftWith({ details: { ...createEmptyDraft('draft-a').details, fullName: 'Old' } });
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...stale, savedAt: Date.now() - 1000 * 60 * 60 * 24 * 31 }));
    expect(loadOnboardingDraft('draft-a').restored).toBe(false);
  });

  it('repairs corrupted row arrays instead of throwing', () => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        version: 1,
        savedAt: Date.now(),
        activeDraftId: 'draft-a',
        step: 2,
        details: { fullName: 5, email: 'jane@example.com' },
        background: { education: [{ school: 'TU' }, 'garbage', 42], skills: ['a', 7, 'b'] },
        template: 'not-a-template',
      }),
    );
    const { draft, restored } = loadOnboardingDraft('draft-a');
    expect(restored).toBe(true);
    expect(draft.details.fullName).toBe('');
    expect(draft.details.email).toBe('jane@example.com');
    expect(draft.background.education).toHaveLength(1);
    expect(draft.background.education[0].school).toBe('TU');
    expect(draft.background.education[0].id).toBeTruthy();
    expect(draft.background.skills).toEqual(['a', 'b']);
    expect(draft.template).toBe('modern');
  });

  it('never throws when storage is unavailable', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    expect(() => loadOnboardingDraft('draft-a')).not.toThrow();
    expect(loadOnboardingDraft('draft-a').restored).toBe(false);
    spy.mockRestore();
  });
});

describe('onboardingDraft: emptiness and cleanup', () => {
  beforeEach(() => clearOnboardingDraft());

  it('detects an untouched draft as empty', () => {
    expect(isOnboardingDraftEmpty(createEmptyDraft('draft-a'))).toBe(true);
  });

  it('detects typed education (even without an institution yet) as content', () => {
    const draft = draftWith({
      background: {
        ...createEmptyDraft('draft-a').background,
        education: [{ ...createEmptyEducationDraft(), degree: 'B.S.' }],
      },
    });
    expect(isOnboardingDraftEmpty(draft)).toBe(false);
  });

  it('syncOnboardingDraft saves content and clears empty drafts', () => {
    syncOnboardingDraft(draftWith({ details: { ...createEmptyDraft('draft-a').details, fullName: 'Jane' } }));
    expect(localStorage.getItem(DRAFT_KEY)).not.toBeNull();

    syncOnboardingDraft(createEmptyDraft('draft-a'));
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it('clearOnboardingDraft removes the cache', () => {
    saveOnboardingDraft(createEmptyDraft('draft-a'));
    clearOnboardingDraft();
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });
});
