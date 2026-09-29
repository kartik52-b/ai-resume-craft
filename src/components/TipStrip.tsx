import { useState } from 'react';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Tip {
  title: string;
  text: string;
}

interface TipStripProps {
  tips: Tip[];
  ariaLabel?: string;
  /** Slimmer single-line variant for tight spaces like the editor header. */
  compact?: boolean;
  className?: string;
}

/**
 * One writing tip at a time with an explicit "next" control.
 *
 * Deliberately *not* a carousel: four one-line tips do not justify dots, arrows
 * and autoplay, and motion that runs on its own is hard to stop for anyone
 * using a screen reader or reduced motion. Clicking through keeps the tips
 * useful without adding another slider to the product.
 */
export default function TipStrip({ tips, ariaLabel = 'Writing tips', compact = false, className }: TipStripProps) {
  const [index, setIndex] = useState(0);
  if (tips.length === 0) return null;
  const tip = tips[index % tips.length];

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30',
        compact ? 'px-3 py-2' : 'px-4 py-3',
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <span className="h-6 w-6 rounded-md bg-accent/10 text-accent flex items-center justify-center shrink-0">
        <Lightbulb className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      </span>

      <div className="min-w-0 flex-1" aria-live="polite">
        <div key={index} className="animate-fade-in">
          <span className={cn('font-semibold text-foreground', compact ? 'text-[11.5px]' : 'text-[12.5px]')}>
            {tip.title}
          </span>
          <span className={cn('text-muted-foreground', compact ? 'text-[11.5px]' : 'text-[12.5px]')}>
            {' '}
            {tip.text}
          </span>
        </div>
      </div>

      <span className="text-[10px] text-muted-foreground/60 tabular-nums shrink-0 hidden sm:block">
        {index + 1}/{tips.length}
      </span>

      <button
        type="button"
        onClick={() => setIndex((i) => (i + 1) % tips.length)}
        aria-label={`Next tip (${((index + 1) % tips.length) + 1} of ${tips.length})`}
        title="Next tip"
        className="h-6 w-6 shrink-0 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}
