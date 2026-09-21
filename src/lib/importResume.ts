import { type ResumeData, type PersonalInfo, createEmptyResume } from '@/types/resume';
import { generateId } from '@/lib/id';

/**
 * Resume import: TXT (plain text) and DOCX (Word) -> parsed sections.
 *
 * Philosophy:
 *  - Never writes directly to a resume. The UI shows the parsed draft for
 *    review before the user confirms population (see ImportDialog usage).
 *  - Unrecognized content is preserved in `unparsedLines` instead of dropped.
 *  - Malformed input degrades to a mostly-empty draft, never an exception.
 *
 * PDF import is NOT supported (no reliable text extraction in-browser without
 * heavy OCR deps); the parser rejects .pdf with a clear message rather than
 * pretending to parse it.
 */

export interface ParsedImport {
  draft: ResumeData;
  /** Lines recognized but not confidently mapped, shown for review. */
  unparsedLines: string[];
  warnings: string[];
}

export interface ImportError {
  code: 'empty' | 'too_large' | 'unsupported_type' | 'parse_failed';
  message: string;
}

const MAX_IMPORT_CHARS = 200_000;
const ACCEPT_EXTENSIONS = ['.txt', '.text', '.md', '.docx'] as const;

export function isSupportedImportFile(name: string): boolean {
  const lower = name.toLowerCase();
  return ACCEPT_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function importErrorMessage(code: ImportError['code']): string {
  switch (code) {
    case 'empty': return 'That file appears to be empty.';
    case 'too_large': return 'File is too large to import (2 MB limit).';
    case 'unsupported_type': return 'Unsupported file type. Please use .txt, .md or .docx (PDF import is not supported).';
    case 'parse_failed': return 'Could not read the file contents.';
  }
}

// --- Section headers we recognize (rendered from templates / common conventions) ---
const SECTION_HEADER_PATTERNS: { id: keyof Omit<ResumeData, 'personal' | 'template' | 'id' | 'title' | 'updatedAt' | 'sectionOrder' | 'hiddenSections'>; regex: RegExp }[] = [
  { id: 'experience', regex: /^(work\s+)?(professional\s+)?(experience|employment|work history)\b/i },
  { id: 'education', regex: /^(education|academic(s)?( background)?|qualifications)\b/i },
  { id: 'skills', regex: /^(technical\s+)?(skills|core competencies|technologies|competencies)\b/i },
  { id: 'projects', regex: /^(projects|selected projects|personal projects|portfolio)\b/i },
  { id: 'certifications', regex: /^(certifications?|licenses?|courses|credentials)\b/i },
];

const SUMMARY_HEADER = /^(summary|profile|objective|professional summary|about me|about)\b/i;

const DATE_RANGE = /(\b(19|20)\d{2}\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(19|20)\d{2}\b)/i;

export function parseImportedText(raw: string, template: ResumeData['template'] = 'modern'): ParsedImport {
  const draft = createEmptyResume();
  draft.template = template;
  const unparsedLines: string[] = [];
  const warnings: string[] = [];

  // Normalize: strip bullets markers and collapse whitespace, keep line structure.
  const text = raw.replace(/\r\n?/g, '\n').replace(/\u00a0/g, ' ');
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  if (lines.length === 0) {
    warnings.push('No readable text found in the file.');
    return { draft, unparsedLines, warnings };
  }

  // Split into (header, bodyLines) chunks.
  let currentSection: string | null = null;
  let summaryBuffer: string[] = [];
  const buckets: Record<string, string[]> = { experience: [], education: [], skills: [], projects: [], certifications: [] };
  let headerCount = 0;

  for (const line of lines) {
    const isHeaderLine = line.length < 60;
    let matched = false;

    for (const { id, regex } of SECTION_HEADER_PATTERNS) {
      if (isHeaderLine && regex.test(line)) {
        currentSection = id;
        headerCount += 1;
        matched = true;
        break;
      }
    }
    if (!matched && isHeaderLine && SUMMARY_HEADER.test(line)) {
      currentSection = 'summary';
      headerCount += 1;
      matched = true;
    }
    if (matched) continue;

    if (currentSection === 'summary') summaryBuffer.push(line);
    else if (currentSection && currentSection in buckets) buckets[currentSection].push(line);
    else unparsedLines.push(line);
  }

  // --- Personal header: everything before the first recognized section ---
  const preamble = headerCount > 0 ? lines.slice(0, lines.findIndex((l) => isRecognizedHeader(l))) : lines;
  const personal = extractPersonal(preamble, lines[0] ?? '');
  draft.personal = personal;
  if (summaryBuffer.length > 0) {
    draft.personal.summary = summaryBuffer.join(' ').slice(0, 800);
  } else if (personal.summary && personal.summary !== preamble.join(' ')) {
    // extractPersonal may have captured a summary-like preamble tail.
    draft.personal.summary = personal.summary;
  }

  // --- Skills: split on common separators ---
  draft.skills = buckets.skills
    .join(' ')
    .split(/[,;•|\u2022]|\s{2,}|\u00b7/)
    .map((s) => s.replace(/^[-*\u2022]\s*/, '').trim())
    .filter((s) => s.length > 0 && s.length < 60)
    .slice(0, 40);

  // --- Experience entries ---
  draft.experience = parseExperience(buckets.experience);

  // --- Education entries ---
  draft.education = parseEducation(buckets.education);

  // --- Projects ---
  let currentProject: ResumeData['projects'][number] | null = null;
  for (const line of buckets.projects) {
    if (!currentProject) {
      currentProject = { id: generateId(), name: line.slice(0, 120), technologies: '', description: '', link: '' };
      draft.projects.push(currentProject);
      continue;
    }
    if (/^(tech|technologies|stack|built with)\b[:\s]/i.test(line)) {
      currentProject.technologies = line.replace(/^(tech(nologies)?|stack|built with)\b[:\s]*/i, '').slice(0, 200);
    } else if (currentProject.description) {
      currentProject.description = `${currentProject.description} ${line}`.slice(0, 1000);
    } else if (currentProject.name && !currentProject.description) {
      currentProject.description = line.slice(0, 1000);
    }
  }

  // --- Certifications ---
  for (const line of buckets.certifications) {
    const parts = line.split(/\s*[|\u2022,]\s*/);
    const name = parts[0]?.replace(/^[-*\u2022]\s*/, '').slice(0, 120) || '';
    if (!name) continue;
    draft.certifications.push({ id: generateId(), name, issuer: parts[1]?.slice(0, 120) ?? '', date: parts[2]?.slice(0, 40) ?? '', link: '' });
  }

  if (unparsedLines.length > 0) {
    warnings.push(`${unparsedLines.length} line(s) could not be mapped confidently and are shown below for review.`);
  }
  if (draft.experience.length === 0) warnings.push('No experience section detected — you can add roles manually after importing.');
  return { draft, unparsedLines, warnings };
}

function isRecognizedHeader(line: string): boolean {
  return SECTION_HEADER_PATTERNS.some(({ regex }) => line.length < 60 && regex.test(line)) || (line.length < 60 && SUMMARY_HEADER.test(line));
}

function extractPersonal(preamble: string[], firstLine: string): PersonalInfo {
  const draft = createEmptyResume().personal;
  const email = preamble.join(' ').match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0] ?? '';
  const phone = preamble.join(' ').match(/(\+?\d[\d\s().-]{6,}\d)/)?.[0] ?? '';
  draft.email = email;
  draft.phone = phone;
  const rest = preamble.filter((l) => l !== firstLine);
  draft.fullName = firstLine.replace(/^(resume|curriculum vitae)\b[:\s]*/i, '').slice(0, 80);
  // Heuristic: short second line without contact info becomes location.
  const locationCandidate = rest.find((l) => !l.includes(email) && l.length <= 40 && !DATE_RANGE.test(l));
  if (locationCandidate) draft.location = locationCandidate.slice(0, 60);
  // Remaining short lines that look like sentences become the summary.
  const summaryCandidate = rest.filter((l) => l.length > 80).join(' ');
  if (summaryCandidate) draft.summary = summaryCandidate.slice(0, 800);
  return draft;
}

