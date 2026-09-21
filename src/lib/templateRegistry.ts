import type { ComponentType } from 'react';
import { type ResumeData } from '@/types/resume';
import ModernTemplate from '@/components/templates/ModernTemplate';
import MinimalTemplate from '@/components/templates/MinimalTemplate';
import ProfessionalTemplate from '@/components/templates/ProfessionalTemplate';
import AtsClassicTemplate from '@/components/templates/AtsClassicTemplate';
import StudentTemplate from '@/components/templates/StudentTemplate';
import TechTemplate from '@/components/templates/TechTemplate';
import ExecutiveTemplate from '@/components/templates/ExecutiveTemplate';
import CreativeTemplate from '@/components/templates/CreativeTemplate';
import AcademicTemplate from '@/components/templates/AcademicTemplate';
import DeveloperTemplate from '@/components/templates/DeveloperTemplate';
import CorporateTemplate from '@/components/templates/CorporateTemplate';
import ElegantTemplate from '@/components/templates/ElegantTemplate';
import CompactTemplate from '@/components/templates/CompactTemplate';
import TwoColumnTemplate from '@/components/templates/TwoColumnTemplate';
import PortfolioTemplate from '@/components/templates/PortfolioTemplate';
import StartupTemplate from '@/components/templates/StartupTemplate';
import EngineeringTemplate from '@/components/templates/EngineeringTemplate';
import FinanceTemplate from '@/components/templates/FinanceTemplate';
import ConsultantTemplate from '@/components/templates/ConsultantTemplate';
import ResearchTemplate from '@/components/templates/ResearchTemplate';
import MarketingTemplate from '@/components/templates/MarketingTemplate';
import DesignerTemplate from '@/components/templates/DesignerTemplate';
import HealthcareTemplate from '@/components/templates/HealthcareTemplate';
import LegalTemplate from '@/components/templates/LegalTemplate';
import InternationalTemplate from '@/components/templates/InternationalTemplate';

export type TemplateCategory =
  | 'professional'
  | 'creative'
  | 'academic'
  | 'tech'
  | 'student'
  | 'executive';

export type LayoutType = 'one-column' | 'two-column' | 'sidebar';

export interface TemplateDefinition {
  id: ResumeData['template'];
  label: string;
  description: string;
  atsSafe: boolean;
  category: TemplateCategory;
  bestFor: string;
  features: string[];
  /** Physical layout — drives badge display and PDF rendering hints. */
  layoutType: LayoutType;
  /** Short human-readable layout note, e.g. "Balanced sidebar and main content area." */
  layoutDescription: string;
  /** Free-form keyword tags for search — matches against name, description, bestFor, and tags. */
  tags: string[];
  Component: ComponentType<{ data: ResumeData }>;
}

