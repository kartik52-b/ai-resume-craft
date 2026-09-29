import { type ResumeData, type SectionId, DEFAULT_SECTION_ORDER } from '@/types/resume';

/**
 * Shared section metadata. The editor, templates, the PDF engine and the ATS
 * analyzer all derive from this single list so new sections only need to be
 * added once.
 */
export const SECTION_META: { id: SectionId; title: string; emptyHint: string }[] = [
  { id: 'personal', title: 'Personal Information', emptyHint: 'Add your name and contact details so recruiters can reach you.' },
  { id: 'experience', title: 'Experience', emptyHint: 'No roles added yet. Start with your most recent position.' },
  { id: 'education', title: 'Education', emptyHint: 'No education added yet. Add your most recent degree or program.' },
  { id: 'skills', title: 'Skills', emptyHint: 'No skills yet. Add 6–10 skills relevant to your target role.' },
  { id: 'projects', title: 'Projects', emptyHint: 'No projects yet. Add work that demonstrates your abilities.' },
  { id: 'certifications', title: 'Certifications', emptyHint: 'No certifications yet. Add licenses or certificates if you have them.' },
];

export function sectionMeta(id: SectionId) {
  return SECTION_META.find((s) => s.id === id)!;
}

/** Resolved section order: stored order + any new ids appended, dupes removed. */
export function resolveSectionOrder(resume: ResumeData): SectionId[] {
  const stored = resume.sectionOrder ?? [];
  const known = stored.filter((id) => DEFAULT_SECTION_ORDER.includes(id));
  const added = DEFAULT_SECTION_ORDER.filter((id) => !known.includes(id));
  return [...known, ...added];
}

export function isSectionHidden(resume: ResumeData, id: SectionId): boolean {
  return (resume.hiddenSections ?? []).includes(id);
}

export function toggleSectionHidden(resume: ResumeData, id: SectionId): ResumeData {
  const hidden = resume.hiddenSections ?? [];
  return {
    ...resume,
    hiddenSections: hidden.includes(id) ? hidden.filter((s) => s !== id) : [...hidden, id],
  };
}

export function reorderSections(resume: ResumeData, from: SectionId, to: SectionId): ResumeData {
  const order = resolveSectionOrder(resume);
  const fromIdx = order.indexOf(from);
  const toIdx = order.indexOf(to);
  if (fromIdx === -1 || toIdx === -1) return resume;
  const next = [...order];
  next.splice(toIdx, 0, ...next.splice(fromIdx, 1));
  return { ...resume, sectionOrder: next };
}

/** Moves a section one slot up (-1) or down (+1). Used by keyboard controls. */
export function nudgeSection(resume: ResumeData, id: SectionId, delta: -1 | 1): ResumeData {
  const order = resolveSectionOrder(resume);
  const fromIdx = order.indexOf(id);
  const toIdx = fromIdx + delta;
  if (toIdx < 0 || toIdx >= order.length) return resume;
  return reorderSections(resume, id, order[toIdx]);
}

/** Generic item mover for list reordering (experience, projects, ...). */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = [...list];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
}
