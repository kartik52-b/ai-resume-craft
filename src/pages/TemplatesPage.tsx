import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useResume } from "@/context/ResumeContext";
import {
  TEMPLATE_REGISTRY,
  getTemplate,
  ALL_CATEGORIES,
  getCategoryCounts,
  DESIGN_COLLECTIONS,
  getCollectionTemplates,
  type TemplateDefinition,
  type TemplateCategory,
} from "@/lib/templateRegistry";
import { getSampleResume } from "@/lib/sampleResume";
import type { ResumeData } from "@/types/resume";
import ResumeThumbnail from "@/components/ResumeThumbnail";
import Carousel from "@/components/Carousel";
import Reveal from "@/components/Reveal";
import { useCardInteraction, useDragScroll } from "@/hooks/useInteraction";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { stagger } from "@/lib/motion";
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

type FilterType = "all" | TemplateCategory;

export function matchesFilter(t: TemplateDefinition, filter: FilterType): boolean {
  if (filter === "all") return true;
  return t.category === filter;
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
      variant="secondary"
      className="text-xs border-border/60 text-muted-foreground shrink-0"
    >
      {labels[layoutType] ?? layoutType}
    </Badge>
  );
}

/* ── Template card ──────────────────────────────────────────────────────── */

interface TemplateCardProps {
  template: TemplateDefinition;
  /** Sample content rendered inside the thumbnail. */
  data: ResumeData;
  /** Whether this is the design the active resume uses. */
  isCurrent: boolean;
  onPreview: () => void;
  onUse: () => void;
}

/**
 * Gallery card with a pointer-following highlight and a lift on hover, so the
 * card under the cursor is never ambiguous. Both actions stay on screen at all
 * times — nothing important here is hover-only.
 */