export const TEMPLATE_REGISTRY: TemplateDefinition[] = [
  {
    id: 'modern',
    label: 'Modern',
    description: 'Clean contemporary single-column layout with modern typography.',
    atsSafe: true,
    category: 'professional',
    bestFor: 'Software / Product / Creative roles',
    features: ['ATS Friendly', 'Clean Layout', 'Modern Typography', 'One Page Ready'],
    layoutType: 'one-column',
    layoutDescription: 'Single column with bold name header and clean section dividers.',
    tags: ['clean', 'versatile', 'sans-serif', 'one-page', 'popular'],
    Component: ModernTemplate,
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Extremely clean with generous whitespace and monospace accent.',
    atsSafe: true,
    category: 'professional',
    bestFor: 'Technical / Academic roles',
    features: ['ATS Friendly', 'Minimal Design', 'Clean Typography', 'Focused Content'],
    layoutType: 'one-column',
    layoutDescription: 'Single column with ultra-clean typography and generous spacing.',
    tags: ['minimal', 'clean', 'monospace', 'whitespace', 'focused'],
    Component: MinimalTemplate,
  },
  {
    id: 'professional',
    label: 'Professional',
    description: 'Corporate conservative style with serif typography.',
    atsSafe: true,
    category: 'professional',
    bestFor: 'Corporate / Finance / Legal',
    features: ['ATS Friendly', 'Conservative Layout', 'Serif Typography', 'Traditional Format'],
    layoutType: 'one-column',
    layoutDescription: 'Traditional single-column with serif headings and conservative spacing.',
    tags: ['conservative', 'serif', 'traditional', 'corporate', 'formal'],
    Component: ProfessionalTemplate,
  },
  {
    id: 'ats-classic',
    label: 'ATS Classic',
    description: 'Plain parser-friendly single-column for maximum ATS compatibility.',
    atsSafe: true,
    category: 'professional',
    bestFor: 'Any role requiring ATS optimization',
    features: ['Maximum ATS Compatible', 'Simple Layout', 'No Graphics', 'Parser Friendly'],
    layoutType: 'one-column',
    layoutDescription: 'Plain single-column with no graphics — maximum parser compatibility.',
    tags: ['ats', 'parser', 'plain', 'safe', 'maximum-compatibility'],
    Component: AtsClassicTemplate,
  },
  {
    id: 'student',
    label: 'Student',
    description: 'Education and projects focused, perfect for new graduates.',
    atsSafe: true,
    category: 'student',
    bestFor: 'Students / Fresh graduates',
    features: ['Education Focus', 'Projects Section', 'Clean Layout', 'Entry Level Friendly'],
    layoutType: 'one-column',
    layoutDescription: 'Single column with education and projects placed prominently.',
    tags: ['student', 'fresh', 'graduate', 'entry-level', 'education', 'projects'],
    Component: StudentTemplate,
  },
  {
    id: 'tech',
    label: 'Tech',
    description: 'Terminal-inspired mono font layout for technical roles.',
    atsSafe: true,
    category: 'tech',
    bestFor: 'Engineering / DevOps / Sysadmin',
    features: ['Monospace Accent', 'Technical Focus', 'Skills Prominent', 'ATS Friendly'],
    layoutType: 'one-column',
    layoutDescription: 'Single column with monospace font accent and prominent skills block.',
    tags: ['tech', 'engineering', 'devops', 'monospace', 'terminal', 'skills'],
    Component: TechTemplate,
  },
  {
    id: 'executive',
    label: 'Executive',
    description: 'Strong name hierarchy with serif typography for senior leaders.',
    atsSafe: true,
    category: 'executive',
    bestFor: 'C-Suite / VP / Director',
    features: ['Bold Header', 'Serif Typography', 'Executive Tone', 'Leadership Focus'],
    layoutType: 'one-column',
    layoutDescription: 'Single column with dominant name header and refined serif typography.',
    tags: ['executive', 'leadership', 'senior', 'c-suite', 'director', 'vp', 'serif'],
    Component: ExecutiveTemplate,
  },
  {
    id: 'creative',
    label: 'Creative',
    description: 'Controlled accent color with creative visual hierarchy.',
    atsSafe: false,
    category: 'creative',
    bestFor: 'Design / Marketing / Media',
    features: ['Color Accent', 'Creative Layout', 'Visual Hierarchy', 'Design Focus'],
    layoutType: 'one-column',
    layoutDescription: 'Single column with colored accent bar and expressive section headers.',
    tags: ['creative', 'design', 'marketing', 'media', 'color', 'expressive'],
    Component: CreativeTemplate,
  },
  {
    id: 'academic',
    label: 'Academic',
    description: 'Education and research focused with journal-style formatting.',
    atsSafe: true,
    category: 'academic',
    bestFor: 'Researchers / Professors / PhD',
    features: ['Publications Ready', 'Research Focus', 'Serif Typography', 'Academic Format'],
    layoutType: 'one-column',
    layoutDescription: 'Single column with journal-style section formatting and serif type.',
    tags: ['academic', 'research', 'professor', 'phd', 'publications', 'serif', 'journal'],
    Component: AcademicTemplate,
  },
  {
    id: 'developer',
    label: 'Developer',
    description: 'GitHub and technical stack emphasis with mono styling.',
    atsSafe: true,
    category: 'tech',
    bestFor: 'Full Stack / Backend / Frontend Dev',
    features: ['Code Style', 'Project Heavy', 'Skills Grid', 'Tech Stack Focus'],
    layoutType: 'one-column',
    layoutDescription: 'Single column with code-style accent and project-forward layout.',
    tags: ['developer', 'github', 'fullstack', 'backend', 'frontend', 'mono', 'projects'],
    Component: DeveloperTemplate,
  },
  {
    id: 'corporate',
    label: 'Corporate',
    description: 'Formal structured layout for enterprise environments.',
    atsSafe: true,
    category: 'professional',
    bestFor: 'Enterprise / Management / Operations',
    features: ['Structured Layout', 'Formal Tone', 'ATS Compatible', 'Enterprise Ready'],
    layoutType: 'one-column',
    layoutDescription: 'Structured single-column with formal headings and consistent spacing.',
    tags: ['corporate', 'enterprise', 'management', 'operations', 'formal', 'structured'],
    Component: CorporateTemplate,
  },
  {
    id: 'elegant',
    label: 'Elegant',
    description: 'Premium serif typography with refined spacing and minimal decoration.',
    atsSafe: true,
    category: 'professional',
    bestFor: 'Consulting / Law / Finance',
    features: ['Serif Typography', 'Refined Spacing', 'Premium Feel', 'Minimal Decoration'],
    layoutType: 'one-column',
    layoutDescription: 'Single column with premium serif typography and refined spacing.',
    tags: ['elegant', 'premium', 'serif', 'consulting', 'law', 'finance', 'refined'],
    Component: ElegantTemplate,
  },
  {
    id: 'compact',
    label: 'Compact',
    description: 'Dense one-page layout maximizing information per square inch.',
    atsSafe: true,
    category: 'professional',
    bestFor: 'Experienced professionals with extensive backgrounds',
    features: ['Dense Layout', 'Small Font', 'Maximum Info', 'One Page Optimized'],
    layoutType: 'one-column',
    layoutDescription: 'Dense single-column with small font — maximum content per page.',
    tags: ['compact', 'dense', 'one-page', 'experienced', 'maximum-info'],
    Component: CompactTemplate,
  },
  {
    id: 'two-column',
    label: 'Two Column',
    description: 'Balanced sidebar and main content area layout.',
    atsSafe: false,
    category: 'professional',
    bestFor: 'Design / Marketing / Multi-skilled roles',
    features: ['Two Column Layout', 'Sidebar Skills', 'Visual Balance', 'Space Efficient'],
    layoutType: 'two-column',
    layoutDescription: 'Sidebar with skills/contact and main content area with experience.',
    tags: ['two-column', 'sidebar', 'balanced', 'space-efficient', 'visual'],
    Component: TwoColumnTemplate,
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    description: 'Projects and achievements focused with prominent work showcase.',
    atsSafe: false,
    category: 'creative',
    bestFor: 'Designers / Freelancers / Creative technologists',
    features: ['Project Focus', 'Portfolio Style', 'Creative Layout', 'Work Showcase'],
    layoutType: 'two-column',
    layoutDescription: 'Two-column with project showcase sidebar and main content.',
    tags: ['portfolio', 'projects', 'creative', 'freelancer', 'designer', 'showcase'],
    Component: PortfolioTemplate,
  },
  {
    id: 'startup',
    label: 'Startup',
    description: 'Casual modern style with project-forward layout and vibrant accents.',
    atsSafe: true,
    category: 'tech',
    bestFor: 'Startup / Tech / Innovation roles',
    features: ['Modern Layout', 'Project Forward', 'Vibrant Accents', 'Casual Tone'],
    layoutType: 'one-column',
    layoutDescription: 'Single column with project-forward layout and vibrant accent colors.',
    tags: ['startup', 'modern', 'casual', 'innovation', 'tech', 'vibrant'],
    Component: StartupTemplate,
  },
  {
    id: 'engineering',
    label: 'Engineering',
    description: 'Structured grid layout with prominent technical skills and certifications.',
    atsSafe: true,
    category: 'tech',
    bestFor: 'Mechanical / Electrical / Civil Engineering',
    features: ['Grid Skills', 'Certifications Focus', 'Structured Layout', 'Technical Detail'],
    layoutType: 'one-column',
    layoutDescription: 'Single column with grid skills display and certifications section.',
    tags: ['engineering', 'mechanical', 'electrical', 'civil', 'certifications', 'grid', 'technical'],
    Component: EngineeringTemplate,
  },
  {
    id: 'finance',
    label: 'Finance',
    description: 'Conservative serif with formal table-style layout for financial roles.',
    atsSafe: true,
    category: 'professional',
    bestFor: 'Banking / Investment / Financial Analysis',
    features: ['Serif Typography', 'Conservative Layout', 'Formal Style', 'Table Format'],
    layoutType: 'one-column',
    layoutDescription: 'Conservative single-column with serif type and formal table-style sections.',
    tags: ['finance', 'banking', 'investment', 'conservative', 'serif', 'formal'],
    Component: FinanceTemplate,
  },
  {
    id: 'consultant',
    label: 'Consultant',
    description: 'Project and outcome focused layout highlighting consulting engagements.',
    atsSafe: true,
    category: 'professional',
    bestFor: 'Management Consulting / Strategy / Advisory',
    features: ['Engagement Focus', 'Outcome Oriented', 'Clean Layout', 'Results Driven'],
    layoutType: 'one-column',
    layoutDescription: 'Single column with engagement/outcome-focused section headers.',
    tags: ['consultant', 'consulting', 'strategy', 'advisory', 'outcome', 'engagement'],
    Component: ConsultantTemplate,
  },
  {
    id: 'research',
    label: 'Research',
    description: 'Publications and citations style for academic research roles.',
    atsSafe: true,
    category: 'academic',
    bestFor: 'Research Scientists / Postdocs / Lab Directors',
    features: ['Publications Ready', 'Citation Style', 'Serif Typography', 'Research Focus'],
    layoutType: 'one-column',
    layoutDescription: 'Single column with publication/citation formatting and serif typography.',
    tags: ['research', 'publications', 'citations', 'academic', 'scientist', 'postdoc', 'serif'],
    Component: ResearchTemplate,
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'Metrics-forward bold layout for marketing and communications roles.',
    atsSafe: false,
    category: 'creative',
    bestFor: 'Digital Marketing / Brand / Content Strategy',
    features: ['Bold Headers', 'Metrics Forward', 'Color Accents', 'Campaign Focus'],
    layoutType: 'one-column',
    layoutDescription: 'Single column with bold headers and metrics-forward section layout.',
    tags: ['marketing', 'brand', 'content', 'digital', 'metrics', 'campaign', 'bold'],
    Component: MarketingTemplate,
  },
  {
    id: 'designer',
    label: 'Designer',
    description: 'Visual hierarchy with subtle color accents for creative professionals.',
    atsSafe: false,
    category: 'creative',
    bestFor: 'UI/UX Design / Graphic Design / Visual Design',
    features: ['Color Accent Bar', 'Visual Hierarchy', 'Clean Creative', 'Design Focused'],
    layoutType: 'two-column',
    layoutDescription: 'Two-column with color accent bar and visual hierarchy focus.',
    tags: ['designer', 'ui', 'ux', 'graphic', 'visual', 'color', 'creative'],
    Component: DesignerTemplate,
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    description: 'Certifications and clinical experience prominent for medical professionals.',
    atsSafe: true,
    category: 'professional',
    bestFor: 'Nurses / Doctors / Allied Health',
    features: ['Clinical Focus', 'Certifications Prominent', 'Clean Format', 'Healthcare Ready'],
    layoutType: 'one-column',
    layoutDescription: 'Single column with certifications and clinical experience prominent.',
    tags: ['healthcare', 'medical', 'nurse', 'doctor', 'clinical', 'certifications'],
    Component: HealthcareTemplate,
  },
  {
    id: 'legal',
    label: 'Legal',
    description: 'Formal traditional style for legal professionals and attorneys.',
    atsSafe: true,
    category: 'professional',
    bestFor: 'Attorneys / Paralegals / Legal Counsel',
    features: ['Traditional Format', 'Bar Admissions', 'Serif Typography', 'Formal Tone'],
    layoutType: 'one-column',
    layoutDescription: 'Formal single-column with serif type, bar admissions, and traditional format.',
    tags: ['legal', 'attorney', 'paralegal', 'law', 'formal', 'serif', 'traditional'],
    Component: LegalTemplate,
  },
  {
    id: 'international',
    label: 'International',
    description: 'Clean universal format suitable for multi-language and international roles.',
    atsSafe: true,
    category: 'professional',
    bestFor: 'International roles / Multilingual professionals',
    features: ['Universal Format', 'Clean Layout', 'Multi-contact', 'International Ready'],
    layoutType: 'one-column',
    layoutDescription: 'Clean universal single-column with multi-contact support.',
    tags: ['international', 'multilingual', 'universal', 'clean', 'global'],
    Component: InternationalTemplate,
  },
];

