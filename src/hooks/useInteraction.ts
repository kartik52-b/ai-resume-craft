import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';

/**
 * Small, dependency-free interaction primitives shared by the carousels,
 * scroll rails and hover effects.
 *
 * Everything here is intentionally conservative:
 * - pointer work is limited to fine pointers (mouse/pen), never touch
 * - scroll tracking and mouse tracking are rAF-throttled
 * - `prefers-reduced-motion` disables motion wholesale
 * - the in-view hook fails *visible* so content can never be trapped
 */

/** True when the visitor asked the OS/browser for reduced motion. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  return reduced;
}

/**
 * Reveals an element the first time it scrolls into view.
 *
 * Falls back to "already visible" when `IntersectionObserver` is missing
 * (old browsers, jsdom) so content is never left hidden.
 */
export function useInView<T extends HTMLElement>(options?: {
  /** Extra margin around the scrollport, e.g. a sticky header offset. */
  rootMargin?: string;
  threshold?: number;
}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const rootMargin = options?.rootMargin ?? '0px 0px -6% 0px';
  const threshold = options?.threshold ?? 0.05;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return { ref, inView };
}

/**
 * Click-and-drag scrolling for a horizontally scrollable container.
 *
 * - mouse / pen only — touch keeps its native swipe, so the page keeps working
 *   on phones without any JS involvement
 * - a drag past the threshold swallows the follow-up click, so dragging across
 *   a card never accidentally opens it
 * - attach `ref` to the scroll container and spread the handlers onto it
 */
export function useDragScroll<T extends HTMLElement>(options: {
  /** Which axis the drag scrolls. Default `x` (rails, carousels). */
  axis?: 'x' | 'y';
  /** Pixels of movement before the gesture counts as a drag, not a click. */
  threshold?: number;
  /** Scroll container to drive. Defaults to an internally created ref. */
  elementRef?: RefObject<T | null>;
} = {}) {
  const { axis = 'x', threshold = 6, elementRef } = options;
  const internalRef = useRef<T | null>(null);
  const ref = (elementRef ?? internalRef) as MutableRefObject<T | null>;
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startOffset = useRef(0);
  const moved = useRef(false);

  const onPointerDown = useCallback((e: ReactPointerEvent<T>) => {
    if (e.pointerType === 'touch' || e.button !== 0) return;
    const el = ref.current;
    if (!el) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    startOffset.current = axis === 'y' ? el.scrollTop : el.scrollLeft;
    moved.current = false;
    setDragging(true);
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* capture is a nicety, not a requirement */
    }
  }, [axis, ref]);

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<T>) => {
      const el = ref.current;
      if (!el || !dragging) return;
      const delta = axis === 'y' ? e.clientY - startY.current : e.clientX - startX.current;
      if (Math.abs(delta) > threshold) moved.current = true;
      if (axis === 'y') el.scrollTop = startOffset.current - delta;
      else el.scrollLeft = startOffset.current - delta;
    },
    [axis, dragging, ref, threshold],
  );

  const onPointerUp = useCallback((e: ReactPointerEvent<T>) => {
    const el = ref.current;
    if (el && el.hasPointerCapture?.(e.pointerId)) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    setDragging(false);
  }, [ref]);

  const onClickCapture = useCallback((e: ReactMouseEvent<T>) => {
    if (!moved.current) return;
    e.preventDefault();
    e.stopPropagation();
    moved.current = false;
  }, []);

  return {
    ref,
    dragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onPointerLeave: onPointerUp,
      onClickCapture,
    },
  };
}

/**
 * Scroll-inside-a-page behaviour for a nested scroll container (the homepage
 * resume preview).
 *
 * The wheel listener is attached natively with `{ passive: false }` on purpose:
 * React's `onWheel` is passive at the root, so it could never stop the page from
 * scrolling. Here the gesture is captured only while the nested container can
 * still move, and handed straight back to the page at either boundary — so a
 * visitor is never trapped inside the preview.
 *
 * Touch is untouched: mobile keeps its natural nested scrolling, and
 * `prefers-reduced-motion` jumps instead of animating the wheel delta.
 */
export function useInspectableScroll<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options: { enabled?: boolean } = {},
) {
  const { enabled = true } = options;
  const reduced = usePrefersReducedMotion();
  const [atBottom, setAtBottom] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let target: number | null = null;
    let frame: number | null = null;
    const limit = () => Math.max(0, el.scrollHeight - el.clientHeight);
    const stop = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      target = null;
    };

    // Eased follow, so discrete wheel notches read as smooth motion.
    const tick = () => {
      if (target === null) {
        frame = null;
        return;
      }
      const diff = target - el.scrollTop;
      if (Math.abs(diff) < 0.5) {
        el.scrollTop = target;
        stop();
        return;
      }
      el.scrollTop += diff * 0.3;
      frame = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.defaultPrevented) return; // never fight pinch-zoom
      const max = limit();
      if (max <= 1) return; // nothing to inspect — the page keeps the gesture
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientHeight : 1;
      const delta = e.deltaY * unit;
      if (delta === 0) return;

      const current = target ?? el.scrollTop;
      const atBoundary = delta > 0 ? current >= max - 0.5 : current <= 0.5;
      if (atBoundary) {
        stop();
        return; // boundary hand-off: let the page scroll from here
      }

      e.preventDefault(); // keep the page still while inspecting
      target = Math.min(max, Math.max(0, current + delta));
      if (reduced) {
        el.scrollTop = target;
        stop();
        return;
      }
      if (frame === null) frame = requestAnimationFrame(tick);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      stop();
    };
  }, [enabled, reduced, ref]);

  // Indicator state: is there more below, and has the visitor started reading?
  // Both are booleans, so React bails out of re-renders unless they actually flip.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const max = Math.max(0, el.scrollHeight - el.clientHeight);
      setAtBottom(max > 1 && el.scrollTop >= max - 2);
      setHasScrolled(el.scrollTop > 4);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    return () => el.removeEventListener('scroll', update);
  }, [ref]);

  return { atBottom, hasScrolled };
}

/**
 * Cursor-following highlight for cards.
 *
 * Writes `--spot-x` / `--spot-y` (rAF-throttled, latest position only) so CSS
 * can paint a soft radial sheen. Mouse-only by definition — touch devices never
 * fire these handlers, so there is nothing to feature-detect.
 */
export function usePointerSpotlight<T extends HTMLElement>(enabled = true) {
  const frame = useRef<number | null>(null);
  const latest = useRef<{ x: number; y: number } | null>(null);

  const stop = useCallback(() => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    latest.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<T>) => {
      if (!enabled || e.pointerType !== 'mouse') return;
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      latest.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        const next = latest.current;
        if (!next) return;
        el.style.setProperty('--spot-x', `${next.x}px`);
        el.style.setProperty('--spot-y', `${next.y}px`);
      });
    },
    [enabled],
  );

  return { onPointerMove, onPointerLeave: stop };
}

/**
 * True on devices with a real hover-capable pointer. Used to decide whether an
 * effect may rely on hover — never to hide information from touch users.
 */
export function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.('(hover: hover) and (pointer: fine)');
    if (!mq) return;
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  return fine;
}
