import { useMemo, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useResume } from '@/context/ResumeContext';
import { TEMPLATE_REGISTRY } from '@/lib/templateRegistry';
import { getSampleResume } from '@/lib/sampleResume';
import type { ResumeData } from '@/types/resume';
import ResumeThumbnail from '@/components/ResumeThumbnail';
import Magnetic from '@/components/Magnetic';
import HeroSlider from '@/components/HeroSlider';
import ScrollRail from '@/components/ScrollRail';
import Reveal from '@/components/Reveal';
import TemplateTile from '@/components/TemplateTile';
import { useActiveSection, useCardInteraction, useTilt } from '@/hooks/useInteraction';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Sparkles, FileText, Shield, LayoutTemplate, ArrowRight, Check,
  PenLine, Download, Eye, Wand2, ListChecks,
} from 'lucide-react';

/* ── Content ─────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: LayoutTemplate,
    title: 'Premium templates',
    desc: '25 professionally designed layouts across engineering, finance, academic, creative, healthcare and legal careers.',
  },
  {
    icon: Wand2,
    title: 'AI-assisted writing',
    desc: 'Generate summaries, sharpen bullet points and surface relevant skills — every suggestion is reviewed by you before it lands.',
  },
  {
    icon: Shield,
    title: 'ATS-friendly',
    desc: 'A transparent 100-point resume health score shows exactly what to fix for applicant tracking systems.',
  },
  {
    icon: Eye,
    title: 'Live A4 preview',
    desc: 'The page on the right is your resume. Edits appear instantly, and the PDF export matches what you see.',
  },
  {
    icon: ListChecks,
    title: 'You stay in control',
    desc: 'Edit every section, reorder or hide blocks, switch designs any time — your content never gets overwritten.',
  },
];

const STEPS = [
  {
    num: '01',
    icon: PenLine,
    title: 'Add your details',
    desc: 'Name, email and phone. That is all we need to start — no long forms.',
  },
  {
    num: '02',
    icon: LayoutTemplate,
    title: 'Choose a design',
    desc: 'Browse real, full-page previews and pick the layout that fits your field.',
  },
  {
    num: '03',
    icon: FileText,
    title: 'Build your resume',
    desc: 'Your details are laid out in your design. Add experience, education and skills in the editor.',
  },
  {
    num: '04',
    icon: Download,
    title: 'Export your PDF',
    desc: 'Download a clean, selectable-text PDF that matches the live preview.',
  },
];

const FACT_STRIP = [
  { value: '25', label: 'Resume designs' },
  { value: '6', label: 'Editable sections' },
  { value: '0', label: 'Files uploaded' },
  { value: '1-click', label: 'A4 PDF export' },
];

/**
 * Featured designs for the rail — twelve cards plus a "see all" card. Enough
 * items that horizontal browsing genuinely helps; the full 25 live on
 * /templates behind search and category filters.
 */
const RAIL_TEMPLATE_IDS: ResumeData['template'][] = [
  'modern', 'professional', 'minimal', 'creative', 'executive', 'developer',
  'elegant', 'two-column', 'startup', 'engineering', 'finance', 'designer',
];

/** In-page navigation anchors for the sticky section bar. */
const PAGE_SECTIONS = [
  { id: 'highlights', label: 'Highlights' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'features', label: 'Features' },
  { id: 'designs', label: 'Designs' },
];
/** Stable identity — the scroll-spy observer re-subscribes only with this. */
const PAGE_SECTION_IDS = PAGE_SECTIONS.map((s) => s.id);

/** Stagger helper: cards arrive in sequence, never all at once. */
const at = (ms: number) => ({ animationDelay: `${ms}ms` }) as CSSProperties;

/* ── Building blocks ─────────────────────────────────────────────────────── */

/**
 * One feature tile. The pointer feedback is a very light tilt plus a cursor
 * sheen — composed into a single listener pair (see `useCardInteraction`), so a
 * grid of these costs no more than one hover effect each.
 */
