import { useCallback, useState } from "react";
import { useResume } from "@/context/ResumeContext";
import { getTemplate } from "@/lib/templateRegistry";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ZOOM_LEVELS = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

const PreviewPanel = () => {
  const { resume } = useResume();
  const Template = getTemplate(resume.template).Component;
  const [zoomIdx, setZoomIdx] = useState(2);
  const [fullscreen, setFullscreen] = useState(false);

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

  const handleFit = useCallback(() => setZoomIdx(2), []);

  return (
    <div className={cn("h-full bg-workspace overflow-y-auto scrollbar-thin flex flex-col items-center", fullscreen && "fixed inset-0 z-50 bg-workspace")}>
      {/* ── Toolbar ── */}
      <div className="w-full sticky top-0 z-10 bg-workspace/80 backdrop-blur-xl border-b border-border/50 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</span>
          <span className="text-[11px] text-muted-foreground/60 capitalize">{resume.template}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setZoomIdx(Math.max(0, zoomIdx - 1))} disabled={zoomIdx === 0} aria-label="Zoom out">
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-[11px] text-muted-foreground tabular-nums w-10 text-center font-medium">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setZoomIdx(Math.min(ZOOM_LEVELS.length - 1, zoomIdx + 1))} disabled={zoomIdx === ZOOM_LEVELS.length - 1} aria-label="Zoom in">
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <div className="h-4 w-px bg-border/60 mx-1" />
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={handleFit} aria-label="Fit to view" title="Fit to view">
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setFullscreen(v => !v)} aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
            {fullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* ── A4 Canvas ── */}
      <div className="flex-1 flex items-start justify-center py-8 px-4 min-h-0">
        <div className="relative">
          <div className="absolute inset-0 rounded-sm pointer-events-none"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top center", width: "210mm", minHeight: "297mm",
              boxShadow: "0 2px 8px rgba(0,0,0,.08), 0 12px 40px rgba(0,0,0,.06), 0 24px 64px rgba(0,0,0,.04)" }} />
          <div className="bg-canvas rounded-sm transition-all duration-200 relative"
            style={{ width: "210mm", minHeight: "297mm", padding: "18mm 20mm", transform: `scale(${zoom})`, transformOrigin: "top center" }}>
            <Template data={resume} />
            {isEmpty && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-8 pointer-events-none">
                <Eye className="h-6 w-6 text-zinc-300" />
                <p className="text-[13px] font-medium text-zinc-400">Your resume preview appears here</p>
                <p className="text-[11px] text-zinc-400">Fill in the sections on the left and this page updates as you type.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
