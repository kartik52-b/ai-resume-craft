import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '@/App';
import { clearStoredResume, STORAGE_KEY } from '@/lib/storage';

/**
 * Integration smoke test: mounts the real router + providers and walks the
 * new-user path. Catches wiring mistakes (routes, lazy pages, context shape)
 * that unit tests of individual modules cannot.
 */
describe('app smoke: fresh visitor', () => {
  beforeEach(() => {
    clearStoredResume();
    window.history.pushState({}, '', '/');
  });

  it('renders the landing hero with the requested copy and CTAs', async () => {
    render(<App />);

    expect(await screen.findByText('Build a resume that gets you noticed.')).toBeInTheDocument();
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

    // Step 3 — background (optional)
    expect(await screen.findByRole('heading', { name: 'Round out your background' })).toBeInTheDocument();
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
  });
});

describe('app smoke: every route renders for a visitor without a resume', () => {
  const ROUTES: { path: string; marker: RegExp }[] = [
    { path: '/', marker: /Build a resume that gets you noticed/i },
    { path: '/create', marker: /Tell us about yourself/i },
    { path: '/resumes', marker: /Welcome to AI Resume Craft/i },
    { path: '/templates', marker: /Choose a resume design/i },
    { path: '/settings', marker: /Account/i },
    { path: '/nonexistent', marker: /Page not found/i },
  ];

  it.each(ROUTES)('renders $path', async ({ path, marker }) => {
    clearStoredResume();
    window.history.pushState({}, '', path);
    const { unmount } = render(<App />);
    expect(await screen.findByText(marker)).toBeInTheDocument();
    unmount();
  });

  it('sends a visitor with no resume from /editor into the create flow', async () => {
    clearStoredResume();
    window.history.pushState({}, '', '/editor');
    render(<App />);
    expect(await screen.findByText('Tell us about yourself')).toBeInTheDocument();
  });
});
