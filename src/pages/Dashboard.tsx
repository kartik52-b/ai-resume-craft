import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useResume } from "@/context/ResumeContext";
import { analyzeResume } from "@/lib/ats";
import { getSampleResume } from "@/lib/sampleResume";
import { getTemplate } from "@/lib/templateRegistry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, FileText, Copy, Trash2, Check, X,
  LayoutTemplate, Upload, Search, ArrowUpDown, ArrowRight,
  Brain, Sparkles, Target, Clock, FileDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ImportDialog } from "@/components/ImportDialog";
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

const QUICK_ACCESS = [
  { href: "/job-match", icon: Target, label: "Job Match", desc: "Match against job posts", color: "text-blue-500" },
  { href: "/coach", icon: Brain, label: "AI Coach", desc: "Get AI improvement tips", color: "text-purple-500" },
  { href: "/templates", icon: LayoutTemplate, label: "Templates", desc: "Browse 25+ designs", color: "text-orange-500" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    resumes, activeId, createResumeAction, renameResumeAction,
    duplicateResumeAction, deleteResumeAction, switchResume,
  } = useResume();

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "template">("date");

  const sample = useMemo(() => getSampleResume(), []);

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

  const commitRename = () => {
    if (renamingId) renameResumeAction(renamingId, renameValue);
    setRenamingId(null);
  };

  const openResume = (id: string) => {
    switchResume(id);
    navigate("/editor");
  };

  const isEmpty = resumes.length === 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-full bg-workspace overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* ── Hero Section ── */}
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <p className="text-[13px] text-muted-foreground mb-1">{greeting}</p>
            <h1 className="text-[28px] font-bold tracking-tight text-foreground leading-tight">
              Build a resume that gets noticed.
            </h1>
            <p className="text-[14px] text-muted-foreground mt-2 max-w-lg leading-relaxed">
              Create a professional, ATS-friendly resume with AI assistance. Your resume is stored locally in your browser. AI features may send selected content to the configured AI provider.
            </p>
            <div className="flex items-center gap-2.5 mt-5">
              <Button size="sm" onClick={() => { createResumeAction(); navigate("/editor"); }} className="btn-gradient h-10 gap-1.5 text-[13px] font-medium rounded-xl px-5">
                <Plus className="h-4 w-4" /> Create New Resume
              </Button>
              <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className="h-10 gap-1.5 text-[13px] rounded-xl px-5">
                <Upload className="h-4 w-4" /> Import Resume
              </Button>
            </div>
          </div>
          {/* Decorative illustration */}
          <div className="hidden xl:flex items-center justify-center w-64 h-44 rounded-2xl bg-gradient-to-br from-accent/5 to-purple-500/5 border border-accent/10 shrink-0">
            <div className="text-center space-y-2">
              <FileText className="h-10 w-10 text-accent/30 mx-auto" />
              <p className="text-[11px] text-muted-foreground/50 font-medium">AI-Powered</p>
            </div>
          </div>
        </div>

        <ImportDialog open={importOpen} onOpenChange={setImportOpen} />

        {isEmpty ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-accent/[0.06] border border-accent/10 flex items-center justify-center mb-6">
              <FileText className="h-9 w-9 text-accent/30" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Create your first resume</h3>
            <p className="text-[14px] text-muted-foreground max-w-md mb-8 leading-relaxed">
              Build a professional, ATS-friendly resume in minutes. Your resume is stored locally in your browser.
            </p>
            <div className="flex items-center gap-3">
              <Button onClick={() => { createResumeAction(); navigate("/editor"); }} className="btn-gradient gap-1.5 rounded-xl px-5">
                <Plus className="h-4 w-4" /> Create Resume
              </Button>
              <Button variant="outline" onClick={() => setImportOpen(true)} className="gap-1.5 rounded-xl px-5">
                <Upload className="h-4 w-4" /> Import Existing
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Resumes Grid ── */}
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
                    <div key={r.id} className={cn("group relative rounded-xl border bg-card card-hover cursor-pointer", isActive ? "border-accent/40 ring-1 ring-accent/10 shadow-sm" : "border-border/60")}>
                      {/* Thumbnail area */}
                      <div className="h-28 bg-white rounded-t-xl overflow-hidden border-b border-border/30 relative">
                        <div className="w-full h-full overflow-hidden pointer-events-none select-none">
                          <div style={{ width: '286%', height: '286%', position: 'absolute', top: 0, left: 0, transform: 'scale(0.35)', transformOrigin: 'top left' }}>
                            {(() => { const t = getTemplate(r.template); return <t.Component data={{ ...sample, template: r.template }} />; })()}
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="min-w-0 flex-1">
                            {renamingId === r.id ? (
                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <Input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingId(null); }} className="h-7 text-[12px]" />
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={commitRename}><Check className="h-3 w-3" /></Button>
                              </div>
                            ) : (
                              <h3 className="text-[14px] font-semibold truncate leading-tight">{r.title}</h3>
                            )}
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
                              <LayoutTemplate className="h-3 w-3" />
                              <span className="capitalize">{r.template}</span>
                              <span className="opacity-30">·</span>
                              <Clock className="h-3 w-3" />
                              <span>{r.updatedAt ? formatDistanceToNow(new Date(r.updatedAt), { addSuffix: true }) : "new"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mb-3"><AtsHealthBadge score={ats.score} /></div>
                        <div className="flex items-center gap-0.5 pt-2.5 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 flex-1 justify-center text-muted-foreground hover:text-foreground transition-colors" onClick={() => openResume(r.id)}>
                            <ArrowRight className="h-3 w-3" /> Open
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground transition-colors" onClick={() => duplicateResumeAction(r.id)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-[11px] text-muted-foreground hover:text-foreground transition-colors" onClick={() => { try { downloadResumePdf(r); toast.success("PDF exported"); } catch { toast.error("Export failed"); } }}>
                            <FileDown className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className={cn("h-7 w-7 text-muted-foreground hover:text-foreground transition-colors", confirmDeleteId === r.id && "text-destructive bg-destructive/5")} onClick={() => { if (confirmDeleteId === r.id) { deleteResumeAction(r.id); setConfirmDeleteId(null); } else { setConfirmDeleteId(r.id); setTimeout(() => setConfirmDeleteId((c) => c === r.id ? null : c), 3000); } }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Quick Access ── */}
            <div>
              <h2 className="text-[15px] font-semibold text-foreground mb-4">Quick Access</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

            {/* ── AI CTA ── */}
            <div className="rounded-xl border border-accent/20 bg-gradient-to-r from-accent/[0.03] to-purple-500/[0.03] p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[15px] font-semibold">Let AI improve your resume</h3>
                  <p className="text-[13px] text-muted-foreground mt-0.5">Get intelligent suggestions to make your experience more impactful and ATS-friendly.</p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0 rounded-xl" onClick={() => navigate("/coach")}>
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Try AI Coach
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
