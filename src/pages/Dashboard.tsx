import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useResume } from "@/context/ResumeContext";
import { getSampleResume } from "@/lib/sampleResume";
import type { ResumeData } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ResumeThumbnail from "@/components/ResumeThumbnail";
import {
  Plus, FileText, Copy, Trash2, Check, X, Search, ArrowUpDown, ArrowRight,
  Eye, PenLine, Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ImportDialog } from "@/components/ImportDialog";
import ScrollRail from "@/components/ScrollRail";
import Reveal from "@/components/Reveal";
import TipStrip from "@/components/TipStrip";
import TemplateTile from "@/components/TemplateTile";
import { downloadResumePdf } from "@/lib/pdfEngine";
import { toast } from "sonner";

const ONBOARDING_PREVIEWS = ["modern", "professional", "developer", "two-column"] as const;

const WHAT_YOU_GET = [
  { title: "Guided setup", desc: "Personal details, a short summary, then your background — three calm steps." },
  { title: "25 designs", desc: "Switch design whenever you like; your content never changes." },
  { title: "Clean PDF export", desc: "A selectable-text A4 document that matches the preview." },
];

const QUICK_ACCESS = [
  { href: "/create", label: "Create resume", desc: "Start a new resume from your details" },
  { href: "/templates", label: "Browse designs", desc: "Compare all 25 layouts side by side" },
  { href: "/settings", label: "Settings", desc: "Data, appearance and writing assistance" },
];

