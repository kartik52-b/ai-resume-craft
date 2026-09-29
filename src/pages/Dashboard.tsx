import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useResume } from "@/context/ResumeContext";
import { analyzeResume } from "@/lib/ats";
import { getSampleResume } from "@/lib/sampleResume";
import type { ResumeData } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ResumeThumbnail from "@/components/ResumeThumbnail";
import {
  Plus, FileText, Copy, Trash2, Check, X,
  LayoutTemplate, Upload, Search, ArrowUpDown, ArrowRight,
  Sparkles, Clock, FileDown, Eye, PenLine, Palette, FilePlus2, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ImportDialog } from "@/components/ImportDialog";
import ScrollRail from "@/components/ScrollRail";
import Reveal from "@/components/Reveal";
import TipStrip from "@/components/TipStrip";
import TemplateTile from "@/components/TemplateTile";
import { downloadResumePdf } from "@/lib/pdfEngine";
import { toast } from "sonner";

function AtsHealthBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive";
  const bg = score >= 80 ? "bg-success/10" : score >= 60 ? "bg-warning/10" : "bg-destructive/10";
  const label = score >= 80 ? "Strong" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Weak";
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full", bg, color)}>
      ATS {label} · {score}
    </span>
  );
}

const ONBOARDING_PREVIEWS = ["modern", "developer", "two-column", "elegant"] as const;

const QUICK_ACCESS = [
  { href: "/create", icon: FilePlus2, label: "Create Resume", desc: "Start a fresh resume", chip: "from-accent/20 to-accent/5 text-accent border-accent/25" },
  { href: "/templates", icon: LayoutTemplate, label: "Templates", desc: "Browse 25+ designs", chip: "from-accent-2/20 to-accent-2/5 text-accent-2 border-accent-2/25" },
  { href: "/settings", icon: Settings, label: "Settings", desc: "Data & preferences", chip: "from-info/20 to-info/5 text-info border-info/25" },
];

const TIPS = [
  { title: "Tailor your summary", text: "Mirror the language of the job posting — the ATS and the recruiter are looking for the same keywords." },
  { title: "Quantify your impact", text: "Numbers make experience credible: “cut load time by 40%” beats “improved performance” every time." },
  { title: "Start bullets with results", text: "Lead with a strong action verb and the outcome, not the task you performed." },
  { title: "Keep it to one page", text: "Early in your career one page is ideal — for senior roles, lead with your last 10–15 years." },
];

/**
 * Above this many resumes a horizontal rail beats a grid: the cards stay a
 * comfortable size instead of squeezing into a fourth column, and the row is
 * only ever one drag or arrow-key away. Below it, a plain responsive grid is
 * simply better — scrolling four cards horizontally would be pointless.
 */
