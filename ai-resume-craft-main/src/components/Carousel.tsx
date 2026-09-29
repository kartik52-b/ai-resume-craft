import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
} from 'react';
import { ArrowLeft, ArrowRight, Pause, Play, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Shared carousel system used across every main page.
 *
 * One implementation, several variants — pages never roll their own slider:
 *
 *   hero         full-bleed feature slides (1 per view, autoplay, looping)
 *   cards        generic card rails (1 / 2 / 3 per view)
 *   templates    template preview rails (1 / 2 / 3 per view)
 *   resume-cards saved resume cards (1 / 2 / 3 per view)
 *   showcase     compact showcase rows (1 / 2 / 4 per view)
 *   tips         slim inline tip strips (1 per view, autoplay, small controls)
 *
 * Behaviour:
 *   - responsive visible-card count measured from the real container width
 *     (falls back to the window width where layout is not observable, e.g. jsdom)
 *   - page-based navigation: dots and counter reflect pages, the last page is
 *     end-aligned so no empty gutter ever appears and no content is hidden
 *   - prev/next arrows, dot indicators, slide counter, optional pause button
 *   - keyboard support (Arrow keys / Home / End) and mouse-drag on card rails
 *   - touch swipe, autoplay that pauses on hover, focus, gesture, hidden tab
 *     and via the pause control; honors prefers-reduced-motion (no autoplay)
 *   - inactive slides are aria-hidden + inert so focus never lands off-screen
 *   - controls disappear entirely when everything already fits on one page
 */

export type CarouselVariant =
  | 'hero'
  | 'cards'
  | 'templates'
  | 'resume-cards'
  | 'showcase'
  | 'tips';

export interface CarouselPerView {
  /** Container narrower than 440px (phones). */
  base: number;
  /** 440–699px (large phones / small tablets). */
  sm: number;
  /** 700px and wider (tablets, laptops, desktops). */
  lg: number;
}

interface VariantConfig {
  perView: CarouselPerView;
  /** Container-width thresholds for the sm/lg tiers. */
  breakpoints: { sm: number; lg: number };
  /** Pixel gap between slides. */
  gap: number;
  /** Default autoplay interval; 0 disables autoplay. */
  autoplay: number;
  /** Whether navigation wraps around at either end. */
  loop: boolean;
  /** Whether a slide counter is shown next to the dots. */
  counter: boolean;
  /** Framed variants own their card surface; unframed ones sit on the page. */
  framed: boolean;
  /** Small control sizing for compact strips. */
  small: boolean;
  /** Mouse-drag to advance (card rails only — text-heavy rails keep selection). */
  drag: boolean;
}

const VARIANTS: Record<CarouselVariant, VariantConfig> = {
  hero: {
    perView: { base: 1, sm: 1, lg: 1 },
    breakpoints: { sm: 440, lg: 700 },
    gap: 0,
    autoplay: 6000,
    loop: true,
    counter: true,
    framed: true,
    small: false,
    drag: false,
  },
  cards: {
    perView: { base: 1, sm: 2, lg: 3 },
    breakpoints: { sm: 440, lg: 700 },
    gap: 16,
    autoplay: 0,
    loop: false,
    counter: true,
    framed: false,
    small: false,
    drag: true,
  },
  templates: {
    perView: { base: 1, sm: 2, lg: 3 },
    breakpoints: { sm: 440, lg: 700 },
    gap: 16,
    autoplay: 0,
    loop: false,
    counter: true,
    framed: false,
    small: false,
    drag: true,
  },
  'resume-cards': {
    perView: { base: 1, sm: 2, lg: 3 },
    breakpoints: { sm: 440, lg: 900 },
    gap: 16,
    autoplay: 0,
    loop: false,
    counter: true,
    framed: false,
    small: false,
    drag: true,
  },
  showcase: {
    perView: { base: 1, sm: 2, lg: 4 },
    breakpoints: { sm: 440, lg: 700 },
    gap: 16,
    autoplay: 0,
    loop: false,
    counter: true,
    framed: false,
    small: false,
    drag: true,
  },
  tips: {
    perView: { base: 1, sm: 1, lg: 1 },
    breakpoints: { sm: 440, lg: 700 },
    gap: 0,
    autoplay: 7000,
    loop: true,
    counter: false,
    framed: true,
    small: true,
    drag: false,
  },
};

const SWIPE_THRESHOLD_PX = 40;
const DRAG_START_PX = 8;
const DEFAULT_WIDTH_PX = 1024;

export interface CarouselProps {
  /** One node per slide (the consumer keys them). */
  slides: ReactNode[];
  /** Accessible name for the carousel region. */
  ariaLabel: string;
  /** Optional per-slide labels used in slide/dot announcements. */
  slideLabels?: string[];
  /** Layout behaviour preset. Defaults to `hero`. */
  variant?: CarouselVariant;
  /** Autoplay interval in ms. 0 disables it. Defaults to the variant value. */
  autoplayMs?: number;
  /** Override the variant's responsive visible-card count. */
  perView?: Partial<CarouselPerView>;
  /** Override the variant's container-width thresholds for the sm/lg tiers. */
  breakpoints?: { sm?: number; lg?: number };
  /** Override the variant's pixel gap between slides. */
  gapPx?: number;
  /** Override whether navigation wraps at the ends. */
  loop?: boolean;
  /** Override whether the slide counter is shown. */
  showCounter?: boolean;
  /** Extra classes for the outer region (surface, rounding, spacing…). */
  className?: string;
  /** Renders a close control in the controls row (e.g. "hide tips"). */
  onDismiss?: () => void;
}

export default function Carousel({
  slides,
  ariaLabel,
  slideLabels,
  variant = 'hero',
  autoplayMs,
  perView,
  breakpoints,
  gapPx,
  loop,
  showCounter,
  className,
  onDismiss,
}: CarouselProps) {
  const cfg = VARIANTS[variant];
  const count = slides.length;

  const [page, setPage] = useState(0);
  const [width, setWidth] = useState<number>(() =>
    typeof window !== 'undefined' && window.innerWidth ? window.innerWidth : DEFAULT_WIDTH_PX,
  );
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [gesturePaused, setGesturePaused] = useState(false);
  const [hiddenTab, setHiddenTab] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [dragDx, setDragDx] = useState<number | null>(null);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dragRef = useRef<{ id: number; startX: number; startY: number; active: boolean } | null>(null);
  const dragMovedRef = useRef(false);
  const touchStartX = useRef<number | null>(null);

  /* ── Responsive measurement: real container width, window as fallback ── */
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      const measured = el.clientWidth;
      setWidth(measured > 0 ? measured : (window.innerWidth || DEFAULT_WIDTH_PX));
    };
    measure();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      return () => observer.disconnect();
    }
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  /* ── Reduced-motion preference (disables autoplay) ── */
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  /* ── Hidden tab pauses autoplay ── */
  useEffect(() => {
    const onVisibility = () => setHiddenTab(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  /* ── Geometry ── */
  const requestedPerView: CarouselPerView = {
    base: perView?.base ?? cfg.perView.base,
    sm: perView?.sm ?? cfg.perView.sm,
    lg: perView?.lg ?? cfg.perView.lg,
  };
  const smBreakpoint = breakpoints?.sm ?? cfg.breakpoints.sm;
  const lgBreakpoint = breakpoints?.lg ?? cfg.breakpoints.lg;
  const rawPerView =
    width >= lgBreakpoint
      ? requestedPerView.lg
      : width >= smBreakpoint
        ? requestedPerView.sm
        : requestedPerView.base;
  // Never show more cards than there are slides (a 2-slide rail must not
  // stretch into an empty third slot).
  const perSlide = Math.max(1, Math.min(rawPerView, Math.max(1, count)));
  const gap = gapPx ?? cfg.gap;
  const slideWidth = Math.max(1, (width - gap * (perSlide - 1)) / perSlide);

  const pages = Math.max(1, Math.ceil(count / perSlide));
  const safePage = Math.min(page, pages - 1);
  const startSlide = Math.min(safePage * perSlide, Math.max(0, count - perSlide));
  const trackTotal = count * slideWidth + Math.max(0, count - 1) * gap;
  const maxOffset = Math.max(0, trackTotal - width);
  const offset = Math.round(Math.min(startSlide * (slideWidth + gap), maxOffset));

  const autoplay = autoplayMs ?? cfg.autoplay;
  const isLoop = loop ?? cfg.loop;
  const withCounter = showCounter ?? cfg.counter;

  // Keep the page in range whenever the slide count or layout changes
  // (filtering, resizing across breakpoints, deleting a card…).
  useEffect(() => {
    setPage((current) => Math.min(current, pages - 1));
  }, [pages]);

  const go = useCallback(
    (next: number) => {
      if (pages <= 1) return;
      setPage(
        isLoop
          ? ((next % pages) + pages) % pages
          : Math.max(0, Math.min(pages - 1, next)),
      );
    },
    [pages, isLoop],
  );

  const autoplayActive =
    autoplay > 0 &&
    pages > 1 &&
    !hoverPaused &&
    !focusPaused &&
    !gesturePaused &&
    !hiddenTab &&
    !userPaused &&
    !reducedMotion;

  // Autoplay — restarts whenever the page changes so a manual navigation
  // always grants the full dwell time.
  useEffect(() => {
    if (!autoplayActive) return;
    if (!isLoop && safePage >= pages - 1) return;
    const id = window.setInterval(() => setPage((i) => (i + 1) % pages), autoplay);
    return () => window.clearInterval(id);
  }, [autoplayActive, autoplay, safePage, pages, isLoop]);

  // Keep the active dot visible when the dot strip scrolls (many pages).
  useEffect(() => {
    dotRefs.current[safePage]?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
  }, [safePage, pages]);

  if (count === 0) return null;

  /* ── Touch swipe (threshold based — vertical page scroll stays native) ── */
  const onTouchStart = (e: ReactTouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setGesturePaused(true);
  };
  const onTouchEnd = (e: ReactTouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    setGesturePaused(false);
    if (start === null) return;
    const delta = e.changedTouches[0].clientX - start;
    if (Math.abs(delta) >= SWIPE_THRESHOLD_PX) go(safePage + (delta < 0 ? 1 : -1));
  };

  /* ── Mouse drag with live follow (card rails only) ── */
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragMovedRef.current = false;
    if (!cfg.drag || e.pointerType === 'touch' || e.button !== 0) return;
    // Never hijack an in-progress text selection.
    const selection = window.getSelection?.();
    if (selection && !selection.isCollapsed) return;
    dragRef.current = { id: e.pointerId, startX: e.clientX, startY: e.clientY, active: false };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const state = dragRef.current;
    if (!state || state.id !== e.pointerId) return;
    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;
    if (!state.active) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > DRAG_START_PX) {
        dragRef.current = null; // vertical scroll wins
        return;
      }
      if (Math.abs(dx) <= DRAG_START_PX) return;
      state.active = true;
      setGesturePaused(true);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Pointer capture is best-effort (unsupported in some environments).
      }
    }
    setDragDx(dx);
  };
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const state = dragRef.current;
    dragRef.current = null;
    setGesturePaused(false);
    if (!state?.active) {
      setDragDx(null);
      return;
    }
    // The gesture was a drag — swallow the click that follows so cards,
    // links and buttons underneath never fire after a drag.
    dragMovedRef.current = true;
    window.setTimeout(() => {
      dragMovedRef.current = false;
    }, 300);
    const dx = e.clientX - state.startX;
    setDragDx(null);
    const threshold = Math.min(140, Math.max(48, slideWidth * 0.15));
    if (dx < -threshold) go(safePage + 1);
    else if (dx > threshold) go(safePage - 1);
  };

  /* ── Keyboard navigation ── */
  const onKeyDown = (e: ReactKeyboardEvent<HTMLElement>) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      go(safePage + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      go(safePage - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      go(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      go(pages - 1);
    }
  };

  const btnClass = cn(
    cfg.small ? 'h-6 w-6 rounded-md' : 'h-8 w-8 rounded-lg',
    'flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors shrink-0',
  );
  const dotClass = (active: boolean) =>
    cn(
      'rounded-full transition-all duration-300 shrink-0',
      cfg.small ? 'h-1.5' : 'h-2',
      active
        ? cfg.small
          ? 'w-4 bg-accent'
          : 'w-6 bg-accent'
        : cn(cfg.small ? 'w-1.5' : 'w-2', 'bg-muted-foreground/30 hover:bg-muted-foreground/50'),
    );

  const counterText =
    perSlide === 1
      ? `${safePage + 1} / ${pages}`
      : `${startSlide + 1}–${Math.min(startSlide + perSlide, count)} of ${count}`;

  const showControls = pages > 1;

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn(
        cfg.framed ? 'rounded-2xl border border-border/60 bg-card shadow-card' : '',
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
      {/* ── Slides ── */}
      <div
        ref={viewportRef}
        className={cn(
          'relative overflow-hidden',
          cfg.drag && 'cursor-grab active:cursor-grabbing [&_button]:cursor-pointer',
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(e) => {
          if (dragMovedRef.current) {
            dragMovedRef.current = false;
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <div
          className="flex will-change-transform"
          style={{
            gap: `${gap}px`,
            transform: `translate3d(-${offset + (dragDx ?? 0)}px, 0, 0)`,
            transition: dragDx !== null ? 'none' : undefined,
          }}
        >
          {slides.map((slide, i) => {
            const active = i >= startSlide && i < startSlide + perSlide;
            return (
              <div
                key={i}
                role="group"
                aria-roledescription="slide"
                aria-label={
                  slideLabels?.[i]
                    ? `${i + 1} of ${count}: ${slideLabels[i]}`
                    : `${i + 1} of ${count}`
                }
                aria-hidden={!active}
                ref={(el) => {
                  if (!el) return;
                  if (active) el.removeAttribute('inert');
                  else el.setAttribute('inert', '');
                }}
                style={{ width: `${slideWidth}px` }}
                className="shrink-0 min-w-0 flex flex-col [&>*]:h-full"
              >
                {slide}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Controls (hidden entirely when everything fits one page) ── */}
      {showControls && (
        <div
          className={cn(
            'flex items-center justify-between gap-3 border-t border-border/60',
            cfg.small
              ? 'px-3 py-1.5'
              : cfg.framed
                ? 'px-5 sm:px-8 py-3.5'
                : 'px-1 py-3 mt-3',
            !cfg.framed && 'bg-card/60 rounded-b-xl',
          )}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {withCounter && (
              <span
                className="text-[12px] text-muted-foreground tabular-nums shrink-0"
                aria-live="polite"
              >
                {counterText}
              </span>
            )}
            <div
              className="flex items-center gap-2 min-w-0 flex-1 overflow-x-auto no-scrollbar"
              role="group"
              aria-label={`Choose slide — ${ariaLabel}`}
            >
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  ref={(el) => {
                    dotRefs.current[i] = el;
                  }}
                  type="button"
                  aria-current={i === safePage ? 'true' : undefined}
                  aria-label={
                    perSlide === 1 && slideLabels?.[i]
                      ? `Go to slide ${i + 1}: ${slideLabels[i]}`
                      : perSlide === 1
                        ? `Go to slide ${i + 1} of ${pages}`
                        : `Go to page ${i + 1} of ${pages}`
                  }
                  onClick={() => go(i)}
                  className={dotClass(i === safePage)}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                aria-label="Hide tips"
                title="Hide tips"
                className={btnClass}
              >
                <X className={cfg.small ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} />
              </button>
            )}
            {autoplay > 0 && (
              <button
                type="button"
                onClick={() => setUserPaused((v) => !v)}
                aria-label={userPaused ? 'Resume autoplay' : 'Pause autoplay'}
                title={userPaused ? 'Resume autoplay' : 'Pause autoplay'}
                className={btnClass}
              >
                {userPaused ? (
                  <Play className={cfg.small ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} />
                ) : (
                  <Pause className={cfg.small ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => go(safePage - 1)}
              disabled={!isLoop && safePage === 0}
              aria-label="Previous slide"
              className={btnClass}
            >
              <ArrowLeft className={cfg.small ? 'h-3 w-3' : 'h-4 w-4'} />
            </button>
            <button
              type="button"
              onClick={() => go(safePage + 1)}
              disabled={!isLoop && safePage >= pages - 1}
              aria-label="Next slide"
              className={btnClass}
            >
              <ArrowRight className={cfg.small ? 'h-3 w-3' : 'h-4 w-4'} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
