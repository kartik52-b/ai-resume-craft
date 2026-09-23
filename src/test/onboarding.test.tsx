import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ResumeProvider, useResume } from '@/context/ResumeContext';
import { clearStoredResume, STORAGE_KEY } from '@/lib/storage';
import {
  EMPTY_PERSONAL_DETAILS,
  buildResumeFromDetails,
  isValidPersonalDetails,
  normalizeDetails,
  validatePersonalDetails,
  type PersonalDetails,
} from '@/lib/onboarding';
import { DESIGN_COLLECTIONS, TEMPLATE_REGISTRY, getCollectionTemplates } from '@/lib/templateRegistry';
import { getSampleResume } from '@/lib/sampleResume';
import { createEmptyResume } from '@/types/resume';

const VALID: PersonalDetails = {
  fullName: 'Jane Smith',
  email: 'jane@example.com',
  phone: '+1 555 123 4567',
  location: 'Austin, TX',
  headline: 'Senior Software Engineer',
  linkedin: '',
  website: '',
  summary: '',
};

describe('onboarding: personal details validation', () => {
  it('requires name, email and phone', () => {
    const errors = validatePersonalDetails(EMPTY_PERSONAL_DETAILS);
    expect(errors.fullName).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.phone).toBeTruthy();
  });

  it('accepts valid details and ignores optional fields', () => {
    expect(validatePersonalDetails(VALID)).toEqual({});
    expect(isValidPersonalDetails({ ...VALID, location: '', headline: '' })).toBe(true);
  });

  it('rejects a malformed email', () => {
    expect(validatePersonalDetails({ ...VALID, email: 'not-an-email' }).email).toBeTruthy();
  });

  it('rejects a phone number with too few digits', () => {
    expect(validatePersonalDetails({ ...VALID, phone: '123' }).phone).toBeTruthy();
    expect(validatePersonalDetails({ ...VALID, phone: '+1 (555) 123-4567' }).phone).toBeUndefined();
  });

  it('treats whitespace-only input as empty', () => {
    expect(validatePersonalDetails({ ...VALID, fullName: '   ' }).fullName).toBeTruthy();
  });

  it('normalizes surrounding whitespace', () => {
    expect(normalizeDetails({ ...VALID, fullName: '  Jane Smith  ' }).fullName).toBe('Jane Smith');
  });
});

describe('onboarding: resume construction', () => {
  it('builds the resume from user data and the chosen design', () => {
    const resume = buildResumeFromDetails(VALID, 'developer');

    expect(resume.template).toBe('developer');
    expect(resume.personal.fullName).toBe('Jane Smith');
    expect(resume.personal.email).toBe('jane@example.com');
    expect(resume.personal.phone).toBe('+1 555 123 4567');
    expect(resume.personal.location).toBe('Austin, TX');
    expect(resume.personal.headline).toBe('Senior Software Engineer');
  });

  it('never carries sample/demo content into the new resume', () => {
    const sample = getSampleResume();
    const resume = buildResumeFromDetails(VALID, 'modern');

    expect(resume.experience).toEqual([]);
    expect(resume.education).toEqual([]);
    expect(resume.skills).toEqual([]);
    expect(resume.projects).toEqual([]);
    expect(resume.certifications).toEqual([]);
    expect(resume.personal.summary).toBe('');

    const serialized = JSON.stringify(resume);
    expect(serialized).not.toContain(sample.personal.fullName);
    expect(serialized).not.toContain(sample.personal.email);
    expect(serialized).not.toContain('Northwind Labs');
  });

  it('leaves optional fields empty instead of inventing values', () => {
    const resume = buildResumeFromDetails(
      { ...EMPTY_PERSONAL_DETAILS, fullName: 'Sam Lee', email: 'sam@example.com', phone: '5551234567' },
      'minimal',
    );
    expect(resume.personal.location).toBe('');
    expect(resume.personal.headline).toBe('');
    expect(resume.personal.linkedin).toBe('');
    expect(resume.personal.github).toBe('');
  });

  it('derives the resume title from the headline, falling back to a generic name', () => {
    expect(buildResumeFromDetails(VALID, 'modern').title).toBe('Senior Software Engineer Resume');
    expect(buildResumeFromDetails({ ...VALID, headline: '' }, 'modern').title).toBe('My Resume');
  });

  it('maps the extended personal fields (linkedin, website, summary) from user input only', () => {
    const resume = buildResumeFromDetails(
      { ...VALID, linkedin: 'in/jane', website: 'https://jane.dev', summary: 'Builder of things.' },
      'modern',
    );
    expect(resume.personal.linkedin).toBe('in/jane');
    expect(resume.personal.website).toBe('https://jane.dev');
    expect(resume.personal.summary).toBe('Builder of things.');

    const blank = buildResumeFromDetails(VALID, 'modern');
    expect(blank.personal.linkedin).toBe('');
    expect(blank.personal.website).toBe('');
    expect(blank.personal.summary).toBe('');
  });

  it('includes background rows the user filled and drops rows left empty', () => {
    const resume = buildResumeFromDetails(VALID, 'modern', {
      education: [
        { school: 'State University', degree: 'B.S.', field: 'Computer Science', startDate: '09 / 2018', endDate: '06 / 2022' },
        { school: '', degree: '', field: '', startDate: '', endDate: '' },
      ],
      experience: [{ company: 'Acme', position: 'Engineer', startDate: '2022', endDate: 'Present', description: 'Shipped features.' }],
      skills: ['TypeScript', 'TypeScript', ' React '],
      projects: [{ name: '', description: '', technologies: '', link: '' }],
      certifications: [{ name: 'AWS Certified', issuer: 'Amazon', date: '2024', link: '' }],
    });

    expect(resume.education).toHaveLength(1);
    expect(resume.education[0].school).toBe('State University');
    expect(resume.experience).toHaveLength(1);
    expect(resume.experience[0].bullets).toEqual(['Shipped features.']);
    expect(resume.skills).toEqual(['TypeScript', 'React']);
    expect(resume.projects).toEqual([]);
    expect(resume.certifications).toHaveLength(1);
  });

  it('produces renderable empty-section data (no section crashes on blanks)', () => {
    const resume = buildResumeFromDetails(VALID, 'ats-classic');
    expect(resume.sectionOrder).toEqual(createEmptyResume().sectionOrder);
    expect(resume.hiddenSections).toEqual([]);
  });
});

