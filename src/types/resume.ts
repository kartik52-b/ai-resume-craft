import { generateId } from '@/lib/id';

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

export interface Project {
  id: string;
  name: string;
  link: string;
  description: string;
  technologies: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link: string;
}

export type TemplateType = 'modern' | 'minimal' | 'professional' | 'ats-classic' | 'student' | 'tech' | 'executive' | 'creative' | 'academic' | 'developer' | 'corporate' | 'elegant' | 'compact' | 'two-column' | 'portfolio' | 'startup' | 'engineering' | 'finance' | 'consultant' | 'research' | 'marketing' | 'designer' | 'healthcare' | 'legal' | 'international';
export const ALL_TEMPLATE_TYPES: TemplateType[] = ['modern', 'minimal', 'professional', 'ats-classic', 'student', 'tech', 'executive', 'creative', 'academic', 'developer', 'corporate', 'elegant', 'compact', 'two-column', 'portfolio', 'startup', 'engineering', 'finance', 'consultant', 'research', 'marketing', 'designer', 'healthcare', 'legal', 'international'];

/** Editable/visible resume sections, in their default order. */
export type SectionId = 'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications';
export const DEFAULT_SECTION_ORDER: SectionId[] = [
  'personal', 'experience', 'education', 'skills', 'projects', 'certifications',
];

export interface ResumeData {
  id: string;
  title: string;
  template: TemplateType;
  /** ISO timestamp of the last modification (set by store updates). */
  updatedAt?: string;
  /** Display order of resume sections (missing ids fall back to the default order). */
  sectionOrder?: SectionId[];
  /** Sections hidden from the resume output. */
  hiddenSections?: SectionId[];
  personal: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  certifications: Certification[];
}

/**
 * A completely blank resume. Used as the sanitize fallback, the base for demo
 * data, and inside tests. NOT what a brand-new user resume looks like — see
 * createStarterResume for that.
 */
export const createEmptyResume = (): ResumeData => ({
  id: generateId(),
  title: 'Untitled Resume',
  template: 'modern',
  sectionOrder: [...DEFAULT_SECTION_ORDER],
  hiddenSections: [],
  personal: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    summary: '',
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
});

/**
 * Default starter personal details shown in the editor when a new resume is
 * created. These are editable example values — every field can be replaced by
 * the user. Indian formatting throughout.
 */
export const DEFAULT_PERSONAL_INFO: PersonalInfo = {
  fullName: 'Kartik Bhardwaj',
  email: 'kartik@example.com',
  phone: '+91 98765 43210',
  location: 'Agra, Uttar Pradesh, India',
  website: '',
  linkedin: 'linkedin.com/in/kartikbhardwaj',
  github: 'github.com/kartikbhardwaj',
  summary: '',
};

/**
 * A new user-facing resume, pre-filled with the default starter details.
 * The user can edit every field; their edits become their real resume data.
 */
export const createStarterResume = (): ResumeData => ({
  ...createEmptyResume(),
  personal: { ...DEFAULT_PERSONAL_INFO },
});

export const createEmptyExperience = (): Experience => ({
  id: generateId(),
  company: '',
  position: '',
  location: '',
  startDate: '',
  endDate: '',
  current: false,
  bullets: [''],
});

export const createEmptyEducation = (): Education => ({
  id: generateId(),
  school: '',
  degree: '',
  field: '',
  startDate: '',
  endDate: '',
  gpa: '',
});

export const createEmptyProject = (): Project => ({
  id: generateId(),
  name: '',
  link: '',
  description: '',
  technologies: '',
});

export const createEmptyCertification = (): Certification => ({
  id: generateId(),
  name: '',
  issuer: '',
  date: '',
  link: '',
});
