import { useNavigate } from 'react-router-dom';
import Carousel from '@/components/Carousel';
import { Button } from '@/components/ui/button';
import { PenLine, Palette, Briefcase, Download, ArrowRight, Check } from 'lucide-react';

/**
 * Hero/content slider for the landing page.
 *
 * Built on the shared Carousel (arrows, dots, slide counter, autoplay with
 * pause-on-interaction, touch swipe, reduced-motion aware). Pure DOM/CSS —
 * no image libraries.
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
    eyebrow: 'Details-first setup',
    title: 'Create a Professional Resume',
    desc: 'Start with a short guided form — your name, contact details and a professional summary — then watch them land in a recruiter-ready design. Nothing is ever pre-filled for you.',
    bullets: ['Guided 5-step setup', 'Your information, and only yours'],
    cta: { label: 'Create My Resume', to: '/create' },
  },
  {
    icon: Palette,
    eyebrow: '25 original designs',
    title: 'Customize Your Design',
    desc: 'Browse full-page template previews and switch designs whenever you like. Your content stays exactly the same — only the layout, typography and colour change.',
    bullets: ['Live A4 preview while you edit', 'Switch templates without losing data'],
    cta: { label: 'Explore Templates', to: '/templates' },
  },
  {
    icon: Briefcase,
    eyebrow: 'Every section that matters',
    title: 'Build a Job-Ready Resume',
    desc: 'Add experience, education, skills, projects and certifications in a focused editor. Reorder, hide or grow each section — the preview updates as you type.',
    bullets: ['Add, edit, reorder and delete entries', 'Autosaved locally in your browser'],
    cta: { label: 'Start Building', to: '/create' },
  },
  {
    icon: Download,
    eyebrow: 'One-click export',
    title: 'Export & Share Your Resume',
    desc: 'Download a clean, selectable-text A4 PDF that matches the live preview exactly — multi-page aware, ready to attach to any application.',
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
                  <Check className="mt-0.5 h-3.5 w-3.5 text-emerald-500 shrink-0" aria-hidden />
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

  return (
    <Carousel
      variant="hero"
      slides={slides}
      slideLabels={SLIDES.map((s) => s.title)}
      ariaLabel="AI Resume Craft highlights"
    />
  );
}
