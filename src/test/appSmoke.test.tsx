import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '@/App';
import { clearStoredResume, STORAGE_KEY } from '@/lib/storage';
import { clearOnboardingDraft } from '@/lib/onboardingDraft';

/**
 * Integration smoke test: mounts the real router + providers and walks the
 * new-user path. Catches wiring mistakes (routes, lazy pages, context shape)
 * that unit tests of individual modules cannot.
 */
describe('app smoke: fresh visitor', () => {
  beforeEach(() => {
    clearStoredResume();
    clearOnboardingDraft();
    window.history.pushState({}, '', '/');
  });

  it('renders the landing hero with the requested copy and CTAs', async () => {
    render(<App />);

    // The headline is set in three lines with the last word accented, so it is
    // matched by accessible name (which spans the inner spans) rather than by a
    // single text node.
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /create a professional resume without the busywork/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Create My Resume/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /Explore Templates/i }).length).toBeGreaterThan(0);
    // Design previews are explicitly labelled as sample content.
    expect(screen.getByText(/Design previews use sample content/i)).toBeInTheDocument();
  });

  it('walks details → design → editor with only the user data', async () => {
    render(<App />);

    fireEvent.click((await screen.findAllByRole('button', { name: /Create My Resume/i }))[0]);

    // Step 1 — personal details
    expect(await screen.findByText('Tell us about yourself')).toBeInTheDocument();
    // The progress indicator shows where the user is.
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Choose Design')).toBeInTheDocument();
    expect(screen.getByText('Build Resume')).toBeInTheDocument();

    // Validation blocks progress until the required fields are filled.
    fireEvent.click(screen.getByRole('button', { name: /^Continue/ }));
    expect(screen.getByText('Tell us about yourself')).toBeInTheDocument();
    expect(await screen.findByText(/Enter your full name/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: 'Jane Smith' } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: '+1 555 123 4567' } });
    fireEvent.click(screen.getByRole('button', { name: /^Continue/ }));

    // Step 2 — professional summary (optional)
    expect(await screen.findByRole('heading', { name: 'Your professional summary' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Continue/ }));

    // Step 3 — background: education is skipped entirely (optional section)
    expect(await screen.findByRole('heading', { name: 'Round out your background' })).toBeInTheDocument();
    expect(screen.queryByText(/No education added yet/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Next: Choose Design/ }));

    // Step 4 — design gallery
    expect(await screen.findByText('Choose a design for your resume')).toBeInTheDocument();
    const useButtons = screen.getAllByRole('button', { name: /Use This Template/i });
    expect(useButtons.length).toBeGreaterThan(1);

    const pick = useButtons[1];
    fireEvent.click(pick);

    // Step 3 — build, then the editor
    expect(await screen.findByText('Building your resume…')).toBeInTheDocument();

    // The editor opens with the user's own details (never the sample persona).
    expect(await screen.findByDisplayValue('Jane Smith', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Alex Morgan')).toBeNull();

    // The resume was persisted for a reload.
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.store.resumes).toHaveLength(1);
    expect(stored.store.resumes[0].personal.fullName).toBe('Jane Smith');
    expect(stored.store.resumes[0].experience).toEqual([]);
    // Skipping education leaves it empty — no fabricated entries.
    expect(stored.store.resumes[0].education).toEqual([]);
  });

  it('blocks Next when an added education entry lacks its institution, then continues', async () => {
    render(<App />);

    fireEvent.click((await screen.findAllByRole('button', { name: /Create My Resume/i }))[0]);
    expect(await screen.findByText('Tell us about yourself')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: 'Jane Smith' } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: '+1 555 123 4567' } });
    fireEvent.click(screen.getByRole('button', { name: /^Continue/ }));

    expect(await screen.findByRole('heading', { name: 'Your professional summary' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Continue/ }));

    // Step 3 — add TWO education entries; leave both institutions empty.
    expect(await screen.findByRole('heading', { name: 'Round out your background' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Education/ }));
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Education/ }));
    expect(screen.getByText('Education 1')).toBeInTheDocument();
    expect(screen.getByText('Education 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Next: Choose Design/ }));
    const institutionErrors = await screen.findAllByText('Please enter your institution.');
    expect(institutionErrors.length).toBe(2);
    // Still on the background step — navigation was prevented.
    expect(screen.getByRole('heading', { name: 'Round out your background' })).toBeInTheDocument();

    // Fill only the first institution — the second still blocks.
    fireEvent.change(screen.getAllByLabelText(/^Institution/)[0], { target: { value: 'State University' } });
    fireEvent.click(screen.getByRole('button', { name: /Next: Choose Design/ }));
    expect(screen.getByRole('heading', { name: 'Round out your background' })).toBeInTheDocument();
    expect(screen.getByText('Please enter your institution.')).toBeInTheDocument();

    // Fill the second and continue.
    fireEvent.change(screen.getAllByLabelText(/^Institution/)[1], { target: { value: 'Tech Institute' } });
    fireEvent.click(screen.getByRole('button', { name: /Next: Choose Design/ }));
    expect(await screen.findByText('Choose a design for your resume')).toBeInTheDocument();
  });

  it('restores the cached draft after unmount/remount (refresh simulation)', async () => {
    const { unmount } = render(<App />);

    fireEvent.click((await screen.findAllByRole('button', { name: /Create My Resume/i }))[0]);
    expect(await screen.findByText('Tell us about yourself')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: 'Cache Keeper' } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'cache@example.com' } });
    fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: '+1 555 0001111' } });
    fireEvent.click(screen.getByRole('button', { name: /^Continue/ }));

    // Step 2 — add a typed summary and move to the background step.
    expect(await screen.findByRole('heading', { name: 'Your professional summary' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Professional Summary/), { target: { value: 'Kept across refreshes.' } });
    fireEvent.click(screen.getByRole('button', { name: /^Continue/ }));

    // Add an education entry with a partial fill (no institution yet).
    expect(await screen.findByRole('heading', { name: 'Round out your background' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Education/ }));
    fireEvent.change(screen.getByLabelText(/Degree/), { target: { value: 'B.S.' } });

    // Everything the user typed must now be cached.
    const cached = JSON.parse(localStorage.getItem('ai-resume-craft:onboarding-draft')!);
    expect(cached.details.fullName).toBe('Cache Keeper');
    expect(cached.background.education).toHaveLength(1);
    expect(cached.background.education[0].degree).toBe('B.S.');

    // "Refresh": unmount everything and mount a brand-new app tree. The URL
    // is still /create, so the flow resumes straight on the background step
    // with every value intact — including the education entry in progress.
    unmount();
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Round out your background' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('B.S.')).toBeInTheDocument();

    // Completing the flow carries the education into the resume.
    fireEvent.change(screen.getByLabelText(/^Institution/), { target: { value: 'Cache University' } });
    fireEvent.click(screen.getByRole('button', { name: /Next: Choose Design/ }));
    expect(await screen.findByText('Choose a design for your resume')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: /Use This Template/i })[1]);
    expect(await screen.findByText('Building your resume…')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('Cache Keeper', {}, { timeout: 5000 })).toBeInTheDocument();

    // The context autosave is debounced (~800ms), so wait for the resume to
    // land in the store before asserting on it.
    await waitFor(
      () => {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
        expect(stored?.store?.resumes?.[0]?.education).toHaveLength(1);
      },
      { timeout: 3000 },
    );
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.store.resumes[0].education[0].school).toBe('Cache University');
    expect(stored.store.resumes[0].education[0].degree).toBe('B.S.');

    // The transient draft is gone once the resume owns the data.
    expect(localStorage.getItem('ai-resume-craft:onboarding-draft')).toBeNull();
  });
});

describe('app smoke: every route renders for a visitor without a resume', () => {
  const ROUTES: { path: string; marker: RegExp }[] = [
    { path: '/', marker: /Beautiful templates. Smart suggestions/i },
    { path: '/create', marker: /Tell us about yourself/i },
    { path: '/resumes', marker: /Welcome to AI Resume Craft/i },
    { path: '/templates', marker: /Choose your template/i },
    { path: '/settings', marker: /Account/i },
    { path: '/nonexistent', marker: /Page not found/i },
  ];

  it.each(ROUTES)('renders $path', async ({ path, marker }) => {
    clearStoredResume();
    clearOnboardingDraft();
    window.history.pushState({}, '', path);
    const { unmount } = render(<App />);
    expect(await screen.findByText(marker)).toBeInTheDocument();
    unmount();
  });

  it('sends a visitor with no resume from /editor into the create flow', async () => {
    clearStoredResume();
    clearOnboardingDraft();
    window.history.pushState({}, '', '/editor');
    render(<App />);
    expect(await screen.findByText('Tell us about yourself')).toBeInTheDocument();
  });
});
