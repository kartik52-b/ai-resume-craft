import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Reusable horizontal carousel used across the main pages.
 *
 * - Smooth translateX sliding with prev/next arrows and dot indicators
 * - Autoplay that pauses on hover, keyboard focus, touch, hidden tabs and via
 *   the pause button; any manual interaction restarts the autoplay timer
 * - Touch/swipe gestures on mobile
 * - Honors `prefers-reduced-motion` (never auto-advances)
 * - Fully controlled by the consumer: one child per slide
 */

export interface CarouselProps {
  /** One node per slide. */
  slides: ReactNode[];
  /** Accessible name for the whole carousel region. */
  ariaLabel: string;
  /** Optional per-slide labels (used for dot aria-labels). */
  slideLabels?: string[];
  /** Autoplay interval in ms. 0 disables autoplay. Default 6000. */
  autoplayMs?: number;
  /** Slim variant for tight spaces (editor banner, dashboard strip). */
  compact?: boolean;
  className?: string;
}

const DEFAULT_AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD_PX = 40;

export default function Carousel({
  slides,
  ariaLabel,
  slideLabels,
  autoplayMs = DEFAULT_AUTOPLAY_MS,
  compact = false,
  className,
}: CarouselProps) {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [touchPaused, setTouchPaused] = useState(false);
  const [hiddenTab, setHiddenTab] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Reduced-motion preference.
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  // Hidden tab pauses autoplay.
  useEffect(() => {
    const onVisibility = () => setHiddenTab(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const goTo = useCallback((next: number) => {
    if (count === 0) return;
    setIndex(((next % count) + count) % count);
  }, [count]);

  const autoplayActive =
    autoplayMs > 0 && count > 1 && !hoverPaused && !focusPaused && !touchPaused && !hiddenTab && !userPaused && !reducedMotion;

  // Autoplay — restarts whenever the index changes (i.e. after any interaction),
  // so a manual navigation always grants the full dwell time.
  useEffect(() => {
    if (!autoplayActive) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), autoplayMs);
    return () => window.clearInterval(id);
  }, [autoplayActive, autoplayMs, index, count]);

  if (count === 0) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setTouchPaused(true);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    setTouchPaused(false);
    if (start === null) return;
    const delta = e.changedTouches[0].clientX - start;
    if (Math.abs(delta) >= SWIPE_THRESHOLD_PX) {
      goTo(index + (delta < 0 ? 1 : -1));
    }
  };

  const btnClass = cn(
    compact ? 'h-6 w-6 rounded-md' : 'h-8 w-8 rounded-lg',
    'flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors shrink-0',
  );
  const dotClass = (active: boolean) =>
    cn(
      'rounded-full transition-all duration-300',
      compact ? 'h-1.5' : 'h-2',
      active ? (compact ? 'w-4 bg-accent' : 'w-6 bg-accent') : cn(compact ? 'w-1.5' : 'w-2', 'bg-muted-foreground/30 hover:bg-muted-foreground/50'),
    );

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className={cn(
        'overflow-hidden',
        compact
          ? 'rounded-lg border border-border/60 bg-muted/30'
          : 'rounded-2xl border border-border/60 bg-card shadow-card',
        className,
      )}
      onPointerEnter={(e) => e.pointerType !== 'touch' && setHoverPaused(true)}
      onPointerLeave={() => setHoverPaused(false)}
      onFocusCapture={() => setFocusPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusPaused(false);
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out will-change-transform"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={slideLabels?.[i] ? `${i + 1} of ${count}: ${slideLabels[i]}` : `${i + 1} of ${count}`}
              aria-hidden={i !== index}
              className="min-w-full shrink-0"
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div
        className={cn(
          'flex items-center justify-between gap-3 border-t border-border/60 bg-muted/20',
          compact ? 'px-3 py-1.5' : 'px-5 sm:px-8 py-3.5',
        )}
      >
        <div className="flex items-center gap-2" role="tablist" aria-label={`Choose slide — ${ariaLabel}`}>
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={slideLabels?.[i] ? `Go to slide ${i + 1}: ${slideLabels[i]}` : `Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={dotClass(i === index)}
            />
          ))}
          {!compact && (
            <span className="ml-2 text-[11.5px] text-muted-foreground tabular-nums hidden sm:block" aria-live="polite">
              {index + 1} / {count}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {autoplayMs > 0 && (
            <button
              type="button"
              onClick={() => setUserPaused((v) => !v)}
              aria-label={userPaused ? 'Resume autoplay' : 'Pause autoplay'}
              title={userPaused ? 'Resume autoplay' : 'Pause autoplay'}
              className={btnClass}
            >
              {userPaused ? <Play className={compact ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} /> : <Pause className={compact ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} />}
            </button>
          )}
          <button type="button" onClick={() => goTo(index - 1)} aria-label="Previous slide" className={btnClass}>
            <ArrowLeft className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
          </button>
          <button type="button" onClick={() => goTo(index + 1)} aria-label="Next slide" className={btnClass}>
            <ArrowRight className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
          </button>
        </div>
      </div>
    </section>
  );
}
