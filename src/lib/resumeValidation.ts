import { type ResumeData, type SectionId } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden } from '@/lib/sections';

export interface ValidationIssue {
  section: SectionId | 'general';
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Deterministic validation for the resume. Returns issues with actionable
 * messages. Used by the editor for inline hints and by the ATS analyzer.
 */
export function validateResume(resume: ResumeData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const p = resume.personal;

  if (!p.fullName.trim()) {
    issues.push({ section: 'personal', field: 'fullName', message: 'Full name is required.', severity: 'error' });
  }
  if (!p.email.trim() && !p.phone.trim()) {
    issues.push({
      section: 'personal',
      message: 'Add at least one contact method (email or phone).',
      severity: 'error',
    });
  }
  if (p.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim())) {
    issues.push({ section: 'personal', field: 'email', message: 'Email format looks invalid.', severity: 'warning' });
  }
  if (p.summary.trim() && p.summary.trim().length < 80) {
    issues.push({
      section: 'personal',
      field: 'summary',
      message: 'Summary is short — aim for 2–3 sentences (80+ characters).',
      severity: 'warning',
    });
  }
  if (p.summary.length > 600) {
    issues.push({
      section: 'personal',
      field: 'summary',
      message: 'Summary is very long — consider trimming below 600 characters.',
      severity: 'warning',
    });
  }

  resume.experience.forEach((exp, i) => {
    const label = exp.position || exp.company || `Experience entry ${i + 1}`;
    if (!exp.position.trim() || !exp.company.trim()) {
      issues.push({ section: 'experience', field: exp.id, message: `${label}: add a position and company.`, severity: 'error' });
    }
    if (!exp.startDate.trim()) {
      issues.push({ section: 'experience', field: exp.id, message: `${label}: add a start date.`, severity: 'warning' });
    }
    const filled = exp.bullets.filter((b) => b.trim());
    if (filled.length === 0) {
      issues.push({ section: 'experience', field: exp.id, message: `${label}: add at least one bullet point.`, severity: 'error' });
    } else if (filled.every((b) => !/\d/.test(b))) {
      issues.push({
        section: 'experience',
        field: exp.id,
        message: `${label}: consider adding measurable results (numbers, %, sizes) to your bullets.`,
        severity: 'warning',
      });
    }
    if (filled.some((b) => b.length > 240)) {
      issues.push({ section: 'experience', field: exp.id, message: `${label}: one or more bullets are very long.`, severity: 'warning' });
    }
  });

  resume.education.forEach((edu, i) => {
    if (!edu.school.trim() || !(edu.degree.trim() || edu.field.trim())) {
      issues.push({
        section: 'education',
        field: edu.id,
        message: `Education entry ${i + 1}: add a school and a degree or field.`,
        severity: 'error',
      });
    }
  });

  if (resume.skills.length === 0) {
    issues.push({ section: 'skills', message: 'Add at least a few relevant skills.', severity: 'warning' });
  } else if (resume.skills.length > 20) {
    issues.push({ section: 'skills', message: 'More than 20 skills may dilute your key strengths.', severity: 'warning' });
  }

  resume.projects.forEach((proj, i) => {
    if (!proj.name.trim()) {
      issues.push({ section: 'projects', field: proj.id, message: `Project ${i + 1}: add a name.`, severity: 'error' });
    }
  });

  resume.certifications.forEach((cert, i) => {
    if (!cert.name.trim()) {
      issues.push({ section: 'certifications', field: cert.id, message: `Certification ${i + 1}: add a name.`, severity: 'error' });
    }
  });

  if (!resume.experience.length && !resume.projects.length) {
    issues.push({
      section: 'general',
      message: 'Add experience or projects — resumes without either rarely pass screening.',
      severity: 'warning',
    });
  }

  return issues;
}

/** Simple completeness signal per section (0–100). */
export function sectionCompleteness(resume: ResumeData, section: SectionId): number {
  switch (section) {
    case 'personal': {
      const p = resume.personal;
      const fields = [p.fullName, p.email, p.phone, p.location, p.summary];
      const filled = fields.filter((f) => f.trim()).length;
      return Math.round((filled / fields.length) * 100);
    }
    case 'experience':
      return resume.experience.length === 0 ? 0 : Math.min(100, resume.experience.filter((e) => e.position.trim() && e.bullets.some((b) => b.trim())).length * 50);
    case 'education':
      return resume.education.length === 0 ? 0 : Math.min(100, resume.education.filter((e) => e.school.trim()).length * 50);
    case 'skills':
      return Math.min(100, resume.skills.length * 20);
    case 'projects':
      return resume.projects.length === 0 ? 0 : Math.min(100, resume.projects.filter((p) => p.name.trim() && p.description.trim()).length * 50);
    case 'certifications':
      return resume.certifications.length === 0 ? 0 : Math.min(100, resume.certifications.filter((c) => c.name.trim()).length * 50);
  }
}

/** Sections the user still shows but that are empty. Drives editor empty states. */
export function emptyVisibleSections(resume: ResumeData): SectionId[] {
  return resolveSectionOrder(resume)
    .filter((id) => !isSectionHidden(resume, id))
    .filter((id) => sectionCompleteness(resume, id) === 0);
}
