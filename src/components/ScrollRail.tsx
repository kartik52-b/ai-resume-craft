import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDragScroll, usePrefersReducedMotion } from '@/hooks/useInteraction';

export interface ScrollRailProps {
  /** One node per card. The rail owns the wrappers, so give `itemClassName` a width. */
  items: ReactNode[];
  /** Accessible name for the scrollable region. */
  ariaLabel: string;
  /** Width / snap classes for each item wrapper, e.g. `w-[280px] sm:w-[320px]`. */
  itemClassName?: string;
  className?: string;
  /** Hide the prev/next buttons — drag, swipe, wheel and keyboard still work. */
  showControls?: boolean;
  /**
   * Continuously drift the row at this many pixels per second. `0` (default)
   * leaves the rail exactly as it was. The set is duplicated internally so the
   * motion loops with no seam, and hover, focus, touch, dragging, gestures and
   * off-screen tabs all hold it still.
   */
  autoScrollSpeed?: number;
}

const CONTROL_CLASS =
  'h-9 w-9 rounded-full border border-border/60 bg-card text-muted-foreground shadow-xs flex items-center justify-center ' +
  'transition-all duration-150 hover:text-foreground hover:border-border hover:shadow-card disabled:opacity-35 disabled:pointer-events-none';

/** Marquee pace: a design showcase, not a news ticker. */
const ARROW_HOLD_MS = 1100;
const GESTURE_HOLD_MS = 700;
const MIN_LOOP_PERIOD_PX = 60;

/** Clones are decorative duplicates, so keep them out of the tab order entirely. */
function hideFromTabOrder(node: HTMLDivElement | null) {
  node?.setAttribute('inert', '');
}

/**
 * Horizontally scrollable row of cards — the "there are more than a handful of
 * these" pattern.
 *
 * - mouse drag, trackpad swipe / shift+wheel, touch swipe and keyboard arrows
 * - prev/next buttons only appear when the row actually overflows, so short
 *   rows stay plain cards instead of pretending to be a carousel
 * - snapping is proximity-based: it never fights a deliberate drag
 * - the page keeps its normal vertical scrolling; only the rail manages `x`
 * - optional `autoScrollSpeed` turns the row into a self-driving showcase
 *
 * ── How the infinite loop works ──────────────────────────────────────────────
 * The set is rendered twice. Motion is written straight to `scrollLeft` on
 * every animation frame, and once the position passes exactly one set the
 * offset is reduced by that same period. Because the second copy is
 * pixel-identical to the first, that subtraction lands on an identical frame:
 * there is no jump, no fade, and no reset the eye can catch. `scrollLeft` is a
 * composited scroll offset, so nothing here triggers layout — and unlike a
 * transform-based track it keeps native touch, wheel, drag and snap behaviour
 * intact, which is the whole reason the row is a scroll container.
 */
