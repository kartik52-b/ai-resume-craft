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
import SocialTemplate from '@/components/templates/SocialTemplate';
import TimTemplate from '@/components/templates/TimTemplate';
import MarkTemplate from '@/components/templates/MarkTemplate';
import ShelahTemplate from '@/components/templates/ShelahTemplate';
import MoonTemplate from '@/components/templates/MoonTemplate';
import MaxTemplate from '@/components/templates/MaxTemplate';
import LanaTemplate from '@/components/templates/LanaTemplate';
import TimelessTemplate from '@/components/templates/TimelessTemplate';
import PlainTemplate from '@/components/templates/PlainTemplate';
import BloggerTemplate from '@/components/templates/BloggerTemplate';
import PacificTemplate from '@/components/templates/PacificTemplate';
import ComicTemplate from '@/components/templates/ComicTemplate';
import KalyTemplate from '@/components/templates/KalyTemplate';
import MulaTemplate from '@/components/templates/MulaTemplate';
import BelaTemplate from '@/components/templates/BelaTemplate';
import GeneralAtsTemplate from '@/components/templates/GeneralAtsTemplate';
import FreshmanTemplate from '@/components/templates/FreshmanTemplate';
import GraphicTemplate from '@/components/templates/GraphicTemplate';

/**
 * Design directions. Each template belongs to exactly one; the gallery uses
 * these to build its filter pills from live data.
 */
export type TemplateCategory =
  | 'professional'
  | 'modern'
  | 'creative'
  | 'developer'
  | 'academic'
  | 'executive'
  | 'student';

export type LayoutType = 'one-column' | 'two-column' | 'sidebar';

export interface TemplateDefinition {
  id: ResumeData['template'];
  /** Professional display name shown throughout the product. */
  label: string;
  description: string;
  category: TemplateCategory;
  bestFor: string;
  features: string[];
  /** Physical layout — drives badge display and PDF rendering hints. */
  layoutType: LayoutType;
  /** Short human-readable layout note, e.g. "30% rail and 70% main content." */
  layoutDescription: string;
  /** Free-form keyword tags for search — matches against name, description, bestFor, and tags. */
  tags: string[];
  Component: ComponentType<{ data: ResumeData }>;
}

/**
 * The template collection.
 *
 * Every entry is a genuinely different page structure — single column, flowing
 * columns, mirrored rails, split bodies, timelines — not a recoloured copy.
 * Layout structure is defined in `src/components/templates/layouts.tsx` and the
 * shared section primitives in `src/components/templates/shared.tsx`.
 */
