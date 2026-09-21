import { type ResumeData } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden, sectionMeta } from '@/lib/sections';

/**
 * Converts a resume into structured plain text. Shared by the AI summary
 * generator, the ATS analyzer, job matching and the PDF engine so every
 * consumer sees the same section order and visibility rules.
 */
export interface ResumeTextSection {
  id: string;
  title: string;
  lines: string[];
}

export function resumeToSections(resume: ResumeData): ResumeTextSection[] {
  const sections: ResumeTextSection[] = [];

  for (const id of resolveSectionOrder(resume)) {
    if (isSectionHidden(resume, id)) continue;
    const title = sectionMeta(id).title;
    const lines: string[] = [];

    switch (id) {
      case 'personal': {
        const p = resume.personal;
        if (p.summary.trim()) lines.push(p.summary.trim());
        break;
      }
      case 'experience':
        for (const e of resume.experience) {
          const header = [e.position, e.company].filter(Boolean).join(' — ');
          if (header) lines.push(header);
          const dates = [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ');
          if (dates) lines.push(dates);
          for (const b of e.bullets) if (b.trim()) lines.push(b.trim());
        }
        break;
      case 'education':
        for (const e of resume.education) {
          const line = [e.school, [e.degree, e.field].filter(Boolean).join(', '), e.gpa ? `GPA: ${e.gpa}` : '']
            .filter(Boolean).join(' | ');
          if (line) lines.push(line);
          const dates = [e.startDate, e.endDate].filter(Boolean).join(' – ');
          if (dates) lines.push(dates);
        }
        break;
      case 'skills':
        if (resume.skills.length) lines.push(resume.skills.join(', '));
        break;
      case 'projects':
        for (const p of resume.projects) {
          if (p.name.trim()) lines.push(p.name.trim() + (p.technologies.trim() ? ` [${p.technologies.trim()}]` : ''));
          if (p.description.trim()) lines.push(p.description.trim());
        }
        break;
      case 'certifications':
        for (const c of resume.certifications) {
          const line = [c.name, c.issuer, c.date].filter(Boolean).join(' | ');
          if (line) lines.push(line);
        }
        break;
    }

    if (lines.length > 0) sections.push({ id, title, lines });
  }

  return sections;
}

/** Full plain-text rendering of the resume (without the name header). */
export function resumeToPlainText(resume: ResumeData): string {
  const header = resume.personal.fullName.trim();
  const contact = [resume.personal.email, resume.personal.phone, resume.personal.location]
    .filter(Boolean).join(' | ');
  const body = resumeToSections(resume)
    .map((s) => `${s.title.toUpperCase()}\n${s.lines.join('\n')}`)
    .join('\n\n');
  return [header, contact, body].filter(Boolean).join('\n\n');
}
