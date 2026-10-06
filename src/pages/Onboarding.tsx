import { useCallback, useMemo, useRef, useState, useEffect, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useResume } from '@/context/ResumeContext';
import {
  DESIGN_COLLECTIONS,
  getCollectionTemplates,
  getTemplate,
  type TemplateDefinition,
} from '@/lib/templateRegistry';
import { getSampleResume } from '@/lib/sampleResume';
import {
  EMPTY_PERSONAL_DETAILS,
  createEmptyEducationDraft,
  validatePersonalDetails,
  validateBackground,
  type BackgroundDetails,
  type PersonalDetails,
  type PersonalDetailsErrors,
  type PersonalDetailsField,
} from '@/lib/onboarding';
import {
  loadOnboardingDraft,
  syncOnboardingDraft,
  clearOnboardingDraft,
} from '@/lib/onboardingDraft';
import { type TemplateType, type ResumeData, createEmptyResume, ALL_TEMPLATE_TYPES } from '@/types/resume';
import ResumeThumbnail from '@/components/ResumeThumbnail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2, Eye,
  User, Mail, Phone, MapPin, Briefcase, AlertCircle,
  Linkedin, Globe, GraduationCap, Code2, Award, ListChecks, Plus, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Progress indicator ─────────────────────────────────────────────────── */

const STEPS = [
  { id: 1, label: 'Personal Information', hint: 'Who you are' },
  { id: 2, label: 'Professional Info', hint: 'Your summary' },
  { id: 3, label: 'Background', hint: 'Experience & skills' },
  { id: 4, label: 'Choose Design', hint: 'How it looks' },
  { id: 5, label: 'Build Resume', hint: 'Ready to edit' },
] as const;