function FeatureCard({
  icon: Icon,
  title,
  desc,
  delayMs,
}: {
  icon: typeof LayoutTemplate;
  title: string;
  desc: string;
  delayMs: number;
}) {
  const fx = useCardInteraction<HTMLDivElement>();

  return (
    <Reveal delayMs={delayMs} className="h-full">
      <div
        {...fx}
        className="premium-card interactive-card group h-full p-6"
      >
        <div className="icon-chip h-11 w-11 mb-4">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-[15px] font-semibold mb-1.5">{title}</h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </Reveal>
  );
}

function StepCard({
  num,
  icon: Icon,
  title,
  desc,
  delayMs,
}: {
  num: string;
  icon: typeof PenLine;
  title: string;
  desc: string;
  delayMs: number;
}) {
  return (
    <li className="h-full list-none">
      <Reveal delayMs={delayMs} className="h-full">
        <div className="premium-card group relative h-full p-6">
          <span
            aria-hidden
            className="absolute right-5 top-5 font-display text-[26px] font-bold leading-none text-muted-foreground/[0.18] tabular-nums"
          >
            {num}
          </span>
          <div className="icon-chip h-11 w-11 mb-4">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-[15px] font-semibold mb-1.5">{title}</h3>
          <p className="text-[13px] text-muted-foreground leading-relaxed">{desc}</p>
        </div>
      </Reveal>
    </li>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

const LandingPage = () => {
  const navigate = useNavigate();
  const { hasResume } = useResume();
  const sample = useMemo(() => getSampleResume(), []);
  const totalTemplates = TEMPLATE_REGISTRY.length;
  const activeSection = useActiveSection(PAGE_SECTION_IDS);
  // The hero resume is a static preview — it tilts with the mouse, never scrolls.
  const heroTilt = useTilt<HTMLDivElement>();

  return (
    <div className="min-h-full bg-workspace overflow-x-hidden">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative px-4 lg:px-8 pt-14 lg:pt-20 pb-14">
        {/* Layered background: a drifting aurora over a faint technical grid. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="aurora animate-aurora" />
          <div className="grid-veil" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
          <div>
            <div className="animate-fade-down inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel text-accent text-[12px] font-medium mb-6">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent animate-ring-pulse" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              AI-powered resume builder
            </div>

            <h1 className="font-display text-[34px] sm:text-[42px] lg:text-[50px] font-bold tracking-tight leading-[1.05] animate-fade-up" style={at(60)}>
              <span className="text-gradient">Build a resume that gets you noticed.</span>
            </h1>

            <p className="text-[16px] lg:text-[17px] text-muted-foreground mt-5 max-w-xl leading-relaxed animate-fade-up" style={at(140)}>
              Create a professional, ATS-friendly resume with premium templates, AI-assisted
              writing, and a live preview.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-8 animate-fade-up" style={at(220)}>
              <Magnetic>
                <Button
                  size="lg"
                  className="btn-gradient h-12 px-7 text-[15px] font-semibold rounded-xl gap-2 w-full sm:w-auto group/cta"
                  onClick={() => navigate('/create')}
                >
                  Create My Resume
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
                </Button>
              </Magnetic>
              <Magnetic>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-7 text-[15px] rounded-xl w-full sm:w-auto border-border/70 hover:border-accent/40 hover:bg-accent/[0.06] transition-colors"
                  onClick={() => navigate('/templates')}
                >
                  Explore Templates
                </Button>
              </Magnetic>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 text-[12.5px] text-muted-foreground animate-fade-up" style={at(300)}>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Free to start</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Saved in your browser</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> No account needed</span>
            </div>

            {hasResume && (
              <p className="text-[12.5px] text-muted-foreground mt-5 animate-fade-up" style={at(360)}>
                Already started?{' '}
                <Link to="/resumes" className="text-accent hover:underline font-medium">Open My Resumes</Link>
              </p>
            )}
          </div>

          {/* Static preview of a real template — it tilts with the mouse */}
          <div className="relative flex justify-center lg:justify-end animate-fade-up" style={at(180)}>
            <div className="relative w-[250px] sm:w-[290px] lg:w-[310px]">
              <div
                className="absolute -inset-5 rounded-[1.7rem] bg-gradient-to-br from-accent/[0.10] via-accent-2/[0.06] to-transparent border border-accent/15"
                aria-hidden
              />
              <div
                {...heroTilt}
                data-hero-preview="tilt"
                className="tilt-surface relative rounded-xl overflow-hidden border border-border/60 bg-white shadow-modal hover:border-accent/40 hover:shadow-xl"
              >
                <div className="relative aspect-[210/297]">
                  <ResumeThumbnail data={sample} />
                </div>
              </div>

              <div className="animate-float absolute -left-4 bottom-8 rounded-xl border border-border/60 bg-card/95 backdrop-blur px-3.5 py-2.5 shadow-card">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse-dot" />
                  <span className="text-[11px] font-semibold">Resume health</span>
                  <span className="text-[11px] font-bold text-success tabular-nums">92</span>
                </div>
              </div>

              <Badge variant="outline" className="absolute -right-2 top-6 bg-card/95 backdrop-blur border-border/60 text-[10px] text-muted-foreground">
                Sample content
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sticky in-page navigation ────────────────────────────────────── */}
      <nav
        aria-label="Page sections"
        className="sticky top-0 z-30 border-y border-border/60 bg-workspace/80 backdrop-blur-xl"
      >
        <div className="max-w-6xl mx-auto px-4 lg:px-8 flex items-center gap-1 py-2 overflow-x-auto scrollbar-none">
          {PAGE_SECTIONS.map((section) => {
            const current = activeSection === section.id;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-current={current ? 'true' : undefined}
                className={cn(
                  'shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200',
                  current
                    ? 'text-foreground bg-accent/12 shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                )}
              >
                {section.label}
              </a>
            );
          })}
          <Button
            size="sm"
            className="ml-auto shrink-0 hidden sm:inline-flex h-8 rounded-full text-[12px] font-medium gap-1.5 group/nav"
            onClick={() => navigate('/create')}
          >
            Get started
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/nav:translate-x-0.5" />
          </Button>
        </div>
      </nav>

      {/* ── Hero content slider ─────────────────────────────────────────── */}
      <section id="highlights" className="px-4 lg:px-8 pt-10 pb-14 scroll-mt-20" aria-label="Product highlights">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <HeroSlider />
          </Reveal>
        </div>
      </section>

      {/* ── Fact strip ───────────────────────────────────────────────────── */}
      <Reveal className="px-4 lg:px-8 pb-14">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FACT_STRIP.map((f, i) => (
            <div
              key={f.label}
              className="premium-card animate-fade-up px-4 py-4 text-center"
              style={at(i * 70)}
            >
              <div className="font-display text-[22px] font-bold tracking-tight text-gradient leading-none">{f.value}</div>
              <div className="text-[11.5px] text-muted-foreground mt-1.5">{f.label}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="px-4 lg:px-8 pb-16 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-9">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent mb-3">
              <Sparkles className="h-3.5 w-3.5" /> The workflow
            </div>
            <h2 className="font-display text-[22px] lg:text-[27px] font-bold tracking-tight">Four steps to a finished resume</h2>
            <p className="text-[14px] text-muted-foreground mt-2 max-w-xl mx-auto">
              No blank-page paralysis. A short guided setup puts your details into the design, then
              you build the rest section by section.
            </p>
          </Reveal>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <StepCard key={step.num} {...step} delayMs={i * 80} />
            ))}
          </ol>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="px-4 lg:px-8 pb-16 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <Reveal className="mb-8">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent mb-3">
              <Shield className="h-3.5 w-3.5" /> Built in
            </div>
            <h2 className="font-display text-[22px] lg:text-[27px] font-bold tracking-tight">Everything a modern resume needs</h2>
            <p className="text-[14px] text-muted-foreground mt-2 max-w-2xl">
              Writing assistance, structure and formatting handled in one place — with you approving
              every change.
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} delayMs={i * 70} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Design showcase ──────────────────────────────────────────────── */}
      <section id="designs" className="px-4 lg:px-8 pb-16 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <Reveal className="flex flex-wrap items-end justify-between gap-3 mb-2">
            <div>
              <h2 className="font-display text-[22px] lg:text-[27px] font-bold tracking-tight">
                {totalTemplates} designs, one set of content
              </h2>
              <p className="text-[14px] text-muted-foreground mt-2 max-w-xl">
                Switch designs whenever you like. Your content stays exactly the same — only the
                layout, typography and colour change.
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-xl gap-2 group/btn border-border/70 hover:border-accent/40 hover:bg-accent/[0.06]"
              onClick={() => navigate('/templates')}
            >
              Explore Templates
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
            </Button>
          </Reveal>

          <Reveal>
            <ScrollRail
              ariaLabel="Featured resume designs"
              itemClassName="w-[168px] sm:w-[186px]"
              items={[
                ...RAIL_TEMPLATE_IDS.map((id) => (
                  <TemplateTile
                    key={id}
                    id={id}
                    data={sample}
                    to="/templates"
                    className="h-full"
                  />
                )),
                <Link
                  key="__all"
                  to="/templates"
                  className="group flex h-full min-h-[220px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/60 p-4 text-center transition-all duration-200 hover:border-accent/40 hover:bg-accent/[0.05]"
                >
                  <span className="h-10 w-10 rounded-full bg-accent/10 text-accent flex items-center justify-center transition-transform duration-200 group-hover:scale-105 group-hover:translate-x-0.5">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                  <span className="text-[12.5px] font-semibold">All {totalTemplates} designs</span>
                  <span className="text-[11px] text-muted-foreground">Search and filter the full gallery</span>
                </Link>,
              ]}
            />
          </Reveal>

          <Reveal className="mt-3">
            <p className="text-[11.5px] text-muted-foreground">
              Design previews use sample content. Your resume only ever contains what you enter.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section id="start" className="px-4 lg:px-8 pb-16 scroll-mt-20">
        <Reveal className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-card p-8 lg:p-12 text-center">
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
              <div className="aurora animate-aurora opacity-70" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel text-accent text-[11px] font-semibold uppercase tracking-[0.12em] mb-4">
                <Sparkles className="h-3.5 w-3.5" /> Under a minute
              </div>
              <h2 className="font-display text-[24px] lg:text-[30px] font-bold tracking-tight">Ready to build your resume?</h2>
              <p className="text-[14.5px] text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
                Start with your contact details, pick a design, and be editing a real resume in under a
                minute.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-7">
                <Magnetic>
                  <Button
                    size="lg"
                    className="btn-gradient h-12 px-8 text-[15px] font-semibold rounded-xl gap-2 w-full sm:w-auto group/cta"
                    onClick={() => navigate('/create')}
                  >
                    Create My Resume
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
                  </Button>
                </Magnetic>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-[15px] rounded-xl w-full sm:w-auto border-border/70 hover:border-accent/40 hover:bg-accent/[0.06]"
                  onClick={() => navigate('/resumes')}
                >
                  My Resumes
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="px-4 lg:px-8 pb-10">
        <div className="max-w-5xl mx-auto border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-muted-foreground">
            AI Resume Craft — build a resume that gets noticed.
          </p>
          <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
            <Link to="/templates" className="hover:text-foreground transition-colors">Templates</Link>
            <Link to="/resumes" className="hover:text-foreground transition-colors">My Resumes</Link>
            <Link to="/settings" className="hover:text-foreground transition-colors">Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
