import { useState, useCallback } from "react";
import { type SectionId } from "@/types/resume";
import SectionNav from "@/components/SectionNav";
import EditorPanel from "@/components/EditorPanel";
import PreviewPanel from "@/components/PreviewPanel";
import { cn } from "@/lib/utils";
import { Pencil, Eye } from "lucide-react";

const Index = () => {
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [activeSection, setActiveSection] = useState<SectionId | null>("personal");
  const [scrollToSection, setScrollToSection] = useState<SectionId | null>(null);

  const handleSectionClick = useCallback((sectionId: SectionId) => {
    setActiveSection(sectionId);
    setScrollToSection(sectionId);
    // Clear after a tick so the effect can re-trigger
    window.setTimeout(() => setScrollToSection(null), 200);
  }, []);

  return (
    <div className="h-full flex overflow-hidden bg-workspace">
      {/* Desktop: three-zone layout */}
      {/* Left: Section Navigation */}
      <div className="hidden lg:block w-[200px] shrink-0 h-full">
        <SectionNav
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
        />
      </div>

      {/* Center: Editor Form */}
      <div className={cn(
        "flex-1 min-w-0 h-full",
        mobileView === "edit" ? "block" : "hidden md:block"
      )}>
        <EditorPanel scrollToSection={scrollToSection} />
      </div>

      {/* Right: Preview */}
      <div className={cn(
        "flex-1 min-w-0 h-full hidden md:block",
        mobileView === "preview" && "block"
      )}>
        <PreviewPanel />
      </div>

      {/* Mobile: Edit/Preview toggle */}
      <div className="md:hidden fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 flex rounded-full border border-border/60 bg-card/95 backdrop-blur-xl shadow-lg p-1">
        <button
          onClick={() => setMobileView("edit")}
          aria-pressed={mobileView === "edit"}
          className={cn(
            "flex items-center gap-1.5 px-5 py-2 rounded-full text-[12px] font-medium transition-all duration-200 min-w-[80px] justify-center",
            mobileView === "edit" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
        <button
          onClick={() => setMobileView("preview")}
          aria-pressed={mobileView === "preview"}
          className={cn(
            "flex items-center gap-1.5 px-5 py-2 rounded-full text-[12px] font-medium transition-all duration-200 min-w-[80px] justify-center",
            mobileView === "preview" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Eye className="h-3.5 w-3.5" /> Preview
        </button>
      </div>
    </div>
  );
};

export default Index;
