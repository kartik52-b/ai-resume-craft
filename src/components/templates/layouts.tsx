import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE SHELLS

   These control PAGE STRUCTURE only (columns, header placement, bleed). Typography,
   spacing, headings and accents are decided by each template, so two templates
   sharing a shell still read as different designs.

   Geometry note: the A4 canvas is padded `18mm 20mm` (see PreviewPanel). A
   full-bleed column cancels exactly that padding with negative millimetre
   margins, so it still lands on the true page edge inside the scaled thumbnail.
   ═══════════════════════════════════════════════════════════════════════════ */

export const PAGE_PAD_X = '20mm';
export const PAGE_PAD_Y = '18mm';

/** Plain single-column page body. */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export type SidebarWidth = 'narrow' | 'medium' | 'wide';

const SIDEBAR_PCT: Record<SidebarWidth, string> = {
  narrow: '27%',
  medium: '32%',
  wide: '38%',
};

/**
 * A sidebar alongside the main content.
 *
 * - `side="left"` → classic left rail; `side="right"` → mirrored rail.
 * - `bleed` extends the sidebar to the physical page edge (coloured rail),
 *   otherwise it is an inset tinted panel.
 */
export function SidebarPage({
  side = 'left',
  width = 'medium',
  sidebar,
  main,
  sidebarClassName,
  mainClassName,
  bleed = false,
  className,
}: {
  side?: 'left' | 'right';
  width?: SidebarWidth;
  sidebar: ReactNode;
  main: ReactNode;
  sidebarClassName?: string;
  mainClassName?: string;
  bleed?: boolean;
  className?: string;
}) {
  const isLeft = side === 'left';

  // Full-bleed rail: cancel the canvas padding exactly, then re-add it inside.
  const bleedRail = isLeft
    ? 'pt-[18mm] pb-[18mm] -mt-[18mm] -mb-[18mm] -ml-[20mm] pl-[12mm] pr-[6mm]'
    : 'pt-[18mm] pb-[18mm] -mt-[18mm] -mb-[18mm] -mr-[20mm] pl-[6mm] pr-[12mm]';

  const asideClass = cn(width && 'shrink-0', bleed ? bleedRail : 'px-3 py-3 rounded-sm', sidebarClassName);
  const mainClass = cn('flex-1 min-w-0', bleed && 'py-1', mainClassName);
  const asideStyle = { width: SIDEBAR_PCT[width] };

  return (
    <div className={cn('flex items-stretch', className)}>
      {isLeft ? (
        <>
          <div style={asideStyle} className={asideClass}>{sidebar}</div>
          <div className={mainClass}>{main}</div>
        </>
      ) : (
        <>
          <div className={mainClass}>{main}</div>
          <div style={asideStyle} className={asideClass}>{sidebar}</div>
        </>
      )}
    </div>
  );
}

/**
 * Full-width header above a two-column body. Used by layouts where the name
 * block spans the whole page and the sections then split into columns.
 */
export function SplitBody({
  header,
  main,
  aside,
  ratio = 'medium',
  asideFirst = false,
  mainClassName,
  asideClassName,
  className,
}: {
  header?: ReactNode;
  main: ReactNode;
  aside?: ReactNode;
  ratio?: SidebarWidth;
  asideFirst?: boolean;
  mainClassName?: string;
  asideClassName?: string;
  className?: string;
}) {
  const colStyle = { width: SIDEBAR_PCT[ratio] };
  return (
    <div className={className}>
      {header}
      <div className="flex items-start gap-4">
        {asideFirst && aside ? (
          <>
            <div style={colStyle} className={cn('shrink-0', asideClassName)}>{aside}</div>
            <div className={cn('flex-1 min-w-0', mainClassName)}>{main}</div>
          </>
        ) : (
          <>
            <div className={cn('flex-1 min-w-0', mainClassName)}>{main}</div>
            {aside ? <div style={colStyle} className={cn('shrink-0', asideClassName)}>{aside}</div> : null}
          </>
        )}
      </div>
    </div>
  );
}

/** Multi-column flow body (CSS columns) for dense, compact designs. */
export function ColumnsPage({
  children,
  columns = 2,
  className,
}: {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  const colClass = columns === 3 ? 'columns-3' : columns === 2 ? 'columns-2' : 'columns-1';
  return <div className={cn(colClass, 'gap-5 [column-fill:balance]', className)}>{children}</div>;
}