describe('onboarding: design collections', () => {
  it('only references templates that exist in the registry', () => {
    for (const collection of DESIGN_COLLECTIONS) {
      expect(getCollectionTemplates(collection).length).toBeGreaterThan(0);
      for (const t of getCollectionTemplates(collection)) {
        expect(TEMPLATE_REGISTRY.some((real) => real.id === t.id)).toBe(true);
      }
    }
  });

  it('skips unknown ids rather than silently substituting another design', () => {
    const resolved = getCollectionTemplates({
      id: 'test',
      label: 'Test',
      blurb: '',
      templates: ['not-a-template' as never, 'legal'],
    });
    expect(resolved.map((t) => t.id)).toEqual(['legal']);
  });

  it('offers every registry template through the All collection', () => {
    const all = DESIGN_COLLECTIONS.find((c) => c.id === 'all')!;
    expect(getCollectionTemplates(all)).toHaveLength(TEMPLATE_REGISTRY.length);
  });

  it('groups designs across the careers requested by the product brief', () => {
    const ids = DESIGN_COLLECTIONS.map((c) => c.id);
    for (const expected of ['professional', 'modern', 'minimal', 'creative', 'engineering', 'finance', 'academic', 'designer', 'marketing', 'healthcare', 'legal']) {
      expect(ids).toContain(expected);
    }
  });
});

describe('onboarding: provider integration', () => {
  function Probe() {
    const { hasResume, resumes, resume } = useResume();
    return (
      <div>
        <span data-testid="has">{String(hasResume)}</span>
        <span data-testid="count">{resumes.length}</span>
        <span data-testid="name">{resume.personal.fullName}</span>
        <span data-testid="template">{resume.template}</span>
      </div>
    );
  }

  beforeEach(() => {
    clearStoredResume();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('gives a brand-new user no resume at all', () => {
    render(<ResumeProvider><Probe /></ResumeProvider>);
    expect(screen.getByTestId('has').textContent).toBe('false');
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('name').textContent).toBe('');
  });

  it('persists exactly the user data collected during onboarding', () => {
    function CreateProbe() {
      const { createResumeFromDetails } = useResume();
      return <button onClick={() => createResumeFromDetails(VALID, 'finance')}>create</button>;
    }
    render(
      <ResumeProvider>
        <CreateProbe />
        <Probe />
      </ResumeProvider>,
    );

    act(() => { screen.getByText('create').click(); });
    expect(screen.getByTestId('has').textContent).toBe('true');
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('name').textContent).toBe('Jane Smith');
    expect(screen.getByTestId('template').textContent).toBe('finance');

    act(() => { vi.advanceTimersByTime(800); });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.store.resumes).toHaveLength(1);
    expect(stored.store.resumes[0].personal.headline).toBe('Senior Software Engineer');
    expect(JSON.stringify(stored)).not.toContain('Alex Morgan');
  });
});
