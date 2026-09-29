import { Fragment, type ReactNode } from 'react';
import {
  type Certification,
  type Education,
  type Experience,
  type PersonalInfo,
  type Project,
  type ResumeData,
  type SectionId,
} from '@/types/resume';
import { resolveSectionOrder, isSectionHidden } from '@/lib/sections';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   ACCENT SYSTEM

   Each template picks ONE accent family. The literal Tailwind class strings
   live here (never interpolated) so the JIT compiler can always see them.
   Colours stay printable — no neon, no glow, no gradients.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface Accent {
  /** Accent text colour (headings, keywords). */
  text: string;
  /** Soft tinted background (chips, callouts). */
  soft: string;
  /** Accent border colour. */
  border: string;
  /** Solid accent background (bars, boxes, sidebars). */
  bg: string;
  /** Text colour that reads on `bg`. */
  onAccent: string;
  /** Muted body text. */
  muted: string;
}

export const ACCENTS = {
  charcoal: {
    text: 'text-zinc-900', soft: 'bg-zinc-100', border: 'border-zinc-300',
    bg: 'bg-zinc-900', onAccent: 'text-white', muted: 'text-zinc-500',
  },
  navy: {
    text: 'text-blue-900', soft: 'bg-blue-50', border: 'border-blue-200',
    bg: 'bg-blue-900', onAccent: 'text-white', muted: 'text-slate-500',
  },
  steel: {
    text: 'text-slate-800', soft: 'bg-slate-100', border: 'border-slate-300',
    bg: 'bg-slate-800', onAccent: 'text-white', muted: 'text-slate-500',
  },
  forest: {
    text: 'text-emerald-900', soft: 'bg-emerald-50', border: 'border-emerald-200',
    bg: 'bg-emerald-900', onAccent: 'text-emerald-50', muted: 'text-stone-500',
  },
  teal: {
    text: 'text-teal-900', soft: 'bg-teal-50', border: 'border-teal-200',
    bg: 'bg-teal-800', onAccent: 'text-teal-50', muted: 'text-slate-500',
  },
  burgundy: {
    text: 'text-rose-900', soft: 'bg-rose-50', border: 'border-rose-200',
    bg: 'bg-rose-900', onAccent: 'text-rose-50', muted: 'text-stone-500',
  },
  gold: {
    text: 'text-amber-800', soft: 'bg-amber-50', border: 'border-amber-200',
    bg: 'bg-amber-700', onAccent: 'text-amber-50', muted: 'text-stone-500',
  },
  blue: {
    text: 'text-sky-800', soft: 'bg-sky-50', border: 'border-sky-200',
    bg: 'bg-sky-700', onAccent: 'text-white', muted: 'text-slate-500',
  },
  plum: {
    text: 'text-fuchsia-900', soft: 'bg-fuchsia-50', border: 'border-fuchsia-200',
    bg: 'bg-fuchsia-900', onAccent: 'text-fuchsia-50', muted: 'text-stone-500',
  },
  mono: {
    text: 'text-zinc-800', soft: 'bg-zinc-100', border: 'border-zinc-300',
    bg: 'bg-zinc-800', onAccent: 'text-zinc-50', muted: 'text-zinc-400',
  },
} as const satisfies Record<string, Accent>;

export type AccentName = keyof typeof ACCENTS;

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

/** Visible, ordered content sections (everything except the personal header). */
export function orderedSections(data: ResumeData): SectionId[] {
  return resolveSectionOrder(data).filter((id) => id !== 'personal' && !isSectionHidden(data, id));
}

/** True when a section should be hidden by the user. */
export function hidden(data: ResumeData, id: SectionId): boolean {
  return isSectionHidden(data, id);
}

/**
 * Renders each visible section in the user's order via a per-id renderer.
 * A renderer returning `null`/`false` skips the section entirely.
 */
export function Sections({
  data,
  render,
}: {
  data: ResumeData;
  render: (id: SectionId) => ReactNode;
}) {
  return (
    <>
      {orderedSections(data).map((id) => {
        const node = render(id);
        return node ? <Fragment key={id}>{node}</Fragment> : null;
      })}
    </>
  );
}

