import { type ReactNode } from 'react';
import { useMagneticHover } from '@/hooks/useInteraction';
import { cn } from '@/lib/utils';

interface MagneticProps {
  children: ReactNode;
  className?: string;
  /** Fraction of the cursor offset to follow. Keep small. */
  strength?: number;
  /** Hard cap in pixels so the target never moves far from the pointer. */
  maxShift?: number;
}

/**
 * Wraps one CTA so it drifts a few pixels toward the cursor and eases back when
 * the pointer leaves.
 *
 * The wrapper is moved, not the button: the button keeps its own hover/active
 * styles, its click target travels with it, and keyboard focus is unaffected.
 * Touch and reduced-motion visitors simply get the untouched button.
 */
export default function Magnetic({ children, className, strength, maxShift }: MagneticProps) {
  const handlers = useMagneticHover<HTMLSpanElement>({ strength, maxShift });

  return (
    <span {...handlers} className={cn('magnetic inline-flex w-full sm:w-auto', className)}>
      {children}
    </span>
  );
}
