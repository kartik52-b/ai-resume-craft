import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { ResumeProvider, useResume } from '@/context/ResumeContext';
import { clearStoredResume } from '@/lib/storage';
import { createEmptyResume, createEmptyExperience, type ResumeData } from '@/types/resume';
import {
  resolveSectionOrder, isSectionHidden, toggleSectionHidden, reorderSections, nudgeSection, moveItem,
} from '@/lib/sections';
import { validateResume, sectionCompleteness } from '@/lib/resumeValidation';

describe('sections: order and visibility helpers', () => {
  it('resolves stored order and appends new sections', () => {
    const resume = createEmptyResume();
    resume.sectionOrder = ['education', 'personal', 'skills'];
    expect(resolveSectionOrder(resume)).toEqual([
      'education', 'personal', 'skills', 'experience', 'projects', 'certifications',
    ]);
  });

  it('reorders sections toward a drag target', () => {
    const resume = createEmptyResume();
    const next = reorderSections(resume, 'personal', 'skills');
    const order = resolveSectionOrder(next);
    expect(order.indexOf('personal')).toBeGreaterThan(order.indexOf('skills'));
    expect(order).toHaveLength(6);
  });

  it('nudges sections up and down with bounds respected', () => {
    const resume = createEmptyResume();
    const up = nudgeSection(resume, 'personal', -1);
    expect(resolveSectionOrder(up)[0]).toBe('personal'); // unchanged at top
    const down = nudgeSection(resume, 'personal', 1);
    expect(resolveSectionOrder(down)[0]).toBe('experience');
  });

  it('hides and re-shows sections without losing data', () => {
    let resume = createEmptyResume();
    resume.experience = [createEmptyExperience()];
    const before = resume.experience.length;

    resume = toggleSectionHidden(resume, 'experience');
    expect(isSectionHidden(resume, 'experience')).toBe(true);
    expect(resume.experience).toHaveLength(before); // data preserved

    resume = toggleSectionHidden(resume, 'experience');
    expect(isSectionHidden(resume, 'experience')).toBe(false);
  });

  it('moveItem moves list items and ignores out-of-range moves', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    expect(moveItem(['a'], 0, 5)).toEqual(['a']);
    expect(moveItem([], 0, 0)).toEqual([]);
  });
});

describe('validation', () => {
  const base = (): ResumeData => {
    const r = createEmptyResume();
    r.personal.fullName = 'Aarav Singh';
    r.personal.email = 'aarav@example.com';
    return r;
  };

  it('flags missing name and contact', () => {
    const issues = validateResume(createEmptyResume());
    expect(issues.some((i) => i.field === 'fullName' && i.severity === 'error')).toBe(true);
    expect(issues.some((i) => i.message.includes('contact method'))).toBe(true);
  });

  it('flags invalid email format as warning', () => {
    const r = base();
    r.personal.email = 'not-an-email';
    expect(validateResume(r).some((i) => i.message.includes('Email format'))).toBe(true);
  });

  it('flags short summary and bullets without numbers as suggestions', () => {
    const r = base();
    r.personal.summary = 'Too short';
    const exp = createEmptyExperience();
    exp.position = 'Dev';
    exp.company = 'Acme';
    exp.bullets = ['Did things'];
    r.experience = [exp];
    const issues = validateResume(r);
    expect(issues.some((i) => i.message.includes('Summary is short'))).toBe(true);
    expect(issues.some((i) => i.message.includes('measurable results'))).toBe(true);
  });

  it('completeness grows as sections fill', () => {
    const r = base();
    expect(sectionCompleteness(r, 'personal')).toBeLessThan(100);
    r.personal.phone = '+91 98765 43210';
    r.personal.location = 'X';
    r.personal.summary = 'x'.repeat(100);
    expect(sectionCompleteness(r, 'personal')).toBe(100);
  });
});

describe('undo/redo', () => {
  beforeEach(() => {
    clearStoredResume();
    vi.useFakeTimers();
    // A resume must exist for edits to apply (a brand-new user has none until
    // they finish the create flow).
    const seeded = createEmptyResume();
    localStorage.setItem(
      'ai-resume-craft:store',
      JSON.stringify({ version: 2, savedAt: new Date().toISOString(), store: { resumes: [seeded], activeId: seeded.id } }),
    );
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function UndoProbe() {
    const { resume, updatePersonal, undo, redo, canUndo, canRedo } = useResume();
    return (
      <div>
        <button onClick={() => updatePersonal('fullName', 'Second')}>edit</button>
        <button onClick={() => updatePersonal('fullName', 'Third')}>edit-2</button>
        <button onClick={undo} disabled={!canUndo}>undo</button>
        <button onClick={redo} disabled={!canRedo}>redo</button>
        <span data-testid="name">{resume.personal.fullName}</span>
      </div>
    );
  }

  it('undo restores the previous state and redo reapplies it', () => {
    render(<ResumeProvider><UndoProbe /></ResumeProvider>);
    // A stored resume with no sample details starts blank.
    expect(screen.getByTestId('name').textContent).toBe('');

    fireEvent.click(screen.getByText('edit'));
    fireEvent.click(screen.getByText('edit-2'));
    expect(screen.getByTestId('name').textContent).toBe('Third');

    act(() => { fireEvent.click(screen.getByText('undo')); });
    expect(screen.getByTestId('name').textContent).toBe('Second');

    act(() => { fireEvent.click(screen.getByText('undo')); });
    expect(screen.getByTestId('name').textContent).toBe('');

    act(() => { fireEvent.click(screen.getByText('redo')); });
    expect(screen.getByTestId('name').textContent).toBe('Second');

    // New edits clear the redo stack.
    fireEvent.click(screen.getByText('edit-2'));
    expect(screen.getByTestId('name').textContent).toBe('Third');
    act(() => { fireEvent.click(screen.getByText('redo')); });
    expect(screen.getByTestId('name').textContent).toBe('Third');
  });

  it('persists undone state after autosave', () => {
    render(<ResumeProvider><UndoProbe /></ResumeProvider>);
    fireEvent.click(screen.getByText('edit'));
    act(() => { vi.advanceTimersByTime(800); });

    act(() => { fireEvent.click(screen.getByText('undo')); });
    act(() => { vi.advanceTimersByTime(800); });

    const stored = JSON.parse(localStorage.getItem('ai-resume-craft:store')!);
    expect(stored.store.resumes[0].personal.fullName).toBe('');
  });
});
