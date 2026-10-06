import {
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import type { ResumeData } from '@/types/resume';
import ResumeThumbnail from '@/components/ResumeThumbnail';
import { useTilt, usePointerSpotlight, usePrefersReducedMotion } from '@/hooks/useInteraction';
import { TILT } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * The homepage resume — a real sheet of paper that answers the pointer.
 *
 * Two elements, two jobs:
 *
 *  - the outer `.hero-sheet` owns the stage drift: it reads `--hero-x` /
 *    `--hero-y` (written by the landing page's single rAF-throttled listener)
 *    and shifts a few pixels with the desk shadow, which deepens while the
 *    pointer is anywhere near the sheet (`data-engaged` on `.hero-stage`).
 *
 *  - the inner `.tilt-surface` owns the pointer tilt: rotateX/rotateY within
 *    `TILT.rotateX` / `TILT.rotateY` degrees plus a push of at most
 *    `TILT.push` px, clamped hard so the sheet can never leave its column.
 *    Values are written straight to the DOM on a rAF tick — no React
 *    re-renders, no continuous animation loop — and the CSS transition springs
 *    it home when the pointer leaves. A faint bronze sheen follows the cursor
 *    across the paper (`pointer-sheen` + `--spot-x/--spot-y`).
 *
 * Fine pointers only: touch devices never attach the follow effect, and
 * `prefers-reduced-motion` disables tilt, sheen and drift wholesale.
 */
export default function HeroPaperCore({
  data,
  className,
  style,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { data: ResumeData; className?: string; style?: CSSProperties }) {
  const reduced = usePrefersReducedMotion();
  const tilt = useTilt<HTMLDivElement>({
    maxRotX: TILT.rotateX,
    maxRotY: TILT.rotateY,
    maxShift: TILT.push,
  });
  const spot = usePointerSpotlight<HTMLDivElement>(!reduced);

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    tilt.onPointerMove(e);
    spot.onPointerMove(e);
  };
  const onPointerLeave = (e: ReactPointerEvent<HTMLDivElement>) => {
    tilt.onPointerLeave(e);
    spot.onPointerLeave();
  };

  return (
    <div className={cn('hero-sheet w-full', className)} {...rest}>
      <div
        {...tilt}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="tilt-surface pointer-sheen relative aspect-[210/297] w-full overflow-hidden border border-border bg-paper"
        style={style}
      >
        <ResumeThumbnail data={data} />
      </div>
    </div>
  );
}

/** Named alias kept for existing imports. */
export { HeroPaperCore };

/**
 * Convenience wrapper with reduced-motion styling baked in — the underlying
 * behaviour is identical because the hooks themselves honour the preference.
 */
export function HeroPaper({ data }: { data: ResumeData }) {
  return <HeroPaperCore data={data} />;
}
