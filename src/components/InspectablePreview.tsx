import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { type ResumeData } from '@/types/resume';
import { getTemplate } from '@/lib/templateRegistry';
import { A4_WIDTH_PX, cn } from '@/lib/utils';
import { useDragScroll, useInspectableScroll } from '@/hooks/useInteraction';

interface InspectablePreviewProps {
  /** Resume to render — the real template, sample content on the homepage. */
  data: ResumeData;
  /** Describes the scrollable region for assistive tech (mention scrolling). */
  ariaLabel: string;
  className?: string;
}

/**
 * A fixed frame that shows the top of a real A4 page and lets the visitor scroll
 * through it — the "put your cursor on the resume and inspect it" interaction.
 *
 * - Wheel over the frame scrolls the resume and holds the page still; at either
 *   end the gesture is handed back to the page, so nobody gets trapped.
 * - Drag-to-scroll with grab/grabbing cursors on desktop.
 * - Touch users get plain natural nested scrolling — no mouse detection needed.
 * - The frame is focusable, so arrow keys / PageUp / PageDown scroll it too.
 * - The page inside is scaled to the frame width and its layout box matches the
 *   scaled result, so nothing can push the page sideways.
 */
export default function InspectablePreview({ data, ariaLabel, className }: InspectablePreviewProps) {
  const Template = getTemplate(data.template).Component;
  const { ref: scrollRef, dragging, handlers } = useDragScroll<HTMLDivElement>({ axis: 'y' });
  const { atBottom, hasScrolled } = useInspectableScroll(scrollRef);

  const [scale, setScale] = useState(0.36);
  const [pageHeight, setPageHeight] = useState(1123);
  const pageRef = useRef<HTMLDivElement>(null);

  /** Fit the page width to the frame (scrollbar included in the measurement). */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      const width = el.clientWidth;
      if (width <= 0) return;
      const next = Number((width / A4_WIDTH_PX).toFixed(4));
      setScale((current) => (Math.abs(current - next) < 0.002 ? current : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollRef]);

  /** Content grows with the resume, so the scrollable extent is measured. */
  useEffect(() => {
    const el = pageRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const measure = () => setPageHeight(el.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [data.template]);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/60 bg-white shadow-modal',
        'transition-[transform,box-shadow,border-color] duration-300 ease-out',
        'hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl',
        className,
      )}
      // Deliberately shorter than A4: the window shows the top of the page, which
      // is what gives the scroll something to reveal.
      style={{ aspectRatio: '210 / 230' }}
    >
      <div
        ref={scrollRef}
        {...handlers}
        data-dragging={dragging}
        tabIndex={0}
        role="region"
        aria-label={ariaLabel}
        // No `overscroll-contain`: at either end the gesture must chain straight
        // back to the page (wheel and touch) rather than trapping the visitor.
        className={cn(
          'h-full w-full overflow-y-auto overflow-x-hidden scrollbar-slim draggable-area select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/60',
        )}
      >
        <div className="relative w-full" style={{ height: pageHeight * scale }}>
          <div
            ref={pageRef}
            className="origin-top-left bg-white"
            style={{
              width: '210mm',
              minHeight: '297mm',
              padding: '18mm 20mm',
              transform: `scale(${scale})`,
            }}
          >
            <Template data={data} />
          </div>
        </div>
      </div>

      {/* More content below — a whisper of a shadow, not a banner. */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-foreground/[0.07] to-transparent transition-opacity duration-300',
          atBottom ? 'opacity-0' : 'opacity-100',
        )}
      />

      {/* Minimal scroll hint — gone for good once the visitor scrolls. */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-2.5 flex justify-center transition-opacity duration-500',
          hasScrolled ? 'opacity-0' : 'opacity-100',
        )}
      >
        <span className="flex items-center gap-1 rounded-full bg-foreground/75 px-2.5 py-1 text-[10px] font-medium text-background shadow-sm backdrop-blur-sm">
          <ChevronDown className="h-3 w-3" /> Scroll to inspect
        </span>
      </div>
    </div>
  );
}
