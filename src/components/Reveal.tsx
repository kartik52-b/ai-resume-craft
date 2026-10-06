import { type CSSProperties, type ReactNode } from 'react';
import { useInView, usePrefersReducedMotion } from '@/hooks/useInteraction';

/** Travel styles for a reveal (spec §12). Default is `fade-up`. */
export type RevealVariant = 'fade-up' | 'fade-in' | 'scale' | 'slide-left' | 'slide-right';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger in ms — keep small so sections never feel slow to arrive. */
  delayMs?: number;
  /**
   * How the block arrives. `fade-up` (default) rises 14px while fading in;
   * the others fade in place, scale up from 0.985, or slide 16px from the
   * side. Timing and reduced-motion handling are shared across variants.
   */
  variant?: RevealVariant;
}

/**
 * The scroll-reveal utility: fades a block in the first time it enters the
 * viewport (IntersectionObserver, fires once, no scroll listeners).
 *
 * Layout is never affected (only opacity + a few pixels of translate), the
 * content stays in the DOM and interactive the whole time, and motion is
 * skipped entirely for reduced-motion visitors or when IntersectionObserver
 * is unavailable.
 */
export default function Reveal({ children, className, delayMs = 0, variant = 'fade-up' }: RevealProps) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <div
      ref={ref}
      data-reveal={inView ? 'shown' : 'hidden'}
      data-reveal-variant={variant === 'fade-up' ? undefined : variant}
      className={className}
      style={delayMs ? ({ '--reveal-delay': `${delayMs}ms` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
