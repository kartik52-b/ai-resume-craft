import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useResume } from '@/context/ResumeContext';
import { getTemplate, TEMPLATE_REGISTRY } from '@/lib/templateRegistry';
import { getSampleResume } from '@/lib/sampleResume';
import ResumeThumbnail from '@/components/ResumeThumbnail';
import HeroSlider from '@/components/HeroSlider';
import Carousel from '@/components/Carousel';
import { Button } from '@/components/ui/button';
import {
  FileText, LayoutTemplate, ArrowRight, Check,
  PenLine, Download, Eye, ListChecks, GraduationCap, FolderOpen, Award, Save, Wrench,
} from 'lucide-react';

/**
 * Landing page.
 *
 * Content rules:
 *  - Only real product features are described (templates, editor, preview,
 *    export, saved resumes). No AI copy, no ATS scoring, no invented stats.
 *  - Sample content is used exclusively for the design previews and is
 *    labelled as such; it is never written into a user's resume.
 */

const FEATURES = [
  { icon: LayoutTemplate, title: 'Professional templates', desc: '25 original designs — Modern, Professional, Minimal, Elegant, Executive and more — each with a full-page preview.' },
  { icon: PenLine, title: 'Personal information', desc: 'Name, title, contact details, links and a professional summary. Only you enter your information.' },
  { icon: FileText, title: 'Experience & education', desc: 'Add roles and degrees with dates, bullet points and reorderable entries.' },
  { icon: Wrench, title: 'Skills', desc: 'Type a skill, press Enter, refine the list any time with removable chips.' },
  { icon: FolderOpen, title: 'Projects', desc: 'Showcase work with a name, description, technologies and a link.' },
  { icon: Award, title: 'Certifications', desc: 'List credentials with issuer, date and a link to verify them.' },
  { icon: GraduationCap, title: 'Resume editor', desc: 'A focused editor for every section with add, edit, delete and reorder controls.' },
  { icon: Eye, title: 'Live preview', desc: 'A true A4 page beside your edits — what you see is exactly what exports.' },
  { icon: Save, title: 'Saved resumes', desc: 'Multiple resumes stored locally in your browser, kept safe across refreshes.' },
  { icon: Download, title: 'PDF export', desc: 'Download a clean, selectable-text A4 PDF that matches the preview exactly — multi-page aware.' },
];

const STEPS = [
  {
    num: '01',
    icon: PenLine,
    title: 'Enter Your Details',
    desc: 'Name, email and phone — plus an optional summary, experience and education. Nothing is pre-filled.',
  },
  {
    num: '02',
    icon: LayoutTemplate,
    title: 'Choose Your Design',
    desc: 'Browse full-page template previews and pick the layout that fits you.',
  },
  {
    num: '03',
    icon: FileText,
    title: 'Customize Your Resume',
    desc: 'Build out every section in the editor while the live preview updates as you type.',
  },
  {
    num: '04',
    icon: Download,
    title: 'Download & Share',
    desc: 'Export a clean, selectable-text PDF and attach it to any application.',
  },
];

const FACT_STRIP = [
  { icon: LayoutTemplate, label: 'Professional templates' },
  { icon: PenLine, label: 'Easy editing' },
  { icon: Eye, label: 'Real-time preview' },
  { icon: Download, label: 'PDF export' },
];

const SHOWCASE = ['modern', 'professional', 'minimal', 'elegant', 'executive', 'developer'] as const;