export const TEMPLATE_REGISTRY: TemplateDefinition[] = [
  {
    id: 'modern',
    label: 'Modern',
    description: 'Centered masthead with short accent underlines and chip skills on one clean column.',
    category: 'modern',
    bestFor: 'Software / Product / Creative roles',
    features: ['Centered header', 'Accent underlines', 'Chip skills', 'One page ready'],
    layoutType: 'one-column',
    layoutDescription: 'Single column, centered header, quiet underlined section labels.',
    tags: ['clean', 'centered', 'versatile', 'sans-serif', 'popular'],
    Component: ModernTemplate,
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Monospace type, wide whitespace and quiet uppercase labels — nothing but the content.',
    category: 'modern',
    bestFor: 'Technical / Academic / Focused profiles',
    features: ['Mono typography', 'Generous whitespace', 'Quiet labels', 'Content first'],
    layoutType: 'one-column',
    layoutDescription: 'Airy single column with monospace type and no rules or boxes.',
    tags: ['minimal', 'mono', 'whitespace', 'focused', 'quiet'],
    Component: MinimalTemplate,
  },
  {
    id: 'professional',
    label: 'Professional',
    description: 'Serif classic: dominant name, ruled uppercase sections and a conservative reading rhythm.',
    category: 'professional',
    bestFor: 'Corporate / Finance / Legal',
    features: ['Serif hierarchy', 'Ruled sections', 'Conservative layout', 'Recruiter friendly'],
    layoutType: 'one-column',
    layoutDescription: 'Traditional single column, serif type, ruled uppercase section headings.',
    tags: ['conservative', 'serif', 'traditional', 'corporate', 'formal'],
    Component: ProfessionalTemplate,
  },
  {
    id: 'ats-classic',
    label: 'Classic Clean',
    description: 'The plainest, most readable structure: one column, no graphics, quiet labels.',
    category: 'professional',
    bestFor: 'Any role — maximum readability',
    features: ['Plain structure', 'No graphics', 'High readability', 'Simple hierarchy'],
    layoutType: 'one-column',
    layoutDescription: 'Bare single column with a hairline header rule and quiet section labels.',
    tags: ['classic', 'clean', 'plain', 'simple', 'readable'],
    Component: AtsClassicTemplate,
  },
  {
    id: 'student',
    label: 'Graduate',
    description: 'Centered header over a split body that promotes education and projects to the left.',
    category: 'student',
    bestFor: 'Students / New graduates',
    features: ['Education first', 'Project column', 'Skill chips', 'Entry level friendly'],
    layoutType: 'sidebar',
    layoutDescription: 'Centered header, then a wide left column for education and projects.',
    tags: ['student', 'graduate', 'entry-level', 'education', 'projects', 'fresher'],
    Component: StudentTemplate,
  },
  {
    id: 'tech',
    label: 'Tech',
    description: 'Monospace, compact technical entries and skill bullets flowing across two columns.',
    category: 'developer',
    bestFor: 'Engineering / DevOps / Sysadmin',
    features: ['Mono accent', 'Two flowing columns', 'Compact entries', 'Technical focus'],
    layoutType: 'two-column',
    layoutDescription: 'Two flowing columns of monospace content under a split header.',
    tags: ['tech', 'engineering', 'devops', 'mono', 'terminal', 'skills'],
    Component: TechTemplate,
  },
  {
    id: 'executive',
    label: 'Executive',
    description: 'Large centered name, double-rule serif headings and dense leadership detail.',
    category: 'executive',
    bestFor: 'C-Suite / VP / Director',
    features: ['Dominant name', 'Double-rule headings', 'High density', 'Leadership focus'],
    layoutType: 'one-column',
    layoutDescription: 'Dense single column with a large centered name and serif double rules.',
    tags: ['executive', 'leadership', 'senior', 'c-suite', 'director', 'vp', 'serif'],
    Component: ExecutiveTemplate,
  },
  {
    id: 'creative',
    label: 'Creative',
    description: 'Asymmetric accent rail beside an oversized name, with a two-column flowing body.',
    category: 'creative',
    bestFor: 'Design / Marketing / Media',
    features: ['Asymmetric header', 'Accent rail', 'Two flowing columns', 'Boxed labels'],
    layoutType: 'two-column',
    layoutDescription: 'Accent-bar header, then content flows into two balanced columns.',
    tags: ['creative', 'asymmetric', 'accent', 'design', 'expressive'],
    Component: CreativeTemplate,
  },
  {
    id: 'academic',
    label: 'Academic',
    description: 'Journal-style masthead with serif hierarchy and a narrow credentials column.',
    category: 'academic',
    bestFor: 'Researchers / Professors / PhD',
    features: ['Serif hierarchy', 'Credentials column', 'Publication ready', 'Formal tone'],
    layoutType: 'two-column',
    layoutDescription: 'Centered masthead with a narrow right column for skills and credentials.',
    tags: ['academic', 'research', 'professor', 'phd', 'publications', 'serif', 'journal'],
    Component: AcademicTemplate,
  },
  {
    id: 'developer',
    label: 'Developer',
    description: 'Dark full-bleed rail for contact and stack, with projects as cards in the main column.',
    category: 'developer',
    bestFor: 'Full Stack / Backend / Frontend Dev',
    features: ['Dark rail', 'Project cards', 'Stack sidebar', 'Mono type'],
    layoutType: 'sidebar',
    layoutDescription: 'Dark full-bleed left rail, monospace main column, project cards.',
    tags: ['developer', 'github', 'fullstack', 'backend', 'frontend', 'mono', 'projects'],
    Component: DeveloperTemplate,
  },
  {
    id: 'corporate',
    label: 'Corporate',
    description: 'Structured enterprise layout with ruled sections and a formal credentials column.',
    category: 'professional',
    bestFor: 'Enterprise / Management / Operations',
    features: ['Structured layout', 'Ruled sections', 'Credits column', 'Formal tone'],
    layoutType: 'two-column',
    layoutDescription: 'Split body with a narrow right column for core skills and certifications.',
    tags: ['corporate', 'enterprise', 'management', 'operations', 'formal', 'structured'],
    Component: CorporateTemplate,
  },
  {
    id: 'elegant',
    label: 'Signature',
    description: 'Premium restraint: wide-tracked masthead, serif type and a lot of air.',
    category: 'professional',
    bestFor: 'Consulting / Law / Finance',
    features: ['Wide-tracked name', 'Serif type', 'Generous whitespace', 'Minimal ornament'],
    layoutType: 'one-column',
    layoutDescription: 'Spacious single column with a wide-tracked centered masthead.',
    tags: ['elegant', 'premium', 'serif', 'consulting', 'law', 'finance', 'refined'],
    Component: ElegantTemplate,
  },
  {
    id: 'compact',
    label: 'Compact',
    description: 'Small type and tight spacing across two columns — maximum content per page.',
    category: 'professional',
    bestFor: 'Experienced professionals with long histories',
    features: ['Dense layout', 'Small type', 'Two flowing columns', 'One page optimized'],
    layoutType: 'two-column',
    layoutDescription: 'Two dense flowing columns with compact inline entries.',
    tags: ['compact', 'dense', 'one-page', 'experienced', 'maximum-info'],
    Component: CompactTemplate,
  },
  {
    id: 'two-column',
    label: 'Sidebar',
    description: 'Teal full-bleed rail for identity, stack and credentials beside a clean narrative column.',
    category: 'professional',
    bestFor: 'Design / Marketing / Multi-skilled roles',
    features: ['Full-bleed rail', 'Stack sidebar', 'Balanced columns', 'Space efficient'],
    layoutType: 'sidebar',
    layoutDescription: 'Full-bleed teal left rail with contact, skills and certifications.',
    tags: ['sidebar', 'two-column', 'balanced', 'space-efficient', 'teal'],
    Component: TwoColumnTemplate,
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    description: 'Mirrored dark rail on the right, with work showcased as cards on the left.',
    category: 'creative',
    bestFor: 'Designers / Freelancers / Creative technologists',
    features: ['Mirrored rail', 'Project cards', 'Work showcase', 'Creative layout'],
    layoutType: 'sidebar',
    layoutDescription: 'Dark full-bleed right rail with a project-card main column.',
    tags: ['portfolio', 'projects', 'creative', 'freelancer', 'designer', 'showcase'],
    Component: PortfolioTemplate,
  },
  {
    id: 'startup',
    label: 'Horizon',
    description: 'Bold accent rule under a tight header, with content in two flowing columns.',
    category: 'modern',
    bestFor: 'Startup / Tech / Innovation roles',
    features: ['Bold header rule', 'Two flowing columns', 'Chip skills', 'Casual tone'],
    layoutType: 'two-column',
    layoutDescription: 'Accent-rule header above two flowing columns of content.',
    tags: ['startup', 'modern', 'bold', 'innovation', 'two-column', 'casual'],
    Component: StartupTemplate,
  },
  {
    id: 'engineering',
    label: 'Engineering',
    description: 'Numbered sections with grid skills and certifications for enumerable technical detail.',
    category: 'developer',
    bestFor: 'Mechanical / Electrical / Civil Engineering',
    features: ['Numbered sections', 'Grid skills', 'Certifications grid', 'Structured detail'],
    layoutType: 'one-column',
    layoutDescription: 'Single column with numbered section headings and grid skill displays.',
    tags: ['engineering', 'mechanical', 'electrical', 'civil', 'certifications', 'grid'],
    Component: EngineeringTemplate,
  },
  {
    id: 'finance',
    label: 'Finance',
    description: 'Formal serif layout with credentials in a left column and ruled section headers.',
    category: 'professional',
    bestFor: 'Banking / Investment / Financial Analysis',
    features: ['Serif type', 'Left credits column', 'Ruled sections', 'Conservative tone'],
    layoutType: 'two-column',
    layoutDescription: 'Split body with a narrow left column for skills and credentials.',
    tags: ['finance', 'banking', 'investment', 'conservative', 'serif', 'formal'],
    Component: FinanceTemplate,
  },
  {
    id: 'consultant',
    label: 'Consultant',
    description: 'Engagement history told on a vertical timeline for an unambiguous chronology.',
    category: 'executive',
    bestFor: 'Management Consulting / Strategy / Advisory',
    features: ['Timeline experience', 'Clear chronology', 'Accent bars', 'Outcome focused'],
    layoutType: 'one-column',
    layoutDescription: 'Single column with a vertical timeline rail through the experience list.',
    tags: ['consultant', 'consulting', 'strategy', 'timeline', 'advisory', 'chronology'],
    Component: ConsultantTemplate,
  },
  {
    id: 'research',
    label: 'Research',
    description: 'Numbered serif sections and airy leading built for publication-heavy profiles.',
    category: 'academic',
    bestFor: 'Research Scientists / Postdocs / Lab Directors',
    features: ['Numbered sections', 'Serif hierarchy', 'Airy leading', 'Publications ready'],
    layoutType: 'one-column',
    layoutDescription: 'Single column with numbered headings and generous serif line height.',
    tags: ['research', 'publications', 'citations', 'academic', 'scientist', 'postdoc', 'serif'],
    Component: ResearchTemplate,
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'Bold boxed labels with capabilities grouped in a left column and metrics up front.',
    category: 'creative',
    bestFor: 'Digital Marketing / Brand / Content Strategy',
    features: ['Boxed labels', 'Capabilities column', 'Bold headers', 'Metrics forward'],
    layoutType: 'two-column',
    layoutDescription: 'Split body with a wide left column for capabilities and certifications.',
    tags: ['marketing', 'brand', 'content', 'digital', 'campaign', 'bold'],
    Component: MarketingTemplate,
  },
  {
    id: 'designer',
    label: 'Designer',
    description: 'A wide tinted rail carries identity and toolkit; the story breathes in the main column.',
    category: 'creative',
    bestFor: 'UI/UX Design / Graphic Design / Visual Design',
    features: ['Wide tinted rail', 'Chip skills', 'Accent bar headings', 'Visual hierarchy'],
    layoutType: 'sidebar',
    layoutDescription: 'Wide tinted left rail with contact and skills, accent-bar main column.',
    tags: ['designer', 'ui', 'ux', 'graphic', 'visual', 'creative'],
    Component: DesignerTemplate,
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    description: 'Clinical experience in the main column with credentials surfaced in a right column.',
    category: 'professional',
    bestFor: 'Nurses / Doctors / Allied Health',
    features: ['Credentials column', 'Clinical focus', 'Ruled sections', 'Clear format'],
    layoutType: 'two-column',
    layoutDescription: 'Split body with a narrow right column for credentials and clinical skills.',
    tags: ['healthcare', 'medical', 'nurse', 'doctor', 'clinical', 'certifications'],
    Component: HealthcareTemplate,
  },
  {
    id: 'legal',
    label: 'Legal',
    description: 'Formal centered masthead with double rules and a traditional serif reading order.',
    category: 'professional',
    bestFor: 'Attorneys / Paralegals / Legal Counsel',
    features: ['Centered masthead', 'Double rules', 'Serif type', 'Traditional format'],
    layoutType: 'one-column',
    layoutDescription: 'Formal single column with a centered double-ruled masthead.',
    tags: ['legal', 'attorney', 'paralegal', 'law', 'formal', 'serif', 'traditional'],
    Component: LegalTemplate,
  },
  {
    id: 'international',
    label: 'International',
    description: 'Neutral, language-agnostic layout with a compact identity rail down the left.',
    category: 'professional',
    bestFor: 'International roles / Multilingual professionals',
    features: ['Compact rail', 'Universal format', 'Multi-contact', 'Neutral tone'],
    layoutType: 'sidebar',
    layoutDescription: 'Compact light left rail with contact and skills, universal main column.',
    tags: ['international', 'multilingual', 'universal', 'clean', 'global'],
    Component: InternationalTemplate,
  },
  {
    id: 'social',
    label: 'Social',
    description: 'Centered editorial masthead with a short bronze rule and chip skills on one clean column.',
    category: 'modern',
    bestFor: 'Brand / Marketing / Social roles',
    features: ['Centered masthead', 'Bronze rule', 'Chip skills', 'Editorial tone'],
    layoutType: 'one-column',
    layoutDescription: 'Single column with a centered masthead and a short accent rule.',
    tags: ['social', 'editorial', 'centered', 'brand', 'modern'],
    Component: SocialTemplate,
  },
  {
    id: 'tim',
    label: 'Tim',
    description: 'Slim left ivory rail keeps contact and skills apart from a clean narrative column.',
    category: 'modern',
    bestFor: 'Knowledge workers / Consultants / General professionals',
    features: ['Slim rail', 'Inset panel', 'Underline headings', 'Space efficient'],
    layoutType: 'sidebar',
    layoutDescription: 'Slim inset left rail with contact and skills beside a clean main column.',
    tags: ['tim', 'slim-rail', 'modern', 'clean', 'compact-rail'],
    Component: TimTemplate,
  },
  {
    id: 'mark',
    label: 'Mark',
    description: 'Centered serif masthead over a bronze hairline, with one calm column of content.',
    category: 'professional',
    bestFor: 'Senior individual contributors / Founders / Writers',
    features: ['Serif masthead', 'Bronze hairline', 'Centered header', 'Calm tone'],
    layoutType: 'one-column',
    layoutDescription: 'Centered serif header over a single column.',
    tags: ['mark', 'serif', 'centered', 'classic', 'professional'],
    Component: MarkTemplate,
  },
  {
    id: 'shelah',
    label: 'Shelah',
    description: 'Dark full-bleed left rail carries identity and stack; bar headings lead the main column.',
    category: 'developer',
    bestFor: 'Design / Frontend / Product engineers',
    features: ['Dark rail', 'Bar headings', 'Full-bleed identity', 'Modern'],
    layoutType: 'sidebar',
    layoutDescription: 'Dark full-bleed left rail with bar-heading main column.',
    tags: ['shelah', 'dark', 'sidebar', 'modern', 'developer'],
    Component: ShelahTemplate,
  },
  {
    id: 'moon',
    label: 'Moon',
    description: 'Centered masthead with a right credentials rail and boxed section labels.',
    category: 'creative',
    bestFor: 'Creative professionals / Freelancers / Portfolio roles',
    features: ['Centered header', 'Right rail', 'Boxed labels', 'Creative'],
    layoutType: 'sidebar',
    layoutDescription: 'Centered header with a narrow right credentials rail.',
    tags: ['moon', 'right-rail', 'boxed', 'creative', 'centered'],
    Component: MoonTemplate,
  },
  {
    id: 'max',
    label: 'Max',
    description: 'Strong left-aligned masthead with a header rule and timeline-style experience.',
    category: 'professional',
    bestFor: 'Senior managers / Team leads / Operations',
    features: ['Strong header', 'Timeline experience', 'Left aligned', 'Leadership'],
    layoutType: 'one-column',
    layoutDescription: 'Left-aligned masthead with a rule and a vertical timeline for experience.',
    tags: ['max', 'timeline', 'strong-header', 'professional', 'leadership'],
    Component: MaxTemplate,
  },
  {
    id: 'lana',
    label: 'Lana',
    description: 'Wide left sidebar carries identity, skills and certifications; the story flows in the main column.',
    category: 'professional',
    bestFor: 'Multi-disciplinary professionals / Generalists',
    features: ['Wide rail', 'Skills in rail', 'Split body', 'Balanced'],
    layoutType: 'sidebar',
    layoutDescription: 'Wide left sidebar with identity, skills and certifications.',
    tags: ['lana', 'wide-rail', 'split-body', 'professional', 'balanced'],
    Component: LanaTemplate,
  },
  {
    id: 'timeless',
    label: 'Timeless',
    description: 'Serif, centered masthead with a double rule and quiet ruled sections — and a lot of air.',
    category: 'professional',
    bestFor: 'Executive / Legal / Consulting / C-suite',
    features: ['Serif type', 'Double rule', 'Centered header', 'Spacious'],
    layoutType: 'one-column',
    layoutDescription: 'Spacious single column with a centered serif masthead and double rule.',
    tags: ['timeless', 'serif', 'centered', 'executive', 'classic'],
    Component: TimelessTemplate,
  },
  {
    id: 'plain',
    label: 'Plain',
    description: 'Monospace, wide whitespace and quiet uppercase labels — nothing but the content.',
    category: 'modern',
    bestFor: 'Technical / Academic / Focused profiles',
    features: ['Mono type', 'Generous whitespace', 'Quiet labels', 'Content first'],
    layoutType: 'one-column',
    layoutDescription: 'Airy single column with monospace type and no rules or boxes.',
    tags: ['plain', 'mono', 'minimal', 'focused', 'quiet'],
    Component: PlainTemplate,
  },
  {
    id: 'blogger',
    label: 'Blogger',
    description: 'Left stacked contact and skills rail with small-caps boxed labels and a narrative main column.',
    category: 'creative',
    bestFor: 'Content / Media / Writing / Social roles',
    features: ['Boxed labels', 'Stacked rail', 'Narrative column', 'Content-led'],
    layoutType: 'sidebar',
    layoutDescription: 'Inset left rail with stacked contact and skills, boxed labels in the main column.',
    tags: ['blogger', 'boxed', 'creative', 'content', 'rail'],
    Component: BloggerTemplate,
  },
  {
    id: 'pacific',
    label: 'Pacific',
    description: 'Tinted left panel for skills and certifications with rule headings and a calm main column.',
    category: 'creative',
    bestFor: 'Brand / Product / Communications roles',
    features: ['Tinted panel', 'Rule headings', 'Sidebar skills', 'Calm tone'],
    layoutType: 'two-column',
    layoutDescription: 'Split body with a tinted left panel for skills and certifications.',
    tags: ['pacific', 'tinted-panel', 'rule-headings', 'creative', 'calm'],
    Component: PacificTemplate,
  },
  {
    id: 'comic',
    label: 'Comic',
    description: 'Bold header rule, chip skills and two flowing columns — expressive but still A4-professional.',
    category: 'creative',
    bestFor: 'Design / Marketing / Creative technologists',
    features: ['Bold header rule', 'Chip skills', 'Two columns', 'Expressive'],
    layoutType: 'two-column',
    layoutDescription: 'Bold header rule over two flowing columns with chip skills.',
    tags: ['comic', 'bold', 'chips', 'creative', 'two-column'],
    Component: ComicTemplate,
  },
  {
    id: 'kaly',
    label: 'Kaly',
    description: 'Centered masthead with a right narrow rail and numbered sections down the main column.',
    category: 'modern',
    bestFor: 'Analysts / Researchers / Structured professionals',
    features: ['Numbered sections', 'Right rail', 'Centered header', 'Structured'],
    layoutType: 'sidebar',
    layoutDescription: 'Centered header with a narrow right rail and numbered sections.',
    tags: ['kaly', 'numbered', 'right-rail', 'modern', 'structured'],
    Component: KalyTemplate,
  },
  {
    id: 'mula',
    label: 'Mula',
    description: 'Accent-bar headings across a two-column main body with a right rail for skills and certifications.',
    category: 'modern',
    bestFor: 'General professionals / Consultants / Analysts',
    features: ['Bar headings', 'Right rail', 'Two-column body', 'Modern'],
    layoutType: 'sidebar',
    layoutDescription: 'Two-column main body with accent bars and a right rail.',
    tags: ['mula', 'bar-headings', 'right-rail', 'modern', 'two-column'],
    Component: MulaTemplate,
  },
  {
    id: 'bela',
    label: 'Bela',
    description: 'Centered masthead over a left narrow rail with boxed skill chips down the page.',
    category: 'creative',
    bestFor: 'Design / Brand / Creative professionals',
    features: ['Centered header', 'Boxed chips', 'Left rail', 'Creative'],
    layoutType: 'sidebar',
    layoutDescription: 'Centered header with a left narrow rail and boxed skill chips.',
    tags: ['bela', 'boxed-chips', 'left-rail', 'creative', 'centered'],
    Component: BelaTemplate,
  },
  {
    id: 'general-ats',
    label: 'General ATS',
    description: 'The plainest, most readable structure: one column, no graphics, quiet labels.',
    category: 'professional',
    bestFor: 'Any role — maximum ATS readability',
    features: ['Plain structure', 'No graphics', 'High readability', 'Simple hierarchy'],
    layoutType: 'one-column',
    layoutDescription: 'Bare single column with quiet section labels and no rules or boxes.',
    tags: ['general-ats', 'ats', 'plain', 'readable', 'simple'],
    Component: GeneralAtsTemplate,
  },
  {
    id: 'freshman',
    label: 'Fresh Man',
    description: 'Centered header over a wide left column that promotes education and projects to the front.',
    category: 'student',
    bestFor: 'Students / New graduates / Entry level',
    features: ['Education first', 'Project column', 'Centered header', 'Entry level'],
    layoutType: 'sidebar',
    layoutDescription: 'Centered header, then a wide left column for education and projects.',
    tags: ['freshman', 'student', 'education-first', 'projects', 'entry-level'],
    Component: FreshmanTemplate,
  },
  {
    id: 'graphic',
    label: 'Graphic',
    description: 'Expressive asymmetric header, wide tinted left rail and project cards in the main column.',
    category: 'creative',
    bestFor: 'Graphic Design / UI / Visual Design',
    features: ['Asymmetric header', 'Tinted rail', 'Project cards', 'Visual hierarchy'],
    layoutType: 'sidebar',
    layoutDescription: 'Wide tinted left rail with asymmetric header and project cards.',
    tags: ['graphic', 'asymmetric', 'project-cards', 'creative', 'visual'],
    Component: GraphicTemplate,
  },
];