export interface SectionRenderConfig {
  heading: HeadingVariant;
  experience?: ExperienceVariant;
  education?: EducationVariant;
  projects?: ProjectVariant;
  skills?: SkillVariant;
  certifications?: CertVariant;
  /** Prefix each heading with an incrementing number ("01 / EXPERIENCE"). */
  numbered?: boolean;
  /** Vertical gap between sections. */
  gap?: string;
}

/**
 * Renders the standard content sections in the user's order, using one shared
 * configuration object. Templates vary the *configuration* (heading treatment,
 * item layout, placement) — not this plumbing.
 */
export function SectionBlocks({
  data,
  accent,
  config,
  omit = [],
}: {
  data: ResumeData;
  accent: Accent;
  config: SectionRenderConfig;
  omit?: SectionId[];
}) {
  let n = 0;
  const gap = config.gap ?? 'mb-3';
  const wrap = (title: string, body: ReactNode) => (
    <Block title={title} index={config.numbered ? ++n : undefined} heading={config.heading} accent={accent} className={gap}>
      {body}
    </Block>
  );

  return (
    <Sections
      data={data}
      render={(id) => {
        if (omit.includes(id)) return null;
        switch (id) {
          case 'experience':
            return data.experience.length > 0 ? wrap('Experience', <ExperienceList items={data.experience} variant={config.experience} accent={accent} />) : null;
          case 'education':
            return data.education.length > 0 ? wrap('Education', <EducationList items={data.education} variant={config.education} accent={accent} />) : null;
          case 'skills':
            return data.skills.length > 0 ? wrap('Skills', <SkillList skills={data.skills} variant={config.skills} accent={accent} />) : null;
          case 'projects':
            return data.projects.length > 0 ? wrap('Projects', <ProjectList items={data.projects} variant={config.projects} accent={accent} />) : null;
          case 'certifications':
            return data.certifications.length > 0 ? wrap('Certifications', <CertificationList items={data.certifications} variant={config.certifications} accent={accent} />) : null;
          default:
            return null;
        }
      }}
    />
  );
}

export function dateRange(start: string, end: string, current: boolean): string {
  const e = current ? 'Present' : end;
  if (start && e) return `${start} – ${e}`;
  return start || e || '';
}