const LandingPage = () => {
  const navigate = useNavigate();
  const { hasResume } = useResume();
  const sample = useMemo(() => getSampleResume(), []);
  const totalTemplates = TEMPLATE_REGISTRY.length;

  return (
    <div className="bg-workspace">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative px-4 lg:px-8 pt-14 lg:pt-20 pb-14 overflow-hidden">
        <div
          className="pointer-events-none absolute -top-40 -right-24 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(var(--accent) / 0.28) 0%, transparent 70%)' }}
          aria-hidden
        />
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-[12px] font-medium mb-6">
              <PenLine className="h-3.5 w-3.5" /> Resume maker
            </div>
            <h1 className="text-[34px] sm:text-[42px] lg:text-[50px] font-bold tracking-tight text-foreground leading-[1.05]">
              Create a Resume That Gets You Noticed.
            </h1>
            <p className="text-[16px] lg:text-[17px] text-muted-foreground mt-5 max-w-xl leading-relaxed">
              Enter your own information, choose a professional design, and create a polished
              resume in minutes — with a live preview and one-click PDF export.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-8">
              <Button
                size="lg"
                className="btn-gradient h-12 px-7 text-[15px] font-semibold rounded-xl gap-2 w-full sm:w-auto"
                onClick={() => navigate('/create')}
              >
                Create My Resume <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-7 text-[15px] rounded-xl w-full sm:w-auto"
                onClick={() => navigate('/templates')}
              >
                Explore Templates
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 text-[12.5px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Free to start</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Saved in your browser</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> No account needed</span>
            </div>

            {hasResume && (
              <p className="text-[12.5px] text-muted-foreground mt-5">
                Already started?{' '}
                <Link to="/resumes" className="text-accent hover:underline font-medium">Open My Resumes</Link>
              </p>
            )}
          </div>

          {/* Clean resume visual — a real template rendering with sample content */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-[250px] sm:w-[290px]">
              <div className="absolute -inset-4 rounded-3xl bg-accent/[0.06] border border-accent/10" aria-hidden />
              <div className="relative rounded-xl overflow-hidden border border-border/60 shadow-modal bg-white">
                <div className="relative aspect-[210/297]">
                  <ResumeThumbnail data={sample} />
                </div>
              </div>
              <div className="absolute -left-4 bottom-8 rounded-xl border border-border/60 bg-card px-3.5 py-2.5 shadow-card">
                <div className="flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5 text-accent" />
                  <span className="text-[11px] font-semibold">Live A4 preview</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hero content slider ───────────────────────────────────────── */}
      <section className="px-4 lg:px-8 pb-14" aria-label="Product highlights">
        <div className="max-w-6xl mx-auto">
          <HeroSlider />
        </div>
      </section>

      {/* ── Value strip ──────────────────────────────────────────────────── */}
      <section className="px-4 lg:px-8 pb-14" aria-label="What you get">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FACT_STRIP.map(({ icon: Icon, label }) => (
            <div key={label} className="rounded-xl border border-border/60 bg-card px-4 py-4 text-center">
              <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-2">
                <Icon className="h-4 w-4 text-accent" aria-hidden />
              </div>
              <div className="text-[13px] font-medium text-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="px-4 lg:px-8 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-9">
            <h2 className="text-[22px] lg:text-[26px] font-bold tracking-tight">Four steps to a finished resume</h2>
            <p className="text-[14px] text-muted-foreground mt-2 max-w-xl mx-auto">
              A short guided setup puts your details into the design, then you build the rest
              section by section with a live preview.
            </p>
          </div>
          <Carousel
            variant="showcase"
            perView={{ base: 1, sm: 2, lg: 4 }}
            breakpoints={{ sm: 440, lg: 960 }}
            ariaLabel="How AI Resume Craft works"
            slideLabels={STEPS.map((s) => `Step ${s.num}: ${s.title}`)}
            slides={STEPS.map(({ num, icon: Icon, title, desc }) => (
              <div key={num} className="relative rounded-xl border border-border/60 bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-accent" aria-hidden />
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground/50 tabular-nums">{num}</span>
                </div>
                <h3 className="text-[14px] font-semibold mb-1">{title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          />
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="px-4 lg:px-8 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="text-[22px] lg:text-[26px] font-bold tracking-tight">Everything a modern resume needs</h2>
            <p className="text-[14px] text-muted-foreground mt-2 max-w-2xl">
              Structure, design and formatting handled in one place — with your own information
              always in control.
            </p>
          </div>
          <Carousel
            variant="showcase"
            perView={{ base: 1, sm: 2, lg: 4 }}
            breakpoints={{ sm: 440, lg: 960 }}
            ariaLabel="Resume features"
            slideLabels={FEATURES.map((f) => f.title)}
            slides={FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border/60 bg-card p-5 card-hover">
                <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                  <Icon className="h-4 w-4 text-accent" aria-hidden />
                </div>
                <h3 className="text-[14px] font-semibold mb-1">{title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          />
        </div>
      </section>

      {/* ── Template showcase ────────────────────────────────────────────── */}
      <section className="px-4 lg:px-8 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <div>
              <h2 className="text-[22px] lg:text-[26px] font-bold tracking-tight">
                {totalTemplates} designs, one set of content
              </h2>
              <p className="text-[14px] text-muted-foreground mt-2 max-w-xl">
                Switch designs whenever you like. Your content stays exactly the same — only the
                layout, typography and colour change.
              </p>
            </div>
            <Button variant="outline" className="rounded-xl gap-2" onClick={() => navigate('/templates')}>
              Explore Templates <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <Carousel
            variant="showcase"
            perView={{ base: 2, sm: 3, lg: 4 }}
            breakpoints={{ sm: 440, lg: 960 }}
            gapPx={12}
            ariaLabel="Template showcase"
            slideLabels={SHOWCASE.map((id) => getTemplate(id).label)}
            slides={SHOWCASE.map((id) => {
              const t = getTemplate(id);
              return (
                <Link
                  key={id}
                  to="/templates"
                  className="group rounded-xl border border-border/60 bg-card overflow-hidden card-hover"
                >
                  <div className="relative aspect-[210/297] bg-white overflow-hidden">
                    <ResumeThumbnail data={{ ...sample, template: id }} />
                  </div>
                  <div className="px-2.5 py-2 flex items-center justify-between gap-1">
                    <div className="text-[12.5px] font-medium truncate">{t.label}</div>
                    <span className="text-[11px] text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      Use
                    </span>
                  </div>
                </Link>
              );
            })}
          />
          <p className="text-[11.5px] text-muted-foreground mt-3">
            Design previews use sample content. Your resume only ever contains what you enter.
          </p>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="px-4 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/[0.05] via-card to-card p-8 lg:p-10 text-center">
          <h2 className="text-[24px] lg:text-[28px] font-bold tracking-tight">Ready to build your resume?</h2>
          <p className="text-[14.5px] text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
            Start with your contact details, pick a design, and be editing a real resume in under a
            minute.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-7">
            <Button
              size="lg"
              className="btn-gradient h-12 px-8 text-[15px] font-semibold rounded-xl gap-2 w-full sm:w-auto"
              onClick={() => navigate('/create')}
            >
              Create My Resume <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-[15px] rounded-xl w-full sm:w-auto"
              onClick={() => navigate('/resumes')}
            >
              My Resumes
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="px-4 lg:px-8 pb-10">
        <div className="max-w-5xl mx-auto border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center" aria-hidden>
              <PenLine className="h-3.5 w-3.5 text-white" />
            </span>
            <div>
              <p className="text-[13px] font-bold tracking-tight text-foreground leading-none">AI Resume Craft</p>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">Create a resume that gets you noticed.</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-muted-foreground" aria-label="Footer">
            <Link to="/create" className="hover:text-foreground transition-colors">Create Resume</Link>
            <Link to="/templates" className="hover:text-foreground transition-colors">Templates</Link>
            <Link to="/resumes" className="hover:text-foreground transition-colors">My Resumes</Link>
            <Link to="/settings" className="hover:text-foreground transition-colors">Settings</Link>
            <Link to="/settings#privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/settings#terms" className="hover:text-foreground transition-colors">Terms</Link>
          </nav>
        </div>
        <p className="max-w-5xl mx-auto text-[12px] text-muted-foreground/70 mt-4">
          © {new Date().getFullYear()} AI Resume Craft. Your data stays in your browser.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