function ProgressIndicator({ current, onStepClick }: { current: number; onStepClick: (step: number) => void }) {
  // The bar fills alongside the step change, so "how much is left" is legible
  // at a glance even before reading a single label.
  const progress = ((current - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="space-y-3.5">
      <div className="h-[3px] overflow-hidden rounded-full bg-muted" aria-hidden>
        <div
          className="h-full rounded-full bg-foreground transition-[width] duration-500 ease-premium"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="flex items-center gap-1 sm:gap-2 w-full" aria-label="Progress">
        {STEPS.map((step, i) => {
          const state = step.id < current ? 'done' : step.id === current ? 'current' : 'upcoming';
          const canJump = step.id < current;
          return (
            <li key={step.id} className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
              <button
                type="button"
                onClick={() => canJump && onStepClick(step.id)}
                disabled={!canJump}
                aria-current={state === 'current' ? 'step' : undefined}
                className={cn(
                  'flex w-full min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors duration-150',
                  canJump && 'cursor-pointer hover:bg-muted/60',
                  !canJump && 'cursor-default',
                )}
              >
                {/* Keyed on the step state so the badge pops each time it changes. */}
                <span
                  key={state}
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium tabular-nums',
                    state === 'done' && 'bg-success border-success text-success-foreground',
                    state === 'current' && 'border-transparent bg-primary text-primary-foreground',
                    state === 'upcoming' && 'border-border text-muted-foreground',
                  )}
                >
                  {state === 'done' ? <Check className="h-3 w-3" /> : String(step.id).padStart(2, '0')}
                </span>
                <span className="min-w-0 hidden sm:block">
                  <span
                    className={cn(
                      'block text-xs font-medium transition-colors duration-200',
                      state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground',
                    )}
                  >
                    {step.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">{step.hint}</span>
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    'h-[2px] flex-1 min-w-3 shrink-0 rounded-full transition-colors duration-500',
                    step.id < current ? 'bg-foreground' : 'bg-border',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ── Step 1 — personal details ──────────────────────────────────────────── */

const DETAIL_FIELDS: {
  key: PersonalDetailsField;
  label: string;
  placeholder: string;
  icon: typeof User;
  required: boolean;
  autoComplete?: string;
  type?: string;
}[] = [
  { key: 'fullName', label: 'Full Name', placeholder: 'Jane Smith', icon: User, required: true, autoComplete: 'name' },
  { key: 'headline', label: 'Professional Title', placeholder: 'Senior Software Engineer', icon: Briefcase, required: false },
  { key: 'email', label: 'Email', placeholder: 'jane@example.com', icon: Mail, required: true, autoComplete: 'email', type: 'email' },
  { key: 'phone', label: 'Phone', placeholder: '+1 555 123 4567', icon: Phone, required: true, autoComplete: 'tel', type: 'tel' },
  { key: 'location', label: 'Location', placeholder: 'Austin, TX', icon: MapPin, required: false, autoComplete: 'address-level2' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/yourname', icon: Linkedin, required: false },
  { key: 'website', label: 'Portfolio / Website', placeholder: 'https://yourportfolio.com', icon: Globe, required: false },
];

function DetailsStep({
  details,
  errors,
  onChange,
  onSubmit,
}: {
  details: PersonalDetails;
  errors: PersonalDetailsErrors;
  onChange: (field: PersonalDetailsField, value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {DETAIL_FIELDS.map(({ key, label, placeholder, icon: Icon, required, autoComplete, type }) => {
          const error = errors[key];
          const inputId = `onboarding-${key}`;
          return (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={inputId} className="text-xs font-medium flex items-center gap-1.5">
                <Icon className="h-3 w-3 opacity-50" />
                {label}
                {required ? (
                  <span className="text-destructive" aria-hidden>*</span>
                ) : (
                  <span className="text-xs font-normal text-muted-foreground">Optional</span>
                )}
              </Label>
              <Input
                id={inputId}
                type={type ?? 'text'}
                autoComplete={autoComplete}
                value={details[key]}
                onChange={(e) => onChange(key, e.target.value)}
                placeholder={placeholder}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${inputId}-error` : undefined}
                className={cn(
                  'h-11 text-sm transition-colors',
                  error ? 'border-destructive/60 focus-visible:ring-destructive/30' : '',
                )}
              />
              {error && (
                <p id={`${inputId}-error`} className="flex items-start gap-1.5 text-xs text-destructive animate-fade-in">
                  <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Start with the essentials — a short professional summary and an optional background
        section come next, then you choose your design.
      </p>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>
        <Button type="submit" size="lg" className="h-11 gap-2 rounded-md px-6 text-sm font-medium">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

/* ── Shared field for the optional background steps ──────────────────── */

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id} className="text-xs font-medium">
        {label} <span className="text-xs font-normal text-muted-foreground">Optional</span>
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 text-sm"
      />
    </div>
  );
}

function BackgroundCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof User;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3.5 rounded-md border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-accent" />
        </span>
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="ml-auto text-xs text-muted-foreground">Optional</span>
      </div>
      {children}
    </div>
  );
}

/* ── Step 2 — professional summary ──────────────────────────────────── */

function SummaryStep({
  summary,
  onChange,
  onBack,
  onNext,
}: {
  summary: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
      noValidate
    >
      <div className="max-w-2xl space-y-1.5">
        <Label htmlFor="onboarding-summary" className="flex items-center gap-1.5 text-xs font-medium">
          Professional Summary
          <span className="text-xs font-normal text-muted-foreground">Optional</span>
        </Label>
        <Textarea
          id="onboarding-summary"
          rows={6}
          value={summary}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Two or three sentences on who you are, what you do best, and the impact you deliver."
          className="resize-y text-sm"
        />
        <p className="text-xs text-muted-foreground leading-relaxed">
          You can leave this for later — the AI assistant in the editor can draft or polish your
          summary, and every suggestion is reviewed by you before it lands.
        </p>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <Button type="button" variant="secondary" size="lg" className="gap-2" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button type="submit" size="lg" className="h-11 gap-2 rounded-md px-6 text-sm font-medium">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

/* ── Step 3 — background (education / experience / skills …) ────────── */

/**
 * One blank row per section so the form is ready to type into. Education
 * starts EMPTY on purpose — it is optional, and an entry only exists once the
 * user adds one (at which point its institution becomes required).
 */
const createBackgroundDraft = (): BackgroundDetails => ({
  education: [],
  experience: [{ company: '', position: '', startDate: '', endDate: '', description: '' }],
  skills: [],
  projects: [{ name: '', description: '', technologies: '', link: '' }],
  certifications: [{ name: '', issuer: '', date: '', link: '' }],
});

function EducationEntryFields({
  index,
  entry,
  error,
  onChange,
  onRemove,
}: {
  index: number;
  entry: BackgroundDetails['education'][number];
  error?: string;
  onChange: (patch: Partial<BackgroundDetails['education'][number]>) => void;
  onRemove: () => void;
}) {
  const inputId = (field: string) => `edu-${index}-${field}`;

  return (
    <div
      data-entry-id={entry.id}
      className="space-y-3 rounded-md border border-border bg-muted/40 p-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">Education {index + 1}</span>
        <button
          type="button"
          aria-label={`Remove education ${index + 1}`}
          onClick={onRemove}
          className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Institution — the only required field once an entry exists. */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={inputId('school')} className="text-xs font-medium flex items-center gap-1.5">
            Institution <span className="text-destructive" aria-hidden>*</span>
          </Label>
          <Input
            id={inputId('school')}
            value={entry.school}
            onChange={(e) => onChange({ school: e.target.value })}
            placeholder="State University"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId('school')}-error` : undefined}
            className={cn(
              'h-11 text-sm transition-colors',
              error ? 'border-destructive/60 focus-visible:ring-destructive/30' : '',
            )}
          />
          {error && (
            <p id={`${inputId('school')}-error`} className="flex items-start gap-1.5 text-xs text-destructive animate-fade-in" role="alert">
              <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
              {error}
            </p>
          )}
        </div>
        <Field id={inputId('degree')} label="Degree" value={entry.degree} onChange={(v) => onChange({ degree: v })} placeholder="B.S." />
        <Field id={inputId('field')} label="Field of Study" value={entry.field} onChange={(v) => onChange({ field: v })} placeholder="Computer Science" />
        <Field id={inputId('start')} label="Start Date" value={entry.startDate} onChange={(v) => onChange({ startDate: v })} placeholder="09 / 2018" />
        <Field id={inputId('end')} label="End Date" value={entry.endDate} onChange={(v) => onChange({ endDate: v })} placeholder="06 / 2022" />
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={inputId('description')} className="text-xs font-medium">
            Description <span className="text-xs font-normal text-muted-foreground">Optional</span>
          </Label>
          <Textarea
            id={inputId('description')}
            rows={2}
            value={entry.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Honors, relevant coursework, activities — anything worth highlighting."
            className="resize-y text-sm"
          />
        </div>
      </div>
    </div>
  );
}

function BackgroundStep({
  background,
  onChange,
  onBack,
  onNext,
}: {
  background: BackgroundDetails;
  onChange: Dispatch<SetStateAction<BackgroundDetails>>;
  onBack: () => void;
  onNext: () => void;
}) {
  const [skillDraft, setSkillDraft] = useState('');
  const [eduErrors, setEduErrors] = useState<Record<string, string>>({});

  const exp = background.experience[0] ?? { company: '', position: '', startDate: '', endDate: '', description: '' };
  const project = background.projects[0] ?? { name: '', description: '', technologies: '', link: '' };
  const cert = background.certifications[0] ?? { name: '', issuer: '', date: '', link: '' };

  const setExp = (patch: Partial<typeof exp>) =>
    onChange((prev) => {
      const row = prev.experience[0] ?? exp;
      return { ...prev, experience: [{ ...row, ...patch }] };
    });
  const setProject = (patch: Partial<typeof project>) =>
    onChange((prev) => {
      const row = prev.projects[0] ?? project;
      return { ...prev, projects: [{ ...row, ...patch }] };
    });
  const setCert = (patch: Partial<typeof cert>) =>
    onChange((prev) => {
      const row = prev.certifications[0] ?? cert;
      return { ...prev, certifications: [{ ...row, ...patch }] };
    });

  // --- Education: add / remove / edit -------------------------------
  const addEducation = () =>
    onChange((prev) => ({ ...prev, education: [...prev.education, createEmptyEducationDraft()] }));
  const removeEducation = (id: string) => {
    onChange((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));
    setEduErrors((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };
  const setEdu = (id: string, patch: Partial<BackgroundDetails['education'][number]>) => {
    onChange((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
    // The error clears the moment the institution becomes non-empty.
    if (patch.school !== undefined && patch.school.trim()) {
      setEduErrors((prev) => {
        if (!(id in prev)) return prev;
        const { [id]: _cleared, ...rest } = prev;
        return rest;
      });
    }
  };

  const addSkill = () => {
    const value = skillDraft.trim();
    if (!value) return;
    onChange((prev) =>
      prev.skills.includes(value) ? prev : { ...prev, skills: [...prev.skills, value] },
    );
    setSkillDraft('');
  };
  const removeSkill = (skill: string) =>
    onChange((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));

  /**
   * Next-step gate: education is optional, but every ADDED entry must name
   * its institution. Invalid entries never leave the form.
   */
  const handleNext = () => {
    const nextErrors = validateBackground(background);
    setEduErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error('Add the missing institution before continuing.');
      return;
    }
    onNext();
  };

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        handleNext();
      }}
      noValidate
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Education — optional section; entries carry a required institution. */}
        <BackgroundCard icon={GraduationCap} title="Education">
          {background.education.length === 0 && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              No education added yet — that is perfectly fine. Add one only if it strengthens your resume.
            </p>
          )}
          <div className="space-y-3">
            {background.education.map((entry, i) => (
              <EducationEntryFields
                key={entry.id}
                index={i}
                entry={entry}
                error={eduErrors[entry.id]}
                onChange={(patch) => setEdu(entry.id, patch)}
                onRemove={() => removeEducation(entry.id)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={addEducation}
            className="w-full rounded-md border border-dashed border-border py-2.5 text-sm text-muted-foreground transition-colors duration-150 hover:border-foreground/30 hover:text-foreground"
          >
            + Add Education
          </button>
          {background.education.length > 0 && (
            <p className="text-xs text-muted-foreground">Institution is required for each added entry.</p>
          )}
        </BackgroundCard>

        {/* Experience */}
        <BackgroundCard icon={Briefcase} title="Experience">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="exp-company" label="Company" value={exp.company} onChange={(v) => setExp({ company: v })} placeholder="Acme Corp" />
            <Field id="exp-position" label="Job Title" value={exp.position} onChange={(v) => setExp({ position: v })} placeholder="Software Engineer" />
            <Field id="exp-start" label="Start Date" value={exp.startDate} onChange={(v) => setExp({ startDate: v })} placeholder="03 / 2022" />
            <Field id="exp-end" label="End Date" value={exp.endDate} onChange={(v) => setExp({ endDate: v })} placeholder="Present" />
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="exp-description" className="text-xs font-medium">
                Description <span className="text-xs font-normal text-muted-foreground">Optional</span>
              </Label>
              <Textarea
                id="exp-description"
                rows={3}
                value={exp.description}
                onChange={(e) => setExp({ description: e.target.value })}
                placeholder="What you owned and the impact you made. Add more bullets in the editor."
                className="resize-y text-sm"
              />
            </div>
          </div>
        </BackgroundCard>

        {/* Skills */}
        <BackgroundCard icon={ListChecks} title="Skills">
          <div className="flex gap-2">
            <Input
              id="onboarding-skill"
              value={skillDraft}
              onChange={(e) => setSkillDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="Type a skill and press Enter"
              className="h-11 text-sm"
            />
            <Button type="button" variant="secondary" className="gap-1.5 shrink-0" onClick={addSkill}>
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
          {background.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {background.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1 pr-1 text-xs font-medium">
                  {skill}
                  <button
                    type="button"
                    aria-label={`Remove ${skill}`}
                    onClick={() => removeSkill(skill)}
                    className="ml-0.5 h-4 w-4 rounded-full flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">Press Enter after each skill — you can refine the list in the editor.</p>
        </BackgroundCard>

        <div className="grid gap-4">
          {/* Projects */}
          <BackgroundCard icon={Code2} title="Projects">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field id="project-name" label="Project Name" value={project.name} onChange={(v) => setProject({ name: v })} placeholder="Portfolio Site" />
              <Field id="project-tech" label="Technologies" value={project.technologies} onChange={(v) => setProject({ technologies: v })} placeholder="React, TypeScript" />
              <Field id="project-link" label="Project Link" value={project.link} onChange={(v) => setProject({ link: v })} placeholder="https://…" className="sm:col-span-2" />
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="project-description" className="text-xs font-medium">
                  Description <span className="text-xs font-normal text-muted-foreground">Optional</span>
                </Label>
                <Textarea
                  id="project-description"
                  rows={2}
                  value={project.description}
                  onChange={(e) => setProject({ description: e.target.value })}
                  placeholder="One or two sentences about what it does."
                  className="resize-y text-sm"
                />
              </div>
            </div>
          </BackgroundCard>

          {/* Certifications */}
          <BackgroundCard icon={Award} title="Certifications">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field id="cert-name" label="Certification Name" value={cert.name} onChange={(v) => setCert({ name: v })} placeholder="AWS Certified" />
              <Field id="cert-issuer" label="Issuing Organization" value={cert.issuer} onChange={(v) => setCert({ issuer: v })} placeholder="Amazon Web Services" />
              <Field id="cert-date" label="Date" value={cert.date} onChange={(v) => setCert({ date: v })} placeholder="05 / 2024" />
              <Field id="cert-link" label="Credential Link" value={cert.link} onChange={(v) => setCert({ link: v })} placeholder="https://…" />
            </div>
          </BackgroundCard>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Everything on this step is optional — rows you leave empty are simply not added. You can
        grow each section later in the editor.
      </p>

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="secondary" size="lg" className="gap-2" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button type="submit" size="lg" className="h-11 gap-2 rounded-md px-6 text-sm font-medium">
          Next: Choose Design <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

/* ── Step 4 — design gallery ────────────────────────────────────────────── */

function DesignCard({
  template,
  data,
  selected,
  onSelect,
  onUse,
  onPreview,
}: {
  template: TemplateDefinition;
  data: ResumeData;
  selected: boolean;
  onSelect: () => void;
  onUse: () => void;
  onPreview: () => void;
}) {
  return (
    <div
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border bg-card transition-colors duration-150',
        selected ? 'border-bronze ring-1 ring-bronze/40' : 'border-border hover:border-foreground/30',
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`Select ${template.label} design`}
        className="relative block w-full aspect-[210/297] bg-paper overflow-hidden"
      >
        <ResumeThumbnail data={{ ...data, template: template.id }} />
        {selected && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded bg-bronze px-1.5 py-0.5 text-xs font-medium text-bronze-foreground">
            <CheckCircle2 className="h-3 w-3" /> Selected
          </span>
        )}
      </button>

      <div className="p-3.5 flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-tight">{template.label}</h3>
          <Badge variant="secondary" className="shrink-0 border-border text-xs capitalize text-muted-foreground">
            {template.category}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed flex-1">{template.description}</p>
        <p className="text-xs text-muted-foreground/70">Best for: {template.bestFor}</p>
        <div className="flex gap-1.5 pt-1">
          <Button variant="secondary" size="sm" className="flex-1" onClick={onPreview}>
            <Eye className="h-3.5 w-3.5 mr-1" /> Preview
          </Button>
          <Button
            size="sm"
            variant={selected ? 'primary' : 'secondary'}
            className="flex-1 h-8 text-xs font-medium"
            onClick={onUse}
          >
            Use This Template
          </Button>
        </div>
      </div>
    </div>
  );
}

function DesignStep({
  details,
  selected,
  onSelect,
  onUse,
  onBack,
  onBuild,
}: {
  details: PersonalDetails;
  selected: TemplateType;
  onSelect: (id: TemplateType) => void;
  onUse: (id: TemplateType) => void;
  onBack: () => void;
  onBuild: () => void;
}) {
  const [collectionId, setCollectionId] = useState<string>('all');
  const [showMyDetails, setShowMyDetails] = useState(false);
  const [previewing, setPreviewing] = useState<TemplateDefinition | null>(null);

  const sample = useMemo(() => getSampleResume(), []);

  // Preview content is EITHER the user's own details OR the clearly-labelled
  // sample resume — the two are never blended together.
  const previewData: ResumeData = useMemo(() => {
    if (!showMyDetails) return sample;
    const own = createEmptyResume();
    own.personal = {
      ...own.personal,
      fullName: details.fullName.trim() || 'Your Name',
      email: details.email.trim(),
      phone: details.phone.trim(),
      location: details.location.trim(),
      headline: details.headline.trim(),
    };
    return own;
  }, [showMyDetails, sample, details]);

  const collection = DESIGN_COLLECTIONS.find((c) => c.id === collectionId) ?? DESIGN_COLLECTIONS[0];
  const templates = useMemo(() => getCollectionTemplates(collection), [collection]);
  const selectedName = getTemplate(selected).label;

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1 -mb-1">
          {DESIGN_COLLECTIONS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCollectionId(c.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150',
                collectionId === c.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowMyDetails((v) => !v)}
          aria-pressed={showMyDetails}
          className={cn(
            'self-start lg:self-auto shrink-0 flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors',
            showMyDetails
              ? 'border-accent/40 bg-accent/10 text-accent'
              : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/40',
          )}
        >
          <span className={cn('h-3.5 w-6 rounded-full p-0.5 transition-colors', showMyDetails ? 'bg-accent/70' : 'bg-muted-foreground/30')}>
            <span className={cn('block h-2.5 w-2.5 rounded-full bg-white transition-transform', showMyDetails && 'translate-x-2.5')} />
          </span>
          {showMyDetails ? 'Showing my details' : 'Showing sample content'}
        </button>
      </div>

      <p className="text-xs text-muted-foreground -mt-2">
        {collection.blurb}{' '}
        {details.fullName.trim() ? `Your details go into ${selectedName} — the design only changes the look.` : 'Pick any design; you can switch it later without losing content.'}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <DesignCard
            key={t.id}
            template={t}
            data={previewData}
            selected={t.id === selected}
            onSelect={() => onSelect(t.id)}
            onUse={() => onUse(t.id)}
            onPreview={() => setPreviewing(t)}
          />
        ))}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="secondary" onClick={onBack} className="h-11 gap-2 rounded-md text-sm">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block">
            Design: <span className="font-medium text-foreground">{selectedName}</span>
          </span>
          <Button size="lg" onClick={onBuild} className="h-11 gap-2 rounded-md px-6 text-sm font-medium">
            Build My Resume
          </Button>
        </div>
      </div>

      {/* Full-size preview of the selected design */}
      <Dialog open={previewing !== null} onOpenChange={(open) => !open && setPreviewing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="border-b border-border px-5 py-4">
            <DialogTitle className="text-base">{previewing?.label} design</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {previewing?.layoutDescription} · Best for {previewing?.bestFor}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto scrollbar-thin bg-muted/30 p-5">
            <div className="mx-auto" style={{ width: '210mm', maxWidth: '100%' }}>
              <div className="bg-paper shadow-modal origin-top mx-auto" style={{ width: '210mm', minHeight: '297mm', padding: '18mm 20mm', transform: 'scale(0.92)', transformOrigin: 'top center' }}>
                {previewing && <previewing.Component data={{ ...previewData, template: previewing.id }} />}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3.5">
            <span className="text-xs text-muted-foreground">
              {showMyDetails ? 'Previewing with your details' : 'Previewing with sample content'}
            </span>
            <Button
              className="h-9 gap-2 rounded-md text-sm font-medium"
              onClick={() => {
                if (previewing) onUse(previewing.id);
                setPreviewing(null);
              }}
            >
              Use This Template <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Step 5 — build ─────────────────────────────────────────────────────── */

function BuildStep({ name, design }: { name: string; design: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <Loader2 className="mb-5 h-6 w-6 animate-spin text-muted-foreground" />
      <h2 className="text-lg font-semibold mb-1.5">Building your resume…</h2>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        {name ? `${name}'s` : 'Your'} resume is being generated with the {design} design and your
        details.
      </p>
      <ul className="mt-6 space-y-2 text-left">
        {['Applying your personal details', `Laying out the ${design} design`, 'Opening the editor'].map((item, i) => (
          <li
            key={item}
            className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in"
            style={{ animationDelay: `${i * 140}ms` }}
          >
            <Check className="h-3.5 w-3.5 text-success" /> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════════ */

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createResumeFromDetails, hasResume } = useResume();

  // The step and its travel direction move together so the panel can slide in
  // from the side the visitor is heading towards.
  const [nav, setNav] = useState<{ step: number; dir: 'next' | 'prev' }>({ step: 1, dir: 'next' });
  const step = nav.step;
  const goTo = useCallback((next: number) => {
    setNav((cur) => (next === cur.step ? cur : { step: next, dir: next > cur.step ? 'next' : 'prev' }));
  }, []);

  /*
   * Persistent draft cache — the user's in-progress onboarding survives a
   * refresh or an accidental navigation away. The cached entry is tagged with
   * a draft id, so values never leak between different resumes/drafts: a
   * mismatched id restores nothing and starts from the empty defaults.
   */
  const draftId = 'onboarding-current';

  // Read the cache ONCE at mount, synchronously, and seed the initial state
  // from it (no render-phase setState).
  const cached = useMemo(() => loadOnboardingDraft(draftId), [draftId]);
  const [details, setDetails] = useState<PersonalDetails>(cached.draft.details);
  const [errors, setErrors] = useState<PersonalDetailsErrors>({});
  const [background, setBackground] = useState<BackgroundDetails>(() => {
    const seed = createBackgroundDraft();
    if (!cached.restored) return seed;
    return {
      ...seed,
      ...cached.draft.background,
      // Keep the editable seed rows for sections the user never touched.
      experience: cached.draft.background.experience.length > 0 ? cached.draft.background.experience : seed.experience,
      projects: cached.draft.background.projects.length > 0 ? cached.draft.background.projects : seed.projects,
      certifications: cached.draft.background.certifications.length > 0 ? cached.draft.background.certifications : seed.certifications,
    };
  });
  // A design carried over from the Templates page ("Use This Template") beats
  // the cached template choice only when it is explicitly present.
  const [template, setTemplate] = useState<TemplateType>(() => {
    const requested = searchParams.get('template');
    if (requested && ALL_TEMPLATE_TYPES.includes(requested as TemplateType)) {
      return requested as TemplateType;
    }
    return cached.draft.template;
  });
  const createdRef = useRef(false);

  // Resume the flow where the visitor left off (never past the design step —
  // the build step itself is transient).
  useEffect(() => {
    if (cached.restored && cached.draft.step > 1 && cached.draft.step < 5) {
      goTo(cached.draft.step);
    }
    // Runs once after mount on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave: every change (typing, step moves, design choice) lands in
  // localStorage immediately so nothing is ever lost to a crash or refresh.
  // Once the resume has been created, the draft is cleared for good — the
  // effect must not re-persist a stale step-5 draft afterwards.
  useEffect(() => {
    if (createdRef.current) return;
    syncOnboardingDraft({
      version: 1,
      savedAt: Date.now(),
      activeDraftId: draftId,
      step,
      details,
      background,
      template,
    });
  }, [step, details, background, template, draftId]);

  const handleFieldChange = useCallback((field: PersonalDetailsField, value: string) => {
    setDetails((prev) => {
      const next = { ...prev, [field]: value };
      // Clear the error as soon as the field becomes valid again.
      if (errors[field] && !validatePersonalDetails(next)[field]) {
        setErrors((cur) => ({ ...cur, [field]: undefined }));
      }
      return next;
    });
  }, [errors]);

  const goToSummary = useCallback(() => {
    const nextErrors = validatePersonalDetails(details);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error('Please fix the highlighted fields to continue.');
      return;
    }
    goTo(2);
  }, [details, goTo]);

  const finish = useCallback(
    (chosen: TemplateType = template) => {
      if (createdRef.current) return;
      createdRef.current = true;
      setTemplate(chosen);
      goTo(5);
      createResumeFromDetails(details, chosen, background);
      clearOnboardingDraft();
      window.setTimeout(() => {
        toast.success('Resume created', { description: 'Add your experience to make it stand out.' });
        navigate('/editor');
      }, 700);
    },
    [background, createResumeFromDetails, details, template, navigate, goTo],
  );

  const designLabel = getTemplate(template).label;

  return (
    <div className="min-h-full bg-background overflow-x-hidden">
      <div className="mx-auto max-w-5xl px-5 py-8 lg:px-8 lg:py-10">
        {/* Header */}
        <div className="mb-6 animate-fade-down">
          <p className="eyebrow mb-3">
            {hasResume ? 'New resume' : 'Create your resume'}
          </p>
          <h1 className="font-display text-2xl font-semibold leading-tight text-foreground lg:text-3xl">
            {step === 1 && 'Tell us about yourself'}
            {step === 2 && 'Your professional summary'}
            {step === 3 && 'Round out your background'}
            {step === 4 && 'Choose a design for your resume'}
            {step === 5 && 'Creating your resume'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
            {step === 1 && 'Your contact details come first — a short summary and background section follow, then you choose a design.'}
            {step === 2 && 'Two or three sentences about who you are and the value you bring. You can refine this later with the AI assistant.'}
            {step === 3 && 'Everything here is optional — add what you have now, and grow each section later in the editor.'}
            {step === 4 && 'Your content stays the same — the design only changes layout, typography and colour.'}
            {step === 5 && 'Hang tight, this takes a moment.'}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6 rounded-lg border border-border bg-card px-4 py-3.5 animate-fade-up">
          <ProgressIndicator current={step} onStepClick={goTo} />
        </div>

        {/*
          Body — one panel at a time. The panel is keyed on the step so each
          change remounts it and replays a short horizontal slide in the
          direction of travel. The page itself keeps its normal vertical
          scrolling; nothing here scrolls sideways.
        */}
        <div
          key={step}
          data-step-panel=""
          data-dir={nav.dir}
          className="premium-card p-5 lg:p-7"
        >
          {step === 1 && (
            <DetailsStep details={details} errors={errors} onChange={handleFieldChange} onSubmit={goToSummary} />
          )}
          {step === 2 && (
            <SummaryStep
              summary={details.summary}
              onChange={(value) => handleFieldChange('summary', value)}
              onBack={() => goTo(1)}
              onNext={() => goTo(3)}
            />
          )}
          {step === 3 && (
            <BackgroundStep
              background={background}
              onChange={setBackground}
              onBack={() => goTo(2)}
              onNext={() => goTo(4)}
            />
          )}
          {step === 4 && (
            <DesignStep
              details={details}
              selected={template}
              onSelect={setTemplate}
              onUse={(id) => finish(id)}
              onBack={() => goTo(3)}
              onBuild={finish}
            />
          )}
          {step === 5 && <BuildStep name={details.fullName.trim()} design={designLabel} />}
        </div>

        {step === 1 && (
          <p className="text-xs text-muted-foreground text-center mt-5">
            Nothing is uploaded — your resume is saved locally in this browser.
          </p>
        )}
      </div>
    </div>
  );
}