export default function ScrollRail({
  items,
  ariaLabel,
  itemClassName,
  className,
  showControls = true,
  autoScrollSpeed = 0,
}: ScrollRailProps) {
  const reduced = usePrefersReducedMotion();
  const { ref, dragging, handlers } = useDragScroll<HTMLDivElement>();
  const [edges, setEdges] = useState({ start: false, end: false });
  const frame = useRef<number | null>(null);

  /* ── Continuous drift state ─────────────────────────────────────────────── */

  const looping = autoScrollSpeed > 0 && items.length > 1 && !reduced;
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [gesturePaused, setGesturePaused] = useState(false);
  const [hiddenTab, setHiddenTab] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [inView, setInView] = useState(true);

  /** One full set, gap included — the loop period, measured from the DOM. */
  const periodRef = useRef(0);
  const canLoopRef = useRef(false);
  /** Timestamp until which the loop stays quiet (after an arrow or a gesture). */
  const holdRef = useRef(0);

  const paused =
    !looping || hoverPaused || focusPaused || gesturePaused || hiddenTab || userPaused || dragging || !inView;

  /** A hidden tab must not keep a marquee running. */
  useEffect(() => {
    const onVisibility = () => setHiddenTab(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  /** Panels far below the fold should not animate at all. */
  useEffect(() => {
    const el = ref.current;
    if (!looping || !el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => setInView(entries.some((e) => e.isIntersecting)), {
      rootMargin: '140px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [looping, ref]);

  /** Cheap edge state — safe to read after a scroll, no layout traversal. */
  const readEdges = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const next = { start: el.scrollLeft > 4, end: max > 4 && el.scrollLeft < max - 4 };
    setEdges((cur) => (cur.start === next.start && cur.end === next.end ? cur : next));
  }, [ref]);

  /**
   * Geometry that only a layout change can move. Measured in decimal pixels
   * (rects, not rounded offsets) so the loop period is exact and the seam never
   * drifts by a pixel — and measured only on resize, never per animation frame.
   */
  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const first = el.children[0] as HTMLElement | undefined;
    const clone = el.children[items.length] as HTMLElement | undefined;
    if (looping && first && clone) {
      periodRef.current = clone.getBoundingClientRect().left - first.getBoundingClientRect().left;
      canLoopRef.current = periodRef.current > el.clientWidth;
    } else {
      periodRef.current = 0;
      canLoopRef.current = false;
    }
    readEdges();
  }, [items.length, looping, readEdges, ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();

    const onScroll = () => {
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        readEdges();
      });
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(el);
    window.addEventListener('resize', measure);

    return () => {
      el.removeEventListener('scroll', onScroll);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure, readEdges, ref, items.length]);

  /**
   * The loop itself. One rAF tick per frame, and it stops completely (no rAF
   * scheduled at all) whenever the rail is paused, hovered, dragged or off
   * screen — a paused marquee costs nothing.
   */
  useEffect(() => {
    if (paused) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let last = 0;
    let carry = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const previous = last;
      last = now;
      if (!previous) return;
      if (now < holdRef.current) return;

      const period = periodRef.current;
      if (!canLoopRef.current || period <= MIN_LOOP_PERIOD_PX) return;

      // A long stall (tab wake, GC) must never teleport the row.
      const dt = Math.min(80, now - previous);
      carry += (autoScrollSpeed * dt) / 1000;
      if (carry < 0.6) return; // sub-pixel writes are wasted work

      const step = carry;
      carry = 0;

      const next = el.scrollLeft + step;
      // Past one full set the content repeats exactly, so subtracting the
      // period is invisible. This is the seam, and there is nothing to see.
      el.scrollLeft = next >= period ? next - period : next;
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoScrollSpeed, paused, ref]);

  /**
   * Arrow / keyboard steps. With the loop running, the row can be sitting at
   * either edge of the window, so it first steps one period — invisible, the
   * content is identical — which means a control is never dead.
   */
  const step = useCallback(
    (direction: 1 | -1) => {
      const el = ref.current;
      if (!el) return;
      const amount = Math.max(240, Math.round(el.clientWidth * 0.85));

      if (looping && canLoopRef.current) {
        const period = periodRef.current;
        const max = el.scrollWidth - el.clientWidth;
        if (direction === -1 && el.scrollLeft < amount) {
          el.scrollLeft = Math.min(max, el.scrollLeft + period);
        } else if (direction === 1 && el.scrollLeft > max - amount) {
          el.scrollLeft = Math.max(0, el.scrollLeft - period);
        }
      }

      el.scrollBy?.({ left: direction * amount, behavior: reduced ? 'auto' : 'smooth' });
      // Let the smooth scroll finish before the marquee takes the wheel again.
      holdRef.current = Date.now() + ARROW_HOLD_MS;
    },
    [looping, reduced, ref],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      step(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      ref.current?.scrollTo?.({ left: 0, behavior: reduced ? 'auto' : 'smooth' });
    } else if (e.key === 'End') {
      e.preventDefault();
      ref.current?.scrollTo?.({ left: ref.current.scrollWidth, behavior: reduced ? 'auto' : 'smooth' });
    }
  };

  const overflows = edges.start || edges.end;

  /** Real cards first, then their decorative clones when the loop is on. */
  const rendered = looping
    ? [
        ...items.map((node) => ({ node, clone: false })),
        ...items.map((node) => ({ node, clone: true })),
      ]
    : items.map((node) => ({ node, clone: false }));

  return (
    <div className={cn('min-w-0', className)}>
      {showControls && (overflows || looping) && (
        <div className="flex justify-end gap-1.5 mb-3">
          {looping && (
            <button
              type="button"
              onClick={() => setUserPaused((v) => !v)}
              className={CONTROL_CLASS}
              aria-label={userPaused ? `Resume ${ariaLabel} auto-scroll` : `Pause ${ariaLabel} auto-scroll`}
              title={userPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
            >
              {userPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
          )}
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={!looping && !edges.start}
            className={CONTROL_CLASS}
            aria-label={`Scroll ${ariaLabel} backward`}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={!looping && !edges.end}
            className={CONTROL_CLASS}
            aria-label={`Scroll ${ariaLabel} forward`}
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <div
        ref={ref}
        {...handlers}
        onPointerEnter={(e) => {
          if (e.pointerType !== 'touch') setHoverPaused(true);
        }}
        onPointerLeave={(e) => {
          // `handlers` ends a mouse drag on leave; hover resumes independently.
          handlers.onPointerLeave?.(e);
          if (e.pointerType !== 'touch') setHoverPaused(false);
        }}
        onFocusCapture={() => setFocusPaused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusPaused(false);
        }}
        onTouchStart={() => setGesturePaused(true)}
        onTouchEnd={() => {
          setGesturePaused(false);
          // Momentum keeps moving the row after the finger lifts.
          holdRef.current = Date.now() + GESTURE_HOLD_MS;
        }}
        onWheel={() => {
          if (looping) holdRef.current = Date.now() + GESTURE_HOLD_MS;
        }}
        data-dragging={dragging}
        tabIndex={0}
        role="group"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
        className={cn(
          'flex gap-4 overflow-x-auto overscroll-x-contain scrollbar-none py-2',
          // Snapping would re-snap after every frame of continuous motion, so it
          // only applies to rails that are not self-driving.
          !looping && 'snap-x snap-proximity',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          overflows && 'draggable-area',
          dragging && 'select-none',
        )}
      >
        {rendered.map(({ node, clone }, i) => (
          <div
            key={clone ? `clone-${i}` : `item-${i}`}
            ref={clone ? hideFromTabOrder : undefined}
            aria-hidden={clone || undefined}
            className={cn(
              'shrink-0',
              !looping && 'snap-start',
              clone && 'pointer-events-none',
              itemClassName,
            )}
          >
            {node}
          </div>
        ))}
      </div>
    </div>
  );
}
