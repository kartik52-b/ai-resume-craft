import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { type ResumeData } from '@/types/resume';
import { getTemplate } from '@/lib/templateRegistry';
import ResumeThumbnail from '@/components/ResumeThumbnail';
import { usePointerSpotlight } from '@/hooks/useInteraction';
import { cn } from '@/lib/utils';

interface TemplateTileProps {
  /** Template to preview (design only — `data` is usually sample content). */
  id: ResumeData['template'];
  /** Content rendered inside the A4 thumbnail. */
  data: ResumeData;
  /** Where the tile leads. */
  to: string;
  className?: string;
}

/**
 * Small, link-shaped design preview used in horizontal rails and teaser grids.
 *
 * The hover treatment is a soft light that follows the pointer plus a slight
 * lift — no tilt, no parallax, nothing that can clip in an overflow container.
 */
export default function TemplateTile({ id, data, to, className }: TemplateTileProps) {
  const template = getTemplate(id);
  const spot = usePointerSpotlight<HTMLAnchorElement>();

  return (
    <Link
      to={to}
      onPointerMove={spot.onPointerMove}
      onPointerLeave={spot.onPointerLeave}
      className={cn(
        'group block h-full rounded-xl border border-border/60 bg-card overflow-hidden card-hover interactive-card',
        className,
      )}
    >
      <div className="relative aspect-[210/297] bg-white overflow-hidden">
        <ResumeThumbnail data={{ ...data, template: id }} />
      </div>
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[12.5px] font-medium truncate">{template.label}</div>
          <div className="text-[10.5px] text-muted-foreground truncate capitalize">{template.category}</div>
        </div>
        <ArrowRight
          className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-accent transition-colors shrink-0"
          aria-hidden
        />
      </div>
    </Link>
  );
}