function parseExperience(lines: string[]): ResumeData['experience'] {
  const entries: ResumeData['experience'] = [];
  let current: ResumeData['experience'][number] | null = null;

  for (const line of lines) {
    const dateMatch = line.match(DATE_RANGE);
    const isBullet = /^\s*[-*\u2022]/.test(line);

    if (!current) {
      current = { id: generateId(), position: line.slice(0, 100), company: '', location: '', startDate: '', endDate: '', current: false, bullets: [] };
      entries.push(current);
      continue;
    }

    // A non-bullet line without dates once the current role has dates is the
    // title of the NEXT role.
    if (!dateMatch && !isBullet && current.startDate && line.length < 90) {
      current = { id: generateId(), position: line.slice(0, 100), company: '', location: '', startDate: '', endDate: '', current: false, bullets: [] };
      entries.push(current);
      continue;
    }

    if (dateMatch && current.bullets.length === 0 && !current.startDate) {
      // Date line under the title: extract the range; everything before the
      // date (minus separators) is the company/organization.
      const range = line.match(/((?:19|20)\d{2})\s*[–-]\s*((?:19|20)\d{2}|Present|current)?/i);
      current.startDate = range?.[1] ?? '';
      const end = range?.[2] ?? '';
      current.endDate = /present|current/i.test(end) ? '' : end;
      current.current = /present|current/i.test(end);
      const companyPart = line.replace(range?.[0] ?? '', '').replace(/[|·—–-]+\s*$/, '').trim();
      if (companyPart && !current.company) current.company = companyPart.slice(0, 80);
      continue;
    }

    if (/^\s*[-*\u2022]/.test(line)) {
      current.bullets.push(line.replace(/^\s*[-*\u2022]\s*/, '').slice(0, 300));
    } else if (dateMatch && current.startDate) {
      // New role starts (a second date line after bullets/date of previous role).
      current = { id: generateId(), position: line.replace(dateMatch[0], '').replace(/[|·—–-]+$/, '').trim().slice(0, 100) || line.slice(0, 100), company: '', location: '', startDate: '', endDate: '', current: false, bullets: [] };
      const range = line.match(/((?:19|20)\d{2})\s*[–-]\s*((?:19|20)\d{2}|Present|current)?/i);
      current.startDate = range?.[1] ?? '';
      const end = range?.[2] ?? '';
      current.endDate = /present|current/i.test(end) ? '' : end;
      current.current = /present|current/i.test(end);
      current.position = line.replace(range?.[0] ?? '', '').replace(/[|·—–-]+$/, '').trim().slice(0, 100);
      entries.push(current);
    } else if (line.length < 60 && !current.company && current.bullets.length === 0) {
      current.company = line.slice(0, 80);
    } else {
      current.bullets.push(line.slice(0, 300));
    }
  }
  return entries;
}