const RAIL_THRESHOLD = 5;

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    resumes, hasResume, activeId, renameResumeAction,
    duplicateResumeAction, deleteResumeAction, switchResume,
  } = useResume();

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "template">("date");

  const filteredResumes = useMemo(() => {
    let list = [...resumes];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      if (sortBy === "name") return a.title.localeCompare(b.title);
      if (sortBy === "template") return a.template.localeCompare(b.template);
      return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");
    });
    return list;
  }, [resumes, searchQuery, sortBy]);

  /** Sample content for the design teasers only — never used as user data. */
  const sampleResume = useMemo(() => getSampleResume(), []);

  const commitRename = () => {
    if (renamingId) renameResumeAction(renamingId, renameValue);
    setRenamingId(null);
  };

  const editResume = (id: string) => {
    switchResume(id);
    navigate("/editor");
  };

  const previewResume = (id: string) => {
    switchResume(id);
    navigate("/editor?view=preview");
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  /* ── Brand-new user: no fake resumes, just a clear way in ── */
  if (!hasResume) {
    return (
      <div className="relative min-h-full bg-workspace overflow-x-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] overflow-hidden" aria-hidden>
          <div className="aurora animate-aurora opacity-60" />
          <div className="grid-veil" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
          <ImportDialog open={importOpen} onOpenChange={setImportOpen} />

          <Reveal className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel text-accent text-[12px] font-medium mb-5 animate-fade-down">
              <Sparkles className="h-3.5 w-3.5" /> Welcome
            </div>
            <h1 className="font-display text-[26px] lg:text-[32px] font-bold tracking-tight text-foreground leading-tight animate-fade-up">
              Welcome to AI Resume Craft
            </h1>
            <p className="text-[15px] text-muted-foreground mt-3 leading-relaxed">
              Create your first professional resume.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-7">
              <Button
                size="lg"
                onClick={() => navigate("/create")}
                className="btn-gradient h-12 px-7 rounded-xl text-[15px] font-semibold gap-2 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" /> Create New Resume
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setImportOpen(true)}
                className="h-12 px-6 rounded-xl text-[14px] gap-2 w-full sm:w-auto"
              >
                <Upload className="h-4 w-4" /> Import Existing
              </Button>
            </div>

            <p className="text-[12px] text-muted-foreground mt-4">
              Saved locally in this browser — nothing is uploaded.
            </p>
          </Reveal>

          {/* What you get */}
          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            {[
              { icon: PenLine, title: "Guided setup", desc: "Three quick steps: details, design, done." },
              { icon: Palette, title: "25 designs", desc: "Switch designs any time without losing content." },
              { icon: FileDown, title: "One-click PDF", desc: "Export an ATS-friendly PDF when you're ready." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delayMs={i * 70} className="h-full">
                <div className="premium-card group h-full p-4">
                  <div className="icon-chip h-9 w-9 mb-2.5">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-[13px] font-semibold mb-0.5">{title}</h3>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Design teasers — clearly labelled as design previews */}
          <Reveal className="mt-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-semibold text-foreground">A few designs to start from</h2>
              <Link to="/templates" className="text-[12px] text-accent hover:underline inline-flex items-center gap-1">
                Browse all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ONBOARDING_PREVIEWS.map((id) => (
                <TemplateTile key={id} id={id} data={sampleResume} to={`/create?template=${id}`} className="h-full" />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Design previews above use sample content. Your resume uses only what you enter.
            </p>
          </Reveal>
        </div>
      </div>
    );
  }

  /* ── One card, rendered into either a grid or a rail ── */
  const renderResumeCard = (r: ResumeData) => {
    const isActive = r.id === activeId;
    const ats = analyzeResume(r);
    return (
      <div
        key={r.id}
        className={cn(
          "premium-card group relative h-full interactive-card flex flex-col hover:shadow-elevated",
          isActive ? "border-accent/40 ring-1 ring-accent/10" : "border-border/75",
        )}
      >
        {/* Thumbnail — the user's real resume */}
        <button
          type="button"
          onClick={() => editResume(r.id)}
          aria-label={`Open ${r.title}`}
          className="relative h-32 bg-white rounded-t-xl overflow-hidden border-b border-border/30"
        >
          <ResumeThumbnail data={r} />
        </button>

        <div className="p-4 flex-1 flex flex-col">
          <div className="min-w-0 flex-1">
            {renamingId === r.id ? (
              <div className="flex items-center gap-1">
                <Input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingId(null); }} className="h-7 text-[12px]" />
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={commitRename} aria-label="Save name"><Check className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setRenamingId(null)} aria-label="Cancel rename"><X className="h-3 w-3" /></Button>
              </div>
            ) : (
              <div className="flex items-start gap-1">
                <h3 className="text-[14px] font-semibold truncate leading-tight flex-1">{r.title}</h3>
                <button
                  onClick={() => { setRenamingId(r.id); setRenameValue(r.title); }}
                  className="hover-reveal text-[10px] text-muted-foreground hover:text-foreground shrink-0 transition-colors focus-visible:opacity-100"
                >
                  Rename
                </button>
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
              <LayoutTemplate className="h-3 w-3" />
              <span className="capitalize">{r.template.replace('-', ' ')}</span>
              <span className="opacity-30">·</span>
              <Clock className="h-3 w-3" />
              <span>{r.updatedAt ? formatDistanceToNow(new Date(r.updatedAt), { addSuffix: true }) : "new"}</span>
            </div>
          </div>
          <div className="mt-3 mb-1"><AtsHealthBadge score={ats.score} /></div>
          <div className="flex items-center gap-1 pt-3 mt-auto border-t border-border/50">
            <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground transition-colors" onClick={() => editResume(r.id)}>
              <PenLine className="h-3 w-3" /> Edit
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground transition-colors" onClick={() => previewResume(r.id)}>
              <Eye className="h-3 w-3" /> Preview
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground transition-colors" onClick={() => duplicateResumeAction(r.id)}>
              <Copy className="h-3 w-3" /> Duplicate
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground transition-colors" onClick={() => { try { downloadResumePdf(r); toast.success("PDF exported"); } catch { toast.error("Export failed"); } }} aria-label="Download PDF">
              <FileDown className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-7 w-7 text-muted-foreground hover:text-foreground transition-colors ml-auto", confirmDeleteId === r.id && "text-destructive bg-destructive/5")}
              onClick={() => { if (confirmDeleteId === r.id) { deleteResumeAction(r.id); setConfirmDeleteId(null); } else { setConfirmDeleteId(r.id); setTimeout(() => setConfirmDeleteId((c) => c === r.id ? null : c), 3000); } }}
              aria-label={confirmDeleteId === r.id ? `Confirm delete ${r.title}` : `Delete ${r.title}`}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const railLayout = filteredResumes.length >= RAIL_THRESHOLD;

  /* ── Returning user: their real resumes ── */
  return (
    <div className="min-h-full bg-workspace overflow-y-auto overflow-x-hidden scroll-smooth">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        <Reveal className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <p className="text-[13px] text-muted-foreground mb-1">{greeting}</p>
            <h1 className="font-display text-[28px] font-bold tracking-tight text-foreground leading-tight">
              My Resumes
            </h1>
            <p className="text-[14px] text-muted-foreground mt-2 max-w-lg leading-relaxed">
              {resumes.length === 1 ? "1 resume saved in this browser." : `${resumes.length} resumes saved in this browser.`}{" "}
              AI features may send selected content to the configured AI provider.
            </p>
            <div className="flex items-center gap-2.5 mt-5">
              <Button size="sm" onClick={() => navigate("/create")} className="btn-gradient h-10 gap-1.5 text-[13px] font-medium rounded-xl px-5">
                <Plus className="h-4 w-4" /> Create New Resume
              </Button>
              <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className="h-10 gap-1.5 text-[13px] rounded-xl px-5">
                <Upload className="h-4 w-4" /> Import Resume
              </Button>
            </div>
          </div>
          <div className="hidden xl:flex items-center justify-center w-64 h-44 rounded-2xl bg-gradient-to-br from-accent/10 to-accent-2/10 border border-accent/15 shrink-0">
            <div className="text-center space-y-2">
              <FileText className="h-10 w-10 text-accent/30 mx-auto" />
              <p className="text-[11px] text-muted-foreground/50 font-medium">AI-Powered</p>
            </div>
          </div>
        </Reveal>

        <ImportDialog open={importOpen} onOpenChange={setImportOpen} />

        <Reveal>
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-foreground">
                Your Resumes
                <span className="text-muted-foreground font-normal ml-2 text-[13px]">{resumes.length}</span>
              </h2>
              {railLayout && (
                <p className="text-[11.5px] text-muted-foreground mt-0.5">
                  Browse with the arrows, drag the row, or use ← → while it is focused.
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="h-8 pl-8 text-[12px] w-40 bg-background border-border/60"
                  aria-label="Search your resumes"
                />
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-[12px] gap-1 text-muted-foreground hover:text-foreground" onClick={() => setSortBy(sortBy === "date" ? "name" : sortBy === "name" ? "template" : "date")}>
                <ArrowUpDown className="h-3 w-3" />{sortBy === "date" ? "Recent" : sortBy === "name" ? "Name" : "Template"}
              </Button>
            </div>
          </div>

          {railLayout ? (
            <ScrollRail
              ariaLabel="Your resumes"
              itemClassName="w-[280px] sm:w-[320px]"
              items={filteredResumes.map(renderResumeCard)}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredResumes.map(renderResumeCard)}
            </div>
          )}

          {filteredResumes.length === 0 && (
            <p className="text-[13px] text-muted-foreground text-center py-10">No resumes match “{searchQuery}”.</p>
          )}
        </Reveal>

        <Reveal>
          <h2 className="text-[15px] font-semibold text-foreground mb-4">Quick Access</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_ACCESS.map((item) => (
              <Link key={item.href} to={item.href} className="premium-card group flex items-center gap-3 p-4 cursor-pointer">
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br border transition-transform duration-200 group-hover:scale-105", item.chip)}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-foreground">{item.label}</div>
                  <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <h2 className="text-[15px] font-semibold text-foreground mb-4">Tips to get hired</h2>
          <TipStrip tips={TIPS} ariaLabel="Resume writing tips" />
        </Reveal>
      </div>
    </div>
  );
};

export default Dashboard;