export function contactItems(p: PersonalInfo): { key: string; value: string }[] {
  return [
    { key: 'email', value: p.email },
    { key: 'phone', value: p.phone },
    { key: 'location', value: p.location },
    { key: 'website', value: p.website },
    { key: 'linkedin', value: p.linkedin },
    { key: 'github', value: p.github },
  ].filter((i) => i.value.trim().length > 0);
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION HEADINGS

   Eight genuinely different treatments — a template picks one so headings are
   never the same across designs.
   ═══════════════════════════════════════════════════════════════════════════ */

export type HeadingVariant =
  | 'rule'       // uppercase + full-width rule
  | 'underline'  // uppercase + short accent underline
  | 'bar'        // accent bar to the left
  | 'plain'      // quiet uppercase, no rule
  | 'numbered'   // "01 / TITLE" with rule
  | 'boxed'      // title inside a filled accent box
  | 'serif'      // serif small-caps with double rule
  | 'side';      // light heading for dark sidebars

export function Heading({
  title,
  index,
  variant,
  accent,
  className,
  titleClass,
}: {
  title: string;
  index?: number;
  variant: HeadingVariant;
  accent: Accent;
  className?: string;
  titleClass?: string;
}) {
  // Uppercase variants carry the casing in the text itself (not only in CSS),
  // so the rendered document semantics match the visual treatment.
  const label = variant === 'serif' ? title : title.toUpperCase();
  const num = typeof index === 'number' ? String(index).padStart(2, '0') : undefined;

  switch (variant) {
    case 'rule':
      return (
        <h2 className={cn('text-[11px] font-bold uppercase tracking-[0.14em] border-b pb-0.5 mb-1.5', accent.text, accent.border, titleClass, className)}>
          {label}
        </h2>
      );
    case 'underline':
      return (
        <h2 className={cn('mb-1.5', className)}>
          <span className={cn('inline-block text-[11px] font-bold uppercase tracking-[0.16em] pb-1 border-b-2', accent.text, accent.border, titleClass)}>
            {label}
          </span>
        </h2>
      );
    case 'bar':
      return (
        <h2 className={cn('flex items-center gap-2 mb-1.5', className)}>
          <span className={cn('h-3.5 w-[3px] rounded-full', accent.bg)} />
          <span className={cn('text-[11px] font-bold uppercase tracking-[0.12em]', accent.text, titleClass)}>{label}</span>
        </h2>
      );
    case 'plain':
      return (
        <h2 className={cn('text-[10px] font-semibold uppercase tracking-[0.24em] mb-1.5', accent.muted, titleClass, className)}>
          {label}
        </h2>
      );
    case 'numbered':
      return (
        <h2 className={cn('flex items-baseline gap-2 mb-2', className)}>
          {num && <span className={cn('text-[10px] font-bold tabular-nums', accent.text)}>{num}</span>}
          <span className={cn('text-[12px] font-bold uppercase tracking-[0.1em] flex-1', accent.text, titleClass)}>{label}</span>
          <span className={cn('flex-1 border-t', accent.border)} />
        </h2>
      );
    case 'boxed':
      return (
        <h2 className={cn('inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] mb-1.5 rounded-sm', accent.bg, accent.onAccent, titleClass, className)}>
          {label}
        </h2>
      );
    case 'serif':
      return (
        <h2 className={cn('mb-1.5 border-b border-double border-b-2 pb-0.5', accent.border, className)}>
          <span className={cn('font-resume-serif text-[12px] font-semibold tracking-wide', accent.text, titleClass)}>{label}</span>
        </h2>
      );
    case 'side':
      return (
        <h2 className={cn('text-[9.5px] font-bold uppercase tracking-[0.2em] mb-1.5 opacity-90', titleClass, className)}>
          {label}
        </h2>
      );
  }
}

/** A titled section: heading + content, kept together across page breaks. */
export function Block({
  title,
  index,
  heading,
  accent,
  children,
  className,
}: {
  title: string;
  index?: number;
  heading: HeadingVariant;
  accent: Accent;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('break-inside-avoid', className)}>
      <Heading title={title} index={index} variant={heading} accent={accent} />
      {children}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONTACT RENDERERS
   ═══════════════════════════════════════════════════════════════════════════ */

export type ContactVariant = 'dot' | 'pipes' | 'stacked' | 'slash';

export function Contact({
  p,
  variant = 'dot',
  className,
  itemClass,
}: {
  p: PersonalInfo;
  variant?: ContactVariant;
  className?: string;
  itemClass?: string;
}) {
  const items = contactItems(p);
  if (items.length === 0) return null;

  if (variant === 'stacked') {
    return (
      <div className={cn('space-y-0.5', className)}>
        {items.map((i) => (
          <div key={i.key} className={cn('break-words', itemClass)}>{i.value}</div>
        ))}
      </div>
    );
  }

  const sep = variant === 'pipes' ? ' | ' : variant === 'slash' ? ' / ' : ' · ';
  return (
    <div className={cn('flex flex-wrap items-center gap-x-1.5 gap-y-0.5', className)}>
      {items.map((i, idx) => (
        <span key={i.key} className={cn('whitespace-nowrap', itemClass)}>
          {idx > 0 && <span className={cn('mr-1.5 opacity-50')}>{sep.trim()}</span>}
          {i.value}
        </span>
      ))}
    </div>
  );
}

/** A single summary paragraph, styled per template. */
export function Summary({ text, className }: { text: string; className?: string }) {
  if (!text.trim()) return null;
  return <p className={cn('leading-relaxed', className)}>{text.trim()}</p>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXPERIENCE
   ═══════════════════════════════════════════════════════════════════════════ */

export type ExperienceVariant = 'standard' | 'timeline' | 'compact' | 'split' | 'boxed';

export function ExperienceList({
  items,
  variant = 'standard',
  accent,
  className,
}: {
  items: Experience[];
  variant?: ExperienceVariant;
  accent: Accent;
  className?: string;
}) {
  const bullets = (list: string[], bulletClass: string) =>
    list.filter(Boolean).length > 0 ? (
      <ul className={cn('mt-1 space-y-0.5 list-disc ml-3.5 marker:opacity-60', className)}>
        {list.filter(Boolean).map((b, i) => (
          <li key={i} className={cn('pl-0.5', bulletClass)}>{b}</li>
        ))}
      </ul>
    ) : null;

  return (
    <div className={cn(variant === 'timeline' && 'pl-1', '')}>
      {items.map((exp) => {
        const dates = dateRange(exp.startDate, exp.endDate, exp.current);

        if (variant === 'timeline') {
          return (
            <div key={exp.id} className="relative pl-4 pb-2.5 last:pb-0 break-inside-avoid">
              <span className={cn('absolute left-0 top-1 h-1.5 w-1.5 rounded-full', accent.bg)} />
              <span className={cn('absolute left-[2.5px] top-3 bottom-0 w-px', accent.border, 'border-l')} />
              <div className="flex justify-between items-baseline gap-2">
                <span className="font-semibold text-[11px]">{exp.position}</span>
                <span className={cn('text-[9.5px] shrink-0 tabular-nums', accent.muted)}>{dates}</span>
              </div>
              {(exp.company || exp.location) && (
                <div className={cn('text-[10px]', accent.text)}>
                  {exp.company}{exp.company && exp.location && ' · '}{exp.location}
                </div>
              )}
              {bullets(exp.bullets, '')}
            </div>
          );
        }

        if (variant === 'compact') {
          return (
            <div key={exp.id} className="mb-1.5 last:mb-0 break-inside-avoid">
              <div className="flex justify-between items-baseline gap-2">
                <span className="font-semibold">{exp.position}{exp.company && <span className={cn('font-normal', accent.muted)}>, {exp.company}</span>}</span>
                <span className={cn('text-[9px] shrink-0 tabular-nums', accent.muted)}>{dates}</span>
              </div>
              {exp.bullets.filter(Boolean).length > 0 && (
                <p className={cn('mt-0.5 leading-snug', accent.muted)}>{exp.bullets.filter(Boolean).join(' · ')}</p>
              )}
            </div>
          );
        }

        if (variant === 'split') {
          return (
            <div key={exp.id} className="mb-2.5 last:mb-0 break-inside-avoid">
              <div className="font-semibold">{exp.company}{exp.location && <span className={cn('font-normal', accent.muted)}> — {exp.location}</span>}</div>
              <div className={cn('text-[10.5px] italic font-medium', accent.text)}>
                {exp.position}
                {dates && <span className={cn('not-italic font-normal', accent.muted)}> · {dates}</span>}
              </div>
              {bullets(exp.bullets, '')}
            </div>
          );
        }

        if (variant === 'boxed') {
          return (
            <div key={exp.id} className={cn('mb-2 last:mb-0 rounded-sm px-2.5 py-1.5 break-inside-avoid', accent.soft)}>
              <div className="flex justify-between items-baseline gap-2">
                <span className="font-semibold">{exp.position}</span>
                <span className={cn('text-[9.5px] shrink-0', accent.text)}>{dates}</span>
              </div>
              {(exp.company || exp.location) && (
                <div className={cn('text-[10px]', accent.muted)}>
                  {[exp.company, exp.location].filter(Boolean).join(' · ')}
                </div>
              )}
              {bullets(exp.bullets, '')}
            </div>
          );
        }

        // standard
        return (
          <div key={exp.id} className="mb-2.5 last:mb-0 break-inside-avoid">
            <div className="flex justify-between items-baseline gap-2">
              <span className="font-semibold">{exp.position}{exp.company && <span className={cn('font-normal', accent.muted)}> · {exp.company}</span>}</span>
              <span className={cn('text-[9.5px] shrink-0 tabular-nums', accent.muted)}>{dates}</span>
            </div>
            {exp.location && <div className={cn('text-[9.5px]', accent.muted)}>{exp.location}</div>}
            {bullets(exp.bullets, '')}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EDUCATION
   ═══════════════════════════════════════════════════════════════════════════ */

export type EducationVariant = 'standard' | 'compact' | 'stacked' | 'twoline';

export function EducationList({
  items,
  variant = 'standard',
  accent,
  className,
}: {
  items: Education[];
  variant?: EducationVariant;
  accent: Accent;
  className?: string;
}) {
  return (
    <div className={className}>
      {items.map((edu) => {
        const dates = dateRange(edu.startDate, edu.endDate, false);
        const programme = [edu.degree, edu.field].filter(Boolean).join(edu.degree && edu.field ? ' in ' : '');

        if (variant === 'compact') {
          return (
            <div key={edu.id} className="mb-1 last:mb-0 break-inside-avoid">
              <span className="font-semibold">{edu.school}</span>
              {programme && <span className={cn('font-normal', accent.muted)}>, {programme}</span>}
              {edu.gpa && <span className={cn('text-[9px]', accent.muted)}> · GPA {edu.gpa}</span>}
              {dates && <span className={cn('text-[9px] ml-1.5', accent.muted)}>{dates}</span>}
            </div>
          );
        }

        if (variant === 'twoline') {
          return (
            <div key={edu.id} className="mb-1.5 last:mb-0 break-inside-avoid">
              <div className="flex justify-between items-baseline gap-2">
                <span className="font-semibold">{edu.school}</span>
                <span className={cn('text-[9px] shrink-0 tabular-nums', accent.muted)}>{dates}</span>
              </div>
              <div className={cn('text-[10px]', accent.text)}>
                {programme}{edu.gpa && <span className={cn('font-normal', accent.muted)}> · GPA {edu.gpa}</span>}
              </div>
              {edu.description && <p className={cn('mt-0.5', accent.muted)}>{edu.description}</p>}
            </div>
          );
        }

        if (variant === 'stacked') {
          return (
            <div key={edu.id} className="mb-2 last:mb-0 break-inside-avoid">
              <div className={cn('text-[9px] font-medium uppercase tracking-wide', accent.muted)}>{dates}</div>
              <div className="font-semibold">{edu.school}</div>
              {programme && <div className={cn('text-[10px]', accent.text)}>{programme}</div>}
              {edu.gpa && <div className={cn('text-[9.5px]', accent.muted)}>GPA {edu.gpa}</div>}
              {edu.description && <p className={cn('mt-0.5', accent.muted)}>{edu.description}</p>}
            </div>
          );
        }

        // standard
        return (
          <div key={edu.id} className="mb-1.5 last:mb-0 break-inside-avoid">
            <div className="flex flex-wrap justify-between items-baseline gap-x-2">
              <span className="font-semibold">{edu.school}</span>
              <span className={cn('text-[9px] shrink-0 ml-auto tabular-nums', accent.muted)}>{dates}</span>
            </div>
            {programme && (
              <div className={cn('text-[10.5px]', accent.text)}>
                {programme}{edu.gpa && <span className={cn('font-normal', accent.muted)}> · GPA {edu.gpa}</span>}
              </div>
            )}
            {!programme && edu.gpa && <div className={cn('text-[9.5px]', accent.muted)}>GPA {edu.gpa}</div>}
            {edu.description && <p className={cn('mt-0.5', accent.muted)}>{edu.description}</p>}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROJECTS
   ═══════════════════════════════════════════════════════════════════════════ */

export type ProjectVariant = 'list' | 'cards' | 'inline';

export function ProjectList({
  items,
  variant = 'list',
  accent,
  className,
}: {
  items: Project[];
  variant?: ProjectVariant;
  accent: Accent;
  className?: string;
}) {
  if (variant === 'cards') {
    return (
      <div className={cn('grid grid-cols-2 gap-1.5', className)}>
        {items.map((proj) => (
          <div key={proj.id} className={cn('rounded-sm p-1.5 break-inside-avoid', accent.soft)}>
            <div className="flex items-baseline gap-1">
              <span className="font-semibold text-[10.5px]">{proj.name}</span>
            </div>
            {proj.technologies && <div className={cn('text-[8.5px] font-medium', accent.text)}>{proj.technologies}</div>}
            {proj.description && <p className={cn('mt-0.5 leading-snug', accent.muted)}>{proj.description}</p>}
            {proj.link && <div className={cn('text-[8.5px] mt-0.5 break-all', accent.muted)}>{proj.link}</div>}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn('space-y-1', className)}>
        {items.map((proj) => (
          <div key={proj.id} className="break-inside-avoid">
            <span className="font-semibold">{proj.name}</span>
            {proj.technologies && <span className={cn('font-medium', accent.text)}> — {proj.technologies}</span>}
            {proj.description && <span className={cn(' ', accent.muted)}> — {proj.description}</span>}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {items.map((proj) => (
        <div key={proj.id} className="break-inside-avoid">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold">{proj.name}</span>
            {proj.link && <span className={cn('text-[9px] break-all', accent.muted)}>{proj.link}</span>}
          </div>
          {proj.technologies && <div className={cn('text-[9px] italic', accent.text)}>{proj.technologies}</div>}
          {proj.description && <p className={cn('mt-0.5', accent.muted)}>{proj.description}</p>}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SKILLS
   ═══════════════════════════════════════════════════════════════════════════ */

export type SkillVariant = 'inline' | 'bullets' | 'chips' | 'grid' | 'sidebar';

export function SkillList({
  skills,
  variant = 'inline',
  accent,
  className,
}: {
  skills: string[];
  variant?: SkillVariant;
  accent: Accent;
  className?: string;
}) {
  if (skills.length === 0) return null;

  if (variant === 'bullets') {
    return (
      <ul className={cn('space-y-0.5', className)}>
        {skills.map((s, i) => (
          <li key={i} className="flex gap-1.5 items-start">
            <span className={cn('mt-[3px] h-1 w-1 rounded-full shrink-0', accent.bg)} />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (variant === 'chips') {
    return (
      <div className={cn('flex flex-wrap gap-1', className)}>
        {skills.map((s, i) => (
          <span key={i} className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-medium', accent.soft, accent.text)}>{s}</span>
        ))}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={cn('grid grid-cols-3 gap-x-2 gap-y-0.5', className)}>
        {skills.map((s, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className={cn('h-1 w-1 rounded-full shrink-0', accent.bg)} />
            <span className="truncate">{s}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className={cn('space-y-0.5', className)}>
        {skills.map((s, i) => (
          <div key={i} className="flex gap-1.5 items-start">
            <span className="opacity-60">•</span>
            <span>{s}</span>
          </div>
        ))}
      </div>
    );
  }

  return <p className={className}>{skills.join(' · ')}</p>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CERTIFICATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

export type CertVariant = 'list' | 'inline' | 'grid';

export function CertificationList({
  items,
  variant = 'list',
  accent,
  className,
}: {
  items: Certification[];
  variant?: CertVariant;
  accent: Accent;
  className?: string;
}) {
  if (items.length === 0) return null;

  if (variant === 'inline') {
    return (
      <p className={className}>
        {items.map((c, i) => (
          <span key={c.id}>
            {i > 0 && <span className={cn('mx-1 opacity-40')}>·</span>}
            <span className="font-medium">{c.name}</span>
            {c.issuer && <span className={accent.muted}> — {c.issuer}</span>}
            {c.date && <span className={accent.muted}> ({c.date})</span>}
          </span>
        ))}
      </p>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={cn('grid grid-cols-2 gap-x-3 gap-y-0.5', className)}>
        {items.map((c) => (
          <div key={c.id} className="flex justify-between gap-2 break-inside-avoid">
            <span className="font-medium truncate">{c.name}</span>
            {c.date && <span className={cn('shrink-0 tabular-nums', accent.muted)}>{c.date}</span>}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-0.5', className)}>
      {items.map((c) => (
        <div key={c.id} className="flex justify-between gap-2 break-inside-avoid">
          <span>
            <span className="font-medium">{c.name}</span>
            {c.issuer && <span className={accent.muted}> — {c.issuer}</span>}
          </span>
          {c.date && <span className={cn('shrink-0 tabular-nums', accent.muted)}>{c.date}</span>}
        </div>
      ))}
    </div>
  );
}
