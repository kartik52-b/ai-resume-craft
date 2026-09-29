import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useResume } from "@/context/ResumeContext";
import { getTemplate } from "@/lib/templateRegistry";
import {
  ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw, Eye,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ZOOM_LEVELS = [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
/** Phone-sized viewports start at fit-width so the whole A4 page is visible. */
const PHONE_BREAKPOINT = 768;
const DEFAULT_ZOOM_IDX = 3; // 70%
const PHONE_ZOOM_IDX = 0; // 40% — fits a 210mm sheet inside any phone viewport

/** A4 geometry in CSS pixels (96 dpi): 297mm ≈ 1122.52px. */
const PAGE_HEIGHT_PX = (297 * 96) / 25.4;
/** Tolerance so content that ends exactly on the page line doesn't create a phantom page. */
const PAGE_EPSILON_PX = 2;

/**
 * Live A4 preview.
 *
 * The sheet is a fixed 210×297mm window; the resume content flows naturally
 * underneath and is paged with `translateY` — so long resumes never clip,
 * overflow horizontally or get squashed. When (and only when) the content
 * spans more than one page, a `‹ Page 1 of 3 ›` navigator appears.
 */
const PreviewPanel = () => {
  const { resume } = useResume();
  const Template = getTemplate(resume.template).Component;
  const [zoomIdx, setZoomIdx] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < PHONE_BREAKPOINT ? PHONE_ZOOM_IDX : DEFAULT_ZOOM_IDX,
  );
  const [fullscreen, setFullscreen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const zoom = ZOOM_LEVELS[zoomIdx];
  // Always the user's own resume — sample content is never substituted here.
  const isEmpty =
    !resume.personal.fullName &&
    !resume.personal.summary &&
    resume.experience.length === 0 &&
    resume.education.length === 0 &&
    resume.skills.length === 0 &&
    resume.projects.length === 0 &&
    resume.certifications.length === 0;

  // Measure the natural content height to derive the page count. A
  // ResizeObserver keeps it exact while typing (falls back to a one-shot
  // measurement where ResizeObserver is unavailable).
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => {
      const next = Math.max(
        1,
        Math.ceil((el.offsetHeight - PAGE_EPSILON_PX) / PAGE_HEIGHT_PX),
      );
      setPageCount(next);
      setPage((current) => Math.min(current, next));
    };
    measure();
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      return () => observer.disconnect();
    }
  }, []);

  const handleFit = useCallback(
    () =>
      setZoomIdx(
        typeof window !== "undefined" && window.innerWidth < PHONE_BREAKPOINT
          ? PHONE_ZOOM_IDX
          : DEFAULT_ZOOM_IDX,
      ),
    [],
  );

  return (
    <div className={cn("h-full bg-workspace overflow-y-auto scrollbar-thin flex flex-col items-center", fullscreen && "fixed inset-0 z-50 bg-workspace")}>
      {/* ── Toolbar (+ page navigator when the resume spans several pages) ── */}
      <div className="w-full sticky top-0 z-10 bg-workspace/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</span>
            <span className="hidden sm:inline text-[11px] text-muted-foreground/60 capitalize">{resume.template}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setZoomIdx(Math.max(0, zoomIdx - 1))} disabled={zoomIdx === 0} aria-label="Zoom out">
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="hidden sm:block text-[11px] text-muted-foreground tabular-nums w-10 text-center font-medium">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setZoomIdx(Math.min(ZOOM_LEVELS.length - 1, zoomIdx + 1))} disabled={zoomIdx === ZOOM_LEVELS.length - 1} aria-label="Zoom in">
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <div className="h-4 w-px bg-border/60 mx-1" />
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={handleFit} aria-label="Fit to view" title="Fit to view">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setFullscreen(v => !v)} aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
              {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        {pageCount > 1 && (
          <div className="px-4 pb-2 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[12px] text-muted-foreground tabular-nums" aria-live="polite">
              Page {page} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page === pageCount}
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* ── A4 Canvas ── */}
      <div className="flex-1 flex items-start justify-center py-8 px-4 min-h-0">
        <div className="relative">
          <div className="absolute inset-0 rounded-sm pointer-events-none"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top center", width: "210mm", height: "297mm",
              boxShadow: "0 2px 8px rgba(0,0,0,.08), 0 16px 40px rgba(0,0,0,.06), 0 24px 64px rgba(0,0,0,.04)" }} />
          <div
            className="bg-canvas rounded-sm transition-transform duration-200 relative overflow-hidden"
            style={{ width: "210mm", height: "297mm", transform: `scale(${zoom})`, transformOrigin: "top center" }}
          >
            {/* Content flows naturally; each page is this window translated up. */}
            <div
              ref={contentRef}
              style={{
                padding: "18mm 20mm",
                minHeight: "297mm",
                transform: `translateY(calc(-297mm * ${page - 1}))`,
                transition: "transform 0.25s ease",
              }}
            >
              <Template data={resume} />
            </div>
            {isEmpty && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-8 pointer-events-none">
                <Eye className="h-6 w-6 text-zinc-300" />
                <p className="text-[13px] font-medium text-zinc-400">Your resume preview appears here</p>
                <p className="text-[12px] text-zinc-400">Fill in the sections on the left and this page updates as you type.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