/** Gallery filter pills, derived from the template categories. */
export const ALL_CATEGORIES: { value: TemplateCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'professional', label: 'Professional' },
  { value: 'modern', label: 'Modern' },
  { value: 'creative', label: 'Creative' },
  { value: 'developer', label: 'Developer' },
  { value: 'academic', label: 'Academic' },
  { value: 'executive', label: 'Executive' },
  { value: 'student', label: 'Student' },
];

/** Counts templates per category — used by the Templates page so numbers are live. */
export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = { all: TEMPLATE_REGISTRY.length };
  for (const t of TEMPLATE_REGISTRY) {
    counts[t.category] = (counts[t.category] ?? 0) + 1;
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

/**
 * Career-oriented groupings used by the onboarding design step.
 * Each group lists template ids explicitly (no fuzzy matching), so a group can
 * never silently resolve to an unintended design.
 */
export interface DesignCollection {
  id: string;
  label: string;
  blurb: string;
  templates: ResumeData['template'][];
}

export const DESIGN_COLLECTIONS: DesignCollection[] = [
  {
    id: 'all',
    label: 'All',
    blurb: 'Every design in the gallery.',
    templates: TEMPLATE_REGISTRY.map((t) => t.id),
  },
  {
    id: 'professional',
    label: 'Professional',
    blurb: 'Balanced, recruiter-friendly layouts for most roles.',
    templates: ['professional', 'modern', 'corporate', 'elegant', 'ats-classic', 'international', 'compact', 'mark', 'max', 'lana', 'timeless', 'general-ats'],
  },
  {
    id: 'modern',
    label: 'Modern',
    blurb: 'Contemporary layouts with clean typography.',
    templates: ['modern', 'startup', 'tech', 'two-column', 'minimal', 'social', 'tim', 'plain', 'kaly', 'mula'],
  },
  {
    id: 'minimal',
    label: 'Minimal',
    blurb: 'Quiet, whitespace-first designs that let content lead.',
    templates: ['minimal', 'ats-classic', 'compact', 'elegant'],
  },
  {
    id: 'creative',
    label: 'Creative',
    blurb: 'Expressive designs with strong visual hierarchy.',
    templates: ['creative', 'portfolio', 'marketing', 'designer', 'startup', 'moon', 'blogger', 'pacific', 'comic', 'bela', 'graphic'],
  },
  {
    id: 'engineering',
    label: 'Engineering',
    blurb: 'Structured layouts that surface skills and technical depth.',
    templates: ['engineering', 'tech', 'developer'],
  },
  {
    id: 'finance',
    label: 'Finance',
    blurb: 'Conservative, formal formats for finance and banking.',
    templates: ['finance', 'corporate', 'professional', 'consultant'],
  },
  {
    id: 'academic',
    label: 'Academic',
    blurb: 'Publication- and research-friendly formats.',
    templates: ['academic', 'research', 'student', 'plain'],
  },
  {
    id: 'designer',
    label: 'Designer',
    blurb: 'Visual layouts for UI, UX and graphic designers.',
    templates: ['designer', 'portfolio', 'creative', 'two-column', 'graphic', 'shelah', 'moon', 'bela'],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    blurb: 'Bold, metrics-forward layouts for marketing roles.',
    templates: ['marketing', 'creative', 'startup'],
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    blurb: 'Clinical experience and credentials up front.',
    templates: ['healthcare', 'professional', 'international'],
  },
  {
    id: 'legal',
    label: 'Legal',
    blurb: 'Traditional, formal formatting for legal roles.',
    templates: ['legal', 'professional', 'executive'],
  },
  {
    id: 'executive',
    label: 'Executive',
    blurb: 'Authority-forward designs for leadership roles.',
    templates: ['executive', 'consultant', 'corporate', 'finance'],
  },
];

/** Resolves a design collection to definitions, skipping any unknown id. */
export function getCollectionTemplates(collection: DesignCollection): TemplateDefinition[] {
  return collection.templates
    .map((id) => TEMPLATE_REGISTRY.find((t) => t.id === id))
    .filter((t): t is TemplateDefinition => Boolean(t));
}
