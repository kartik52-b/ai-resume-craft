import { useCallback, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
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
  type BackgroundDetails,
  validatePersonalDetails,
  type PersonalDetails,
  type PersonalDetailsErrors,
  type PersonalDetailsField,
} from '@/lib/onboarding';
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
  ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2, Eye, Sparkles,
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
  return (
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
                'flex items-center gap-2 min-w-0 w-full rounded-lg px-2 py-1.5 text-left transition-colors',
                canJump && 'hover:bg-muted/60 cursor-pointer',
                !canJump && 'cursor-default',
              )}
            >
              <span
                className={cn(
                  'h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 border transition-colors',
                  state === 'done' && 'bg-emerald-500 border-emerald-500 text-white',
                  state === 'current' && 'bg-accent border-accent text-accent-foreground',
                  state === 'upcoming' && 'border-border text-muted-foreground',
                )}
              >
                {state === 'done' ? <Check className="h-3 w-3" /> : step.id}
              </span>
              <span className="min-w-0 hidden sm:block">
                <span
                  className={cn(
                    'block text-[12px] font-medium truncate',
                    state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground',
                  )}
                >
                  {step.label}
                </span>
                <span className="block text-[10px] text-muted-foreground truncate">{step.hint}</span>
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  'h-px flex-1 min-w-3 shrink-0 transition-colors',
                  step.id < current ? 'bg-emerald-500/50' : 'bg-border',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
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
              <Label htmlFor={inputId} className="text-[12px] font-medium flex items-center gap-1.5">
                <Icon className="h-3 w-3 opacity-50" />
                {label}
                {required ? (
                  <span className="text-destructive" aria-hidden>*</span>
                ) : (
                  <span className="text-[10px] font-normal text-muted-foreground">Optional</span>
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
                  'h-11 text-[14px] bg-background/60 transition-colors',
                  error ? 'border-destructive/60 focus-visible:ring-destructive/30' : 'border-border/60 focus:border-accent/50',
                )}
              />
              {error && (
                <p id={`${inputId}-error`} className="flex items-start gap-1.5 text-[11.5px] text-destructive animate-fade-in">
                  <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11.5px] text-muted-foreground leading-relaxed">
        Start with the essentials — a short professional summary and an optional background
        section come next, then you choose your design.
      </p>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <Link
          to="/"
          className="text-[12.5px] text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>
        <Button type="submit" size="lg" className="btn-gradient h-11 px-7 rounded-xl text-[14px] font-semibold gap-2">
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
      <Label htmlFor={id} className="text-[12px] font-medium">
        {label} <span className="text-[10px] font-normal text-muted-foreground">Optional</span>
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 text-[14px] bg-background/60 border-border/60 focus:border-accent/50"
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
    <div className="rounded-xl border border-border/60 bg-background/40 p-4 space-y-3.5">
      <div className="flex items-center gap-2">
        <span className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-accent" />
        </span>
        <h3 className="text-[13.5px] font-semibold">{title}</h3>
        <span className="ml-auto text-[10px] text-muted-foreground">Optional</span>
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
        <Label htmlFor="onboarding-summary" className="text-[12px] font-medium flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 opacity-50" />
          Professional Summary
          <span className="text-[10px] font-normal text-muted-foreground">Optional</span>
        </Label>
        <Textarea
          id="onboarding-summary"
          rows={6}
          value={summary}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Two or three sentences on who you are, what you do best, and the impact you deliver."
          className="text-[14px] bg-background/60 border-border/60 focus:border-accent/50 resize-y"
        />
        <p className="text-[11.5px] text-muted-foreground leading-relaxed">
          You can leave this for later — the AI assistant in the editor can draft or polish your
          summary, and every suggestion is reviewed by you before it lands.
        </p>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <Button type="button" variant="outline" onClick={onBack} className="h-11 rounded-xl text-[13px] gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button type="submit" size="lg" className="btn-gradient h-11 px-7 rounded-xl text-[14px] font-semibold gap-2">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

/* ── Step 3 — background (education / experience / skills …) ────────── */

/** One blank row per section so the form is ready to type into; empty rows are dropped by the builder. */
const createBackgroundDraft = (): BackgroundDetails => ({
  education: [{ school: '', degree: '', field: '', startDate: '', endDate: '' }],
  experience: [{ company: '', position: '', startDate: '', endDate: '', description: '' }],
  skills: [],
  projects: [{ name: '', description: '', technologies: '', link: '' }],
  certifications: [{ name: '', issuer: '', date: '', link: '' }],
});

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

  const edu = background.education[0] ?? { school: '', degree: '', field: '', startDate: '', endDate: '' };
  const exp = background.experience[0] ?? { company: '', position: '', startDate: '', endDate: '', description: '' };
  const project = background.projects[0] ?? { name: '', description: '', technologies: '', link: '' };
  const cert = background.certifications[0] ?? { name: '', issuer: '', date: '', link: '' };

  const setEdu = (patch: Partial<typeof edu>) =>
    onChange((prev) => {
      const row = prev.education[0] ?? edu;
      return { ...prev, education: [{ ...row, ...patch }] };
    });
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

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
      noValidate
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Education */}
        <BackgroundCard icon={GraduationCap} title="Education">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="edu-school" label="Institution" value={edu.school} onChange={(v) => setEdu({ school: v })} placeholder="State University" className="sm:col-span-2" />
            <Field id="edu-degree" label="Degree" value={edu.degree} onChange={(v) => setEdu({ degree: v })} placeholder="B.S." />
            <Field id="edu-field" label="Field of Study" value={edu.field} onChange={(v) => setEdu({ field: v })} placeholder="Computer Science" />
            <Field id="edu-start" label="Start Date" value={edu.startDate} onChange={(v) => setEdu({ startDate: v })} placeholder="09 / 2018" />
            <Field id="edu-end" label="End Date" value={edu.endDate} onChange={(v) => setEdu({ endDate: v })} placeholder="06 / 2022" />
          </div>
        </BackgroundCard>

        {/* Experience */}
        <BackgroundCard icon={Briefcase} title="Experience">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="exp-company" label="Company" value={exp.company} onChange={(v) => setExp({ company: v })} placeholder="Acme Corp" />
            <Field id="exp-position" label="Job Title" value={exp.position} onChange={(v) => setExp({ position: v })} placeholder="Software Engineer" />
            <Field id="exp-start" label="Start Date" value={exp.startDate} onChange={(v) => setExp({ startDate: v })} placeholder="03 / 2022" />
            <Field id="exp-end" label="End Date" value={exp.endDate} onChange={(v) => setExp({ endDate: v })} placeholder="Present" />
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="exp-description" className="text-[12px] font-medium">
                Description <span className="text-[10px] font-normal text-muted-foreground">Optional</span>
              </Label>
              <Textarea
                id="exp-description"
                rows={3}
                value={exp.description}
                onChange={(e) => setExp({ description: e.target.value })}
                placeholder="What you owned and the impact you made. Add more bullets in the editor."
                className="text-[14px] bg-background/60 border-border/60 focus:border-accent/50 resize-y"
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
              className="h-11 text-[14px] bg-background/60 border-border/60 focus:border-accent/50"
            />
            <Button type="button" variant="outline" onClick={addSkill} className="h-11 px-4 gap-1.5 shrink-0">
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
          {background.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {background.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1 pr-1 text-[12px] font-medium">
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
          <p className="text-[11px] text-muted-foreground">Press Enter after each skill — you can refine the list in the editor.</p>
        </BackgroundCard>

        <div className="grid gap-4">
          {/* Projects */}
          <BackgroundCard icon={Code2} title="Projects">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field id="project-name" label="Project Name" value={project.name} onChange={(v) => setProject({ name: v })} placeholder="Portfolio Site" />
              <Field id="project-tech" label="Technologies" value={project.technologies} onChange={(v) => setProject({ technologies: v })} placeholder="React, TypeScript" />
              <Field id="project-link" label="Project Link" value={project.link} onChange={(v) => setProject({ link: v })} placeholder="https://…" className="sm:col-span-2" />
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="project-description" className="text-[12px] font-medium">
                  Description <span className="text-[10px] font-normal text-muted-foreground">Optional</span>
                </Label>
                <Textarea
                  id="project-description"
                  rows={2}
                  value={project.description}
                  onChange={(e) => setProject({ description: e.target.value })}
                  placeholder="One or two sentences about what it does."
                  className="text-[14px] bg-background/60 border-border/60 focus:border-accent/50 resize-y"
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

      <p className="text-[11.5px] text-muted-foreground leading-relaxed">
        Everything on this step is optional — rows you leave empty are simply not added. You can
        grow each section later in the editor.
      </p>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 border-t border-border/60">
        <Button type="button" variant="outline" onClick={onBack} className="h-11 rounded-xl text-[13px] gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button type="submit" size="lg" className="btn-gradient h-11 px-7 rounded-xl text-[14px] font-semibold gap-2">
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
        'group rounded-xl border bg-card overflow-hidden flex flex-col transition-all duration-200',
        selected ? 'border-accent ring-2 ring-accent/25 shadow-sm' : 'border-border/60 hover:border-border hover:shadow-sm',
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`Select ${template.label} design`}
        className="relative block w-full aspect-[210/297] bg-white overflow-hidden"
      >
        <ResumeThumbnail data={{ ...data, template: template.id }} />
        {selected && (
          <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-semibold text-accent-foreground bg-accent px-2 py-0.5 rounded-full shadow-sm">
            <CheckCircle2 className="h-3 w-3" /> Selected
          </span>
        )}
      </button>

      <div className="p-3.5 flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[13.5px] font-semibold leading-tight">{template.label}</h3>
          {template.atsSafe && (
            <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-500 shrink-0">
              ATS
            </Badge>
          )}
        </div>
        <p className="text-[11.5px] text-muted-foreground leading-relaxed flex-1">{template.description}</p>
        <p className="text-[11px] text-muted-foreground/70">Best for: {template.bestFor}</p>
        <div className="flex gap-1.5 pt-1">
          <Button variant="outline" size="sm" className="flex-1 h-8 text-[12px]" onClick={onPreview}>
            <Eye className="h-3.5 w-3.5 mr-1" /> Preview
          </Button>
          <Button
            size="sm"
            variant={selected ? 'default' : 'outline'}
            className="flex-1 h-8 text-[12px] font-medium"
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
                'px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all duration-150',
                collectionId === c.id
                  ? 'bg-accent text-accent-foreground shadow-sm'
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
            'self-start lg:self-auto shrink-0 flex items-center gap-2 text-[11.5px] font-medium px-3 py-1.5 rounded-full border transition-colors',
            showMyDetails
              ? 'border-accent/40 bg-accent/10 text-accent'
              : 'border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40',
          )}
        >
          <span className={cn('h-3.5 w-6 rounded-full p-0.5 transition-colors', showMyDetails ? 'bg-accent/70' : 'bg-muted-foreground/30')}>
            <span className={cn('block h-2.5 w-2.5 rounded-full bg-white transition-transform', showMyDetails && 'translate-x-2.5')} />
          </span>
          {showMyDetails ? 'Showing my details' : 'Showing sample content'}
        </button>
      </div>

      <p className="text-[12px] text-muted-foreground -mt-2">
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

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-border/60">
        <Button variant="outline" onClick={onBack} className="h-11 rounded-xl text-[13px] gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-muted-foreground hidden sm:block">
            Design: <span className="font-medium text-foreground">{selectedName}</span>
          </span>
          <Button size="lg" onClick={onBuild} className="btn-gradient h-11 px-7 rounded-xl text-[14px] font-semibold gap-2">
            <Sparkles className="h-4 w-4" /> Build My Resume
          </Button>
        </div>
      </div>

      {/* Full-size preview of the selected design */}
      <Dialog open={previewing !== null} onOpenChange={(open) => !open && setPreviewing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-5 py-4 border-b border-border/60">
            <DialogTitle className="text-[15px]">{previewing?.label} design</DialogTitle>
            <DialogDescription className="text-[12px] text-muted-foreground">
              {previewing?.layoutDescription} · Best for {previewing?.bestFor}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto scrollbar-thin bg-muted/30 p-5">
            <div className="mx-auto" style={{ width: '210mm', maxWidth: '100%' }}>
              <div className="bg-white shadow-modal origin-top mx-auto" style={{ width: '210mm', minHeight: '297mm', padding: '18mm 20mm', transform: 'scale(0.92)', transformOrigin: 'top center' }}>
                {previewing && <previewing.Component data={{ ...previewData, template: previewing.id }} />}
              </div>
            </div>
          </div>
          <div className="px-5 py-3.5 border-t border-border/60 flex items-center justify-between gap-3">
            <span className="text-[11.5px] text-muted-foreground">
              {showMyDetails ? 'Previewing with your details' : 'Previewing with sample content'}
            </span>
            <Button
              className="btn-gradient h-9 rounded-lg text-[13px] font-medium gap-2"
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
      <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
        <Loader2 className="h-6 w-6 text-accent animate-spin" />
      </div>
      <h2 className="text-[18px] font-semibold mb-1.5">Building your resume…</h2>
      <p className="text-[13px] text-muted-foreground max-w-sm leading-relaxed">
        {name ? `${name}'s` : 'Your'} resume is being generated with the {design} design and your
        details.
      </p>
      <ul className="mt-6 space-y-2 text-left">
        {['Applying your personal details', `Laying out the ${design} design`, 'Opening the editor'].map((item, i) => (
          <li
            key={item}
            className="flex items-center gap-2 text-[12.5px] text-muted-foreground animate-fade-in"
            style={{ animationDelay: `${i * 140}ms` }}
          >
            <Check className="h-3.5 w-3.5 text-emerald-500" /> {item}
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

  const [step, setStep] = useState(1);
  const [details, setDetails] = useState<PersonalDetails>(EMPTY_PERSONAL_DETAILS);
  const [errors, setErrors] = useState<PersonalDetailsErrors>({});
  const [background, setBackground] = useState<BackgroundDetails>(createBackgroundDraft);
  // A design carried over from the Templates page ("Use This Template").
  const [template, setTemplate] = useState<TemplateType>(() => {
    const requested = searchParams.get('template');
    return ALL_TEMPLATE_TYPES.includes(requested as TemplateType) ? (requested as TemplateType) : 'modern';
  });
  const createdRef = useRef(false);

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
    setStep(2);
  }, [details]);

  const finish = useCallback(
    (chosen: TemplateType = template) => {
      if (createdRef.current) return;
      createdRef.current = true;
      setTemplate(chosen);
      setStep(5);
      createResumeFromDetails(details, chosen, background);
      window.setTimeout(() => {
        toast.success('Resume created', { description: 'Add your experience to make it stand out.' });
        navigate('/editor');
      }, 700);    }, [background, createResumeFromDetails, details, template, navigate],
  );

  const designLabel = getTemplate(template).label;

  return (
    <div className="min-h-full bg-workspace overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 lg:py-10">
        {/* Header */}
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent mb-1.5">
            {hasResume ? 'New resume' : 'Create your resume'}
          </p>
          <h1 className="text-[24px] lg:text-[28px] font-bold tracking-tight text-foreground leading-tight">
            {step === 1 && 'Tell us about yourself'}
            {step === 2 && 'Your professional summary'}
            {step === 3 && 'Round out your background'}
            {step === 4 && 'Choose a design for your resume'}
            {step === 5 && 'Creating your resume'}
          </h1>
          <p className="text-[13.5px] text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
            {step === 1 && 'Your contact details come first — a short summary and background section follow, then you choose a design.'}
            {step === 2 && 'Two or three sentences about who you are and the value you bring. You can refine this later with the AI assistant.'}
            {step === 3 && 'Everything here is optional — add what you have now, and grow each section later in the editor.'}
            {step === 4 && 'Your content stays the same — the design only changes layout, typography and colour.'}
            {step === 5 && 'Hang tight, this takes a moment.'}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6 rounded-xl border border-border/60 bg-card px-3 py-2.5">
          <ProgressIndicator current={step} onStepClick={setStep} />
        </div>

        {/* Body */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 lg:p-7 shadow-card">
          {step === 1 && (
            <DetailsStep details={details} errors={errors} onChange={handleFieldChange} onSubmit={goToSummary} />
          )}
          {step === 2 && (
            <SummaryStep
              summary={details.summary}
              onChange={(value) => handleFieldChange('summary', value)}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <BackgroundStep
              background={background}
              onChange={setBackground}
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <DesignStep
              details={details}
              selected={template}
              onSelect={setTemplate}
              onUse={(id) => finish(id)}
              onBack={() => setStep(3)}
              onBuild={finish}
            />
          )}
          {step === 5 && <BuildStep name={details.fullName.trim()} design={designLabel} />}
        </div>

        {step === 1 && (
          <p className="text-[11.5px] text-muted-foreground text-center mt-5">
            Nothing is uploaded — your resume is saved locally in this browser.
          </p>
        )}
      </div>
    </div>
  );
}
