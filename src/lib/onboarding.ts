import {
  type ResumeData,
  type TemplateType,
  createEmptyResume,
  createEmptyEducation,
  createEmptyExperience,
  createEmptyProject,
  createEmptyCertification,
} from '@/types/resume';

/**
 * New-user onboarding: the details collected before the editor opens, plus the
 * pure logic that validates them and turns them into a resume.
 *
 * The resulting resume contains ONLY what the user typed — no sample/demo
 * content is ever merged in. Anything the user skips stays empty so the editor
 * shows honest empty states instead of borrowed data.
 */

export interface PersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  linkedin: string;
  website: string;
  summary: string;
}

export type PersonalDetailsField = keyof PersonalDetails;
export type PersonalDetailsErrors = Partial<Record<PersonalDetailsField, string>>;

export const EMPTY_PERSONAL_DETAILS: PersonalDetails = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  headline: '',
  linkedin: '',
  website: '',
  summary: '',
};

/**
 * Optional background collected in onboarding step 3, adapted to the project's
 * existing resume data model. Rows left completely empty are dropped by the
 * builder, and every value still originates from the user.
 */
export interface BackgroundDetails {
  education: { school: string; degree: string; field: string; startDate: string; endDate: string }[];
  experience: { company: string; position: string; startDate: string; endDate: string; description: string }[];
  skills: string[];
  projects: { name: string; description: string; technologies: string; link: string }[];
  certifications: { name: string; issuer: string; date: string; link: string }[];
}

export const EMPTY_BACKGROUND: BackgroundDetails = {
  education: [],
  experience: [],
  skills: [],
  projects: [],
  certifications: [],
};

/** Deliberately permissive — catches obvious typos without rejecting valid addresses. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Digits plus the usual separators, at least 7 digits total. */
const PHONE_DIGITS_RE = /\d/g;

export function validatePersonalDetails(details: PersonalDetails): PersonalDetailsErrors {
  const errors: PersonalDetailsErrors = {};

  if (!details.fullName.trim()) {
    errors.fullName = 'Enter your full name so recruiters know who you are.';
  } else if (details.fullName.trim().length < 2) {
    errors.fullName = 'That name looks too short.';
  }

  if (!details.email.trim()) {
    errors.email = 'Enter your email address.';
  } else if (!EMAIL_RE.test(details.email.trim())) {
    errors.email = 'Enter a valid email address, e.g. you@example.com.';
  }

  const phoneDigits = details.phone.match(PHONE_DIGITS_RE)?.length ?? 0;
  if (!details.phone.trim()) {
    errors.phone = 'Enter your phone number.';
  } else if (phoneDigits < 7) {
    errors.phone = 'Enter a valid phone number (at least 7 digits).';
  }

  return errors;
}

export function isValidPersonalDetails(details: PersonalDetails): boolean {
  return Object.keys(validatePersonalDetails(details)).length === 0;
}

export function normalizeDetails(details: PersonalDetails): PersonalDetails {
  return {
    fullName: details.fullName.trim(),
    email: details.email.trim(),
    phone: details.phone.trim(),
    location: details.location.trim(),
    headline: details.headline.trim(),
    linkedin: details.linkedin.trim(),
    website: details.website.trim(),
    summary: details.summary.trim(),
  };
}

const hasText = (values: string[]) => values.some((v) => v.trim().length > 0);

/** Drops rows the user never filled in — never invents placeholder content. */
function buildBackground(bg: BackgroundDetails): Pick<ResumeData, 'education' | 'experience' | 'skills' | 'projects' | 'certifications'> {
  return {
    education: bg.education
      .filter((e) => hasText([e.school, e.degree, e.field, e.startDate, e.endDate]))
      .map((e) => ({ ...createEmptyEducation(), school: e.school.trim(), degree: e.degree.trim(), field: e.field.trim(), startDate: e.startDate.trim(), endDate: e.endDate.trim() })),
    experience: bg.experience
      .filter((e) => hasText([e.company, e.position, e.startDate, e.endDate, e.description]))
      .map((e) => ({
        ...createEmptyExperience(),
        company: e.company.trim(),
        position: e.position.trim(),
        startDate: e.startDate.trim(),
        endDate: e.endDate.trim(),
        bullets: e.description.trim() ? [e.description.trim()] : [''],
      })),
    skills: [...new Set(bg.skills.map((s) => s.trim()).filter(Boolean))],
    projects: bg.projects
      .filter((p) => hasText([p.name, p.description, p.technologies, p.link]))
      .map((p) => ({ ...createEmptyProject(), name: p.name.trim(), description: p.description.trim(), technologies: p.technologies.trim(), link: p.link.trim() })),
    certifications: bg.certifications
      .filter((c) => hasText([c.name, c.issuer, c.date, c.link]))
      .map((c) => ({ ...createEmptyCertification(), name: c.name.trim(), issuer: c.issuer.trim(), date: c.date.trim(), link: c.link.trim() })),
  };
}

/**
 * Builds a real user resume from the onboarding details, the chosen template
 * and (optionally) the background entered in step 3. Only the layout/typography
 * comes from the template — every piece of content comes from the user.
 */
export function buildResumeFromDetails(
  details: PersonalDetails,
  template: TemplateType,
  background: BackgroundDetails = EMPTY_BACKGROUND,
): ResumeData {
  const clean = normalizeDetails(details);
  const resume = createEmptyResume();
  resume.template = template;
  resume.title = clean.headline ? `${clean.headline} Resume` : 'My Resume';
  resume.personal = {
    ...resume.personal,
    fullName: clean.fullName,
    email: clean.email,
    phone: clean.phone,
    location: clean.location,
    headline: clean.headline,
    linkedin: clean.linkedin,
    website: clean.website,
    summary: clean.summary,
  };
  Object.assign(resume, buildBackground(background));
  return resume;
}
