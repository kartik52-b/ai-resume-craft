import { type ResumeData, type TemplateType, createStarterResume } from '@/types/resume';
import { type ResumeStore, ensureActiveResume } from '@/lib/storage';
import { generateId } from '@/lib/id';

/**
 * Pure store operations for multi-resume management.
 * All functions are pure: they take and return ResumeStore values and never
 * touch storage or React. Storage is handled by ResumeProvider, which
 * persists the whole store after each mutation.
 */

export interface ResumeSummary {
  id: string;
  title: string;
  template: TemplateType;
  /** ISO timestamp of the last modification. */
  updated: string;
}

/** Creates a store with one fresh starter resume (pre-filled with default details). */
export function createStore(): ResumeStore {
  const resume = createStarterResume();
  return { resumes: [resume], activeId: resume.id };
}

export function listResumes(store: ResumeStore): ResumeSummary[] {
  return store.resumes.map((r) => ({
    id: r.id,
    title: r.title,
    template: r.template,
    updated: r.updatedAt ?? '',
  }));
}

export function getActive(store: ResumeStore): ResumeData | null {
  return store.resumes.find((r) => r.id === store.activeId) ?? store.resumes[0] ?? null;
}

/** Creates a new resume (pre-filled with default starter details), makes it active, and returns the new store + its id. */
export function createResume(store: ResumeStore): { store: ResumeStore; id: string } {
  const resume = createStarterResume();
  return {
    store: { resumes: [...store.resumes, resume], activeId: resume.id },
    id: resume.id,
  };
}

export function renameResume(store: ResumeStore, id: string, title: string): ResumeStore {
  const trimmed = title.trim();
  if (!trimmed) return store;
  return {
    ...store,
    resumes: store.resumes.map((r) => (r.id === id ? { ...r, title: trimmed } : r)),
  };
}

/** Duplicates a resume as "<title> (copy)" with a fresh id; the copy becomes active. */
export function duplicateResume(store: ResumeStore, id: string): { store: ResumeStore; id: string } | null {
  const source = store.resumes.find((r) => r.id === id);
  if (!source) return null;
  const copy: ResumeData = {
    ...JSON.parse(JSON.stringify(source)) as ResumeData,
    id: generateId(),
    title: `${source.title} (copy)`,
  };
  return { store: { resumes: [...store.resumes, copy], activeId: copy.id }, id: copy.id };
}

/** Deletes a resume. Active pointer is repaired via ensureActiveResume. The last resume is never removed. */
export function deleteResume(store: ResumeStore, id: string): ResumeStore {
  if (store.resumes.length <= 1) return store;
  const resumes = store.resumes.filter((r) => r.id !== id);
  const nextActive = store.activeId === id ? null : store.activeId;
  return ensureActiveResume({ resumes, activeId: nextActive });
}

export function setActiveResume(store: ResumeStore, id: string): ResumeStore {
  if (!store.resumes.some((r) => r.id === id)) return store;
  return { ...store, activeId: id };
}

/** Applies an updater to the active resume and bumps its updatedAt timestamp. */
export function updateActiveResume(
  store: ResumeStore,
  updater: (resume: ResumeData) => ResumeData,
): ResumeStore {
  const active = getActive(store);
  if (!active) return store;
  return {
    ...store,
    resumes: store.resumes.map((r) =>
      r.id === active.id ? { ...updater(r), updatedAt: new Date().toISOString() } : r,
    ),
  };
}
