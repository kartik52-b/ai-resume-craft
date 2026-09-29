import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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
}

const CONTROL_CLASS =
  'h-9 w-9 rounded-full border border-border/60 bg-card text-muted-foreground shadow-xs flex items-center justify-center ' +
  'transition-all duration-150 hover:text-foreground hover:border-border hover:shadow-card disabled:opacity-35 disabled:pointer-events-none';

/**
 * Horizontally scrollable row of cards — the "there are more than a handful of
 * these" pattern.
 *
 * - mouse drag, trackpad swipe / shift+wheel, touch swipe and keyboard arrows
 * - prev/next buttons only appear when the row actually overflows, so short
 *   rows stay plain cards instead of pretending to be a carousel
 * - snapping is proximity-based: it never fights a deliberate drag
 * - the page keeps its normal vertical scrolling; only the rail manages `x`
 */
export default function ScrollRail({
  items,
  ariaLabel,
  itemClassName,
  className,
  showControls = true,
}: ScrollRailProps) {
  const reduced = usePrefersReducedMotion();
  const { ref, dragging, handlers } = useDragScroll<HTMLDivElement>();
  const [edges, setEdges] = useState({ start: false, end: false });
  const frame = useRef<number | null>(null);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const next = { start: el.scrollLeft > 4, end: max > 4 && el.scrollLeft < max - 4 };
    setEdges((cur) => (cur.start === next.start && cur.end === next.end ? cur : next));
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();

    const onScroll = () => {
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        measure();
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
  }, [measure, ref, items.length]);

  const step = useCallback(
    (direction: 1 | -1) => {
      const el = ref.current;
      if (!el) return;
      const amount = Math.max(240, Math.round(el.clientWidth * 0.85));
      el.scrollBy?.({ left: direction * amount, behavior: reduced ? 'auto' : 'smooth' });
    },
    [reduced, ref],
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

  return (
    <div className={cn('min-w-0', className)}>
      {showControls && overflows && (
        <div className="flex justify-end gap-1.5 mb-3">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={!edges.start}
            className={CONTROL_CLASS}
            aria-label={`Scroll ${ariaLabel} backward`}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={!edges.end}
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
        data-dragging={dragging}
        tabIndex={0}
        role="group"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
        className={cn(
          'flex gap-4 overflow-x-auto overscroll-x-contain scrollbar-none snap-x snap-proximity py-2',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          overflows && 'draggable-area',
          dragging && 'select-none',
        )}
      >
        {items.map((item, i) => (
          <div key={i} className={cn('snap-start shrink-0', itemClassName)}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
