import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useResume } from '@/context/ResumeContext';
import { TEMPLATE_REGISTRY, getTemplate } from '@/lib/templateRegistry';
import { getSampleResume } from '@/lib/sampleResume';
import type { ResumeData } from '@/types/resume';
import ResumeThumbnail from '@/components/ResumeThumbnail';
import ScrollRail from '@/components/ScrollRail';
import Reveal from '@/components/Reveal';
import TemplateTile from '@/components/TemplateTile';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

/* ── Content ─────────────────────────────────────────────────────────────── */

const FACTS = ['25 resume designs', '6 editable sections', 'Nothing uploaded'];

/** The four movements of the product, as an editorial walkthrough (01…04). */
const STEPS = [
  {
    num: '01',
    label: 'Create',
    title: 'Start with your details',
    desc: 'Name, email and phone are enough to open a real resume. No account, nothing uploaded.',
  },
  {
    num: '02',
    label: 'Choose',
    title: 'Pick the structure',
    desc: 'Twenty-five layouts — single column, sidebar, editorial, compact — each previewed as a full A4 page.',
  },
  {
    num: '03',
    label: 'Customize',
    title: 'Fill in your background',
    desc: 'Experience, education, skills, projects and certifications, every section editable in place.',
  },
  {
    num: '04',
    label: 'Export',
    title: 'Download the PDF',
    desc: 'Selectable-text A4 pages that match the preview exactly, ready to send.',
  },
];

/**
 * Hero parallax.
 *
 * One rAF-throttled pointer listener writes the cursor position into
 * `--hero-x` / `--hero-y` (-0.5 … 0.5) on the hero stage; CSS does the rest.
 * Touch devices and reduced-motion visitors never attach it, so the sheet is
 * simply still for them.
 */
function useHeroStage() {
  const ref = useRef<HTMLDivElement>(null);
  const [engaged, setEngaged] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const move = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        element.style.setProperty('--hero-x', x.toFixed(3));
        element.style.setProperty('--hero-y', y.toFixed(3));
      });
    };
    const settle = () => {
      cancelAnimationFrame(frame);
      element.style.setProperty('--hero-x', '0');
      element.style.setProperty('--hero-y', '0');
    };
    const enter = () => setEngaged(true);
    const leave = () => { settle(); setEngaged(false); };

    element.addEventListener('pointerenter', enter);
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener('pointerenter', enter);
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', leave);
    };
  }, []);

  return { ref, engaged };
}

/** Designs used in the interactive showcase. */
const SHOWCASE_IDS: ResumeData['template'][] = [
  'professional', 'modern', 'two-column', 'executive', 'developer', 'academic',
];

const RAIL_TEMPLATE_IDS: ResumeData['template'][] = [
  'modern', 'professional', 'minimal', 'creative', 'executive', 'developer',
  'elegant', 'two-column', 'startup', 'engineering', 'finance', 'designer',
];

/* ── Page ────────────────────────────────────────────────────────────────── */

