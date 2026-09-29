import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useResume } from "@/context/ResumeContext";
import { getTemplate } from "@/lib/templateRegistry";
import { getSampleResume } from "@/lib/sampleResume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ResumeThumbnail from "@/components/ResumeThumbnail";
import {
  Plus, Copy, Trash2, Check, X,
  LayoutTemplate, Search, ArrowUpDown, ArrowRight,
  Clock, FileDown, Eye, PenLine, Palette, FilePlus2, Lightbulb, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Carousel from "@/components/Carousel";
import { downloadResumePdf } from "@/lib/pdfEngine";
import { toast } from "sonner";

/**
 * My Resumes dashboard.
 *
 * A brand-new user sees a welcome state — never fake saved resumes. Design
 * teasers use clearly-labelled sample content for the thumbnails only.
 */

const ONBOARDING_PREVIEWS = ["modern", "professional", "two-column", "elegant"] as const;

const QUICK_ACCESS = [
  { href: "/create", icon: FilePlus2, label: "Create Resume", desc: "Start a fresh resume" },
  { href: "/templates", icon: LayoutTemplate, label: "Templates", desc: "Browse all designs" },
];

const TIPS = [
  { title: "Tailor your summary", desc: "Say who you are, what you do best, and the impact you deliver — in two or three sentences." },
  { title: "Quantify your impact", desc: "Numbers make experience credible: “cut load time by 40%” beats “improved performance”." },
  { title: "Start bullets with results", desc: "Lead with a strong action verb and the outcome, not the task you performed." },
  { title: "Keep it to one page", desc: "Early in your career one page is ideal — for senior roles, lead with your most recent work." },
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
    if (renamingId && renameValue.trim()) renameResumeAction(renamingId, renameValue);
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

  const downloadResume = (id: string) => {
    const r = resumes.find((x) => x.id === id);
    if (!r) return;
    try {
      downloadResumePdf(r);
      toast.success("PDF exported", { description: "Check your downloads folder." });
    } catch {
      toast.error("Export failed", { description: "Something went wrong while generating the PDF. Please try again." });
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  /* ── Brand-new user: no fake resumes, just a clear way in ── */
  if (!hasResume) {
    return (
      <div className="bg-workspace">
        <div className="max-w-3xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-[12px] font-medium mb-5">
              <PenLine className="h-3.5 w-3.5" /> Welcome
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
                onClick={() => navigate("/templates")}
                className="h-12 px-6 rounded-xl text-[14px] gap-2 w-full sm:w-auto"
              >
                <LayoutTemplate className="h-4 w-4" /> Browse Templates
              </Button>
            </div>

            <p className="text-[12px] text-muted-foreground mt-4">
              Saved locally in this browser — nothing is uploaded.
            </p>
          </div>

          {/* What you get */}
          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            {[
              { icon: PenLine, title: "Guided setup", desc: "Five quick steps: details, summary, background, design, done." },
              { icon: Palette, title: "25 designs", desc: "Switch designs any time without losing content." },
              { icon: FileDown, title: "One-click PDF", desc: "Export a clean PDF whenever you're ready." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border/60 bg-card p-4">
                <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center mb-2.5">
                  <Icon className="h-4 w-4 text-accent" aria-hidden />
                </div>
                <h3 className="text-[13px] font-semibold mb-0.5">{title}</h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Compact tips slider */}
          <div className="mt-10">
            <Carousel
              variant="tips"
              autoplayMs={7000}
              ariaLabel="Resume tips"
              slideLabels={TIPS.map((t) => t.title)}
              slides={TIPS.map((tip, i) => (
                <div key={tip.title} className="flex items-start gap-3 px-4 py-3">
                  <span className="h-6 w-6 rounded-md bg-accent/10 text-accent text-[11px] font-bold flex items-center justify-center shrink-0 tabular-nums" aria-hidden>
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
                      <div className="text-[11.5px] text-muted-foreground truncate capitalize">{t.category}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[12px] text-muted-foreground mt-2">
              Design previews above use sample content. Your resume uses only what you enter.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Returning user: their real resumes ── */
  return (
    <div className="bg-workspace">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">{greeting}</p>
            <h1 className="text-[28px] font-bold tracking-tight text-foreground leading-tight">
              My Resumes
            </h1>
            <p className="text-[14px] text-muted-foreground mt-2 max-w-lg leading-relaxed">
              {resumes.length === 1 ? "1 resume saved in this browser." : `${resumes.length} resumes saved in this browser.`}
            </p>
            <div className="flex flex-wrap items-center gap-2.5 mt-5">
              <Button size="sm" onClick={() => navigate("/create")} className="btn-gradient h-10 gap-1.5 text-[13px] font-medium rounded-xl px-5">
                <Plus className="h-4 w-4" /> Create New Resume
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/templates")} className="h-10 gap-1.5 text-[13px] rounded-xl px-5">
                <LayoutTemplate className="h-4 w-4" /> Browse Templates
              </Button>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-foreground">
              Your Resumes
              <span className="text-muted-foreground font-normal ml-2 text-[13px]">{resumes.length}</span>
            </h2>
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" aria-hidden />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search resumes..."
                  className="h-8 pl-8 text-[12px] w-40 bg-background border-border/60"
                  aria-label="Search resumes by name"
                />
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-[12px] gap-1 text-muted-foreground hover:text-foreground" onClick={() => setSortBy(sortBy === "date" ? "name" : sortBy === "name" ? "template" : "date")} aria-label={`Sort by ${sortBy === "date" ? "name" : sortBy === "name" ? "template" : "date"}`}>
                <ArrowUpDown className="h-3 w-3" />{sortBy === "date" ? "Recent" : sortBy === "name" ? "Name" : "Template"}
              </Button>
            </div>
          </div>

          <Carousel
            variant="resume-cards"
            ariaLabel="Saved resumes"
            slideLabels={filteredResumes.map((r) => r.title)}
            slides={filteredResumes.map((r) => {
              const isActive = r.id === activeId;
              return (
                <div key={r.id} className={cn("group relative rounded-xl border bg-card card-hover flex flex-col", isActive ? "border-accent/40 ring-1 ring-accent/10 shadow-sm" : "border-border/60")}>
                  {/* Thumbnail — the user's real resume */}
                  <button
                    type="button"
                    onClick={() => editResume(r.id)}
                    aria-label={`Open ${r.title}`}
                    className="relative h-36 bg-white rounded-t-xl overflow-hidden border-b border-border/30"
                  >
                    <ResumeThumbnail data={r} />
                  </button>

                  <div className="p-4 flex-1 flex flex-col">
                    <div className="min-w-0 flex-1">
                      {renamingId === r.id ? (
                        <div className="flex items-center gap-1">
                          <Input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingId(null); }} className="h-7 text-[12px]" aria-label="Resume name" />
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={commitRename} aria-label="Save name"><Check className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setRenamingId(null)} aria-label="Cancel rename"><X className="h-3 w-3" /></Button>
                        </div>
                      ) : (
                        <div className="flex items-start gap-1">
                          <h3 className="text-[14px] font-semibold truncate leading-tight flex-1">{r.title}</h3>
                          <button
                            type="button"
                            onClick={() => { setRenamingId(r.id); setRenameValue(r.title); }}
                            className="text-[11.5px] text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shrink-0"
                          >
                            Rename
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 mt-1 text-[12px] text-muted-foreground">
                        <LayoutTemplate className="h-3 w-3" aria-hidden />
                        <span className="capitalize">{r.template.replace('-', ' ')}</span>
                        <span className="opacity-30">·</span>
                        <Clock className="h-3 w-3" aria-hidden />
                        <span>{r.updatedAt ? formatDistanceToNow(new Date(r.updatedAt), { addSuffix: true }) : "new"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 pt-3 mt-3 border-t border-border/50 flex-wrap">
                      <Button variant="ghost" size="sm" className="h-8 text-[12px] gap-1 text-muted-foreground hover:text-foreground transition-colors" onClick={() => editResume(r.id)}>
                        <PenLine className="h-3 w-3" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-[12px] gap-1 text-muted-foreground hover:text-foreground transition-colors" onClick={() => previewResume(r.id)} aria-label={`Preview ${r.title}`}>
                        <Eye className="h-3 w-3" /> Preview
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-[12px] gap-1 text-muted-foreground hover:text-foreground transition-colors" onClick={() => duplicateResumeAction(r.id)} aria-label={`Duplicate ${r.title}`}>
                        <Copy className="h-3 w-3" /> Duplicate
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-[12px] gap-1 text-muted-foreground hover:text-foreground transition-colors" onClick={() => downloadResume(r.id)} aria-label={`Download ${r.title} as PDF`}>
                        <FileDown className="h-3 w-3" /> PDF
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn("h-8 text-[12px] text-muted-foreground hover:text-foreground transition-colors ml-auto", confirmDeleteId === r.id && "text-destructive bg-destructive/5 hover:text-destructive")}
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
          />

          {filteredResumes.length === 0 && (
            <p className="text-[13px] text-muted-foreground text-center py-10">No resumes match “{searchQuery}”.</p>
          )}
        </div>

        <div>
          <h2 className="text-[15px] font-semibold text-foreground mb-4">Quick Access</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {QUICK_ACCESS.map((item) => (
              <Link key={item.href} to={item.href} className="group flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-card card-hover cursor-pointer">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-accent/10 text-accent">
                  <item.icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-foreground">{item.label}</div>
                  <div className="text-[12px] text-muted-foreground">{item.desc}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" aria-hidden />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-[15px] font-semibold text-foreground mb-4 flex items-center gap-1.5">
            <Lightbulb className="h-4 w-4 text-accent" aria-hidden /> Tips to get hired
          </h2>
          <Carousel
            variant="tips"
            autoplayMs={7000}
            ariaLabel="Resume writing tips"
            slideLabels={TIPS.map((t) => t.title)}
            slides={TIPS.map((tip, i) => (
              <div key={tip.title} className="flex items-start gap-3 px-4 py-3">
                <span className="h-6 w-6 rounded-md bg-accent/10 text-accent text-[11px] font-bold flex items-center justify-center shrink-0 tabular-nums" aria-hidden>
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