function parseEducation(lines: string[]): ResumeData['education'] {
  const entries: ResumeData['education'] = [];
  let current: ResumeData['education'][number] | null = null;

  for (const line of lines) {
    const range = line.match(/((?:19|20)\d{2})\s*[–-]\s*((?:19|20)\d{2}|Present)?/i);
    if (range && current) {
      current.startDate = range[1];
      current.endDate = range[2] && !/present/i.test(range[2]) ? range[2] : '';
      continue;
    }
    if (!current) {
      current = { id: generateId(), school: line.slice(0, 120), degree: '', field: '', startDate: '', endDate: '', gpa: '' };
      entries.push(current);
      continue;
    }
    const comma = line.split(',');
    if (comma.length >= 2 && !current.degree) {
      current.degree = comma[0].trim().slice(0, 80);
      current.field = comma.slice(1).join(', ').trim().slice(0, 80);
    } else if (current.gpa === '' && /gpa/i.test(line)) {
      current.gpa = (line.match(/gpa[:\s]*([\d.]+)/i)?.[1] ?? '').slice(0, 10);
    } else {
      // Treat as a new school block if it looks like an institution name.
      current = { id: generateId(), school: line.slice(0, 120), degree: '', field: '', startDate: '', endDate: '', gpa: '' };
      entries.push(current);
    }
  }
  return entries;
}
