import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useResume } from "@/context/ResumeContext";
import {
  TEMPLATE_REGISTRY,
  getTemplate,
  ALL_CATEGORIES,
  getCategoryCounts,
  type TemplateDefinition,
  type TemplateCategory,
} from "@/lib/templateRegistry";
import { getSampleResume } from "@/lib/sampleResume";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  CheckCircle2,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  ArrowRight,
  Check,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/* ── Helpers ────────────────────────────────────────────────────────────── */

type FilterType = "all" | "ats" | TemplateCategory;

function matchesFilter(t: TemplateDefinition, filter: FilterType): boolean {
  if (filter === "all") return true;
  if (filter === "ats") return t.atsSafe;
  return t.category === filter;
}

/* ── Thumbnail rendered from the real template component ────────────────── */

function TemplateThumbnail({
  template,
  sample,
}: {
  template: TemplateDefinition;
  sample: ReturnType<typeof getSampleResume>;
}) {
  const previewData = { ...sample, template: template.id };
  return (
    <div
      className="w-full aspect-[210/297] bg-white overflow-hidden pointer-events-none select-none"
      style={{
        width: "286%",
        height: "286%",
        position: "absolute",
        top: 0,
        left: 0,
        transform: "scale(0.35)",
        transformOrigin: "top left",
      }}
    >
      <template.Component data={previewData} />
    </div>
  );
}

/* ── Zoom levels for preview ────────────────────────────────────────────── */

const ZOOM_LEVELS = [0.5, 0.65, 0.8, 1.0];

/* ── Layout badge helper ────────────────────────────────────────────────── */

