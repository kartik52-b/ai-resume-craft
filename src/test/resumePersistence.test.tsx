import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { ResumeProvider, useResume } from '@/context/ResumeContext';
import { STORAGE_KEY, loadStore, clearStoredResume } from '@/lib/storage';
import { createEmptyResume } from '@/types/resume';

function Probe() {
  const {
    resume, resumes, activeId, setResume, saveStatus, loadStatus,
    createResumeAction, renameResumeAction, duplicateResumeAction, deleteResumeAction, switchResume,
  } = useResume();
  return (
    <div>
      <button onClick={() => setResume({ ...resume, personal: { ...resume.personal, fullName: 'Ada Lovelace' } })}>
        edit
      </button>
      <button onClick={() => setResume({ ...resume, personal: { ...resume.personal, fullName: 'Alan Turing' } })}>
        edit-2
      </button>
      <button onClick={() => createResumeAction()}>create</button>
      <button onClick={() => renameResumeAction(activeId!, 'Renamed Resume')}>rename</button>
      <button onClick={() => duplicateResumeAction(activeId!)}>duplicate</button>
      <button onClick={() => deleteResumeAction(activeId!)}>delete</button>
      <button onClick={() => switchResume(resumes.find((r) => r.id !== activeId)?.id ?? activeId!)}>switch</button>
      <span data-testid="name">{resume.personal.fullName}</span>
      <span data-testid="count">{resumes.length}</span>
      <span data-testid="active">{activeId}</span>
      <span data-testid="status">{saveStatus}</span>
      <span data-testid="load">{loadStatus}</span>
    </div>
  );
}

const renderProvider = () => render(<ResumeProvider><Probe /></ResumeProvider>);

describe('ResumeProvider persistence (store-based)', () => {
  beforeEach(() => {
    clearStoredResume();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('hydrates restored data into state on mount', () => {
    const resume = createEmptyResume();
    resume.personal.fullName = 'Grace Hopper';
    saveEnvelope([resume], resume.id);

    renderProvider();
    expect(screen.getByTestId('name').textContent).toBe('Grace Hopper');
    expect(screen.getByTestId('status').textContent).toBe('saved');
  });

  it('seeds a fresh store with one resume and shows idle status', () => {
    renderProvider();
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('status').textContent).toBe('idle');
  });

  it('autosaves after the debounce window and flips status to saved', () => {
    renderProvider();

    fireEvent.click(screen.getByText('edit'));
    expect(screen.getByTestId('status').textContent).toBe('saving');

    act(() => { vi.advanceTimersByTime(800); });
    expect(screen.getByTestId('status').textContent).toBe('saved');
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.version).toBe(2);
    expect(stored.store.resumes[0].personal.fullName).toBe('Ada Lovelace');
  });

  it('coalesces rapid edits into one write of the latest state', () => {
    renderProvider();

    fireEvent.click(screen.getByText('edit'));
    act(() => { vi.advanceTimersByTime(300); });
    fireEvent.click(screen.getByText('edit-2'));
    act(() => { vi.advanceTimersByTime(300); });

    // Only ~300ms since the last edit: nothing written yet.
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    act(() => { vi.advanceTimersByTime(500); });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.store.resumes[0].personal.fullName).toBe('Alan Turing');
  });

  it('recovers safely when stored data is corrupted', () => {
    localStorage.setItem(STORAGE_KEY, 'garbage');
    renderProvider();

    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('status').textContent).toBe('idle');
    expect(screen.getByTestId('load').textContent).toBe('corrupted');

    // Editing afterwards replaces the corrupted payload with a valid envelope.
    fireEvent.click(screen.getByText('edit'));
    act(() => { vi.advanceTimersByTime(800); });
    expect(loadStore().status).toBe('restored');
  });

  it('creates, switches between, and isolates multiple resumes', () => {
    renderProvider();
    const firstId = screen.getByTestId('active').textContent;

    fireEvent.click(screen.getByText('edit'));
    fireEvent.click(screen.getByText('create'));
    const secondId = screen.getByTestId('active').textContent;
    expect(screen.getByTestId('count').textContent).toBe('2');
    expect(secondId).not.toBe(firstId);

    // New resume starts with default starter details — data does not leak between resumes.
    expect(screen.getByTestId('name').textContent).toBe('Kartik Bhardwaj');

    fireEvent.click(screen.getByText('switch'));
    expect(screen.getByTestId('name').textContent).toBe('Ada Lovelace');
    expect(screen.getByTestId('active').textContent).toBe(firstId);

    act(() => { vi.advanceTimersByTime(800); });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.store.activeId).toBe(firstId);
  });

  it('renames, duplicates and deletes resumes with correct active handling', () => {
    renderProvider();
    const firstId = screen.getByTestId('active').textContent;

    fireEvent.click(screen.getByText('rename'));
    expect(screen.getByTestId('name') && screen.getByTestId('active').textContent).toBe(firstId);
    act(() => { vi.advanceTimersByTime(800); });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).store.resumes[0].title).toBe('Renamed Resume');

    fireEvent.click(screen.getByText('duplicate'));
    expect(screen.getByTestId('count').textContent).toBe('2');
    // Copy becomes active.
    expect(screen.getByTestId('active').textContent).not.toBe(firstId);

    // Deleting the active resume falls back to the remaining one.
    const copyId = screen.getByTestId('active').textContent;
    fireEvent.click(screen.getByText('delete'));
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('active').textContent).toBe(firstId);
    expect(copyId).not.toBe(firstId);
  });

  it('refuses to delete the last remaining resume', () => {
    renderProvider();
    expect(screen.getByTestId('count').textContent).toBe('1');
    fireEvent.click(screen.getByText('delete'));
    expect(screen.getByTestId('count').textContent).toBe('1');
  });
});

function saveEnvelope(resumes: ReturnType<typeof createEmptyResume>[], activeId: string) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: 2, savedAt: new Date().toISOString(), store: { resumes, activeId } }),
  );
}
