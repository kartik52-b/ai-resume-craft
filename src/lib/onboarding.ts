import { type ResumeData, type TemplateType, createEmptyResume } from '@/types/resume';

/**
 * New-user onboarding: the personal details collected in step 1 of the create
 * flow, plus the pure logic that validates them and turns them into a resume.
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
}

export type PersonalDetailsField = keyof PersonalDetails;
export type PersonalDetailsErrors = Partial<Record<PersonalDetailsField, string>>;

export const EMPTY_PERSONAL_DETAILS: PersonalDetails = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  headline: '',
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
  };
}

/**
 * Builds a real user resume from the onboarding details and the chosen
 * template. Only the layout/typography comes from the template — every piece
 * of content comes from the user.
 */
export function buildResumeFromDetails(
  details: PersonalDetails,
  template: TemplateType,
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
  };
  return resume;
}