function TemplateCard({ template: t, data, isCurrent, onPreview, onUse }: TemplateCardProps) {
  // A light tilt plus the cursor sheen, in one listener pair. Elevation on hover
  // is shadow-only (no CSS translate) so the two transforms never fight.
  const fx = useCardInteraction<HTMLDivElement>({ maxTilt: 1.4, maxShift: 4 });

  return (
    <div
      {...fx}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-[border-color,box-shadow] duration-150",
        isCurrent
          ? "border-bronze shadow-card"
          : "border-border hover:border-border-strong hover:shadow-card",
      )}
    >
      {/* Thumbnail */}
      <button
        type="button"
        className="relative h-48 bg-muted/20 overflow-hidden flex items-start justify-center pt-4 w-full text-left"
        onClick={onPreview}
        aria-label={`Preview ${t.label} template`}
      >
        <div className="relative h-[167px] w-[118px] overflow-hidden border border-border shadow-sm transition-[transform,box-shadow] duration-200 group-hover:-translate-y-0.5 group-hover:scale-[1.02] group-hover:shadow-card-hover">
          <ResumeThumbnail data={{ ...data, template: t.id }} />
        </div>
        {isCurrent && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-sm bg-bronze px-1.5 py-0.5 text-xs font-medium text-bronze-foreground shadow-xs">
            <Check className="h-3 w-3" /> Selected
          </span>
        )}
      </button>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-1 gap-2">
          <h3 className="text-sm font-semibold">{t.label}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <LayoutBadge layoutType={t.layoutType} />
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-1.5 flex-1">
          {t.description}
        </p>
        <p className="text-xs text-muted-2 mb-3">
          Best for: {t.bestFor}
        </p>
        <div className="flex gap-1.5">
          <Button size="sm" variant="secondary" className="flex-1" onClick={onPreview}>
            Preview
          </Button>
          <Button
            size="sm"
            variant={isCurrent ? "primary" : "secondary"}
            className="flex-1"
            onClick={onUse}
            disabled={isCurrent}
          >
            {isCurrent ? "Selected" : "Use Template"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════════════════ */

/* ── Spotlight collections for the hero carousel ─────────────────────────── */

const SPOTLIGHT_IDS = ["professional", "modern", "creative", "engineering"] as const;

export default function TemplatesPage() {
  const { resume, setTemplate, hasResume } = useResume();
  const navigate = useNavigate();

  /* ── State ── */
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  // The category pills overflow on small screens; dragging is a friendlier way
  // to reach the last one than fighting a thin scrollbar.
  const pillScroll = useDragScroll<HTMLDivElement>();
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoomIdx, setZoomIdx] = useState(2); // index into ZOOM_LEVELS, default 80%
  const [confirmApply, setConfirmApply] = useState<TemplateDefinition | null>(
    null,
  );

  const sample = useMemo(() => getSampleResume(), []);

  /* ── Spotlight slides (real collections, real thumbnails) ── */
  const spotlightSlides = useMemo(
    () =>
      SPOTLIGHT_IDS.flatMap((cid) => {
        const collection = DESIGN_COLLECTIONS.find((c) => c.id === cid);
        if (!collection) return [];
        return [
          {
            id: cid,
            label: collection.label,
            blurb: collection.blurb,
            items: getCollectionTemplates(collection).slice(0, 4),
          },
        ];
      }),
    [],
  );
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
    ? hasResume && resume.template === previewTemplate.id
    : false;

  /* ── Apply template (preserves all resume data) ── */
  const applyTemplate = (id: string, label: string) => {
    // Nobody has a resume yet → carry the choice into the create flow.
    if (!hasResume) {
      toast.success(`${label} selected`, {
        description: "Add your details to finish creating your resume.",
      });
      navigate(`/create?template=${id}`);
      return;
    }
    setTemplate(id as never);
    toast.success(`${label} applied`, {
      description: "Your resume data is unchanged.",
    });
    navigate("/editor");
  };

  /* ── Use Template click handler — shows confirmation when user has data ── */
  const handleUseTemplate = (t: TemplateDefinition) => {
    if (!hasResume) {
      applyTemplate(t.id, t.label);
      return;
    }

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
      <div className="h-full overflow-auto bg-workspace scrollbar-thin">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-workspace px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {previewTemplate.label}
            </span>
            <Badge variant="secondary" className="text-xs">
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
            <span className="text-xs w-10 text-center tabular-nums">
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
              className="h-7 text-xs"
              onClick={() => setFullscreen(false)}
            >
              Exit
            </Button>
          </div>
        </div>
        {/* Block flow + auto margins: a zoomed page stays fully reachable and
            nothing is clipped at either edge. */}
        <div className="py-8 px-4">
          <div className="relative mx-auto w-fit">
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
          "flex-1 min-w-0 overflow-y-auto overflow-x-hidden scrollbar-thin",
          previewing && "hidden lg:block",
        )}
      >
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
          {/* ── Header ── */}
          <Reveal className="mb-7">
            <p className="eyebrow mb-3">Design library</p>
            <h1 className="font-display text-2xl font-semibold leading-tight text-foreground lg:text-3xl">
              Choose your template.
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
              {TEMPLATE_REGISTRY.length} professionally designed templates.
              Find the structure that fits your career.
            </p>
          </Reveal>

          {/* ── Spotlight carousel ── */}
          <Reveal className="mb-5">
            <Carousel
              ariaLabel="Featured design collections"
              slideLabels={spotlightSlides.map((s) => s.label)}
              slides={spotlightSlides.map((s) => (
                <div key={s.id} className="p-4 sm:p-5 grid sm:grid-cols-[1fr_1.5fr] gap-4 items-center">
                  <div className="min-w-0">
                    <p className="eyebrow mb-2.5">Collection</p>
                    <h2 className="font-display text-lg font-semibold leading-snug text-foreground">{s.label}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.blurb}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Open a preview to inspect it full-page — sample content only.</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {s.items.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setPreviewing(t.id)}
                        aria-label={`Preview ${t.label}`}
                        className="group relative aspect-[210/297] overflow-hidden border border-border bg-paper transition-colors duration-150 hover:border-border-strong"
                      >
                        <ResumeThumbnail data={{ ...sample, template: t.id }} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            />
          </Reveal>

          {/* ── Search + Categories ── */}
          <div className="space-y-3 mb-5">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates…"
                className="h-9 pl-9 text-sm bg-card"
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
            <div
              ref={pillScroll.ref}
              {...pillScroll.handlers}
              data-dragging={pillScroll.dragging}
              className={cn(
                "flex items-center gap-1 overflow-x-auto scrollbar-thin pb-1",
                pillScroll.dragging && "select-none",
              )}
            >
              {ALL_CATEGORIES.map((cat) => {
                const count = categoryCounts[cat.value] ?? 0;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setActiveFilter(cat.value)}
                    className={cn(
                      "whitespace-nowrap rounded-md border px-3 py-1.5 text-xs transition-colors duration-150",
                      activeFilter === cat.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground",
                    )}
                  >
                    {cat.label}
                    <span className="ml-1.5 text-xs opacity-60">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Template Grid ── */}
          {filtered.length > 0 ? (
            <Reveal>
              {/*
                Re-keyed on the active filter/search so a new result set staggers
                in instead of swapping instantly, while the controls above it stay
                perfectly still. The stagger is capped so a long list still lands
                almost immediately.
              */}
              <div
                key={`${activeFilter}|${searchQuery}`}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filtered.map((t, i) => (
                  <div
                    key={t.id}
                    className="h-full animate-fade-up stagger"
                    style={stagger(i, 45, 8)}
                  >
                    <TemplateCard
                      template={t}
                      data={sample}
                      isCurrent={Boolean(hasResume && resume.template === t.id)}
                      onPreview={() => setPreviewing(t.id)}
                      onUse={() => handleUseTemplate(t)}
                    />
                  </div>
                ))}
              </div>
            </Reveal>
          ) : (
            <div className="text-center py-16 animate-fade-up">
              <Search className="h-8 w-8 text-muted-2 mx-auto mb-3" />
              <p className="text-sm font-medium mb-1">No templates found</p>
              <p className="text-xs text-muted-foreground">
                Try a different search or category.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 text-xs"
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
        <div className="fixed inset-y-0 right-0 z-40 flex w-full shrink-0 flex-col border-l border-border bg-workspace animate-slide-in lg:relative lg:z-auto lg:w-[480px] xl:w-[540px]">
          {/* Panel header */}
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-3.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold" title={previewTemplate.label}>
                  {previewTemplate.label}
                </h2>
                <LayoutBadge layoutType={previewTemplate.layoutType} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {previewTemplate.layoutDescription}
              </p>
              <p className="text-xs text-muted-2 capitalize">
                {previewTemplate.category} · Best for{" "}
                {previewTemplate.bestFor}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0"
              onClick={() => setPreviewing(null)}
              aria-label="Close preview"
            >
              <X />
            </Button>
          </div>

          {/* Scrollable preview area */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="bg-muted/30 py-6 flex justify-center px-4">
              <div
                className="relative w-full max-w-[380px] overflow-hidden"
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
                  key={previewTemplate.id}
                  className="relative overflow-hidden bg-paper animate-fade-in"
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
              <p className="text-xs text-muted-foreground leading-relaxed">
                {previewTemplate.description}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {previewTemplate.features.map((f) => (
                  <div
                    key={f}
                    className="flex items-center gap-1.5 text-xs text-foreground"
                  >
                    <Check className="h-3 w-3 text-success shrink-0" />{f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Apply bar */}
          <div className="shrink-0 border-t border-border bg-card p-4">
            {isCurrent ? (
              <div className="flex h-10 items-center justify-center gap-2 rounded-md bg-bronze-soft text-sm font-medium text-foreground">
                <CheckCircle2 className="h-4 w-4" /> This is your active design
              </div>
            ) : (
              <Button
                className="h-10 w-full gap-2 rounded-md text-sm"
                onClick={() => handleUseTemplate(previewTemplate)}
              >
                Use This Template <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-1 mt-2.5">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-7 text-xs"
                onClick={() => setFullscreen(true)}
              >
                <Maximize2 className="h-3 w-3 mr-1" /> Fullscreen
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-7 text-xs"
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
                className="flex-1 h-7 text-xs"
                onClick={() => setZoomIdx((z) => Math.max(0, z - 1))}
                disabled={zoomIdx === 0}
              >
                <ZoomOut className="h-3 w-3 mr-1" /> Zoom out
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-7 text-xs"
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
            <DialogTitle className="text-base">
              Use {confirmApply?.label}?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
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
