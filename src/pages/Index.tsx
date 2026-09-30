import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useResume } from "@/context/ResumeContext";
import { type SectionId } from "@/types/resume";
import SectionNav from "@/components/SectionNav";
import EditorPanel from "@/components/EditorPanel";
import PreviewPanel from "@/components/PreviewPanel";
import { cn } from "@/lib/utils";
import { Pencil, Eye } from "lucide-react";

/**
 * Resume editor — three zones on desktop (sections | editor | live preview)
 * and an Edit/Preview switch on mobile.
 *
 * A visitor with no resume yet is sent to the create flow instead of being
 * shown an empty editor.
 */
const Index = () => {
  const { hasResume } = useResume();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mobileView, setMobileView] = useState<"edit" | "preview">(
    searchParams.get("view") === "preview" ? "preview" : "edit",
  );
  const [activeSection, setActiveSection] = useState<SectionId | null>("personal");
  const [scrollToSection, setScrollToSection] = useState<SectionId | null>(null);

  // No resume yet → send the visitor through onboarding.
  useEffect(() => {
    if (!hasResume) navigate("/create", { replace: true });
  }, [hasResume, navigate]);

  const handleSectionClick = useCallback((sectionId: SectionId) => {
    setActiveSection(sectionId);
    setScrollToSection(sectionId);
    // Clear after a tick so the effect can re-trigger
    window.setTimeout(() => setScrollToSection(null), 200);
  }, []);

  if (!hasResume) return null;

  return (
    <div className="h-full flex overflow-hidden bg-workspace">
      {/* Desktop: three-zone layout */}
      {/* Left: Section Navigation — resume sections only */}
      <div className="hidden lg:block w-[200px] shrink-0 h-full">
        <SectionNav
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
        />
      </div>

      {/*
        Center: Editor Form / Right: Preview.
        On desktop both are always present. On mobile the two panels slide in
        from their own side as you swap them, so the switch reads as a movement
        rather than a blink — and only one is ever mounted in the flow.
      */}
      <div className={cn(
        "flex-1 min-w-0 h-full",
        mobileView === "edit" ? "block animate-panel-left" : "hidden md:block",
        "md:animate-none"
      )}>
        <EditorPanel scrollToSection={scrollToSection} />
      </div>

      <div className={cn(
        "flex-1 min-w-0 h-full hidden md:block",
        mobileView === "preview" && "block animate-panel-right"
      )}>
        <PreviewPanel />
      </div>

      {/* Mobile: Edit/Preview toggle with a sliding pill indicator */}
      <div
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-50 flex -translate-x-1/2 rounded-full border border-border bg-card p-1 shadow-elevated md:hidden"
        role="group"
        aria-label="Editor view"
      >
        <span
          aria-hidden
          className={cn(
            "absolute bottom-1 left-1 top-1 w-[116px] rounded-full bg-primary transition-transform duration-300 ease-premium",
            mobileView === "preview" ? "translate-x-[116px]" : "translate-x-0",
          )}
        />
        <button
          onClick={() => setMobileView("edit")}
          aria-pressed={mobileView === "edit"}
          className={cn(
            "relative z-10 flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-medium transition-colors duration-200 w-[116px] justify-center",
            mobileView === "edit" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
        <button
          onClick={() => setMobileView("preview")}
          aria-pressed={mobileView === "preview"}
          className={cn(
            "relative z-10 flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-medium transition-colors duration-200 w-[116px] justify-center",
            mobileView === "preview" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Eye className="h-3.5 w-3.5" /> Preview
        </button>
      </div>
    </div>
  );
};

export default Index;