/**
 * All unique category labels derived from the registry.
 * Order is curated — common categories first.
 */
export const ALL_CATEGORIES: { value: TemplateCategory | 'ats' | 'all'; label: string }[] = [
  { value: 'all', label: 'All Templates' },
  { value: 'ats', label: 'ATS Friendly' },
  { value: 'professional', label: 'Professional' },
  { value: 'tech', label: 'Developer / Tech' },
  { value: 'student', label: 'Student / Fresher' },
  { value: 'creative', label: 'Creative' },
  { value: 'academic', label: 'Academic' },
  { value: 'executive', label: 'Executive' },
];

/**
 * Counts templates per category — used by the Templates page so numbers are
 * always live and never hard-coded.
 */
export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = { all: TEMPLATE_REGISTRY.length };
  for (const t of TEMPLATE_REGISTRY) {
    counts[t.category] = (counts[t.category] ?? 0) + 1;
    if (t.atsSafe) counts.ats = (counts.ats ?? 0) + 1;
  }
  return counts;
}

/** Full-text search across template metadata. */
export function searchTemplates(query: string): TemplateDefinition[] {
  const q = query.toLowerCase().trim();
  if (!q) return TEMPLATE_REGISTRY;
  return TEMPLATE_REGISTRY.filter(
    (t) =>
      t.label.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.bestFor.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.includes(q)),
  );
}

export function getTemplate(id: ResumeData['template']): TemplateDefinition {
  return TEMPLATE_REGISTRY.find((t) => t.id === id) ?? TEMPLATE_REGISTRY[0];
}