const TIPS = [
  { title: "Tailor your summary", text: "Mirror the language of the job posting — the recruiter is looking for the same words." },
  { title: "Quantify your impact", text: "Numbers make experience credible: “cut load time by 40%” beats “improved performance”." },
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
      <div className="min-h-full bg-background overflow-x-hidden">
        <div className="mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16">
          <ImportDialog open={importOpen} onOpenChange={setImportOpen} />

          <Reveal>
            <p className="eyebrow mb-4">Welcome</p>
            <h1 className="font-display text-[28px] font-semibold leading-tight text-foreground lg:text-[34px]">
              Welcome to AI Resume Craft
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Create your first professional resume. Start with your contact
              details — everything else can be filled in afterwards.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" onClick={() => navigate("/create")} className="h-11 gap-2 rounded-md px-6 text-[14px]">
                <Plus className="h-4 w-4" /> Create New Resume
              </Button>
              <Button variant="outline" size="lg" onClick={() => setImportOpen(true)} className="h-11 gap-2 rounded-md px-6 text-[14px]">
                <Upload className="h-4 w-4" /> Import Existing
              </Button>
            </div>
            <p className="mt-4 text-[12px] text-muted-foreground">
              Saved in this browser — nothing is uploaded.
            </p>
          </Reveal>

          {/* What you get — a plain list, not a row of identical cards. */}
          <Reveal className="mt-14">
            <h2 className="text-[13px] font-semibold text-foreground">What you get</h2>
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {WHAT_YOU_GET.map((item) => (
                <li key={item.title} className="grid gap-1 py-3.5 sm:grid-cols-[200px_1fr] sm:gap-6">
                  <span className="text-[13.5px] font-medium text-foreground">{item.title}</span>
                  <span className="text-[13px] leading-relaxed text-muted-foreground">{item.desc}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Design teasers — clearly labelled as design previews */}
          <Reveal className="mt-12">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-[13px] font-semibold text-foreground">A few designs to start from</h2>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Previews use sample content. Your resume uses only what you enter.
                </p>
              </div>
              <Link
                to="/templates"
                className="inline-flex shrink-0 items-center gap-1 text-[12.5px] text-foreground underline decoration-border underline-offset-4 hover:decoration-bronze"
              >
                Browse all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {ONBOARDING_PREVIEWS.map((id) => (
                <TemplateTile key={id} id={id} data={sampleResume} to={`/create?template=${id}`} className="h-full" />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    );
  }

  /* ── One card, rendered into either a grid or a rail ── */
  const renderResumeCard = (r: ResumeData) => {
    const isActive = r.id === activeId;
    const design = r.template.replace('-', ' ');
    return (
      <div
        key={r.id}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-[border-color,box-shadow] duration-150",
          isActive ? "border-bronze shadow-card" : "border-border hover:border-border-strong hover:shadow-card",
        )}
      >
        {/* Thumbnail — the user's real resume */}
        <button
          type="button"
          onClick={() => editResume(r.id)}
          aria-label={`Open ${r.title}`}
          className="relative h-40 w-full overflow-hidden border-b border-border bg-paper"
        >
          <ResumeThumbnail data={r} />
        </button>

        <div className="flex flex-1 flex-col p-4">
          <div className="min-w-0 flex-1">
            {renamingId === r.id ? (
              <div className="flex items-center gap-1">
                <Input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingId(null); }}
                  className="h-7 text-[12px]"
                />
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={commitRename} aria-label="Save name"><Check className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setRenamingId(null)} aria-label="Cancel rename"><X className="h-3 w-3" /></Button>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <h3 className="flex-1 truncate text-[14px] font-medium leading-tight text-foreground">{r.title}</h3>
                <button
                  onClick={() => { setRenamingId(r.id); setRenameValue(r.title); }}
                  className="hover-reveal shrink-0 text-[10.5px] text-muted-foreground transition-colors hover:text-foreground focus-visible:opacity-100"
                >
                  Rename
                </button>
              </div>
            )}
            <div className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
              <span className="capitalize">{design}</span>
              <span className="opacity-40">·</span>
              <span>{r.updatedAt ? formatDistanceToNow(new Date(r.updatedAt), { addSuffix: true }) : "new"}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-0.5 border-t border-border pt-2.5">
            <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground" onClick={() => editResume(r.id)}>
              <PenLine className="h-3 w-3" /> Edit
            </Button>
            <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground" onClick={() => previewResume(r.id)}>
              <Eye className="h-3 w-3" /> Preview
            </Button>
            <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground" onClick={() => duplicateResumeAction(r.id)}>
              <Copy className="h-3 w-3" /> Duplicate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
              onClick={() => { try { downloadResumePdf(r); toast.success("PDF exported"); } catch { toast.error("Export failed"); } }}
              aria-label={`Export ${r.title} as PDF`}
            >
              <FileText className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("ml-auto h-7 w-7 text-muted-foreground hover:text-foreground", confirmDeleteId === r.id && "bg-destructive/5 text-destructive")}
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
    <div className="min-h-full bg-background overflow-x-hidden">
      <div className="mx-auto max-w-6xl space-y-10 px-5 py-8 lg:px-8 lg:py-10">
        <Reveal>
          <p className="eyebrow mb-3">{greeting}</p>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
            <div>
              <h1 className="font-display text-[28px] font-semibold leading-tight text-foreground lg:text-[32px]">
                My Resumes
              </h1>
              <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-muted-foreground">
                Manage your created resumes, edit, duplicate, or export anytime.
              </p>
              <p className="mt-1.5 text-[12.5px] text-muted-foreground/85">
                {resumes.length === 1 ? "1 resume" : `${resumes.length} resumes`} saved in this
                browser — nothing leaves your device.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Button onClick={() => navigate("/create")} className="h-10 gap-1.5 rounded-md px-5 text-[13px]">
                <Plus className="h-4 w-4" /> Create New Resume
              </Button>
              <Button variant="outline" onClick={() => setImportOpen(true)} className="h-10 gap-1.5 rounded-md px-5 text-[13px]">
                <Upload className="h-4 w-4" /> Import
              </Button>
            </div>
          </div>
        </Reveal>

        <ImportDialog open={importOpen} onOpenChange={setImportOpen} />

        <Reveal>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
            <div className="min-w-0">
              <h2 className="text-[13px] font-semibold text-foreground">
                Your Resumes <span className="ml-1.5 font-normal tabular-nums text-muted-foreground">{resumes.length}</span>
              </h2>
              {railLayout && (
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                  Browse with the arrows, drag the row, or use ← → while it is focused.
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search resumes"
                  className="h-9 w-44 pl-8 text-[12.5px]"
                  aria-label="Search your resumes"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-[12.5px]"
                onClick={() => setSortBy(sortBy === "date" ? "name" : sortBy === "name" ? "template" : "date")}
              >
                <ArrowUpDown className="h-3 w-3" />
                {sortBy === "date" ? "Recent" : sortBy === "name" ? "Name" : "Design"}
              </Button>
            </div>
          </div>

          {railLayout ? (
            <ScrollRail
              ariaLabel="Your resumes"
              itemClassName="w-[272px] sm:w-[300px]"
              items={filteredResumes.map(renderResumeCard)}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredResumes.map(renderResumeCard)}
            </div>
          )}

          {filteredResumes.length === 0 && (
            <p className="py-12 text-center text-[13px] text-muted-foreground">
              No resumes match “{searchQuery}”.
            </p>
          )}
        </Reveal>

        <Reveal>
          <h2 className="mb-3 text-[13px] font-semibold text-foreground">Quick access</h2>
          <ul className="divide-y divide-border border-y border-border">
            {QUICK_ACCESS.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className="group flex items-center justify-between gap-6 py-3.5 transition-colors"
                >
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-medium text-foreground">{item.label}</span>
                    <span className="block text-[12.5px] text-muted-foreground">{item.desc}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal>
          <h2 className="mb-3 text-[13px] font-semibold text-foreground">Tips to get hired</h2>
          <TipStrip tips={TIPS} ariaLabel="Resume writing tips" />
        </Reveal>
      </div>
    </div>
  );
};

export default Dashboard;
