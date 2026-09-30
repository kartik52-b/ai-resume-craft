import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/useInteraction';

/**
 * Reusable horizontal carousel used across the main pages.
 *
 * - Smooth translateX sliding with prev/next arrows and dot indicators
 * - Mouse click-and-drag (grab / grabbing cursors) — a drag past the threshold
 *   never "clicks" the slide it started on
 * - Horizontal trackpad gesture advances a slide; vertical wheel/touch keeps
 *   scrolling the page normally
 * - Touch swipe on mobile, arrow keys on any focused control
 * - Autoplay that runs continuously and loops 1 → 2 → 3 → 4 → 1 forever, pausing
 *   on hover, keyboard focus, touch and hidden tabs, and via the pause button;
 *   any manual interaction restarts the autoplay timer
 * - Honors `prefers-reduced-motion` (no autoplay, no sliding animation)
 * - Fully controlled by the consumer: one child per slide
 */

export interface CarouselProps {
  /** One node per slide. */
  slides: ReactNode[];
  /** Accessible name for the whole carousel region. */
  ariaLabel: string;
  /** Optional per-slide labels (used for dot aria-labels). */
  slideLabels?: string[];
  /**
   * Autoplay interval in ms. 0 disables autoplay. Default 4500 — long enough
   * to read a slide, short enough that the carousel never looks stalled.
   */
  autoplayMs?: number;
  /** Slim variant for tight spaces (editor banner, dashboard strip). */
  compact?: boolean;
  className?: string;
}

const DEFAULT_AUTOPLAY_MS = 4500;
const SWIPE_THRESHOLD_PX = 40;
const DRAG_THRESHOLD_PX = 8;
const WHEEL_COOLDOWN_MS = 420;

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
  const reducedMotion = usePrefersReducedMotion();

  // Mouse drag state (transform offset is mirrored into state for rendering).
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<number | null>(null);
  const dragDx = useRef(0);
  const dragMoved = useRef(false);
  const dragFrame = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const wheelLock = useRef(0);

  // Hidden tab pauses autoplay.
  useEffect(() => {
    const onVisibility = () => setHiddenTab(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Any pending drag frame is dropped on unmount.
  useEffect(() => () => {
    if (dragFrame.current !== null) cancelAnimationFrame(dragFrame.current);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const autoplayActive =
    autoplayMs > 0 && count > 1 && !hoverPaused && !focusPaused && !touchPaused && !hiddenTab && !userPaused && !reducedMotion;

  // Autoplay — restarts whenever the index changes (i.e. after any interaction),
  // so a manual navigation always grants the full dwell time.
  useEffect(() => {
    if (!autoplayActive) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), autoplayMs);
    return () => window.clearInterval(id);
  }, [autoplayActive, autoplayMs, index, count]);

  /* ── Mouse drag ─────────────────────────────────────────────────────────── */

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (count < 2 || e.pointerType === 'touch' || e.button !== 0) return;
    dragStart.current = e.clientX;
    dragDx.current = 0;
    dragMoved.current = false;
    setDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture is a nicety, not a requirement */
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    const dx = e.clientX - dragStart.current;
    if (Math.abs(dx) > DRAG_THRESHOLD_PX) dragMoved.current = true;
    dragDx.current = dx;
    if (dragFrame.current !== null) return;
    dragFrame.current = requestAnimationFrame(() => {
      dragFrame.current = null;
      setDragX(dragDx.current);
    });
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    const dx = dragDx.current;
    if (dragFrame.current !== null) {
      cancelAnimationFrame(dragFrame.current);
      dragFrame.current = null;
    }
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    dragStart.current = null;
    dragDx.current = 0;
    setDragging(false);
    setDragX(0);
    if (Math.abs(dx) >= SWIPE_THRESHOLD_PX) goTo(index + (dx < 0 ? 1 : -1));
  };

  /** A drag must never trigger a button/link on the slide it started on. */
  const onClickCapture = (e: ReactMouseEvent) => {
    if (!dragMoved.current) return;
    dragMoved.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  /* ── Touch, wheel and keyboard ──────────────────────────────────────────── */

  const onTouchStart = (e: ReactTouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setTouchPaused(true);
  };

  const onTouchEnd = (e: ReactTouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    setTouchPaused(false);
    if (start === null) return;
    const delta = e.changedTouches[0].clientX - start;
    if (Math.abs(delta) >= SWIPE_THRESHOLD_PX) goTo(index + (delta < 0 ? 1 : -1));
  };

  /** Horizontal trackpad gestures only — vertical wheel keeps scrolling the page. */
  const onWheel = (e: ReactWheelEvent<HTMLElement>) => {
    if (count < 2) return;
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 8) return;
    const now = Date.now();
    if (now - wheelLock.current < WHEEL_COOLDOWN_MS) return;
    wheelLock.current = now;
    goTo(index + (e.deltaX > 0 ? 1 : -1));
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLElement>) => {
    if (count < 2) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(index - 1);
    }
  };

  if (count === 0) return null;

  const btnClass = cn(
    compact ? 'h-6 w-6 rounded-md' : 'h-8 w-8 rounded-lg',
    'flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors shrink-0',
  );
  const dotClass = (active: boolean) =>
    cn(
      'rounded-full transition-all duration-300',
      compact ? 'h-1.5' : 'h-2',
      active
        ? compact
          ? 'w-4 bg-accent'
          : 'w-6 bg-accent'
        : cn(compact ? 'w-1.5' : 'w-2', 'bg-muted-foreground/30 hover:bg-muted-foreground/50'),
    );

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className={cn(
        'overflow-hidden',
        compact ? 'rounded-md border border-border bg-muted/30' : 'rounded-lg border border-border bg-card',
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
      onWheel={onWheel}
      onKeyDown={onKeyDown}
      onClickCapture={onClickCapture}
    >
      {/* Slides */}
      <div
        className={cn('relative overflow-hidden', count > 1 && 'draggable-area')}
        data-dragging={dragging}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          className={cn('flex will-change-transform', dragging && 'select-none')}
          style={{
            transform: `translate3d(calc(${-index * 100}% + ${dragX}px), 0, 0)`,
            transition: dragging || reducedMotion ? 'none' : 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
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
          'flex items-center justify-between gap-3 border-t border-border bg-muted/20',
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
