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
 * Pointer position relative to an element's centre, in CSS pixels.
 * `x`/`y` are the offsets; `width`/`height` are the element's box. */
type FollowPoint = { x: number; y: number; width: number; height: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Shared plumbing for pointer-follow effects (tilt, magnetic).
 *
 * - writes styles straight to the DOM node on a rAF tick, so continuous mouse
 *   movement never re-renders React
 * - mouse / pen only, so touch devices are untouched by design
 * - listeners are per element, and cleaned up with the element
 */
function usePointerFollow<T extends HTMLElement>(
  enabled: boolean,
  move: (el: T, point: FollowPoint) => void,
  reset: (el: T) => void,
) {
  const frame = useRef<number | null>(null);
  const pending = useRef<{ el: T; point: FollowPoint } | null>(null);
  const moveRef = useRef(move);
  const resetRef = useRef(reset);
  moveRef.current = move;
  resetRef.current = reset;

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<T>) => {
      if (!enabled) return;
      // Touch devices report 'touch' and never get a follow effect.
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      pending.current = {
        el,
        point: {
          x: e.clientX - (rect.left + rect.width / 2),
          y: e.clientY - (rect.top + rect.height / 2),
          width: rect.width,
          height: rect.height,
        },
      };
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        const next = pending.current;
        pending.current = null;
        if (next) moveRef.current(next.el, next.point);
      });
    },
    [enabled],
  );

  const onPointerLeave = useCallback((e: ReactPointerEvent<T>) => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    pending.current = null;
    resetRef.current(e.currentTarget);
  }, []);

  return { onPointerMove, onPointerLeave };
}

/**
 * Subtle 3D tilt + parallax for one element (the homepage resume preview).
 *
 * Max values stay tiny on purpose — a few degrees and a few pixels — so the
 * element reads as responsive rather than animated, and can never leave its
 * container. The element is never scrollable and never moves on its own:
 * releasing the pointer returns it home via the CSS transition.
 */
export function useTilt<T extends HTMLElement>(
  options: { maxTilt?: number; maxShift?: number; maxRotX?: number; maxRotY?: number } = {},
) {
  const { maxTilt = 3.5, maxShift = 6, maxRotX = maxTilt, maxRotY = maxTilt } = options;
  const reduced = usePrefersReducedMotion();

  return usePointerFollow<T>(
    !reduced,
    (el, point) => {
      const nx = clamp(point.x / (point.width / 2), -1, 1);
      const ny = clamp(point.y / (point.height / 2), -1, 1);
      el.dataset.tilting = 'true';
      // Near edge lifts toward the cursor; the whole card drifts a few pixels. The
      // perspective lives in the transform so the effect is self-contained.
      el.style.transform =
        `perspective(1100px) rotateX(${(ny * maxRotX).toFixed(2)}deg) rotateY(${(-nx * maxRotY).toFixed(2)}deg) ` +
        `translate3d(${(nx * maxShift).toFixed(2)}px, ${(ny * maxShift).toFixed(2)}px, 0)`;
    },
    (el) => {
      el.dataset.tilting = 'false';
      el.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)';
    },
  );
}

/**
 * Magnetic hover: the element drifts a few pixels toward the cursor and eases
 * back on leave. Bounded so a CTA never becomes hard to hit or click.
 */
export function useMagneticHover<T extends HTMLElement>(
  options: { strength?: number; maxShift?: number } = {},
) {
  const { strength = 0.18, maxShift = 6 } = options;
  const reduced = usePrefersReducedMotion();

  return usePointerFollow<T>(
    !reduced,
    (el, point) => {
      const x = clamp(point.x * strength, -maxShift, maxShift);
      const y = clamp(point.y * strength, -maxShift, maxShift);
      el.dataset.tracking = 'true';
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    },
    (el) => {
      el.dataset.tracking = 'false';
      el.style.transform = 'translate3d(0, 0, 0)';
    },
  );
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
 * Card-level pointer feedback: a very light tilt plus the cursor sheen.
 *
 * Composed from the primitives above so a card only ever pays for one pointer
 * listener pair, and the movement stays deliberately smaller than the hero
 * preview's (cards sit inside grids and must never appear to swim).
 */
export function useCardInteraction<T extends HTMLElement>(
  options: { maxTilt?: number; maxShift?: number } = {},
) {
  const { maxTilt = 1.8, maxShift = 4 } = options;
  const tilt = useTilt<T>({ maxTilt, maxShift });
  const spot = usePointerSpotlight<T>();

  return {
    onPointerMove: (e: ReactPointerEvent<T>) => {
      tilt.onPointerMove(e);
      spot.onPointerMove(e);
    },
    onPointerLeave: (e: ReactPointerEvent<T>) => {
      tilt.onPointerLeave(e);
      spot.onPointerLeave();
    },
  };
}

/**
 * Which of the named sections is currently filling the middle of the viewport.
 *
 * Used by the landing page's in-page nav to move its highlight as you scroll.
 * The band is centred (`-45%` top / `-50%` bottom) so the active item changes
 * when a section genuinely owns the screen, not when it first peeks in.
 */
export function useActiveSection(ids: readonly string[], rootMargin = '-45% 0px -50% 0px') {
  const [active, setActive] = useState<string>(ids[0] ?? '');
  const key = ids.join('|');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const list = key.split('|').filter(Boolean);
    const elements = list
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const winner = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (winner?.target.id) setActive(winner.target.id);
      },
      { rootMargin, threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key, rootMargin]);

  return active;
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
