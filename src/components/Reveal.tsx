import { type CSSProperties, type ReactNode } from 'react';
import { useInView, usePrefersReducedMotion } from '@/hooks/useInteraction';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger in ms — keep small so sections never feel slow to arrive. */
  delayMs?: number;
}

/**
 * Fades a block in the first time it enters the viewport.
 *
 * Layout is never affected (only opacity + a few pixels of translate), the
 * content stays in the DOM and interactive the whole time, and motion is
 * skipped entirely for reduced-motion visitors or when IntersectionObserver
 * is unavailable.
 */
export default function Reveal({ children, className, delayMs = 0 }: RevealProps) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <div
      ref={ref}
      data-reveal={inView ? 'shown' : 'hidden'}
      className={className}
      style={delayMs ? ({ '--reveal-delay': `${delayMs}ms` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
