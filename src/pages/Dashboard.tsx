import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useResume } from "@/context/ResumeContext";
import { analyzeResume } from "@/lib/ats";
import { getTemplate } from "@/lib/templateRegistry";
import { getSampleResume } from "@/lib/sampleResume";
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
import Carousel from "@/components/Carousel";
import { downloadResumePdf } from "@/lib/pdfEngine";
import { toast } from "sonner";

function AtsHealthBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-500";
  const bg = score >= 80 ? "bg-emerald-500/10" : score >= 60 ? "bg-amber-500/10" : "bg-red-500/10";
  const label = score >= 80 ? "Strong" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Weak";
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full", bg, color)}>
      ATS {label} · {score}
    </span>
  );
}

const ONBOARDING_PREVIEWS = ["modern", "developer", "two-column", "elegant"] as const;

const QUICK_ACCESS = [
  { href: "/create", icon: FilePlus2, label: "Create Resume", desc: "Start a fresh resume", color: "text-green-500" },
  { href: "/templates", icon: LayoutTemplate, label: "Templates", desc: "Browse 25+ designs", color: "text-orange-500" },
  { href: "/settings", icon: Settings, label: "Settings", desc: "Data & preferences", color: "text-blue-500" },
];

const TIPS = [
  { title: "Tailor your summary", desc: "Mirror the language of the job posting — the ATS and the recruiter are looking for the same keywords." },
  { title: "Quantify your impact", desc: "Numbers make experience credible: “cut load time by 40%” beats “improved performance” every time." },
  { title: "Start bullets with results", desc: "Lead with a strong action verb and the outcome, not the task you performed." },
  { title: "Keep it to one page", desc: "Early in your career one page is ideal — for senior roles, lead with your last 10–15 years." },
];

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
      <div className="min-h-full bg-workspace overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
          <ImportDialog open={importOpen} onOpenChange={setImportOpen} />

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-[12px] font-medium mb-5">
              <Sparkles className="h-3.5 w-3.5" /> Welcome
            </div>
            <h1 className="text-[26px] lg:text-[32px] font-bold tracking-tight text-foreground leading-tight">
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
          </div>

          {/* What you get */}
          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            {[
              { icon: PenLine, title: "Guided setup", desc: "Three quick steps: details, design, done." },
              { icon: Palette, title: "25 designs", desc: "Switch designs any time without losing content." },
              { icon: FileDown, title: "One-click PDF", desc: "Export an ATS-friendly PDF when you're ready." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border/60 bg-card p-4">
                <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center mb-2.5">
                  <Icon className="h-4 w-4 text-accent" />
                </div>
                <h3 className="text-[13px] font-semibold mb-0.5">{title}</h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Design teasers — clearly labelled as design previews */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-semibold text-foreground">A few designs to start from</h2>
              <Link to="/templates" className="text-[12px] text-accent hover:underline inline-flex items-center gap-1">
                Browse all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ONBOARDING_PREVIEWS.map((id) => {
                const t = getTemplate(id);
                return (
                  <button
                    key={id}
                    onClick={() => navigate(`/create?template=${id}`)}
                    className="group text-left rounded-xl border border-border/60 bg-card overflow-hidden card-hover"
                  >
                    <div className="relative aspect-[210/297] bg-white overflow-hidden">
                      <ResumeThumbnail data={{ ...sampleResume, template: id }} />
                    </div>
                    <div className="px-2.5 py-2">
                      <div className="text-[12px] font-medium truncate">{t.label}</div>
                      <div className="text-[10.5px] text-muted-foreground truncate">{t.category}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Design previews above use sample content. Your resume uses only what you enter.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Returning user: their real resumes ── */
  return (
    <div className="min-h-full bg-workspace overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <p className="text-[13px] text-muted-foreground mb-1">{greeting}</p>
            <h1 className="text-[28px] font-bold tracking-tight text-foreground leading-tight">
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
          <div className="hidden xl:flex items-center justify-center w-64 h-44 rounded-2xl bg-gradient-to-br from-accent/5 to-purple-500/5 border border-accent/10 shrink-0">
            <div className="text-center space-y-2">
              <FileText className="h-10 w-10 text-accent/30 mx-auto" />
              <p className="text-[11px] text-muted-foreground/50 font-medium">AI-Powered</p>
            </div>
          </div>
        </div>

        <ImportDialog open={importOpen} onOpenChange={setImportOpen} />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-foreground">
              Your Resumes
              <span className="text-muted-foreground font-normal ml-2 text-[13px]">{resumes.length}</span>
            </h2>
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="h-8 pl-8 text-[12px] w-40 bg-background border-border/60"
                />
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-[12px] gap-1 text-muted-foreground hover:text-foreground" onClick={() => setSortBy(sortBy === "date" ? "name" : sortBy === "name" ? "template" : "date")}>
                <ArrowUpDown className="h-3 w-3" />{sortBy === "date" ? "Recent" : sortBy === "name" ? "Name" : "Template"}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResumes.map((r) => {
              const isActive = r.id === activeId;
              const ats = analyzeResume(r);
              return (
                <div key={r.id} className={cn("group relative rounded-xl border bg-card card-hover flex flex-col", isActive ? "border-accent/40 ring-1 ring-accent/10 shadow-sm" : "border-border/60")}>
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
                            className="text-[10px] text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
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
            })}
          </div>

          {filteredResumes.length === 0 && (
            <p className="text-[13px] text-muted-foreground text-center py-10">No resumes match “{searchQuery}”.</p>
          )}
        </div>

        <div>
          <h2 className="text-[15px] font-semibold text-foreground mb-4">Quick Access</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_ACCESS.map((item) => (
              <Link key={item.href} to={item.href} className="group flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-card card-hover cursor-pointer">
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-muted/50", item.color)}>
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
        </div>

        <div>
          <h2 className="text-[15px] font-semibold text-foreground mb-4">Tips to get hired</h2>
          <Carousel
            compact
            autoplayMs={7000}
            ariaLabel="Resume writing tips"
            slideLabels={TIPS.map((t) => t.title)}
            slides={TIPS.map((tip, i) => (
              <div key={tip.title} className="flex items-start gap-3 px-4 py-3">
                <span className="h-6 w-6 rounded-md bg-accent/10 text-accent text-[11px] font-bold flex items-center justify-center shrink-0 tabular-nums">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-foreground">{tip.title}</div>
                  <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            ))}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