const LandingPage = () => {
  const navigate = useNavigate();
  const { hasResume } = useResume();
  const sample = useMemo(() => getSampleResume(), []);
  const [showcase, setShowcase] = useState<ResumeData['template']>('professional');
  const { ref: heroRef, engaged } = useHeroStage();
  const totalTemplates = TEMPLATE_REGISTRY.length;
  const showcaseName = getTemplate(showcase).label;

  return (
    <div className="min-h-full bg-background">
      {/* ══ Hero ═══════════════════════════════════════════════════════════════
          The resume is the hero visual: one real A4 sheet, with the page's own
          paper tones (ivory, beige, antique bronze, a whisper of teal) drifting
          behind it. */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 lg:px-8 py-14 lg:py-24 grid lg:grid-cols-[1.02fr_0.98fr] gap-12 lg:gap-16 items-center">
          <div>
            <p className="eyebrow mb-5 animate-fade-down">Resume design studio</p>
            <h1 className="font-display text-balance text-[34px] sm:text-[44px] lg:text-[54px] font-semibold leading-[1.07] tracking-[-0.015em] text-foreground animate-fade-up">
              <span className="block">Create a professional</span>{' '}
              <span className="block">resume without the</span>{' '}
              <span className="block">
                <span className="text-bronze">busywork</span>.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-[16.5px] leading-relaxed text-muted-foreground animate-fade-up">
              Beautiful templates. Smart suggestions. Complete control.
              Everything stays in your browser.
            </p>

            <div className="rule-bronze mt-8 animate-fade-up" aria-hidden />

            <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-up">
              <Button
                size="lg"
                className="h-11 px-6 rounded-md text-[14px] font-medium gap-2"
                onClick={() => navigate('/create')}
              >
                Create My Resume
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-6 rounded-md text-[14px]"
                onClick={() => navigate('/templates')}
              >
                Explore Templates
              </Button>
            </div>

            <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-muted-foreground animate-fade-up">
              {FACTS.map((fact) => (
                <li key={fact} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-bronze" aria-hidden />
                  {fact}
                </li>
              ))}
            </ul>

            {hasResume && (
              <p className="mt-6 text-[12.5px] text-muted-foreground animate-fade-up">
                Already started?{' '}
                <Link to="/resumes" className="text-foreground underline decoration-border underline-offset-4 hover:decoration-bronze">
                  Open My Resumes
                </Link>
              </p>
            )}
          </div>

          {/* One sheet of paper on a desk. */}
          <div
            ref={heroRef}
            data-engaged={engaged ? 'true' : 'false'}
            className="hero-stage relative isolate flex justify-center lg:justify-end animate-fade-up"
          >
            {/* Decorative shapes — ivory, beige, bronze and a hint of teal.
                Kept soft and large rather than blobby: they set the light. */}
            <span
              aria-hidden
              className="hero-shape pointer-events-none absolute -left-8 -top-6 hidden h-[240px] w-[240px] rounded-full sm:block"
              style={{ '--hero-k': '-18px', background: 'radial-gradient(circle at 45% 45%, hsl(var(--bronze) / 0.15), transparent 68%)' } as CSSProperties}
            />
            <span
              aria-hidden
              className="hero-shape pointer-events-none absolute -bottom-12 right-0 hidden h-[280px] w-[280px] rounded-full sm:block"
              style={{ '--hero-k': '14px', background: 'radial-gradient(circle at 50% 50%, hsl(var(--teal) / 0.10), transparent 70%)' } as CSSProperties}
            />
            <span
              aria-hidden
              className="hero-shape pointer-events-none absolute -top-16 left-1/4 hidden h-[260px] w-[260px] rounded-full sm:block"
              style={{ '--hero-k': '-7px', background: 'radial-gradient(circle at 50% 50%, hsl(var(--card)), transparent 72%)' } as CSSProperties}
            />

            <figure className="relative w-full max-w-[330px]">
              <div className="hero-sheet paper relative aspect-[210/297] w-full overflow-hidden border border-border">
                <ResumeThumbnail data={sample} />
              </div>
              <figcaption className="mt-4 flex items-center justify-between text-[11.5px] text-muted-foreground">
                <span>Design preview · sample content</span>
                <span className="font-mono text-[10.5px] tabular-nums">{sample.personal.fullName}</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ══ Walkthrough — 01 … 04, editorial rather than carded ═════════════ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 lg:px-8 py-16 lg:py-24">
          <Reveal>
            <div className="max-w-2xl">
              <p className="eyebrow mb-4">How it works</p>
              <h2 className="font-display text-[26px] lg:text-[34px] font-semibold leading-tight text-foreground">
                Four steps, no blank page.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                A short guided setup puts your details into the design. Everything
                after that happens in the editor, section by section.
              </p>
            </div>
          </Reveal>

          <ol className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.num} className="border-t border-border pt-5">
                <Reveal delayMs={i * 70}>
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-display text-[21px] font-semibold leading-none tabular-nums text-bronze">
                      {step.num}
                    </span>
                    <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {step.label}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-[18px] font-semibold leading-snug text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{step.desc}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ══ Live showcase — switch designs on real content ══════════════════ */}
      <section className="border-b border-border bg-workspace">
        <div className="mx-auto max-w-6xl px-5 lg:px-8 py-14 lg:py-20 grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-center">
          <Reveal>
            <p className="eyebrow mb-3">One resume, many designs</p>
            <h2 className="font-display text-[26px] lg:text-[32px] font-semibold leading-tight text-foreground">
              Swap the layout, keep the words.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Every template reads the same resume data. Pick a different design
              and only the layout, typography and colour change — your content is
              untouched.
            </p>

            <div className="mt-7">
              <p className="mb-2.5 text-[11.5px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                Showing · {showcaseName}
              </p>
              <div className="grid grid-cols-3 gap-2 max-w-md">
                {SHOWCASE_IDS.map((id) => {
                  const active = id === showcase;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setShowcase(id)}
                      aria-pressed={active}
                      className={cn(
                        'relative aspect-[210/297] overflow-hidden rounded-sm border bg-card transition-colors',
                        active ? 'border-bronze' : 'border-border hover:border-foreground/30',
                      )}
                    >
                      <ResumeThumbnail data={{ ...sample, template: id }} />
                      {active && <span aria-hidden className="absolute inset-0 ring-1 ring-inset ring-bronze/60" />}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground capitalize">
                {getTemplate(showcase).layoutType.replace('-', ' ')} · {getTemplate(showcase).bestFor}
              </p>
            </div>

            <Button
              variant="outline"
              className="mt-6 h-10 rounded-md gap-2"
              onClick={() => navigate('/templates')}
            >
              Browse all {totalTemplates} designs
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Reveal>

          <Reveal className="flex justify-center lg:justify-end">
            <figure className="w-full max-w-[400px]">
              <div className="relative aspect-[210/297] w-full overflow-hidden border border-border paper">
                <ResumeThumbnail data={{ ...sample, template: showcase }} />
              </div>
              <figcaption className="mt-3 text-[11.5px] text-muted-foreground">
                {showcaseName} · rendered from the same content
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ══ Editorial two-up: writing help & ownership ══════════════════════ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 lg:px-8 py-14 lg:py-20 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="eyebrow mb-3">Writing help</p>
            <h2 className="font-display text-[24px] lg:text-[28px] font-semibold leading-tight text-foreground">
              Help with the wording, when you want it.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Summaries, bullet points and project descriptions can be rewritten
              for clarity or impact. Every suggestion appears as a draft — you
              read it, then apply or discard it.
            </p>

            {/* A quiet demonstration of the real interaction. */}
            <div className="mt-6 rounded-md border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-foreground">Professional summary</span>
                <span className="text-[11.5px] text-muted-foreground">Improve with AI</span>
              </div>
              <p className="mt-2.5 rounded border border-border bg-background p-3 text-[12px] leading-relaxed text-foreground/85">
                Product engineer with eight years building and maintaining
                customer-facing web platforms.
              </p>
              <div className="mt-3 flex gap-2">
                <span className="inline-flex h-7 items-center rounded-md bg-primary px-3 text-[11.5px] font-medium text-primary-foreground">
                  Apply
                </span>
                <span className="inline-flex h-7 items-center rounded-md border border-border px-3 text-[11.5px] text-muted-foreground">
                  Discard
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <p className="eyebrow mb-3">Ownership</p>
            <h2 className="font-display text-[24px] lg:text-[28px] font-semibold leading-tight text-foreground">
              Your content stays yours.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Resumes are saved in this browser. No account, no upload, no
              watermark. Create once and refine it any time.
            </p>

            <dl className="mt-6 divide-y divide-border border-y border-border">
              {[
                { k: 'Stored', v: 'Locally, in your browser' },
                { k: 'Account', v: 'Not required' },
                { k: 'Export', v: 'Clean, selectable-text A4 PDF' },
                { k: 'Designs', v: 'Change any time, content intact' },
              ].map((row) => (
                <div key={row.k} className="flex items-baseline justify-between gap-6 py-3">
                  <dt className="text-[12px] uppercase tracking-[0.08em] text-muted-foreground">{row.k}</dt>
                  <dd className="text-[13.5px] text-foreground text-right">{row.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ══ Design rail ═════════════════════════════════════════════════════ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 lg:px-8 py-14 lg:py-20">
          <Reveal className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div className="max-w-2xl">
              <p className="eyebrow mb-3">The collection</p>
              <h2 className="font-display text-[26px] lg:text-[32px] font-semibold leading-tight text-foreground">
                {totalTemplates} designs, genuinely different.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                Single column, sidebar, editorial, timeline, compact — different
                structures, not recolours of one layout.
              </p>
            </div>
            <Button variant="outline" className="h-10 rounded-md gap-2" onClick={() => navigate('/templates')}>
              Open the gallery
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Reveal>

          <Reveal>
            <ScrollRail
              ariaLabel="Featured resume designs"
              itemClassName="w-[168px] sm:w-[186px]"
              // A slow, continuous drift — a showcase shelf rather than a ticker.
              autoScrollSpeed={40}
              items={[
                ...RAIL_TEMPLATE_IDS.map((id) => (
                  <TemplateTile key={id} id={id} data={sample} to="/templates" className="h-full" />
                )),
                <Link
                  key="__all"
                  to="/templates"
                  className="group flex h-full min-h-[232px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card p-4 text-center transition-colors hover:border-foreground/30"
                >
                  <span className="text-[12.5px] font-semibold text-foreground">All {totalTemplates} designs</span>
                  <span className="text-[11px] text-muted-foreground">Search and filter the gallery</span>
                  <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5" />
                </Link>,
              ]}
            />
          </Reveal>

          <Reveal className="mt-3">
            <p className="text-[11.5px] text-muted-foreground">
              Design previews use sample content — your resume only ever contains what you enter.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══ Closing CTA ═════════════════════════════════════════════════════ */}
      <section>
        <div className="mx-auto max-w-6xl px-5 lg:px-8 py-14 lg:py-20">
          <Reveal>
            <div className="rounded-lg border border-border bg-card px-6 py-10 lg:px-12 lg:py-14 text-center">
              <h2 className="font-display text-[26px] lg:text-[32px] font-semibold leading-tight text-foreground">
                Ready when you are.
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
                Start with your contact details. You will be editing a real
                resume in under a minute.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" className="h-11 px-7 rounded-md gap-2" onClick={() => navigate('/create')}>
                  Create My Resume
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="h-11 px-7 rounded-md" onClick={() => navigate('/resumes')}>
                  My Resumes
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 lg:px-8 py-7 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-muted-foreground">
            AI Resume Craft — resumes, designed properly.
          </p>
          <nav className="flex items-center gap-5 text-[12px] text-muted-foreground" aria-label="Footer">
            <Link to="/templates" className="hover:text-foreground transition-colors">Templates</Link>
            <Link to="/resumes" className="hover:text-foreground transition-colors">My Resumes</Link>
            <Link to="/settings" className="hover:text-foreground transition-colors">Settings</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
