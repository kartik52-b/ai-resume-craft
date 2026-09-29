import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useResume } from '@/context/ResumeContext';
import { getTemplate, TEMPLATE_REGISTRY } from '@/lib/templateRegistry';
import { getSampleResume } from '@/lib/sampleResume';
import ResumeThumbnail from '@/components/ResumeThumbnail';
import HeroSlider from '@/components/HeroSlider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, FileText, Shield, LayoutTemplate, ArrowRight, Check,
  PenLine, Download, Eye, Wand2, ListChecks,
} from 'lucide-react';

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

const SHOWCASE = ['modern', 'developer', 'two-column', 'elegant', 'creative', 'finance'] as const;

const LandingPage = () => {
  const navigate = useNavigate();
  const { hasResume } = useResume();
  const sample = useMemo(() => getSampleResume(), []);
  const totalTemplates = TEMPLATE_REGISTRY.length;

  return (
    <div className="min-h-full bg-workspace overflow-y-auto">
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
              <Sparkles className="h-3.5 w-3.5" /> AI-powered resume builder
            </div>
            <h1 className="text-[34px] sm:text-[42px] lg:text-[50px] font-bold tracking-tight text-foreground leading-[1.05]">
              Build a resume that gets you noticed.
            </h1>
            <p className="text-[16px] lg:text-[17px] text-muted-foreground mt-5 max-w-xl leading-relaxed">
              Create a professional, ATS-friendly resume with premium templates, AI-assisted
              writing, and a live preview.
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

          {/* Live-looking preview of a real template */}
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
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-semibold">Resume health</span>
                  <span className="text-[11px] font-bold text-emerald-500 tabular-nums">92</span>
                </div>
              </div>
              <Badge variant="outline" className="absolute -right-2 top-6 bg-card border-border/60 text-[10px] text-muted-foreground">
                Sample content
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hero content slider ───────────────────────────────────── */}
      <section className="px-4 lg:px-8 pb-14" aria-label="Product highlights">
        <div className="max-w-6xl mx-auto">
          <HeroSlider />
        </div>
      </section>

      {/* ── Fact strip ───────────────────────────────────────────────────── */}
      <section className="px-4 lg:px-8 pb-14">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FACT_STRIP.map((f) => (
            <div key={f.label} className="rounded-xl border border-border/60 bg-card px-4 py-3.5 text-center">
              <div className="text-[20px] font-bold tracking-tight text-foreground leading-none">{f.value}</div>
              <div className="text-[11.5px] text-muted-foreground mt-1">{f.label}</div>
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
              No blank-page paralysis. A short guided setup puts your details into the design, then
              you build the rest section by section.
            </p>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ num, icon: Icon, title, desc }) => (
              <li key={num} className="relative rounded-xl border border-border/60 bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground/50 tabular-nums">{num}</span>
                </div>
                <h3 className="text-[14px] font-semibold mb-1">{title}</h3>
                <p className="text-[12.5px] text-muted-foreground leading-relaxed">{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="px-4 lg:px-8 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="text-[22px] lg:text-[26px] font-bold tracking-tight">Everything a modern resume needs</h2>
            <p className="text-[14px] text-muted-foreground mt-2 max-w-2xl">
              Writing assistance, structure and formatting handled in one place — with you approving
              every change.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border/60 bg-card p-5 card-hover">
                <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                  <Icon className="h-4 w-4 text-accent" />
                </div>
                <h3 className="text-[14px] font-semibold mb-1">{title}</h3>
                <p className="text-[12.5px] text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Design showcase ──────────────────────────────────────────────── */}
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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {SHOWCASE.map((id) => {
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
                  <div className="px-2.5 py-2">
                    <div className="text-[12px] font-medium truncate">{t.label}</div>
                    <div className="text-[10.5px] text-muted-foreground truncate capitalize">{t.category}</div>
                  </div>
                </Link>
              );
            })}
          </div>
          <p className="text-[11.5px] text-muted-foreground mt-3">
            Design previews use sample content. Your resume only ever contains what you enter.
          </p>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
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
