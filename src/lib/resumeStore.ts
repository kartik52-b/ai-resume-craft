import { type ResumeData, type TemplateType, createEmptyResume } from '@/types/resume';
import { type ResumeStore, ensureActiveResume } from '@/lib/storage';
import { generateId } from '@/lib/id';

/**
 * Pure store operations for multi-resume management.
 * All functions are pure: they take and return ResumeStore values and never
 * touch storage or React. Storage is handled by ResumeProvider, which
 * persists the whole store after each mutation.
 *
 * Nothing here invents resume content. A new resume always starts blank; the
 * only way a resume gets personal content is through the onboarding flow or
 * the user's own edits.
 */

export interface ResumeSummary {
  id: string;
  title: string;
  template: TemplateType;
  /** ISO timestamp of the last modification. */
  updated: string;
}

/** A brand-new store: no resumes until the user creates one. */
export function createStore(): ResumeStore {
  return { resumes: [], activeId: null };
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

/** Inserts a prepared resume (already populated with the user's own data) and makes it active. */
export function addResume(store: ResumeStore, resume: ResumeData): { store: ResumeStore; id: string } {
  const prepared: ResumeData = { ...resume, updatedAt: resume.updatedAt ?? new Date().toISOString() };
  return {
    store: { resumes: [...store.resumes, prepared], activeId: prepared.id },
    id: prepared.id,
  };
}

/** Creates a blank resume, makes it active, and returns the new store + its id. */
export function createResume(store: ResumeStore): { store: ResumeStore; id: string } {
  return addResume(store, createEmptyResume());
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