function LayoutBadge({ layoutType }: { layoutType: string }) {
  const labels: Record<string, string> = {
    "one-column": "One Column",
    "two-column": "Two Column",
    sidebar: "Sidebar",
  };
  return (
    <Badge
      variant="outline"
      className="text-[9px] border-border/60 text-muted-foreground shrink-0"
    >
      {labels[layoutType] ?? layoutType}
    </Badge>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════════════════ */

export default function TemplatesPage() {
  const { resume, setTemplate } = useResume();
  const navigate = useNavigate();

  /* ── State ── */
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoomIdx, setZoomIdx] = useState(2); // index into ZOOM_LEVELS, default 80%
  const [confirmApply, setConfirmApply] = useState<TemplateDefinition | null>(
    null,
  );

  const sample = useMemo(() => getSampleResume(), []);
  const categoryCounts = useMemo(() => getCategoryCounts(), []);

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return TEMPLATE_REGISTRY.filter((t) => {
      if (!matchesFilter(t, activeFilter)) return false;
      if (q) {
        return (
          t.label.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.bestFor.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.includes(q))
        );
      }
      return true;
    });
  }, [activeFilter, searchQuery]);

  /* ── Preview template ── */
  const previewTemplate = previewing ? getTemplate(previewing as never) : null;
  const isCurrent = previewTemplate
    ? resume.template === previewTemplate.id
    : false;

  /* ── Apply template (preserves all resume data) ── */
  const applyTemplate = (id: string, label: string) => {
    setTemplate(id as never);
    toast.success(`${label} applied`, {
      description: "Your resume data is unchanged.",
    });
    navigate("/editor");
  };

  /* ── Use Template click handler — shows confirmation when user has data ── */
  const handleUseTemplate = (t: TemplateDefinition) => {
    const hasData =
      resume.personal.fullName ||
      resume.experience.length > 0 ||
      resume.education.length > 0 ||
      resume.skills.length > 0 ||
      resume.projects.length > 0;

    if (resume.template === t.id) {
      toast.info("This template is already active");
      return;
    }

    if (hasData) {
      setConfirmApply(t);
    } else {
      applyTemplate(t.id, t.label);
    }
  };

  /* ═════════════════════════════════════════════════════════════════════════
     FULLSCREEN PREVIEW
     ═════════════════════════════════════════════════════════════════════════ */

  if (previewTemplate && fullscreen) {
    const Template = previewTemplate.Component;
    return (
      <div className="h-full bg-workspace overflow-y-auto scrollbar-thin">
        <div className="sticky top-0 z-10 bg-workspace/90 backdrop-blur-xl border-b border-border/50 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold">
              {previewTemplate.label}
            </span>
            <Badge variant="secondary" className="text-[10px]">
              Fullscreen
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setZoomIdx(Math.max(0, zoomIdx - 1))}
              disabled={zoomIdx === 0}
              aria-label="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[11px] w-10 text-center tabular-nums">
              {Math.round(ZOOM_LEVELS[zoomIdx] * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() =>
                setZoomIdx(Math.min(ZOOM_LEVELS.length - 1, zoomIdx + 1))
              }
              disabled={zoomIdx === ZOOM_LEVELS.length - 1}
              aria-label="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setZoomIdx(2)}
              aria-label="Fit"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            <div className="h-5 w-px bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[12px]"
              onClick={() => setFullscreen(false)}
            >
              Exit
            </Button>
          </div>
        </div>
        <div className="flex items-start justify-center py-8 px-4">
          <div className="relative">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                transform: `scale(${ZOOM_LEVELS[zoomIdx]})`,
                transformOrigin: "top center",
                width: "210mm",
                minHeight: "297mm",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,.08), 0 16px 48px rgba(0,0,0,.1)",
              }}
            />
            <div
              className="bg-canvas relative"
              style={{
                width: "210mm",
                minHeight: "297mm",
                padding: "18mm 20mm",
                transform: `scale(${ZOOM_LEVELS[zoomIdx]})`,
                transformOrigin: "top center",
              }}
            >
              <Template data={{ ...sample, template: previewTemplate.id }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═════════════════════════════════════════════════════════════════════════
     GALLERY + RIGHT PREVIEW
     ═════════════════════════════════════════════════════════════════════════ */

  return (
    <div className="h-full flex overflow-hidden bg-workspace">
      {/* ── Gallery ── */}
      <div
        className={cn(
          "flex-1 min-w-0 overflow-y-auto scrollbar-thin",
          previewing && "hidden lg:block",
        )}
      >
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
          {/* ── Header ── */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-0.5">
              <Layers className="h-5 w-5 text-accent" />
              <h1 className="text-xl font-bold tracking-tight">Templates</h1>
            </div>
            <p className="text-[13px] text-muted-foreground">
              Choose a resume design that fits your career.
            </p>
            <p className="text-[12px] text-muted-foreground/60 mt-0.5">
              {TEMPLATE_REGISTRY.length} professionally designed templates with
              distinct layouts.
            </p>
          </div>

          {/* ── Search + Categories ── */}
          <div className="space-y-3 mb-5">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates…"
                className="h-9 pl-9 text-[13px] bg-card"
                aria-label="Search templates"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Category tabs — counts from real registry */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin pb-1">
              {ALL_CATEGORIES.map((cat) => {
                const count = categoryCounts[cat.value] ?? 0;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setActiveFilter(cat.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all duration-150",
                      activeFilter === cat.value
                        ? "bg-accent text-accent-foreground shadow-sm"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                    )}
                  >
                    {cat.label}
                    <span className="ml-1.5 text-[10px] opacity-60">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Template Grid ── */}
          {filtered.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((t) => {
                const isCurrent = resume.template === t.id;
                return (
                  <div
                    key={t.id}
                    className={cn(
                      "group relative rounded-xl border bg-card overflow-hidden transition-all duration-200 card-hover flex flex-col",
                      isCurrent
                        ? "border-accent/50 ring-2 ring-accent/10"
                        : "border-border/60",
                    )}
                  >
                    {/* Thumbnail */}
                    <button
                      className="relative h-48 bg-muted/20 overflow-hidden flex items-start justify-center pt-4 w-full text-left"
                      onClick={() => setPreviewing(t.id)}
                      aria-label={`Preview ${t.label} template`}
                    >
                      <div className="relative w-[118px] h-[167px] shadow-md rounded-sm overflow-hidden border border-border/20 transition-transform duration-200 group-hover:shadow-lg group-hover:scale-[1.03]">
                        <TemplateThumbnail template={t} sample={sample} />
                      </div>
                      {isCurrent && (
                        <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-semibold text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      )}
                    </button>

                    {/* Info */}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <h3 className="text-[13.5px] font-semibold truncate">
                          {t.label}
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                          {t.atsSafe && (
                            <Badge
                              variant="outline"
                              className="text-[9px] border-emerald-500/30 text-emerald-500"
                            >
                              ATS
                            </Badge>
                          )}
                          <LayoutBadge layoutType={t.layoutType} />
                        </div>
                      </div>
                      <p className="text-[11.5px] text-muted-foreground leading-relaxed mb-1.5 flex-1">
                        {t.description}
                      </p>
                      <p className="text-[11px] text-muted-foreground/60 mb-3">
                        Best for: {t.bestFor}
                      </p>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8 text-[12px] font-medium"
                          onClick={() => setPreviewing(t.id)}
                        >
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant={isCurrent ? "default" : "outline"}
                          className="flex-1 h-8 text-[12px] font-medium"
                          onClick={() => handleUseTemplate(t)}
                          disabled={isCurrent}
                        >
                          {isCurrent ? "Active" : "Use Template"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-[14px] font-medium mb-1">No templates found</p>
              <p className="text-[12px] text-muted-foreground">
                Try a different search or category.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 text-[12px]"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Right-side Preview Panel ── */}
      {previewTemplate && (
        <div className="fixed lg:relative inset-y-0 right-0 z-40 lg:z-auto w-full lg:w-[480px] xl:w-[540px] shrink-0 bg-workspace border-l border-border/60 flex flex-col animate-slide-in">
          {/* Panel header */}
          <div className="shrink-0 border-b border-border/60 px-5 py-3.5 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-bold truncate">
                  {previewTemplate.label}
                </h2>
                {previewTemplate.atsSafe ? (
                  <Badge
                    variant="outline"
                    className="text-[9px] border-emerald-500/30 text-emerald-500 shrink-0"
                  >
                    ATS Friendly
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[9px] border-amber-500/30 text-amber-500 shrink-0"
                  >
                    Visual
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {previewTemplate.layoutDescription}
              </p>
              <p className="text-[11px] text-muted-foreground/60 capitalize">
                {previewTemplate.category} · Best for{" "}
                {previewTemplate.bestFor}
              </p>
            </div>
            <button
              onClick={() => setPreviewing(null)}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable preview area */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="bg-muted/30 py-6 flex justify-center px-4">
              <div
                className="relative w-full max-w-[380px] overflow-hidden rounded-sm"
                style={{ aspectRatio: "210/297" }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow:
                      "0 2px 8px rgba(0,0,0,.06), 0 12px 32px rgba(0,0,0,.08)",
                  }}
                />
                <div
                  className="relative bg-white rounded-sm overflow-hidden"
                  style={{ aspectRatio: "210/297" }}
                >
                  <div
                    style={{
                      width: "210mm",
                      minHeight: "297mm",
                      padding: "16mm 18mm",
                      transform: `scale(${0.53 * (ZOOM_LEVELS[zoomIdx] / ZOOM_LEVELS[2])})`,
                      transformOrigin: "top left",
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  >
                    <previewTemplate.Component
                      data={{ ...sample, template: previewTemplate.id }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Template features */}
            <div className="px-5 py-4 space-y-3">
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                {previewTemplate.description}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {previewTemplate.features.map((f) => (
                  <div
                    key={f}
                    className="flex items-center gap-1.5 text-[11.5px] text-foreground"
                  >
                    <Check className="h-3 w-3 text-emerald-500 shrink-0" />{f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Apply bar */}
          <div className="shrink-0 border-t border-border/60 p-4 bg-card">
            {isCurrent ? (
              <div className="flex items-center justify-center gap-2 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 text-[13px] font-semibold">
                <CheckCircle2 className="h-4 w-4" /> This is your active
                template
              </div>
            ) : (
              <Button
                className="w-full h-10 btn-gradient rounded-xl text-[13px] font-semibold gap-2"
                onClick={() => handleUseTemplate(previewTemplate)}
              >
                Use This Template <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-1 mt-2.5">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-7 text-[11px]"
                onClick={() => setFullscreen(true)}
              >
                <Maximize2 className="h-3 w-3 mr-1" /> Fullscreen
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-7 text-[11px]"
                onClick={() =>
                  setZoomIdx((z) => Math.min(ZOOM_LEVELS.length - 1, z + 1))
                }
                disabled={zoomIdx === ZOOM_LEVELS.length - 1}
              >
                <ZoomIn className="h-3 w-3 mr-1" /> Zoom in
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-7 text-[11px]"
                onClick={() => setZoomIdx((z) => Math.max(0, z - 1))}
                disabled={zoomIdx === 0}
              >
                <ZoomOut className="h-3 w-3 mr-1" /> Zoom out
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-7 text-[11px]"
                onClick={() => setZoomIdx(2)}
              >
                <RotateCcw className="h-3 w-3 mr-1" /> Fit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Use Template Confirmation Dialog ── */}
      <Dialog
        open={confirmApply !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmApply(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px]">
              Use {confirmApply?.label}?
            </DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground leading-relaxed">
              Your existing resume information will be kept. Only the design
              will change.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmApply(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => {
                if (confirmApply) {
                  applyTemplate(confirmApply.id, confirmApply.label);
                  setConfirmApply(null);
                }
              }}
            >
              <Check className="h-3.5 w-3.5" /> Use Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
