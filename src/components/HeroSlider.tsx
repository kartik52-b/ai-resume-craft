import { useNavigate } from 'react-router-dom';
import Carousel from '@/components/Carousel';
import { Button } from '@/components/ui/button';
import { PenLine, Clock, Trophy, Download, ArrowRight } from 'lucide-react';

/**
 * Hero/content slider for the landing page.
 *
 * Built on the shared Carousel (arrows, dots, autoplay with pause-on-interaction,
 * touch swipe, reduced-motion aware). Pure DOM/CSS — no images, no libraries.
 */

interface Slide {
  icon: typeof PenLine;
  eyebrow: string;
  title: string;
  desc: string;
  bullets: string[];
  cta: { label: string; to: string };
}

const SLIDES: Slide[] = [
  {
    icon: PenLine,
    eyebrow: 'Professional templates',
    title: 'Build a Professional Resume',
    desc: 'Start with a short guided form — your name, contact details and a professional summary — then watch it land in a recruiter-ready design. Nothing is ever pre-filled for you.',
    bullets: ['Details-first guided setup', '25 premium, ATS-safe layouts'],
    cta: { label: 'Create My Resume', to: '/create' },
  },
  {
    icon: Clock,
    eyebrow: 'Guided setup',
    title: 'Create Your Resume in Minutes',
    desc: 'Three short steps — your details, your background, your design — and you are editing a real resume with a live A4 preview beside you.',
    bullets: ['Edit every section with instant preview', 'Saved locally as you type'],
    cta: { label: 'Start Now', to: '/create' },
  },
  {
    icon: Trophy,
    eyebrow: 'ATS-friendly',
    title: 'Stand Out From Other Candidates',
    desc: 'A transparent 100-point resume health score, AI-assisted rewriting and keyword-aware structure help you rise past applicant tracking systems — with you approving every change.',
    bullets: ['100-point resume health score', 'AI suggestions reviewed by you'],
    cta: { label: 'Explore Templates', to: '/templates' },
  },
  {
    icon: Download,
    eyebrow: 'One-click export',
    title: 'Download a Job-Ready Resume',
    desc: 'Export a clean, selectable-text A4 PDF that matches the live preview exactly — multi-page aware, with automatic page numbers.',
    bullets: ['Selectable-text, multi-page PDF', 'What you see is what you export'],
    cta: { label: 'Create My Resume', to: '/create' },
  },
];

export default function HeroSlider() {
  const navigate = useNavigate();

  const slides = SLIDES.map((slide) => {
    const Icon = slide.icon;
    return (
      <div className="p-6 sm:p-8 lg:p-10">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-10 items-center">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-[11px] font-semibold uppercase tracking-[0.12em] mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
              {slide.eyebrow}
            </div>
            <h2 className="text-[22px] sm:text-[26px] lg:text-[30px] font-bold tracking-tight text-foreground leading-tight">
              {slide.title}
            </h2>
            <p className="text-[14px] sm:text-[15px] text-muted-foreground mt-3 leading-relaxed max-w-xl">
              {slide.desc}
            </p>
            <ul className="mt-4 space-y-2">
              {slide.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-[13px] text-foreground/80">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
            <Button
              className="btn-gradient mt-6 h-10 px-5 rounded-xl text-[13.5px] font-semibold gap-2"
              onClick={() => navigate(slide.cta.to)}
            >
              {slide.cta.label} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Visual panel — icon composition using the existing design tokens */}
          <div className="hidden sm:flex items-center justify-center" aria-hidden>
            <div className="relative h-[170px] w-[170px] lg:h-[200px] lg:w-[200px]">
              <div
                className="absolute inset-0 rounded-3xl opacity-70 blur-2xl"
                style={{ background: 'radial-gradient(circle, hsl(var(--accent) / 0.25) 0%, transparent 70%)' }}
              />
              <div className="absolute inset-0 rounded-3xl border border-accent/15 bg-accent/[0.05]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon className="h-16 w-16 lg:h-20 lg:w-20 text-accent" strokeWidth={1.25} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  });

  return <Carousel slides={slides} slideLabels={SLIDES.map((s) => s.title)} ariaLabel="AI Resume Craft highlights" />;
}
